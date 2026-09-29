import { NextRequest, NextResponse } from "next/server";
import { getRequests, createRequest, updateRequestStatus, deleteRequest } from "@/lib/json-db";
import { isRequestAdmin } from "@/lib/auth-server";

export async function GET() {
  try {
    const requests = await getRequests();
    return NextResponse.json({ ok: true, data: requests });
  } catch (error) {
    console.error("GET /api/requests error:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal memuat requests" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { codeName, description, authorName } = body;

    if (!codeName || !description) {
      return NextResponse.json(
        { ok: false, error: "Judul dan deskripsi wajib diisi!" },
        { status: 400 }
      );
    }

    const newReq = await createRequest({
      authorName: (authorName || "Pengunjung").trim(),
      codeName: codeName.trim(),
      description: description.trim(),
      status: "new",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, data: newReq });
  } catch (error) {
    console.error("POST /api/requests error:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal mengirim request" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!isRequestAdmin(req)) {
      return NextResponse.json(
        { ok: false, error: "Akses ditolak" },
        { status: 403 }
      );
    }

    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json(
        { ok: false, error: "Parameter ID dan status wajib diisi" },
        { status: 400 }
      );
    }

    const success = await updateRequestStatus(id, status);
    if (!success) {
      return NextResponse.json(
        { ok: false, error: "Request tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, message: "Status berhasil diupdate" });
  } catch (error) {
    console.error("PATCH /api/requests error:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal update status" },
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

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Parameter ID wajib diisi" },
        { status: 400 }
      );
    }

    const success = await deleteRequest(id);
    if (!success) {
      return NextResponse.json(
        { ok: false, error: "Request tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, message: "Request berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/requests error:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal menghapus request" },
      { status: 500 }
    );
  }
}
