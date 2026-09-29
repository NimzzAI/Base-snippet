import { NextRequest, NextResponse } from "next/server";
import { getCodeBySlug, getCodeById, updateCode, deleteCode, incrementCodeViews } from "@/lib/json-db";
import { isRequestAdmin } from "@/lib/auth-server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    let code = await getCodeBySlug(slug);
    if (!code) {
      code = await getCodeById(slug);
    }

    if (!code) {
      return NextResponse.json(
        { ok: false, error: "Snippet kode tidak ditemukan" },
        { status: 404 }
      );
    }

    // Increment view count in background
    const newViews = await incrementCodeViews(code.slug);
    code.views = newViews;

    return NextResponse.json({ ok: true, data: code });
  } catch (error) {
    console.error("GET /api/codes/[slug] error:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal mengambil kode" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (!isRequestAdmin(req)) {
      return NextResponse.json(
        { ok: false, error: "Akses ditolak" },
        { status: 403 }
      );
    }

    const { slug } = await params;
    const body = await req.json();

    const updated = await updateCode(slug, body);
    if (!updated) {
      return NextResponse.json(
        { ok: false, error: "Snippet kode tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: updated });
  } catch (error) {
    console.error("PUT /api/codes/[slug] error:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal memperbarui kode" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (!isRequestAdmin(req)) {
      return NextResponse.json(
        { ok: false, error: "Akses ditolak" },
        { status: 403 }
      );
    }

    const { slug } = await params;
    const success = await deleteCode(slug);
    if (!success) {
      return NextResponse.json(
        { ok: false, error: "Snippet kode tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, message: "Kode berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/codes/[slug] error:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal menghapus kode" },
      { status: 500 }
    );
  }
}
