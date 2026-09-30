import { Code } from "./types";

export const SAMPLE_CODES: Code[] = [
  {
    id: "sample-wa-bot",
    slug: "whatsapp-bot-auto-reply-menu",
    title: "WhatsApp Bot Multi-Device Auto Reply & Interactive Menu",
    description: "Script WhatsApp Bot menggunakan Baileys @whiskeysockets dengan fitur interactive list, auto-reply, dan command handler modular.",
    category: "Tools",
    language: "javascript",
    tags: ["bot", "whatsapp", "baileys", "nodejs"],
    thumbnail: "https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=600&q=80",
    authorId: "admin-nimzz",
    authorName: "Nimzz Admin",
    authorUsername: "nimzz",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    views: 1420,
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    code: `// WhatsApp Bot Auto-Reply & Menu Handler with Baileys
import { default as makeWASocket, useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    const from = msg.key.remoteJid;

    if (body.toLowerCase() === "!menu") {
      const menuText = \`⚡ *NIMZZ BOT MENU* ⚡\\n\\n1. !ai <pertanyaan>\\n2. !tiktok <url>\\n3. !quote\\n4. !ping\\n\\nEnjoy coding!\`;
      await sock.sendMessage(from, { text: menuText }, { quoted: msg });
    } else if (body.toLowerCase() === "!ping") {
      await sock.sendMessage(from, { text: "🏓 Pong! Bot aktif 100%." }, { quoted: msg });
    }
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startBot();
    } else if (connection === "open") {
      console.log("✅ Bot connected successfully!");
    }
  });
}

startBot();`,
  },
  {
    id: "sample-gemini-ai",
    slug: "ai-gemini-stream-response-nextjs",
    title: "Google Gemini 3.5 Flash Streaming Chat API Route",
    description: "Contoh implementasi route streaming Next.js App Router memakai modern @google/genai SDK dengan Server Sent Events.",
    category: "AI",
    language: "typescript",
    tags: ["ai", "gemini", "nextjs", "streaming"],
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
    authorId: "admin-nimzz",
    authorName: "Nimzz Admin",
    authorUsername: "nimzz",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    views: 980,
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    code: `import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const responseStream = await ai.models.generateContentStream({
    model: "gemini-3.5-flash",
    contents: prompt,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of responseStream) {
        const text = chunk.text();
        if (text) {
          controller.enqueue(encoder.encode(\`data: \${JSON.stringify({ text })}\\n\\n\`));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}`,
  },
  {
    id: "sample-tiktok-scraper",
    slug: "tiktok-no-watermark-video-downloader",
    title: "TikTok Video & Audio No-Watermark Downloader",
    description: "Script Python asynchronous untuk scraping video TikTok HD tanpa watermark beserta metadata likes & view count.",
    category: "Tools",
    language: "python",
    tags: ["tiktok", "downloader", "python", "scraper"],
    thumbnail: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=80",
    authorId: "admin-nimzz",
    authorName: "Nimzz Admin",
    authorUsername: "nimzz",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    views: 2150,
    createdAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
    code: `import httpx
import re

async def download_tiktok(url: str):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    api_endpoint = "https://www.tikwm.com/api/"
    params = {"url": url, "hd": 1}

    async with httpx.AsyncClient(headers=headers, timeout=15.0) as client:
        res = await client.post(api_endpoint, data=params)
        data = res.json()

        if data.get("code") == 0:
            result = data.get("data", {})
            return {
                "title": result.get("title"),
                "author": result.get("author", {}).get("nickname"),
                "video_hd": result.get("hdplay") or result.get("play"),
                "music": result.get("music"),
                "views": result.get("play_count"),
            }
        raise Exception("Gagal mengekstrak video TikTok")`,
  },
  {
    id: "sample-anime-quotes",
    slug: "anime-quotes-generator-api",
    title: "Anime Quotes & Character Voiceover Fetcher",
    description: "Snippet JavaScript lightweight untuk mendapatkan quotes inspiratif karakter anime populer secara acak dengan metadata anime.",
    category: "Anime",
    language: "javascript",
    tags: ["anime", "quotes", "api", "otaku"],
    thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80",
    authorId: "admin-nimzz",
    authorName: "Nimzz Admin",
    authorUsername: "nimzz",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    views: 840,
    createdAt: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
    code: `export async function getRandomAnimeQuote() {
  try {
    const res = await fetch("https://animechan.xyz/api/random");
    if (!res.ok) throw new Error("API rate limited");
    const data = await res.json();
    return {
      anime: data.anime,
      character: data.character,
      quote: data.quote,
      formatted: \`"\${data.quote}" — \${data.character} (\${data.anime})\`
    };
  } catch (error) {
    return {
      anime: "Naruto Shippuden",
      character: "Itachi Uchiha",
      quote: "Orang-orang menjalani hidup mereka terikat oleh apa yang mereka terima sebagai benar dan tepat.",
      formatted: \`"Orang-orang menjalani hidup mereka terikat oleh apa yang mereka terima sebagai benar dan tepat." — Itachi Uchiha\`
    };
  }
}`,
  },
  {
    id: "sample-neobrutal-css",
    slug: "neo-brutalism-cartoon-ui-components",
    title: "Neo-Brutalism Cartoon UI Components & Sound FX",
    description: "Kumpulan styling tombol, badge, dan modal kartun neo-brutalisme dengan bayangan tegas dan animasi tactile retro.",
    category: "Other",
    language: "css",
    tags: ["css", "neo-brutalism", "design", "cartoon"],
    thumbnail: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80",
    authorId: "admin-nimzz",
    authorName: "Nimzz Admin",
    authorUsername: "nimzz",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    views: 1650,
    createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    code: `.neo-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #00ffa4;
  color: #000000;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  font-size: 0.95rem;
  border: 3px solid #000000;
  border-radius: 12px;
  box-shadow: 4px 4px 0 #000000;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.neo-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #000000;
  background: #39ffb7;
}

.neo-btn:active {
  transform: translate(3px, 3px);
  box-shadow: 0 0 0 #000000;
}`,
  },
  {
    id: "sample-security-guard",
    slug: "admin-token-role-middleware-nextjs",
    title: "Secure Next.js Admin Role Guard & Rate Limiter",
    description: "Middleware proteksi route /dashboard dan /publish khusus akun dengan role Owner / Admin serta in-memory token validator.",
    category: "Tools",
    language: "typescript",
    tags: ["security", "admin", "middleware", "auth"],
    thumbnail: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=600&q=80",
    authorId: "admin-nimzz",
    authorName: "Nimzz Admin",
    authorUsername: "nimzz",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    views: 710,
    createdAt: new Date(Date.now() - 3600000 * 24 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 12).toISOString(),
    code: `import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const session = req.cookies.get("admin_session")?.value;
  const isProtected = req.nextUrl.pathname.startsWith("/dashboard") || 
                      req.nextUrl.pathname.startsWith("/publish");

  if (isProtected && !session) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("from", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/publish/:path*"],
};`,
  },
];
