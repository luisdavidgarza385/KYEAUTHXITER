import { NextRequest } from "next/server";
import { requireAdmin, safeRoute } from "@/lib/api-helpers";
import { store } from "@/lib/store";
import { canAccessApp } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return safeRoute(async () => {
    const me = await requireAdmin();
    const existing = await store.getLicenseById(params.id);
    if (!existing) return { status: 404, data: { success: false, message: "License not found" } };
    if (!(await canAccessApp(me, existing.app_id))) {
      return { status: 403, data: { success: false, message: "Forbidden" } };
    }

    const body = await req.json().catch(() => ({}));
    const update: any = {};

    if (typeof body?.status === "string") {
      const s = body.status;
      if (["unused", "used", "banned", "paused"].includes(s)) update.status = s;
    }
    if (body?.resetHwid === true) {
      update.hwid_lock = false;
    }
    if (body?.note !== undefined) {
      update.note = String(body.note);
    }

    const updated = await store.updateLicense(params.id, update);
    if (!updated) return { status: 404, data: { success: false, message: "License not found" } };
    return { data: { success: true, data: updated } };
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  return safeRoute(async () => {
    const me = await requireAdmin();
    const existing = await store.getLicenseById(params.id);
    if (!existing) return { status: 404, data: { success: false, message: "License not found" } };
    if (!(await canAccessApp(me, existing.app_id))) {
      return { status: 403, data: { success: false, message: "Forbidden" } };
    }
    await store.deleteLicense(params.id);
    return { data: { success: true } };
  });
}
