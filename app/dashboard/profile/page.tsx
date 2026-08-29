"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Shield,
  CreditCard,
  CheckCircle2,
  ExternalLink,
  Lock,
} from "lucide-react";

export default function ProfilePage() {
  const [discordLinked, setDiscordLinked] = useState(false);
  const [googleLinked, setGoogleLinked] = useState(true);

  return (
    <div className="space-y-6 animate-fade-in text-slate-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ── LEFT CARD: INFORMACION DEL PERFIL (MATCHING SCREENSHOT 4) ── */}
        <div className="lg:col-span-7 rounded-2xl bg-[#040e24]/85 border border-[#0099ff]/25 p-6 backdrop-blur-2xl shadow-2xl space-y-4">
          <h2 className="text-xl font-black text-white tracking-tight">Informacion del perfil</h2>

          <div className="space-y-3 pt-1 text-xs">
            {/* Usuario */}
            <div className="p-3.5 rounded-xl bg-[#030919] border border-[#0099ff]/15">
              <span className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider font-mono block mb-1">
                USUARIO
              </span>
              <span className="text-sm font-bold text-white font-mono">
                google_Newdavis_Garca
              </span>
            </div>

            {/* Correo */}
            <div className="p-3.5 rounded-xl bg-[#030919] border border-[#0099ff]/15">
              <span className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider font-mono block mb-1">
                CORREO
              </span>
              <span className="text-sm font-bold text-white font-mono">
                garcianewdavis@gmail.com
              </span>
            </div>

            {/* Plan Actual */}
            <div className="p-3.5 rounded-xl bg-[#030919] border border-[#0099ff]/15">
              <span className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider font-mono block mb-1">
                PLAN ACTUAL
              </span>
              <span className="text-sm font-bold text-white">Probador</span>
            </div>

            {/* Suscripcion */}
            <div className="p-3.5 rounded-xl bg-[#030919] border border-[#0099ff]/15">
              <span className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider font-mono block mb-1">
                SUSCRIPCION
              </span>
              <span className="text-sm font-bold text-white">Probador</span>
            </div>

            {/* Ciclo */}
            <div className="p-3.5 rounded-xl bg-[#030919] border border-[#0099ff]/15">
              <span className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider font-mono block mb-1">
                CICLO
              </span>
              <span className="text-sm font-bold text-white">Mensual</span>
            </div>

            {/* Expira */}
            <div className="p-3.5 rounded-xl bg-[#030919] border border-[#0099ff]/15">
              <span className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider font-mono block mb-1">
                EXPIRA
              </span>
              <span className="text-sm font-bold text-white">Gratis para siempre</span>
            </div>

            {/* Miembro Desde */}
            <div className="p-3.5 rounded-xl bg-[#030919] border border-[#0099ff]/15">
              <span className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider font-mono block mb-1">
                MIEMBRO DESDE
              </span>
              <span className="text-sm font-bold text-white font-mono">28/08/2026 17:29</span>
            </div>

            {/* Discord Vinculado */}
            <div className="p-3.5 rounded-xl bg-[#030919] border border-[#0099ff]/15">
              <span className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider font-mono block mb-1">
                DISCORD VINCULADO
              </span>
              <span className="text-sm font-bold text-slate-400">
                {discordLinked ? "Newdavis#1234" : "Sin cuenta de Discord vinculada"}
              </span>
            </div>

            {/* Google Vinculado */}
            <div className="p-3.5 rounded-xl bg-[#030919] border border-[#0099ff]/15">
              <span className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider font-mono block mb-1">
                GOOGLE VINCULADO
              </span>
              <span className="text-sm font-bold text-emerald-400">
                {googleLinked ? "Newdavis García" : "Sin cuenta vinculada"}
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT CARD: SEGURIDAD DE CUENTA (MATCHING SCREENSHOT 4) ── */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-[#040e24]/85 border border-[#0099ff]/25 p-6 backdrop-blur-2xl shadow-2xl space-y-5">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Seguridad de cuenta</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Gestiona tu cuenta, sesiones activas, logs y plan.
              </p>
            </div>

            {/* Discord Connection Box */}
            <div className="p-4 rounded-xl bg-[#030919] border border-[#0099ff]/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-wider">
                  DISCORD
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-extrabold border border-amber-500/40 uppercase">
                  PAUSADA
                </span>
              </div>
              <div className="text-xs font-bold text-slate-300">
                Sin cuenta de Discord vinculada
              </div>
              <a
                href="/api/auth/discord"
                className="inline-block px-4 py-2 bg-[#0088ff] hover:bg-[#0099ff] text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Vincular Discord
              </a>
            </div>

            {/* Google Connection Box */}
            <div className="p-4 rounded-xl bg-[#030919] border border-[#0099ff]/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-wider">
                  GOOGLE
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-extrabold border border-emerald-500/40 uppercase">
                  ACTIVA
                </span>
              </div>
              <div className="text-xs font-bold text-white">
                Newdavis García
              </div>
              <button
                type="button"
                onClick={() => setGoogleLinked(!googleLinked)}
                className="px-4 py-2 bg-rose-950/30 hover:bg-rose-950/50 text-rose-400 border border-rose-500/40 text-xs font-extrabold rounded-xl transition-all cursor-pointer"
              >
                Desvincular Google
              </button>
            </div>

            {/* Facturacion Link */}
            <div className="pt-2">
              <Link
                href="/dashboard/upgrade"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#07193b] hover:bg-[#0c2452] border border-[#0099ff]/30 text-xs font-bold text-white transition-all cursor-pointer shadow-sm"
              >
                <CreditCard className="w-4 h-4 text-[#00c2ff]" />
                <span>Facturacion / Mejorar plan</span>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
