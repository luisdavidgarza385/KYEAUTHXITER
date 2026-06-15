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
    const message = body.message || url.searchParams.get("message");
    const level = (body.level || url.searchParams.get("level") || "info") as "info" | "warn" | "error" | "debug";

    if (!appId || !message) return json({ success: false, message: "appid and message required" }, 400);
    if (!sessionId) return json({ success: false, message: "sessionid required" }, 400);

    const app = await store.getAppByAppId(String(appId));
    if (!app) return json({ success: false, message: "Application not found" }, 404);
    const secret = req.headers.get("x-secret") || url.searchParams.get("secret");
    if (secret !== app.app_secret) return json({ success: false, message: "Invalid application secret" }, 401);

    const session = await store.getSession(String(sessionId));
    if (!session || session.app_id !== app.id) return json({ success: false, message: "Invalid session" }, 401);

    await store.createLog({ app_id: app.id, user_id: session.user_id, message: String(message), level });
    return json({ success: true });
  } catch (e: any) {
    return json({ success: false, message: e?.message || "Server error" }, 500);
  }
}
