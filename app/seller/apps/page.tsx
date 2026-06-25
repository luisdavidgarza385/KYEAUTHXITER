"use client";

import { useState, useEffect } from "react";
import { Plus, Shield, Trash2, Edit2, Pause, Play, FileText } from "lucide-react";

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDescModal, setShowDescModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("C++");
  const [showCodeSnippet, setShowCodeSnippet] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    version: "",
    download_link: "",
    webhook_url: "",
  });
  const [description, setDescription] = useState("");

  const languages = ["C++", "C#", "Python", "JavaScript", "TypeScript", "PHP", "Java", "VB.Net", "Rust", "Go", "Lua", "Ruby", "Perl"];

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
        setShowCreateModal(false);
        setFormData({ name: "" });
        loadApps();
      } else {
        alert(data.message || "Error al crear aplicación");
      }
    } catch (error) {
      alert("Error de conexión");
    }
  }

  function openEditModal(app: App) {
    setSelectedApp(app);
    setEditForm({
      name: app.name,
      version: app.version,
      download_link: app.download_link || "",
      webhook_url: app.webhook_url || "",
    });
    setShowEditModal(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      const res = await fetch(`/api/seller/apps/${selectedApp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (data.success) {
        setShowEditModal(false);
        setSelectedApp(null);
        loadApps();
      } else {
        alert(data.message || "Error al actualizar");
      }
    } catch (error) {
      alert("Error de conexión");
    }
  }

  async function handleToggleStatus(app: App) {
    const newStatus = app.status === "active" ? "paused" : "active";
    
    try {
      const res = await fetch(`/api/seller/apps/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        loadApps();
      } else {
        alert("Error al cambiar estado");
      }
    } catch (error) {
      alert("Error de conexión");
    }
  }

  async function handleDelete(app: App) {
    if (!confirm(`¿Eliminar "${app.name}"? Esto eliminará todas las licencias y usuarios.`)) return;

    try {
      const res = await fetch(`/api/seller/apps/${app.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        loadApps();
      } else {
        alert("Error al eliminar");
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
            Gestiona y configura tus aplicaciones
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
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

      {/* Apps List */}
      {apps.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 border border-gray-700 rounded-lg">
          <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No tienes aplicaciones</p>
          <p className="text-gray-500 text-sm mt-1">Crea tu primera aplicación para comenzar</p>
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900/50 border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Aplicación
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Versión
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {apps.map((app) => (
                <tr key={app.id} className="hover:bg-gray-900/30 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{app.name}</div>
                        <code className="text-xs text-gray-500 font-mono">{app.app_id}</code>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {app.version}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                        app.status === "active"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {app.status === "active" ? "ACTIVE" : "PAUSED"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setShowCredentialsModal(true);
                        }}
                        className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 rounded text-sm font-medium transition flex items-center gap-1.5"
                        title="Selected / View Credentials"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        Selected
                      </button>
                      <button
                        onClick={() => openEditModal(app)}
                        className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded text-sm font-medium transition flex items-center gap-1.5"
                        title="Rename"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Rename
                      </button>
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setDescription(app.download_link || "");
                          setShowDescModal(true);
                        }}
                        className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 rounded text-sm font-medium transition flex items-center gap-1.5"
                        title="Edit Description"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Edit Description
                      </button>
                      <button
                        onClick={() => handleToggleStatus(app)}
                        className={`px-3 py-1.5 border rounded text-sm font-medium transition flex items-center gap-1.5 ${
                          app.status === "active"
                            ? "bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/30 text-yellow-400"
                            : "bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/30 text-emerald-400"
                        }`}
                        title={app.status === "active" ? "Pause" : "Activate"}
                      >
                        {app.status === "active" ? (
                          <>
                            <Pause className="w-3.5 h-3.5" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            Activate
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(app)}
                        className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded text-sm font-medium transition flex items-center gap-1.5"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {apps.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No tienes aplicaciones</p>
          <p className="text-gray-500 text-sm mt-1">Crea tu primera aplicación para comenzar</p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Crear Aplicación</h2>

            <form onSubmit={handleCreate} className="space-y-4">
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

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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

      {/* Edit Modal (Rename) */}
      {showEditModal && selectedApp && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Renombrar Aplicación</h2>

            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nuevo Nombre
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Versión
                </label>
                <input
                  type="text"
                  value={editForm.version}
                  onChange={(e) => setEditForm({ ...editForm, version: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedApp(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Description Modal */}
      {showDescModal && selectedApp && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Editar Descripción</h2>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await fetch(`/api/seller/apps/${selectedApp.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ download_link: description }),
                  });

                  if (res.ok) {
                    setShowDescModal(false);
                    setSelectedApp(null);
                    setDescription("");
                    loadApps();
                  } else {
                    alert("Error al actualizar");
                  }
                } catch (error) {
                  alert("Error de conexión");
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción / Download Link
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white h-32"
                  placeholder="URL de descarga o descripción..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDescModal(false);
                    setSelectedApp(null);
                    setDescription("");
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Application Credentials Modal */}
      {showCredentialsModal && selectedApp && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full border border-gray-700 my-8">
            <h2 className="text-xl font-bold text-white mb-2">Application Credentials</h2>
            <p className="text-sm text-gray-400 mb-6">
              Simply replace the placeholder code in the example with these:
            </p>

            {/* Toggle Display Code Snippet */}
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-900/50 rounded border border-gray-700">
              <span className="text-sm text-gray-300">Display Code Snippet</span>
              <button
                type="button"
                onClick={() => setShowCodeSnippet(!showCodeSnippet)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  showCodeSnippet ? "bg-emerald-600" : "bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    showCodeSnippet ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Application Credentials Section */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-white mb-3">Application Credentials</h3>
              <p className="text-xs text-gray-400 mb-3">
                Simply replace the placeholder code in the example with these
              </p>
              
              {/* Toggle Display Code Snippet */}
              <div className="flex items-center justify-between mb-4 p-3 bg-gray-900/50 rounded border border-gray-700">
                <span className="text-sm text-gray-300">Display Code Snippet</span>
                <button
                  type="button"
                  onClick={() => setShowCodeSnippet(!showCodeSnippet)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    showCodeSnippet ? "bg-emerald-600" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      showCodeSnippet ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Language Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Language:
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Code Example */}
              {showCodeSnippet && (
                <div className="bg-gray-900 rounded p-4 mb-4 relative">
                  <pre className="text-sm text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap">
{`#include <iostream>
#include <string>
#include "skCrypt.h"

std::string name = skCrypt("${selectedApp.name}").decrypt();
std::string ownerid = skCrypt("${selectedApp.app_id.split('.')[0]}").decrypt();
std::string version = skCrypt("${selectedApp.version}").decrypt();
std::string url = skCrypt("https://www.keyauthpro.xyz/api/1.0/").decrypt();
std::string path = skCrypt("").decrypt();
std::string secret = skCrypt("ta1r1K38h3dMara711f4f411f0461b17a7").decrypt();`}
                  </pre>
                  
                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        const code = `#include <iostream>\n#include <string>\n#include "skCrypt.h"\n\nstd::string name = skCrypt("${selectedApp.name}").decrypt();\nstd::string ownerid = skCrypt("${selectedApp.app_id.split('.')[0]}").decrypt();\nstd::string version = skCrypt("${selectedApp.version}").decrypt();\nstd::string url = skCrypt("https://www.keyauthpro.xyz/api/1.0/").decrypt();\nstd::string path = skCrypt("").decrypt();\nstd::string secret = skCrypt("ta1r1K38h3dMara711f4f411f0461b17a7").decrypt();`;
                        navigator.clipboard.writeText(code);
                        alert("Código copiado");
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition"
                    >
                      📋 Copy Code
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm font-medium transition"
                    >
                      📖 View Example
                    </button>
                  </div>
                </div>
              )}

              {/* Tutorial Link */}
              <button
                type="button"
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-4"
              >
                <span>👁️</span> View Tutorial
              </button>

              {/* Application Name */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">
                  Application Name
                </label>
                <input
                  type="text"
                  value={selectedApp.name}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCredentialsModal(false);
                  setSelectedApp(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
