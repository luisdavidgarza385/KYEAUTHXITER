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
      text: "⚡ **SISTEMA DE SOPORTE SPECTRAL X INICIADO** ⚡\n\nHola, soy tu asistente de soporte virtual. Mi función es ayudarte a restablecer tu Hardware ID (HWID) de forma automática si has formateado tu PC, cambiado de componentes o reinstalado Windows.",
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
      
      // Delay response slightly for realistic typing feel
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
      }, 1000);

    } catch (err: any) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "assistant",
            text: "❌ Ocurrió un error de red al intentar conectar con el servidor de Spectral X. Por favor, vuelve a intentarlo.",
            timestamp: new Date(),
          },
        ]);
        setLoading(false);
      }, 1000);
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
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[680px] w-full max-w-4xl rounded-2xl border border-emerald-500/20 bg-[#030a05]/90 backdrop-blur-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-500/10 bg-emerald-950/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Bot className="w-5.5 h-5.5 text-emerald-400" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#030a05] animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-1.5">
              Spectral Bot
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-widest font-mono">
              Asistente de Soporte Virtual
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 hover:border-red-500/30 hover:text-red-400 text-zinc-400 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Salir</span>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3.5 animate-fade-in ${
              msg.sender === "user" ? "flex-row-reverse" : ""
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8.5 h-8.5 rounded-xl border shrink-0 flex items-center justify-center ${
                msg.sender === "user"
                  ? "bg-zinc-900 border-zinc-800 text-zinc-300"
                  : "bg-emerald-950/40 border-emerald-500/20 text-emerald-400"
              }`}
            >
              {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-[75%] rounded-2xl p-4 text-sm font-medium leading-relaxed ${
                msg.sender === "user"
                  ? "bg-zinc-900 text-white rounded-tr-none border border-zinc-850"
                  : "bg-emerald-950/20 text-zinc-200 rounded-tl-none border border-emerald-500/10 whitespace-pre-wrap"
              }`}
            >
              {/* Simple markdown bold renderer */}
              {msg.text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return <strong key={i} className="text-emerald-300 font-extrabold">{part.slice(2, -2)}</strong>;
                }
                return part;
              })}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start gap-3.5 animate-pulse">
            <div className="w-8.5 h-8.5 rounded-xl border shrink-0 flex items-center justify-center bg-emerald-950/40 border-emerald-500/20 text-emerald-400">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-emerald-950/20 text-zinc-400 rounded-2xl rounded-tl-none border border-emerald-500/10 p-4 text-xs font-semibold flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>Spectral está buscando en la base de datos...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Pills */}
      <div className="px-5 py-2.5 border-t border-emerald-500/5 bg-zinc-950/40 flex flex-wrap gap-2 items-center">
        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mr-1">Consultas rápidas:</span>
        <button
          onClick={() => handleQuickOption("hwid")}
          className="text-[10px] font-bold bg-[#040e06] border border-emerald-500/10 text-emerald-400 hover:border-emerald-500/30 px-3 py-1.5 rounded-lg transition-all"
        >
          <RefreshCw className="w-3 h-3 inline mr-1" /> Reset HWID
        </button>
        <button
          onClick={() => handleQuickOption("error")}
          className="text-[10px] font-bold bg-[#040e06] border border-emerald-500/10 text-emerald-400 hover:border-emerald-500/30 px-3 py-1.5 rounded-lg transition-all"
        >
          <ShieldAlert className="w-3 h-3 inline mr-1" /> HWID Mismatch
        </button>
        <button
          onClick={() => handleQuickOption("how")}
          className="text-[10px] font-bold bg-[#040e06] border border-emerald-500/10 text-emerald-400 hover:border-emerald-500/30 px-3 py-1.5 rounded-lg transition-all"
        >
          <HelpCircle className="w-3 h-3 inline mr-1" /> ¿Cómo busco la Key?
        </button>
      </div>

      {/* Input Box */}
      <div className="p-4 border-t border-emerald-500/10 bg-zinc-950/60">
        <div className="relative flex items-center">
          <textarea
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Escribe tu licencia o usuario aquí..."
            disabled={loading}
            className="w-full h-11 py-3 pl-4 pr-12 bg-zinc-950 border border-emerald-500/15 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/30 text-white placeholder-zinc-650 rounded-xl text-sm font-medium transition-all outline-none resize-none scrollbar-none disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !inputValue.trim()}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8.5 h-8.5 bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-550 hover:to-teal-550 disabled:opacity-50 text-white rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-md shadow-emerald-950/30"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
