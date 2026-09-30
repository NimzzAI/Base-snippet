import { NextRequest } from "next/server";
import { getCodeBySlug } from "@/lib/json-db";
import { LANG_EXTENSIONS } from "@/lib/types";
import { apiError } from "@/lib/public-api";

export const dynamic = "force-dynamic";

// Buang karakter yang bisa merusak header
function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "");
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const item = await getCodeBySlug(slug);
    if (!item) return apiError("Snippet tidak ditemukan", 404);

    const ext = LANG_EXTENSIONS[item.language] || "txt";
    const filename = `${safeName(item.slug) || "snippet"}.${ext}`;
    const download = req.nextUrl.searchParams.get("download") === "1";

    const headers: Record<string, string> = {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
    };
    if (download) headers["Content-Disposition"] = `attachment; filename="${filename}"`;

    return new Response(item.code || "", { headers });
  } catch (error) {
    console.error("GET /api/v1/snippets/[slug]/raw error:", error);
    return apiError("Gagal memuat snippet", 500);
  }
}
