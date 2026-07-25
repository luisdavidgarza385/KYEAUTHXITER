"use client";

import { useState, useRef, useEffect } from "react";
import { Cpu, Send, Bot, User, Loader2, Sparkles, LogOut, RefreshCw, HelpCircle, ShieldAlert, CheckCircle } from "lucide-react";

interface Message {
  id: string;
  sender: "assistant" | "user";
  text: string;
  timestamp: Date;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    if (!textToSend) setInputValue("");

    // Add user message
    const userMsgId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: "user",
        text: text,
        timestamp: new Date(),
      },
    ]);

    setLoading(true);

    try {
      const res = await fetch("/api/assistant/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: text }),
      });

      const data = await res.json();
      
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "assistant",
            text: data.message || "Error al procesar la solicitud.",
            timestamp: new Date(),
          },
        ]);
        setLoading(false);
      }, 800);

    } catch (err: any) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "assistant",
            text: "❌ Ocurrió un error de red al intentar conectar con el servidor de SecureX Auth. Por favor, vuelve a intentarlo.",
            timestamp: new Date(),
          },
        ]);
        setLoading(false);
      }, 800);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLogout = () => {
    document.cookie = "ka_assistant_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    window.location.href = "/asistente/login";
  };

  const handleQuickOption = (type: "key" | "user" | "error" | "how") => {
    let text = "";
    if (type === "key") {
      text = "Quiero resetear el HWID mediante mi Licencia (Key).";
    } else if (type === "user") {
      text = "Quiero resetear el HWID (Reset Win) de mi Nombre de Usuario.";
    } else if (type === "error") {
      text = "Me sale error 'HWID Mismatch' al iniciar sesión en el ejecutable.";
    } else {
      text = "¿Dónde puedo consultar mi Licencia o Usuario?";
    }
    handleSend(text);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] md:h-[720px] w-full max-w-5xl rounded-3xl border border-sky-500/35 bg-[#030a18]/95 backdrop-blur-2xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.95)] relative">
      {/* Top Cyber Line */}
      <div className="h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-sky-400 animate-pulse" />

      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-sky-500/20 bg-[#06142a]/90">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl overflow-hidden ring-2 ring-sky-500/50 shadow-md shadow-sky-500/30">
              <img src="/logo.png" alt="SecureX Bot" className="w-full h-full object-cover" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-sky-400 border-2 border-[#030a18] animate-ping" />
          </div>
          <div>
            <div className="font-black text-base text-white uppercase tracking-wider flex items-center gap-2">
              SECUREX BOT
              <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-sky-400/90 font-bold uppercase tracking-widest font-mono flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              SOPORTE INTELIGENTE EN TIEMPO REAL
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
            <CheckCircle className="w-3 h-3" />
            SISTEMA OPERATIVO
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-950/50 border border-sky-500/30 text-zinc-300 hover:text-white hover:border-sky-400 text-xs font-bold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>
      </div>

      {/* Message Chat List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-sky-500/20 bg-[linear-gradient(to_bottom,rgba(0,191,255,0.02),transparent)]">
        {messages.map((m) => {
          const isAsst = m.sender === "assistant";
          return (
            <div
              key={m.id}
              className={`flex gap-3.5 max-w-[88%] ${isAsst ? "self-start" : "self-end flex-row-reverse"}`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isAsst
                    ? "bg-sky-950 border border-sky-500/40 text-sky-400 overflow-hidden shadow-lg shadow-sky-500/15"
                    : "bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30"
                }`}
              >
                {isAsst ? (
                  <img src="/logo.png" alt="Bot" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4.5 h-4.5" />
                )}
              </div>

              <div
                className={`rounded-2xl p-4 text-xs leading-relaxed font-sans shadow-xl ${
                  isAsst
                    ? "bg-[#06142a]/90 border border-sky-500/25 text-zinc-200"
                    : "bg-gradient-to-r from-sky-500 to-blue-600 text-white font-medium shadow-sky-500/20"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                <div
                  className={`text-[9px] mt-2 font-mono ${
                    isAsst ? "text-sky-400/60" : "text-sky-100/70"
                  }`}
                >
                  {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3.5 max-w-[88%] self-start">
            <div className="w-9 h-9 rounded-2xl bg-sky-950 border border-sky-500/40 overflow-hidden shrink-0">
              <img src="/logo.png" alt="Bot" className="w-full h-full object-cover animate-pulse" />
            </div>
            <div className="rounded-2xl p-4 bg-[#06142a]/90 border border-sky-500/25 text-zinc-300 text-xs flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
              <span>Analizando base de datos de licencias...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Queries & Input Footer */}
      <div className="p-5 border-t border-sky-500/20 bg-[#020714]/95 space-y-3.5">
        {/* Quick query buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
          <span className="text-zinc-400 uppercase tracking-widest font-mono text-[9px] font-bold shrink-0">
            Opciones:
          </span>
          <button
            onClick={() => handleQuickOption("key")}
            className="px-3 py-1.5 rounded-full bg-sky-950/60 border border-sky-500/30 hover:border-sky-400 text-sky-300 hover:text-white transition whitespace-nowrap flex items-center gap-1.5 font-semibold shadow-sm"
          >
            <RefreshCw className="w-3 h-3 text-sky-400" />
            Reset Licencia
          </button>
          <button
            onClick={() => handleQuickOption("user")}
            className="px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 hover:border-emerald-400 text-emerald-300 hover:text-white transition whitespace-nowrap flex items-center gap-1.5 font-semibold shadow-sm"
          >
            <RefreshCw className="w-3 h-3 text-emerald-400" />
            Reset Win Usuario
          </button>
          <button
            onClick={() => handleQuickOption("error")}
            className="px-3 py-1.5 rounded-full bg-sky-950/60 border border-sky-500/30 hover:border-sky-400 text-sky-300 hover:text-white transition whitespace-nowrap flex items-center gap-1.5 font-semibold shadow-sm"
          >
            <ShieldAlert className="w-3 h-3 text-sky-400" />
            HWID Mismatch
          </button>
          <button
            onClick={() => handleQuickOption("how")}
            className="px-3 py-1.5 rounded-full bg-sky-950/60 border border-sky-500/30 hover:border-sky-400 text-sky-300 hover:text-white transition whitespace-nowrap flex items-center gap-1.5 font-semibold shadow-sm"
          >
            <HelpCircle className="w-3 h-3 text-sky-400" />
            ¿Dónde busco la Key?
          </button>
        </div>

        {/* Input box */}
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Escribe tu licencia o usuario aquí..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
            className="w-full h-13 bg-black/90 border border-sky-500/35 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 text-white placeholder-zinc-500 rounded-2xl pl-5 pr-14 text-xs font-semibold outline-none transition-all"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !inputValue.trim()}
            className="absolute right-2.5 w-9 h-9 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none shadow-md shadow-sky-500/40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
