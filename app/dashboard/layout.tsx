import { Sidebar } from "@/components/Sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { requireAdmin } from "@/lib/auth";
import { store } from "@/lib/store";
import { ParticlesBackground } from "@/components/ParticlesBackground";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin();
  const allApps = await store.listApps();
  const fullAdmin = await store.getAdminById(me.id);
  const isSubReseller = me.role === "seller" && !!fullAdmin?.created_by;

  return (
    <div className="theme-vyper flex min-h-screen bg-bg text-text relative overflow-hidden">
      <ParticlesBackground />
      <Sidebar role={me.role} email={me.email} isSubReseller={isSubReseller} />
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <DashboardHeader email={me.email} role={me.role} apps={allApps} />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
