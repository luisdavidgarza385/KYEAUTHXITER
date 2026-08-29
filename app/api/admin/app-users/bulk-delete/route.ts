import { NextRequest } from "next/server";
import { requireAdmin, safeRoute } from "@/lib/api-helpers";
import { store } from "@/lib/store";
import { getScopedAppIds } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return safeRoute(async () => {
    const me = await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const mode = String(body?.mode || "all");
    const appId = body?.appId ? String(body.appId) : undefined;

    if (!["all", "banned"].includes(mode)) {
      return { status: 400, data: { success: false, message: "Invalid mode" } };
    }

    const scopedIds = await getScopedAppIds(me);
    if (scopedIds !== null) {
      if (appId && !scopedIds.includes(appId)) {
        return { status: 403, data: { success: false, message: "Forbidden" } };
      }
    }

    // List all users
    const allUsers = await store.listAppUsers({ appId, limit: 10000 });
    
    // Filter users scoped to the admin/developer apps
    let toDelete = scopedIds
      ? allUsers.filter((u) => scopedIds.includes(u.app_id))
      : allUsers;

    // If seller, they can only delete users who used one of their licenses
    if (me.role === "seller") {
      const licenses = await store.listLicenses({ appId, limit: 10000 });
      const sellerUsedUserIds = new Set(
        licenses.filter((l) => l.created_by === me.id && l.used_by).map((l) => l.used_by)
      );
      toDelete = toDelete.filter((u) => sellerUsedUserIds.has(u.id));
    }

    // Filter by mode
    const filtered = toDelete.filter((u) => {
      if (mode === "all") return true;
      if (mode === "banned") return u.banned;
      return false;
    });

    for (const u of filtered) {
      await store.deleteAppUser(u.id);
    }

    return { data: { success: true, data: { deleted: filtered.length } } };
  });
}
