"use client";

import { useState, useEffect } from "react";
import { Key, Plus, Search, RefreshCw, Copy, Check } from "lucide-react";

interface License {
  id: string;
  key: string;
  duration_days: number;
  level: number;
  status: string;
  uses: number;
  max_uses: number;
  expires_at: string;
  created_at: string;
}

interface App {
  id: string;
  name: string;
}

export default function SellerLicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [apps, setApps] = useState<App[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    app_id: "",
    amount: "1",
    expiry: "30",
    level: "1",
  });

  useEffect(() => {
    loadApps();
  }, []);

  useEffect(() => {
    if (selectedAppId) {
      loadLicenses();
    }
  }, [selectedAppId]);

  async function loadApps() {
    try {
      const res = await fetch("/api/seller/apps");
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        setApps(data.data);
        setSelectedAppId(data.data[0].id);
        setFormData({ ...formData, app_id: data.data[0].id });
      }
    } catch (error) {
      console.error("Error loading apps:", error);
    }
  }

  async function loadLicenses() {
    if (!selectedAppId) return;
    
    try {
      setLoading(true);
      const res = await fetch(`/api/seller/licenses?app_id=${selectedAppId}`);
      const data = await res.json();
      if (data.success) {
        setLicenses(data.data || []);
      }
    } catch (error) {
      console.error("Error loading licenses:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const res = await fetch("/api/seller/licenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        loadLicenses();
      } else {
        alert(data.message || "Error al crear licencias");
      }
    } catch (error) {
      alert("Error de conexión");
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  const filteredLicenses = licenses.filter((license) =>
    license.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedApp = apps.find((a) => a.id === selectedAppId);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Licencias</h1>
          <p className="text-gray-400 text-sm">
            Gestiona las licencias de tus aplicaciones
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={apps.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Crear Licencias
        </button>
      </div>

      {apps.length === 0 ? (
        <div className="text-center py-12">
          <Key className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No tienes aplicaciones</p>
          <p className="text-gray-500 text-sm mt-1">Crea una aplicación primero para generar licencias</p>
        </div>
      ) : (
        <>
          {/* App Selector & Search */}
          <div className="mb-6 flex gap-4 flex-wrap items-center">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-gray-400 mb-2">Aplicación</label>
              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                {apps.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-gray-400 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por key..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={loadLicenses}
                disabled={loading}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Actualizar
              </button>
            </div>
          </div>

          {/* Stats */}
          {selectedApp && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Total</div>
                <div className="text-2xl font-bold text-white">{licenses.length}</div>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Sin Usar</div>
                <div className="text-2xl font-bold text-blue-400">
                  {licenses.filter((l) => l.status === "unused").length}
                </div>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Activas</div>
                <div className="text-2xl font-bold text-emerald-400">
                  {licenses.filter((l) => l.status === "used").length}
                </div>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Baneadas</div>
                <div className="text-2xl font-bold text-red-400">
                  {licenses.filter((l) => l.status === "banned").length}
                </div>
              </div>
            </div>
          )}

          {/* Licenses Table */}
          {loading ? (
            <div className="text-center py-12 text-gray-400">Cargando...</div>
          ) : filteredLicenses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">
                {searchTerm ? "No se encontraron licencias" : "No hay licencias"}
              </p>
            </div>
          ) : (
            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Key
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Duración
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Nivel
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Usos
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Expira
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredLicenses.map((license) => (
                      <tr key={license.id} className="hover:bg-gray-900/30 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <code className="text-emerald-400 font-mono text-sm">
                              {license.key}
                            </code>
                            <button
                              onClick={() => copyToClipboard(license.key)}
                              className="p-1 hover:bg-gray-700 rounded transition"
                            >
                              {copiedKey === license.key ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {license.duration_days} días
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {license.level}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                              license.status === "unused"
                                ? "bg-blue-500/20 text-blue-400"
                                : license.status === "used"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {license.status === "unused"
                              ? "Sin usar"
                              : license.status === "used"
                              ? "Activa"
                              : "Baneada"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {license.uses}/{license.max_uses}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {new Date(license.expires_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Crear Licencias</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Aplicación
                </label>
                <select
                  value={formData.app_id}
                  onChange={(e) => setFormData({ ...formData, app_id: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  {apps.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Días
                  </label>
                  <select
                    value={formData.expiry}
                    onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  >
                    <option value="1">1 día</option>
                    <option value="7">7 días</option>
                    <option value="30">30 días</option>
                    <option value="90">90 días</option>
                    <option value="180">180 días</option>
                    <option value="365">365 días</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nivel
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </div>

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
