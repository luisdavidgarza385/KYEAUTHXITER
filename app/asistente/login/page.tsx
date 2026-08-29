"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert, Cpu, Lock, User, ArrowLeft, Sparkles, Bot, KeyRound } from "lucide-react";
import Link from "next/link";
import { ParticlesBackground } from "@/components/ParticlesBackground";

export default function AssistantLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/assistant/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Credenciales incorrectas");
        return;
      }

      router.push("/asistente");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#010309] text-zinc-150 overflow-hidden font-sans p-4">
      {/* Dynamic Floating Particles */}
      <ParticlesBackground />

      {/* Cyber Network Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,191,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,191,255,0.04)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none opacity-80" />
      
      {/* High-Tech Glowing Orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-gradient-radial from-sky-500/20 via-blue-600/10 to-transparent blur-3xl animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute bottom-[-15%] right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-radial from-indigo-500/15 to-transparent blur-3xl animate-pulse" style={{ animationDuration: "10s" }} />
      </div>

      <div className="w-full max-w-[460px] relative z-10">
        {/* Outer Pulsing Glow */}
        <div className="absolute -inset-2 bg-gradient-to-r from-sky-500/30 via-blue-600/20 to-sky-400/30 rounded-3xl blur-2xl opacity-75 pointer-events-none animate-pulse" />

        {/* Top Back Link */}
        <div className="mb-4 flex items-center justify-between">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-sky-300 hover:text-white transition-colors font-bold uppercase tracking-wider bg-sky-950/50 border border-sky-500/30 px-3 py-1.5 rounded-xl backdrop-blur-md">
            <ArrowLeft className="w-4 h-4" />
            Volver al login principal
          </Link>
          <span className="text-[10px] font-mono text-sky-400/80 uppercase font-bold tracking-widest bg-black/40 px-2.5 py-1 rounded-lg border border-sky-500/20">
            SECUREX AI V2.5
          </span>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl border border-sky-500/40 bg-[#040b1a]/95 backdrop-blur-2xl p-8 md:p-9 shadow-[0_25px_60px_rgba(0,0,0,0.95)] relative overflow-hidden">
          
          {/* Top Decorative Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-sky-400 animate-pulse" />

          {/* Sukuna Avatar Container with Rotating Rings */}
          <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-sky-500/20 border border-sky-500/40 rotate-45 animate-spin pointer-events-none" style={{ animationDuration: "15s" }} />
            <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-sky-500/60 shadow-xl shadow-sky-500/40 relative z-10 group">
              <img src="/logo.png" alt="Sukuna Logo" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-sky-400 border-2 border-[#040b1a] z-20 animate-ping" />
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-950/60 border border-sky-500/30 text-sky-300 text-[10px] font-extrabold uppercase tracking-widest mb-2 font-mono shadow-inner">
              <Sparkles className="w-3 h-3 text-sky-400 animate-pulse" />
              SISTEMA DE ASISTENCIA VIRTUAL
            </div>
            <h1 className="text-2xl font-black text-center text-white tracking-tight uppercase">
              Asistente SecureX Auth
            </h1>
            <p className="text-xs text-zinc-400 text-center mt-1.5 font-medium leading-relaxed">
              Acceso restringido para el reseteo automático de licencias y soporte de HWID
            </p>
          </div>

          <div className="mt-7">
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-sky-400 mb-1.5 font-mono">
                  USUARIO DEL ASISTENTE
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. reset global"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-12 bg-black/80 border border-sky-500/30 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 text-white placeholder-zinc-600 rounded-xl px-4 pl-10 text-xs font-semibold transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-sky-400 mb-1.5 font-mono">
                  CONTRASEÑA
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 bg-black/80 border border-sky-500/30 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 text-white placeholder-zinc-600 rounded-xl px-4 pl-10 text-xs font-semibold transition-all outline-none"
                  />
                </div>
              </div>

              {error && (
                <div className="text-xs text-red-400 bg-red-950/40 border border-red-500/30 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-sky-500 via-blue-600 to-sky-500 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Iniciando Sesión...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    Acceder al Soporte
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
