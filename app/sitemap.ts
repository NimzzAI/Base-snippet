import type { MetadataRoute } from "next";
import { getCodes, getCategories } from "@/lib/json-db";
import { SITE_URL } from "@/lib/public-api";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = [
    { path: "/", priority: 1 },
    { path: "/search", priority: 0.9 },
    { path: "/request", priority: 0.5 },
    { path: "/owner", priority: 0.5 },
    { path: "/api-docs", priority: 0.4 },
  ];

  const entries: MetadataRoute.Sitemap = pages.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    priority: p.priority,
  }));

  // Kalau penyimpanan belum aktif, sitemap tetap jalan tanpa data kode
  try {
    const codes = await getCodes();
    for (const c of codes.slice(0, 5000)) {
      entries.push({
        url: `${SITE_URL}/code/${c.slug}`,
        lastModified: c.updatedAt ? new Date(c.updatedAt) : undefined,
        priority: 0.6,
      });
    }
    const cats = await getCategories();
    for (const cat of cats) {
      entries.push({ url: `${SITE_URL}/category/${encodeURIComponent(cat)}`, priority: 0.5 });
    }
  } catch {}

  return entries;
}
