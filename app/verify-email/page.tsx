"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Mail,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Lock,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { ParticlesBackground } from "@/components/ParticlesBackground";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "tu correo";
  const token = searchParams.get("token") || "";

  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const verifyUrl = `/api/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;

  const handleResend = async () => {
    setResending(true);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });
      setResendSuccess(true);
      setCountdown(60);
      setTimeout(() => setResendSuccess(false), 4000);
    } catch {
      // Ignore resend error
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020610] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-[#0099ff] selection:text-white p-4 sm:p-6">
      <ParticlesBackground />

      {/* Cyber Grid Subtle Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,180,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,180,255,0.025)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0 opacity-70" />

      {/* Header Brand */}
      <header className="relative z-20 w-full max-w-5xl mx-auto py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0099ff] to-[#0055d4] p-[1px] shadow-[0_0_15px_rgba(0,153,255,0.4)]">
            <div className="w-full h-full bg-[#040e24] rounded-[11px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#00c2ff]" />
            </div>
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white block">
              SecureX Auth
            </span>
            <span className="text-[8.5px] font-extrabold tracking-widest text-[#00b4ff]/80 uppercase font-mono block -mt-0.5">
              SISTEMA DE VERIFICACIÓN
            </span>
          </div>
        </Link>
      </header>

      {/* Main Verification Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center my-8">
        <div className="w-full max-w-lg relative">
          {/* Card Outer Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#0088ff]/30 via-[#00c2ff]/20 to-[#0055d4]/30 rounded-3xl blur-xl opacity-80 pointer-events-none" />

          <div className="relative rounded-3xl bg-[#040b18]/90 border border-[#0099ff]/35 backdrop-blur-2xl p-7 sm:p-9 shadow-[0_20px_60px_rgba(0,0,0,0.85)] text-center space-y-6">
            {/* Animated Radar Pulse Icon */}
            <div className="relative inline-flex items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-[#0088ff]/15 border border-[#0099ff]/30 flex items-center justify-center text-[#00c2ff] shadow-[0_0_30px_rgba(0,153,255,0.3)]">
                <Mail className="w-9 h-9 animate-bounce" style={{ animationDuration: "2s" }} />
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#00ff88]"></span>
              </span>
            </div>

            <div className="space-y-2">
              <span className="px-3 py-0.5 rounded-full bg-[#00ff88]/15 text-[#00ff88] text-[10px] font-black tracking-widest uppercase border border-[#00ff88]/30 font-mono">
                NOTIFICACIÓN ENVIADA
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Verifica tu Correo
              </h1>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Hemos enviado un correo a <span className="text-[#00c2ff] font-bold font-mono">{email}</span> con el botón de verificación oficial para autorizar tu acceso.
              </p>
            </div>

            {/* Step Card Box */}
            <div className="p-4 rounded-2xl bg-[#020716] border border-[#0099ff]/20 text-left space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#0088ff]/20 text-[#00c2ff] font-mono font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div className="text-slate-300">
                  Abre tu bandeja de entrada en <strong className="text-white">Gmail</strong> o tu app de correo.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#0088ff]/20 text-[#00c2ff] font-mono font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div className="text-slate-300">
                  Busca el correo de <strong className="text-[#00c2ff]">SecureX Auth</strong> y haz clic en el botón <strong className="text-[#00ff88]">"VERIFICAR Y ENTRAR"</strong>.
                </div>
              </div>
            </div>

            {/* Direct Instant Verify Action Button */}
            <div className="space-y-3 pt-2">
              <a
                href={verifyUrl}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#0088ff] to-[#00c2ff] hover:from-[#0070e0] hover:to-[#00b0f0] text-white font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,153,255,0.4)] transition-all cursor-pointer"
              >
                <span>Verificar y Entrar Ahora</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              {/* Resend button */}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-1">
                <span>¿No recibiste el correo?</span>
                <button
                  type="button"
                  disabled={resending || countdown > 0}
                  onClick={handleResend}
                  className="text-[#00b4ff] hover:text-[#38bdf8] font-bold transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1"
                >
                  {resending && <RefreshCw className="w-3 h-3 animate-spin" />}
                  <span>{countdown > 0 ? `Reenviar en (${countdown}s)` : "Reenviar correo"}</span>
                </button>
              </div>

              {resendSuccess && (
                <div className="text-[11px] text-emerald-400 font-bold animate-in fade-in">
                  ✓ Nuevo correo de verificación enviado.
                </div>
              )}
            </div>

            {/* Security note */}
            <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <Lock className="w-3.5 h-3.5 text-[#00c2ff]" />
              <span>Conexión protegida por SecureX Security Gate</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 w-full text-center py-3 text-[11px] text-slate-500 font-mono">
        SECUREX AUTH — SECURE ACCESS PLATFORM
      </footer>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020610]" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
