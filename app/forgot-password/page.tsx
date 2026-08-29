"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle, Shield } from "lucide-react";
import { ParticlesBackground } from "@/components/ParticlesBackground";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Error al enviar el correo.");
        return;
      }
      setSent(true);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#010309] text-zinc-100 overflow-hidden font-sans p-4">
      <ParticlesBackground />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,191,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,191,255,0.03)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-sky-500/15 via-blue-600/8 to-transparent blur-3xl animate-pulse" style={{ animationDuration: "8s" }} />
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        <div className="absolute -inset-2 bg-gradient-to-r from-sky-500/20 via-blue-600/15 to-sky-400/20 rounded-3xl blur-2xl opacity-60 pointer-events-none animate-pulse" />

        <div className="relative bg-[#050d1a]/90 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-8 shadow-2xl shadow-sky-500/5">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-sky-400 transition-colors mb-6">
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al inicio de sesión
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-sky-500/40 shadow-lg shadow-sky-500/20">
              <img src="/logo.png" alt="SecureX Auth" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-wider text-white uppercase">SecureX Auth</h1>
              <p className="text-[10px] text-sky-400/70 font-mono tracking-widest">RECUPERACIÓN DE CUENTA</p>
            </div>
          </div>

          {!sent ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1">¿Olvidaste tu contraseña?</h2>
                <p className="text-sm text-zinc-400">Ingresa tu correo electrónico y te enviaremos un enlace para restablecerla.</p>
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 tracking-wide uppercase">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="tu@correo.com"
                      className="w-full bg-[#080f1d] border border-sky-500/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-sky-400/60 focus:ring-1 focus:ring-sky-400/20 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  {loading ? "Enviando..." : "Enviar Enlace de Recuperación"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">¡Correo Enviado!</h2>
              <p className="text-sm text-zinc-400 mb-1">
                Si <strong className="text-zinc-200">{email}</strong> está registrado, recibirás un enlace en los próximos minutos.
              </p>
              <p className="text-xs text-zinc-500 mb-6">Revisa también tu carpeta de spam.</p>
              <Link href="/login" className="text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors">
                ← Volver al inicio de sesión
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
