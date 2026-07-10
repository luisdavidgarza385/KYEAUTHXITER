"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Volume2, VolumeX, MessageSquare, AlertCircle, Sparkles, Clock, User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface Log {
  id: number;
  created_at: string;
  app_id: string | null;
  user_id: string | null;
  message: string;
  level: "info" | "success" | "warning" | "danger";
}

interface ParsedMessage {
  id: number;
  sender: string;
  message: string;
  level: string;
  created_at: string;
  isSelf: boolean;
}

export function ChatClient({ role, email, isSuperAdmin }: { role: string; email: string; isSuperAdmin: boolean }) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [messages, setMessages] = useState<ParsedMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("spectral_x_sound_enabled");
      if (stored !== null) {
        setSoundEnabled(stored !== "false");
      }
    }
  }, []);

  const isFirstLoad = useRef(true);
  const lastMessageId = useRef<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isAdmin = role === "admin" || role === "developer";

  // Plays PlayStation App notification sound chime
  function playFuturisticChime() {
    if (!soundEnabled) return;
    try {
      const audio = new Audio("/universfield-new-notification-051-494246.mp3");
      audio.volume = 0.35;
      audio.play().catch((e) => console.warn("Audio play blocked by browser:", e));
    } catch (e) {
      console.warn("Audio chime play failed:", e);
    }
  }

  // Fetch logs and parse broadcasts
  async function fetchBroadcastLogs(isSilent = false) {
    try {
      const res = await fetch("/api/admin/logs?limit=50");
      if (!res.ok) throw new Error("Error al obtener los logs del servidor");
      const json = await res.json();
      
      if (json.success && Array.isArray(json.data)) {
        const rawLogs: Log[] = json.data;
        // Filter logs starting with "[Broadcast] "
        const broadcasts = rawLogs.filter((l) => l.message.startsWith("[Broadcast] "));

        // Parse broadcasts
        const parsed: ParsedMessage[] = broadcasts.map((l) => {
          // Parse format "[Broadcast] [by:email] actual message"
          const match = l.message.match(/^\[Broadcast\]\s+\[by:([^\]]+)\]\s+([\s\S]+)$/);
          let sender = "Administrador";
          let cleanMessage = l.message.replace("[Broadcast] ", "");

          if (match) {
            sender = match[1];
            cleanMessage = match[2];
          }

          return {
            id: l.id,
            sender: sender,
            message: cleanMessage,
            level: l.level,
            created_at: l.created_at,
            isSelf: sender === email,
          };
        });

        // Reverse to show in chronological order (oldest first, newest at the bottom)
        const sorted = parsed.reverse();

        if (sorted.length > 0) {
          const latestId = sorted[sorted.length - 1].id;

          // Note: Global audio notification chime is handled by GlobalBroadcastNotifier

          lastMessageId.current = latestId;
        }

        setMessages(sorted);
        setError(null);
      }
    } catch (err: any) {
      console.error(err);
      if (!isSilent) {
        setError("No se pudieron cargar los comunicados. Reintentando...");
      }
    } finally {
      isFirstLoad.current = false;
    }
  }

  // Poll logs every 5 seconds
  useEffect(() => {
    fetchBroadcastLogs();

    const interval = setInterval(() => {
      fetchBroadcastLogs(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [email, soundEnabled]);

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle message send
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!inputText.trim() || isSending || !isSuperAdmin) return;

    setIsSending(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputText.trim(), level: "info" }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Error al enviar el comunicado");
      }

      setInputText("");
      // Immediate fetch refresh
      await fetchBroadcastLogs(true);
    } catch (err: any) {
      setError(err.message || "Error al enviar el comunicado");
    } finally {
      setIsSending(false);
    }
  }

  // Format date helper
  function formatTime(dateStr: string) {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }

  function formatDate(dateStr: string) {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString([], { day: "2-digit", month: "short" });
    } catch {
      return "";
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left panel: Info & Accent settings */}
      <div className="lg:col-span-1 space-y-4">
        <div className="glassmorphism p-5 rounded-xl border border-zinc-800/80 flex flex-col space-y-4 premium-card-3d">
          <div className="flex items-center gap-2 text-emerald-400">
            <Sparkles className="w-5 h-5" />
            <h2 className="font-semibold text-zinc-200">Panel de Canales</h2>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Este chat reúne todas las alertas de sistema y anuncios oficiales creados por los desarrolladores y administradores del panel.
          </p>

          <div className="h-px bg-zinc-850" />

          {/* Sound customization options */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
              Notificaciones de Audio
            </label>
            <button
              onClick={() => {
                const nextVal = !soundEnabled;
                setSoundEnabled(nextVal);
                localStorage.setItem("spectral_x_sound_enabled", String(nextVal));
                if (nextVal) {
                  // Play a test chime to show it's active
                  setTimeout(() => playFuturisticChime(), 100);
                }
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200",
                soundEnabled
                  ? "bg-emerald-950/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/30"
                  : "bg-zinc-900/60 text-zinc-400 border-zinc-850 hover:bg-zinc-900"
              )}
            >
              <span className="flex items-center gap-2">
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                Alerta de Sonido (Chime)
              </span>
              <span className="text-[10px] font-mono opacity-80">
                {soundEnabled ? "ON" : "OFF"}
              </span>
            </button>
          </div>

          <div className="h-px bg-zinc-850" />

          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
            <Shield className="w-3.5 h-3.5" />
            <span>Rol: <span className="font-mono text-zinc-400 uppercase">{role}</span></span>
          </div>
        </div>
      </div>

      {/* Main chat window */}
      <div className="lg:col-span-3 flex flex-col h-[600px] glassmorphism rounded-xl border border-zinc-800/80 overflow-hidden relative">
        {/* Chat Header */}
        <div className="p-4 border-b border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-200">Anuncios Generales</div>
              <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Actualización en tiempo real (5s)
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar-thin">
          {error && (
            <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-lg text-xs text-red-400 flex items-center gap-2 animate-pulse">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
              <MessageSquare className="w-10 h-10 text-zinc-600 animate-bounce" />
              <div className="text-sm font-semibold text-zinc-400">No hay comunicados globales</div>
              <div className="text-xs text-zinc-500 max-w-xs">
                Cuando los administradores publiquen actualizaciones, se listarán cronológicamente en esta sección.
              </div>
            </div>
          ) : (
            messages.map((msg, index) => {
              const showDateDivider =
                index === 0 ||
                formatDate(messages[index - 1].created_at) !== formatDate(msg.created_at);

              return (
                <div key={msg.id} className="space-y-3">
                  {showDateDivider && (
                    <div className="flex items-center justify-center my-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800/80 text-[10px] font-medium text-zinc-500">
                        {formatDate(msg.created_at)}
                      </span>
                    </div>
                  )}

                  <div
                    className={cn(
                      "flex flex-col max-w-[80%] space-y-1.5",
                      msg.isSelf ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    {/* Message Sender and Meta info */}
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 px-1">
                      <span className="font-semibold text-zinc-400 truncate max-w-[150px]">
                        {msg.sender}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-zinc-700" />
                      <span className="font-mono text-[9px] flex items-center gap-0.5">
                        <Clock className="w-3 h-3 text-zinc-650" />
                        {formatTime(msg.created_at)}
                      </span>
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={cn(
                        "p-3.5 rounded-2xl text-xs leading-relaxed break-words shadow-md transition-all duration-200 border",
                        msg.isSelf
                          ? "bg-emerald-950/20 text-emerald-100 border-emerald-500/30 rounded-tr-none hover:border-emerald-500/50"
                          : "bg-zinc-900/80 text-zinc-200 border-zinc-800 rounded-tl-none hover:border-zinc-750"
                      )}
                    >
                      <p className="whitespace-pre-line">{msg.message}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input or Read-Only Notice */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/40">
          {isSuperAdmin ? (
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                placeholder="Escribe un anuncio global..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isSending}
                className="flex-1 bg-zinc-900/60 border border-zinc-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 rounded-lg px-4 py-2.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none transition duration-150"
              />
              <button
                type="submit"
                disabled={isSending || !inputText.trim()}
                className="bg-emerald-650 hover:bg-emerald-600 active:scale-95 disabled:opacity-50 disabled:pointer-events-none text-white rounded-lg px-4 flex items-center justify-center transition-all duration-150 shadow-md shadow-emerald-950/20"
              >
                {isSending ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-zinc-900/60 border border-zinc-850 rounded-lg text-xs text-zinc-500 select-none">
              <Shield className="w-4 h-4 text-zinc-650 shrink-0" />
              <span>Solo los administradores pueden enviar comunicados. Estás en modo de lectura.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
