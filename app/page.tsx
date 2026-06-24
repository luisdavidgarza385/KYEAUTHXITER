"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { Zap, Key, Users, Server, BarChart3, Lock, Globe, Sparkles, ArrowRight, ShieldCheck, Check, Terminal, Play, Cpu, ShieldAlert } from "lucide-react";
import Image from "next/image";
import { ParticlesBackground } from "@/components/ParticlesBackground";

// Interactive 3D tilt wrapper component
function Card3D({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Max rotation 12 degrees
    const rotateX = -(y / (rect.height / 2)) * 12;
    const rotateY = (x / (rect.width / 2)) * 12;
    
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`transition-all duration-200 ease-out ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale(${isHovered ? 1.02 : 1})`,
        transformStyle: "preserve-3d",
        boxShadow: isHovered 
          ? "0 25px 50px -12px rgba(16, 185, 129, 0.3), 0 0 30px rgba(16, 185, 129, 0.15)" 
          : "0 10px 30px -10px rgba(0, 0, 0, 0.7)"
      }}
    >
      <div style={{ transform: "translateZ(30px)" }} className="h-full">
        {children}
      </div>
    </div>
  );
}

// Spotlight feature card that glows on mouse hover
function FeatureCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative rounded-xl border border-border/40 bg-bg-card/30 backdrop-blur-md p-6 overflow-hidden transition-all duration-300 hover:border-emerald-500/40 hover:bg-bg-card/50"
    >
      {/* Radial Spotlight Overlay */}
      {isHovered && (
        <div
          className="pointer-events-none absolute -inset-px rounded-xl transition duration-300 opacity-100"
          style={{
            background: `radial-gradient(400px circle at ${coords.x}px ${coords.y}px, rgba(16, 185, 129, 0.15), transparent 80%)`,
          }}
        />
      )}
      
      <div className="relative z-10">
        <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:from-emerald-500/20 group-hover:to-teal-500/20 group-hover:border-emerald-500/40 transition-all duration-350">
          <Icon className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
        </div>
        <h3 className="font-semibold text-lg text-white mb-2 group-hover:text-emerald-300 transition-colors">{title}</h3>
        <p className="text-sm text-text-muted leading-relaxed group-hover:text-zinc-300 transition-colors">{desc}</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-[#020503] text-zinc-150">
      <ParticlesBackground />
      
      {/* Premium Sci-Fi Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      {/* Advanced 3D Glowing Ambient Spheres */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-25%] left-1/2 -translate-x-1/2 w-[1200px] h-[900px] rounded-full bg-gradient-radial from-emerald-600/12 via-teal-650/4 to-transparent blur-3xl" />
        <div className="absolute top-[35%] left-[-15%] w-[700px] h-[700px] rounded-full bg-gradient-radial from-emerald-500/8 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[60%] right-[-15%] w-[700px] h-[700px] rounded-full bg-gradient-radial from-teal-500/6 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-bg/50 border-b border-border/30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg overflow-hidden ring-1 ring-emerald-500/40 group-hover:ring-emerald-500/70 transition shadow-lg shadow-emerald-500/10 relative">
              <Image src="/logo.png" alt="Spectral X" width={36} height={36} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-bold tracking-wider text-[16px] bg-gradient-to-r from-white via-zinc-200 to-emerald-400 bg-clip-text text-transparent group-hover:text-emerald-300 transition-colors">Spectral X</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-muted">
            <a href="#features" className="hover:text-emerald-400 transition-all hover:translate-y-[-1px]">Features</a>
            <a href="#api" className="hover:text-emerald-400 transition-all hover:translate-y-[-1px]">API</a>
            <a href="#docs" className="hover:text-emerald-400 transition-all hover:translate-y-[-1px]">Docs</a>
            <a href="#pricing" className="hover:text-emerald-400 transition-all hover:translate-y-[-1px]">Pricing</a>
            <Link href="/docs" className="hover:text-emerald-400 transition-all hover:translate-y-[-1px]">Support</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/subscriber/login" className="text-sm font-semibold relative group overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-4 py-2 rounded-lg shadow-lg shadow-blue-900/30 hover:shadow-blue-500/35 transition-all duration-300 hover:scale-[1.03]">
              <span className="relative z-10">🔷 Suscriptor</span>
            </Link>
            <Link href="/reseller" className="text-sm font-semibold relative group overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-4 py-2 rounded-lg shadow-lg shadow-purple-900/30 hover:shadow-purple-500/35 transition-all duration-300 hover:scale-[1.03]">
              <span className="relative z-10">🚀 Revendedor</span>
            </Link>
            <Link href="/login" className="text-sm font-semibold text-text-muted hover:text-white px-4 py-2 transition-all">Log in</Link>
            <Link
              href="/register"
              className="text-sm font-semibold relative group overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-5 py-2 rounded-lg shadow-lg shadow-emerald-900/30 hover:shadow-emerald-500/35 transition-all duration-300 hover:scale-[1.03]"
            >
              <span className="relative z-10">Sign up</span>
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-teal-500 to-emerald-500 transition-transform duration-500" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-16 grid lg:grid-cols-12 gap-12 items-center relative">
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          {/* Futuristic Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/20 backdrop-blur px-4 py-1.5 text-xs text-emerald-300 mb-8 shadow-lg shadow-emerald-500/5 hover:border-emerald-500/50 transition-colors group">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} /> 
            <span className="font-semibold uppercase tracking-wider text-[10px]">Spectral X Next-Gen Authentication</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.08] text-white">
            Authentication
            <br />
            made for
            <br />
            <span className="relative inline-block mt-1">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-sm">everyone!</span>
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400 rounded-full opacity-60" />
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-text-muted max-w-xl mb-10 leading-relaxed font-medium">
            Secure, scalable, and battle-tested license management. Integrate our robust APIs and ready-to-use SDKs to launch your digital products in minutes.
          </p>
          
          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href="/register"
              className="inline-flex items-center gap-2.5 font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-7 py-3.5 rounded-lg shadow-xl shadow-emerald-900/30 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all duration-300 group"
            >
              Start for free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center font-bold bg-bg-card/40 hover:bg-bg-card border border-border/50 text-white px-7 py-3.5 rounded-lg backdrop-blur-md transition-all hover:scale-[1.02] hover:border-emerald-500/30 shadow-lg"
            >
              View Documentation
            </Link>
          </div>
          
          <div className="mt-12 flex items-center gap-8 text-xs text-text-dim font-semibold tracking-wide">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] animate-pulse" />
              99.9% Uptime
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-450 shadow-[0_0_10px_rgba(45,212,191,0.5)] animate-pulse" />
              Free Forever
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] animate-pulse" />
              Open Source
            </div>
          </div>
        </div>

        {/* 3D Dashboard Preview Mockup Card */}
        <div className="lg:col-span-5 relative w-full flex justify-center mt-8 lg:mt-0">
          <div className="absolute -inset-10 bg-gradient-to-tr from-emerald-600/20 via-teal-600/15 to-cyan-500/10 blur-3xl rounded-full animate-pulse opacity-70 pointer-events-none" style={{ animationDuration: '6s' }} />
          
          <Card3D className="w-full max-w-[460px]">
            <div className="rounded-2xl border border-emerald-500/30 bg-[#040c06]/90 backdrop-blur-2xl overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.8)] relative group">
              {/* Outer light glow border highlight */}
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/15 via-transparent to-transparent pointer-events-none" />
              
              {/* Card Titlebar */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-500/10 bg-emerald-950/20">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#ff5f57] shadow-lg shadow-[#ff5f57]/30" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#febc2e] shadow-lg shadow-[#febc2e]/30" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#28c840] shadow-lg shadow-[#28c840]/30" />
                </div>
                <div className="text-[11px] text-emerald-300/60 font-mono tracking-wider bg-emerald-950/60 border border-emerald-500/10 px-3 py-1 rounded-md">
                  spectral-x.cc/dashboard
                </div>
              </div>
              
              {/* Card Dashboard Body */}
              <div className="p-6 space-y-5">
                {/* Tabs Mockup */}
                <div className="grid grid-cols-4 gap-2 bg-zinc-950/60 p-1 rounded-lg border border-emerald-500/5">
                  {[
                    { label: "Overview", active: true },
                    { label: "Apps", active: false },
                    { label: "Licenses", active: false },
                    { label: "Users", active: false },
                  ].map((t) => (
                    <div
                      key={t.label}
                      className={`rounded-md py-2 text-[10px] font-bold text-center uppercase tracking-wider transition-all duration-350 cursor-default ${
                        t.active
                          ? "bg-emerald-900/30 text-emerald-400 border border-emerald-500/20 shadow-inner"
                          : "text-zinc-500 hover:text-zinc-350"
                      }`}
                    >
                      {t.label}
                    </div>
                  ))}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Total Apps", value: "8", accent: "from-emerald-500/10 to-teal-500/5 border-emerald-500/20", glow: "text-emerald-400" },
                    { label: "Active Keys", value: "3,842", accent: "from-emerald-500/10 to-teal-500/5 border-emerald-500/20", glow: "text-emerald-400" },
                    { label: "HWID Resets", value: "192", accent: "from-amber-500/10 to-orange-500/5 border-amber-500/20", glow: "text-amber-400" },
                    { label: "Active Sessions", value: "512", accent: "from-cyan-500/10 to-blue-500/5 border-cyan-500/20", glow: "text-cyan-400" },
                  ].map((s) => (
                    <div key={s.label} className={`rounded-xl border bg-gradient-to-br ${s.accent} p-3.5 hover:scale-[1.03] transition-transform`}>
                      <div className="text-[9px] uppercase tracking-widest font-bold text-zinc-550">{s.label}</div>
                      <div className={`text-2xl font-black font-mono mt-1 ${s.glow}`}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Applications list Mockup */}
                <div className="rounded-xl border border-emerald-500/15 bg-zinc-950/40 p-4 space-y-3">
                  <div className="text-[10px] uppercase tracking-widest font-bold text-emerald-400 mb-1 flex items-center justify-between">
                    <span>APPLICATIONS</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                  {[
                    { name: "Spectral X Loader", color: "bg-emerald-400 text-emerald-400", desc: "Ver. 1.2.4" },
                    { name: "Xiter Free", color: "bg-teal-400 text-teal-400", desc: "Ver. 0.9.1" },
                    { name: "Premium Xiter", color: "bg-amber-400 text-amber-400", desc: "Ver. 4.3.0" },
                  ].map((r) => (
                    <div key={r.name} className="flex items-center justify-between text-xs py-1 border-b border-emerald-500/5 last:border-b-0 hover:bg-emerald-950/20 rounded px-1 transition-colors">
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-200">{r.name}</span>
                        <span className="text-[10px] text-zinc-500">{r.desc}</span>
                      </div>
                      <span className={`w-2.5 h-2.5 rounded-full ${r.color} shadow-[0_0_8px_currentColor]`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card3D>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-28 relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/10 px-4 py-1.5 text-xs text-emerald-300 mb-4 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Features
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">Everything you need to ship</h2>
          <p className="text-text-muted max-w-xl mx-auto text-base">A comprehensive dashboard and licensing infrastructure built for developers of elite software.</p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Key, title: "License Keys", desc: "Generate, distribute and revoke keys with HWID / IP lock, custom time expirations and level-based access." },
            { icon: Users, title: "User Management", desc: "Built-in registration, login, banning, HWID tracking and extensive audit logs per application." },
            { icon: Server, title: "Secure Sessions", desc: "Token-based active sessions with strict IP & HWID enforcement and automatic time expiration." },
            { icon: BarChart3, title: "Logs & Variables", desc: "Receive real-time diagnostic logs and serve dynamic runtime variables to your app without recompiling." },
            { icon: Lock, title: "Multi-tenant Isolation", desc: "Manage multiple independent applications, each with its own isolated database, users, and license pools." },
            { icon: Globe, title: "Ultra-Fast REST API", desc: "Highly optimized HTTP endpoints compatible with standard license authorization flows globally." },
          ].map((f, i) => (
            <FeatureCard key={i} icon={f.icon} title={f.title} desc={f.desc} />
          ))}
        </div>
      </section>

      {/* API Integration Section */}
      <section id="api" className="max-w-6xl mx-auto px-6 py-20 relative">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/10 px-4 py-1.5 text-xs text-emerald-300 mb-5">
              <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" /> Multi-Platform API
            </div>
            <h2 className="text-4xl font-extrabold mb-5 text-white leading-tight">Integrate in under 5 minutes</h2>
            <p className="text-text-muted mb-8 leading-relaxed text-sm font-medium">
              We provide clean HTTP/HTTPS REST endpoints. No SDK lock-in. Drop integration calls into C++, C#, Python, Rust, Go, or any runtime capable of making network requests.
            </p>
            <div className="space-y-3 text-xs font-mono">
              {["/api/1.0/init", "/api/1.0/login", "/api/1.0/register", "/api/1.0/license", "/api/1.0/var", "/api/1.0/log"].map((p) => (
                <div key={p} className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl bg-[#030a05]/60 border border-emerald-500/10 hover:border-emerald-500/25 hover:bg-[#040e07] transition-all">
                  <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 rounded px-2.5 py-0.5">POST</span>
                  <span className="text-zinc-300 font-bold">{p}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-7 rounded-2xl border border-emerald-500/20 bg-[#030a05]/95 backdrop-blur overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            {/* Terminal Window Header */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-emerald-500/10 bg-[#04120a]">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              <div className="flex items-center gap-1.5 ml-3">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] text-emerald-300/80 font-mono font-semibold">terminal.sh</span>
              </div>
            </div>
            {/* Code editor body */}
            <pre className="p-6 text-xs font-mono text-zinc-405 overflow-x-auto leading-relaxed bg-zinc-950/50">
{`# 1) Inicializar sesión del loader
curl -X POST https://spectral-x.vercel.app/api/1.0/init \\
  -H "Content-Type: application/json" \\
  -d '{"appid":"YOUR_APP_ID","secret":"APP_SECRET","hwid":"CLIENT_HWID"}'

# 2) Registro del usuario con licencia
curl -X POST https://spectral-x.vercel.app/api/1.0/register \\
  -d '{"appid":"YOUR_APP_ID","secret":"APP_SECRET",
       "sessionid":"ACTIVE_SESSION_ID","username":"usuario_premium",
       "password":"password123","key":"Spectral X-XXXX-XXXX-XXXX-XXXX"}'

# 3) Inicio de sesión
curl -X POST https://spectral-x.vercel.app/api/1.0/login \\
  -d '{"appid":"YOUR_APP_ID","secret":"APP_SECRET",
       "sessionid":"ACTIVE_SESSION_ID","username":"usuario_premium",
       "password":"password123"}'`}
            </pre>
          </div>
        </div>
      </section>

      {/* Pricing / Subscriptions Section */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-28 relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/15 px-4 py-1.5 text-xs text-emerald-300 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Planes y Suscripciones
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">Escoge el nivel que necesites</h2>
          <p className="text-text-muted max-w-xl mx-auto text-sm font-semibold">Ofrecemos opciones adaptadas a tus necesidades de distribución de software y cheats.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto items-stretch">
          {/* Basic Plan (NEW) */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 backdrop-blur-xl p-8 hover:border-emerald-500/20 transition-all duration-350 flex flex-col justify-between shadow-2xl relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div>
              <div className="text-sm font-bold text-zinc-400 mb-2">NEW (Basic - Nivel 1)</div>
              <div className="flex items-baseline gap-1.5 mb-4">
                <span className="text-5xl font-black text-white font-mono">$4.00</span>
                <span className="text-xs text-zinc-500 font-semibold">/ mensual</span>
              </div>
              <div className="text-[10px] text-zinc-500 mb-8 font-extrabold uppercase tracking-widest bg-zinc-900 border border-zinc-800/80 rounded-md px-3 py-1 inline-block">
                Perfecto para empezar
              </div>
              <ul className="text-sm text-zinc-400 space-y-4 font-medium">
                {["Acceso básico al panel", "Crea licencias nivel 1", "Asignación simple de aplicaciones", "Límites estándar de HWID resets", "Soporte básico por ticket"].map((t) => (
                  <li key={t} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/login"
              className="mt-10 block text-center w-full py-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-200 transition-all shadow-inner"
            >
              Comenzar con NEW
            </Link>
          </div>

          {/* Panel Supreme (VIP - Premium) */}
          <div className="rounded-2xl border-2 border-emerald-500 bg-gradient-to-b from-[#04190c] to-[#010603] p-8 relative overflow-hidden flex flex-col justify-between shadow-2xl shadow-emerald-500/10 group">
            {/* VIP Rotating Ambient Lights */}
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-gradient-radial from-emerald-500/20 to-transparent blur-2xl pointer-events-none" />
            
            <div className="absolute top-4 right-4">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 rounded-full px-3 py-1.5 shadow-lg shadow-emerald-500/10">
                Recomendado
              </span>
            </div>
            
            <div>
              <div className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" />
                Panel Supreme (VIP - Nivel 2)
              </div>
              <div className="flex items-baseline gap-1.5 mb-4">
                <span className="text-5xl font-black text-white font-mono">$15.00</span>
                <span className="text-xs text-emerald-300/70 font-semibold">/ anual</span>
              </div>
              <div className="text-[10px] text-emerald-350 mb-8 font-extrabold uppercase tracking-widest bg-emerald-950/40 border border-emerald-500/25 rounded-md px-3 py-1 inline-block">
                Máxima potencia & branding
              </div>
              
              <ul className="text-sm text-zinc-200 space-y-4 font-semibold">
                {[
                  "Creación de licencias nivel 2 / VIP",
                  "Eliminación de prefijos fijos",
                  "Acceso premium para tus sub-resellers",
                  "Resets de HWID ilimitados",
                  "Personalización completa del loader",
                  "Soporte VIP prioritario"
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <Link
              href="/login"
              className="mt-10 block text-center w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-650 to-teal-650 hover:from-emerald-550 hover:to-teal-550 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.01] transition-all"
            >
              Obtener Panel Supreme
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="docs" className="border-t border-emerald-500/10 py-12 mt-16 bg-bg-card/25 backdrop-blur-xl relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-6 text-xs text-text-dim font-medium">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md overflow-hidden ring-1 ring-emerald-500/20">
              <Image src="/logo.png" alt="Spectral X" width={28} height={28} className="w-full h-full object-cover" />
            </div>
            <span className="text-zinc-300 font-semibold">© 2026 Spectral X — Self-hosted license auth</span>
          </div>
          <div className="flex items-center gap-6 font-semibold">
            <Link href="/docs" className="hover:text-emerald-400 transition-colors">Docs</Link>
            <Link href="/login" className="hover:text-emerald-400 transition-colors">Admin</Link>
            <span className="font-mono text-emerald-400/80 bg-emerald-950/20 border border-emerald-500/10 px-2 py-0.5 rounded">v1.0.0</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
