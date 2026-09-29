import bcrypt from "bcryptjs";
import crypto from "crypto";
import { config } from "./config";

// ── SESSION SECRET & HASH CACHE ──────────────────────────────
const SECRET = process.env.ADMIN_SECRET || "nimzz-code-secure-secret-token-key-2026";
const DUMMY_HASH = bcrypt.hashSync("dummy_password_for_timing_protection", 10);

// Pre-compute or load admin password hash
let _adminHash: string = "";
function getAdminPasswordHash(): string {
  if (_adminHash) return _adminHash;
  if (process.env.ADMIN_PASSWORD_HASH) {
    _adminHash = process.env.ADMIN_PASSWORD_HASH;
  } else if (process.env.ADMIN_PASSWORD) {
    _adminHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
  } else {
    _adminHash = bcrypt.hashSync(config.admin.defaultPasswordFallback, 10);
  }
  return _adminHash;
}

// ── RATE LIMITING / BRUTE FORCE PROTECTION ───────────────────
// Key: `${ip}:${deviceId}`
type AttemptEntry = {
  count: number;
  blockedUntil?: number;
  firstAttempt: number;
};

const _attempts = new Map<string, AttemptEntry>();

export function getRateLimitKey(ip: string, deviceId?: string): string {
  const cleanIp = (ip || "127.0.0.1").trim().toLowerCase();
  const cleanDevice = (deviceId || "anonymous").trim().slice(0, 64);
  return `${cleanIp}:${cleanDevice}`;
}

export function checkLoginRateLimit(key: string): {
  allowed: boolean;
  remainingAttempts: number;
  blockedRemainingSeconds?: number;
  message?: string;
} {
  const now = Date.now();
  const entry = _attempts.get(key);

  if (!entry) {
    return { allowed: true, remainingAttempts: config.security.maxLoginAttempts };
  }

  // Check if currently blocked
  if (entry.blockedUntil && entry.blockedUntil > now) {
    const remainingSeconds = Math.ceil((entry.blockedUntil - now) / 1000);
    const remainingMinutes = Math.ceil(remainingSeconds / 60);
    return {
      allowed: false,
      remainingAttempts: 0,
      blockedRemainingSeconds: remainingSeconds,
      message: `Terlalu banyak percobaan gagal. Akun diblokir sementara selama ${remainingMinutes} menit.`,
    };
  }

  // If block expired or 15 mins window passed, reset
  const windowMs = config.security.lockoutDurationMinutes * 60 * 1000;
  if (now - entry.firstAttempt > windowMs) {
    _attempts.delete(key);
    return { allowed: true, remainingAttempts: config.security.maxLoginAttempts };
  }

  const remaining = Math.max(0, config.security.maxLoginAttempts - entry.count);
  return { allowed: true, remainingAttempts: remaining };
}

export function recordFailedLogin(key: string): {
  isBlocked: boolean;
  remainingAttempts: number;
  blockedMinutes?: number;
} {
  const now = Date.now();
  const windowMs = config.security.lockoutDurationMinutes * 60 * 1000;
  let entry = _attempts.get(key);

  if (!entry || now - entry.firstAttempt > windowMs) {
    entry = { count: 1, firstAttempt: now };
  } else {
    entry.count += 1;
  }

  if (entry.count >= config.security.maxLoginAttempts) {
    entry.blockedUntil = now + windowMs;
    _attempts.set(key, entry);
    return {
      isBlocked: true,
      remainingAttempts: 0,
      blockedMinutes: config.security.lockoutDurationMinutes,
    };
  }

  _attempts.set(key, entry);
  return {
    isBlocked: false,
    remainingAttempts: config.security.maxLoginAttempts - entry.count,
  };
}

export function clearLoginAttempts(key: string) {
  _attempts.delete(key);
}

// ── PASSWORD VERIFICATION ────────────────────────────────────
export function verifyAdminCredentials(usernameInput: string, passwordInput: string): boolean {
  const targetUsername = config.admin.username.trim().toLowerCase();
  const enteredUsername = (usernameInput || "").trim().toLowerCase();
  const isUsernameMatch = enteredUsername === targetUsername;

  const targetHash = getAdminPasswordHash();

  if (isUsernameMatch) {
    return bcrypt.compareSync(passwordInput || "", targetHash);
  } else {
    // Run constant-time dummy comparison to prevent username enumeration timing leak
    bcrypt.compareSync(passwordInput || "", DUMMY_HASH);
    return false;
  }
}

// ── SESSION SIGNING & VERIFICATION ───────────────────────────
export type AdminSession = {
  username: string;
  role: "admin";
  iat: number;
  exp: number;
};

export function createSessionToken(username: string): string {
  const durationMs = config.security.sessionDurationHours * 3600 * 1000;
  const payload: AdminSession = {
    username,
    role: "admin",
    iat: Date.now(),
    exp: Date.now() + durationMs,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET).update(payloadB64).digest("base64url");
  return `${payloadB64}.${signature}`;
}

export function verifySessionToken(token: string): AdminSession | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  const expectedSignature = crypto.createHmac("sha256", SECRET).update(payloadB64).digest("base64url");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  try {
    const payload: AdminSession = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function isRequestAdmin(req: { cookies: { get(name: string): { value?: string } | undefined } }): boolean {
  const token = req.cookies.get("admin_session")?.value;
  if (!token) return false;
  return Boolean(verifySessionToken(token));
}
