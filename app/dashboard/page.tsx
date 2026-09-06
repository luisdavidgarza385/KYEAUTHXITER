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

  const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "spectralx@gmail.com";
  const isSuperAdmin = me.email.toLowerCase() === bootstrapEmail.toLowerCase();
  const apps = (isSuperAdmin || me.role === "admin")
    ? allApps.filter((a) => a.owner_id === me.id || !a.owner_id || a.owner_id === "0FY7WpdIue" || a.owner_id === "Nf6SZ77yo1DBPmLl77qhf6WwaTOyCDE9")
    : allApps.filter((a) => (scopedIds && scopedIds.includes(a.id)) || a.owner_id === me.id);
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
