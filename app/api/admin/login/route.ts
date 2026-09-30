import { NextRequest, NextResponse } from "next/server";
import {
  getRateLimitKey,
  checkLoginRateLimit,
  recordFailedLogin,
  clearLoginAttempts,
  verifyAdminCredentials,
  createSessionToken,
} from "@/lib/auth-server";
import { config } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const clientDeviceId =
      typeof body.deviceId === "string" && body.deviceId
        ? body.deviceId
        : req.headers.get("x-device-id") || "device-unknown";

    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : req.headers.get("x-real-ip") || "127.0.0.1";

    const rateLimitKey = getRateLimitKey(ip, clientDeviceId);

    // 1. Check rate limit
    const rateCheck = checkLoginRateLimit(rateLimitKey);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: rateCheck.message || "Akses diblokir sementara karena terlalu banyak percobaan gagal.",
          blockedRemainingSeconds: rateCheck.blockedRemainingSeconds,
        },
        { status: 429 }
      );
    }

    // 2. Validate input format
    if (!username || !password) {
      return NextResponse.json(
        {
          ok: false,
          error: "Username dan password wajib diisi.",
        },
        { status: 400 }
      );
    }

    // 3. Verify credentials
    const isValid = verifyAdminCredentials(username, password);

    if (!isValid) {
      const failResult = recordFailedLogin(rateLimitKey);
      if (failResult.isBlocked) {
        return NextResponse.json(
          {
            ok: false,
            error: `Batas 5 kali percobaan gagal tercapai. Akses diblokir sementara selama ${failResult.blockedMinutes} menit.`,
            blockedRemainingSeconds: (failResult.blockedMinutes || 15) * 60,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          ok: false,
          error: "Username atau password salah.",
          remainingAttempts: failResult.remainingAttempts,
        },
        { status: 401 }
      );
    }

    // 4. Success -> Clear rate limit & set session cookie
    clearLoginAttempts(rateLimitKey);
    const token = createSessionToken(config.admin.username);

    const response = NextResponse.json({
      ok: true,
      message: "Login berhasil",
      admin: {
        username: config.admin.username,
        displayName: config.admin.displayName,
      },
    });

    const isProd = process.env.NODE_ENV === "production";
    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: config.security.sessionDurationHours * 3600,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Terjadi kesalahan pada server saat memproses login." },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
