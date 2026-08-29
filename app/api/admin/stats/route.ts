import { NextRequest } from "next/server";
import { requireAdmin, getScopedAppIds } from "@/lib/auth";
import { store } from "@/lib/store";
import { safeRoute } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return safeRoute(async () => {
    const me = await requireAdmin();
    const scopedIds = await getScopedAppIds(me);

    const [allApps, allLicenses, allUsers, allAdmins] = await Promise.all([
      store.listApps(),
      store.listLicenses({ limit: 10000 }),
      store.listAppUsers({ limit: 10000 }),
      store.listAdmins(),
    ]);

    const apps = scopedIds === null ? allApps : allApps.filter((a) => scopedIds.includes(a.id));
    const subResellers = allAdmins.filter((a) => a.created_by === me.id);
    const subResellerIds = subResellers.map((sr) => sr.id);

    // Get active sessions
    const sessionsLists = await Promise.all(
      apps.map((app) => store.listSessionsForApp(app.id, 10000))
    );
    const onlineUsersCount = sessionsLists.reduce((acc, list) => acc + list.length, 0);

    // Get total registered users
    const myLicenses = allLicenses.filter((l) => l.created_by === me.id);
    const subLicenses = allLicenses.filter((l) => l.created_by && subResellerIds.includes(l.created_by));
    
    const myLicenseUserIds = myLicenses.filter((l) => l.used_by).map((l) => l.used_by);
    const subLicenseUserIds = subLicenses.filter((l) => l.used_by).map((l) => l.used_by);
    
    const activeUsers = allUsers.filter((u) => myLicenseUserIds.includes(u.id) || subLicenseUserIds.includes(u.id));
    const activeUsersCount = activeUsers.length;

    return {
      data: {
        success: true,
        onlineUsersCount,
        activeUsersCount,
      }
    };
  });
}
