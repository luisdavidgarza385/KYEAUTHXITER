"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Shield, Key, Users, LogOut } from "lucide-react";

interface SellerData {
  id: string;
  username: string;
  credits: number;
  unlimited_credits: boolean;
  can_use_api: boolean;
  seller_key?: string;
}

interface App {
  id: string;
  name: string;
  app_id: string;
  status: string;
  created_at: string;
}

export default function SellerDashboard() {
  const router = useRouter();
  const [seller, setSeller] = useState<SellerData | null>(null);
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateApp, setShowCreateApp] = useState(false);
  const [newAppName, setNewAppName] = useState("");

  useEffect(() => {
    loadSellerData();
  }, []);

  async function loadSellerData() {
    try {
      // Get seller info
      const meRes = await fetch("/api/seller/me");
      const meData = await meRes.json();

      if (!meData.success) {
        router.push("/seller/login");
        return;
      }

      setSeller(meData.data);

      // Get seller's apps
      const appsRes = await fetch("/api/seller/apps");
      const appsData = await appsRes.json();
      
      if (appsData.success) {
        setApps(appsData.data);
      }
    } catch (error) {
      console.error("Error loading seller data:", error);
      router.push("/seller/login");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateApp(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/seller/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newAppName }),
      });

      const data = await res.json();

      if (data.success) {
        setShowCreateApp(false);
        setNewAppName("");
        loadSellerData();
      } else {
        alert(data.message || "Error al crear aplicación");
      }
    } catch (error) {
      alert("Error de conexión");
    }
  }

  async function handleLogout() {
    await fetch("/api/seller/logout", { method: "POST" });
    router.push("/seller/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  if (!seller) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Panel de Seller</h1>
            <p className="text-sm text-gray-400">@{seller.username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Credits */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Key className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-medium text-gray-400">Créditos</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {seller.unlimited_credits ? "∞" : seller.credits}
            </p>
            {!seller.unlimited_credits && (
              <p className="text-xs text-gray-500 mt-1">
                Limitado - Cada licencia consume 1 crédito
              </p>
            )}
          </div>

          {/* Apps */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-medium text-gray-400">Aplicaciones</h3>
            </div>
            <p className="text-3xl font-bold text-white">{apps.length}</p>
            <p className="text-xs text-gray-500 mt-1">Aplicaciones creadas</p>
          </div>

          {/* API Access */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-medium text-gray-400">Acceso API</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {seller.can_use_api ? "✓" : "✗"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {seller.can_use_api ? "Habilitado" : "Deshabilitado"}
            </p>
          </div>
        </div>

        {/* API Key (if enabled) */}
        {seller.can_use_api && seller.seller_key && (
          <div className="bg-emerald-900/20 border border-emerald-700 rounded-lg p-6 mb-8">
            <h3 className="text-sm font-medium text-emerald-400 mb-2">Tu API Key</h3>
            <code className="block bg-gray-900 text-emerald-300 text-sm px-4 py-3 rounded font-mono break-all">
              {seller.seller_key}
            </code>
            <p className="text-xs text-gray-400 mt-2">
              Usa esta key para generar licencias vía API
            </p>
          </div>
        )}

        {/* Applications Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Mis Aplicaciones</h2>
          <button
            onClick={() => setShowCreateApp(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            Nueva Aplicación
          </button>
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps.map((app) => (
            <div
              key={app.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-5 hover:border-emerald-500/50 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{app.name}</h3>
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-medium rounded mt-1 ${
                      app.status === "active"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {app.status === "active" ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">App ID:</span>
                  <code className="block bg-gray-900 text-emerald-400 text-xs px-2 py-1 rounded font-mono mt-1 truncate">
                    {app.app_id}
                  </code>
                </div>
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
                  Creado: {new Date(app.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {apps.length === 0 && (
          <div className="text-center py-12 bg-gray-800 border border-gray-700 rounded-lg">
            <Shield className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No tienes aplicaciones creadas</p>
            <p className="text-gray-500 text-sm mt-1">Crea tu primera aplicación para comenzar</p>
          </div>
        )}
      </div>

      {/* Create App Modal */}
      {showCreateApp && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Nueva Aplicación</h2>

            <form onSubmit={handleCreateApp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre de la aplicación
                </label>
                <input
                  type="text"
                  required
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  placeholder="Mi Aplicación"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateApp(false)}
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
