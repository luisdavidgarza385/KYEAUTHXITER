import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { store } from "@/lib/store";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const json = (data: unknown, status = 200) => NextResponse.json(data, { status });

export async function GET(req: NextRequest) {
  try {
    const me = await requireAdmin();
    const allAdmins = await store.listAdmins();
    const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "spectralx@gmail.com";
    const isSuperAdmin = me.email.toLowerCase() === bootstrapEmail.toLowerCase();

    // Filter sub-managers created by this user or having role "manager"
    const subManagers = allAdmins.filter(
      (a) => a.role === "manager" && (isSuperAdmin || a.created_by === me.id)
    );
    return json({ success: true, data: subManagers });
  } catch (e: any) {
    return json({ success: false, message: e?.message || "Server error" }, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const me = await requireAdmin();
    const body = await req.json().catch(() => ({}));

    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const plan = String(body?.plan || "ilimitado");
    const credits = Math.max(0, parseInt(String(body?.credits || 0)) || 0);
    const permissions = Array.isArray(body?.permissions) ? body.permissions : [];
    const subscriptions = Array.isArray(body?.subscriptions) ? body.subscriptions : [];
    const expiryDays = parseInt(String(body?.expiryDays || 0)) || 0;

    let subscription_end: string | null = null;
    if (expiryDays > 0) {
      const d = new Date();
      d.setDate(d.getDate() + expiryDays);
      subscription_end = d.toISOString();
    }

    if (!email || !password) {
      return json({ success: false, message: "Usuario y contraseña requeridos" }, 400);
    }
    if (password.length < 5) {
      return json({ success: false, message: "La contraseña debe tener al menos 5 caracteres" }, 400);
    }

    const existing = await store.getAdminByEmail(email);
    if (existing) {
      return json({ success: false, message: "El usuario ya existe" }, 409);
    }

    const parentAdmin = await store.getAdminById(me.id);
    if (!parentAdmin) {
      return json({ success: false, message: "Parent admin not found" }, 404);
    }

    const hash = await bcrypt.hash(password, 10);
    const canCreateApps = permissions.includes("create_apps");

    const subManager = await store.createAdmin({
      email,
      password_hash: hash,
      role: "manager",
      created_by: me.id,
      credits: plan === "ilimitado" ? -1 : credits,
      status: "active",
      permissions,
      subscriptions,
      subscription_end,
      can_create_apps: canCreateApps,
    });

    return json({ success: true, data: subManager });
  } catch (e: any) {
    return json({ success: false, message: e?.message || "Server error" }, 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const me = await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const id = body?.id;

    if (!id) {
      return json({ success: false, message: "ID requerido" }, 400);
    }

    const sub = await store.getAdminById(id);
    if (!sub) {
      return json({ success: false, message: "Sub-manager no encontrado" }, 404);
    }

    const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "spectralx@gmail.com";
    const isSuperAdmin = me.email.toLowerCase() === bootstrapEmail.toLowerCase();

    if (!isSuperAdmin && sub.created_by !== me.id) {
      return json({ success: false, message: "Acción no permitida" }, 403);
    }

    const password = String(body?.password || "");
    const plan = String(body?.plan || "ilimitado");
    const credits = Math.max(0, parseInt(String(body?.credits || 0)) || 0);
    const permissions = Array.isArray(body?.permissions) ? body.permissions : [];
    const subscriptions = Array.isArray(body?.subscriptions) ? body.subscriptions : [];

    if (body?.expiryDays !== undefined) {
      const expiryDays = parseInt(String(body.expiryDays)) || 0;
      if (expiryDays > 0) {
        const d = new Date();
        d.setDate(d.getDate() + expiryDays);
        sub.subscription_end = d.toISOString();
      } else if (expiryDays === 0) {
        sub.subscription_end = null;
      }
    }

    if (password && password.length < 5) {
      return json({ success: false, message: "La contraseña debe tener al menos 5 caracteres" }, 400);
    }

    if (password) {
      sub.password_hash = await bcrypt.hash(password, 10);
    }

    sub.credits = plan === "ilimitado" ? -1 : credits;
    sub.permissions = permissions;
    sub.subscriptions = subscriptions;
    sub.can_create_apps = permissions.includes("create_apps");

    const updated = await store.updateAdmin(sub.id, sub);
    return json({ success: true, data: updated });
  } catch (e: any) {
    return json({ success: false, message: e?.message || "Server error" }, 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const me = await requireAdmin();
    const id = new URL(req.url).searchParams.get("id");
    if (!id) {
      return json({ success: false, message: "ID requerido" }, 400);
    }

    const sub = await store.getAdminById(id);
    if (!sub) {
      return json({ success: false, message: "Sub-manager no encontrado" }, 404);
    }

    const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "spectralx@gmail.com";
    const isSuperAdmin = me.email.toLowerCase() === bootstrapEmail.toLowerCase();

    if (!isSuperAdmin && sub.created_by !== me.id) {
      return json({ success: false, message: "Acción no permitida" }, 403);
    }

    await store.deleteAdmin(id);
    return json({ success: true, message: "Sub-manager eliminado con éxito" });
  } catch (e: any) {
    return json({ success: false, message: e?.message || "Server error" }, 500);
  }
}
