"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  Grid,
  Key,
  Users,
  Layers,
  Clock,
  Code2,
  User,
  CreditCard,
  Download,
  ChevronDown,
  X,
  Sparkles,
  Terminal,
  Binary,
  Coins,
  MessageSquare,
  Lock,
  Settings,
  Star,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

interface AppItem {
  id: string;
  name: string;
  seller_label?: string;
}

interface RealAuthXSidebarProps {
  role: "admin" | "seller" | "developer";
  email: string;
  apps?: AppItem[];
  currentAppId?: string;
}

export function RealAuthXSidebar({
  role,
  email,
  apps = [{ id: "9999", name: "9999" }],
  currentAppId = "9999",
}: RealAuthXSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(currentAppId);

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    const handleClose = () => setIsOpen(false);

    window.addEventListener("gx-toggle-sidebar", handleToggle);
    window.addEventListener("gx-close-sidebar", handleClose);

    return () => {
      window.removeEventListener("gx-toggle-sidebar", handleToggle);
      window.removeEventListener("gx-close-sidebar", handleClose);
    };
  }, []);

  const isAdmin = role === "admin";

  const generalItems = [
    {
      href: "/dashboard",
      label: t.navCommandCenter || "Centro de Mando",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: "/dashboard/apps",
      label: t.navManageApps || "Gestionar apps",
      icon: Grid,
    },
    ...(isAdmin
      ? [
          {
            href: "/dashboard/builder",
            label: t.navBuilder || "Builder",
            icon: Terminal,
            badge: "VIP",
          },
        ]
      : []),
  ];

  const toolsSection = isAdmin
    ? [
        {
          label: t.navTools || "HERRAMIENTAS",
          items: [
            {
              href: "/dashboard/hex-converter",
              label: t.navHexConverter || "Convertidor Hex",
              icon: Binary,
            },
          ],
        },
      ]
    : [];

  const navSections = [
    {
      label: t.navGeneral || "GENERAL",
      items: generalItems,
    },
    ...toolsSection,
    {
      label: t.navManagement || "GESTION",
      items: [
        {
          href: "/dashboard/licenses",
          label: t.navLicenses || "Licencias",
          icon: Key,
        },
        {
          href: "/dashboard/users",
          label: t.navUsers || "Usuarios",
          icon: Users,
        },
        {
          href: "/dashboard/subscriptions",
          label: t.navSubscriptions || "Suscripciones",
          icon: Layers,
        },
        ...(isAdmin
          ? [
              {
                href: "/dashboard/sub-resellers",
                label: t.navSubResellers || "Sub-resellers",
                icon: Layers,
              },
              {
                href: "/dashboard/sub-managers",
                label: "Sub-managers",
                icon: UserCog,
              },
            ]
          : []),
        {
          href: "/dashboard/sessions",
          label: t.navSessions || "Sesiones",
          icon: Clock,
        },
        {
          href: "/dashboard/variables",
          label: t.navVariables || "Variables",
          icon: Code2,
          badge: "PREMIUM",
        },
        {
          href: "/dashboard/credits",
          label: t.navCredits || "Créditos",
          icon: Coins,
        },
        {
          href: "/dashboard/chat",
          label: t.navGlobalChat || "Chat Global",
          icon: MessageSquare,
        },
      ],
    },
    {
      label: t.navAccount || "CUENTA",
      items: [
        {
          href: "/dashboard/profile",
          label: t.navProfile || "Cuenta / Perfil",
          icon: User,
        },
        {
          href: "/dashboard/security",
          label: t.navSecurity || "Seguridad (2FA)",
          icon: Lock,
        },
        {
          href: "/dashboard/upgrade",
          label: t.navUpgradePlan || "⚡ Mejorar Plan",
          icon: Star,
          highlight: true,
        },
        {
          href: "/dashboard/resources",
          label: t.navResources || "Recursos",
          icon: Download,
        },
        {
          href: "/dashboard/settings",
          label: t.navSettings || "Configuración",
          icon: Settings,
        },
      ],
    },
  ];

  const handleAppChange = (newAppId: string) => {
    setSelectedApp(newAppId);
    document.cookie = `ka_current_app=${newAppId}; path=/; max-age=2592000`;
    router.refresh();
  };

  const username = email.includes("@") ? email.split("@")[0] : email;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 w-64 bg-[#030917]/95 border-r border-[#0099ff]/20 flex flex-col h-screen text-slate-200 transition-transform duration-300 lg:translate-x-0 lg:shrink-0 shadow-2xl backdrop-blur-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Mobile Close */}
        <div className="lg:hidden absolute top-4 right-4 z-50">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Brand Header */}
        <div className="p-4 border-b border-[#0099ff]/15 flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0099ff] to-[#0055d4] p-[1px] shadow-[0_0_15px_rgba(0,153,255,0.4)] transition-transform group-hover:scale-105 flex items-center justify-center overflow-hidden bg-[#040e24]">
              <img
                src="/logo.png"
                alt="SecureX Auth Logo"
                className="w-full h-full object-contain p-1 rounded-xl"
              />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-white block">
                SecureX Auth
              </span>
              <span className="text-[8.5px] font-extrabold tracking-widest text-[#00b4ff]/80 uppercase font-mono block -mt-0.5">
                CENTRO DE CONTROL
              </span>
            </div>
          </Link>
        </div>

        {/* App Selector Section */}
        <div className="px-4 py-3 border-b border-[#0099ff]/10">
          <div className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
            {t.selectedApp || "APLICACIÓN"}
          </div>
          <div className="relative">
            <select
              value={selectedApp}
              onChange={(e) => handleAppChange(e.target.value)}
              className="w-full appearance-none bg-[#05112c] border border-[#0099ff]/30 text-white text-xs font-bold rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-[#00c2ff] transition-all cursor-pointer"
            >
              {apps.length > 0 ? (
                apps.map((app) => (
                  <option key={app.id} value={app.id} className="bg-[#040e24] text-white">
                    {app.name || app.id}
                  </option>
                ))
              ) : (
                <option value="9999" className="bg-[#040e24] text-white">
                  9999
                </option>
              )}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Main Categorized Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4 scrollbar-thin scrollbar-thumb-sky-500/20 text-xs font-semibold">
          {navSections.map((sec) => (
            <div key={sec.label} className="space-y-1">
              <div className="px-3 py-1 text-[9.5px] font-black uppercase tracking-widest text-[#00b4ff]/70 flex items-center gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00c2ff] shadow-[0_0_6px_#00c2ff]" />
                {sec.label}
              </div>
              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const isActive = (item as any).exact
                    ? pathname === item.href
                    : pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-150 group",
                        (item as any).highlight && !isActive
                          ? "bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20"
                          : isActive
                          ? "bg-[#0088ff] text-white font-bold shadow-[0_0_18px_rgba(0,136,255,0.45)] border border-[#38bdf8]/40"
                          : "text-slate-300 hover:text-white hover:bg-[#07193b]/70"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <item.icon
                          className={cn(
                            "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                            isActive ? "text-white" : (item as any).highlight ? "text-amber-400" : "text-[#00b4ff]"
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {(item as any).badge && (
                        <span
                          className={cn(
                            "text-[8.5px] font-black uppercase font-mono px-1.5 py-0.5 rounded",
                            (item as any).badge === "VIP"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                          )}
                        >
                          {(item as any).badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar App Status Card (with blurred owner hover effect) */}
        <div className="p-3 border-t border-[#0099ff]/15 bg-[#020610]">
          <div className="rounded-xl bg-[#040e24] border border-[#0099ff]/25 p-3 space-y-2 text-[10px] text-slate-400 font-mono">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-400">APP SELECCIONADA:</span>
              <span className="font-black text-white font-sans">{selectedApp}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-400">ESTADO:</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-extrabold text-[9px] border border-emerald-500/30">
                ACTIVA
              </span>
            </div>

            {/* Blurred Owner Text with Hover-To-Reveal Effect */}
            <div className="flex items-center justify-between group/blur cursor-help">
              <span className="font-bold text-slate-400">PROPIETARIO:</span>
              <span
                className="font-bold text-[#00c2ff] filter blur-[3.5px] group-hover/blur:blur-0 transition-all duration-300 select-none"
                title="Pasa el mouse para revelar"
              >
                {username}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-400">DISCORD:</span>
              <span className="text-slate-400 font-bold">DESCONECTADO</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-400">GOOGLE:</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-extrabold text-[9px] border border-emerald-500/30">
                CONECTADO
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
