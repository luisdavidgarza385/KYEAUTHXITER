"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  ChevronDown,
  Moon,
  Sun,
  User,
  LogOut,
  Settings,
  Layers,
  Code2,
  FileText,
  CreditCard,
  Download,
  Plus,
  ArrowRight,
  Menu,
  CheckCircle2,
} from "lucide-react";
import { Language, translations, useLanguage } from "@/lib/i18n";

interface RealAuthXHeaderProps {
  email: string;
  role: string;
  apps?: Array<{ id: string; name: string }>;
  currentAppId?: string;
}

export function RealAuthXHeader({
  email,
  role,
  apps = [{ id: "9999", name: "9999" }],
  currentAppId = "9999",
}: RealAuthXHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang } = useLanguage();

  const [langOpen, setLangOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Load theme preference
  useEffect(() => {
    const storedTheme = localStorage.getItem("gx-theme");
    const darkTheme = storedTheme !== "light";
    setIsDark(darkTheme);
    if (!darkTheme) {
      document.documentElement.classList.add("light");
    }
  }, []);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLangChange = (l: Language) => {
    setLang(l);
    localStorage.setItem("ra_language", l);
    setLangOpen(false);
  };

  const handleThemeToggle = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    document.documentElement.classList.toggle("light", !nextDark);
    localStorage.setItem("gx-theme", nextDark ? "dark" : "light");
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  // Breadcrumbs title based on route
  const getSectionTitle = () => {
    if (pathname.includes("/apps")) return "Configuracion de aplicacion";
    if (pathname.includes("/licenses")) return "Licencias";
    if (pathname.includes("/users")) return "Usuarios";
    if (pathname.includes("/subscriptions")) return "Suscripciones";
    if (pathname.includes("/sessions")) return "Sesiones";
    if (pathname.includes("/variables")) return "Variables";
    if (pathname.includes("/resources")) return "Recursos de RealAuthX";
    if (pathname.includes("/profile")) return "Configuracion de cuenta";
    if (pathname.includes("/upgrade")) return "Facturacion / Mejorar plan";
    return "Centro de Mando";
  };

  const username = email.includes("@") ? email.split("@")[0] : email;
  const displayName = email.toLowerCase() === "spectralx@gmail.com"
    ? "SpectralX"
    : username
        .split(/[\._\-]/)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ");
  const userTag = `@${username}`;

  return (
    <header className="h-16 bg-[#030917]/80 backdrop-blur-xl border-b border-[#0099ff]/20 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Dynamic Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("gx-toggle-sidebar"))}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white lg:hidden border border-[#0099ff]/20"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 font-mono">
          <span className="text-slate-400">RealAuthX</span>
          <span>•</span>
          <span className="text-slate-200 font-bold">{getSectionTitle()}</span>
          <span>•</span>
          <span className="text-[#00c2ff] font-bold">{currentAppId}</span>
        </div>
      </div>

      {/* Right: Header Tools */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Language Selector Dropdown */}
        <div className="relative" ref={langRef}>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase font-mono hidden sm:inline">
              IDIOMA
            </span>
            <button
              type="button"
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#071329] hover:bg-[#0c1f42] border border-[#0099ff]/25 text-xs font-semibold text-slate-200 transition-all cursor-pointer"
            >
              <span>
                {lang === "es" ? "Español" : lang === "en" ? "English" : "Português"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {langOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-[#071329]/95 backdrop-blur-xl border border-[#0099ff]/30 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in">
              <button
                type="button"
                onClick={() => handleLangChange("es")}
                className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold flex items-center justify-between hover:bg-[#0c234b] ${
                  lang === "es" ? "text-[#00b4ff] bg-[#0099ff]/10" : "text-slate-300"
                }`}
              >
                <span>Español</span>
                {lang === "es" && <CheckCircle2 className="w-3.5 h-3.5 text-[#00b4ff]" />}
              </button>
              <button
                type="button"
                onClick={() => handleLangChange("en")}
                className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold flex items-center justify-between hover:bg-[#0c234b] ${
                  lang === "en" ? "text-[#00b4ff] bg-[#0099ff]/10" : "text-slate-300"
                }`}
              >
                <span>English</span>
                {lang === "en" && <CheckCircle2 className="w-3.5 h-3.5 text-[#00b4ff]" />}
              </button>
              <button
                type="button"
                onClick={() => handleLangChange("pt")}
                className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold flex items-center justify-between hover:bg-[#0c234b] ${
                  lang === "pt" ? "text-[#00b4ff] bg-[#0099ff]/10" : "text-slate-300"
                }`}
              >
                <span>Português</span>
                {lang === "pt" && <CheckCircle2 className="w-3.5 h-3.5 text-[#00b4ff]" />}
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle (Sun / Moon) */}
        <button
          type="button"
          onClick={handleThemeToggle}
          className="w-8 h-8 rounded-lg bg-[#071329] hover:bg-[#0c1f42] border border-[#0099ff]/25 flex items-center justify-center text-slate-300 transition-colors cursor-pointer"
          title={isDark ? "Modo Claro" : "Modo Oscuro"}
        >
          {isDark ? <Moon className="w-4 h-4 text-slate-300" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Notifications Button with count (8) */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen(!notifOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#071329] hover:bg-[#0c1f42] border border-[#0099ff]/25 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-[#00b4ff]" />
            <span className="hidden sm:inline">Notificaciones</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#0088ff] text-white text-[10px] font-black">
              8
            </span>
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#071329]/95 backdrop-blur-xl border border-[#0099ff]/30 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-white">
                <span>Notificaciones del Sistema</span>
                <span className="text-[10px] text-[#00b4ff] font-mono">8 Nuevas</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300 max-h-60 overflow-y-auto">
                <div className="p-2 rounded-lg bg-[#040e24] border border-sky-500/10">
                  <div className="font-bold text-white text-[11px]">Suscripción Actualizada</div>
                  <div className="text-[10px] text-slate-400">La suscripción para App 9999 ha sido verificada.</div>
                </div>
                <div className="p-2 rounded-lg bg-[#040e24] border border-sky-500/10">
                  <div className="font-bold text-white text-[11px]">Aplicación Creada</div>
                  <div className="text-[10px] text-slate-400">App 9999 inicializada con éxito.</div>
                </div>
                <div className="p-2 rounded-lg bg-[#040e24] border border-sky-500/10">
                  <div className="font-bold text-white text-[11px]">Seguridad RealAuthX</div>
                  <div className="text-[10px] text-slate-400">Conexión cifrada activa y verificada.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill & Dropdown (Image 5) */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 pr-2 rounded-xl bg-[#071329] hover:bg-[#0c1f42] border border-[#0099ff]/25 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg overflow-hidden ring-1 ring-sky-500/40 bg-[#0a1835]">
              <img
                src="/logo.png"
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-white leading-tight">{displayName}</div>
              <div className="text-[9.5px] text-slate-400 leading-none">Probador</div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Profile Dropdown Menu matching Image 5 */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#050f24]/95 backdrop-blur-2xl border border-[#0099ff]/35 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header Info */}
              <div className="px-4 py-3 border-b border-[#0099ff]/15">
                <div className="font-extrabold text-sm text-white">{displayName}</div>
                <div className="text-xs text-slate-400 truncate">{userTag} · Probador</div>
              </div>

              {/* Account Switcher Rows */}
              <div className="p-1.5 space-y-0.5 border-b border-[#0099ff]/15">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    router.push("/login");
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-200 hover:text-white hover:bg-[#0c234b] rounded-xl transition-colors"
                >
                  <span>Cambiar cuentas</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    router.push("/register");
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-[#00b4ff] hover:text-[#38bdf8] hover:bg-[#0099ff]/10 rounded-xl border border-dashed border-[#0099ff]/30 transition-colors"
                >
                  <span>Añadir cuenta</span>
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="p-1.5 space-y-0.5">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-[#0c234b] rounded-xl transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-[#00b4ff]" />
                  <span>Cuenta</span>
                </Link>

                <Link
                  href="/dashboard/security"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-[#0c234b] rounded-xl transition-colors"
                >
                  <Layers className="w-3.5 h-3.5 text-[#00b4ff]" />
                  <span>Conexiones</span>
                </Link>

                <Link
                  href="/dashboard/logs"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-[#0c234b] rounded-xl transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-[#00b4ff]" />
                  <span>Logs</span>
                </Link>

                <Link
                  href="/dashboard/upgrade"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-[#0c234b] rounded-xl transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5 text-[#00b4ff]" />
                  <span>Facturacion / Mejorar plan</span>
                </Link>

                <Link
                  href="/dashboard/resources"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-[#0c234b] rounded-xl transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#00b4ff]" />
                  <span>Recursos</span>
                </Link>
              </div>

              {/* Logout */}
              <div className="pt-1 px-1.5 border-t border-[#0099ff]/15">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
