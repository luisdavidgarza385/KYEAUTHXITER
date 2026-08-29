"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, User, Mail, Lock, ShieldCheck, ArrowRight, CheckCircle } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (username.length < 3) {
      setError("El nombre de usuario debe tener al menos 3 caracteres.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!agree) {
      setError("Debes aceptar los Términos de Servicio.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email || username, password, username }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Error al crear la cuenta.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error de red.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Username */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-sky-400/80 mb-1.5">Usuario</label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Elige un nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full bg-black/50 border border-sky-500/20 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-sky-400/60 focus:ring-1 focus:ring-sky-400/20 transition-all"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-sky-400/80 mb-1.5">Correo Electrónico</label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-black/50 border border-sky-500/20 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-sky-400/60 focus:ring-1 focus:ring-sky-400/20 transition-all"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-sky-400/80 mb-1.5">Contraseña</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full bg-black/50 border border-sky-500/20 text-white rounded-xl pl-10 pr-10 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-sky-400/60 focus:ring-1 focus:ring-sky-400/20 transition-all"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-sky-400 transition-colors">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-sky-400/80 mb-1.5">Confirmar Contraseña</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Repite tu contraseña"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full bg-black/50 border border-sky-500/20 text-white rounded-xl pl-10 pr-10 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-sky-400/60 focus:ring-1 focus:ring-sky-400/20 transition-all"
          />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-sky-400 transition-colors">
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Terms */}
      <label className="flex items-start gap-3 cursor-pointer select-none group">
        <div className="relative mt-0.5">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="sr-only"
          />
          <div className={`w-4 h-4 rounded border transition-all ${agree ? "bg-sky-500 border-sky-500" : "bg-transparent border-zinc-600 group-hover:border-sky-500/50"}`}>
            {agree && <CheckCircle className="w-4 h-4 text-white absolute inset-0" />}
          </div>
        </div>
        <span className="text-xs text-zinc-400 leading-relaxed">
          Acepto los{" "}
          <Link href="/terms" className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors">
            Términos de Servicio
          </Link>{" "}
          y la{" "}
          <Link href="/privacy" className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors">
            Política de Privacidad
          </Link>
        </span>
      </label>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-sm">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 hover:-translate-y-0.5 active:translate-y-0"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Creando cuenta...</>
        ) : (
          <><ShieldCheck className="w-4 h-4" /> Crear Cuenta</>
        )}
      </button>

      <p className="text-center text-xs text-zinc-500 pt-1">
        ¿Ya tienes una cuenta?{" "}
        <Link href="/login" className="text-sky-400 hover:text-sky-300 font-semibold transition-colors">
          Iniciar sesión →
        </Link>
      </p>
    </form>
  );
}
