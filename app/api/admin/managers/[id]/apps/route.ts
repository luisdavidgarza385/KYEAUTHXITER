import { NextRequest } from "next/server";
import { requireAdmin, safeRoute } from "@/lib/api-helpers";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  return safeRoute(async () => {
    const me = await requireAdmin();
    if (me.role !== "admin" && me.id !== params.id) {
      return { status: 403, data: { success: false, message: "Forbidden" } };
    }
    const target = await store.getAdminById(params.id);
    if (!target) return { status: 404, data: { success: false, message: "Not found" } };
    const apps = await store.listApps({ sellerId: target.id });
    return { data: { success: true, data: { manager: { id: target.id, email: target.email, role: target.role }, apps } } };
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return safeRoute(async () => {
    const me = await requireAdmin();
    if (me.role !== "admin") {
      return { status: 403, data: { success: false, message: "Only admins can assign apps" } };
    }
    const target = await store.getAdminById(params.id);
    if (!target) return { status: 404, data: { success: false, message: "Not found" } };
    if (target.role !== "seller") {
      return { status: 400, data: { success: false, message: "Target is not a manager" } };
    }
    const body = await req.json().catch(() => ({}));
    const appIds: string[] = Array.isArray(body?.appIds) ? body.appIds : [];

    const allApps = await store.listApps();
    const validIds = new Set(allApps.map((a) => a.id));
    for (const id of appIds) {
      if (!validIds.has(id)) {
        return { status: 400, data: { success: false, message: `Invalid app id: ${id}` } };
      }
      await store.updateApp(id, { ...(await store.getAppById(id))!, seller_id: target.id });
    }

    const assigned = new Set(appIds);
    for (const a of allApps) {
      if (a.seller_id === target.id && !assigned.has(a.id)) {
        await store.updateApp(a.id, { ...a, seller_id: null });
      }
    }
    return { data: { success: true } };
  });
}
