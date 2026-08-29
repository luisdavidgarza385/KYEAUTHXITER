import { requireAdmin, getScopedAppIds } from "@/lib/auth";
import { store } from "@/lib/store";
import { ManageAppsClient, AppItemData } from "@/components/ManageAppsClient";

export const dynamic = "force-dynamic";

export default async function ManageAppsPage() {
  const admin = await requireAdmin();
  const scopedIds = await getScopedAppIds(admin);
  let allApps = await store.listApps().catch(() => []);

  // Filter apps according to permissions
  const visibleApps =
    scopedIds === null
      ? allApps
      : allApps.filter((a) => scopedIds.includes(a.id) || a.owner_id === admin.id);

  // Fetch licenses and users count for each app safely
  const allLicenses = await store.listLicenses().catch(() => []);
  const allUsers = await store.listAppUsers().catch(() => []);

  const formattedApps: AppItemData[] = visibleApps.map((a) => {
    const appLicenses = allLicenses.filter(
      (l) => l.app_id === a.id || (l as any).appId === a.id || l.app_id === a.name || (l as any).appId === a.name
    );
    const appUsers = allUsers.filter(
      (u) => u.app_id === a.id || (u as any).appId === a.id || u.app_id === a.name || (u as any).appId === a.name
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
      subscriptions: 1,
      hwidLock: true,
      maxResets: 20,
      hwidMismatchMsg: "HWID doesn't match. Ask for a HWID reset",
    };
  });

  return <ManageAppsClient initialApps={formattedApps} />;
}
