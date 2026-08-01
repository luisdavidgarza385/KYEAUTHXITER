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
    if (lic.status === "paused") {
      return json({ success: false, message: "Esta licencia está pausada por seguridad debido a doble inicio de sesión." }, 403);
    }

    let assignedUser: any = null;
    if (lic.used_by) {
      assignedUser = await store.getAppUserById(lic.used_by);
    }

    if (!assignedUser) {
      assignedUser = await store.getAppUser(app.id, String(key));
      if (!assignedUser) {
        assignedUser = await store.createAppUser({
          app_id: app.id,
          username: String(key),
          email: null,
          password_hash: "KEY_USER_" + Date.now(),
          hwid: hwid || null,
          ip: null,
          last_login: new Date().toISOString(),
          banned: false,
          ban_reason: null,
        });
      } else if (hwid && !assignedUser.hwid) {
        await store.updateAppUser(assignedUser.id, { hwid });
        assignedUser.hwid = hwid;
      }
      await store.updateLicense(lic.id, { used_by: assignedUser.id });
      lic.used_by = assignedUser.id;
    }

    // Strict 1-PC HWID Lock check (all 1-use licenses are strictly locked to 1 PC)
    const isMultiPc = !!(lic.max_uses && lic.max_uses > 1);
    if (!isMultiPc && assignedUser?.hwid && hwid && assignedUser.hwid !== hwid) {
      return json({ success: false, message: "HWID mismatch: Esta licencia está autorizada para 1 sola PC." }, 403);
    }

    if (!isMultiPc && hwid && assignedUser && !assignedUser.hwid) {
      await store.updateAppUser(assignedUser.id, { hwid });
      assignedUser.hwid = hwid;
    }

    const now = new Date();
    let expiresAt = lic.expires_at ? new Date(lic.expires_at) : null;
    if (!expiresAt || expiresAt < now) {
      expiresAt = new Date(now.getTime() + lic.duration_days * 86400000);
      await store.updateLicense(lic.id, {
        status: "used",
        used_by: assignedUser ? assignedUser.id : (lic.used_by || session.user_id),
        activated_at: lic.activated_at || now.toISOString(),
        expires_at: expiresAt.toISOString(),
        uses: lic.uses + 1,
      });
    } else {
      await store.updateLicense(lic.id, { uses: lic.uses + 1 });
    }

    await store.createLog({ app_id: app.id, user_id: assignedUser ? assignedUser.id : session.user_id, message: `license valid ${key}`, level: "info" });

    return json({ success: true, data: { status: true, message: "License valid", level: lic.level, expires_at: expiresAt.toISOString(), hwid } });
  } catch (e: any) {
    return json({ success: false, message: e?.message || "Server error" }, 500);
  }
}
