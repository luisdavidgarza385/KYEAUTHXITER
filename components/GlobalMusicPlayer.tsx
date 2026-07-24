"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Music, SkipForward } from "lucide-react";

interface MusicConfig {
  enabled: boolean;
  url: string;
  volume: number;
  title: string;
}

export function GlobalMusicPlayer() {
  const [config, setConfig] = useState<MusicConfig | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userMuted, setUserMuted] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load user mute preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("spectral_x_music_muted");
      if (stored === "true") setUserMuted(true);
    }
  }, []);

  // Fetch music config
  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/admin/music");
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && json.config) {
          setConfig(json.config);
        }
      } catch {}
    }
    fetchConfig();
    // Re-check every 30 seconds for config changes
    const interval = setInterval(fetchConfig, 30000);
    return () => clearInterval(interval);
  }, []);

  // Play/pause based on config + mute state
  useEffect(() => {
    if (!config || !config.enabled || !config.url) {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }

    if (userMuted) {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      setShowBar(true);
      return;
    }

    // Create or update audio element
    if (!audioRef.current || audioRef.current.src !== config.url) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(config.url);
      audio.loop = true;
      audio.volume = config.volume;
      audioRef.current = audio;

      audio.addEventListener("playing", () => setIsPlaying(true));
      audio.addEventListener("pause", () => setIsPlaying(false));
      audio.addEventListener("error", () => setIsPlaying(false));
    } else {
      audioRef.current.volume = config.volume;
    }

    // Attempt to play
    const playPromise = audioRef.current.play();
    if (playPromise) {
      playPromise.catch(() => {
        // Autoplay blocked, will start on first user interaction
        const startOnInteraction = () => {
          if (audioRef.current && config.enabled && !userMuted) {
            audioRef.current.play().catch(() => {});
          }
          window.removeEventListener("click", startOnInteraction);
          window.removeEventListener("keydown", startOnInteraction);
        };
        window.addEventListener("click", startOnInteraction);
        window.addEventListener("keydown", startOnInteraction);
      });
    }

    setShowBar(true);

    return () => {
      // Don't destroy audio on cleanup, just let it keep playing
    };
  }, [config, userMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMute = () => {
    const next = !userMuted;
    setUserMuted(next);
    localStorage.setItem("spectral_x_music_muted", String(next));
  };

  if (!config || !config.enabled || !config.url || !showBar) return null;

  return (
    <div className="fixed bottom-5 left-5 z-[9998] flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-950/80 backdrop-blur-md border border-zinc-800/60 shadow-[0_8px_24px_rgba(0,0,0,0.6)] transition-all duration-300 group hover:border-emerald-500/30">
      {/* Music icon with pulse */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
        isPlaying ? "bg-emerald-950/50 border border-emerald-500/30 text-emerald-400" : "bg-zinc-900 border border-zinc-800 text-zinc-500"
      }`}>
        <Music className={`w-3.5 h-3.5 ${isPlaying ? "animate-pulse" : ""}`} />
      </div>

      {/* Title */}
      <div className="max-w-[120px]">
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider leading-none">Música</p>
        <p className="text-[11px] text-zinc-300 truncate leading-tight mt-0.5">
          {config.title || "Background"}
        </p>
      </div>

      {/* Mute/Unmute button */}
      <button
        onClick={toggleMute}
        className={`p-1.5 rounded-lg border transition-all ${
          userMuted
            ? "bg-red-950/30 border-red-500/30 text-red-400 hover:bg-red-950/50"
            : "bg-emerald-950/30 border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/50"
        }`}
        title={userMuted ? "Activar música" : "Silenciar música"}
      >
        {userMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
