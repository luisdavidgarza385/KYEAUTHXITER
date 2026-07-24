"use client";

import React, { useState, useEffect } from "react";
import {
  Music, Volume2, VolumeX, Save, CheckCircle2, AlertCircle,
  Play, Pause, Trash2, Settings, Sparkles, Radio
} from "lucide-react";

interface MusicConfig {
  enabled: boolean;
  url: string;
  volume: number;
  title: string;
}

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<MusicConfig>({
    enabled: false,
    url: "",
    volume: 0.15,
    title: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);

  // Preset music suggestions (royalty-free)
  const PRESETS = [
    { title: "Lofi Chill Beat", url: "https://cdn.pixabay.com/audio/2024/11/29/audio_7e4f4d5b3e.mp3" },
    { title: "Cyberpunk Ambient", url: "https://cdn.pixabay.com/audio/2024/02/14/audio_8e65e2f4b3.mp3" },
    { title: "Dark Electronic", url: "https://cdn.pixabay.com/audio/2023/10/30/audio_9c9e9b7c5c.mp3" },
  ];

  useEffect(() => {
    fetchConfig();
    return () => {
      if (previewAudio) {
        previewAudio.pause();
      }
    };
  }, []);

  async function fetchConfig() {
    try {
      const res = await fetch("/api/admin/music");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.config) {
          setConfig(json.config);
        }
      }
    } catch {} finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setStatus({ type: "success", msg: "✅ Configuración de música guardada. Todos los usuarios la escucharán." });
      } else {
        setStatus({ type: "error", msg: json.message || "Error al guardar." });
      }
    } catch (e: any) {
      setStatus({ type: "error", msg: "Error de red al guardar." });
    } finally {
      setSaving(false);
    }
  }

  function handlePreview() {
    if (previewPlaying && previewAudio) {
      previewAudio.pause();
      setPreviewPlaying(false);
      return;
    }

    if (!config.url) return;
    const audio = new Audio(config.url);
    audio.volume = config.volume;
    audio.loop = false;
    audio.play().catch(() => {});
    audio.addEventListener("ended", () => setPreviewPlaying(false));
    setPreviewAudio(audio);
    setPreviewPlaying(true);
  }

  function handleClear() {
    if (previewAudio) previewAudio.pause();
    setPreviewPlaying(false);
    setConfig({ enabled: false, url: "", volume: 0.15, title: "" });
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-500/50 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
          Panel de Control
        </h1>
        <p className="text-sm text-zinc-400">
          Configuración avanzada del sistema. Solo disponible para el Administrador Principal.
        </p>
      </div>

      {/* Music Control Section */}
      <div className="glassmorphism p-6 rounded-xl border border-zinc-800/80 space-y-6 premium-card-3d">
        {/* Section header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-200 flex items-center gap-2">
              Música de Fondo
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </h2>
            <p className="text-[11px] text-zinc-500">
              Pon música que se reproducirá para TODOS los usuarios en el panel. Ellos pueden silenciarla individualmente.
            </p>
          </div>
        </div>

        <div className="h-px bg-zinc-800/60" />

        {/* Enable toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
          <div className="flex items-center gap-3">
            <Radio className={`w-5 h-5 ${config.enabled ? "text-emerald-400 animate-pulse" : "text-zinc-600"}`} />
            <div>
              <p className="text-sm font-semibold text-zinc-200">Activar Música Global</p>
              <p className="text-[10px] text-zinc-500">Cuando está activo, la música se reproduce para todos los usuarios del dashboard.</p>
            </div>
          </div>
          <button
            onClick={() => setConfig({ ...config, enabled: !config.enabled })}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
              config.enabled ? "bg-emerald-600" : "bg-zinc-700"
            }`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${
              config.enabled ? "left-[26px]" : "left-0.5"
            }`} />
          </button>
        </div>

        {/* Music URL */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">
            URL del Audio (MP3)
          </label>
          <input
            type="text"
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-650 px-3 py-2.5 rounded-lg text-sm outline-none focus:border-emerald-500/50 transition font-mono"
            value={config.url}
            onChange={(e) => setConfig({ ...config, url: e.target.value })}
            placeholder="https://ejemplo.com/musica.mp3"
          />
        </div>

        {/* Title */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">
            Nombre de la Canción (visible para usuarios)
          </label>
          <input
            type="text"
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-650 px-3 py-2.5 rounded-lg text-sm outline-none focus:border-emerald-500/50 transition"
            value={config.title}
            onChange={(e) => setConfig({ ...config, title: e.target.value })}
            placeholder="Ej. Lofi Chill Beats"
          />
        </div>

        {/* Volume slider */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> Volumen
            </label>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              {Math.round(config.volume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(config.volume * 100)}
            onChange={(e) => setConfig({ ...config, volume: parseInt(e.target.value) / 100 })}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[9px] text-zinc-600 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Preset suggestions */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 block">
            Presets Sugeridos (Royalty-Free)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.title}
                type="button"
                onClick={() => setConfig({ ...config, url: p.url, title: p.title })}
                className={`p-3 rounded-lg border text-left transition ${
                  config.url === p.url
                    ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                    : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Music className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs font-semibold truncate">{p.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-zinc-800/60" />

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePreview}
            disabled={!config.url}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-300 text-xs font-bold hover:bg-zinc-850 hover:border-zinc-600 disabled:opacity-40 disabled:pointer-events-none transition"
          >
            {previewPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {previewPlaying ? "Pausar Preview" : "Preview"}
          </button>

          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-900/30 bg-red-950/10 text-red-400 text-xs font-bold hover:bg-red-950/20 transition"
          >
            <Trash2 className="w-4 h-4" />
            Limpiar
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold disabled:opacity-50 disabled:pointer-events-none transition shadow-lg shadow-emerald-950/30"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Guardando..." : "Guardar y Aplicar a Todos"}
          </button>
        </div>

        {/* Status message */}
        {status && (
          <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
            status.type === "success"
              ? "bg-emerald-950/20 border-emerald-900/30 text-emerald-400"
              : "bg-red-950/20 border-red-900/30 text-red-400"
          }`}>
            {status.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            {status.msg}
          </div>
        )}
      </div>
    </div>
  );
}
