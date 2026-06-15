import { store } from "@/lib/store";
import { requireAdmin, getScopedAppIds } from "@/lib/auth";
import { UsersPageClient } from "@/components/UsersPageClient";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { app?: string; banned?: string };
}) {
  const me = await requireAdmin();
  const scopedIds = await getScopedAppIds(me);
  const allApps = await store.listApps();
  const apps = scopedIds === null ? allApps : allApps.filter((a) => scopedIds.includes(a.id));
  const cookieStore = await cookies();
  const cookieApp = cookieStore.get("ka_current_app")?.value;

  let activeAppId = searchParams.app || cookieApp || "";
  if (!activeAppId && apps.length > 0) activeAppId = apps[0].id;
  if (activeAppId && !apps.find((a) => a.id === activeAppId)) activeAppId = apps[0]?.id || "";

  const users = await store.listAppUsers({
    limit: 10000,
  });
  
  const filteredUsers = scopedIds === null ? users : users.filter((u) => scopedIds.includes(u.app_id));
  const licenses = await store.listLicenses({ limit: 10000 });

  const usersWithLevel = filteredUsers.map(u => {
    const userLics = licenses.filter(l => l.used_by === u.id && l.status === "used" && (!l.expires_at || new Date(l.expires_at) > new Date()));
    const maxLvl = userLics.length > 0 ? Math.max(...userLics.map(l => l.level || 1)) : 1;
    return {
      ...u,
      level: maxLvl
    };
  });

  return (
    <UsersPageClient
      initialUsers={usersWithLevel}
      apps={apps}
      defaultAppId={activeAppId}
    />
  );
}
