"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, X, MessageSquare, ArrowRight, Volume2 } from "lucide-react";
import { playGlobalNotificationChime } from "@/lib/audio";

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
  const [unreadMsgId, setUnreadMsgId] = useState<string | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chimeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor user interaction to allow Web Audio API / HTML5 Audio playback
  useEffect(() => {
    const handleInteraction = () => {
      setHasInteracted(true);
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  // Play chime safely
  const playChime = () => {
    try {
      playGlobalNotificationChime();
    } catch (e) {
      console.warn("Chime playback error:", e);
    }
  };

  // If user is on the chat page, mark as read immediately
  useEffect(() => {
    if (pathname === "/dashboard/chat" && unreadMsgId) {
      localStorage.setItem("ka_last_read_broadcast_id", unreadMsgId);
      setUnreadMsgId(null);
      setToast(null);
    }
  }, [pathname, unreadMsgId]);

  // Repeated audio chime while there's an unread message
  useEffect(() => {
    if (unreadMsgId && pathname !== "/dashboard/chat") {
      // Play chime immediately
      playChime();

      // Repeat chime every 12 seconds until user reads the message
      chimeIntervalRef.current = setInterval(() => {
        playChime();
      }, 12000);
    } else {
      if (chimeIntervalRef.current) {
        clearInterval(chimeIntervalRef.current);
      }
    }

    return () => {
      if (chimeIntervalRef.current) {
        clearInterval(chimeIntervalRef.current);
      }
    };
  }, [unreadMsgId, pathname]);

  // Poll for new broadcast announcements
  useEffect(() => {
    async function checkNewBroadcasts() {
      try {
        const res = await fetch("/api/admin/logs?limit=5");
        if (!res.ok) return;
        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          const rawLogs: Log[] = json.data;
          const broadcasts = rawLogs.filter((l) => l.message.startsWith("[Broadcast] "));
          if (broadcasts.length === 0) return;

          const latestLog = broadcasts[0];
          const latestIdStr = String(latestLog.id);
          const lastReadId = localStorage.getItem("ka_last_read_broadcast_id");

          // Parse message text
          const match = latestLog.message.match(/^\[Broadcast\]\s+\[by:([^\]]+)\]\s+([\s\S]+)$/);
          let sender = "Administrador";
          let cleanMessage = latestLog.message.replace("[Broadcast] ", "");

          if (match) {
            sender = match[1];
            cleanMessage = match[2];
          }

          // If current user is not on chat and has not read this latest broadcast
          if (lastReadId !== latestIdStr) {
            setUnreadMsgId(latestIdStr);
            if (pathname !== "/dashboard/chat") {
              setToast({
                id: latestLog.id,
                sender,
                message: cleanMessage,
                created_at: latestLog.created_at,
              });
            }
          }
        }
      } catch (err) {
        console.error("Error checking broadcasts in background:", err);
      }
    }

    checkNewBroadcasts();
    pollIntervalRef.current = setInterval(checkNewBroadcasts, 4000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [pathname, currentUserEmail]);

  const markAsRead = () => {
    if (unreadMsgId) {
      localStorage.setItem("ka_last_read_broadcast_id", unreadMsgId);
    }
    setUnreadMsgId(null);
    setToast(null);
  };

  if (!toast || pathname === "/dashboard/chat") return null;

  return (
    <div 
      className="fixed bottom-5 right-5 z-[9999] w-88 max-w-[calc(100vw-40px)] bg-[#040c1a]/95 border border-sky-500/40 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(0,191,255,0.2)] backdrop-blur-2xl animate-bounce-short transition-all duration-300"
    >
      {/* Top Banner Indicator */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-sky-400 rounded-t-2xl animate-pulse" />

      <div className="flex items-start gap-3">
        {/* Glowing Bell Icon */}
        <div className="p-2.5 bg-sky-950/80 border border-sky-500/40 rounded-xl text-sky-400 shrink-0 shadow-md shadow-sky-500/20 animate-pulse">
          <Bell className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-sky-400 uppercase tracking-widest flex items-center gap-1">
              <Volume2 className="w-3 h-3 animate-ping" />
              NUEVO COMUNICADO GLOBAL
            </span>
            <button 
              onClick={markAsRead}
              className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800 transition"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <h4 className="text-xs font-bold text-white mt-1 truncate">
            {toast.sender.split("@")[0]}
          </h4>
          
          <p className="text-[11px] text-zinc-300 mt-1.5 leading-relaxed line-clamp-3 break-words font-sans">
            {toast.message}
          </p>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-sky-500/20">
            <button
              onClick={() => {
                markAsRead();
                router.push("/dashboard/chat");
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition shadow-md shadow-sky-500/25"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Leer Mensaje en Chat
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
