import { RegisterForm } from "@/components/RegisterForm";
import { ParticlesBackground } from "@/components/ParticlesBackground";
import Link from "next/link";
import { Shield, Zap, Key, Lock } from "lucide-react";

export const metadata = { title: "Crear Cuenta — SecureX Auth" };

export default function RegisterPage() {
  return (
    <main className="min-h-screen relative flex items-center justify-center bg-[#010408] text-zinc-100 overflow-hidden font-sans">
      <ParticlesBackground />

      {/* Cyber grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,191,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,191,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none z-0 opacity-60" />

      {/* Glow orbs */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-1/4 w-[700px] h-[700px] rounded-full bg-gradient-radial from-sky-500/15 via-blue-600/8 to-transparent blur-3xl animate-pulse" style={{ animationDuration: "9s" }} />
        <div className="absolute bottom-[-20%] right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-radial from-cyan-500/10 to-transparent blur-3xl animate-pulse" style={{ animationDuration: "12s" }} />
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 z-10 flex flex-col lg:flex-row items-center justify-center gap-12 py-12">

        {/* Left: Brand panel */}
        <div className="hidden lg:flex flex-col gap-8 max-w-sm">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-sky-500/40 shadow-lg shadow-sky-500/20 group-hover:ring-sky-400 transition-all">
              <img src="/logo.png" alt="SecureX Auth" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wider bg-gradient-to-r from-white to-sky-300 bg-clip-text text-transparent uppercase">SecureX Auth</h1>
              <p className="text-[10px] tracking-[0.2em] text-sky-400/70 font-mono uppercase">Next-Gen Authentication</p>
            </div>
          </Link>

          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white leading-tight">
              Protege tu software<br />
              <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">con un clic.</span>
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Crea tu cuenta gratis y empieza a proteger tus aplicaciones con licencias, HWID lock y autenticación empresarial.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {[
              { icon: Shield, text: "Seguridad de grado empresarial" },
              { icon: Key, text: "Sistema de licencias avanzado" },
              { icon: Zap, text: "Infraestructura ultra-rápida" },
              { icon: Lock, text: "HWID Lock y anti-cheat integrado" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-zinc-300">
                <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-sky-400" />
                </div>
                {text}
              </div>
            ))}
          </div>

          <div className="px-4 py-3 rounded-xl bg-sky-950/30 border border-sky-500/15 text-xs text-zinc-400">
            🎁 <span className="text-zinc-200 font-semibold">Plan Gratuito incluido</span> — 2 aplicaciones + 60 licencias sin costo.
          </div>
        </div>

        {/* Right: Register card */}
        <div className="w-full max-w-[460px] relative">
          {/* Outer glow */}
          <div className="absolute -inset-3 bg-gradient-to-r from-sky-500/20 via-cyan-500/10 to-sky-400/20 rounded-3xl blur-2xl opacity-70 pointer-events-none animate-pulse" style={{ animationDuration: "5s" }} />

          <div className="relative bg-[#050d1a]/90 backdrop-blur-2xl border border-sky-500/20 rounded-2xl p-8 shadow-2xl shadow-sky-500/5">
            {/* Top badge */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg overflow-hidden ring-1 ring-sky-500/40 lg:hidden">
                <img src="/logo.png" alt="SecureX Auth" className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white tracking-wide">Crear Cuenta</h2>
                <p className="text-xs text-zinc-400">Únete a SecureX Auth — es gratis</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-bold tracking-wider">GRATIS</span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-sky-500/20 to-transparent mb-6" />

            <RegisterForm />
          </div>
        </div>

      </div>
    </main>
  );
}
