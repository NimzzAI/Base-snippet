import { NextRequest, NextResponse } from "next/server";
import { runInternalTests } from "@/lib/internal-test";
import { verifySessionToken } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value;
  const authHeader = req.headers.get("x-internal-secret");
  const internalSecret = process.env.ADMIN_SECRET || "nimzz-code-secure-secret-token-key-2026";

  const isAuthViaCookie = token ? Boolean(verifySessionToken(token)) : false;
  const isAuthViaSecret = authHeader === internalSecret;

  if (!isAuthViaCookie && !isAuthViaSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const testReport = runInternalTests();
  return NextResponse.json(testReport);
}

export const dynamic = "force-dynamic";
