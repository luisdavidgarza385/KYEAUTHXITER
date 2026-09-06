"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Shield,
  Layers,
  Link2,
  BarChart3,
  Users,
  KeyRound,
  Globe,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  Moon,
  Sun,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { translations, Language } from "@/lib/i18n";
import { ParticlesBackground } from "@/components/ParticlesBackground";

interface SavedAccount {
  id: string;
  username: string;
  roleLabel?: string;
  role?: "admin" | "reseller" | "seller";
}

interface RealAuthXViewProps {
  initialMode?: "login" | "register";
  searchParams?: { err?: string };
}

export function RealAuthXView({ initialMode = "login", searchParams }: RealAuthXViewProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [lang, setLang] = useState<Language>("es");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Form states - Login
  const [loginUser, setLoginUser] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberUser, setRememberUser] = useState(true);
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Form states - Register
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConfirmPass, setShowRegConfirmPass] = useState(false);

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Saved accounts list
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([
    {
      id: "sensi-default",
      username: "SENSILUMINOX",
      roleLabel: "Acceso vendedor",
      role: "seller",
    },
  ]);

  const langDropdownRef = useRef<HTMLDivElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const t = translations[lang] || translations.es;

  // Sync mode with initialMode if props change
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Load language, theme and saved accounts from localStorage
  useEffect(() => {
    // Language
    const savedLang = localStorage.getItem("ra_language") as Language;
    if (savedLang && (savedLang === "es" || savedLang === "en" || savedLang === "pt")) {
      setLang(savedLang);
    }

    // Theme
    const storedTheme = localStorage.getItem("gx-theme");
    const darkTheme = storedTheme !== "light";
    setIsDark(darkTheme);
    if (!darkTheme) {
      document.documentElement.classList.add("light");
    }

    // Saved accounts
    try {
      const storedAccs = localStorage.getItem("ra_saved_accounts");
      if (storedAccs) {
        const parsed = JSON.parse(storedAccs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedAccounts(parsed);
        }
      } else {
        // Initialize default saved account
        localStorage.setItem(
          "ra_saved_accounts",
          JSON.stringify([
            {
              id: "sensi-default",
              username: "SENSILUMINOX",
              roleLabel: "Acceso vendedor",
              role: "seller",
            },
          ])
        );
      }
    } catch {
      // Ignore JSON parse error
    }

    // Remembered user
    const remembered = localStorage.getItem("ka_remember_email") || localStorage.getItem("ka_remember_username");
    if (remembered) {
      setLoginUser(remembered);
    }
  }, []);

  // Close language dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // OAuth error handling
  useEffect(() => {
    if (searchParams?.err) {
      const ERR_MESSAGES: Record<string, string> = {
        discord_not_configured: "Discord login is not configured.",
        google_not_configured: "Google login is not configured.",
        no_account: "No account found for this email.",
        invalid_state: "OAuth state mismatch. Please try again.",
        missing_code: "OAuth provider did not return a code.",
        token_exchange: "Failed to exchange OAuth code.",
        access_denied: "You declined the OAuth authorization.",
      };
      const detail = searchParams.detail ? ` (${searchParams.detail})` : "";
      setErrorMsg((ERR_MESSAGES[searchParams.err] || `OAuth: ${searchParams.err}`) + detail);
    }
  }, [searchParams]);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("ra_language", newLang);
    setLangMenuOpen(false);
  };

  const handleThemeToggle = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    document.documentElement.classList.toggle("light", !nextDark);
    localStorage.setItem("gx-theme", nextDark ? "dark" : "light");
  };

  const handleSelectSavedAccount = async (acc: SavedAccount) => {
    setLoginUser(acc.username);
    const pass = acc.username.toUpperCase().includes("SPECTRALX") ? "SpectralX" : loginPassword || "SpectralX";
    setLoginPassword(pass);
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: acc.username.trim(),
          password: pass,
          remember: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoading(false);
        if (passwordInputRef.current) passwordInputRef.current.focus();
        return;
      }

      try {
        const audio = new Audio("/welcome.ogg");
        audio.volume = 0.8;
        audio.play().catch(() => {});
      } catch {}

      setSuccessMsg("¡Acceso concedido! Entrando...");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 500);
    } catch {
      setLoading(false);
      if (passwordInputRef.current) passwordInputRef.current.focus();
    }
  };

  const handleRemoveSavedAccount = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedAccounts.filter((a) => a.id !== id);
    setSavedAccounts(updated);
    localStorage.setItem("ra_saved_accounts", JSON.stringify(updated));
  };

  // Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (!loginUser.trim()) {
        setErrorMsg(t.errUsernameLength);
        setLoading(false);
        return;
      }
      if (!loginPassword) {
        setErrorMsg(t.errPasswordLength);
        setLoading(false);
        return;
      }

      if (rememberUser) {
        localStorage.setItem("ka_remember_username", loginUser);
        localStorage.setItem("ka_remember_email", loginUser);

        // Update or add to saved accounts
        const exists = savedAccounts.some(
          (a) => a.username.toLowerCase() === loginUser.trim().toLowerCase()
        );
        if (!exists) {
          const newAccount: SavedAccount = {
            id: `acc-${Date.now()}`,
            username: loginUser.trim().toUpperCase(),
            roleLabel: t.resellerAccess,
            role: "seller",
          };
          const newAccounts = [newAccount, ...savedAccounts.slice(0, 4)];
          setSavedAccounts(newAccounts);
          localStorage.setItem("ra_saved_accounts", JSON.stringify(newAccounts));
        }
      }

      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginUser.trim(),
          password: loginPassword,
          remember: rememberUser,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || t.errServer);
        return;
      }

      // Audio feedback
      try {
        const audio = new Audio("/welcome.ogg");
        audio.volume = 0.8;
        audio.play().catch(() => {});
      } catch {
        // Ignore audio errors
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || t.errNetwork);
    } finally {
      setLoading(false);
    }
  };

  // Submit Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (regUsername.trim().length < 3) {
      setErrorMsg(t.errUsernameLength);
      return;
    }
    if (!regEmail || !regEmail.includes("@")) {
      setErrorMsg(t.errInvalidEmail);
      return;
    }
    if (regPassword.length < 5) {
      setErrorMsg(t.errPasswordLength);
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg(t.errPasswordMismatch);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: regUsername.trim(),
          email: regEmail.trim().toLowerCase(),
          password: regPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || t.errServer);
        return;
      }

      // Save into saved accounts
      const newAcc: SavedAccount = {
        id: `acc-${Date.now()}`,
        username: regUsername.trim().toUpperCase(),
        roleLabel: t.resellerAccess,
        role: "seller",
      };
      const updated = [newAcc, ...savedAccounts.filter((a) => a.username !== newAcc.username)];
      setSavedAccounts(updated);
      localStorage.setItem("ra_saved_accounts", JSON.stringify(updated));

      // Audio feedback
      try {
        const audio = new Audio("/welcome.ogg");
        audio.volume = 0.8;
        audio.play().catch(() => {});
      } catch {}

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || t.errNetwork);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#02060f] text-slate-100 flex flex-col justify-between relative overflow-x-hidden font-sans selection:bg-[#0099ff] selection:text-white">
      {/* Dynamic Star/Particle Mesh */}
      <ParticlesBackground />

      {/* Cyber Grid Subtle Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,180,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,180,255,0.025)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0 opacity-70" />

      {/* Glowing Ambient Light Orbs */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[15%] left-[20%] w-[850px] h-[850px] rounded-full bg-gradient-radial from-[#0066ff]/15 via-[#00c2ff]/5 to-transparent blur-3xl animate-pulse" style={{ animationDuration: "10s" }} />
        <div className="absolute top-[40%] -right-[10%] w-[650px] h-[650px] rounded-full bg-gradient-radial from-[#00b4ff]/12 via-[#0044aa]/5 to-transparent blur-3xl" />
        <div className="absolute -bottom-[20%] left-[10%] w-[700px] h-[700px] rounded-full bg-gradient-radial from-[#0088ff]/10 to-transparent blur-3xl" />
      </div>

      {/* ────────────────── TOP NAVBAR ────────────────── */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0099ff] to-[#0055d4] p-[1px] shadow-[0_0_20px_rgba(0,153,255,0.4)] transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-[#040e24] rounded-[11px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#00b4ff] drop-shadow-[0_0_8px_rgba(0,180,255,0.8)]" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-white flex items-center">
              SecureX Auth
            </span>
            <span className="text-[9px] tracking-[0.22em] font-extrabold text-[#00b4ff]/80 uppercase -mt-0.5 font-mono">
              SECURE ACCESS
            </span>
          </div>
        </Link>

        {/* Right Nav Tools */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Language Selector Dropdown */}
          <div className="relative" ref={langDropdownRef}>
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#071329]/80 hover:bg-[#0c1f42] border border-[#0099ff]/25 text-xs font-semibold text-slate-200 transition-all shadow-sm"
              aria-expanded={langMenuOpen}
            >
              <span>
                {lang === "es" ? "Español" : lang === "en" ? "English" : "Português"}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${langMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-[#071329]/95 backdrop-blur-xl border border-[#0099ff]/30 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  type="button"
                  onClick={() => handleLanguageChange("es")}
                  className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold flex items-center justify-between hover:bg-[#0c234b] transition-colors ${
                    lang === "es" ? "text-[#00b4ff] bg-[#0099ff]/10" : "text-slate-300"
                  }`}
                >
                  <span>Español</span>
                  {lang === "es" && <CheckCircle2 className="w-3.5 h-3.5 text-[#00b4ff]" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageChange("en")}
                  className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold flex items-center justify-between hover:bg-[#0c234b] transition-colors ${
                    lang === "en" ? "text-[#00b4ff] bg-[#0099ff]/10" : "text-slate-300"
                  }`}
                >
                  <span>English</span>
                  {lang === "en" && <CheckCircle2 className="w-3.5 h-3.5 text-[#00b4ff]" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageChange("pt")}
                  className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold flex items-center justify-between hover:bg-[#0c234b] transition-colors ${
                    lang === "pt" ? "text-[#00b4ff] bg-[#0099ff]/10" : "text-slate-300"
                  }`}
                >
                  <span>Português</span>
                  {lang === "pt" && <CheckCircle2 className="w-3.5 h-3.5 text-[#00b4ff]" />}
                </button>
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={handleThemeToggle}
            className="w-8 h-8 rounded-lg bg-[#071329]/80 hover:bg-[#0c1f42] border border-[#0099ff]/25 flex items-center justify-center text-slate-300 transition-colors shadow-sm cursor-pointer"
            aria-label={t.themeToggle}
            title={t.themeToggle}
          >
            {isDark ? <Moon className="w-4 h-4 text-slate-300" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Top Auth Mode Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMsg(null);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                mode === "login"
                  ? "bg-[#0088ff] text-white shadow-[0_0_18px_rgba(0,136,255,0.5)] border border-[#38bdf8]/40"
                  : "bg-transparent text-slate-300 hover:text-white border border-[#0099ff]/20 hover:border-[#0099ff]/40"
              }`}
            >
              {t.signIn}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setErrorMsg(null);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                mode === "register"
                  ? "bg-[#0088ff] text-white shadow-[0_0_18px_rgba(0,136,255,0.5)] border border-[#38bdf8]/40"
                  : "bg-transparent text-slate-300 hover:text-white border border-[#0099ff]/20 hover:border-[#0099ff]/40"
              }`}
            >
              {t.signUp}
            </button>
          </div>
        </div>
      </header>

      {/* ────────────────── MAIN BODY CONTAINER ────────────────── */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 md:py-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* ════════════ LEFT COLUMN: BRAND HERO (IMAGEN 2 & 4) ════════════ */}
          <div className="lg:col-span-6 space-y-8 text-left">
            
            {/* Operational Service Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/30 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]" />
              </span>
              <span className="text-[10.5px] font-extrabold tracking-widest text-[#00ff88] uppercase">
                {t.serviceStatus}
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-1">
              <h1 className="text-4xl md:text-5xl lg:text-[54px] font-extrabold tracking-tight text-white leading-[1.08]">
                {t.heroTitle1}
                <br />
                {t.heroTitle2}
                <br />
                <span className="text-[#00c2ff] drop-shadow-[0_0_25px_rgba(0,194,255,0.4)]">
                  {t.heroTitleHighlight}
                </span>
              </h1>
            </div>

            {/* Subtitle description */}
            <p className="text-sm md:text-base text-slate-400 font-normal leading-relaxed max-w-xl">
              {t.heroDescription}
            </p>

            {/* 4 Feature Cards (2x2 Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-xl">
              {/* Feature 1: Acceso protegido */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#040e24]/70 border border-[#0099ff]/20 backdrop-blur-md hover:border-[#0099ff]/40 transition-colors">
                <div className="w-6 h-6 rounded-lg bg-[#0099ff]/15 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#00b4ff]" />
                </div>
                <span className="text-xs font-semibold text-slate-200">
                  {t.featureProtectedAccess}
                </span>
              </div>

              {/* Feature 2: Gestión centralizada */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#040e24]/70 border border-[#0099ff]/20 backdrop-blur-md hover:border-[#0099ff]/40 transition-colors">
                <div className="w-6 h-6 rounded-lg bg-[#0099ff]/15 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4 text-[#00b4ff]" />
                </div>
                <span className="text-xs font-semibold text-slate-200">
                  {t.featureCentralizedManagement}
                </span>
              </div>

              {/* Feature 3: Licencias en tiempo real */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#040e24]/70 border border-[#0099ff]/20 backdrop-blur-md hover:border-[#0099ff]/40 transition-colors">
                <div className="w-6 h-6 rounded-lg bg-[#0099ff]/15 flex items-center justify-center shrink-0">
                  <Link2 className="w-4 h-4 text-[#00b4ff]" />
                </div>
                <span className="text-xs font-semibold text-slate-200">
                  {t.featureRealtimeLicenses}
                </span>
              </div>

              {/* Feature 4: Control claro del negocio */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#040e24]/70 border border-[#0099ff]/20 backdrop-blur-md hover:border-[#0099ff]/40 transition-colors">
                <div className="w-6 h-6 rounded-lg bg-[#0099ff]/15 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-4 h-4 text-[#00b4ff]" />
                </div>
                <span className="text-xs font-semibold text-slate-200">
                  {t.featureClearControl}
                </span>
              </div>
            </div>

            {/* 3 Real-time Stats Badges */}
            <div className="grid grid-cols-3 gap-3 pt-2 max-w-xl">
              {/* Stat 1: 122 Sesiones Activas */}
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#040e24]/80 border border-[#0099ff]/25">
                <div className="w-8 h-8 rounded-lg bg-[#0088ff]/20 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-[#00b4ff]" />
                </div>
                <div>
                  <div className="text-sm font-black text-white leading-tight">122</div>
                  <div className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">
                    {t.statActiveSessions}
                  </div>
                </div>
              </div>

              {/* Stat 2: 16062 Licencias Activas */}
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#040e24]/80 border border-[#0099ff]/25">
                <div className="w-8 h-8 rounded-lg bg-[#0088ff]/20 flex items-center justify-center shrink-0">
                  <KeyRound className="w-4 h-4 text-[#00b4ff]" />
                </div>
                <div>
                  <div className="text-sm font-black text-white leading-tight">16062</div>
                  <div className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">
                    {t.statActiveLicenses}
                  </div>
                </div>
              </div>

              {/* Stat 3: ONLINE Estado de la API */}
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#040e24]/80 border border-[#0099ff]/25">
                <div className="w-8 h-8 rounded-lg bg-[#00ff88]/20 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4 text-[#00ff88]" />
                </div>
                <div>
                  <div className="text-sm font-black text-[#00ff88] leading-tight">{t.statOnline}</div>
                  <div className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">
                    {t.statApiStatus}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Hero Info */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800/60 max-w-xl">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#00b4ff]" />
                <span>{t.encryptedConnection}</span>
              </div>
              <span>{t.builtForTeams}</span>
            </div>

          </div>

          {/* ════════════ RIGHT COLUMN: AUTH CARD (IMAGEN 2 & 4) ════════════ */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-[480px] relative">
              
              {/* Outer Card Glow Halo */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#0088ff]/30 via-[#00c2ff]/20 to-[#0055d4]/30 rounded-3xl blur-xl opacity-80 pointer-events-none" />

              {/* Main Card */}
              <div className="relative rounded-3xl bg-[#040b18]/90 border border-[#0099ff]/35 backdrop-blur-2xl p-7 md:p-9 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
                
                {/* ── CARD HEADER ── */}
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0099ff] to-[#0055d4] p-[1px] shadow-[0_0_18px_rgba(0,153,255,0.45)] shrink-0">
                    <div className="w-full h-full bg-[#05112c] rounded-[15px] flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-[#00c2ff] drop-shadow-[0_0_8px_rgba(0,194,255,0.9)]" />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold tracking-[0.2em] text-[#00b4ff] uppercase block font-mono">
                      {mode === "login" ? t.loginBadge : t.registerBadge}
                    </span>
                    <h2 className="text-2xl font-black tracking-tight text-white">
                      {mode === "login" ? t.loginTitle : t.registerTitle}
                    </h2>
                  </div>
                </div>

                {/* Subtitle */}
                <p className="text-xs text-slate-400 mb-4 font-medium">
                  {mode === "login" ? t.loginSubtitle : t.registerSubtitle}
                </p>

                {/* Security Banner Note */}
                <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#00ff88]/5 border border-[#00ff88]/20 text-[11px] text-[#00ff88]/90 mb-5 leading-snug">
                  <Shield className="w-4 h-4 text-[#00ff88] shrink-0 mt-0.5" />
                  <span>{t.securityNotice}</span>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-300 mb-4 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* ═══════════ LOGIN MODE FORM (IMAGEN 2) ═══════════ */}
                {mode === "login" && (
                  <div className="space-y-4">
                    {/* Saved Accounts Section */}
                    {savedAccounts.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-300">{t.savedAccounts}</span>
                          <span className="text-[10px] text-slate-400 hidden sm:inline">
                            {t.savedAccountsHint}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {savedAccounts.map((acc) => (
                            <div
                              key={acc.id}
                              onClick={() => handleSelectSavedAccount(acc)}
                              className="group flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#071530]/90 border border-[#0099ff]/30 hover:border-[#00b4ff] hover:bg-[#0b1e42] transition-all cursor-pointer shadow-sm"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#0088ff]/20 border border-[#0088ff]/40 flex items-center justify-center text-[#00b4ff]">
                                  <ShieldCheck className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                  <div className="text-xs font-bold text-white tracking-wide">
                                    {acc.username}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    {acc.roleLabel || t.resellerAccess}
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => handleRemoveSavedAccount(acc.id, e)}
                                className="w-6 h-6 rounded-md hover:bg-slate-700/50 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                                title="Eliminar cuenta guardada"
                                aria-label="Eliminar"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      {/* Usuario */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          {t.userLabel}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={loginUser}
                            onChange={(e) => setLoginUser(e.target.value)}
                            placeholder={t.userPlaceholder}
                            required
                            className="w-full bg-[#020713]/90 border border-[#0099ff]/30 focus:border-[#00c2ff] rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00c2ff]/20 transition-all"
                          />
                        </div>
                      </div>

                      {/* Contraseña */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          {t.passwordLabel}
                        </label>
                        <div className="relative">
                          <input
                            ref={passwordInputRef}
                            type={showLoginPass ? "text" : "password"}
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder={t.passwordPlaceholder}
                            required
                            className="w-full bg-[#020713]/90 border border-[#0099ff]/30 focus:border-[#00c2ff] rounded-xl pl-4 pr-11 py-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00c2ff]/20 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPass(!showLoginPass)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00c2ff] transition-colors p-1"
                            aria-label={showLoginPass ? "Ocultar" : "Mostrar"}
                          >
                            {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Remember Me & Forgot Password Row */}
                      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={rememberUser}
                            onChange={(e) => setRememberUser(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-[#0088ff] focus:ring-[#0088ff]/30 accent-[#0088ff]"
                          />
                          <span>{t.rememberUser}</span>
                        </label>
                        <Link
                          href="/forgot-password"
                          className="text-[#00b4ff] hover:text-[#38bdf8] font-medium transition-colors"
                        >
                          {t.forgotPassword}
                        </Link>
                      </div>

                      {/* Submit Button: Entrar */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-gradient-to-r from-[#0080ff] via-[#0099ff] to-[#00b4ff] hover:from-[#0070e0] hover:to-[#00a2ff] text-white font-extrabold rounded-xl shadow-[0_0_24px_rgba(0,153,255,0.45)] hover:shadow-[0_0_32px_rgba(0,153,255,0.65)] transition-all flex items-center justify-center gap-2 text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{t.loggingIn}</span>
                          </>
                        ) : (
                          t.signInButton
                        )}
                      </button>
                    </form>

                    {/* Divider: REALAUTHX OAUTH */}
                    <div className="relative py-2 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-800" />
                      </div>
                      <span className="relative px-3 bg-[#040b18] text-[9.5px] font-extrabold tracking-widest text-slate-400 uppercase font-mono">
                        {t.loginOauthDivider}
                      </span>
                    </div>

                    {/* Social OAuth Buttons */}
                    <div className="w-full">
                      {/* Google */}
                      <a
                        href="/api/auth/google"
                        className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-[#071329] hover:bg-[#0c1f42] border border-[#0099ff]/25 hover:border-[#00c2ff]/60 text-xs font-bold text-slate-200 transition-all shadow-sm cursor-pointer"
                      >
                        {/* Google Icon */}
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="#EA4335"
                            d="M12 5c1.54 0 2.94.55 4.04 1.46l3.03-3.03C17.21 1.71 14.77 1 12 1 7.37 1 3.47 3.66 1.62 7.54l3.69 2.87C6.19 7.42 8.87 5 12 5z"
                          />
                          <path
                            fill="#4285F4"
                            d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.71 2.88c2.16-1.99 3.42-4.93 3.42-8.7z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.31 14.41c-.24-.71-.38-1.46-.38-2.24s.14-1.53.38-2.24L1.62 7.06C.59 9.12 0 11.45 0 12c0 .55.59 2.88 1.62 4.94l3.69-2.53z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.71-2.88c-1.08.72-2.45 1.16-4.22 1.16-3.13 0-5.81-2.42-6.69-5.41L1.62 16.94C3.47 20.82 7.37 23 12 23z"
                          />
                        </svg>
                        <span>{t.oauthGoogle}</span>
                      </a>
                    </div>

                    {/* Bottom Prompt: Don't have an account? Sign up */}
                    <div className="text-center pt-3 text-xs text-slate-400">
                      <span>{t.noAccountPrompt} </span>
                      <button
                        type="button"
                        onClick={() => {
                          setMode("register");
                          setErrorMsg(null);
                        }}
                        className="text-[#00b4ff] hover:text-[#38bdf8] font-bold underline-offset-2 hover:underline transition-all cursor-pointer"
                      >
                        {t.noAccountLink}
                      </button>
                    </div>
                  </div>
                )}

                {/* ═══════════ REGISTER MODE FORM (IMAGEN 4) ═══════════ */}
                {mode === "register" && (
                  <div className="space-y-4">
                    <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                      {/* Usuario */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          {t.userLabel}
                        </label>
                        <input
                          type="text"
                          value={regUsername}
                          onChange={(e) => setRegUsername(e.target.value)}
                          placeholder={t.userPlaceholder}
                          required
                          className="w-full bg-[#020713]/90 border border-[#0099ff]/30 focus:border-[#00c2ff] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00c2ff]/20 transition-all"
                        />
                      </div>

                      {/* Correo */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          {t.emailLabel}
                        </label>
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder={t.emailPlaceholder}
                          required
                          className="w-full bg-[#020713]/90 border border-[#0099ff]/30 focus:border-[#00c2ff] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00c2ff]/20 transition-all"
                        />
                      </div>

                      {/* Contraseña */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          {t.passwordLabel}
                        </label>
                        <div className="relative">
                          <input
                            type={showRegPass ? "text" : "password"}
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder={t.passwordPlaceholder}
                            required
                            className="w-full bg-[#020713]/90 border border-[#0099ff]/30 focus:border-[#00c2ff] rounded-xl pl-4 pr-11 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00c2ff]/20 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPass(!showRegPass)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00c2ff] transition-colors p-1"
                            aria-label={showRegPass ? "Ocultar" : "Mostrar"}
                          >
                            {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirmar contraseña */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          {t.confirmPasswordLabel}
                        </label>
                        <div className="relative">
                          <input
                            type={showRegConfirmPass ? "text" : "password"}
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                            placeholder={t.confirmPasswordPlaceholder}
                            required
                            className="w-full bg-[#020713]/90 border border-[#0099ff]/30 focus:border-[#00c2ff] rounded-xl pl-4 pr-11 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00c2ff]/20 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegConfirmPass(!showRegConfirmPass)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00c2ff] transition-colors p-1"
                            aria-label={showRegConfirmPass ? "Ocultar" : "Mostrar"}
                          >
                            {showRegConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Submit Button: Crear cuenta */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-gradient-to-r from-[#0080ff] via-[#0099ff] to-[#00b4ff] hover:from-[#0070e0] hover:to-[#00a2ff] text-white font-extrabold rounded-xl shadow-[0_0_24px_rgba(0,153,255,0.45)] hover:shadow-[0_0_32px_rgba(0,153,255,0.65)] transition-all flex items-center justify-center gap-2 text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed mt-2 cursor-pointer"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{t.creatingAccount}</span>
                          </>
                        ) : (
                          t.signUpButton
                        )}
                      </button>
                    </form>

                    {/* Divider: REGÍSTRATE CON OAUTH */}
                    <div className="relative py-2 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-800" />
                      </div>
                      <span className="relative px-3 bg-[#040b18] text-[9.5px] font-extrabold tracking-widest text-slate-400 uppercase font-mono">
                        {t.registerOauthDivider}
                      </span>
                    </div>

                    {/* Social OAuth Buttons */}
                    <div className="w-full">
                      {/* Google */}
                      <a
                        href="/api/auth/google"
                        className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-[#071329] hover:bg-[#0c1f42] border border-[#0099ff]/25 hover:border-[#00c2ff]/60 text-xs font-bold text-slate-200 transition-all shadow-sm cursor-pointer"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="#EA4335"
                            d="M12 5c1.54 0 2.94.55 4.04 1.46l3.03-3.03C17.21 1.71 14.77 1 12 1 7.37 1 3.47 3.66 1.62 7.54l3.69 2.87C6.19 7.42 8.87 5 12 5z"
                          />
                          <path
                            fill="#4285F4"
                            d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.71 2.88c2.16-1.99 3.42-4.93 3.42-8.7z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.31 14.41c-.24-.71-.38-1.46-.38-2.24s.14-1.53.38-2.24L1.62 7.06C.59 9.12 0 11.45 0 12c0 .55.59 2.88 1.62 4.94l3.69-2.53z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.71-2.88c-1.08.72-2.45 1.16-4.22 1.16-3.13 0-5.81-2.42-6.69-5.41L1.62 16.94C3.47 20.82 7.37 23 12 23z"
                          />
                        </svg>
                        <span>{t.oauthGoogle}</span>
                      </a>
                    </div>

                    {/* Bottom Prompt: Already have an account? Sign in */}
                    <div className="text-center pt-3 text-xs text-slate-400">
                      <span>{t.hasAccountPrompt} </span>
                      <button
                        type="button"
                        onClick={() => {
                          setMode("login");
                          setErrorMsg(null);
                        }}
                        className="text-[#00b4ff] hover:text-[#38bdf8] font-bold underline-offset-2 hover:underline transition-all cursor-pointer"
                      >
                        {t.hasAccountLink}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ────────────────── FOOTER ────────────────── */}
      <footer className="relative z-10 w-full text-center py-5 text-[11px] text-slate-500 font-mono tracking-wider uppercase border-t border-slate-900/60">
        <span>RealAuthX &copy; {new Date().getFullYear()} — Secure Access Platform</span>
      </footer>
    </div>
  );
}
