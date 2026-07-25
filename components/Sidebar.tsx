"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { TypewriterBrand } from "@/components/TypewriterBrand";
import {
  LayoutDashboard,
  Key,
  Users,
  Coins,
  Lock,
  Code,
  LogOut,
  Moon,
  Sun,
  Shield,
  Layers,
  Terminal,
  Settings,
  MessageSquare,
  Binary,
  Clock,
  AlertTriangle,
  X as XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  {
    label: "GENERAL",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
      { href: "/dashboard/apps", label: "Aplicaciones", icon: Shield, adminOnly: false },
      { href: "/dashboard/builder", label: "Builder", icon: Terminal, adminOnly: true },
    ],
  },
  {
    label: "HERRAMIENTAS",
    items: [
      { href: "/dashboard/hex-converter", label: "Convertidor Hex", icon: Binary, adminOnly: true },
    ],
  },
  {
    label: "GESTION",
    items: [
      { href: "/dashboard/licenses", label: "Licencias", icon: Key, adminOnly: false },
      { href: "/dashboard/users", label: "Usuarios", icon: Users, adminOnly: false },
      { href: "/dashboard/subscriptions", label: "Suscripciones", icon: Layers, adminOnly: true },
      { href: "/dashboard/sub-resellers", label: "Sub-resellers", icon: Layers, adminOnly: false },
      { href: "/dashboard/credits", label: "Créditos", icon: Coins, adminOnly: false },
      { href: "/dashboard/chat", label: "Chat Global", icon: MessageSquare, adminOnly: false },
    ],
  },
  {
    label: "CUENTA",
    items: [
      { href: "/dashboard/security", label: "Seguridad (2FA)", icon: Lock, adminOnly: false },
      { href: "/dashboard/api", label: "API", icon: Code, adminOnly: false },
      { href: "/dashboard/settings", label: "Configuración", icon: Settings, adminOnly: true },
    ],
  },
];

export function Sidebar({ role, email, isSubReseller = false, subscriptionEnd = null }: { role: "admin" | "seller" | "developer"; email: string; isSubReseller?: boolean; subscriptionEnd?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = role === "admin" || role === "developer";
  const [dark, setDark] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    const handleClose = () => setIsOpen(false);

    window.addEventListener("gx-toggle-sidebar", handleToggle);
    window.addEventListener("gx-close-sidebar", handleClose);

    const stored = localStorage.getItem("gx-theme");
    if (stored === "light") {
      setDark(false);
      document.documentElement.classList.add("light");
    }

    let rgbInterval: NodeJS.Timeout | null = null;
    let hueVal = 0;

    function applyRGB(r: string, hr: string, gr: string, hue?: string) {
      const d = document.documentElement;
      d.style.setProperty("--accent-rgb", r);
      d.style.setProperty("--accent-hover-rgb", hr);
      d.style.setProperty("--accent-glow-rgb", gr);
      if (hue) d.style.setProperty("--accent-h", hue);
    }

    function hslToRgb(h: number, s: number, l: number): string {
      s /= 100;
      l /= 100;
      const k = (n: number) => (n + h / 30) % 12;
      const a = s * Math.min(l, 1 - l);
      const f = (n: number) => {
        const y = Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
        return Math.round(255 * (l - a * y));
      };
      return `${f(0)} ${f(8)} ${f(4)}`;
    }

    function updateAccent() {
      if (rgbInterval) {
        clearInterval(rgbInterval);
        rgbInterval = null;
      }

      const isRgbMode = localStorage.getItem("gx-accent-rgb") === "true";
      if (isRgbMode) {
        rgbInterval = setInterval(() => {
          hueVal = (hueVal + 1.5) % 360; // Increments slightly faster for a nice fluid speed
          const r = hslToRgb(hueVal, 84, 60);
          const hr = hslToRgb(hueVal, 84, 50);
          const gr = hslToRgb(hueVal, 84, 70);
          applyRGB(r, hr, gr, String(hueVal));
        }, 30);
      } else {
        const stored = localStorage.getItem("gx-accent");
        if (stored) {
          const parts = stored.split(",");
          applyRGB(parts[1], parts[2], parts[0]);
        }
      }
    }

    updateAccent();
    window.addEventListener("gx-accent-change", updateAccent);

    return () => {
      if (rgbInterval) clearInterval(rgbInterval);
      window.removeEventListener("gx-accent-change", updateAccent);
      window.removeEventListener("gx-toggle-sidebar", handleToggle);
      window.removeEventListener("gx-close-sidebar", handleClose);
    };
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.remove("light");
      localStorage.setItem("gx-theme", "dark");
    } else {
      document.documentElement.classList.add("light");
      localStorage.setItem("gx-theme", "light");
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  // Extract clean username (e.g. xDavid for xdavid@example.com or xdavid)
  const username = email.includes("@") ? email.split("@")[0] : email;
  const capitalizedUsername = username.charAt(0).toUpperCase() + username.slice(1);

  return (
    <>
      {/* Backdrop overlay on mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 w-64 border-r border-sky-500/20 bg-gradient-to-b from-[#030914] via-[#020610] to-[#010307] flex flex-col h-screen text-text transition-transform duration-300 lg:translate-x-0 lg:shrink-0 shadow-2xl shadow-sky-950/50 backdrop-blur-xl",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Mobile close button */}
        <div className="lg:hidden absolute top-4 right-4 z-50">
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 transition"
            aria-label="Cerrar menú"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex items-center justify-center border-b border-sky-500/15 min-h-[77px] bg-[#040c1a]/60">
          <TypewriterBrand />
        </div>

      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6 scrollbar-thin scrollbar-thumb-sky-500/20">
        {SECTIONS.map((section) => {
          const items = section.items.filter((i) => {
            if (i.adminOnly && !isAdmin) return false;
            return true;
          });
          if (items.length === 0) return null;
          return (
            <div key={section.label} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-sky-400/70 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-sky-400 shadow-[0_0_6px_#00bfff]" />
                {section.label}
              </div>
              <div className="space-y-1 pt-1">
                {items.map((n) => {
                  const active = pathname === n.href || (n.href !== "/dashboard" && pathname.startsWith(n.href));
                  return (
                    <Link
                      key={n.href}
                      href={n.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-all duration-200 group relative",
                        active
                          ? "bg-gradient-to-r from-sky-500/20 via-sky-500/10 to-transparent text-sky-300 border-l-2 border-sky-400 shadow-[0_0_15px_rgba(0,191,255,0.15)] font-bold"
                          : "text-zinc-400 hover:bg-sky-500/5 hover:text-zinc-100 border-l-2 border-transparent"
                      )}
                    >
                      <n.icon className={cn("w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110", active ? "text-sky-400 filter drop-shadow-[0_0_5px_#00bfff]" : "text-zinc-500 group-hover:text-sky-300")} />
                      <span className="truncate tracking-wide">{n.label}</span>
                      {active && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_#00bfff]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Bottom Profile Details */}
      <div className="p-4 border-t border-sky-500/15 bg-[#020712]/80">
        <div className="rounded-2xl bg-[#050e1f]/80 border border-sky-500/20 p-3.5 space-y-3 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-sky-500/40 shadow-md shadow-sky-500/20 shrink-0">
              <img src="/logo.png" alt="Sukuna" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-white truncate tracking-wide">{capitalizedUsername}</div>
              <div className="text-[10px] text-sky-400/80 font-mono uppercase tracking-wider font-semibold">
                {role === "admin" ? "ADMINISTRADOR" : role === "developer" ? "DESARROLLADOR" : "REVENDEDOR"}
              </div>
            </div>
          </div>

          {/* Subscription Days for Sub-resellers */}
          {isSubReseller && (() => {
            if (!subscriptionEnd) {
              return (
                <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                  <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="text-[11px] text-sky-400 font-bold">∞ Ilimitado</span>
                </div>
              );
            }
            const endDate = new Date(subscriptionEnd);
            const now = new Date();
            const diffMs = endDate.getTime() - now.getTime();
            const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
            const isExpired = daysLeft <= 0;
            const isWarning = daysLeft > 0 && daysLeft <= 5;
            return (
              <div className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border ${
                isExpired
                  ? "bg-red-950/30 border-red-500/30"
                  : isWarning
                    ? "bg-yellow-950/30 border-yellow-500/30"
                    : "bg-sky-950/20 border-sky-500/20"
              }`}>
                {isExpired ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                ) : (
                  <Clock className={`w-3.5 h-3.5 shrink-0 ${isWarning ? "text-yellow-400" : "text-sky-400"}`} />
                )}
                <div className="min-w-0">
                  <p className={`text-[11px] font-bold ${
                    isExpired ? "text-red-400" : isWarning ? "text-yellow-400" : "text-sky-400"
                  }`}>
                    {isExpired ? "Expirado" : `${daysLeft} día${daysLeft !== 1 ? "s" : ""} restante${daysLeft !== 1 ? "s" : ""}`}
                  </p>
                  {isExpired && (
                    <p className="text-[9px] text-red-400/70 mt-0.5">Contacta al Developer</p>
                  )}
                </div>
              </div>
            );
          })()}

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md hover:bg-bg-hover text-text-muted hover:text-text transition"
              title={dark ? "Modo Claro" : "Modo Oscuro"}
            >
              {dark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-red-950/20 border border-red-900/30 text-[11px] font-medium text-red-400 hover:bg-red-900/20 hover:text-red-300 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Salir
            </button>
          </div>
        </div>
      </div>
    </aside>
  </>
  );
}
