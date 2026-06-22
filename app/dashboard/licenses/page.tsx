import { store } from "@/lib/store";
import { requireAdmin, getScopedAppIds } from "@/lib/auth";
import { LicensesPageClient } from "@/components/LicensesPageClient";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function LicensesPage({
  searchParams,
}: {
  searchParams: { app?: string; status?: string };
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

  // Fetch all licenses so they can be filtered client-side instantly
  const licenses = await store.listLicenses({
    limit: 10000,
  });
  
  const filteredLicenses = me.role === "seller"
    ? licenses.filter((l) => l.created_by === me.id)
    : (scopedIds === null ? licenses : licenses.filter((l) => scopedIds.includes(l.app_id)));

  const admins = await store.listAdmins();
  const adminsById: Record<string, string> = {};
  admins.forEach((a) => {
    adminsById[a.id] = a.email.split("@")[0];
  });

  const fullAdmin = await store.getAdminById(me.id);

  return (
    <LicensesPageClient
      initialLicenses={filteredLicenses}
      apps={apps}
      defaultAppId={activeAppId}
      adminsById={adminsById}
      role={me.role}
      subscriptionEnd={fullAdmin?.subscription_end || null}
      hasPrefixPerm={fullAdmin?.permissions?.includes("prefix") || false}
    />
  );
}
