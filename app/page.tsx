import Link from "next/link";
import { Zap, Key, Users, Server, BarChart3, Lock, Globe, Sparkles, ArrowRight } from "lucide-react";
import Image from "next/image";
import { ParticlesBackground } from "@/components/ParticlesBackground";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-[#03000a]">
      <ParticlesBackground />
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] rounded-full bg-gradient-radial from-accent/15 via-purple-600/5 to-transparent blur-3xl" />
        <div className="absolute top-[40%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-radial from-indigo-600/10 to-transparent blur-3xl" />
        <div className="absolute top-[60%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-radial from-purple-500/8 to-transparent blur-3xl" />
      </div>

      <header className="sticky top-0 z-30 backdrop-blur-xl bg-bg/60 border-b border-border/40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg overflow-hidden ring-1 ring-accent/30 group-hover:ring-accent/60 transition shadow-lg shadow-accent/20">
              <Image src="/logo.png" alt="Guate Xiter" width={36} height={36} className="w-full h-full object-cover" priority />
            </div>
            <span className="font-bold tracking-tight text-[15px]">Guate Xiter</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-text-muted">
            <a href="#features" className="hover:text-text transition">Features</a>
            <a href="#api" className="hover:text-text transition">API</a>
            <a href="#docs" className="hover:text-text transition">Docs</a>
            <a href="#pricing" className="hover:text-text transition">Pricing</a>
            <Link href="/docs" className="hover:text-text transition">Support</Link>
          </nav>
          <div className="flex items-center gap-2.5">
            <Link href="/login" className="text-sm text-text-muted hover:text-text px-3 py-1.5 transition">Log in</Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white px-4 py-2 rounded-md shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-12 grid lg:grid-cols-2 gap-14 items-center relative">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-bg-card/60 backdrop-blur px-3.5 py-1.5 text-xs text-text-muted mb-7">
            <Zap className="w-3 h-3 text-accent-glow fill-accent-glow" /> Self-hosted license authentication
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.05]">
            <span className="text-text">Authentication</span>
            <br />
            <span className="text-text">made for</span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">everyone!</span>
          </h1>
          <p className="text-lg text-text-muted max-w-xl mb-9 leading-relaxed">
            Secure, scalable, and battle-tested authentication for your applications.
            Get started in minutes with our powerful REST APIs and ready-to-use SDKs.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 font-semibold bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white px-6 py-3 rounded-md shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all"
            >
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center font-semibold bg-bg-card/60 hover:bg-bg-card border border-border/60 text-text px-6 py-3 rounded-md transition-all"
            >
              View Documentation
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-7 text-xs text-text-dim">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
              99.9% uptime
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-sm shadow-violet-400/50" />
              Free forever
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
              Open source
            </div>
          </div>
        </div>

        <div className="relative animate-float">
          <div className="absolute -inset-8 bg-gradient-to-tr from-indigo-500/25 via-violet-500/20 to-purple-500/15 blur-3xl rounded-full animate-pulse-glow" />
          <div className="relative rounded-2xl border border-border/60 bg-bg-card/80 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/40 premium-card-3d">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60 bg-bg-secondary/40">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-sm shadow-[#ff5f57]/30" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e] shadow-sm shadow-[#febc2e]/30" />
                <span className="w-3 h-3 rounded-full bg-[#28c840] shadow-sm shadow-[#28c840]/30" />
              </div>
              <div className="ml-3 flex-1 text-[11px] text-text-dim font-mono truncate">guate-xiter.cc/dashboard</div>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Overview", active: true },
                  { label: "Apps", active: false },
                  { label: "Licenses", active: false },
                  { label: "Users", active: false },
                ].map((t) => (
                  <div
                    key={t.label}
                    className={`rounded-md px-3 py-2 text-xs font-medium text-center transition ${
                      t.active
                        ? "bg-bg-secondary text-text border border-border"
                        : "text-text-muted hover:text-text"
                    }`}
                  >
                    {t.label}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Total Apps", value: "4", accent: "from-blue-500/20 to-indigo-500/20" },
                  { label: "Active", value: "12", accent: "from-emerald-500/20 to-teal-500/20" },
                  { label: "Paused", value: "2", accent: "from-amber-500/20 to-orange-500/20" },
                  { label: "Sessions", value: "2", accent: "from-rose-500/20 to-pink-500/20" },
                ].map((s) => (
                  <div key={s.label} className={`rounded-md border border-border/60 bg-gradient-to-br ${s.accent} p-2.5`}>
                    <div className="text-[9px] uppercase tracking-wider text-text-dim">{s.label}</div>
                    <div className="text-xl font-bold font-mono mt-0.5">{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-md border border-border/60 bg-bg-secondary/30 p-3 space-y-2.5">
                {[
                  { name: "Guate Xiter Loader", color: "bg-emerald-400" },
                  { name: "Xiter Free", color: "bg-violet-400" },
                  { name: "Premium Xiter", color: "bg-amber-400" },
                ].map((r) => (
                  <div key={r.name} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-text">{r.name}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${r.color} shadow-sm`} style={{ boxShadow: `0 0 6px currentColor` }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3.5 py-1.5 text-xs text-accent-glow mb-4">
            <Sparkles className="w-3 h-3" /> Features
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Everything you need to ship</h2>
          <p className="text-text-muted max-w-xl mx-auto">A complete license & user management platform with everything a modern software needs.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Key, title: "License Keys", desc: "Generate, distribute and revoke keys with HWID / IP lock, time expiry and level-based access." },
            { icon: Users, title: "User Management", desc: "Built-in registration, login, banning, HWID tracking and audit trail per application." },
            { icon: Server, title: "Sessions", desc: "Token-based sessions with IP & HWID enforcement and automatic 24h expiry." },
            { icon: BarChart3, title: "Logs & Variables", desc: "Receive runtime logs and serve dynamic variables to your app without redeploys." },
            { icon: Lock, title: "Multi-tenant", desc: "Run multiple applications, each with isolated users, licenses and signing secrets." },
            { icon: Globe, title: "Simple API", desc: "REST endpoints compatible with the standard init/login/register/license flow used in the industry." },
          ].map((f, i) => (
            <div key={i} className="group relative rounded-xl border border-border/60 bg-bg-card/40 backdrop-blur p-5 hover:border-accent/40 hover:bg-bg-card/60 transition">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-violet-500/20 border border-accent/30 flex items-center justify-center mb-3 group-hover:from-accent/30 group-hover:to-violet-500/30 transition">
                <f.icon className="w-4 h-4 text-accent-glow" />
              </div>
              <h3 className="font-semibold mb-1.5">{f.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="api" className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3.5 py-1.5 text-xs text-accent-glow mb-5">
              <Zap className="w-3 h-3 fill-accent-glow" /> One API, every platform
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Integrate in 5 minutes</h2>
            <p className="text-text-muted mb-7 leading-relaxed">
              Plain HTTP endpoints, no SDK lock-in. Drop the calls into your C++, C#, Python, Node, or any codebase that can speak HTTP.
            </p>
            <div className="space-y-2 text-sm font-mono">
              {["/api/1.0/init", "/api/1.0/login", "/api/1.0/register", "/api/1.0/license", "/api/1.0/var", "/api/1.0/log"].map((p) => (
                <div key={p} className="flex items-center gap-3 px-3.5 py-2.5 rounded-md bg-bg-card/60 border border-border/60">
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded px-1.5 py-0.5">POST</span>
                  <span className="text-text-muted">{p}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-bg-card/60 backdrop-blur overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border/60 bg-bg-secondary/40">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-2 text-[11px] text-text-dim font-mono">curl</span>
            </div>
            <pre className="p-5 text-xs font-mono text-text-muted overflow-x-auto leading-relaxed">
{`# 1) Init session
curl -X POST https://guate-xiter.cc/api/1.0/init \\
  -H "Content-Type: application/json" \\
  -d '{"appid":"YOUR_APP","secret":"...","hwid":"abc"}'

# 2) Register with license
curl -X POST https://guate-xiter.cc/api/1.0/register \\
  -d '{"appid":"YOUR_APP","secret":"...",
       "sessionid":"...","username":"u1",
       "password":"p1","key":"Guate Xiter-XXXX-XXXX-XXXX-XXXX"}'

# 3) Login
curl -X POST https://guate-xiter.cc/api/1.0/login \\
  -d '{"appid":"YOUR_APP","secret":"...",
       "sessionid":"...","username":"u1",
       "password":"p1"}'`}
            </pre>
          </div>
        </div>
      </section>

      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24 relative z-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/5 px-3.5 py-1.5 text-xs text-purple-400 mb-4">
            <Sparkles className="w-3 h-3 text-purple-400 fill-purple-400" /> Planes y Suscripciones
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-zinc-100">Escoge el nivel que necesites</h2>
          <p className="text-zinc-500 max-w-xl mx-auto text-sm font-medium">Ofrecemos opciones adaptadas a tus necesidades de distribución de software y cheats.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* NEW Plan */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 backdrop-blur-xl p-8 hover:border-purple-500/20 transition-all flex flex-col justify-between">
            <div>
              <div className="text-sm font-bold text-zinc-400 mb-1.5">NEW (Basic - Nivel 1)</div>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-4xl font-black text-zinc-100 font-mono">$4.00</span>
                <span className="text-xs text-zinc-500 font-medium">/ mensual</span>
              </div>
              <div className="text-[11px] text-zinc-500 mb-6 font-bold uppercase tracking-wider">Perfecto para empezar</div>
              <ul className="text-sm text-zinc-400 space-y-3 font-medium">
                {["Acceso básico al panel", "Crea licencias nivel 1", "Asignación simple de aplicaciones", "Límites estándar de HWID resets", "Soporte básico por ticket"].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">✓</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/login"
              className="mt-8 block text-center w-full py-2.5 rounded-lg border border-zinc-800 bg-zinc-900/40 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-zinc-800 hover:text-zinc-150 transition-all"
            >
              Comenzar con NEW
            </Link>
          </div>

          {/* Panel Supreme Plan */}
          <div className="rounded-xl border border-purple-500/35 bg-gradient-to-br from-purple-950/20 to-indigo-950/10 p-8 relative overflow-hidden flex flex-col justify-between shadow-lg shadow-purple-900/10">
            <div className="absolute top-4 right-4">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-purple-400 bg-purple-950/40 border border-purple-500/30 rounded px-2.5 py-0.5">Recomendado</span>
            </div>
            <div>
              <div className="text-sm font-bold text-purple-400 mb-1.5">Panel Supreme (VIP - Nivel 2)</div>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-4xl font-black text-zinc-100 font-mono">$15.00</span>
                <span className="text-xs text-zinc-500 font-medium">/ anual</span>
              </div>
              <div className="text-[11px] text-purple-400/80 mb-6 font-bold uppercase tracking-wider">Máxima potencia & branding</div>
              <ul className="text-sm text-zinc-300 space-y-3 font-medium">
                {["Creación de licencias nivel 2 / VIP", "Eliminación de prefijos fijos", "Acceso premium para tus sub-resellers", "Resets de HWID ilimitados", "Personalización completa del loader", "Soporte VIP prioritario"].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">✓</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/login"
              className="mt-8 block text-center w-full py-2.5 rounded-lg bg-purple-650 hover:bg-purple-550 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-purple-500/20 transition-all"
            >
              Obtener Panel Supreme
            </Link>
          </div>
        </div>
      </section>

      <footer id="docs" className="border-t border-border/40 py-10 mt-10 bg-bg-card/30 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-xs text-text-dim">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md overflow-hidden ring-1 ring-accent/30">
              <Image src="/logo.png" alt="Guate Xiter" width={28} height={28} className="w-full h-full object-cover" />
            </div>
            <span>© 2026 Guate Xiter — Self-hosted license auth</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/docs" className="hover:text-text transition">Docs</Link>
            <Link href="/login" className="hover:text-text transition">Admin</Link>
            <span className="font-mono">v1.0.0</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
