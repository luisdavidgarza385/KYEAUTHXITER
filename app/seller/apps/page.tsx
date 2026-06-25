"use client";

import { useState, useEffect } from "react";
import { Plus, Shield, Trash2, Eye, EyeOff, Copy, Check, Edit2, Save, X, ExternalLink } from "lucide-react";

interface App {
  id: string;
  name: string;
  app_id: string;
  status: string;
  version: string;
  created_at: string;
  download_link?: string;
  webhook_url?: string;
}

export default function SellerAppsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingApp, setEditingApp] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<App>>({});
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

  function startEditing(app: App) {
    setEditingApp(app.id);
    setEditForm({
      name: app.name,
      version: app.version,
      status: app.status,
      download_link: app.download_link || "",
      webhook_url: app.webhook_url || "",
    });
  }

  function cancelEditing() {
    setEditingApp(null);
    setEditForm({});
  }

  async function saveEditing(appId: string) {
    try {
      const res = await fetch(`/api/seller/apps/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (data.success) {
        setEditingApp(null);
        setEditForm({});
        loadApps();
      } else {
        alert(data.message || "Error al actualizar aplicación");
      }
    } catch (error) {
      alert("Error de conexión");
    }
  }

  async function handleDelete(app: App) {
    if (!confirm(`¿Eliminar la aplicación "${app.name}"? Esto eliminará todas sus licencias y usuarios.`)) return;

    try {
      const res = await fetch(`/api/seller/apps/${app.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        loadApps();
      } else {
        alert("Error al eliminar aplicación");
      }
    } catch (error) {
      alert("Error de conexión");
    }
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
      <div className="space-y-4">
        {apps.map((app) => {
          const isEditing = editingApp === app.id;
          
          return (
            <div
              key={app.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-5 hover:border-emerald-500/30 transition"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Shield className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name || ""}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="text-lg font-semibold bg-gray-700 text-white px-2 py-1 rounded border border-gray-600 w-full"
                      />
                    ) : (
                      <h3 className="text-lg font-semibold text-white truncate">{app.name}</h3>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {isEditing ? (
                        <select
                          value={editForm.status || "active"}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          className="px-2 py-0.5 text-xs font-medium rounded bg-gray-700 border border-gray-600 text-white"
                        >
                          <option value="active">Activa</option>
                          <option value="paused">Pausada</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                            app.status === "active"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {app.status === "active" ? "Activa" : "Pausada"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2 ml-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => saveEditing(app.id)}
                        className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition"
                        title="Guardar"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
                        title="Cancelar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(app)}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(app)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* App ID */}
              <div className="mb-3">
                <div className="text-xs text-gray-400 mb-1">App ID</div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-900 text-emerald-400 text-xs px-2 py-1.5 rounded font-mono truncate">
                    {app.app_id}
                  </code>
                  <button
                    onClick={() => copyToClipboard(app.app_id, app.id)}
                    className="p-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded transition shrink-0"
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

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                {/* Version */}
                <div>
                  <div className="text-xs text-gray-400 mb-1">Versión</div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.version || ""}
                      onChange={(e) => setEditForm({ ...editForm, version: e.target.value })}
                      className="w-full bg-gray-700 text-white text-sm px-2 py-1 rounded border border-gray-600"
                    />
                  ) : (
                    <div className="text-sm text-white">{app.version}</div>
                  )}
                </div>

                {/* Created Date */}
                <div>
                  <div className="text-xs text-gray-400 mb-1">Creada</div>
                  <div className="text-sm text-white">
                    {new Date(app.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Download Link */}
              <div className="mb-3">
                <div className="text-xs text-gray-400 mb-1">Enlace de Descarga</div>
                {isEditing ? (
                  <input
                    type="url"
                    value={editForm.download_link || ""}
                    onChange={(e) => setEditForm({ ...editForm, download_link: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-gray-700 text-white text-sm px-2 py-1 rounded border border-gray-600"
                  />
                ) : app.download_link ? (
                  <a
                    href={app.download_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 truncate"
                  >
                    {app.download_link}
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : (
                  <div className="text-sm text-gray-500">-</div>
                )}
              </div>

              {/* Webhook URL */}
              <div>
                <div className="text-xs text-gray-400 mb-1">Webhook URL</div>
                {isEditing ? (
                  <input
                    type="url"
                    value={editForm.webhook_url || ""}
                    onChange={(e) => setEditForm({ ...editForm, webhook_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-gray-700 text-white text-sm px-2 py-1 rounded border border-gray-600"
                  />
                ) : app.webhook_url ? (
                  <code className="text-xs text-gray-300 font-mono truncate block">
                    {app.webhook_url}
                  </code>
                ) : (
                  <div className="text-sm text-gray-500">-</div>
                )}
              </div>
            </div>
          );
        })}
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
