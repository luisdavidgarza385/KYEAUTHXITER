import React from "react";
import { store } from "@/lib/store";
import { requireAdmin, getScopedAppIds } from "@/lib/auth";
import { cookies } from "next/headers";
import { DashboardPageClient } from "@/components/DashboardPageClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const me = await requireAdmin();
  const scopedIds = await getScopedAppIds(me);

  const [allApps, allLicenses, allUsers] = await Promise.all([
    store.listApps(),
    store.listLicenses({ limit: 1000 }),
    store.listAppUsers({ limit: 1000 }),
  ]);

  const apps = scopedIds === null ? allApps : allApps.filter((a) => scopedIds.includes(a.id));
  const cookieStore = cookies();
  const cookieApp = cookieStore.get("ka_current_app")?.value;
  const currentApp = apps.find((a) => a.id === cookieApp || a.name === cookieApp) || apps[0] || {
    id: "9999",
    name: "9999",
  };

  const appLicenses = allLicenses.filter((l) => l.app_id === currentApp.id);
  const appUsers = allUsers.filter((u) => u.app_id === currentApp.id);

  return (
    <DashboardPageClient
      currentApp={currentApp}
      appsCount={apps.length || 1}
      usersCount={appUsers.length}
      licensesCount={appLicenses.length}
      currentUserEmail={me.email}
    />
  );
}
