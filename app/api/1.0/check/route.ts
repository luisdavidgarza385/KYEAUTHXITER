import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { getClientIp } from "@/lib/utils";

export const dynamic = "force-dynamic";

const json = (data: unknown, status = 200) => {
  const res = NextResponse.json(data, { status });
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  return res;
};

async function getParams(req: NextRequest): Promise<Record<string, string>> {
  const ct = req.headers.get("content-type") || "";
  const params: Record<string, string> = {};
  try {
    const text = await req.text();
    if (ct.includes("application/json")) {
      try { return JSON.parse(text); } catch {}
    }
    try {
      const sp = new URLSearchParams(text);
      for (const [k, v] of sp) params[k] = v;
    } catch {}
  } catch {}
  for (const [k, v] of new URL(req.url).searchParams) {
    if (!params[k]) params[k] = v;
  }
  return params;
}

export async function POST(req: NextRequest) {
  try {
    const p = await getParams(req);
    const sessionId = p.sessionid;
    const name = p.name;
    const ownerid = p.ownerid || p.appid;
    const ip = getClientIp(req);

    if (!sessionId) {
      return json({ success: false, message: "sessionid required" }, 400);
    }

    // Buscar la app por name o ownerid
    let app: any = null;
    if (name) app = await store.getAppByName(String(name));
    if (!app && ownerid) app = await store.getAppByAppId(String(ownerid));
    if (!app) return json({ success: false, message: "Application not found" }, 404);

    if (app.status !== "active") {
      return json({ success: false, message: "Application is " + app.status }, 403);
    }

    // Validar la sesión en base de datos
    const session = await store.getSession(String(sessionId));
    if (!session || session.app_id !== app.id) {
      return json({ success: false, message: "Invalid session" }, 401);
    }

    // Verificar que la sesión no expiró
    if (new Date(session.expires_at) < new Date()) {
      await store.invalidateSession(String(sessionId));
      return json({ success: false, message: "Session expired" }, 401);
    }

    // Si hay usuario vinculado a la sesión, verificar que no está baneado
    if (session.user_id) {
      const user = await store.getAppUserById(session.user_id);
      if (!user) {
        return json({ success: false, message: "User not found" }, 401);
      }
      if (user.banned) {
        return json({ success: false, message: "You are banned: " + (user.ban_reason || "") }, 403);
      }

      // Verificar que tiene al menos una licencia activa
      const allLicenses = await store.listLicenses({ appId: app.id });
      const now = new Date();
      const activeLicense = allLicenses.find(
        (l: any) =>
          l.used_by === session.user_id &&
          l.status === "used" &&
          (!l.expires_at || new Date(l.expires_at) > now)
      );

      if (!activeLicense) {
        return json({ success: false, message: "Subscription expired" }, 403);
      }
    }

    await store.createLog({
      app_id: app.id,
      user_id: session.user_id || null,
      message: `check from ${ip} session=${sessionId}`,
      level: "info",
    });

    return json({ success: true, message: "Session valid" });
  } catch (e: any) {
    return json({ success: false, message: e?.message || "Server error" }, 500);
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
