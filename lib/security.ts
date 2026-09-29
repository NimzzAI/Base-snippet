// ============================================================
//  SECURITY HELPERS
//  Rate limiting, sanitize, validation
// ============================================================
import { config } from "./config";

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
