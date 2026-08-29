import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin, safeRoute } from "@/lib/api-helpers";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return safeRoute(async () => {
    const me = await requireAdmin();
    if (me.role !== "admin" && me.role !== "developer") {
      return { status: 403, data: { success: false, message: "Only admins/developers can edit managers" } };
    }
    const target = await store.getAdminById(params.id);
    if (!target) {
      return { status: 404, data: { success: false, message: "Manager not found" } };
    }
    const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "spectralx@gmail.com";
    const isSuperAdmin = me.email === bootstrapEmail;
    if (!isSuperAdmin && target.created_by !== me.id) {
      return { status: 403, data: { success: false, message: "Forbidden" } };
    }
    const body = await req.json().catch(() => ({}));
    const updates: any = { ...target };
    if (typeof body.email === "string" && body.email.trim() && body.email.includes("@")) {
      updates.email = body.email.trim().toLowerCase();
    }
    if (typeof body.password === "string" && body.password.length >= 6) {
      updates.password_hash = await bcrypt.hash(body.password, 10);
    }
    if (body.role && ["admin", "seller"].includes(body.role)) {
      updates.role = body.role;
    }
    await store.updateAdmin(target.id, updates);
    return { data: { success: true, data: { id: target.id, email: updates.email, role: updates.role } } };
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  return safeRoute(async () => {
    const me = await requireAdmin();
    if (me.role !== "admin" && me.role !== "developer") {
      return { status: 403, data: { success: false, message: "Only admins/developers can delete managers" } };
    }
    const target = await store.getAdminById(params.id);
    if (!target) {
      return { status: 404, data: { success: false, message: "Manager not found" } };
    }
    const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "spectralx@gmail.com";
    const isSuperAdmin = me.email === bootstrapEmail;
    if (!isSuperAdmin && target.created_by !== me.id) {
      return { status: 403, data: { success: false, message: "Forbidden" } };
    }
    if (target.id === me.id) {
      return { status: 400, data: { success: false, message: "Cannot delete yourself" } };
    }
    if (target.role === "admin") {
      const all = await store.listAdmins();
      const adminCount = all.filter((a) => a.role === "admin").length;
      if (adminCount <= 1) {
        return { status: 400, data: { success: false, message: "Cannot delete the last admin" } };
      }
    }
    await store.deleteAdmin(target.id);
    return { data: { success: true } };
  });
}
