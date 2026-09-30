// ============================================================
//  TELEGRAM WEBHOOK HANDLER
//  POST /api/telegram
//  Set webhook: https://api.telegram.org/bot<TOKEN>/setWebhook?url=<SITE>/api/telegram&secret_token=<SECRET>
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import {
  getCodes,
  deleteCode,
  getCodeBySlug,
  getRequests,
  updateRequestStatus,
  getCategories,
  addCategory,
  deleteCategory,
} from "@/lib/json-db";
import { sendMessage, esc, msgStats } from "@/lib/telegram";
import settings from "@/settings";

// ── SECURITY: verify secret header ──────────────────────
function isAuthorized(req: NextRequest) {
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  return secret === settings.telegram.webhookSecret;
}

function isOwner(chatId: number | string) {
  return String(chatId) === String(settings.telegram.ownerChatId);
}

// ── KEYBOARDS ────────────────────────────────────────────
const MAIN_KB = {
  keyboard: [
    ["📊 Stats", "📦 Codes"],
    ["📋 Requests", "📁 Kategori"],
    ["🔔 Notifikasi", "❓ Help"],
  ],
  resize_keyboard: true,
};

const BACK_KB = {
  keyboard: [["◀️ Kembali"]],
  resize_keyboard: true,
};

// ── COMMAND HANDLERS ─────────────────────────────────────
async function handleCommand(chatId: number, text: string) {
  const cmd = text.trim().toLowerCase();

  // ── /start ──
  if (cmd === "/start" || cmd === "start") {
    await sendMessage(chatId,
      `👋 <b>Nimzz Code Bot</b>\n\nHalo, Owner! Pilih menu di bawah untuk manage platform.`,
      { reply_markup: MAIN_KB }
    );
    return;
  }

  // ── 📊 Stats ──
  if (cmd === "📊 stats" || cmd === "/stats") {
    const [codes, requests] = await Promise.all([
      getCodes(),
      getRequests(),
    ]);
    const totalViews = codes.reduce((acc, c) => acc + (c.views || 0), 0);
    await sendMessage(chatId, msgStats({
      totalCodes: codes.length,
      totalViews,
      totalRequests: requests.length,
    }), { reply_markup: MAIN_KB });
    return;
  }

  // ── 📦 Codes ──
  if (cmd === "📦 codes" || cmd === "/codes") {
    const codes = await getCodes();
    if (codes.length === 0) {
      await sendMessage(chatId, "Belum ada code.", { reply_markup: MAIN_KB });
      return;
    }
    const lines = codes.slice(0, 10).map((c, i) => {
      return `${i + 1}. <b>${esc(c.title)}</b>\n   👤 ${esc(c.authorName)} · 👁 ${c.views || 0}`;
    });
    await sendMessage(chatId,
      `📦 <b>10 Code Terbaru</b>\n\n${lines.join("\n\n")}\n\n<i>Ketik /deletecode [slug] untuk hapus</i>`,
      { reply_markup: BACK_KB }
    );
    return;
  }

  // ── 📋 Requests ──
  if (cmd === "📋 requests" || cmd === "/requests") {
    const requests = await getRequests();
    if (requests.length === 0) {
      await sendMessage(chatId, "Belum ada request.", { reply_markup: MAIN_KB });
      return;
    }
    const statusEmoji: Record<string, string> = {
      new: "🆕", "in-progress": "🔄", done: "✅", rejected: "❌"
    };
    const lines = requests.slice(0, 10).map((r, i) => {
      return `${i + 1}. ${statusEmoji[r.status] || "❓"} <b>${esc(r.codeName)}</b>\n   👤 ${esc(r.authorName)}\n   📝 ${esc((r.description || "").slice(0, 60))}...\n   <code>ID: ${r.id}</code>`;
    });
    await sendMessage(chatId,
      `📋 <b>10 Request Terbaru</b>\n\n${lines.join("\n\n")}\n\n<i>Ketik /setstatus [id] [new/in-progress/done/rejected]</i>`,
      { reply_markup: BACK_KB }
    );
    return;
  }

  // ── 📁 Kategori ──
  if (cmd === "📁 kategori" || cmd === "/kategori") {
    const cats = await getCategories();
    await sendMessage(chatId,
      `📁 <b>Kategori Saat Ini (${cats.length})</b>\n\n${cats.map((c, i) => `${i + 1}. ${c}`).join("\n")}\n\n` +
      `<i>Ketik /addkategori [nama] untuk tambah\nKetik /delkategori [nama] untuk hapus</i>`,
      { reply_markup: BACK_KB }
    );
    return;
  }

  // ── 🔔 Notifikasi ──
  if (cmd === "🔔 notifikasi" || cmd === "/notifikasi") {
    await sendMessage(chatId,
      `🔔 <b>Notifikasi Aktif</b>\n\n` +
      `✅ Request code baru\n✅ Code baru dipublish\n\n` +
      `<i>Semua notifikasi dikirim otomatis ke sini.</i>`,
      { reply_markup: MAIN_KB }
    );
    return;
  }

  // ── ◀️ Kembali ──
  if (cmd === "◀️ kembali") {
    await sendMessage(chatId, "Menu utama:", { reply_markup: MAIN_KB });
    return;
  }

  // ── ❓ Help ──
  if (cmd === "❓ help" || cmd === "/help") {
    await sendMessage(chatId,
      `❓ <b>Daftar Command</b>\n\n` +
      `<b>Code Management:</b>\n` +
      `/deletecode [slug] — hapus code\n` +
      `/codeinfo [slug] — info detail code\n\n` +
      `<b>Request Management:</b>\n` +
      `/setstatus [id] [status] — ubah status request\n` +
      `   status: new / in-progress / done / rejected\n\n` +
      `<b>Kategori:</b>\n` +
      `/addkategori [nama] — tambah kategori\n` +
      `/delkategori [nama] — hapus kategori\n\n` +
      `<b>Platform:</b>\n` +
      `/stats — statistik lengkap`,
      { reply_markup: MAIN_KB }
    );
    return;
  }

  // ── /deletecode [slug] ──
  if (cmd.startsWith("/deletecode ")) {
    const slug = text.slice(12).trim();
    const ok = await deleteCode(slug);
    if (!ok) {
      await sendMessage(chatId, `❌ Code dengan slug <code>${esc(slug)}</code> tidak ditemukan.`);
      return;
    }
    await sendMessage(chatId,
      `🗑 Code <code>${esc(slug)}</code> telah <b>dihapus</b>.`,
      { reply_markup: MAIN_KB }
    );
    return;
  }

  // ── /codeinfo [slug] ──
  if (cmd.startsWith("/codeinfo ")) {
    const slug = text.slice(10).trim();
    const c = await getCodeBySlug(slug);
    if (!c) {
      await sendMessage(chatId, `❌ Code tidak ditemukan.`);
      return;
    }
    await sendMessage(chatId,
      `📦 <b>Info Code</b>\n\n` +
      `📝 Judul: ${esc(c.title)}\n` +
      `👤 Author: ${esc(c.authorName)} @${esc(c.authorUsername)}\n` +
      `🔤 Bahasa: ${esc(c.language)}\n` +
      `📁 Kategori: ${esc(c.category)}\n` +
      `👁 Views: ${c.views || 0}\n` +
      `📅 Upload: ${new Date(c.createdAt).toLocaleDateString("id-ID")}\n` +
      `🔗 Link: ${settings.site.url}/code/${esc(c.slug)}`,
      { reply_markup: BACK_KB }
    );
    return;
  }

  // ── /setstatus [id] [status] ──
  if (cmd.startsWith("/setstatus ")) {
    const parts = text.slice(11).trim().split(" ");
    const id = parts[0];
    const status = parts[1] as any;
    const validStatus = ["new", "in-progress", "done", "rejected"];
    if (!id || !status || !validStatus.includes(status)) {
      await sendMessage(chatId, `❌ Format: /setstatus [id] [new/in-progress/done/rejected]`);
      return;
    }
    const ok = await updateRequestStatus(id, status);
    if (ok) {
      await sendMessage(chatId, `✅ Status request <code>${esc(id)}</code> diubah ke <b>${esc(status)}</b>.`, { reply_markup: MAIN_KB });
    } else {
      await sendMessage(chatId, `❌ Request ID <code>${esc(id)}</code> tidak ditemukan.`);
    }
    return;
  }

  // ── /addkategori [nama] ──
  if (cmd.startsWith("/addkategori ")) {
    const nama = text.slice(13).trim();
    if (!nama) { await sendMessage(chatId, "❌ Nama kategori tidak boleh kosong."); return; }
    const updated = await addCategory(nama);
    await sendMessage(chatId, `✅ Kategori <b>${esc(nama)}</b> ditambahkan. Total: ${updated.length}`, { reply_markup: MAIN_KB });
    return;
  }

  // ── /delkategori [nama] ──
  if (cmd.startsWith("/delkategori ")) {
    const nama = text.slice(13).trim();
    const updated = await deleteCategory(nama);
    await sendMessage(chatId, `🗑 Kategori <b>${esc(nama)}</b> dihapus. Sisa: ${updated.length}`, { reply_markup: MAIN_KB });
    return;
  }

  // ── Unknown ──
  await sendMessage(chatId,
    `❓ Command tidak dikenali.\n\nKetik ❓ Help untuk melihat daftar command.`,
    { reply_markup: MAIN_KB }
  );
}

// ── WEBHOOK HANDLER ──────────────────────────────────────
export async function POST(req: NextRequest) {
  // Security check
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = body?.message || body?.callback_query?.message;
  if (!message) return NextResponse.json({ ok: true });

  const chatId = message.chat?.id;
  const text = message.text || "";

  if (!chatId) return NextResponse.json({ ok: true });

  // Only allow owner
  if (!isOwner(chatId)) {
    await sendMessage(chatId, "⛔ Akses ditolak. Bot ini hanya untuk owner.");
    return NextResponse.json({ ok: true });
  }

  // Handle command async
  try {
    await handleCommand(chatId, text);
  } catch (e) {
    await sendMessage(chatId, `⚠️ Error: ${e instanceof Error ? esc(e.message) : "Unknown error"}`);
  }

  return NextResponse.json({ ok: true });
}

// ── GET: health check ────────────────────────────────────
export async function GET() {
  return NextResponse.json({
    status: "ok",
    bot: settings.telegram.botToken ? "configured" : "not configured",
    tip: `Set webhook: https://api.telegram.org/bot${settings.telegram.botToken}/setWebhook?url=${settings.site.url}/api/telegram&secret_token=${settings.telegram.webhookSecret}`,
  });
}

export const dynamic = "force-dynamic";
