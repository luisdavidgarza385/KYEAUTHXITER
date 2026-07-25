"use client";

import { LoginForm } from "@/components/LoginForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ParticlesBackground } from "@/components/ParticlesBackground";
import Link from "next/link";
import { Shield, Zap, Key, Headphones, Lock, ShieldCheck, CheckCircle } from "lucide-react";
import styles from "./auth.module.css";

export default function LoginPage({ searchParams }: { searchParams: { err?: string } }) {
  const ERR_MESSAGES: Record<string, string> = {
    discord_not_configured: "Discord login is not configured.",
    google_not_configured: "Google login is not configured.",
    apple_not_configured: "Apple login is not configured.",
    no_account: "No account found for this email.",
    invalid_state: "OAuth state mismatch. Please try again.",
    missing_code: "OAuth provider did not return a code.",
    token_exchange: "Failed to exchange OAuth code.",
    fetch_profile: "Failed to fetch your profile from the OAuth provider.",
    telegram_invalid: "Telegram login data is invalid or expired.",
    access_denied: "You declined the OAuth authorization.",
  };

  const errMsg = searchParams.err ? ERR_MESSAGES[searchParams.err] || `OAuth error: ${searchParams.err}` : null;

  return (
    <div className={styles.premiumPage}>
      <ParticlesBackground />
      <ThemeToggle />

      {/* Cyber Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,191,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,191,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none z-0 opacity-60" />

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto px-4 z-10 flex flex-col justify-between min-h-[90vh] py-8">
        
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
          
          {/* Left Column: Brand & Features */}
          <div className="lg:col-span-6 space-y-8 flex flex-col justify-center text-center lg:text-left">
            
            {/* Logo and Tagline */}
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4">
                
                {/* Custom SVG Glowing Cyber Goat Mascot Logo */}
                <div className="w-24 h-24 relative overflow-hidden group flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_12px_rgba(0,191,255,0.8)]">
                    {/* Glowing outer aura */}
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0, 191, 255, 0.15)" strokeWidth="2" />
                    
                    {/* Goat Snout/Face */}
                    <path d="M50 35 L40 58 L50 82 L60 58 Z" fill="#0c1724" stroke="#00bfff" strokeWidth="2.5" strokeLinejoin="round" />
                    <path d="M50 50 L45 58 L50 78 L55 58 Z" fill="#03080e" stroke="rgba(0, 191, 255, 0.5)" strokeWidth="1.5" />
                    
                    {/* Eyes (Glowing Celeste) */}
                    <polygon points="43,50 48,51 47,54 42,52" fill="#00bfff" className="animate-pulse" />
                    <polygon points="57,50 52,51 53,54 58,52" fill="#00bfff" className="animate-pulse" />
                    
                    {/* Left Horn */}
                    <path d="M38 42 C20 30, 26 5, 41 12 C30 18, 30 35, 40 46" fill="#0c1724" stroke="#00bfff" strokeWidth="2.5" strokeLinejoin="round" />
                    <path d="M34 32 C26 24, 28 12, 36 16" fill="none" stroke="rgba(0, 191, 255, 0.6)" strokeWidth="1.5" />
                    
                    {/* Right Horn */}
                    <path d="M62 42 C80 30, 74 5, 59 12 C70 18, 70 35, 60 46" fill="#0c1724" stroke="#00bfff" strokeWidth="2.5" strokeLinejoin="round" />
                    <path d="M66 32 C74 24, 72 12, 64 16" fill="none" stroke="rgba(0, 191, 255, 0.6)" strokeWidth="1.5" />

                    {/* Ears */}
                    <path d="M36 50 L18 56 L33 60 Z" fill="#0c1724" stroke="#00bfff" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M64 50 L82 56 L67 60 Z" fill="#0c1724" stroke="#00bfff" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                </div>
                
                <div className="text-center lg:text-left">
                  <h1 className="text-4xl lg:text-5xl font-black tracking-wider bg-gradient-to-r from-white via-zinc-200 to-sky-400 bg-clip-text text-transparent uppercase font-sans">
                    SPORT Goat
                  </h1>
                  <p className="text-[10px] tracking-[0.25em] font-bold text-sky-400/90 uppercase mt-0.5 font-mono">
                    Performance. Power. Prestige.
                  </p>
                </div>
              </div>

              {/* Decorative Crown */}
              <div className="flex justify-center lg:justify-start">
                <svg className="w-6 h-6 text-sky-400/40 fill-current animate-pulse" viewBox="0 0 24 24">
                  <path d="M2 4l3 5 7-6 7 6 3-5v14.5c0 .8-.7 1.5-1.5 1.5h-15c-.8 0-1.5-.7-1.5-1.5v-14.5zm2 15h16v-6.5l-2-1.5-6 5-6-5-2 1.5v6.5z" />
                </svg>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-sky-950/10 border border-sky-500/15 p-6 rounded-2xl max-w-xl mx-auto lg:mx-0 backdrop-blur-md">
              <p className="text-sky-400 font-bold uppercase tracking-wider text-xs mb-1">
                Acceso Seguro a tu Panel
              </p>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Sistema de autenticación exclusivo y protegido. Tu seguridad es nuestra prioridad.
              </p>
            </div>

            {/* Features Row */}
            <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto lg:mx-0 text-left">
              <div className="bg-zinc-950/40 border border-zinc-800/60 p-4 rounded-xl flex items-start gap-3 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-sky-950/50 border border-sky-500/20 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-200 uppercase">100% Seguro</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5 leading-snug">Protección total de tu cuenta</p>
                </div>
              </div>

              <div className="bg-zinc-950/40 border border-zinc-800/60 p-4 rounded-xl flex items-start gap-3 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-sky-950/50 border border-sky-500/20 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-200 uppercase">Acceso Rápido</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5 leading-snug">Panel optimizado y eficiente</p>
                </div>
              </div>

              <div className="bg-zinc-950/40 border border-zinc-800/60 p-4 rounded-xl flex items-start gap-3 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-sky-950/50 border border-sky-500/20 flex items-center justify-center shrink-0">
                  <Key className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-200 uppercase">Key Auth</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5 leading-snug">Sistema exclusivo de verificación</p>
                </div>
              </div>

              <div className="bg-zinc-950/40 border border-zinc-800/60 p-4 rounded-xl flex items-start gap-3 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-sky-950/50 border border-sky-500/20 flex items-center justify-center shrink-0">
                  <Headphones className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-200 uppercase">Soporte 24/7</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5 leading-snug">Estamos aquí para ayudarte</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Login Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-[460px] relative">
              {/* Outer Neon Glow */}
              <div className="absolute -inset-1.5 bg-sky-500/20 rounded-3xl blur-xl opacity-75 pointer-events-none animate-pulse" />
              
              <div className="relative rounded-3xl border border-sky-500/30 bg-zinc-950/90 backdrop-blur-2xl p-8 md:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.8)]">
                
                {/* Hexagonal Lock Badge at Top */}
                <div className="w-16 h-16 mx-auto mb-6 relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-sky-500/10 rounded-2xl rotate-45 border border-sky-500/40 shadow-lg shadow-sky-950/50" />
                  <Lock className="w-6 h-6 text-sky-400 relative z-10 animate-pulse" />
                </div>

                <div className="text-center mb-6">
                  <p className="text-[10px] font-bold tracking-widest text-sky-400 uppercase">
                    ¡Bienvenido de nuevo!
                  </p>
                  <h2 className="text-3xl font-extrabold text-white mt-1">
                    Iniciar <span className="text-sky-400">Sesión</span>
                  </h2>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Accede a tu cuenta de <span className="text-sky-400 font-medium">SPORT Goat</span>
                  </p>
                </div>

                {errMsg && (
                  <div className="mb-4 bg-red-950/20 border border-red-900/30 text-red-400 text-xs px-4 py-2.5 rounded-lg">
                    {errMsg}
                  </div>
                )}

                {/* Form fields component wrapper */}
                <LoginForm />

              </div>
            </div>
          </div>

        </div>

        {/* Footer info bar */}
        <div className="mt-8 pt-6 border-t border-zinc-800/40 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-zinc-500 font-mono tracking-wider w-full uppercase">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Encriptación SSL: Conexión cifrada y segura</span>
          </div>
          <div className="text-center">
            SPORT GOAT KEYAUTH SYSTEM &copy; {new Date().getFullYear()} SPORT Goat. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-sky-400" />
            <span>Verificado: Sistema activo y seguro</span>
          </div>
        </div>

      </div>
    </div>
  );
}
