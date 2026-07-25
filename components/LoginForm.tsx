"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Key, User, ShieldAlert, Mail, UserPlus, LogIn, CheckCircle2, Sparkles } from "lucide-react";
import styles from "@/app/login/auth.module.css";

export function LoginForm() {
  const router = useRouter();
  const [tabMode, setTabMode] = useState<"login" | "register">("login");
  const [roleMode, setRoleMode] = useState<"admin" | "reseller">("admin");
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [appId, setAppId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success Receipt Modal state (Matching Image 3)
  const [receiptData, setReceiptData] = useState<{ email: string; credits: number } | null>(null);

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

  async function onSubmitLogin(e: React.FormEvent) {
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

      // Audio feedback
      const audio = new Audio("/welcome.ogg");
      audio.volume = 0.8;
      audio.play().catch(() => {
        const fallbackAudio = new Audio("/welcome.wav");
        fallbackAudio.volume = 0.8;
        fallbackAudio.play().catch(() => {});
      });

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error de red");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmitRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 5) {
      setError("La contraseña debe tener al menos 5 caracteres");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Error al crear la cuenta");
        return;
      }

      // Show Receipt Modal matching Image 3 layout
      setReceiptData({ email, credits: 3000 });
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  // If receipt modal is active after register
  if (receiptData) {
    return (
      <div className="space-y-6 text-center animate-fade-in">
        {/* Receipt Header Container matching Image 3 */}
        <div className="bg-[#030914] border border-sky-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-sky-500/40 shadow-lg shadow-sky-500/30 mx-auto">
            <img src="/logo.png" alt="Sukuna Logo" className="w-full h-full object-cover" />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400 font-mono bg-sky-950/60 px-3 py-1 rounded-full border border-sky-500/30">
              REGISTRO EXITOSO
            </span>
            <h3 className="text-xl font-extrabold text-white mt-2">
              Hola <span className="text-sky-400">{receiptData.email.split("@")[0].toUpperCase()}</span>,
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Tu cuenta ha sido creada exitosamente en <strong className="text-sky-300">SecureX Auth</strong>.
            </p>
          </div>

          <div className="bg-black/60 border border-sky-500/20 rounded-xl p-4 text-left space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center text-zinc-300">
              <span className="text-zinc-500">CORREO:</span>
              <span className="text-sky-400 font-bold">{receiptData.email}</span>
            </div>
            <div className="flex justify-between items-center text-zinc-300">
              <span className="text-zinc-500">SALDO ASIGNADO:</span>
              <span className="text-emerald-400 font-bold">+$3,000 CRÉDITOS</span>
            </div>
            <div className="flex justify-between items-center text-zinc-300">
              <span className="text-zinc-500">LÍMITES PLAN GRATUITO:</span>
              <span className="text-sky-300 font-bold">60 LICENCIAS / 50 USUARIOS</span>
            </div>
            <div className="flex justify-between items-center text-zinc-300 pt-1 border-t border-zinc-800">
              <span className="text-zinc-500">ESTADO:</span>
              <span className="text-emerald-400 font-bold uppercase">OPERATIVO Y ACTIVO</span>
            </div>
          </div>

          <button
            onClick={() => {
              router.push("/dashboard");
              router.refresh();
            }}
            className="w-full h-11 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-sky-500/30 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Entrar al Panel de Control
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Main Tab Switcher: Iniciar Sesión vs Registrarse */}
      <div className="grid grid-cols-2 bg-[#020712] p-1.5 rounded-xl border border-sky-500/20">
        <button
          type="button"
          onClick={() => {
            setTabMode("login");
            setError(null);
          }}
          className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
            tabMode === "login"
              ? "bg-sky-500 text-white shadow-md shadow-sky-500/30"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          Iniciar Sesión
        </button>

        <button
          type="button"
          onClick={() => {
            setTabMode("register");
            setError(null);
          }}
          className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
            tabMode === "register"
              ? "bg-sky-500 text-white shadow-md shadow-sky-500/30"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          Registrarse
        </button>
      </div>

      {tabMode === "login" ? (
        <>
          {/* Sub-Role Selector for Login */}
          <div className="flex bg-[#040810] p-1 rounded-lg border border-sky-500/10 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setRoleMode("admin");
                setError(null);
              }}
              className={`flex-1 py-1.5 font-bold rounded transition-all ${
                roleMode === "admin"
                  ? "bg-sky-950/40 text-sky-400 border border-sky-500/30"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleMode("reseller");
                setError(null);
              }}
              className={`flex-1 py-1.5 font-bold rounded transition-all ${
                roleMode === "reseller"
                  ? "bg-sky-950/40 text-sky-400 border border-sky-500/30"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Revendedor
            </button>
          </div>

          <form onSubmit={onSubmitLogin} className="space-y-4">
            <div>
              <label className={styles.inputLabel}>Correo o Usuario</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                  <User className="w-4 h-4 text-zinc-400" />
                </span>
                <input
                  type="text"
                  className={`${styles.premiumInput} pl-10`}
                  style={{ paddingLeft: "42px" }}
                  placeholder="e.g. tu_correo@gmail.com"
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
                  {showPassword ? <EyeOff className="w-4 h-4 text-zinc-500" /> : <Eye className="w-4 h-4 text-zinc-500" />}
                </button>
              </div>
            </div>

            {roleMode === "reseller" && (
              <div className="animate-fade-in-down">
                <label className={styles.inputLabel}>ID de aplicación (opcional)</label>
                <input
                  type="text"
                  className={styles.premiumInput}
                  placeholder="e.g. app-123456"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                />
              </div>
            )}

            {error && (
              <div className={styles.errorAlert}>
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-sky-500 focus:ring-sky-500/20"
                />
                <span>Recordar en este navegador</span>
              </label>
            </div>

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "INICIAR SESIÓN"
              )}
            </button>
          </form>
        </>
      ) : (
        /* Manual Register Form */
        <form onSubmit={onSubmitRegister} className="space-y-4 animate-fade-in">
          <div>
            <label className={styles.inputLabel}>Correo Electrónico</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                <Mail className="w-4 h-4 text-zinc-400" />
              </span>
              <input
                type="email"
                className={`${styles.premiumInput} pl-10`}
                style={{ paddingLeft: "42px" }}
                placeholder="ejemplo@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className={styles.inputLabel}>Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`${styles.premiumInput} pr-10`}
                placeholder="Mínimo 5 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.eyeBtn}
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-zinc-500" /> : <Eye className="w-4 h-4 text-zinc-500" />}
              </button>
            </div>
          </div>

          <div>
            <label className={styles.inputLabel}>Confirmar Contraseña</label>
            <input
              type="password"
              className={styles.premiumInput}
              placeholder="Repite la contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className={styles.errorAlert}>
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-sky-950/20 border border-sky-500/20 rounded-xl p-3 text-[11px] text-sky-300 space-y-1 font-mono">
            <div className="flex items-center gap-1.5 font-bold text-sky-400">
              <Sparkles className="w-3.5 h-3.5" />
              BENEFICIOS INICIALES:
            </div>
            <div>• $3,000 Créditos gratuitos asignados</div>
            <div>• Hasta 60 Licencias y 50 Usuarios</div>
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creando Cuenta...
              </>
            ) : (
              "CREAR CUENTA GRATUITA"
            )}
          </button>
        </form>
      )}

      {/* Assistant link */}
      <div className="text-center pt-2">
        <Link
          href="/asistente/login"
          className="text-xs text-sky-400 hover:text-sky-300 font-semibold hover:underline transition-all"
        >
          Resetea tus keys con nuestro asistente virtual
        </Link>
      </div>

      {/* OAuth Buttons */}
      <div className="pt-3 border-t border-zinc-800/60">
        <p className="text-[10px] text-center text-zinc-500 uppercase font-mono tracking-widest mb-3">
          O CONTINUAR CON
        </p>

        <div className="grid grid-cols-2 gap-3">
          <a
            href="/api/auth/discord"
            className="flex items-center justify-center gap-2 py-2.5 bg-black/60 border border-zinc-800 hover:border-sky-500/40 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all shadow-sm"
          >
            <svg className="w-4 h-4 fill-current text-[#5865F2]" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Discord
          </a>

          <a
            href="/api/auth/google"
            className="flex items-center justify-center gap-2 py-2.5 bg-black/60 border border-zinc-800 hover:border-sky-500/40 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all shadow-sm"
          >
            <svg className="w-4 h-4 fill-current text-[#EA4335]" viewBox="0 0 24 24">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
            </svg>
            Google
          </a>
        </div>
      </div>
    </div>
  );
}
