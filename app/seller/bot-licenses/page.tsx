"use client";

import { useState, useEffect } from "react";
import { Key, Search, RefreshCw, Copy, Check, Bot } from "lucide-react";

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
  note?: string;
}

interface App {
  id: string;
  name: string;
}

export default function BotLicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [apps, setApps] = useState<App[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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
        // Filter only bot-generated licenses (those with "bot" or "discord" in note)
        const botLicenses = (data.data || []).filter((l: License) => 
          l.note && (l.note.toLowerCase().includes("bot") || l.note.toLowerCase().includes("discord"))
        );
        setLicenses(botLicenses);
      }
    } catch (error) {
      console.error("Error loading licenses:", error);
    } finally {
      setLoading(false);
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
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Bot className="w-8 h-8 text-blue-400" />
          <h1 className="text-2xl font-bold text-white">Licencias de Bot</h1>
        </div>
        <p className="text-gray-400 text-sm">
          Vista simplificada de licencias generadas automáticamente por el Discord Bot
        </p>
      </div>

      {apps.length === 0 ? (
        <div className="text-center py-12">
          <Key className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No tienes aplicaciones</p>
          <p className="text-gray-500 text-sm mt-1">Crea una aplicación primero</p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800 border border-blue-700/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Total Generadas por Bot</div>
                <div className="text-2xl font-bold text-blue-400">{licenses.length}</div>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Activas</div>
                <div className="text-2xl font-bold text-emerald-400">
                  {licenses.filter((l) => l.status === "used").length}
                </div>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Sin Usar</div>
                <div className="text-2xl font-bold text-yellow-400">
                  {licenses.filter((l) => l.status === "unused").length}
                </div>
              </div>
            </div>
          )}

          {/* Licenses Table */}
          {loading ? (
            <div className="text-center py-12 text-gray-400">Cargando...</div>
          ) : filteredLicenses.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 border border-gray-700 rounded-lg">
              <Bot className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">
                {searchTerm ? "No se encontraron licencias" : "Aún no hay licencias generadas por el bot"}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Las licencias aparecerán aquí cuando el Discord Bot las genere automáticamente
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
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Expira
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Creada
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredLicenses.map((license) => (
                      <tr key={license.id} className="hover:bg-gray-900/30 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <code className="text-blue-400 font-mono text-sm">
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
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                              license.status === "unused"
                                ? "bg-yellow-500/20 text-yellow-400"
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
                          {new Date(license.expires_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {new Date(license.created_at).toLocaleDateString()}
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
    </div>
  );
}
