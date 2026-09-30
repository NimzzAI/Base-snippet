import { NextRequest } from "next/server";
import { getCodeBySlug } from "@/lib/json-db";
import { errMsg } from "@/lib/store";
import { apiJson, apiError, toPublicCode } from "@/lib/public-api";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const item = await getCodeBySlug(slug);
    if (!item) return apiError("Snippet tidak ditemukan", 404);
    return apiJson({ ok: true, data: toPublicCode(item, true) });
  } catch (error) {
    console.error("GET /api/v1/snippets/[slug] error:", error);
    return apiError(errMsg(error, "Gagal memuat snippet"), 500);
  }
}
