"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Key, User, ShieldAlert } from "lucide-react";
import styles from "@/app/login/auth.module.css";

export function LoginForm() {
  const router = useRouter();
  const [roleMode, setRoleMode] = useState<"admin" | "reseller">("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [appId, setAppId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem("ka_remember_email");
    const savedRole = localStorage.getItem("ka_remember_role") as "admin" | "reseller" | null;
    const savedRemember = localStorage.getItem("ka_remember_preference");
    
    if (savedRemember !== null) {
      setRemember(savedRemember === "true");
    } else {
      setRemember(true);
    }
    
    if (savedEmail) {
      setEmail(savedEmail);
    }
    if (savedRole) {
      setRoleMode(savedRole);
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      localStorage.setItem("ka_remember_preference", remember ? "true" : "false");
      if (remember) {
        localStorage.setItem("ka_remember_email", email);
        localStorage.setItem("ka_remember_role", roleMode);
      } else {
        localStorage.removeItem("ka_remember_email");
        localStorage.removeItem("ka_remember_role");
      }

      // Admin y Reseller usan el mismo endpoint
      const payload: Record<string, string> = { email, password };
      if (roleMode === "reseller") {
        payload.appId = appId;
      }
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Credenciales inválidas");
        return;
      }

      // Reproducir audio de bienvenida
      const audio = new Audio("/welcome.ogg");
      audio.volume = 0.8;
      audio.play().catch(() => {
        const fallbackAudio = new Audio("/welcome.wav");
        fallbackAudio.volume = 0.8;
        fallbackAudio.play().catch((e) => console.error("Audio error:", e));
      });

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Role Toggle Selector - 2 tabs */}
      <div className="flex bg-[#040c06] p-1.5 rounded-xl border border-emerald-500/10">
        <button
          type="button"
          onClick={() => {
            setRoleMode("admin");
            setError(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
            roleMode === "admin"
              ? "bg-emerald-950/30 text-emerald-400 border border-emerald-900/40 shadow-sm"
              : "text-zinc-500 hover:text-zinc-350"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          Admin
        </button>
        <button
          type="button"
          onClick={() => {
            setRoleMode("reseller");
            setError(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
            roleMode === "reseller"
              ? "bg-emerald-950/30 text-emerald-400 border border-emerald-900/40 shadow-sm"
              : "text-zinc-500 hover:text-zinc-350"
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          Revendedor
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className={styles.inputLabel}>Usuario</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-550">
              <User className="w-4 h-4 text-zinc-650" />
            </span>
            <input
              type="text"
              className={`${styles.premiumInput} pl-10`}
              style={{ paddingLeft: "42px" }}
              placeholder="e.g. VENDEDORES"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
        </div>

        <div>
          <label className={styles.inputLabel}>Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className={`${styles.premiumInput} pr-10`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.eyeBtn}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4 text-zinc-550" /> : <Eye className="w-4 h-4 text-zinc-550" />}
            </button>
          </div>
        </div>

        {/* Conditional Application ID field for resellers */}
        {roleMode === "reseller" && (
          <div className="animate-fade-in-down">
            <label className={styles.inputLabel}>ID de aplicación</label>
            <input
              type="text"
              className={styles.premiumInput}
              placeholder="Ingrese su ID de aplicación"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              required
            />
          </div>
        )}

        <div className="flex items-center justify-between mt-3 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-zinc-200 select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded accent-emerald-500 cursor-pointer border border-zinc-850"
            />
            <span>Recordar en este navegador</span>
          </label>
        </div>

        {error && (
          <div className="text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg px-3.5 py-2 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button type="submit" className={styles.premiumBtn} disabled={loading}>
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Iniciando sesión...</>
          ) : (
            "Iniciar Sesión"
          )}
        </button>

        <div className="text-center pt-2">
          <Link
            href="/asistente/login"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors hover:underline decoration-dotted underline-offset-4"
          >
            Resetear keys con nuestro asistente
          </Link>
        </div>
      </form>
    </div>
  );
}
