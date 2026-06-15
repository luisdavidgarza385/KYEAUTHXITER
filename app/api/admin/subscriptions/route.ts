import { NextRequest } from "next/server";
import { requireAdmin, safeRoute } from "@/lib/api-helpers";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return safeRoute(async () => {
    const me = await requireAdmin();
    if (me.role !== "developer" && me.role !== "admin") {
      return { status: 403, data: { success: false, message: "Only developers and admins can grant subscriptions" } };
    }

    const body = await req.json().catch(() => ({}));
    const adminId = String(body?.adminId || "");
    const appId = String(body?.appId || "") || null;
    const durationDays = Math.max(parseInt(String(body?.durationDays || 30)) || 30, 1);

    if (!adminId) return { status: 400, data: { success: false, message: "adminId required" } };

    const target = await store.getAdminById(adminId);
    if (!target) return { status: 404, data: { success: false, message: "Admin not found" } };

    const expiresAt = new Date(Date.now() + durationDays * 86400000).toISOString();

    await store.updateAdmin(adminId, {
      ...target,
      subscription_end: expiresAt,
      subscription_app_id: appId,
    });

    return { data: { success: true, message: `Subscription granted for ${durationDays} days` } };
  });
}

export async function GET(req: NextRequest) {
  return safeRoute(async () => {
    await requireAdmin();
    const admins = await store.listAdmins();
    return { data: { success: true, data: admins.map((a) => ({ id: a.id, email: a.email, role: a.role, subscription_end: a.subscription_end, subscription_app_id: a.subscription_app_id })) } };
  });
}

export async function DELETE(req: NextRequest) {
  return safeRoute(async () => {
    const me = await requireAdmin();
    if (me.role !== "developer" && me.role !== "admin") {
      return { status: 403, data: { success: false, message: "Forbidden" } };
    }
    const adminId = new URL(req.url).searchParams.get("adminId");
    if (!adminId) return { status: 400, data: { success: false, message: "adminId required" } };
    const target = await store.getAdminById(adminId);
    if (!target) return { status: 404, data: { success: false, message: "Admin not found" } };
    await store.updateAdmin(adminId, { ...target, subscription_end: null, subscription_app_id: null });
    return { data: { success: true } };
  });
}
