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
    const name = body.name || url.searchParams.get("name");

    if (!appId || !name) return json({ success: false, message: "appid and name required" }, 400);
    if (!sessionId) return json({ success: false, message: "sessionid required" }, 400);

    const app = await store.getAppByAppId(String(appId));
    if (!app) return json({ success: false, message: "Application not found" }, 404);
    const secret = req.headers.get("x-secret") || url.searchParams.get("secret");
    if (secret !== app.app_secret) return json({ success: false, message: "Invalid application secret" }, 401);

    const session = await store.getSession(String(sessionId));
    if (!session || session.app_id !== app.id) return json({ success: false, message: "Invalid session" }, 401);

    const variable = await store.getVariable(app.id, String(name));
    if (!variable) return json({ success: false, message: "Variable not found" }, 404);
    if (variable.authed && !session.user_id) return json({ success: false, message: "Authentication required" }, 401);

    return json({ success: true, data: { status: true, value: variable.value } });
  } catch (e: any) {
    return json({ success: false, message: e?.message || "Server error" }, 500);
  }
}
