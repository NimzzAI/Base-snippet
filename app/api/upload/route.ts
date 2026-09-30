import { NextRequest, NextResponse } from "next/server";
import { isRequestAdmin } from "@/lib/auth-server";
import { uploadToAceImg } from "@/lib/aceimg";

export const dynamic = "force-dynamic";

const MB = 1024 * 1024;
const MAX_SIZE: Record<string, number> = {
  avatar: 2 * MB,
  banner: 4 * MB,
  thumbnail: 4 * MB,
};

// Hanya png dan jpg, svg dan tipe lain ditolak
const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
};

function matchesSignature(b: Uint8Array, type: string): boolean {
  if (type === "image/jpeg") return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  if (type === "image/png") return b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
  return false;
}

export async function POST(req: NextRequest) {
  if (!isRequestAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Akses ditolak" }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Request harus multipart form data" }, { status: 400 });
  }

  const file = form.get("file") as File | null;
  const kind = String(form.get("kind") || "");

  if (!file || typeof file !== "object" || typeof file.arrayBuffer !== "function") {
    return NextResponse.json({ ok: false, error: "File wajib diisi" }, { status: 400 });
  }
  if (!MAX_SIZE[kind]) {
    return NextResponse.json({ ok: false, error: "Jenis upload tidak valid" }, { status: 400 });
  }
  if (!EXT[file.type]) {
    return NextResponse.json({ ok: false, error: "Hanya gambar png atau jpg" }, { status: 415 });
  }
  if (file.size > MAX_SIZE[kind]) {
    return NextResponse.json(
      { ok: false, error: `Ukuran maksimal ${MAX_SIZE[kind] / MB} MB` },
      { status: 413 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length < 32 || !matchesSignature(buffer.subarray(0, 8), file.type)) {
    return NextResponse.json({ ok: false, error: "Isi file tidak sesuai tipenya" }, { status: 415 });
  }

  try {
    const uploaded = await uploadToAceImg(buffer, `${kind}-${Date.now()}.${EXT[file.type]}`, file.type);
    return NextResponse.json({ ok: true, url: uploaded.url });
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json({ ok: false, error: "Gagal upload gambar, coba lagi" }, { status: 502 });
  }
}
