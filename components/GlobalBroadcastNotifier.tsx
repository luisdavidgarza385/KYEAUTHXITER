"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, X, MessageSquare, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Log {
  id: any;
  created_at: string;
  app_id: string | null;
  user_id: string | null;
  message: string;
  level: string;
}

interface ToastMessage {
  id: any;
  sender: string;
  message: string;
  created_at: string;
}

export function GlobalBroadcastNotifier({ currentUserEmail }: { currentUserEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const lastSeenIdRef = useRef<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstPoll = useRef(true);

  // Monitor user interaction to bypass browser autoplay restrictions
  useEffect(() => {
    const handleInteraction = () => {
      setHasInteracted(true);
      // Remove listeners once interacted
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);

    // Initialize last seen ID from localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("spectral_x_last_seen_msg_id");
      if (stored) {
        lastSeenIdRef.current = stored;
      }
    }

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  // Audio playing helper
  const playChime = () => {
    try {
      const audio = new Audio("/universfield-new-notification-051-494246.mp3");
      audio.volume = 0.45;
      audio.play().catch((err) => {
        console.warn("Audio chime autoplay blocked by browser. Awaiting user interaction.", err);
      });
    } catch (e) {
      console.error("Failed to play audio notification chime:", e);
    }
  };

  // Poll for new broadcast announcements
  useEffect(() => {
    async function checkNewBroadcasts() {
      try {
        const res = await fetch("/api/admin/logs?limit=5");
        if (!res.ok) return;
        const json = await res.json();
        
        if (json.success && Array.isArray(json.data)) {
          const rawLogs: Log[] = json.data;
          
          // Filter logs starting with "[Broadcast] "
          const broadcasts = rawLogs.filter((l) => l.message.startsWith("[Broadcast] "));
          if (broadcasts.length === 0) return;

          // The logs are returned in descending order (newest first)
          const latestLog = broadcasts[0];
          const latestIdStr = String(latestLog.id);

          // Parse format "[Broadcast] [by:email] actual message"
          const match = latestLog.message.match(/^\[Broadcast\]\s+\[by:([^\]]+)\]\s+([\s\S]+)$/);
          let sender = "Administrador";
          let cleanMessage = latestLog.message.replace("[Broadcast] ", "");

          if (match) {
            sender = match[1];
            cleanMessage = match[2];
          }

          // If sender is current user, we don't play sound/toast (but we update localStorage)
          const isFromSelf = sender === currentUserEmail;

          // Check if this message is new compared to the ref
          const isNewMessage = lastSeenIdRef.current !== null && latestIdStr !== lastSeenIdRef.current;
          
          // First load offline check:
          // If lastSeenIdRef is null (meaning localStorage key doesn't exist), we save the current one and don't play chime
          // unless we want it to chime on fresh cookies. But if they had a stored ID, and this is greater/different, it's new.
          const isOfflineUnread = isFirstPoll.current && 
                                  lastSeenIdRef.current !== null && 
                                  latestIdStr !== lastSeenIdRef.current;

          if ((isNewMessage || isOfflineUnread) && !isFromSelf) {
            // Play audio chime
            playChime();

            // Display toast if they are NOT already on the chat page
            if (pathname !== "/dashboard/chat") {
              setToast({
                id: latestLog.id,
                sender,
                message: cleanMessage,
                created_at: latestLog.created_at,
              });
            }
          }

          // Update ref and localStorage
          lastSeenIdRef.current = latestIdStr;
          localStorage.setItem("spectral_x_last_seen_msg_id", latestIdStr);
        }
      } catch (err) {
        console.error("Error checking broadcasts in background:", err);
      } finally {
        isFirstPoll.current = false;
      }
    }

    // Initial check
    checkNewBroadcasts();

    // Check every 4 seconds
    pollIntervalRef.current = setInterval(checkNewBroadcasts, 4000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [pathname, currentUserEmail, hasInteracted]);

  // Auto dismiss toast after 7 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast) return null;

  return (
    <div 
      className="fixed bottom-5 right-5 z-[9999] w-80 max-w-[calc(100vw-40px)] glassmorphism border border-emerald-500/30 p-4 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(16,185,129,0.15)] animate-slide-in-right transition-all duration-300"
      style={{
        backgroundImage: "radial-gradient(circle at 10% 10%, rgba(16, 185, 129, 0.08) 0px, transparent 50%)",
      }}
    >
      {/* Top Banner Indicator */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-t-xl" />

      <div className="flex items-start gap-3">
        {/* Glowing Bell Icon */}
        <div className="p-2 bg-emerald-950/50 border border-emerald-500/20 rounded-lg text-emerald-400 shrink-0 shadow-inner animate-pulse">
          <Bell className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-450 uppercase tracking-widest">Nuevo Anuncio</span>
            <button 
              onClick={() => setToast(null)}
              className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded transition"
              aria-label="Cerrar notificación"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <h4 className="text-xs font-bold text-zinc-100 mt-1 truncate">
            {toast.sender.split("@")[0]}
          </h4>
          
          <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed line-clamp-2 break-words">
            {toast.message}
          </p>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-zinc-800/40">
            <button
              onClick={() => {
                router.push("/dashboard/chat");
                setToast(null);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg transition"
            >
              <MessageSquare className="w-3 h-3" />
              Ver Mensaje
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
