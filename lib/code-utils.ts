import { Code, LANG_EXTENSIONS } from "./types";
import { config } from "./config";

export function fileExtFor(language?: string): string {
  return LANG_EXTENSIONS[(language || "").toLowerCase()] || "txt";
}

export function fileNameFor(code: Pick<Code, "slug" | "language">): string {
  return `${code.slug || "snippet"}.${fileExtFor(code.language)}`;
}

/** Thumbnail hanya dipakai kalau berupa alamat http(s) atau path lokal */
export function validThumbnail(src?: string): string {
  const s = (src || "").trim();
  if (!s) return "";
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  return /^https?:\/\//i.test(s) ? s : "";
}

export function codeUrl(slug: string, origin?: string): string {
  const base = (origin || config.siteUrl).replace(/\/+$/, "");
  return `${base}/code/${encodeURIComponent(slug)}`;
}

/** Teks share: judul, kategori, bahasa, deskripsi singkat. URL dipisah supaya tidak dobel. */
export function buildShareText(code: Code): string {
  const lines = [
    `📦 ${code.title}`,
    `📁 Kategori: ${code.category || "Umum"}  •  💻 ${code.language || "code"}`,
  ];
  const desc = (code.description || "").trim();
  if (desc) lines.push("", desc.length > 140 ? `${desc.slice(0, 137)}...` : desc);
  lines.push("", `Lihat kodenya di ${config.websiteName}:`);
  return lines.join("\n");
}
