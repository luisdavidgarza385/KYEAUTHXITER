"use client";

import { useState, useEffect, useCallback } from "react";
import { Key, User, Sparkles, Shield, Calendar, Server, CheckCircle2, XCircle, Loader2, ArrowRight, Eye, EyeOff, Activity, Cpu, Wifi, Monitor, Lock } from "lucide-react";

const APP_ID = "TU_APP_ID";
const APP_SECRET = "TU_APP_SECRET";

function generateHWID(): string {
  const nav = window.navigator;
  const screen = window.screen;
  const raw = [
    nav.userAgent,
    nav.platform,
    screen.width,
    screen.height,
    screen.colorDepth,
    nav.language,
    new Date().getTimezoneOffset(),
  ].join("||");
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return "WEB-" + Math.abs(hash).toString(16).toUpperCase().padStart(8, "0");
}

export default function VisualesPage() {
  const [step, setStep] = useState<"login" | "validating" | "dashboard" | "error">("login");
  const [licenseKey, setLicenseKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [userInfo, setUserInfo] = useState<any>(null);
  const [sessionId, setSessionId] = useState("");
  const [hwid, setHwid] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHwid(generateHWID());
  }, []);

  const handleValidate = useCallback(async () => {
    if (!licenseKey.trim()) {
      setErrorMsg("Por favor ingresa tu licencia");
      return;
    }

    setStep("validating");
    setErrorMsg("");

    try {
      const initRes = await fetch("/api/1.0/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appid: APP_ID,
          secret: APP_SECRET,
          hwid: hwid,
        }),
      });
      const initData = await initRes.json();

      if (!initData.success || !initData.data?.sessionid) {
        throw new Error(initData.data?.message || initData.message || "Error al inicializar sesión");
      }

      const sid = initData.data.sessionid;
      setSessionId(sid);

      const licRes = await fetch("/api/1.0/license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appid: APP_ID,
          secret: APP_SECRET,
          sessionid: sid,
          key: licenseKey.trim(),
          hwid: hwid,
        }),
      });
      const licData = await licRes.json();

      if (!licData.success) {
        throw new Error(licData.message || "Licencia inválida");
      }

      setUserInfo({
        key: licenseKey.trim(),
        level: licData.data?.level || 1,
        expires_at: licData.data?.expires_at || null,
        hwid: hwid,
        status: "active",
      });
      setStep("dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Error de conexión");
      setStep("error");
    }
  }, [licenseKey, hwid]);

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("es-ES", {
      year: "numeric", month: "long", day: "numeric",
    });
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0814]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[1000px] h-[700px] rounded-full bg-gradient-radial from-violet-600/20 via-fuchsia-600/10 to-transparent blur-3xl" />
        <div className="absolute top-[30%] left-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-radial from-indigo-600/15 to-transparent blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-radial from-purple-500/10 to-transparent blur-3xl" />
      </div>

      {(step === "login" || step === "error" || step === "validating") && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/20 via-fuchsia-500/20 to-indigo-600/20 rounded-3xl blur-2xl" />
            <div className="relative bg-[rgba(15,10,25,0.7)] backdrop-blur-xl border border-[rgba(139,92,246,0.2)] rounded-3xl p-8 md:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.6)]">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-5 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl blur-xl opacity-60" />
                  <div className="relative w-full h-full bg-gradient-to-br from-violet-500/30 to-fuchsia-600/30 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur">
                    <Sparkles className="w-9 h-9 text-violet-300" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-200 via-fuchsia-200 to-indigo-200 bg-clip-text text-transparent">
                  Visuales Tuyo
                </h1>
                <p className="text-sm text-zinc-400 mt-1.5 font-medium tracking-wide">2022 Community</p>
                <div className="mt-3 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
                <p className="text-xs text-zinc-500 mt-4">Ingresa tu licencia para acceder</p>
              </div>

              {errorMsg && (
                <div className="mb-4 flex items-center gap-2.5 bg-red-500/10 border border-red-500/25 text-red-300 text-sm px-4 py-3 rounded-xl">
                  <XCircle className="w-4 h-4 shrink-0" />
                  {errorMsg}
                </div>
              )}

              <div className="space-y-4">
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type={showKey ? "text" : "password"}
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                    className="w-full bg-black/40 border border-white/10 text-zinc-200 placeholder:text-zinc-600 pl-10 pr-10 py-3 rounded-xl text-sm outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition font-mono tracking-wider"
                    onKeyDown={(e) => e.key === "Enter" && handleValidate()}
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  onClick={handleValidate}
                  disabled={step === "validating"}
                  className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-lg shadow-violet-600/30 hover:shadow-violet-500/50 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {step === "validating" ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Validando...</>
                  ) : (
                    <><ArrowRight className="w-4 h-4" /> Acceder</>
                  )}
                </button>
              </div>

              <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-zinc-600">
                <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Seguro</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span className="flex items-center gap-1"><Server className="w-3 h-3" /> KeyAuth</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> HWID</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === "dashboard" && userInfo && (
        <div className="min-h-screen p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/30 to-fuchsia-600/30 border border-white/10 flex items-center justify-center backdrop-blur">
                  <Sparkles className="w-5 h-5 text-violet-300" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-zinc-100">Visuales Tuyo 2022 Community</h1>
                  <p className="text-xs text-zinc-500">Panel de licencia</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs px-3 py-1.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Licencia activa
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[rgba(15,10,25,0.6)] backdrop-blur border border-[rgba(139,92,246,0.15)] rounded-2xl p-5">
                <div className="flex items-center gap-2 text-zinc-500 text-xs mb-3">
                  <Key className="w-3.5 h-3.5" /> Licencia
                </div>
                <p className="text-sm font-mono text-zinc-200 break-all">{userInfo.key}</p>
              </div>
              <div className="bg-[rgba(15,10,25,0.6)] backdrop-blur border border-[rgba(139,92,246,0.15)] rounded-2xl p-5">
                <div className="flex items-center gap-2 text-zinc-500 text-xs mb-3">
                  <Calendar className="w-3.5 h-3.5" /> Expira
                </div>
                <p className="text-sm text-zinc-200">{formatDate(userInfo.expires_at)}</p>
              </div>
              <div className="bg-[rgba(15,10,25,0.6)] backdrop-blur border border-[rgba(139,92,246,0.15)] rounded-2xl p-5">
                <div className="flex items-center gap-2 text-zinc-500 text-xs mb-3">
                  <Monitor className="w-3.5 h-3.5" /> HWID
                </div>
                <p className="text-xs font-mono text-zinc-400 break-all">{userInfo.hwid}</p>
              </div>
            </div>

            <div className="bg-[rgba(15,10,25,0.6)] backdrop-blur border border-[rgba(139,92,246,0.15)] rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-violet-400" /> Estado del sistema
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Server, label: "API", status: "online", value: "Conectado" },
                  { icon: Shield, label: "Licencia", status: "online", value: `Nivel ${userInfo.level}` },
                  { icon: Cpu, label: "Sesión", status: "online", value: "Activa" },
                  { icon: Wifi, label: "HWID", status: "online", value: "Vinculado" },
                ].map((item, i) => (
                  <div key={i} className="bg-black/30 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 text-zinc-500 text-xs mb-2">
                      <item.icon className="w-3.5 h-3.5" /> {item.label}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                      <span className="text-sm font-medium text-zinc-200">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[rgba(15,10,25,0.6)] backdrop-blur border border-[rgba(139,92,246,0.15)] rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-zinc-200 mb-4">Información de la comunidad</h2>
              <div className="space-y-3">
                {[
                  { label: "Usuario", value: "Visuales Tuyo", icon: User },
                  { label: "Plan", value: `Nivel ${userInfo.level}`, icon: Shield },
                  { label: "Registro", value: new Date().toLocaleDateString("es-ES"), icon: Calendar },
                  { label: "Tipo", value: "Web License", icon: Monitor },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <item.icon className="w-3.5 h-3.5" /> {item.label}
                    </div>
                    <span className="text-sm text-zinc-200 font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center text-[11px] text-zinc-600 py-4">
              Visuales Tuyo 2022 Community &copy; {new Date().getFullYear()} &mdash; Powered by KeyAuth
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
