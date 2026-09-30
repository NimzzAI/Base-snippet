import { NextRequest } from "next/server";
import { getCodes } from "@/lib/json-db";
import { errMsg } from "@/lib/store";
import { apiJson, apiError, toPublicCode } from "@/lib/public-api";

export const dynamic = "force-dynamic";

function toInt(value: string | null, fallback: number, min: number, max: number): number {
  const n = parseInt(value || "", 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const search = sp.get("search")?.toLowerCase().trim();
    const category = sp.get("category")?.toLowerCase().trim();
    const language = sp.get("language")?.toLowerCase().trim();
    const tag = sp.get("tag")?.toLowerCase().trim();
    const limit = toInt(sp.get("limit"), 20, 1, 50);
    const offset = toInt(sp.get("offset"), 0, 0, 100000);

    let codes = await getCodes();

    if (search) {
      codes = codes.filter(
        (c) =>
          c.title.toLowerCase().includes(search) ||
          (c.description || "").toLowerCase().includes(search) ||
          (c.tags || []).some((t) => t.toLowerCase().includes(search))
      );
    }
    if (category) codes = codes.filter((c) => c.category.toLowerCase() === category);
    if (language) codes = codes.filter((c) => c.language.toLowerCase() === language);
    if (tag) codes = codes.filter((c) => (c.tags || []).some((t) => t.toLowerCase() === tag));

    const total = codes.length;
    const page = codes.slice(offset, offset + limit).map((c) => toPublicCode(c, false));

    return apiJson({ ok: true, data: page, meta: { total, limit, offset } });
  } catch (error) {
    console.error("GET /api/v1/snippets error:", error);
    return apiError(errMsg(error, "Gagal memuat snippet"), 500);
  }
}
