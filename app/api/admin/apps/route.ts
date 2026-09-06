import { NextRequest } from "next/server";
import { json, requireAdmin, safeRoute } from "@/lib/api-helpers";
import { store } from "@/lib/store";
import { generateId } from "@/lib/utils";
import { getScopedAppIds } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return safeRoute(async () => {
    const admin = await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const name = String(body?.name || "").trim();
    const version = String(body?.version || "1.0").trim() || "1.0";
    const level = Math.max(1, parseInt(body?.level) || 1);
    if (!name) return { status: 400, data: { success: false, message: "name required" } };

    const existing = await store.getAppByName(name);
    if (existing) return { status: 409, data: { success: false, message: "Application name already exists" } };

    // Free plan: max 3 apps for non-superadmin users, except managers with create_apps permission
    const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "spectralx@gmail.com";
    const isSuperAdmin = admin.email.toLowerCase() === bootstrapEmail.toLowerCase();
    if (!isSuperAdmin && admin.role !== "developer") {
      const adminData = await store.getAdminById(admin.id);
      const canCreateUnlimited =
        adminData?.can_create_apps === true ||
        adminData?.permissions?.includes("create_apps") ||
        (adminData?.role === "manager" && adminData?.can_create_apps !== false) ||
        (Array.isArray(adminData?.subscriptions) && (adminData?.subscriptions?.length ?? 0) > 0);

      if (!canCreateUnlimited) {
        const allApps = await store.listApps();
        const myApps = allApps.filter((a) => a.owner_id === admin.id);
        if (myApps.length >= 3) {
          return {
            status: 403,
            data: {
              success: false,
              message: "Has alcanzado el límite del Plan Gratuito (máximo 3 aplicaciones). Actualiza a un Plan VIP para crear aplicaciones ilimitadas.",
            },
          };
        }
      }
    }

    const app = await store.createApp({
      owner_id: admin.id,
      name,
      app_id: generateId(32),
      owner_secret: generateId(48),
      app_secret: generateId(48),
      version,
      download_link: null,
      webhook_url: null,
      status: "active",
      seller_id: null,
      level,
    });
    return { data: { success: true, data: app } };
  });
}

export async function GET(req: NextRequest) {
  return safeRoute(async () => {
    const admin = await requireAdmin();
    const allApps = await store.listApps();
    const scopedIds = await getScopedAppIds(admin);
    const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "spectralx@gmail.com";
    const isSuperAdmin = admin.email.toLowerCase() === bootstrapEmail.toLowerCase();
    
    // Each user strictly sees ONLY their own apps. SuperAdmin sees only admin's apps, NOT manager-created apps!
    const filtered = (isSuperAdmin || admin.role === "admin")
      ? allApps.filter((a) => a.owner_id === admin.id || !a.owner_id || a.owner_id === "0FY7WpdIue" || a.owner_id === "Nf6SZ77yo1DBPmLl77qhf6WwaTOyCDE9")
      : allApps.filter(
          (a) => a.owner_id === admin.id || a.seller_id === admin.id || (scopedIds && scopedIds.includes(a.id))
        );
    
    return { data: { success: true, data: filtered } };
  });
}
