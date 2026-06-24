"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Copy, Check, RefreshCw, Eye, EyeOff } from "lucide-react";

interface Seller {
  id: string;
  username: string;
  password_hash?: string;
  seller_key: string;
  credits: number;
  unlimited_credits: boolean;
  can_use_api: boolean;
  status: string;
  created_at: string;
}

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    unlimited_credits: true,
    credits: 100,
    can_use_api: true,
  });

  useEffect(() => {
    loadSellers();
  }, []);

  async function loadSellers() {
    try {
      const res = await fetch("/api/admin/sellers");
      const data = await res.json();
      if (data.success) {
        setSellers(data.data);
      } else {
        // Mostrar error en consola pero no bloquear la UI
        console.error("Error del servidor:", data.message);
        alert(`Error: ${data.message}\n\n¿Has ejecutado el SQL en Supabase?\nVe a: supabase/sellers.sql`);
      }
    } catch (error) {
      console.error("Error cargando sellers:", error);
      alert("Error de conexión. Verifica que Supabase esté configurado correctamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/sellers", {
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
          unlimited_credits: true,
          credits: 100,
          can_use_api: true,
        });
        loadSellers();
      } else {
        alert(data.message || "Error al crear seller");
      }
    } catch (error) {
      alert("Error de conexión");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar este seller?")) return;
    try {
      const res = await fetch(`/api/admin/sellers/${id}`, { method: "DELETE" });
      if (res.ok) {
        loadSellers();
      }
    } catch (error) {
      console.error("Error eliminando seller:", error);
    }
  }

  async function handleToggleStatus(seller: Seller) {
    try {
      const newStatus = seller.status === "active" ? "inactive" : "active";
      const res = await fetch(`/api/admin/sellers/${seller.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        loadSellers();
      }
    } catch (error) {
      console.error("Error actualizando status:", error);
    }
  }

  async function handleRegenerateKey(id: string) {
    if (!confirm("¿Regenerar la API key de este seller? La anterior dejará de funcionar.")) return;
    try {
      const res = await fetch(`/api/admin/sellers/${id}/regenerate`, { method: "POST" });
      if (res.ok) {
        loadSellers();
      }
    } catch (error) {
      console.error("Error regenerando key:", error);
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
          <h1 className="text-2xl font-bold text-white">Gestión de Sellers</h1>
          <p className="text-gray-400 text-sm mt-1">
            Crea y administra sellers con acceso a API para generar licencias
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Crear Seller
        </button>
      </div>

      {/* Sellers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sellers.map((seller) => (
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
              {seller.can_use_api && (
                <button
                  onClick={() => handleRegenerateKey(seller.id)}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition"
                  title="Regenerar API Key"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Created Date */}
            <div className="text-[10px] text-gray-500 mt-3 text-center">
              Creado: {new Date(seller.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {sellers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No hay sellers creados</p>
          <p className="text-gray-500 text-sm mt-1">Crea tu primer seller para comenzar</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Crear Seller</h2>

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
                  placeholder="seller_username"
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
                  Dar acceso a API de Seller
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
                  Crear Seller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
