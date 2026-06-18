import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { store } from "@/lib/store";
import { getClientIp } from "@/lib/utils";

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
    const appId = body.appid || url.searchParams.get("appid");
    const sessionId = body.sessionid || url.searchParams.get("sessionid");
    const username = body.username || url.searchParams.get("username");
    const password = body.password || url.searchParams.get("password");
    const hwid = body.hwid || url.searchParams.get("hwid") || null;

    if (!appId || !username || !password) return json({ success: false, message: "appid, username, password required" }, 400);
    if (!sessionId) return json({ success: false, message: "sessionid required" }, 400);

    const app = await store.getAppByAppId(String(appId));
    if (!app) return json({ success: false, message: "Application not found" }, 404);

    const secret = body.secret || req.headers.get("x-secret") || url.searchParams.get("secret");
    if (secret !== app.app_secret) return json({ success: false, message: "Invalid application secret" }, 401);

    const session = await store.getSession(String(sessionId));
    if (!session || session.app_id !== app.id) return json({ success: false, message: "Invalid session" }, 401);

    const user = await store.getAppUser(app.id, String(username));
    if (!user) return json({ success: false, message: "Invalid credentials" }, 401);

    if (user.banned) return json({ success: false, message: "You are banned: " + (user.ban_reason || "") }, 403);

    const valid = await bcrypt.compare(String(password), user.password_hash);
    if (!valid) return json({ success: false, message: "Invalid credentials" }, 401);

    const ip = getClientIp(req);

    // Buscar la licencia activa del usuario para determinar su nivel de suscripción
    const allLicenses = await store.listLicenses({ appId: app.id });
    const now = new Date();
    const userLicense = allLicenses.find(
      (lic) =>
        lic.used_by === user.id &&
        lic.status === "used" &&
        lic.expires_at &&
        new Date(lic.expires_at) > now
    );

    // Construir lista de suscripciones según la licencia activa del usuario.
    // El loader Lunarx busca { name: "VIP" } para dar acceso.
    // Cualquier licencia activa válida otorga VIP — el nivel diferencia
    // el plan dentro del cheat (nivel 1 = NEW/básico, nivel 2+ = VIP completo),
    // pero AMBOS reciben el tag "VIP" para pasar el check del loader.
    const subscriptions: { subscription: string; key: string; expiry: string }[] = [];
    if (userLicense) {
      const expiry = userLicense.expires_at ?? "";
      // Toda licencia activa = acceso VIP al loader
      subscriptions.push({ subscription: "VIP", key: userLicense.key, expiry });
    }

    await store.updateAppUser(user.id, {
      last_login: new Date().toISOString(),
      ip,
      hwid: hwid || user.hwid,
    });
    await store.updateSession(String(sessionId), { user_id: user.id, hwid, ip });
    await store.createLog({ app_id: app.id, user_id: user.id, message: `login ${username}`, level: "info" });

    const subForInfo = subscriptions[0]?.subscription ?? "";
    const expiryForInfo = subscriptions[0]?.expiry ?? "";

    return json({
      success: true,
      message: "Logged in",
      info: {
        username: user.username,
        ip,
        hwid: hwid || user.hwid,
        createdate: user.created_at,
        lastlogin: user.last_login,
        subscription: subForInfo,
        subscriptions: subscriptions.map((s) => ({ name: s.subscription, expiry: s.expiry })),
        expiry: expiryForInfo,
        role: "user"
      },
      // También en user_data para compatibilidad con otros SDKs
      user_data: {
        username: user.username,
        ip,
        hwid: hwid || user.hwid,
        createdate: user.created_at,
        lastlogin: user.last_login,
        subscription: subForInfo,
        subscriptions: subscriptions.map((s) => ({ name: s.subscription, expiry: s.expiry })),
        expiry: expiryForInfo,
      }
    });
  } catch (e: any) {
    return json({ success: false, message: e?.message || "Server error" }, 500);
  }
}
