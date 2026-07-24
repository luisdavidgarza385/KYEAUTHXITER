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
    const savedPassword = localStorage.getItem("ka_remember_password");
    const savedAppId = localStorage.getItem("ka_remember_app_id");
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
    if (savedPassword) {
      setPassword(savedPassword);
    }
    if (savedAppId) {
      setAppId(savedAppId);
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
        localStorage.setItem("ka_remember_password", password);
        localStorage.setItem("ka_remember_app_id", appId);
        localStorage.setItem("ka_remember_role", roleMode);
      } else {
        localStorage.removeItem("ka_remember_email");
        localStorage.removeItem("ka_remember_password");
        localStorage.removeItem("ka_remember_app_id");
        localStorage.removeItem("ka_remember_role");
      }

      // Admin y Reseller usan el mismo endpoint
      const payload: Record<string, string | boolean> = { email, password, remember };
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

        <div className="mt-6 pt-4 border-t border-border/60">
          <p className="text-[10px] text-center font-bold uppercase tracking-wider text-text-muted mb-3">
            O continuar con
          </p>
          <div className="flex justify-center gap-3">
            {/* Discord */}
            <a
              href="/api/auth/discord"
              className="w-10 h-10 rounded-xl bg-bg-secondary hover:bg-[#5865F2]/20 border border-border hover:border-[#5865F2]/50 flex items-center justify-center text-text-muted hover:text-white transition-all duration-200"
              title="Discord"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
              </svg>
            </a>

            {/* Apple */}
            <a
              href="/api/auth/apple"
              className="w-10 h-10 rounded-xl bg-bg-secondary hover:bg-white/10 border border-border hover:border-text/50 flex items-center justify-center text-text-muted hover:text-text transition-all duration-200"
              title="Apple"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.6.69-1.12 1.83-.98 2.94 1.1.09 2.22-.55 2.91-1.37z" />
              </svg>
            </a>

            {/* Google */}
            <a
              href="/api/auth/google"
              className="w-10 h-10 rounded-xl bg-bg-secondary hover:bg-[#4285F4]/20 border border-border hover:border-[#4285F4]/50 flex items-center justify-center text-text-muted hover:text-text transition-all duration-200"
              title="Google"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.13-5.136 4.13A5.86 5.86 0 0 1 8.1 12.67a5.86 5.86 0 0 1 5.89-5.86c1.64 0 3.13.67 4.22 1.76l3.13-3.13A10.15 10.15 0 0 0 13.99 2c-5.65 0-10.23 4.58-10.23 10.23s4.58 10.23 10.23 10.23c5.44 0 9.87-4.14 10.12-9.5h-11.87v-2.675z" />
              </svg>
            </a>

            {/* Telegram */}
            <a
              href="/api/auth/telegram"
              className="w-10 h-10 rounded-xl bg-bg-secondary hover:bg-[#0088cc]/20 border border-border hover:border-[#0088cc]/50 flex items-center justify-center text-text-muted hover:text-text transition-all duration-200"
              title="Telegram"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.78-1.16 3.35-1.36 3.73-1.37.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z" />
              </svg>
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}
