import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { getClientIp, generateId } from "@/lib/utils";

export const dynamic = "force-dynamic";

const json = (data: unknown, status = 200) => NextResponse.json(data, { status });

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      const text = await req.text();
      try { body = JSON.parse(text); }
      catch { body = Object.fromEntries(new URLSearchParams(text)); }
    } catch {}
    const url = new URL(req.url);
    const name = body.name || url.searchParams.get("name");
    const ownerid = body.ownerid || url.searchParams.get("ownerid");
    const appId = body.appid || url.searchParams.get("appid") || ownerid;

    let app = null;
    if (name) app = await store.getAppByName(String(name));
    if (!app && appId) app = await store.getAppByAppId(String(appId));
    if (!app) return json({ success: false, message: "Application not found" }, 404);

    const secret = body.secret || req.headers.get("x-secret") || url.searchParams.get("secret");
    if (secret && secret !== app.app_secret) return json({ success: false, message: "Invalid application secret" }, 401);
    if (app.status !== "active") return json({ success: false, message: "Application is " + app.status }, 403);

    const ip = getClientIp(req);
    const hwid = body.hwid || url.searchParams.get("hwid") || null;
    const sessionId = generateId(48);
    const nonce = generateId(16);
    const enckey = generateId(64);
    const expires = new Date(Date.now() + 86400000);
    await store.createSession({
      session_id: sessionId,
      app_id: app.id,
      user_id: null,
      ip,
      hwid,
      expires_at: expires.toISOString(),
      valid: true,
    });
    await store.createLog({ app_id: app.id, user_id: null, message: `init from ${ip}`, level: "info" });

    return json({
      success: true,
      sessionid: sessionId,
      ownerid: app.app_id,
      message: "",
      appinfo: { name: app.name, version: app.version, download_link: app.download_link, numUsers: "0", numOnlineUsers: "0", numKeys: "0", customerPanelLink: "" },
      appInfo: { name: app.name, version: app.version, download_link: app.download_link, numUsers: "0", numOnlineUsers: "0", numKeys: "0", customerPanelLink: "" },
      subscriptions: [],
      userdata: { username: "", ip: "", hwid: "", createdate: "", lastlogin: "", subscription: "", subscriptions: [], expiry: "" },
      user_data: { username: "", ip: "", hwid: "", createdate: "", lastlogin: "", subscription: "", subscriptions: [], expiry: "" },
      nonce: nonce,
      enckey: enckey,
    });
  } catch (e: any) {
    return json({ success: false, message: e?.message || "Server error" }, 500);
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
