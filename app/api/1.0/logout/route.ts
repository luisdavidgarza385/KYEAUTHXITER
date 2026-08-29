import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

const json = (data: unknown, status = 200) => NextResponse.json(data, { status });

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try { body = await req.json(); } catch {}
    const url = new URL(req.url);
    const appId = body.appid || url.searchParams.get("appid");
    const sessionId = body.sessionid || url.searchParams.get("sessionid");

    if (!sessionId) return json({ success: false, message: "sessionid required" }, 400);

    if (appId) {
      const app = await store.getAppByAppId(String(appId));
      if (app) {
        const secret = req.headers.get("x-secret") || url.searchParams.get("secret");
        if (secret !== app.app_secret) return json({ success: false, message: "Invalid application secret" }, 401);
      }
    }
    await store.invalidateSession(String(sessionId));
    return json({ success: true, data: { status: true, message: "Logged out" } });
  } catch (e: any) {
    return json({ success: false, message: e?.message || "Server error" }, 500);
  }
}
