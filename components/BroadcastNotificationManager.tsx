"use client";
import { useState } from "react";
import { Send, Loader2, AlertCircle } from "lucide-react";

export function BroadcastNotificationManager() {
  const [message, setMessage] = useState("");
  const [level, setLevel] = useState("info");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, level }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Error al enviar la notificación");
        return;
      }
      setSuccess("Notificación enviada con éxito.");
      setMessage("");
    } catch (err: any) {
      setError(err.message || "Error de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold mb-1 flex items-center gap-2 text-zinc-100">
        <Send className="w-4 h-4 text-emerald-400" />
        Enviar Notificación Global (Broadcast)
      </h2>
      <p className="text-xs text-zinc-500 mb-4">
        Escribe un mensaje de anuncio que aparecerá inmediatamente en la campana de notificaciones de todos los revendedores y usuarios.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">Mensaje de anuncio</label>
            <input
              type="text"
              required
              placeholder="e.g. Mantenimiento del servidor hoy a las 10 PM CEST."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-650 px-3.5 py-2 rounded-lg text-sm outline-none focus:border-emerald-500/50 transition"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">Severidad / Color</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-3.5 py-2.5 rounded-lg text-sm outline-none focus:border-emerald-500/50 transition"
            >
              <option value="info" className="bg-zinc-950">Info (Verde)</option>
              <option value="warn" className="bg-zinc-950">Advertencia (Naranja)</option>
              <option value="error" className="bg-zinc-950">Peligro / Crítico (Rojo)</option>
              <option value="debug" className="bg-zinc-950">Debug (Morado)</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg px-3.5 py-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 rounded-lg px-3.5 py-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-650 hover:bg-emerald-550 text-white transition-all shadow-md shadow-emerald-500/10 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Send className="w-3.5 h-3.5" /> Enviar anuncio</>}
          </button>
        </div>
      </form>
    </div>
  );
}
