"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Key, User, ShieldAlert, Mail, UserPlus, LogIn, CheckCircle2, Sparkles, Shield, Copy, Check } from "lucide-react";
import styles from "@/app/login/auth.module.css";

export function LoginForm() {
  const router = useRouter();
  const [tabMode, setTabMode] = useState<"login" | "register">("login");
  const [roleMode, setRoleMode] = useState<"admin" | "reseller">("admin");
  
  // Form fields
  const [usernameInput, setUsernameInput] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [appId, setAppId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Success Receipt Modal state (Matching Image 3)
  const [receiptData, setReceiptData] = useState<{ email: string; username: string; key: string } | null>(null);

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
      } else {
        localStorage.removeItem("ka_remember_email");
        localStorage.removeItem("ka_remember_password");
      }

      const payload: Record<string, string | boolean> = { email, password, remember, roleMode };
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
    if (!email || !email.includes("@")) {
      setError("Por favor ingresa un correo electrónico válido");
      return;
    }

    setLoading(true);
    try {
      const regEmail = email.trim().toLowerCase();
      const regUser = usernameInput.trim() || regEmail.split("@")[0];
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: regUser, email: regEmail, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Error al crear la cuenta");
        return;
      }

      const generatedKey = `SXAU-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-4LQZ`;

      // Show Receipt Modal matching Image 3 (Right Card)
      setReceiptData({ email: regEmail, username: regUser, key: generatedKey });
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  // If receipt modal is active after register (Matching Image 3 Right Card Design)
  if (receiptData) {
    return (
      <div className="space-y-5 text-left animate-fade-in font-sans">
        {/* Receipt Container matching Image 3 Right Card */}
        <div className="bg-white text-zinc-900 rounded-3xl p-6 shadow-2xl space-y-4 border border-purple-100">
          
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight">
                Autenticación SecureX Auth
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Tu Keyau ha sido autenticada correctamente.
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/30">
              <Shield className="w-5 h-5" />
            </div>
          </div>

          {/* Keyau Autenticada Badge Box */}
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
              ✓
            </div>
            <div>
              <h4 className="text-xs font-bold text-purple-900">Keyau autenticada</h4>
              <p className="text-[11px] text-purple-700 mt-0.5 leading-relaxed">
                La licencia SecureX Auth está activa y funcionando correctamente.
              </p>
            </div>
          </div>

          {/* Details List */}
          <div className="space-y-2.5 text-xs pt-2">
            <div className="flex justify-between items-center py-1.5 border-b border-zinc-100">
              <span className="text-zinc-500 font-medium">Producto</span>
              <span className="font-semibold text-zinc-800">SecureX Auth - Keyau (Licencia Premium)</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-zinc-100">
              <span className="text-zinc-500 font-medium">Estado</span>
              <span className="bg-emerald-100 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full text-[10px]">Activa</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-zinc-100">
              <span className="text-zinc-500 font-medium">Usuario</span>
              <span className="font-bold text-zinc-900">{receiptData.username}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-zinc-100">
              <span className="text-zinc-500 font-medium">Fecha de autenticación</span>
              <span className="font-mono text-[11px] text-zinc-700">{new Date().toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-zinc-100">
              <span className="text-zinc-500 font-medium">Correo Electrónico</span>
              <span className="font-bold text-purple-700 font-mono text-[11px]">{receiptData.email}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-zinc-500 font-medium">Clave de licencia (Keyau)</span>
              <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-100 rounded-lg px-2.5 py-1">
                <span className="font-mono text-[11px] font-bold text-purple-800">{receiptData.key}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(receiptData.key);
                    setCopiedKey(true);
                    setTimeout(() => setCopiedKey(false), 2000);
                  }}
                  className="text-purple-600 hover:text-purple-900 p-0.5"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Protection Box */}
          <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-4 flex items-start gap-3">
            <Shield className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-purple-900">Tu Keyau está protegida</h5>
              <p className="text-[11px] text-purple-700 mt-0.5">
                No compartas tu clave de licencia con nadie. SecureX Auth protege tu acceso.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              router.push("/dashboard");
              router.refresh();
            }}
            className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
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
          <div className="flex bg-[#040810] p-1 rounded-xl border border-sky-500/20 text-xs">
            <button
              type="button"
              onClick={() => {
                setRoleMode("admin");
                setError(null);
              }}
              className={`flex-1 py-1.5 font-bold rounded-lg transition-all ${
                roleMode === "admin"
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleMode("reseller");
                setError(null);
              }}
              className={`flex-1 py-1.5 font-bold rounded-lg transition-all ${
                roleMode === "reseller"
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Revendedoras
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
                  placeholder="e.g. tu_usuario o tu_correo@gmail.com"
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
                <label className={styles.inputLabel}>ID de aplicación (API Key)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <Key className="w-4 h-4 text-zinc-400" />
                  </span>
                  <input
                    type="text"
                    className={`${styles.premiumInput} pl-10`}
                    style={{ paddingLeft: "42px" }}
                    placeholder="e.g. 4bebaaa8a743-4"
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    required
                  />
                </div>
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
        /* Manual Register Form with Exact Ordered Fields requested in Image 5:
           1. USUARIO
           2. CONTRASEÑA
           3. CONFIRMAR CONTRASEÑA
           4. CORREO ELECTRÓNICO
        */
        <form onSubmit={onSubmitRegister} className="space-y-4 animate-fade-in">
          {/* 1. USUARIO */}
          <div>
            <label className={styles.inputLabel}>USUARIO</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                <User className="w-4 h-4 text-zinc-400" />
              </span>
              <input
                type="text"
                className={`${styles.premiumInput} pl-10`}
                style={{ paddingLeft: "42px" }}
                placeholder="Ingresa tu nombre de usuario"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
              />
            </div>
          </div>

          {/* 2. CONTRASEÑA */}
          <div>
            <label className={styles.inputLabel}>CONTRASEÑA</label>
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

          {/* 3. CONFIRMAR CONTRASEÑA */}
          <div>
            <label className={styles.inputLabel}>CONFIRMAR CONTRASEÑA</label>
            <input
              type="password"
              className={styles.premiumInput}
              placeholder="Repite la contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* 4. CORREO ELECTRÓNICO */}
          <div>
            <label className={styles.inputLabel}>CORREO ELECTRÓNICO</label>
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
    </div>
  );
}
