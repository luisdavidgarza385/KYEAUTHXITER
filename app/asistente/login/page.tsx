"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert, Cpu, Lock, User, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
    <div className="min-h-screen relative flex items-center justify-center bg-[#020503] text-zinc-150 overflow-hidden font-sans p-4">
      {/* Background cyber grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none opacity-60" />
      
      {/* Ambient lighting */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-emerald-500/10 to-transparent blur-3xl" />
        <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] rounded-full bg-gradient-radial from-teal-500/5 to-transparent blur-3xl animate-pulse" />
      </div>

      <div className="w-full max-w-[440px] relative z-10">
        {/* Glow behind card */}
        <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-transparent blur-3xl rounded-3xl -z-10 animate-pulse pointer-events-none" style={{ animationDuration: "8s" }} />

        {/* Back Link */}
        <div className="mb-4">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 transition-colors font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al login principal
          </Link>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border border-emerald-500/20 bg-[#040c06]/80 backdrop-blur-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          {/* Avatar Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-550/10 border border-emerald-500/35 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-950/40">
            <Cpu className="w-8 h-8 text-emerald-400 animate-pulse" />
          </div>

          <h1 className="text-2xl font-black text-center text-white tracking-tight uppercase">
            Asistente Spectral X
          </h1>
          <p className="text-xs text-zinc-500 text-center mt-1.5 font-medium">
            Acceso restringido para el reseteo de licencias
          </p>

          <div className="mt-8">
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2">
                  Usuario del Asistente
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RESET 12 reset"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-11 bg-zinc-950/60 border border-emerald-500/15 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/30 text-white placeholder-zinc-650 rounded-xl px-4 pl-10 text-sm font-medium transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 bg-zinc-950/60 border border-emerald-500/15 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/30 text-white placeholder-zinc-650 rounded-xl px-4 pl-10 text-sm font-medium transition-all outline-none"
                  />
                </div>
              </div>

              {error && (
                <div className="text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg px-3.5 py-2.5 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-550 hover:to-teal-550 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-950/50 hover:shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Iniciando Asistente...
                  </>
                ) : (
                  "Acceder al Soporte"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
