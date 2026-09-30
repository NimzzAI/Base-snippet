import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth-server";
import { config } from "@/lib/config";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  const session = verifySessionToken(token);
  if (!session) {
    const res = NextResponse.json({ authenticated: false }, { status: 200 });
    res.cookies.delete("admin_session");
    return res;
  }

  return NextResponse.json({
    authenticated: true,
    admin: {
      username: session.username,
      displayName: config.admin.displayName,
      photoURL: config.admin.photoURL,
      banner: config.admin.banner,
      bio: config.admin.bio,
      socials: config.admin.socials,
    },
  });
}

export const dynamic = "force-dynamic";
