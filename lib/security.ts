// ============================================================
//  SECURITY HELPERS
//  Rate limiting, sanitize, validation
// ============================================================
import { config, DEFAULT_AVATAR } from "./config";

// ── SANITIZE TEXT ──────────────────────────────────────────
export function sanitizeText(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim();
}

// ── VALIDATE USERNAME ─────────────────────────────────────
export function validateUsername(username: string): { ok: boolean; error?: string } {
  if (!username || !username.match(/^[a-zA-Z0-9_]{3,20}$/)) {
    return { ok: false, error: "Username: 3-20 karakter, huruf/angka/underscore" };
  }
  return { ok: true };
}

// ── VALIDATE FILE SIZE ────────────────────────────────────
export function validateFileSize(file: File, maxMB: number): { ok: boolean; error?: string } {
  const maxBytes = maxMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return { ok: false, error: `Ukuran file max ${maxMB}MB` };
  }
  return { ok: true };
}

// ── VALIDATE CODE SIZE ────────────────────────────────────
export function validateCodeSize(code: string): { ok: boolean; error?: string } {
  const kb = new Blob([code]).size / 1024;
  const maxKb = config.security.maxCodeSizeKB;
  if (kb > maxKb) {
    return { ok: false, error: `Ukuran code max ${maxKb}KB` };
  }
  return { ok: true };
}

// ── SIMPLE BOT DETECTION ──────────────────────────────────
const _formTimestamps: Record<string, number> = {};

export function markFormStart(formId: string) {
  _formTimestamps[formId] = Date.now();
}

export function isLikelyBot(formId: string, minMs = 1500): boolean {
  const start = _formTimestamps[formId];
  if (!start) return false;
  return Date.now() - start < minMs;
}

// ── HONEYPOT FIELD CHECK ──────────────────────────────────
export function isHoneypotFilled(value: string): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

// Bersihkan input profil admin, hanya field yang dikenal
function cleanText(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.replace(/[<>\u0000-\u001f]/g, "").trim().slice(0, max);
}

// Hanya alamat http, https, atau file lokal, dan bukan svg
function cleanImageUrl(v: unknown, fallback: string): string {
  if (typeof v !== "string") return fallback;
  const s = v.trim();
  if (!s || s.length > 500 || /\.svg(\?|#|$)/i.test(s)) return fallback;
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:" ? s : fallback;
  } catch {
    return fallback;
  }
}

export function cleanProfileUpdates(input: any): Record<string, any> {
  const src = input && typeof input === "object" ? input : {};
  const out: Record<string, any> = {};

  if ("displayName" in src) out.displayName = cleanText(src.displayName, 60) || config.admin.displayName;
  if ("username" in src) out.username = cleanText(src.username, 30).replace(/[^a-zA-Z0-9_.-]/g, "") || config.admin.username;
  if ("bio" in src) out.bio = cleanText(src.bio, 300);
  if ("photoURL" in src) out.photoURL = cleanImageUrl(src.photoURL, DEFAULT_AVATAR);
  if ("banner" in src) out.banner = cleanImageUrl(src.banner, "");

  if (src.socials && typeof src.socials === "object") {
    const socials: Record<string, string> = {};
    for (const k of ["whatsapp", "github", "telegram", "tiktok"]) {
      if (k in src.socials) socials[k] = cleanText(src.socials[k], 200);
    }
    out.socials = socials;
  }
  return out;
}
