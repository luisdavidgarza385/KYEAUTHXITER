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
    // El SDK C++ manda: type=log&ownerid=...&name=...&message=...&sessionid=...
    const sessionId = p.sessionid;
    const message = p.message || p.msg || p.log;
    const name = p.name;
    const ownerid = p.ownerid || p.appid;
    const ip = getClientIp(req);

    if (!sessionId) {
      return json({ success: false, message: "sessionid required" }, 400);
    }
    if (!message) {
      return json({ success: false, message: "message required" }, 400);
    }

    // Buscar la app
    let app: any = null;
    if (name) app = await store.getAppByName(String(name));
    if (!app && ownerid) app = await store.getAppByAppId(String(ownerid));
    if (!app) return json({ success: false, message: "Application not found" }, 404);

    if (app.status !== "active") {
      return json({ success: false, message: "Application is " + app.status }, 403);
    }

    // Validar sesión
    const session = await store.getSession(String(sessionId));
    if (!session || session.app_id !== app.id) {
      return json({ success: false, message: "Invalid session" }, 401);
    }
    if (new Date(session.expires_at) < new Date()) {
      return json({ success: false, message: "Session expired" }, 401);
    }

    // Sanitizar el mensaje (max 500 chars, no HTML)
    const sanitized = String(message)
      .replace(/[<>]/g, "")
      .slice(0, 500);

    await store.createLog({
      app_id: app.id,
      user_id: session.user_id || null,
      message: `[CLIENT] ${sanitized} | ip=${ip}`,
      level: "info",
    });

    return json({ success: true, message: "Log saved" });
  } catch (e: any) {
    return json({ success: false, message: e?.message || "Server error" }, 500);
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
