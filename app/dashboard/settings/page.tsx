"use client";

import React, { useState, useEffect } from "react";
import {
  Music, Volume2, Save, CheckCircle2, AlertCircle,
  Play, Pause, Trash2, Sparkles, Radio, Shield, User
} from "lucide-react";

interface MusicConfig {
  enabled: boolean;
  url: string;
  volume: number;
  title: string;
}

export default function SettingsPage() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);

  // Global Config (Admin only)
  const [globalConfig, setGlobalConfig] = useState<MusicConfig>({
    enabled: false,
    url: "",
    volume: 0.15,
    title: "",
  });

  // Personal Config (Reseller / Seller)
  const [personalConfig, setPersonalConfig] = useState<MusicConfig>({
    enabled: true,
    url: "",
    volume: 0.15,
    title: "",
  });

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);

  const PRESETS = [
    { title: "Lofi Chill Beat", url: "https://cdn.pixabay.com/audio/2024/11/29/audio_7e4f4d5b3e.mp3" },
    { title: "Cyberpunk Ambient", url: "https://cdn.pixabay.com/audio/2024/02/14/audio_8e65e2f4b3.mp3" },
    { title: "Dark Electronic", url: "https://cdn.pixabay.com/audio/2023/10/30/audio_9c9e9b7c5c.mp3" },
  ];

  useEffect(() => {
    initSettings();
    return () => {
      if (previewAudio) {
        previewAudio.pause();
      }
    };
  }, []);

  async function initSettings() {
    try {
      // 1. Fetch current user role
      const meRes = await fetch("/api/admin/me");
      if (meRes.ok) {
        const meJson = await meRes.json();
        if (meJson.success && meJson.data) {
          setIsSuperAdmin(meJson.data.isSuperAdmin);
          setUserEmail(meJson.data.email);
        }
      }

      // 2. Fetch global music config if superadmin
      const musicRes = await fetch("/api/admin/music");
      if (musicRes.ok) {
        const musicJson = await musicRes.json();
        if (musicJson.success && musicJson.config) {
          setGlobalConfig(musicJson.config);
        }
      }

      // 3. Load personal music config from localStorage
      const savedPersonal = localStorage.getItem("spectral_x_personal_music");
      if (savedPersonal) {
        try {
          const parsed = JSON.parse(savedPersonal);
          setPersonalConfig(parsed);
        } catch {}
      }
    } catch (e) {
      console.warn("Error initializing settings:", e);
    } finally {
      setLoading(false);
    }
  }

  // Save Global Music (Admin Only)
  async function handleSaveGlobal() {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(globalConfig),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setStatus({ type: "success", msg: "✅ Música Global actualizada. Se reproducirá para todos los usuarios." });
      } else {
        setStatus({ type: "error", msg: json.message || "Error al guardar." });
      }
    } catch {
      setStatus({ type: "error", msg: "Error de red al guardar." });
    } finally {
      setSaving(false);
    }
  }

  // Save Personal Music (Resellers / Sellers)
  function handleSavePersonal() {
    setSaving(true);
    setStatus(null);
    try {
      localStorage.setItem("spectral_x_personal_music", JSON.stringify(personalConfig));
      // Dispatch custom event so GlobalMusicPlayer updates immediately
      window.dispatchEvent(new CustomEvent("spectral-personal-music-updated"));
      setStatus({ type: "success", msg: "✅ Tu música de fondo personal ha sido guardada." });
    } catch {
      setStatus({ type: "error", msg: "Error al guardar la música personal." });
    } finally {
      setSaving(false);
    }
  }

  const activeConfig = isSuperAdmin ? globalConfig : personalConfig;
  const setActiveConfig = isSuperAdmin ? setGlobalConfig : setPersonalConfig;

  function handlePreview() {
    if (previewPlaying && previewAudio) {
      previewAudio.pause();
      setPreviewPlaying(false);
      return;
    }

    if (!activeConfig.url) return;
    const audio = new Audio(activeConfig.url);
    audio.volume = activeConfig.volume;
    audio.loop = false;
    audio.play().catch(() => {});
    audio.addEventListener("ended", () => setPreviewPlaying(false));
    setPreviewAudio(audio);
    setPreviewPlaying(true);
  }

  function handleClear() {
    if (previewAudio) previewAudio.pause();
    setPreviewPlaying(false);
    if (isSuperAdmin) {
      setGlobalConfig({ enabled: false, url: "", volume: 0.15, title: "" });
    } else {
      setPersonalConfig({ enabled: false, url: "", volume: 0.15, title: "" });
      localStorage.removeItem("spectral_x_personal_music");
      window.dispatchEvent(new CustomEvent("spectral-personal-music-updated"));
    }
  }

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sky-500/50 border-t-sky-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          {isSuperAdmin ? <Shield className="w-7 h-7 text-sky-400" /> : <User className="w-7 h-7 text-sky-400" />}
          {isSuperAdmin ? "Panel de Control Global" : "Configuración Personal"}
        </h1>
        <p className="text-sm text-zinc-400">
          {isSuperAdmin
            ? "Configuración del sistema del Administrador Principal. Administra la música global para todos."
            : "Personaliza tu experiencia en SecureX Auth. Define tu música de fondo personal."}
        </p>
      </div>

      {/* Main Music Settings Box */}
      <div className="glassmorphism p-6 rounded-2xl border border-sky-500/20 space-y-6 bg-[#030914]/80 backdrop-blur-xl shadow-2xl">
        {/* Section Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {isSuperAdmin ? "Música de Fondo Global" : "Mi Música de Fondo Personal"}
              <Sparkles className="w-4 h-4 text-sky-400" />
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isSuperAdmin
                ? "Música emitida globalmente para TODOS los usuarios del panel de control."
                : "Música de fondo que sonarás únicamente TÚ cuando navegues en el panel."}
            </p>
          </div>
        </div>

        <div className="h-px bg-sky-500/10" />

        {/* Global Enable Toggle (ONLY FOR SUPERADMIN) */}
        {isSuperAdmin ? (
          <div className="flex items-center justify-between p-4 rounded-xl bg-sky-950/20 border border-sky-500/20">
            <div className="flex items-center gap-3">
              <Radio className={`w-5 h-5 ${globalConfig.enabled ? "text-sky-400 animate-pulse" : "text-zinc-600"}`} />
              <div>
                <p className="text-sm font-semibold text-white">Activar Música Global</p>
                <p className="text-[11px] text-zinc-400">Cuando está activo, la música se transmite a todos los revendedores.</p>
              </div>
            </div>
            <button
              onClick={() => setGlobalConfig({ ...globalConfig, enabled: !globalConfig.enabled })}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                globalConfig.enabled ? "bg-sky-500" : "bg-zinc-700"
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${
                globalConfig.enabled ? "left-[26px]" : "left-0.5"
              }`} />
            </button>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-500/20 text-xs text-sky-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-sky-400" />
            <span>🎧 Tu música personal solo sonará para ti en este navegador. El administrador no la cambiará.</span>
          </div>
        )}

        {/* Audio URL Input */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-sky-400/80 mb-1.5 block">
            URL del Audio (MP3 o YouTube)
          </label>
          <input
            type="text"
            className="w-full bg-[#020610] border border-sky-500/20 text-white placeholder:text-zinc-600 px-3.5 py-2.5 rounded-xl text-sm outline-none focus:border-sky-500/60 transition font-mono"
            value={activeConfig.url}
            onChange={(e) => setActiveConfig({ ...activeConfig, url: e.target.value })}
            placeholder="https://ejemplo.com/musica.mp3 o https://youtu.be/..."
          />
        </div>

        {/* Song Title Input */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-sky-400/80 mb-1.5 block">
            Nombre de la Canción
          </label>
          <input
            type="text"
            className="w-full bg-[#020610] border border-sky-500/20 text-white placeholder:text-zinc-600 px-3.5 py-2.5 rounded-xl text-sm outline-none focus:border-sky-500/60 transition"
            value={activeConfig.title}
            onChange={(e) => setActiveConfig({ ...activeConfig, title: e.target.value })}
            placeholder="Ej. Mi Canción Favorita"
          />
        </div>

        {/* Volume Slider */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-sky-400/80 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-sky-400" /> Volumen
            </label>
            <span className="text-xs font-mono text-sky-400 font-bold">
              {Math.round(activeConfig.volume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(activeConfig.volume * 100)}
            onChange={(e) => setActiveConfig({ ...activeConfig, volume: parseInt(e.target.value) / 100 })}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
        </div>

        {/* Suggested Presets */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-sky-400/80 mb-2 block">
            Presets Sugeridos
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.title}
                type="button"
                onClick={() => setActiveConfig({ ...activeConfig, url: p.url, title: p.title })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  activeConfig.url === p.url
                    ? "bg-sky-500/20 border-sky-500/40 text-sky-300 font-bold shadow-md shadow-sky-500/10"
                    : "bg-[#020610] border-sky-500/10 text-zinc-400 hover:bg-sky-500/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Music className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs truncate">{p.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-sky-500/10" />

        {/* Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handlePreview}
            disabled={!activeConfig.url}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-sky-500/30 bg-[#020610] text-sky-300 text-xs font-bold hover:bg-sky-500/10 disabled:opacity-40 disabled:pointer-events-none transition"
          >
            {previewPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {previewPlaying ? "Pausar Preview" : "Probar Música"}
          </button>

          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-900/30 bg-red-950/10 text-red-400 text-xs font-bold hover:bg-red-950/20 transition"
          >
            <Trash2 className="w-4 h-4" />
            Quitar Música
          </button>

          <button
            onClick={isSuperAdmin ? handleSaveGlobal : handleSavePersonal}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-[0.98] text-white text-xs font-bold disabled:opacity-50 disabled:pointer-events-none transition shadow-lg shadow-sky-500/25"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Guardando..." : isSuperAdmin ? "Guardar y Aplicar a Todos (Música Global)" : "Guardar Mi Música Personal"}
          </button>
        </div>

        {/* Status Alert */}
        {status && (
          <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            status.type === "success"
              ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
              : "bg-red-950/20 border-red-500/30 text-red-400"
          }`}>
            {status.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            {status.msg}
          </div>
        )}
      </div>
    </div>
  );
}
