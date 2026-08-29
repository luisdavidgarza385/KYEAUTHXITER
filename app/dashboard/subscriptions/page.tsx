"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Trash2, Save, Sparkles, CheckCircle2, Shield } from "lucide-react";

export interface SubscriptionItem {
  id: string;
  name: string;
  level: number;
  users: number;
  activeUsers: number;
  pausedUsers: number;
  licenses: number;
  isDefault?: boolean;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([
    {
      id: "sub-default",
      name: "default",
      level: 1,
      users: 0,
      activeUsers: 0,
      pausedUsers: 0,
      licenses: 0,
      isDefault: true,
    },
    {
      id: "sub-vip",
      name: "vip",
      level: 1,
      users: 0,
      activeUsers: 0,
      pausedUsers: 0,
      licenses: 0,
      isDefault: false,
    },
  ]);

  const [newName, setNewName] = useState("");
  const [newLevel, setNewLevel] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  // Editable row values map { [id]: { name: string, level: number } }
  const [editMap, setEditMap] = useState<Record<string, { name: string; level: number }>>({
    "sub-default": { name: "default", level: 1 },
    "sub-vip": { name: "vip", level: 1 },
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ra_subscriptions");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSubscriptions(parsed);
          const newEditMap: Record<string, { name: string; level: number }> = {};
          parsed.forEach((s) => {
            newEditMap[s.id] = { name: s.name, level: s.level };
          });
          setEditMap(newEditMap);
        }
      } else {
        localStorage.setItem("ra_subscriptions", JSON.stringify(subscriptions));
      }
    } catch {}
  }, []);

  const saveToStorage = (items: SubscriptionItem[]) => {
    setSubscriptions(items);
    localStorage.setItem("ra_subscriptions", JSON.stringify(items));
    window.dispatchEvent(new Event("ra_subscriptions_updated"));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const trimmed = newName.trim().toLowerCase();
    const exists = subscriptions.some((s) => s.name.toLowerCase() === trimmed);
    if (exists) {
      setFeedback("Ya existe una suscripción con ese nombre.");
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    const newItem: SubscriptionItem = {
      id: `sub-${Date.now()}`,
      name: trimmed,
      level: parseInt(newLevel) || 1,
      users: 0,
      activeUsers: 0,
      pausedUsers: 0,
      licenses: 0,
      isDefault: false,
    };

    const updated = [...subscriptions, newItem];
    saveToStorage(updated);

    setEditMap((prev) => ({
      ...prev,
      [newItem.id]: { name: newItem.name, level: newItem.level },
    }));

    setNewName("");
    setNewLevel("1");
    setFeedback("Suscripción creada correctamente.");
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleSaveRow = (id: string) => {
    const rowEdit = editMap[id];
    if (!rowEdit) return;

    const updated = subscriptions.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          name: rowEdit.name.trim() || s.name,
          level: rowEdit.level || s.level,
        };
      }
      return s;
    });

    saveToStorage(updated);
    setFeedback("Cambios guardados con éxito.");
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleDeleteRow = (id: string) => {
    const target = subscriptions.find((s) => s.id === id);
    if (target?.isDefault) {
      alert("No se puede eliminar la suscripción predeterminada.");
      return;
    }
    if (!confirm(`¿Eliminar suscripción "${target?.name}"?`)) return;

    const updated = subscriptions.filter((s) => s.id !== id);
    saveToStorage(updated);

    setEditMap((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const filtered = subscriptions.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in text-slate-200">
      {/* Feedback banner */}
      {feedback && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* ── CARD 1: CREAR SUSCRIPCION (MATCHING SCREENSHOT 5) ── */}
      <div className="rounded-2xl bg-[#040e24]/85 border border-[#0099ff]/25 p-6 backdrop-blur-2xl shadow-2xl space-y-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Crear suscripcion</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Las suscripciones definen niveles/tiers para licencias y usuarios.
          </p>
        </div>

        <form onSubmit={handleCreate} className="flex flex-wrap items-center gap-3 pt-2">
          {/* Input Nombre */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="basic"
              required
              className="w-full bg-[#020713]/90 border border-[#0099ff]/30 focus:border-[#00c2ff] rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00c2ff]/20 transition-all font-mono"
            />
          </div>

          {/* Input Nivel */}
          <div className="w-28 sm:w-36">
            <input
              type="number"
              min="1"
              max="99"
              value={newLevel}
              onChange={(e) => setNewLevel(e.target.value)}
              placeholder="1"
              required
              className="w-full bg-[#020713]/90 border border-[#0099ff]/30 focus:border-[#00c2ff] rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00c2ff]/20 transition-all font-mono text-center"
            />
          </div>

          {/* Boton Crear suscripcion */}
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-[#0080ff] to-[#00b4ff] hover:from-[#0070e0] hover:to-[#00a2ff] text-white font-extrabold text-xs tracking-wide rounded-xl shadow-[0_0_20px_rgba(0,153,255,0.4)] transition-all cursor-pointer whitespace-nowrap"
          >
            Crear suscripcion
          </button>
        </form>
      </div>

      {/* ── CARD 2: TABLA SUSCRIPCIONES (MATCHING SCREENSHOT 5) ── */}
      <div className="rounded-2xl bg-[#040e24]/85 border border-[#0099ff]/25 p-6 backdrop-blur-2xl shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">Suscripciones</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              {subscriptions.length} suscripciones en 9999
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar suscripciones..."
              className="w-full bg-[#020713]/90 border border-[#0099ff]/30 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00c2ff]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider font-mono">
                <th className="py-3 px-3">NOMBRE DE SUSCRIPCION</th>
                <th className="py-3 px-3">NIVEL DE SUSCRIPCION</th>
                <th className="py-3 px-3 text-center">USUARIOS</th>
                <th className="py-3 px-3 text-center">ACTIVOS</th>
                <th className="py-3 px-3 text-center">PAUSADOS</th>
                <th className="py-3 px-3 text-center">LICENCIAS</th>
                <th className="py-3 px-3 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.map((sub) => {
                const currentEdit = editMap[sub.id] || { name: sub.name, level: sub.level };

                return (
                  <tr key={sub.id} className="hover:bg-[#071738]/40 transition-colors">
                    {/* Nombre y Badge */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-xs">{sub.name}</span>
                        {sub.isDefault && (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-black tracking-widest border border-emerald-500/30 uppercase">
                            PREDETERMINADA
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Nivel */}
                    <td className="py-3.5 px-3 text-slate-300 font-bold">{sub.level}</td>

                    {/* Usuarios */}
                    <td className="py-3.5 px-3 text-center text-slate-400">{sub.users}</td>

                    {/* Activos */}
                    <td className="py-3.5 px-3 text-center text-slate-400">{sub.activeUsers}</td>

                    {/* Pausados */}
                    <td className="py-3.5 px-3 text-center text-slate-400">{sub.pausedUsers}</td>

                    {/* Licencias */}
                    <td className="py-3.5 px-3 text-center text-slate-400">{sub.licenses}</td>

                    {/* Acciones (Inputs inline + Botones Guardar / Eliminar) */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit Name Input */}
                        <input
                          type="text"
                          value={currentEdit.name}
                          onChange={(e) =>
                            setEditMap((prev) => ({
                              ...prev,
                              [sub.id]: { ...currentEdit, name: e.target.value },
                            }))
                          }
                          className="w-24 sm:w-28 bg-[#020713] border border-slate-700 focus:border-[#00c2ff] rounded-lg px-2.5 py-1.5 text-xs text-white text-left focus:outline-none"
                        />

                        {/* Edit Level Input */}
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={currentEdit.level}
                          onChange={(e) =>
                            setEditMap((prev) => ({
                              ...prev,
                              [sub.id]: { ...currentEdit, level: parseInt(e.target.value) || 1 },
                            }))
                          }
                          className="w-12 bg-[#020713] border border-slate-700 focus:border-[#00c2ff] rounded-lg px-2 py-1.5 text-xs text-white text-center focus:outline-none"
                        />

                        {/* Boton Guardar */}
                        <button
                          type="button"
                          onClick={() => handleSaveRow(sub.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer"
                        >
                          Guardar
                        </button>

                        {/* Boton Eliminar */}
                        {!sub.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(sub.id)}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 text-xs font-bold transition-all cursor-pointer"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
