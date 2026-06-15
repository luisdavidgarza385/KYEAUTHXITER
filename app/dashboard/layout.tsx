import { Sidebar } from "@/components/Sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { requireAdmin } from "@/lib/auth";
import { store } from "@/lib/store";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin();
  const allApps = await store.listApps();
  return (
    <div className="theme-vyper flex min-h-screen bg-bg text-text">
      <Sidebar role={me.role} email={me.email} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader email={me.email} role={me.role} apps={allApps} />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
