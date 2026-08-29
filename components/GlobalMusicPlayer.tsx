"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Music } from "lucide-react";

interface MusicConfig {
  enabled: boolean;
  url: string;
  volume: number;
  title: string;
}

function getYouTubeId(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function GlobalMusicPlayer() {
  const [config, setConfig] = useState<MusicConfig | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userMuted, setUserMuted] = useState(false);
  const [showBar, setShowBar] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytContainerId = "yt-global-music-container";
  const [ytApiReady, setYtApiReady] = useState(false);

  // Load user mute preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("securex_music_muted");
      if (stored === "true") setUserMuted(true);
    }
  }, []);

  // Fetch music config
  useEffect(() => {
    async function updateActiveMusic() {
      try {
        // 1. Check global music from backend first
        const res = await fetch("/api/admin/music");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.config && json.config.enabled && json.config.url) {
            // Global music is active and overrides all
            setConfig({
              enabled: true,
              url: json.config.url,
              volume: json.config.volume ?? 0.25,
              title: json.config.title || "Música Global",
            });
            return;
          }
        }
      } catch {}

      // 2. If global music is disabled, check user's personal music preference
      if (typeof window !== "undefined") {
        const personal = localStorage.getItem("spectral_x_personal_music");
        if (personal) {
          try {
            const pConfig = JSON.parse(personal);
            if (pConfig && pConfig.url && pConfig.enabled !== false) {
              setConfig({
                enabled: true,
                url: pConfig.url,
                volume: pConfig.volume ?? 0.25,
                title: pConfig.title || "Música Personal",
              });
              return;
            }
          } catch {}
        }
      }

      // 3. Neither active
      setConfig(null);
      setIsPlaying(false);
    }

    updateActiveMusic();
    const interval = setInterval(updateActiveMusic, 12000);
    const handlePersonalUpdate = () => updateActiveMusic();
    window.addEventListener("spectral-personal-music-updated", handlePersonalUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("spectral-personal-music-updated", handlePersonalUpdate);
    };
  }, []);

  // Load YouTube Iframe API if required
  useEffect(() => {
    if (!config || !config.enabled || !config.url) return;
    const isYt = !!getYouTubeId(config.url);
    if (!isYt) return;

    if ((window as any).YT && (window as any).YT.Player) {
      setYtApiReady(true);
      return;
    }

    (window as any).onYouTubeIframeAPIReady = () => {
      setYtApiReady(true);
    };

    if (!document.getElementById("yt-iframe-api-script")) {
      const tag = document.createElement("script");
      tag.id = "yt-iframe-api-script";
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  }, [config]);

  // Handle Playback
  useEffect(() => {
    if (!config || !config.enabled || !config.url) {
      if (audioRef.current) audioRef.current.pause();
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === "function") {
        try { ytPlayerRef.current.pauseVideo(); } catch {}
      }
      setIsPlaying(false);
      return;
    }

    const ytId = getYouTubeId(config.url);

    if (userMuted) {
      if (audioRef.current) audioRef.current.pause();
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === "function") {
        try { ytPlayerRef.current.pauseVideo(); } catch {}
      }
      setIsPlaying(false);
      setShowBar(true);
      return;
    }

    if (ytId) {
      // Pause HTML5 audio
      if (audioRef.current) audioRef.current.pause();

      if (!ytApiReady || !(window as any).YT) return;

      try {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === "function") {
          const currentUrl = ytPlayerRef.current.getVideoUrl ? ytPlayerRef.current.getVideoUrl() : "";
          if (!currentUrl.includes(ytId)) {
            ytPlayerRef.current.loadVideoById({ videoId: ytId, startSeconds: 0 });
          }
          ytPlayerRef.current.setVolume(Math.round((config.volume ?? 0.25) * 100));
          if (!userMuted) {
            ytPlayerRef.current.playVideo();
          }
        } else {
          let container = document.getElementById(ytContainerId);
          if (!container) {
            container = document.createElement("div");
            container.id = ytContainerId;
            container.style.position = "fixed";
            container.style.width = "10px";
            container.style.height = "10px";
            container.style.bottom = "0px";
            container.style.left = "0px";
            container.style.opacity = "0.001";
            container.style.pointerEvents = "none";
            container.style.zIndex = "-1";
            document.body.appendChild(container);
          }

          ytPlayerRef.current = new (window as any).YT.Player(ytContainerId, {
            videoId: ytId,
            height: "10",
            width: "10",
            playerVars: {
              autoplay: 1,
              controls: 0,
              disablekb: 1,
              fs: 0,
              loop: 1,
              playlist: ytId,
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
            },
            events: {
              onReady: (event: any) => {
                event.target.setVolume(Math.round((config.volume ?? 0.25) * 100));
                if (!userMuted) {
                  event.target.playVideo();
                }
              },
              onStateChange: (event: any) => {
                if (event.data === 1) {
                  setIsPlaying(true);
                } else {
                  setIsPlaying(false);
                }
                if (event.data === 0) {
                  event.target.playVideo();
                }
              },
            },
          });
        }
      } catch (e) {
        console.warn("YouTube Player initialization:", e);
      }

      // Interaction unlock for browser autoplay policies
      const unlockYt = () => {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === "function" && !userMuted) {
          try { ytPlayerRef.current.playVideo(); } catch {}
        }
        window.removeEventListener("click", unlockYt);
      };
      window.addEventListener("click", unlockYt);
    } else {
      // Pause YouTube
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === "function") {
        try { ytPlayerRef.current.pauseVideo(); } catch {}
      }

      if (!audioRef.current || audioRef.current.src !== config.url) {
        if (audioRef.current) audioRef.current.pause();
        const audio = new Audio(config.url);
        audio.loop = true;
        audio.volume = config.volume ?? 0.25;
        audioRef.current = audio;

        audio.addEventListener("playing", () => setIsPlaying(true));
        audio.addEventListener("pause", () => setIsPlaying(false));
        audio.addEventListener("error", () => setIsPlaying(false));
      } else {
        audioRef.current.volume = config.volume ?? 0.25;
      }

      const p = audioRef.current.play();
      if (p) {
        p.catch(() => {
          const unlock = () => {
            if (audioRef.current && config.enabled && !userMuted && !getYouTubeId(config.url)) {
              audioRef.current.play().catch(() => {});
            }
            window.removeEventListener("click", unlock);
          };
          window.addEventListener("click", unlock);
        });
      }
    }

    setShowBar(true);
  }, [config, userMuted, ytApiReady]);

  // Clean up
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === "function") {
        try { ytPlayerRef.current.destroy(); } catch {}
        ytPlayerRef.current = null;
      }
    };
  }, []);

  const toggleMute = () => {
    const next = !userMuted;
    setUserMuted(next);
    localStorage.setItem("securex_music_muted", String(next));
  };

  if (!config || !config.enabled || !config.url || !showBar) return null;

  return (
    <div className="fixed bottom-5 left-5 z-[9998] flex items-center gap-2 px-3 py-2 rounded-xl bg-[#040e24]/90 backdrop-blur-md border border-[#0099ff]/35 shadow-[0_8px_24px_rgba(0,0,0,0.8)] transition-all duration-300 group hover:border-[#00c2ff]/60">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center ${
          isPlaying ? "bg-[#00c2ff]/20 border border-[#00c2ff]/40 text-[#00c2ff]" : "bg-zinc-900 border border-zinc-800 text-zinc-500"
        }`}
      >
        <Music className={`w-3.5 h-3.5 ${isPlaying ? "animate-pulse" : ""}`} />
      </div>

      <div className="max-w-[130px]">
        <p className="text-[9px] text-[#00c2ff] font-extrabold uppercase tracking-wider leading-none font-mono">Música</p>
        <p className="text-[11px] text-slate-200 truncate leading-tight mt-0.5 font-medium">
          {config.title || "SecureX Audio"}
        </p>
      </div>

      <button
        onClick={toggleMute}
        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
          userMuted
            ? "bg-red-950/30 border-red-500/30 text-red-400 hover:bg-red-950/50"
            : "bg-[#0088ff]/20 border-[#0088ff]/40 text-[#00c2ff] hover:bg-[#0088ff]/30"
        }`}
        title={userMuted ? "Activar música" : "Silenciar música"}
      >
        {userMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
