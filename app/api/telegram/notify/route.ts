// Internal endpoint — dipanggil dari client untuk trigger notifikasi owner
// Hanya menerima request dari origin sendiri
import { NextRequest, NextResponse } from "next/server";
import { notifyOwner, msgNewRequest, msgNewCode } from "@/lib/telegram";
import settings from "@/settings";

export async function POST(req: NextRequest) {
  // Only allow same-origin
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  if (!origin.includes(new URL(settings.site.url).hostname) &&
      process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { type, data } = body;
  if (!type || !data) return NextResponse.json({ error: "Missing type or data" }, { status: 400 });

  try {
    if (type === "new_request" && settings.telegram.notifyOnNewRequest) {
      await notifyOwner(msgNewRequest(data));
    } else if (type === "new_code" && settings.telegram.notifyOnNewCode) {
      await notifyOwner(msgNewCode(data));
    }
  } catch (e) {
    // Don't fail the main request because of notification error
    console.warn("[Notify]", e);
  }

  return NextResponse.json({ ok: true });
}
