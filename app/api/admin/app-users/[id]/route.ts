import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin, safeRoute } from "@/lib/api-helpers";
import { store } from "@/lib/store";
import { canAccessApp } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return safeRoute(async () => {
    const me = await requireAdmin();
    const existing = await store.getAppUserById(params.id);
    if (!existing) return { status: 404, data: { success: false, message: "User not found" } };
    if (!(await canAccessApp(me, existing.app_id))) {
      return { status: 403, data: { success: false, message: "Forbidden" } };
    }

    const body = await req.json().catch(() => ({}));
    const update: any = {};

    if (typeof body?.banned === "boolean") {
      update.banned = body.banned;
      if (!body.banned) update.ban_reason = null;
      if (body.banned && body.banReason) update.ban_reason = String(body.banReason);
    }
    if (body?.resetHwid === true) {
      update.hwid = null;
    }
    if (body?.password) {
      const pw = String(body.password);
      if (pw.length < 1) return { status: 400, data: { success: false, message: "Password must be at least 1 character" } };
      update.password_hash = await bcrypt.hash(pw, 10);
    }
    if (body?.email !== undefined) {
      update.email = body.email ? String(body.email) : null;
    }
    if (typeof body?.balance === "number") {
      update.balance = body.balance;
    }
    if (typeof body?.paused === "boolean") {
      if (body.paused) {
        update.hwid = "PAUSED";
      } else if (existing.hwid === "PAUSED") {
        update.hwid = null;
      }
    }

    const updated = await store.updateAppUser(params.id, update);
    return { data: { success: true, data: updated } };
  });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return safeRoute(async () => {
    const me = await requireAdmin();
    const existing = await store.getAppUserById(params.id);
    if (!existing) return { status: 404, data: { success: false, message: "User not found" } };
    if (!(await canAccessApp(me, existing.app_id))) {
      return { status: 403, data: { success: false, message: "Forbidden" } };
    }
    await store.deleteAppUser(params.id);
    return { data: { success: true } };
  });
}
