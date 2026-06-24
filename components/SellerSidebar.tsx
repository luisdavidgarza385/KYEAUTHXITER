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
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  {
    label: "GENERAL",
    items: [
      { href: "/seller/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/seller/apps", label: "Aplicaciones", icon: Shield },
    ],
  },
  {
    label: "GESTION",
    items: [
      { href: "/seller/licenses", label: "Licencias", icon: Key },
      { href: "/seller/users", label: "Usuarios", icon: Users },
      { href: "/seller/credits", label: "Créditos", icon: Coins },
    ],
  },
  {
    label: "CUENTA",
    items: [
      { href: "/seller/security", label: "Seguridad", icon: Lock },
      { href: "/seller/api", label: "API", icon: Code },
      { href: "/seller/settings", label: "Configuración", icon: Settings },
    ],
  },
];

export function SellerSidebar({ username }: { username: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("gx-theme");
    if (stored === "light") {
      setDark(false);
      document.documentElement.classList.add("light");
    }
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
    await fetch("/api/seller/logout", { method: "POST" });
    router.push("/seller/login");
    router.refresh();
  }

  const capitalizedUsername = username.charAt(0).toUpperCase() + username.slice(1);

  return (
    <aside className="w-60 border-r border-emerald-900/10 bg-[#030604] flex flex-col h-screen sticky top-0 text-zinc-300">
      <div className="p-5 flex items-center justify-center border-b border-emerald-500/10 min-h-[77px] bg-[#040e07]/10">
        <TypewriterBrand />
      </div>

      <nav className="flex-1 overflow-y-auto py-5 px-3">
        {SECTIONS.map((section) => (
          <div key={section.label} className="mb-5">
            <div className="px-3 py-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
              {section.label}
            </div>
            <div className="mt-1.5 space-y-0.5">
              {section.items.map((n) => {
                const active = pathname === n.href || (n.href !== "/seller/dashboard" && pathname.startsWith(n.href));
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-all duration-150",
                      active
                        ? "bg-emerald-950/30 text-emerald-400 border-l-2 border-emerald-500 pl-2.5"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 border-l-2 border-transparent"
                    )}
                  >
                    <n.icon className={cn("w-4 h-4 shrink-0", active ? "text-emerald-400" : "text-zinc-500")} />
                    <span className="truncate">{n.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Profile Details */}
      <div className="p-4 border-t border-emerald-900/10 bg-[#030604]/60">
        <div className="rounded-xl bg-[#040c06]/60 border border-emerald-500/15 p-3.5 space-y-3 shadow-inner">
          <div className="min-w-0">
            <div className="font-semibold text-sm text-zinc-100 truncate">{capitalizedUsername}</div>
            <div className="text-[11px] text-zinc-500 truncate font-mono uppercase tracking-wider">
              Seller
            </div>
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
