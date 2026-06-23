"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Search, ChevronDown, LogOut, User as UserIcon, Settings, Loader2 } from "lucide-react";

export function DashboardHeader({ email, role, apps }: { email: string; role: string; apps: { id: string; name: string }[] }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [logsList, setLogsList] = useState<any[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function toggleNotif() {
    const nextState = !notifOpen;
    setNotifOpen(nextState);
    if (nextState) {
      setHasUnread(false);
      setLoadingNotifs(true);
      try {
        const res = await fetch("/api/admin/logs?limit=5");
        const data = await res.json();
        if (res.ok && data.success) {
          setLogsList(data.data || []);
        }
      } catch (err) {
        console.error("Error loading notifications:", err);
      } finally {
        setLoadingNotifs(false);
      }
    }
  }

  const getAppName = (appId: string | null) => apps.find((a) => a.id === appId)?.name || "Sistema";

  const initials = (email || "?").slice(0, 2).toUpperCase();
  const roleLabel = role === "developer" ? "Developer" : role === "admin" ? "Administrator" : "Manager";

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="h-14 border-b border-border bg-bg-secondary/40 backdrop-blur-md flex items-center px-6 gap-4 sticky top-0 z-20">
      <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-md overflow-hidden ring-1 ring-accent/30">
          <img src="/logo.png" alt="Spectral X" className="w-full h-full object-cover" />
        </div>
        <span className="font-bold text-sm tracking-wide bg-gradient-to-r from-text to-text-muted bg-clip-text">Spectral X</span>
      </Link>

      <div className="flex-1 max-w-md mx-auto relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim pointer-events-none" />
        <input
          type="text"
          placeholder="Search anything..."
          className="w-full bg-bg/50 border border-border rounded-md pl-9 pr-16 py-1.5 text-sm placeholder:text-text-dim focus:outline-none focus:border-accent/40 focus:bg-bg/80 transition"
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 text-[10px] text-text-dim font-mono bg-bg-secondary border border-border rounded px-1.5 py-0.5">
          Ctrl + K
        </kbd>
      </div>

      <div className="relative" ref={notifRef}>
        <button
          onClick={toggleNotif}
          className="relative p-2 rounded-md hover:bg-bg-hover text-text-muted hover:text-text transition"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {hasUnread && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>
        {notifOpen && (
          <div className="absolute right-0 top-full mt-1.5 z-30 w-80 rounded-md border border-border bg-bg-card shadow-2xl overflow-hidden text-left">
            <div className="px-4 py-2.5 border-b border-border bg-bg-secondary/40 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Eventos recientes</span>
              <span className="text-[9px] bg-accent/10 border border-accent/20 text-accent-glow px-1.5 py-0.5 rounded font-mono">Real-time</span>
            </div>
            <div className="max-h-[300px] overflow-y-auto divide-y divide-border/60">
              {loadingNotifs ? (
                <div className="p-6 text-center text-xs text-text-dim flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-glow" />
                  Cargando eventos...
                </div>
              ) : logsList.length === 0 ? (
                <div className="p-8 text-center text-xs text-text-dim">
                  No hay eventos recientes
                </div>
              ) : (
                logsList.map((log) => {
                  const isBroadcast = log.message.startsWith("[Broadcast] ");
                  const cleanMessage = isBroadcast ? log.message.replace("[Broadcast] ", "") : log.message;
                  const displayAppName = isBroadcast ? "Administrador" : getAppName(log.app_id);
                  const displayLevel = isBroadcast ? "Anuncio" : log.level;

                  return (
                    <div key={log.id} className="p-3 hover:bg-bg-hover/30 transition text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          isBroadcast
                            ? "bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 shadow-sm"
                            : log.level === "error" ? "badge-danger" :
                              log.level === "warn" ? "badge-warning" :
                              log.level === "debug" ? "badge-accent" : "badge-success"
                        }`}>
                          {displayLevel}
                        </span>
                        <span className="text-[10px] text-text-dim truncate font-medium">
                          {displayAppName}
                        </span>
                      </div>
                      <p className="font-mono text-[11px] text-text-muted break-all line-clamp-2">{cleanMessage}</p>
                      <span className="text-[9px] text-text-dim block mt-1">
                        {new Date(log.created_at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
            <Link 
              href="/dashboard/logs" 
              onClick={() => setNotifOpen(false)}
              className="block text-center py-2 border-t border-border text-[11px] font-semibold text-accent-glow hover:text-accent bg-bg-secondary/20 hover:bg-bg-hover transition"
            >
              Ver todos los logs
            </Link>
          </div>
        )}
      </div>

      <div className="relative" ref={ref}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2.5 pl-1.5 pr-2 py-1 rounded-md hover:bg-bg-hover transition"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-blue-600 text-white text-xs font-bold flex items-center justify-center">
            {initials}
          </div>
          <div className="text-left hidden md:block">
            <div className="text-[13px] font-medium leading-tight">{email}</div>
            <div className="text-[10px] text-text-dim leading-tight">{roleLabel}</div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-text-dim" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1.5 z-30 min-w-[200px] rounded-md border border-border bg-bg-card shadow-2xl overflow-hidden">
            <div className="px-3 py-2.5 border-b border-border">
              <div className="text-[13px] font-medium truncate">{email}</div>
              <div className="text-[10px] text-text-dim uppercase tracking-wider">{roleLabel}</div>
            </div>
            <Link href="/dashboard/profile" className="flex items-center gap-2 px-3 py-2 text-[13px] text-text-muted hover:bg-bg-hover hover:text-text">
              <UserIcon className="w-3.5 h-3.5" /> Profile
            </Link>
            <Link href="/dashboard/settings" className="flex items-center gap-2 px-3 py-2 text-[13px] text-text-muted hover:bg-bg-hover hover:text-text">
              <Settings className="w-3.5 h-3.5" /> Settings
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-text-muted hover:bg-danger/10 hover:text-danger border-t border-border"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
