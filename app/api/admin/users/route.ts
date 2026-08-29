import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin, safeRoute } from "@/lib/api-helpers";
import { store } from "@/lib/store";
import { getScopedAppIds, checkQuota } from "@/lib/auth";

export const dynamic = "force-dynamic";

const json = (data: unknown, status = 200) => NextResponse.json(data, { status });

export async function GET(req: NextRequest) {
  try {
    const me = await requireAdmin();
    const url = new URL(req.url);
    const appId = url.searchParams.get("appId") || undefined;
    const users = await store.listAppUsers({ appId, limit: 1000 });
    return json({ success: true, data: users });
  } catch (e: any) {
    return json({ success: false, message: e?.message || "Server error" }, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const me = await requireAdmin();
    const body = await req.json().catch(() => ({}));
    
    let appId = String(body?.appId || "").trim();
    if (!appId || appId === "9999") {
      const apps = await store.listApps();
      appId = apps[0]?.id || "9999";
    }

    const username = String(body?.username || "").trim();
    const password = String(body?.password || "");
    const packageName = String(body?.packageName || "default").trim();
    const durationDays = parseInt(String(body?.durationDays || 30)) || 30;
    const hwidLock = !!body?.hwidLock;

    if (!username || !password) {
      return json({ success: false, message: "Usuario y contraseña requeridos" }, 400);
    }

    // Check existing
    const existing = await store.getAppUser(appId, username);
    if (existing) {
      return json({ success: false, message: "El nombre de usuario ya existe en esta aplicación" }, 409);
    }

    const hash = await bcrypt.hash(password, 10);
    const now = new Date();
    const expires = new Date(now.getTime() + durationDays * 86400000);

    const user = await store.createAppUser({
      app_id: appId,
      username,
      email: null,
      password_hash: hash,
      hwid: hwidLock ? "hwid_" + Math.random().toString(36).slice(2, 10) : null,
      ip: "127.0.0.1",
      last_login: null,
      banned: false,
      ban_reason: null,
    });

    const userWithMeta = {
      ...user,
      package_name: packageName,
      level: 1,
      duration_days: durationDays,
      expires_at: expires.toISOString(),
    };

    return json({ success: true, data: userWithMeta });
  } catch (e: any) {
    return json({ success: false, message: e?.message || "Server error" }, 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const me = await requireAdmin();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return json({ success: false, message: "ID requerido" }, 400);
    }
    await store.deleteAppUser(id);
    return json({ success: true, message: "Usuario eliminado" });
  } catch (e: any) {
    return json({ success: false, message: e?.message || "Server error" }, 500);
  }
}
