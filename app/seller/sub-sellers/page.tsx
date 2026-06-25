"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Copy, Check, RefreshCw, Eye, EyeOff } from "lucide-react";

interface SubSeller {
  id: string;
  username: string;
  seller_key: string;
  credits: number;
  unlimited_credits: boolean;
  can_use_api: boolean;
  status: string;
  created_at: string;
}

export default function SubSellersPage() {
  const [subSellers, setSubSellers] = useState<SubSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    unlimited_credits: false,
    credits: 100,
    can_use_api: true,
  });

  useEffect(() => {
    loadSubSellers();
  }, []);

  async function loadSubSellers() {
    try {
      const res = await fetch("/api/seller/sub-sellers");
      const data = await res.json();
      if (data.success) {
        setSubSellers(data.data || []);
      } else {
        console.error("Error:", data.message);
      }
    } catch (error) {
      console.error("Error loading sub-sellers:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/seller/sub-sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setFormData({
          username: "",
          password: "",
          unlimited_credits: false,
          credits: 100,
          can_use_api: true,
        });
        loadSubSellers();
      } else {
        alert(data.message || "Error al crear sub-seller");
      }
    } catch (error) {
      alert("Error de conexión");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar este sub-seller?")) return;
    try {
      const res = await fetch(`/api/seller/sub-sellers/${id}`, { method: "DELETE" });
      if (res.ok) {
        loadSubSellers();
      }
    } catch (error) {
      console.error("Error eliminando sub-seller:", error);
    }
  }

  async function handleToggleStatus(seller: SubSeller) {
    try {
      const newStatus = seller.status === "active" ? "inactive" : "active";
      const res = await fetch(`/api/seller/sub-sellers/${seller.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        loadSubSellers();
      }
    } catch (error) {
      console.error("Error actualizando status:", error);
    }
  }

  function copyToClipboard(text: string, sellerId: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(sellerId);
    setTimeout(() => setCopiedKey(null), 2000);
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
          <h1 className="text-2xl font-bold text-white">Sub-Sellers</h1>
          <p className="text-gray-400 text-sm mt-1">
            Crea y administra sub-sellers con sus propios créditos
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Crear Sub-Seller
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Total Sub-Sellers</div>
          <div className="text-2xl font-bold text-white">{subSellers.length}</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Activos</div>
          <div className="text-2xl font-bold text-emerald-400">
            {subSellers.filter((s) => s.status === "active").length}
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Créditos Totales Distribuidos</div>
          <div className="text-2xl font-bold text-blue-400">
            {subSellers.reduce((acc, s) => acc + (s.unlimited_credits ? 0 : s.credits), 0)}
          </div>
        </div>
      </div>

      {/* Sub-Sellers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subSellers.map((seller) => (
          <div
            key={seller.id}
            className="bg-gray-800 border border-gray-700 rounded-lg p-5 hover:border-emerald-500/50 transition"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{seller.username}</h3>
                <span
                  className={`inline-block px-2 py-0.5 text-xs font-medium rounded mt-1 ${
                    seller.status === "active"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {seller.status === "active" ? "Activo" : "Inactivo"}
                </span>
              </div>
              <button
                onClick={() => handleDelete(seller.id)}
                className="text-red-400 hover:text-red-300 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Credits */}
            <div className="mb-4">
              <div className="text-xs text-gray-400 mb-1">Créditos</div>
              <div className="text-xl font-bold text-white">
                {seller.unlimited_credits ? "∞ Ilimitado" : seller.credits}
              </div>
            </div>

            {/* API Key */}
            {seller.can_use_api && (
              <div className="mb-4">
                <div className="text-xs text-gray-400 mb-1">API Key</div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-900 text-emerald-400 text-xs px-2 py-1 rounded font-mono truncate">
                    {seller.seller_key}
                  </code>
                  <button
                    onClick={() => copyToClipboard(seller.seller_key, seller.id)}
                    className="p-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
                    title="Copiar"
                  >
                    {copiedKey === seller.id ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-gray-700">
              <button
                onClick={() => handleToggleStatus(seller)}
                className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition"
              >
                {seller.status === "active" ? <EyeOff className="w-3 h-3 inline mr-1" /> : <Eye className="w-3 h-3 inline mr-1" />}
                {seller.status === "active" ? "Desactivar" : "Activar"}
              </button>
            </div>

            {/* Created Date */}
            <div className="text-[10px] text-gray-500 mt-3 text-center">
              Creado: {new Date(seller.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {subSellers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No tienes sub-sellers creados</p>
          <p className="text-gray-500 text-sm mt-1">Crea tu primer sub-seller para distribuir créditos</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Crear Sub-Seller</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Usuario
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  placeholder="subseller_username"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  placeholder="••••••••"
                />
              </div>

              {/* API Access */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="api_access"
                  checked={formData.can_use_api}
                  onChange={(e) =>
                    setFormData({ ...formData, can_use_api: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="api_access" className="text-sm text-gray-300">
                  Dar acceso a API
                </label>
              </div>

              {/* Credits Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Créditos
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, unlimited_credits: true })}
                    className={`flex-1 px-4 py-2 rounded border transition ${
                      formData.unlimited_credits
                        ? "bg-emerald-600 border-emerald-500 text-white"
                        : "bg-gray-700 border-gray-600 text-gray-300"
                    }`}
                  >
                    Ilimitado
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, unlimited_credits: false })}
                    className={`flex-1 px-4 py-2 rounded border transition ${
                      !formData.unlimited_credits
                        ? "bg-emerald-600 border-emerald-500 text-white"
                        : "bg-gray-700 border-gray-600 text-gray-300"
                    }`}
                  >
                    Limitado
                  </button>
                </div>
              </div>

              {/* Credits Amount (if limited) */}
              {!formData.unlimited_credits && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Créditos Iniciales
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.credits}
                    onChange={(e) =>
                      setFormData({ ...formData, credits: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Los créditos se descontarán de tu saldo
                  </p>
                </div>
              )}

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
                  Crear Sub-Seller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
