"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, Loader2, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";
import { ParticlesBackground } from "@/components/ParticlesBackground";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setValidating(false);
      setTokenValid(false);
      return;
    }
    fetch(`/api/auth/reset-password?token=${token}`)
      .then((r) => r.json())
      .then((d) => setTokenValid(d.valid === true))
      .catch(() => setTokenValid(false))
      .finally(() => setValidating(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Error al restablecer la contraseña.");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative bg-[#050d1a]/90 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-8 shadow-2xl shadow-sky-500/5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-sky-500/40 shadow-lg shadow-sky-500/20">
          <img src="/logo.png" alt="SecureX Auth" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-base font-extrabold tracking-wider text-white uppercase">SecureX Auth</h1>
          <p className="text-[10px] text-sky-400/70 font-mono tracking-widest">NUEVA CONTRASEÑA</p>
        </div>
      </div>

      {validating && (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 text-sky-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-zinc-400">Validando enlace...</p>
        </div>
      )}

      {!validating && !tokenValid && !success && (
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Enlace Inválido</h2>
          <p className="text-sm text-zinc-400 mb-6">Este enlace de recuperación no es válido o ya expiró (duran 1 hora).</p>
          <Link href="/forgot-password" className="text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors">
            Solicitar un nuevo enlace →
          </Link>
        </div>
      )}

      {!validating && tokenValid && !success && (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-1">Nueva Contraseña</h2>
            <p className="text-sm text-zinc-400">Elige una contraseña segura para tu cuenta.</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 tracking-wide uppercase">Nueva Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-[#080f1d] border border-sky-500/20 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-sky-400/60 focus:ring-1 focus:ring-sky-400/20 transition-all"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 tracking-wide uppercase">Confirmar Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type={showPass ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="Repite la contraseña"
                  className="w-full bg-[#080f1d] border border-sky-500/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-sky-400/60 focus:ring-1 focus:ring-sky-400/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !password || !confirm}
              className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {loading ? "Guardando..." : "Restablecer Contraseña"}
            </button>
          </form>
        </>
      )}

      {success && (
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-emerald-400" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">¡Contraseña Restablecida!</h2>
          <p className="text-sm text-zinc-400 mb-1">Tu contraseña fue actualizada correctamente.</p>
          <p className="text-xs text-zinc-500 mb-4">Redirigiendo al inicio de sesión en 3 segundos...</p>
          <Link href="/login" className="text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors">
            Ir al inicio de sesión →
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#010309] text-zinc-100 overflow-hidden font-sans p-4">
      <ParticlesBackground />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,191,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,191,255,0.03)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-sky-500/15 via-blue-600/8 to-transparent blur-3xl animate-pulse" style={{ animationDuration: "8s" }} />
      </div>
      <div className="w-full max-w-[420px] relative z-10">
        <div className="absolute -inset-2 bg-gradient-to-r from-sky-500/20 via-blue-600/15 to-sky-400/20 rounded-3xl blur-2xl opacity-60 pointer-events-none animate-pulse" />
        <Suspense fallback={<div className="text-center text-zinc-400 text-sm py-8">Cargando...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
