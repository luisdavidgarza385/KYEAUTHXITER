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
    // Filter sub-resellers created by this user
    const subResellers = allAdmins.filter((a) => a.created_by === me.id);
    return json({ success: true, data: subResellers });
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

    // Deduct credits from parent if they are not developer/admin and they assign credits
    const parentAdmin = await store.getAdminById(me.id);
    if (!parentAdmin) {
      return json({ success: false, message: "Parent admin not found" }, 404);
    }

    const isUnlimited = parentAdmin.role === "developer" || parentAdmin.role === "admin";
    if (plan === "credits" && !isUnlimited) {
      const parentCredits = parentAdmin.credits || 0;
      if (parentCredits < credits) {
        return json({ success: false, message: `Créditos insuficientes (Tienes ${parentCredits})` }, 400);
      }
      // Deduct credits
      parentAdmin.credits = parentCredits - credits;
      await store.updateAdmin(parentAdmin.id, parentAdmin);
    }

    // Create the reseller
    const hash = await bcrypt.hash(password, 10);
    const subReseller = await store.createAdmin({
      email,
      password_hash: hash,
      role: "seller",
      created_by: me.id,
      credits: plan === "ilimitado" ? 0 : credits,
      status: "active",
      permissions,
      subscriptions,
    });

    return json({ success: true, data: subReseller });
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
      return json({ success: false, message: "Sub-reseller no encontrado" }, 404);
    }

    // Security: Only allow updating sub-resellers created by me
    if (sub.created_by !== me.id) {
      return json({ success: false, message: "Acción no permitida" }, 403);
    }

    const password = String(body?.password || "");
    const plan = String(body?.plan || "ilimitado");
    const credits = Math.max(0, parseInt(String(body?.credits || 0)) || 0);
    const permissions = Array.isArray(body?.permissions) ? body.permissions : [];
    const subscriptions = Array.isArray(body?.subscriptions) ? body.subscriptions : [];

    if (password && password.length < 5) {
      return json({ success: false, message: "La contraseña debe tener al menos 5 caracteres" }, 400);
    }

    // Credits validation/deduction logic for non-developer/non-admin parent
    const parentAdmin = await store.getAdminById(me.id);
    if (!parentAdmin) {
      return json({ success: false, message: "Parent admin not found" }, 404);
    }

    const isUnlimited = parentAdmin.role === "developer" || parentAdmin.role === "admin";
    if (plan === "credits" && !isUnlimited) {
      const parentCredits = parentAdmin.credits || 0;
      const originalCredits = sub.credits || 0;
      const creditDiff = credits - originalCredits;
      
      if (creditDiff > 0) {
        if (parentCredits < creditDiff) {
          return json({ success: false, message: `Créditos insuficientes (Necesitas ${creditDiff} más, tienes ${parentCredits})` }, 400);
        }
        parentAdmin.credits = parentCredits - creditDiff;
        await store.updateAdmin(parentAdmin.id, parentAdmin);
      } else if (creditDiff < 0) {
        parentAdmin.credits = parentCredits + Math.abs(creditDiff);
        await store.updateAdmin(parentAdmin.id, parentAdmin);
      }
    }

    if (password) {
      sub.password_hash = await bcrypt.hash(password, 10);
    }
    
    sub.credits = plan === "ilimitado" ? 0 : credits;
    sub.permissions = permissions;
    sub.subscriptions = subscriptions;

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
      return json({ success: false, message: "Sub-reseller no encontrado" }, 404);
    }

    // Security: Only allow deleting sub-resellers created by me
    if (sub.created_by !== me.id) {
      return json({ success: false, message: "Acción no permitida" }, 403);
    }

    await store.deleteAdmin(id);
    return json({ success: true, message: "Sub-reseller eliminado con éxito" });
  } catch (e: any) {
    return json({ success: false, message: e?.message || "Server error" }, 500);
  }
}
