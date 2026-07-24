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
  const ytContainerId = "yt-music-player-container";
  const [ytApiReady, setYtApiReady] = useState(false);

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
    const interval = setInterval(fetchConfig, 15000); // Check faster (15s) for quick sync
    return () => clearInterval(interval);
  }, []);

  // Load YouTube Iframe Player API if url is YouTube
  useEffect(() => {
    if (!config || !config.enabled || !config.url) return;
    const isYt = !!getYouTubeId(config.url);
    if (!isYt) return;

    if ((window as any).YT && (window as any).YT.Player) {
      setYtApiReady(true);
      return;
    }

    // Bind global ready callback
    (window as any).onYouTubeIframeAPIReady = () => {
      setYtApiReady(true);
    };

    if (!document.getElementById("yt-iframe-api-script")) {
      const tag = document.createElement("script");
      tag.id = "yt-iframe-api-script";
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }
  }, [config]);

  // Main Audio Control (YouTube vs HTML5 Audio)
  useEffect(() => {
    if (!config || !config.enabled || !config.url) {
      // Pause both
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === "function") {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch {}
      }
      setIsPlaying(false);
      return;
    }

    const ytId = getYouTubeId(config.url);

    if (userMuted) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === "function") {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch {}
      }
      setIsPlaying(false);
      setShowBar(true);
      return;
    }

    if (ytId) {
      // Pause HTML5 Audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      if (!ytApiReady || !(window as any).YT) return;

      const initYtPlayer = () => {
        try {
          // If player already exists, load video or play
          if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === "function") {
            const currentUrl = ytPlayerRef.current.getVideoUrl ? ytPlayerRef.current.getVideoUrl() : "";
            if (!currentUrl.includes(ytId)) {
              ytPlayerRef.current.loadVideoById({
                videoId: ytId,
                startSeconds: 0,
              });
            }
            ytPlayerRef.current.setVolume(config.volume * 100);
            if (!userMuted) {
              ytPlayerRef.current.playVideo();
            }
          } else {
            // Create container element dynamically if not present
            let container = document.getElementById(ytContainerId);
            if (!container) {
              container = document.createElement("div");
              container.id = ytContainerId;
              container.style.position = "absolute";
              container.style.width = "0px";
              container.style.height = "0px";
              container.style.left = "-9999px";
              container.style.top = "-9999px";
              container.style.pointerEvents = "none";
              document.body.appendChild(container);
            }

            ytPlayerRef.current = new (window as any).YT.Player(ytContainerId, {
              videoId: ytId,
              height: "0",
              width: "0",
              playerVars: {
                autoplay: 1,
                controls: 0,
                disablekb: 1,
                fs: 0,
                loop: 1,
                playlist: ytId, // Required for loop in YT Iframe player
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
              },
              events: {
                onReady: (event: any) => {
                  event.target.setVolume(config.volume * 100);
                  if (!userMuted) {
                    event.target.playVideo();
                  }
                },
                onStateChange: (event: any) => {
                  // 1 = PLAYING, 2 = PAUSED
                  if (event.data === 1) {
                    setIsPlaying(true);
                  } else {
                    setIsPlaying(false);
                  }
                  // Auto loop video if it ends
                  if (event.data === 0) {
                    event.target.playVideo();
                  }
                },
              },
            });
          }
        } catch (e) {
          console.warn("YouTube Player initialization failed:", e);
        }
      };

      initYtPlayer();
    } else {
      // Pause YouTube
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === "function") {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch {}
      }

      // Handle HTML5 Audio
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

      const playPromise = audioRef.current.play();
      if (playPromise) {
        playPromise.catch(() => {
          const startOnInteraction = () => {
            if (audioRef.current && config.enabled && !userMuted && !getYouTubeId(config.url)) {
              audioRef.current.play().catch(() => {});
            }
            window.removeEventListener("click", startOnInteraction);
            window.removeEventListener("keydown", startOnInteraction);
          };
          window.addEventListener("click", startOnInteraction);
          window.addEventListener("keydown", startOnInteraction);
        });
      }
    }

    setShowBar(true);
  }, [config, userMuted, ytApiReady]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === "function") {
        try {
          ytPlayerRef.current.destroy();
        } catch {}
        ytPlayerRef.current = null;
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
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center ${
          isPlaying ? "bg-emerald-950/50 border border-emerald-500/30 text-emerald-400" : "bg-zinc-900 border border-zinc-800 text-zinc-500"
        }`}
      >
        <Music className={`w-3.5 h-3.5 ${isPlaying ? "animate-pulse" : ""}`} />
      </div>

      <div className="max-w-[120px]">
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider leading-none">Música</p>
        <p className="text-[11px] text-zinc-300 truncate leading-tight mt-0.5">
          {config.title || "Background Track"}
        </p>
      </div>

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
