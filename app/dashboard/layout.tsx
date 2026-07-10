import { Sidebar } from "@/components/Sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { requireAdmin, getScopedAppIds } from "@/lib/auth";
import { store } from "@/lib/store";
import { ParticlesBackground } from "@/components/ParticlesBackground";
import { GlobalBroadcastNotifier } from "@/components/GlobalBroadcastNotifier";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin();
  const scopedIds = await getScopedAppIds(me);
  const allApps = await store.listApps();
  const apps = scopedIds === null ? allApps : allApps.filter((a) => scopedIds.includes(a.id));
  const fullAdmin = await store.getAdminById(me.id);
  const isSubReseller = me.role === "seller" && !!fullAdmin?.created_by;

  return (
    <div className="theme-vyper flex min-h-screen bg-transparent text-text relative overflow-hidden">
      <ParticlesBackground />
      <GlobalBroadcastNotifier currentUserEmail={me.email} />
      <Sidebar role={me.role} email={me.email} isSubReseller={isSubReseller} />
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <DashboardHeader email={me.email} role={me.role} apps={apps} />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
