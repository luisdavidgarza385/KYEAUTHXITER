"use client";

import { useState, useEffect } from "react";
import { Plus, Copy, Key, RefreshCw, Trash2, Check, X } from "lucide-react";

interface Seller {
  id: string;
  username: string;
  seller_key: string;
  credits: number;
  status: string;
  created_at: string;
}

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    credits: "-1",
    status: "active",
  });
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/sellers");
      const data = await response.json();
      if (data.success) {
        setSellers(data.data || []);
      }
    } catch (error) {
      console.error("Error loading sellers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/admin/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          credits: parseInt(formData.credits),
          status: formData.status,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Seller creado exitosamente");
        setShowCreateModal(false);
        setFormData({
          username: "",
          credits: "-1",
          status: "active",
        });
        loadSellers();
      } else {
        alert(data.message || "Error al crear seller");
      }
    } catch (error) {
      console.error("Error creating seller:", error);
      alert("Error al crear seller");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este seller?")) return;

    try {
      const response = await fetch(`/api/admin/sellers/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        alert("Seller eliminado");
        loadSellers();
      } else {
        alert(data.message || "Error al eliminar");
      }
    } catch (error) {
      console.error("Error deleting seller:", error);
      alert("Error al eliminar seller");
    }
  };

  const handleRegenerateKey = async (id: string) => {
    if (!confirm("¿Regenerar seller key? La key anterior dejará de funcionar.")) return;

    try {
      const response = await fetch(`/api/admin/sellers/${id}/regenerate`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        alert("Seller key regenerado");
        loadSellers();
      } else {
        alert(data.message || "Error al regenerar");
      }
    } catch (error) {
      console.error("Error regenerating key:", error);
      alert("Error al regenerar key");
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";

      const response = await fetch(`/api/admin/sellers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        loadSellers();
      } else {
        alert(data.message || "Error al actualizar");
      }
    } catch (error) {
      console.error("Error updating seller:", error);
      alert("Error al actualizar seller");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const generateApiUrl = (sellerKey: string, appId: string = "APP_ID") => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/api/seller/?sellerkey=${sellerKey}&type=add&app_id=${appId}&expiry=30&amount=1&level=1&format=json`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Seller API</h1>
          <p className="text-text-muted mt-1">
            Crea sellers y genera API keys para vender licencias
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Crear Seller
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4">
        <h3 className="text-emerald-300 font-semibold mb-2">💡 ¿Cómo funciona?</h3>
        <p className="text-gray-300 text-sm mb-2">
          Los sellers pueden generar licencias mediante una URL simple, sin acceso al panel completo.
        </p>
        <code className="block bg-gray-800 p-2 rounded text-xs text-emerald-400 overflow-x-auto">
          /api/seller/?sellerkey=XXX&type=add&app_id=APP_ID&expiry=30&amount=10&level=1
        </code>
      </div>

      {/* Sellers List */}
      {loading ? (
        <div className="text-center py-12 text-text-muted">Cargando...</div>
      ) : sellers.length === 0 ? (
        <div className="text-center py-12 bg-bg-card rounded-lg border border-border">
          <Key className="w-12 h-12 text-text-dim mx-auto mb-4" />
          <p className="text-text-muted">No hay sellers creados</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 text-emerald-400 hover:text-emerald-300"
          >
            Crear el primer seller
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sellers.map((seller) => (
            <div
              key={seller.id}
              className={`bg-bg-card rounded-lg border-2 p-6 transition ${
                seller.status === "active"
                  ? "border-emerald-500/30"
                  : "border-border opacity-60"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {seller.username}
                  </h3>
                  <p className="text-sm text-text-muted">
                    Créditos: {seller.credits === -1 ? "Ilimitado" : seller.credits}
                  </p>
                </div>
                <button
                  onClick={() => toggleStatus(seller.id, seller.status)}
                  className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
                    seller.status === "active"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {seller.status === "active" ? (
                    <><Check className="w-3 h-3" /> Activo</>
                  ) : (
                    <><X className="w-3 h-3" /> Inactivo</>
                  )}
                </button>
              </div>

              {/* Seller Key */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-muted mb-2">
                  Seller Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={seller.seller_key}
                    readOnly
                    className="flex-1 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded text-white text-sm font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(seller.seller_key, seller.id + "_key")}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                  >
                    {copied === seller.id + "_key" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleRegenerateKey(seller.id)}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded transition"
                    title="Regenerar key"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* API URL Example */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-muted mb-2">
                  Ejemplo de URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={generateApiUrl(seller.seller_key)}
                    readOnly
                    className="flex-1 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded text-emerald-400 text-xs font-mono overflow-x-auto"
                  />
                  <button
                    onClick={() => copyToClipboard(generateApiUrl(seller.seller_key), seller.id + "_url")}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition"
                  >
                    {copied === seller.id + "_url" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Parameters Guide */}
              <div className="mb-4 p-3 bg-gray-700/30 rounded text-xs">
                <p className="text-gray-400 font-semibold mb-2">Parámetros disponibles:</p>
                <ul className="text-gray-400 space-y-1">
                  <li>• <span className="text-white">type</span>: add, info, balance</li>
                  <li>• <span className="text-white">app_id</span>: ID de la aplicación (requerido para 'add')</li>
                  <li>• <span className="text-white">expiry</span>: Días de duración (default: 30)</li>
                  <li>• <span className="text-white">amount</span>: Cantidad (default: 1, máx: 1000)</li>
                  <li>• <span className="text-white">level</span>: Nivel de acceso (default: 1)</li>
                  <li>• <span className="text-white">format</span>: json o text (default: json)</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(seller.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-bg-card rounded-lg border border-border max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Crear Seller</h2>

              <form onSubmit={handleCreate} className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Nombre de Usuario *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder="seller123"
                    className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Credits */}
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Créditos *
                  </label>
                  <select
                    value={formData.credits}
                    onChange={(e) =>
                      setFormData({ ...formData, credits: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="-1">Ilimitado</option>
                    <option value="100">100 créditos</option>
                    <option value="500">500 créditos</option>
                    <option value="1000">1,000 créditos</option>
                    <option value="5000">5,000 créditos</option>
                    <option value="10000">10,000 créditos</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    1 crédito = 1 licencia generada
                  </p>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>

                {/* Info */}
                <div className="bg-emerald-900/20 border border-emerald-500/30 rounded p-3 text-xs text-gray-300">
                  <p className="font-semibold text-emerald-300 mb-1">
                    📌 Información:
                  </p>
                  <ul className="space-y-1">
                    <li>• El seller key se genera automáticamente</li>
                    <li>• Puede generar licencias vía URL</li>
                    <li>• No tiene acceso al dashboard</li>
                  </ul>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-bg border border-border text-white rounded-lg hover:bg-bg-card transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                  >
                    Crear Seller
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
