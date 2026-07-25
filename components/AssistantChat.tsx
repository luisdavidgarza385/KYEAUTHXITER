"use client";

import { useState, useRef, useEffect } from "react";
import { Cpu, Send, Bot, User, Loader2, Sparkles, LogOut, RefreshCw, HelpCircle, ShieldAlert } from "lucide-react";

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
      text: "⚡ **SISTEMA DE SOPORTE SECUREX AUTH INICIADO** ⚡\n\nHola, soy tu asistente de soporte virtual. Mi función es ayudarte a restablecer tu Hardware ID (HWID) de forma automática si has formateado tu PC, cambiado de componentes o reinstalado Windows.",
      timestamp: new Date(),
    },
    {
      id: "init-2",
      sender: "assistant",
      text: "Por favor, escribe a continuación tu **licencia (key)** o tu **nombre de usuario** para que pueda buscarlo en la base de datos y realizar el reset.",
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

  const handleQuickOption = (type: "hwid" | "error" | "how") => {
    let text = "";
    if (type === "hwid") {
      text = "Quiero resetear el HWID de mi cuenta.";
    } else if (type === "error") {
      text = "Me sale error 'HWID Mismatch' al iniciar el loader.";
    } else {
      text = "¿Cómo busco mi licencia?";
    }
    handleSend(text);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[680px] w-full max-w-4xl rounded-2xl border border-sky-500/30 bg-[#030914]/95 backdrop-blur-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)] relative">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-sky-500/20 bg-[#061224]/80">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-sky-500/40 shadow-md shadow-sky-500/20">
              <img src="/logo.png" alt="SecureX Bot" className="w-full h-full object-cover" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-sky-400 border-2 border-[#030914] animate-pulse" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-1.5">
              SecureX Bot
              <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-sky-400/90 font-bold uppercase tracking-widest font-mono">
              Asistente de Soporte Virtual
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-950/40 border border-sky-500/20 text-zinc-400 hover:text-white hover:border-sky-500/40 text-xs font-semibold transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Salir</span>
        </button>
      </div>

      {/* Message Chat List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-sky-500/20">
        {messages.map((m) => {
          const isAsst = m.sender === "assistant";
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${isAsst ? "self-start" : "self-end flex-row-reverse"}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isAsst
                    ? "bg-sky-950 border border-sky-500/30 text-sky-400 overflow-hidden"
                    : "bg-gradient-to-br from-sky-500 to-blue-600 text-white"
                }`}
              >
                {isAsst ? (
                  <img src="/logo.png" alt="Bot" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>

              <div
                className={`rounded-2xl p-4 text-xs leading-relaxed font-sans shadow-lg ${
                  isAsst
                    ? "bg-[#061224]/80 border border-sky-500/20 text-zinc-200"
                    : "bg-gradient-to-r from-sky-500 to-blue-600 text-white font-medium shadow-sky-500/15"
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
          <div className="flex gap-3 max-w-[85%] self-start">
            <div className="w-8 h-8 rounded-xl bg-sky-950 border border-sky-500/30 overflow-hidden shrink-0">
              <img src="/logo.png" alt="Bot" className="w-full h-full object-cover animate-pulse" />
            </div>
            <div className="rounded-2xl p-4 bg-[#061224]/80 border border-sky-500/20 text-zinc-400 text-xs flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
              <span>Procesando consulta...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Queries & Input Footer */}
      <div className="p-4 border-t border-sky-500/20 bg-[#020712]/90 space-y-3">
        {/* Quick query buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
          <span className="text-zinc-500 uppercase tracking-widest font-mono text-[9px] font-bold shrink-0">
            Consultas rápidas:
          </span>
          <button
            onClick={() => handleQuickOption("hwid")}
            className="px-2.5 py-1 rounded-full bg-sky-950/40 border border-sky-500/20 hover:border-sky-400 text-sky-300 hover:text-white transition whitespace-nowrap flex items-center gap-1 font-medium"
          >
            <RefreshCw className="w-3 h-3 text-sky-400" />
            Reset HWID
          </button>
          <button
            onClick={() => handleQuickOption("error")}
            className="px-2.5 py-1 rounded-full bg-sky-950/40 border border-sky-500/20 hover:border-sky-400 text-sky-300 hover:text-white transition whitespace-nowrap flex items-center gap-1 font-medium"
          >
            <ShieldAlert className="w-3 h-3 text-sky-400" />
            HWID Mismatch
          </button>
          <button
            onClick={() => handleQuickOption("how")}
            className="px-2.5 py-1 rounded-full bg-sky-950/40 border border-sky-500/20 hover:border-sky-400 text-sky-300 hover:text-white transition whitespace-nowrap flex items-center gap-1 font-medium"
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
            className="w-full h-12 bg-black/80 border border-sky-500/30 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 text-white placeholder-zinc-500 rounded-xl pl-4 pr-12 text-xs font-medium outline-none transition-all"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !inputValue.trim()}
            className="absolute right-2 w-8 h-8 rounded-lg bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none shadow-md shadow-sky-500/30"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
