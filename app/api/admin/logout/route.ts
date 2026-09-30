import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true, message: "Logout berhasil" });
  response.cookies.delete("admin_session");
  return response;
}

export const dynamic = "force-dynamic";
