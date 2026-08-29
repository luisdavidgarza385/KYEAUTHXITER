import { NextRequest } from "next/server";
import { requireAdmin, safeRoute } from "@/lib/api-helpers";
import { store } from "@/lib/store";
import { getScopedAppIds } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return safeRoute(async () => {
    const me = await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const mode = String(body?.mode || "");
    const appId = body?.appId ? String(body.appId) : undefined;

    if (!["all", "unused", "used", "banned"].includes(mode)) {
      return { status: 400, data: { success: false, message: "Invalid mode" } };
    }

    const scopedIds = await getScopedAppIds(me);
    if (scopedIds !== null) {
      if (appId && !scopedIds.includes(appId)) {
        return { status: 403, data: { success: false, message: "Forbidden" } };
      }
    }

    const all = await store.listLicenses({ appId, limit: 5000 });
    let toDelete = scopedIds
      ? all.filter((l) => scopedIds.includes(l.app_id))
      : all;
    if (me.role === "seller") {
      toDelete = toDelete.filter((l) => l.created_by === me.id);
    }
    const filtered = toDelete.filter((l) => {
      if (mode === "all") return true;
      return l.status === mode;
    });

    for (const l of filtered) {
      await store.deleteLicense(l.id);
    }
    return { data: { success: true, data: { deleted: filtered.length } } };
  });
}
