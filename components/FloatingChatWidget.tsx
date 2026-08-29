"use client";

import React, { useState } from "react";
import { MessageSquare, X, Send, User, Sparkles } from "lucide-react";

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; time: string; isBot?: boolean }>>([
    {
      sender: "RealAuthX Bot",
      text: "¡Hola! Bienvenido al soporte y comunidad de RealAuthX. ¿En qué podemos ayudarte hoy?",
      time: "Ahora",
      isBot: true,
    },
  ]);
  const [inputVal, setInputVal] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg = {
      sender: "Tú",
      text: inputVal.trim(),
      time: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = inputVal;
    setInputVal("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "RealAuthX Bot",
          text: `Recibido: "${currentInput}". Nuestro equipo o asistente está a tu disposición en cualquier momento.`,
          time: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
          isBot: true,
        },
      ]);
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-[340px] sm:w-[380px] h-[480px] rounded-2xl bg-[#040e24]/95 border border-[#0099ff]/35 shadow-[0_15px_45px_rgba(0,0,0,0.8)] backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-[#0066cc] to-[#0099ff] flex items-center justify-between text-white shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-200" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">Chat Global RealAuthX</h4>
                <span className="text-[10px] text-cyan-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Soporte Activo
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-sky-500/20 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === "Tú" ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1 mb-1 text-[10px] text-slate-400 font-medium">
                  {m.isBot ? <Sparkles className="w-3 h-3 text-[#00c2ff]" /> : <User className="w-3 h-3 text-slate-400" />}
                  <span>{m.sender}</span>
                  <span>•</span>
                  <span>{m.time}</span>
                </div>
                <div
                  className={`px-3 py-2 rounded-xl max-w-[85%] leading-relaxed ${
                    m.sender === "Tú"
                      ? "bg-[#0088ff] text-white rounded-br-none"
                      : "bg-[#07193b] border border-[#0099ff]/25 text-slate-200 rounded-bl-none shadow-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-[#020817]/90 flex items-center gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-[#05112c] border border-[#0099ff]/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-[#00c2ff]"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-[#0088ff] hover:bg-[#0099ff] text-white shadow-md transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-[#0088ff] to-[#00b4ff] text-white shadow-[0_0_25px_rgba(0,153,255,0.6)] hover:shadow-[0_0_35px_rgba(0,180,255,0.9)] hover:scale-105 transition-all flex items-center justify-center cursor-pointer group"
          aria-label="Abrir Chat"
        >
          <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#02060f]" />
        </button>
      )}
    </div>
  );
}
