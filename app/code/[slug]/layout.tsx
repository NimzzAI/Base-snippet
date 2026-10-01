import type { Metadata } from "next";
import { getCodeBySlug } from "@/lib/json-db";
import { config } from "@/lib/config";
import { codeUrl, validThumbnail } from "@/lib/code-utils";

// Catatan: page.tsx di folder ini adalah client component sehingga tidak bisa
// mengekspor generateMetadata. Metadata untuk hasil share (WhatsApp, Telegram,
// Discord, dll) harus ada di layout server seperti ini. File metadata.ts lama
// tidak pernah dibaca Next.js.
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug);
  try {
    const item = await getCodeBySlug(slug);
    if (!item) return { title: "Kode tidak ditemukan" };

    const url = codeUrl(item.slug);
    const category = item.category || "Umum";
    const title = `${item.title} • ${category}`;
    const description = [
      `Kategori: ${category}`,
      `Bahasa: ${item.language || "code"}`,
      (item.description || "").trim() || `Snippet kode di ${config.websiteName}`,
    ].join(" | ");

    const thumb = validThumbnail(item.thumbnail);
    const image = thumb
      ? thumb.startsWith("/") ? `${config.siteUrl}${thumb}` : thumb
      : `${config.siteUrl}/api/og/${encodeURIComponent(item.slug)}`;

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        type: "article",
        url,
        siteName: config.websiteName,
        title,
        description,
        images: [{ url: image, width: 1200, height: 630, alt: item.title }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
    };
  } catch {
    return { title: "Share Code" };
  }
}

export default function CodeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
