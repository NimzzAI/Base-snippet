import { NextRequest, NextResponse } from "next/server";
import { getAdminProfile, updateAdminProfile } from "@/lib/json-db";
import { isRequestAdmin } from "@/lib/auth-server";
import { errMsg } from "@/lib/store";
import { cleanProfileUpdates } from "@/lib/security";

export async function GET() {
  try {
    const profile = await getAdminProfile();
    return NextResponse.json({ ok: true, data: profile });
  } catch (error) {
    console.error("GET /api/admin/profile error:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal memuat profil admin" },
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

    const updates = await req.json();
    const updated = await updateAdminProfile(cleanProfileUpdates(updates));
    return NextResponse.json({ ok: true, data: updated });
  } catch (error) {
    console.error("POST /api/admin/profile error:", error);
    return NextResponse.json(
      { ok: false, error: errMsg(error, "Gagal menyimpan profil admin") },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
