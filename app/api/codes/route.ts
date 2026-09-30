import { NextRequest, NextResponse } from "next/server";
import { getCodes, createCode } from "@/lib/json-db";
import { isRequestAdmin } from "@/lib/auth-server";
import { errMsg } from "@/lib/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim();
    const category = searchParams.get("category")?.toLowerCase().trim();
    const tag = searchParams.get("tag")?.toLowerCase().trim();
    const authorUsername = searchParams.get("authorUsername")?.toLowerCase().trim();
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    let codes = await getCodes();

    if (search) {
      codes = codes.filter(
        (c) =>
          c.title.toLowerCase().includes(search) ||
          c.description.toLowerCase().includes(search) ||
          c.language.toLowerCase().includes(search) ||
          c.category.toLowerCase().includes(search) ||
          (c.tags && c.tags.some((t) => t.toLowerCase().includes(search)))
      );
    }

    if (category) {
      codes = codes.filter((c) => c.category.toLowerCase() === category);
    }

    if (tag) {
      codes = codes.filter(
        (c) => c.tags && c.tags.some((t) => t.toLowerCase() === tag)
      );
    }

    if (authorUsername) {
      codes = codes.filter(
        (c) => c.authorUsername.toLowerCase() === authorUsername
      );
    }

    if (limit && limit > 0) {
      codes = codes.slice(0, limit);
    }

    return NextResponse.json({ ok: true, data: codes });
  } catch (error) {
    console.error("GET /api/codes error:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal memuat kode" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isRequestAdmin(req)) {
      return NextResponse.json(
        { ok: false, error: "Akses ditolak: Hanya Admin yang dapat mempublikasikan kode." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      category,
      language,
      tags,
      code,
      thumbnail,
      authorName,
      authorUsername,
      authorAvatar,
    } = body;

    if (!title || !code) {
      return NextResponse.json(
        { ok: false, error: "Judul dan kode wajib diisi!" },
        { status: 400 }
      );
    }

    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60) +
      "-" +
      Date.now().toString(36);

    const newCode = await createCode({
      slug,
      title: title.trim(),
      description: (description || "").trim(),
      category: category || "Tools",
      language: language || "javascript",
      tags: Array.isArray(tags) ? tags : [],
      thumbnail: (thumbnail || "").trim(),
      code: code.trim(),
      authorId: "admin",
      authorUsername: authorUsername || "nimzz",
      authorName: authorName || "Nimzz Admin",
      authorAvatar: authorAvatar || "",
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, data: newCode });
  } catch (error) {
    console.error("POST /api/codes error:", error);
    return NextResponse.json(
      { ok: false, error: errMsg(error, "Gagal membuat kode") },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
