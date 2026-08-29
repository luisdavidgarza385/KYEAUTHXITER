"use client";

import React, { useState } from "react";
import { Code2, Plus, Copy, Trash2, Check, Sparkles, Lock, Shield } from "lucide-react";

interface ServerVar {
  id: string;
  name: string;
  value: string;
  secret: boolean;
  createdAt: string;
}

export default function VariablesPage() {
  const [vars, setVars] = useState<ServerVar[]>([
    {
      id: "var-1",
      name: "secret_token",
      value: "sk_live_9999_realauthx_secure_access_token_884920",
      secret: true,
      createdAt: "28/08/2026",
    },
    {
      id: "var-2",
      name: "download_url",
      value: "https://realauthx.com/downloads/v1.4/loader.exe",
      secret: false,
      createdAt: "28/08/2026",
    },
  ]);

  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !value.trim()) return;

    const newVar: ServerVar = {
      id: `var-${Date.now()}`,
      name: name.trim(),
      value: value.trim(),
      secret: true,
      createdAt: new Date().toLocaleDateString(),
    };

    setVars((prev) => [...prev, newVar]);
    setName("");
    setValue("");
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-200">
      {/* Header */}
      <div className="rounded-2xl bg-[#040e24]/85 border border-[#0099ff]/25 p-6 backdrop-blur-2xl shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9.5px] font-black border border-amber-500/40 uppercase">
              PREMIUM
            </span>
            <span className="text-xs text-slate-400 font-mono">App 9999</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Variables de Servidor</h1>
          <p className="text-xs text-slate-400 mt-1">
            Almacena secretos, endpoints y datos protegidos en el servidor sin exponerlos en el cliente.
          </p>
        </div>
      </div>

      {/* Form Crear Variable */}
      <div className="rounded-2xl bg-[#040e24]/85 border border-[#0099ff]/25 p-6 backdrop-blur-2xl shadow-xl space-y-4">
        <h3 className="text-base font-extrabold text-white">Crear nueva variable</h3>

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          <div className="sm:col-span-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre (ej. secret_token)"
              required
              className="w-full bg-[#020713] border border-[#0099ff]/30 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none font-mono"
            />
          </div>

          <div className="sm:col-span-6">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Valor secreto protegido"
              required
              className="w-full bg-[#020713] border border-[#0099ff]/30 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full h-full min-h-[38px] bg-gradient-to-r from-[#0080ff] to-[#00b4ff] hover:from-[#0070e0] hover:to-[#00a2ff] text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Guardar</span>
            </button>
          </div>
        </form>
      </div>

      {/* Variables List Table */}
      <div className="rounded-2xl bg-[#040e24]/85 border border-[#0099ff]/25 p-6 backdrop-blur-2xl shadow-2xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider font-mono">
                <th className="py-3 px-3">NOMBRE</th>
                <th className="py-3 px-3">VALOR</th>
                <th className="py-3 px-3">FECHA</th>
                <th className="py-3 px-3 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {vars.map((v) => (
                <tr key={v.id} className="hover:bg-[#071738]/40 transition-colors">
                  <td className="py-3.5 px-3 font-bold text-white flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-[#00c2ff]" />
                    <span>{v.name}</span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-300">
                    <span className="font-mono text-xs">{v.value.slice(0, 32)}...</span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-400">{v.createdAt}</td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(v.value, v.id)}
                        className="p-1.5 rounded-lg bg-[#07193b] hover:bg-[#0c2452] text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Copiar valor"
                      >
                        {copiedId === v.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-[#00c2ff]" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setVars((prev) => prev.filter((item) => item.id !== v.id))}
                        className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 transition-colors cursor-pointer"
                        title="Eliminar variable"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
