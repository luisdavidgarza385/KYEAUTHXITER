import { requireAdmin, getScopedAppIds } from "@/lib/auth";
import { store } from "@/lib/store";
import { ManageAppsClient, AppItemData } from "@/components/ManageAppsClient";

export const dynamic = "force-dynamic";

export default async function ManageAppsPage() {
  const admin = await requireAdmin();
  const scopedIds = await getScopedAppIds(admin);
  let allApps = await store.listApps();

  // If no apps exist yet in the database, seed with the known application names
  if (!allApps || allApps.length === 0) {
    const defaultAppNames = [
      "9999",
      "LUMINOX Bypass",
      "LUMINOX Elite",
      "AIMKKILL",
      "FORIUS XIT",
      "LUMINOX BASICO",
      "LUMINOX Complex",
      "LUMINOX PRO",
      "LOUDER",
      "DarkSide",
      "dashboard",
      "NEW",
    ];

    for (const name of defaultAppNames) {
      try {
        await store.createApp({
          owner_id: admin.id,
          name,
          app_id: name === "9999" ? "9999" : Math.random().toString(36).slice(2, 12).toUpperCase(),
          owner_secret: "0FY7WpdIue",
          app_secret: "7f40bd3c9ffd860495dff6676f8ecd45c08e8b183a23d09db78a3fde27cddd4f",
          version: "1.0",
          download_link: null,
          webhook_url: null,
          status: "active",
          seller_id: null,
          level: 1,
        });
      } catch {}
    }
    allApps = await store.listApps();
  }

  // Filter apps according to permissions
  const visibleApps =
    scopedIds === null
      ? allApps
      : allApps.filter((a) => scopedIds.includes(a.id) || a.owner_id === admin.id);

  // Fetch licenses and users count for each app
  const allLicenses = await store.listLicenses();
  const allUsers = await store.listAppUsers();
  const allSubs = await store.listSubscriptions();

  const formattedApps: AppItemData[] = visibleApps.map((a) => {
    const appLicenses = allLicenses.filter(
      (l) => l.app_id === a.id || (l as any).appId === a.id || l.app_id === a.name || (l as any).appId === a.name
    );
    const appUsers = allUsers.filter(
      (u) => u.app_id === a.id || (u as any).appId === a.id || u.app_id === a.name || (u as any).appId === a.name
    );
    const appSubs = allSubs.filter(
      (s) => s.app_id === a.id || (s as any).appId === a.id || s.app_id === a.name || (s as any).appId === a.name
    );

    return {
      id: a.id,
      name: a.name,
      description: "App SecureX Auth",
      ownerId: a.owner_secret || "0FY7WpdIue",
      secret: a.app_secret || "7f40bd3c9ffd860495dff6676f8ecd45c08e8b183a23d09db78a3fde27cddd4f",
      version: a.version || "1.0",
      downloadUrl: a.download_link || "",
      status: a.status === "paused" ? "paused" : "active",
      users: appUsers.length,
      licenses: appLicenses.length,
      subscriptions: appSubs.length > 0 ? appSubs.length : 1,
      hwidLock: true,
      maxResets: 20,
      hwidMismatchMsg: "HWID doesn't match. Ask for a HWID reset",
    };
  });

  return <ManageAppsClient initialApps={formattedApps} />;
}
