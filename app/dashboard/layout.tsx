import { RealAuthXSidebar } from "@/components/RealAuthXSidebar";
import { RealAuthXHeader } from "@/components/RealAuthXHeader";
import { FloatingChatWidget } from "@/components/FloatingChatWidget";
import { requireAdmin, getScopedAppIds } from "@/lib/auth";
import { store } from "@/lib/store";
import { cookies } from "next/headers";
import { GlobalBroadcastNotifier } from "@/components/GlobalBroadcastNotifier";
import { GlobalMusicPlayer } from "@/components/GlobalMusicPlayer";
import { GlobalCommandPalette } from "@/components/GlobalCommandPalette";
import { ParticlesBackground } from "@/components/ParticlesBackground";
import { LanguageProvider } from "@/lib/i18n";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin();
  const scopedIds = await getScopedAppIds(me);
  const allApps = await store.listApps();
  const apps = scopedIds === null ? allApps : allApps.filter((a) => scopedIds.includes(a.id));

  // Determine current active application ID
  const cookieStore = cookies();
  const cookieApp = cookieStore.get("ka_current_app")?.value;
  const currentAppId = cookieApp || (apps.length > 0 ? apps[0].name || apps[0].id : "9999");

  return (
    <LanguageProvider>
      <div className="flex min-h-screen bg-[#020610] text-slate-100 relative overflow-hidden font-sans">
        {/* Background Particles Mesh */}
        <ParticlesBackground />

        <GlobalBroadcastNotifier currentUserEmail={me.email} />
        <GlobalMusicPlayer />
        <GlobalCommandPalette />
        
        {/* RealAuthX Sidebar */}
        <RealAuthXSidebar
          role={me.role}
          email={me.email}
          apps={apps.length > 0 ? apps.map((a) => ({ id: a.id, name: a.name })) : [{ id: "9999", name: "9999" }]}
          currentAppId={currentAppId}
        />

        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          {/* RealAuthX Top Header */}
          <RealAuthXHeader
            email={me.email}
            role={me.role}
            apps={apps.map((a) => ({ id: a.id, name: a.name }))}
            currentAppId={currentAppId}
          />

          <main className="flex-1 overflow-x-hidden p-4 sm:p-6 md:p-8 max-w-[1400px] w-full mx-auto">
            {children}
          </main>
        </div>

        {/* Floating Chat Widget */}
        <FloatingChatWidget />
      </div>
    </LanguageProvider>
  );
}
