import { Sidebar } from "@/components/Sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { requireAdmin, getScopedAppIds } from "@/lib/auth";
import { store } from "@/lib/store";

import { GlobalBroadcastNotifier } from "@/components/GlobalBroadcastNotifier";
import { GlobalMusicPlayer } from "@/components/GlobalMusicPlayer";
import { GlobalCommandPalette } from "@/components/GlobalCommandPalette";
import { CyberParticlesBackground } from "@/components/CyberParticlesBackground";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin();
  const scopedIds = await getScopedAppIds(me);
  const allApps = await store.listApps();
  const apps = scopedIds === null ? allApps : allApps.filter((a) => scopedIds.includes(a.id));
  const fullAdmin = await store.getAdminById(me.id);
  const isSubReseller = me.role === "seller" && !!fullAdmin?.created_by;

  return (
    <div className="theme-vyper flex min-h-screen bg-[#01040a] text-text relative overflow-hidden">
      {/* Cyber Animated Particles Background */}
      <CyberParticlesBackground />
      <video
        autoPlay
        loop
        muted
        playsInline
        className="pointer-events-none fixed inset-0 z-0 h-full w-full object-cover opacity-20"
      >
        <source src="/tunnel.mp4" type="video/mp4" />
      </video>
      <GlobalBroadcastNotifier currentUserEmail={me.email} />
      <GlobalMusicPlayer />
      <GlobalCommandPalette />
      <Sidebar role={me.role} email={me.email} isSubReseller={isSubReseller} subscriptionEnd={fullAdmin?.subscription_end || null} />
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <DashboardHeader email={me.email} role={me.role} apps={apps} />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
