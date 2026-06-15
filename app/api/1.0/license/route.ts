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
    const key = body.key || url.searchParams.get("key");
    const hwid = body.hwid || url.searchParams.get("hwid") || null;

    if (!appId || !key) return json({ success: false, message: "appid and key required" }, 400);
    if (!sessionId) return json({ success: false, message: "sessionid required" }, 400);

    const app = await store.getAppByAppId(String(appId));
    if (!app) return json({ success: false, message: "Application not found" }, 404);
    const secret = req.headers.get("x-secret") || url.searchParams.get("secret");
    if (secret !== app.app_secret) return json({ success: false, message: "Invalid application secret" }, 401);

    const session = await store.getSession(String(sessionId));
    if (!session || session.app_id !== app.id) return json({ success: false, message: "Invalid session" }, 401);

    const lic = await store.getLicenseByKey(app.id, String(key));
    if (!lic) return json({ success: false, message: "Invalid license" }, 404);
    if (lic.status === "banned") return json({ success: false, message: "License banned" }, 403);
    if (lic.uses >= lic.max_uses) return json({ success: false, message: "No uses left" }, 403);

    if (lic.hwid_lock && hwid && lic.used_by) {
      const prev = await store.getAppUserById(lic.used_by);
      if (prev?.hwid && prev.hwid !== hwid) {
        return json({ success: false, message: "HWID mismatch" }, 403);
      }
    }

    const now = new Date();
    let expiresAt = lic.expires_at ? new Date(lic.expires_at) : null;
    if (!expiresAt || expiresAt < now) {
      expiresAt = new Date(now.getTime() + lic.duration_days * 86400000);
      await store.updateLicense(lic.id, {
        status: "used",
        used_by: lic.used_by || session.user_id,
        activated_at: lic.activated_at || now.toISOString(),
        expires_at: expiresAt.toISOString(),
        uses: lic.uses + 1,
      });
    } else if (session.user_id) {
      await store.updateLicense(lic.id, { uses: lic.uses + 1 });
    }

    await store.createLog({ app_id: app.id, user_id: session.user_id, message: `license valid ${key}`, level: "info" });

    return json({ success: true, data: { status: true, message: "License valid", level: lic.level, expires_at: expiresAt.toISOString(), hwid } });
  } catch (e: any) {
    return json({ success: false, message: e?.message || "Server error" }, 500);
  }
}
