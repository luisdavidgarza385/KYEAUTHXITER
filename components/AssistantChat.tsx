"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Loader2, Sparkles, LogOut, RefreshCw, HelpCircle, ShieldAlert, CheckCircle, Key, MonitorSmartphone, Zap, Shield } from "lucide-react";

interface Message {
  id: string;
  sender: "assistant" | "user";
  text: string;
  timestamp: Date;
}

function renderText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="bg-sky-950/60 text-sky-300 px-1.5 py-0.5 rounded text-[10px] font-mono border border-sky-500/20">{part.slice(1, -1)}</code>;
    }
    return <span key={i}>{part}</span>;
  });
}

export function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init-1",
      sender: "assistant",
      text: "⚡ **SISTEMA DE SOPORTE GLOBAL SECUREX AUTH** ⚡\n\nHola, soy tu asistente de soporte virtual para todas las aplicaciones y revendedores. Mi función es ayudarte a restablecer tu Hardware ID (HWID) de forma automática si has cambiado de PC, formateado o reinstalado Windows.",
      timestamp: new Date(),
    },
    {
      id: "init-2",
      sender: "assistant",
      text: "🔑 **Opciones de Reset Disponibles:**\n\n1. **Reset por Licencia (Key):** Escribe tu clave/licencia completa (ej: `SPORTS GOAT Avanzado-77HM-KEMJ-L2KR-XY9K`).\n2. **Reset Win de Usuario:** Escribe el nombre de usuario con el que te registraste en la aplicación.\n\nPor favor, escribe a continuación tu **licencia** o **usuario** para realizar el reset en tiempo real.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingDots, setTypingDots] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setTypingDots((d) => (d + 1) % 4), 400);
    return () => clearInterval(t);
  }, [loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;
    if (!textToSend) setInputValue("");

    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "user", text, timestamp: new Date() }]);
    setLoading(true);

    try {
      const res = await fetch("/api/assistant/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: text }),
      });
      const data = await res.json();
      setTimeout(() => {
        setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: "assistant", text: data.message || "Error al procesar la solicitud.", timestamp: new Date() }]);
        setLoading(false);
      }, 900);
    } catch {
      setTimeout(() => {
        setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: "assistant", text: "❌ Ocurrió un error de red. Por favor, vuelve a intentarlo.", timestamp: new Date() }]);
        setLoading(false);
      }, 900);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleLogout = () => {
    document.cookie = "ka_assistant_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    window.location.href = "/asistente/login";
  };

  const quickOptions = [
    { type: "key" as const, label: "Reset Licencia", icon: Key, color: "sky" },
    { type: "user" as const, label: "Reset Win Usuario", icon: MonitorSmartphone, color: "emerald" },
    { type: "error" as const, label: "HWID Mismatch", icon: ShieldAlert, color: "amber" },
    { type: "how" as const, label: "¿Dónde busco la Key?", icon: HelpCircle, color: "purple" },
  ];

  const handleQuickOption = (type: "key" | "user" | "error" | "how") => {
    const texts: Record<string, string> = {
      key: "Quiero resetear el HWID mediante mi Licencia (Key).",
      user: "Quiero resetear el HWID (Reset Win) de mi Nombre de Usuario.",
      error: "Me sale error 'HWID Mismatch' al iniciar sesión en el ejecutable.",
      how: "¿Dónde puedo consultar mi Licencia o Usuario?",
    };
    handleSend(texts[type]);
  };

  const colorMap: Record<string, string> = {
    sky: "bg-sky-950/50 border-sky-500/30 hover:border-sky-400 hover:bg-sky-900/40 text-sky-300 hover:text-sky-100 shadow-sky-500/10",
    emerald: "bg-emerald-950/50 border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-900/40 text-emerald-300 hover:text-emerald-100 shadow-emerald-500/10",
    amber: "bg-amber-950/50 border-amber-500/30 hover:border-amber-400 hover:bg-amber-900/40 text-amber-300 hover:text-amber-100 shadow-amber-500/10",
    purple: "bg-purple-950/50 border-purple-500/30 hover:border-purple-400 hover:bg-purple-900/40 text-purple-300 hover:text-purple-100 shadow-purple-500/10",
  };

  const iconColorMap: Record<string, string> = {
    sky: "text-sky-400", emerald: "text-emerald-400", amber: "text-amber-400", purple: "text-purple-400",
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] max-h-[860px] rounded-3xl overflow-hidden relative shadow-[0_40px_120px_rgba(0,0,0,0.9)]">

      {/* Glowing border effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-sky-500/20 via-transparent to-sky-500/10 pointer-events-none z-0" />
      <div className="absolute inset-[1px] rounded-3xl bg-[#030916]/97 backdrop-blur-3xl z-0" />

      {/* Top accent line */}
      <div className="relative z-10 h-[3px] bg-gradient-to-r from-transparent via-sky-400 to-transparent" />

      {/* ─── HEADER ─── */}
      <header className="relative z-10 flex items-center justify-between px-5 py-3.5 border-b border-white/5 bg-gradient-to-r from-[#04112b]/80 to-[#020916]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          {/* Bot avatar with glow */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-sky-500/60 shadow-lg shadow-sky-500/30">
              <img src="/logo.png" alt="SecureX Bot" className="w-full h-full object-cover" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#030916] shadow-md shadow-emerald-500/50" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-white uppercase tracking-[0.12em]">SECUREX BOT</span>
              <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span className="hidden sm:inline text-[9px] font-bold font-mono px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/25 text-sky-400 uppercase tracking-widest">v2.0</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
              </span>
              <span className="text-[9px] text-emerald-400/80 font-mono font-bold uppercase tracking-widest">Soporte inteligente en tiempo real</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/25 px-3 py-1 rounded-full font-bold">
            <CheckCircle className="w-3 h-3" /> Sistema Operativo
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-950/30 border border-red-500/25 text-red-400 hover:bg-red-950/50 hover:text-red-300 text-[11px] font-bold transition-all active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* ─── MESSAGES ─── */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-5 space-y-4 scrollbar-thin scrollbar-thumb-sky-500/10 scrollbar-track-transparent">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.04)_0%,transparent_60%)] pointer-events-none" />

        {messages.map((m) => {
          const isAsst = m.sender === "assistant";
          return (
            <div key={m.id} className={`flex gap-3 ${isAsst ? "justify-start" : "justify-end"}`}>
              {/* Bot avatar */}
              {isAsst && (
                <div className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-sky-500/40 shadow-md shadow-sky-500/20 shrink-0 mt-1">
                  <img src="/logo.png" alt="Bot" className="w-full h-full object-cover" />
                </div>
              )}

              <div className={`max-w-[78%] ${isAsst ? "" : "items-end flex flex-col"}`}>
                <div className={`px-4 py-3 text-xs leading-relaxed rounded-2xl ${
                  isAsst
                    ? "bg-[#071528]/90 border border-sky-500/15 text-zinc-200 rounded-tl-sm shadow-xl"
                    : "bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-tr-sm shadow-lg shadow-sky-500/25"
                }`}>
                  {/* Render lines with bold/code formatting */}
                  <div className="whitespace-pre-wrap space-y-0.5">
                    {m.text.split("\n").map((line, i) => (
                      <p key={i}>{renderText(line)}</p>
                    ))}
                  </div>
                </div>
                <span className={`text-[9px] font-mono mt-1 px-1 ${isAsst ? "text-sky-500/40" : "text-sky-200/40"}`}>
                  {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              {/* User avatar */}
              {!isAsst && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-sky-500/30 mt-1">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-sky-500/40 shrink-0 mt-1">
              <img src="/logo.png" alt="Bot" className="w-full h-full object-cover animate-pulse" />
            </div>
            <div className="px-4 py-3 bg-[#071528]/90 border border-sky-500/15 rounded-2xl rounded-tl-sm shadow-xl flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin shrink-0" />
              <span className="text-[11px] text-sky-300/80 font-mono">
                Analizando base de datos{"." .repeat(typingDots + 1)}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ─── FOOTER ─── */}
      <div className="relative z-10 px-4 pt-3 pb-4 space-y-3 border-t border-white/5 bg-[#020914]/90 backdrop-blur-xl">

        {/* Quick action pills */}
        <div className="flex flex-wrap gap-2">
          {quickOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.type}
                onClick={() => handleQuickOption(opt.type)}
                disabled={loading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold transition-all active:scale-95 shadow-sm disabled:opacity-40 ${colorMap[opt.color]}`}
              >
                <Icon className={`w-3 h-3 shrink-0 ${iconColorMap[opt.color]}`} />
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Input row */}
        <div className="relative flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Escribe tu licencia o usuario para hacer reset..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
              className="w-full h-11 bg-[#04112b]/80 border border-sky-500/25 focus:border-sky-400/60 focus:ring-1 focus:ring-sky-500/20 text-white placeholder-zinc-600 rounded-2xl pl-4 pr-4 text-xs font-mono outline-none transition-all disabled:opacity-50"
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={loading || !inputValue.trim()}
            className="h-11 w-11 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white flex items-center justify-center transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-lg shadow-sky-500/30 shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>

        {/* Bottom branding */}
        <div className="flex items-center justify-center gap-1.5 pt-0.5">
          <Zap className="w-2.5 h-2.5 text-sky-500/40" />
          <span className="text-[9px] text-zinc-600 font-mono">Powered by SecureX Auth — Sistema Global de Soporte</span>
          <Shield className="w-2.5 h-2.5 text-sky-500/40" />
        </div>
      </div>
    </div>
  );
}
