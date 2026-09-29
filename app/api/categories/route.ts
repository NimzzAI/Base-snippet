import { NextRequest, NextResponse } from "next/server";
import { getCategories, addCategory, deleteCategory } from "@/lib/json-db";
import { isRequestAdmin } from "@/lib/auth-server";

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ ok: true, data: categories });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal memuat kategori" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isRequestAdmin(req)) {
      return NextResponse.json(
        { ok: false, error: "Akses ditolak" },
        { status: 403 }
      );
    }

    const { name } = await req.json();
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { ok: false, error: "Nama kategori tidak valid" },
        { status: 400 }
      );
    }

    const updated = await addCategory(name);
    return NextResponse.json({ ok: true, data: updated });
  } catch (error) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal menambah kategori" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!isRequestAdmin(req)) {
      return NextResponse.json(
        { ok: false, error: "Akses ditolak" },
        { status: 403 }
      );
    }

    const { name } = await req.json();
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { ok: false, error: "Nama kategori tidak valid" },
        { status: 400 }
      );
    }

    const updated = await deleteCategory(name);
    return NextResponse.json({ ok: true, data: updated });
  } catch (error) {
    console.error("DELETE /api/categories error:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal menghapus kategori" },
      { status: 500 }
    );
  }
}
