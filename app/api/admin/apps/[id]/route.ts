import { NextRequest, NextResponse } from "next/server";
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
    const app = await store.getAppById(params.id);
    if (!app) return { status: 404, data: { success: false, message: "App not found" } };
    if (!(await canAccessApp(me, params.id))) {
      return { status: 403, data: { success: false, message: "Forbidden" } };
    }

    const body = await req.json().catch(() => ({}));
    const updates: any = { ...app };
    if (typeof body.name === "string" && body.name.trim()) updates.name = body.name.trim();
    if (typeof body.version === "string") updates.version = body.version;
    if (typeof body.status === "string" && ["active", "paused", "banned"].includes(body.status))
      updates.status = body.status;
    if (typeof body.download_link === "string") updates.download_link = body.download_link || null;
    if (typeof body.webhook_url === "string") updates.webhook_url = body.webhook_url || null;

    if (updates.name !== app.name) {
      const exists = await store.getAppByName(updates.name);
      if (exists) return { status: 409, data: { success: false, message: "Name already taken" } };
    }

    const updated = await store.updateApp(params.id, updates);
    return { data: { success: true, data: updated } };
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  return safeRoute(async () => {
    const me = await requireAdmin();
    const app = await store.getAppById(params.id);
    if (!app) return { status: 404, data: { success: false, message: "App not found" } };
    
    if (!(await canAccessApp(me, params.id))) {
      return { status: 403, data: { success: false, message: "Forbidden" } };
    }
    
    await store.deleteApp(params.id);
    return { data: { success: true } };
  });
}
