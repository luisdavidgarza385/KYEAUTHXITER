"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Grid,
  Users,
  Key,
  Activity,
  Plus,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface DashboardPageClientProps {
  currentApp: { id: string; name: string };
  appsCount: number;
  usersCount: number;
  licensesCount: number;
  currentUserEmail?: string;
}

export function DashboardPageClient({
  currentApp,
  appsCount,
  usersCount,
  licensesCount,
  currentUserEmail,
}: DashboardPageClientProps) {
  const { t } = useLanguage();

  const username = currentUserEmail ? (currentUserEmail.includes("@") ? currentUserEmail.split("@")[0] : currentUserEmail) : "";
  const displayName = currentUserEmail?.toLowerCase() === "spectralx@gmail.com"
    ? "SpectralX"
    : username
    ? username
        .split(/[\._\-]/)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ")
    : "Usuario";

  return (
    <div className="space-y-6 animate-fade-in text-slate-200">
      {/* ── CENTRO DE MANDO HERO CARD ── */}
      <div className="rounded-3xl bg-[#040e24]/85 border border-[#0099ff]/30 p-6 md:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/30">
              <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
              <span className="text-[10px] font-black tracking-widest text-[#00ff88] uppercase font-mono">
                {t.dashboardTitle || "CENTRO DE MANDO"}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              Bienvenido, {displayName}
            </h1>

            <p className="text-xs md:text-sm text-slate-400 max-w-lg leading-relaxed">
              {t.dashboardDesc || "Tu panel está activo y listo para operar con el nuevo dominio oficial de RealAuthX."}
            </p>

            {/* Quick Actions */}
            <div className="pt-2">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5 font-mono">
                {t.quickActions || "ACCESOS RÁPIDOS"}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/dashboard/licenses"
                  className="px-4 py-2.5 rounded-xl bg-[#0088ff] hover:bg-[#0099ff] text-white text-xs font-bold shadow-[0_0_15px_rgba(0,136,255,0.4)] transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  {t.createLicense || "Crear Licencia"}
                </Link>
                <Link
                  href="/dashboard/users"
                  className="px-4 py-2.5 rounded-xl bg-[#07193b] hover:bg-[#0c2452] border border-[#0099ff]/30 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Users className="w-4 h-4 text-[#00c2ff]" />
                  {t.createUser || "Crear usuario"}
                </Link>
                <Link
                  href="/dashboard/resources"
                  className="px-4 py-2.5 rounded-xl bg-[#07193b] hover:bg-[#0c2452] border border-[#0099ff]/30 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4 text-[#00c2ff]" />
                  {t.viewResources || "Ver recursos"}
                </Link>
              </div>
            </div>
          </div>

          {/* Right: Sistema Operativo RealAuthX Box */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-[#030919] border border-[#0099ff]/25 p-5 space-y-4 shadow-inner">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0088ff]/20 border border-[#0088ff]/40 flex items-center justify-center text-[#00c2ff]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-[#00b4ff] uppercase tracking-widest block font-mono">
                    {t.osTitle || "SISTEMA OPERATIVO SecureX Auth"}
                  </span>
                  <h3 className="text-base font-black text-white">SecureX Auth</h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-800">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{t.selectedApp || "APP SELECCIONADA"}</div>
                  <div className="font-extrabold text-white text-sm mt-0.5">{currentApp.name || "9999"}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{t.currentPlan || "PLAN ACTUAL"}</div>
                  <div className="font-extrabold text-white text-sm mt-0.5">Probador</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{t.activeSessions || "SESIONES ACTIVAS"}</div>
                  <div className="font-extrabold text-white text-sm mt-0.5">0</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">ESTADO</div>
                  <div className="font-extrabold text-[#00ff88] text-sm mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" /> {t.statusActive || "Activa"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4 STAT METRIC CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Apps */}
        <div className="rounded-2xl bg-[#040e24]/80 border border-[#0099ff]/25 p-5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">
              {t.totalApps || "TOTAL APLICACIONES"}
            </div>
            <div className="text-2xl font-black text-white mt-1">{appsCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#0088ff]/15 flex items-center justify-center text-[#00c2ff]">
            <Grid className="w-5 h-5" />
          </div>
        </div>

        {/* Total Users */}
        <div className="rounded-2xl bg-[#040e24]/80 border border-[#0099ff]/25 p-5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">
              {t.totalUsers || "TOTAL USUARIOS"}
            </div>
            <div className="text-2xl font-black text-white mt-1">{usersCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#0088ff]/15 flex items-center justify-center text-[#00c2ff]">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Total Licenses */}
        <div className="rounded-2xl bg-[#040e24]/80 border border-[#0099ff]/25 p-5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">
              {t.totalLicenses || "TOTAL LICENCIAS"}
            </div>
            <div className="text-2xl font-black text-white mt-1">{licensesCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#0088ff]/15 flex items-center justify-center text-[#00c2ff]">
            <Key className="w-5 h-5" />
          </div>
        </div>

        {/* Active Sessions */}
        <div className="rounded-2xl bg-[#040e24]/80 border border-[#0099ff]/25 p-5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">
              {t.activeSessions || "SESIONES ACTIVAS"}
            </div>
            <div className="text-2xl font-black text-[#00ff88] mt-1">0</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#0088ff]/15 flex items-center justify-center text-[#00ff88]">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW: ACTIVIDAD RECIENTE & APPS DESTACADAS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Actividad Reciente */}
        <div className="lg:col-span-7 rounded-2xl bg-[#040e24]/80 border border-[#0099ff]/25 p-6 space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-white">{t.recentActivity || "Actividad reciente"}</h3>
            <p className="text-xs text-slate-400">Últimos movimientos importantes de tu panel.</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#030919] border border-sky-500/10">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00c2ff]" />
                <div>
                  <div className="text-xs font-bold text-white">Suscripcion actualizada</div>
                  <div className="text-[10px] text-slate-400">App {currentApp.name || "9999"}</div>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">28/08/2026 17:44</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#030919] border border-sky-500/10">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00ff88]" />
                <div>
                  <div className="text-xs font-bold text-white">Aplicacion creada</div>
                  <div className="text-[10px] text-slate-400">App {currentApp.name || "9999"}</div>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">28/08/2026 17:43</span>
            </div>
          </div>
        </div>

        {/* Apps Destacadas */}
        <div className="lg:col-span-5 rounded-2xl bg-[#040e24]/80 border border-[#0099ff]/25 p-6 space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-white">{t.featuredApps || "Apps destacadas"}</h3>
            <p className="text-xs text-slate-400">Vista rápida de tus aplicaciones principales.</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#030919] border border-[#0099ff]/25 hover:border-[#00c2ff] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0088ff] to-[#0044aa] flex items-center justify-center font-black text-white text-sm shadow-md">
                  {currentApp.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-extrabold text-white">{currentApp.name || "9999"}</div>
                  <div className="text-[10px] text-slate-400 font-mono">0 Usuarios · 0 Licencias</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#00ff88]/20 text-[#00ff88] text-[9.5px] font-extrabold border border-[#00ff88]/30">
                ACTIVA
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
