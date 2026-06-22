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
} from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  {
    label: "GENERAL",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
      { href: "/dashboard/apps", label: "Aplicaciones", icon: Shield, adminOnly: false },
    ],
  },
  {
    label: "GESTION",
    items: [
      { href: "/dashboard/licenses", label: "Licencias", icon: Key, adminOnly: false },
      { href: "/dashboard/users", label: "Usuarios", icon: Users, adminOnly: false },
      { href: "/dashboard/sub-resellers", label: "Sub resellers", icon: Users, adminOnly: false },
      { href: "/dashboard/sub-users", label: "Sub-usuarios", icon: Layers, adminOnly: false },
      { href: "/dashboard/credits", label: "Créditos", icon: Coins, adminOnly: false },
      { href: "/dashboard/shop", label: "Comprar VIP / PayPal", icon: Coins, adminOnly: false, hideForSubReseller: true },
      { href: "/dashboard/chat", label: "Chat Global", icon: MessageSquare, adminOnly: false },
    ],
  },
  {
    label: "CUENTA",
    items: [
      { href: "/dashboard/security", label: "Seguridad (2FA)", icon: Lock, adminOnly: false },
      { href: "/dashboard/api", label: "API", icon: Code, adminOnly: false },
      { href: "/dashboard/settings", label: "Configuración", icon: Settings, adminOnly: false },
    ],
  },
];

export function Sidebar({ role, email, isSubReseller = false }: { role: "admin" | "seller" | "developer"; email: string; isSubReseller?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = role === "admin" || role === "developer";
  const [dark, setDark] = useState(true);

  useEffect(() => {
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
    <aside className="w-60 border-r border-zinc-800 bg-[#09090b] flex flex-col h-screen sticky top-0 text-zinc-300">
      <div className="p-5 flex items-center justify-center border-b border-zinc-800/60 min-h-[77px]">
        <TypewriterBrand />
      </div>

      <nav className="flex-1 overflow-y-auto py-5 px-3">
        {SECTIONS.map((section) => {
          const items = section.items.filter((i) => {
            if (i.adminOnly && !isAdmin) return false;
            if (i.hideForSubReseller && isSubReseller) return false;
            return true;
          });
          if (items.length === 0) return null;
          return (
            <div key={section.label} className="mb-5">
              <div className="px-3 py-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                {section.label}
              </div>
              <div className="mt-1.5 space-y-0.5">
                {items.map((n) => {
                  const active = pathname === n.href || (n.href !== "/dashboard" && pathname.startsWith(n.href));
                  return (
                    <Link
                      key={n.href}
                      href={n.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-all duration-150",
                        active
                          ? "bg-purple-950/20 text-purple-400 border-l-2 border-purple-500 pl-2.5"
                          : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 border-l-2 border-transparent"
                      )}
                    >
                      <n.icon className={cn("w-4 h-4 shrink-0", active ? "text-purple-400" : "text-zinc-500")} />
                      <span className="truncate">{n.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Bottom Profile Details */}
      <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/40">
        <div className="rounded-lg bg-zinc-900/60 border border-zinc-800/60 p-3 space-y-3">
          <div className="min-w-0">
            <div className="font-semibold text-sm text-zinc-100 truncate">{capitalizedUsername}</div>
            <div className="text-[11px] text-zinc-500 truncate font-mono">MyCheat</div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-zinc-850">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
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
  );
}
