// ============================================================
//  TELEGRAM BOT HELPER
//  Kirim notifikasi & proses command dari owner
// ============================================================
import { config } from "./config";
import settings from "@/settings";

const BASE = `https://api.telegram.org/bot${settings.telegram.botToken}`;

// ── SEND MESSAGE ─────────────────────────────────────────
export async function sendMessage(
  chatId: string | number,
  text: string,
  extra: Record<string, any> = {}
) {
  if (!settings.telegram.botToken) return;
  try {
    const res = await fetch(`${BASE}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        ...extra,
      }),
    });
    if (!res.ok) console.warn("[TG]", res.status, await res.text());
  } catch (e) {
    console.warn("[TG] sendMessage failed", e);
  }
}

// ── NOTIFY OWNER ─────────────────────────────────────────
export async function notifyOwner(text: string, extra: Record<string, any> = {}) {
  if (!settings.telegram.ownerChatId) return;
  await sendMessage(settings.telegram.ownerChatId, text, extra);
}

// ── ESCAPE HTML ──────────────────────────────────────────
export function esc(s: string) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ── NOTIFICATION TEMPLATES ───────────────────────────────
export function msgNewRequest(r: {
  authorName: string;
  codeName: string;
  description: string;
}) {
  return [
    `📋 <b>Request Code Baru</b>`,
    ``,
    `👤 <b>Dari:</b> ${esc(r.authorName)}`,
    `💡 <b>Code:</b> ${esc(r.codeName)}`,
    `📝 <b>Deskripsi:</b>`,
    `<pre>${esc(r.description)}</pre>`,
    ``,
    `<i>Cek dashboard → ${config.siteUrl}/dashboard</i>`,
  ].join("\n");
}

export function msgNewCode(c: {
  title: string;
  authorName: string;
  language: string;
  category: string;
  slug: string;
}) {
  return [
    `🚀 <b>Code Baru Dipublish</b>`,
    ``,
    `📦 <b>Judul:</b> ${esc(c.title)}`,
    `👤 <b>Oleh:</b> ${esc(c.authorName)}`,
    `🔤 <b>Bahasa:</b> ${esc(c.language)}`,
    `📁 <b>Kategori:</b> ${esc(c.category)}`,
    `🔗 <b>Link:</b> ${config.siteUrl}/code/${esc(c.slug)}`,
  ].join("\n");
}

export function msgStats(s: {
  totalCodes: number;
  totalViews: number;
  totalRequests: number;
}) {
  return [
    `📊 <b>Stats — ${esc(config.websiteName)}</b>`,
    ``,
    `📦 Codes    : <b>${s.totalCodes}</b>`,
    `👁 Views    : <b>${s.totalViews}</b>`,
    `📋 Requests : <b>${s.totalRequests}</b>`,
    ``,
    `🌐 ${config.siteUrl}`,
  ].join("\n");
}
