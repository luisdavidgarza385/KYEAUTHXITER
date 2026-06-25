"use client";

import { useState, useEffect } from "react";
import { Plus, Shield, Trash2, Eye, EyeOff, Copy, Check } from "lucide-react";

interface App {
  id: string;
  name: string;
  app_id: string;
  status: string;
  version: string;
  created_at: string;
}

export default function SellerAppsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    loadApps();
  }, []);

  async function loadApps() {
    try {
      const res = await fetch("/api/seller/apps");
      const data = await res.json();
      if (data.success) {
        setApps(data.data || []);
      }
    } catch (error) {
      console.error("Error loading apps:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/seller/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setFormData({ name: "" });
        loadApps();
      } else {
        alert(data.message || "Error al crear aplicación");
      }
    } catch (error) {
      alert("Error de conexión");
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Mis Aplicaciones</h1>
          <p className="text-gray-400 text-sm mt-1">
            Gestiona tus aplicaciones y genera licencias
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Crear Aplicación
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Total Apps</div>
          <div className="text-2xl font-bold text-white">{apps.length}</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Activas</div>
          <div className="text-2xl font-bold text-emerald-400">
            {apps.filter((a) => a.status === "active").length}
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Pausadas</div>
          <div className="text-2xl font-bold text-yellow-400">
            {apps.filter((a) => a.status === "paused").length}
          </div>
        </div>
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apps.map((app) => (
          <div
            key={app.id}
            className="bg-gray-800 border border-gray-700 rounded-lg p-5 hover:border-emerald-500/50 transition"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{app.name}</h3>
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-medium rounded mt-1 ${
                      app.status === "active"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {app.status === "active" ? "Activa" : "Pausada"}
                  </span>
                </div>
              </div>
            </div>

            {/* App ID */}
            <div className="mb-4">
              <div className="text-xs text-gray-400 mb-1">App ID</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-900 text-emerald-400 text-xs px-2 py-1 rounded font-mono truncate">
                  {app.app_id}
                </code>
                <button
                  onClick={() => copyToClipboard(app.app_id, app.id)}
                  className="p-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
                  title="Copiar"
                >
                  {copiedId === app.id ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>

            {/* Version */}
            <div className="text-xs text-gray-400 mb-3">
              Versión: <span className="text-white">{app.version}</span>
            </div>

            {/* Created Date */}
            <div className="text-[10px] text-gray-500 mt-3 pt-3 border-t border-gray-700 text-center">
              Creada: {new Date(app.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {apps.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No tienes aplicaciones</p>
          <p className="text-gray-500 text-sm mt-1">Crea tu primera aplicación para comenzar</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Crear Aplicación</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre de la Aplicación
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  placeholder="Mi App"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
