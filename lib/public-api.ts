import { NextResponse } from "next/server";
import { Code } from "./types";
import { config } from "./config";

export const SITE_URL = config.siteUrl.replace(/\/+$/, "");

const CORS = { "Access-Control-Allow-Origin": "*" };

// Balasan sukses, boleh di cache sebentar
export function apiJson(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { ...CORS, "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
  });
}

// Balasan error, jangan di cache
export function apiError(message: string, status: number) {
  return NextResponse.json(
    { ok: false, error: message },
    { status, headers: { ...CORS, "Cache-Control": "no-store" } }
  );
}

// Hanya field publik, authorId tidak ikut
export function toPublicCode(c: Code, withCode: boolean) {
  const base = {
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description,
    category: c.category,
    language: c.language,
    tags: c.tags || [],
    thumbnail: c.thumbnail || "",
    author: c.authorName,
    views: c.views || 0,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    url: `${SITE_URL}/code/${c.slug}`,
  };
  return withCode ? { ...base, code: c.code } : base;
}
