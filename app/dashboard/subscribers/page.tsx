"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Key, DollarSign, Check, X } from "lucide-react";

interface Subscriber {
  id: string;
  username: string;
  subscription_type: string;
  credits: number;
  status: string;
  created_at: string;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    subscription_type: "VIP",
    credits: "-1",
    status: "active",
  });

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/subscribers");
      const data = await response.json();
      if (data.success) {
        setSubscribers(data.data || []);
      }
    } catch (error) {
      console.error("Error loading subscribers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/admin/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          subscription_type: formData.subscription_type,
          credits: parseInt(formData.credits),
          status: formData.status,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Suscriptor creado exitosamente");
        setShowCreateModal(false);
        setFormData({
          username: "",
          password: "",
          subscription_type: "VIP",
          credits: "-1",
          status: "active",
        });
        loadSubscribers();
      } else {
        alert(data.message || "Error al crear suscriptor");
      }
    } catch (error) {
      console.error("Error creating subscriber:", error);
      alert("Error al crear suscriptor");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este suscriptor?")) return;

    try {
      const response = await fetch(`/api/admin/subscribers/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        alert("Suscriptor eliminado");
        loadSubscribers();
      } else {
        alert(data.message || "Error al eliminar");
      }
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      alert("Error al eliminar suscriptor");
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";

      const response = await fetch(`/api/admin/subscribers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        loadSubscribers();
      } else {
        alert(data.message || "Error al actualizar");
      }
    } catch (error) {
      console.error("Error updating subscriber:", error);
      alert("Error al actualizar suscriptor");
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Suscriptores</h1>
          <p className="text-text-muted mt-1">
            Gestiona los suscriptores y sus accesos
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Crear Suscriptor
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <h3 className="text-blue-300 font-semibold mb-2">💡 ¿Qué son los Suscriptores?</h3>
        <p className="text-gray-300 text-sm">
          Los suscriptores pueden crear sus propias aplicaciones, generar licencias y gestionar usuarios de forma independiente.
          Cada suscriptor accede mediante: <strong>https://tu-dominio.com/subscriber/login</strong>
        </p>
      </div>

      {/* Subscribers List */}
      {loading ? (
        <div className="text-center py-12 text-text-muted">Cargando...</div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-12 bg-bg-card rounded-lg border border-border">
          <DollarSign className="w-12 h-12 text-text-dim mx-auto mb-4" />
          <p className="text-text-muted">No hay suscriptores creados</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 text-blue-400 hover:text-blue-300"
          >
            Crear el primer suscriptor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscribers.map((sub) => (
            <div
              key={sub.id}
              className={`bg-bg-card rounded-lg border-2 p-6 transition ${
                sub.status === "active"
                  ? "border-blue-500/30 hover:border-blue-500/50"
                  : "border-border opacity-60"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {sub.username}
                  </h3>
                  <p className="text-sm text-text-muted">
                    Plan: {sub.subscription_type}
                  </p>
                </div>
                <button
                  onClick={() => toggleStatus(sub.id, sub.status)}
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    sub.status === "active"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {sub.status === "active" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </button>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2 text-text-muted">
                  <Key className="w-4 h-4" />
                  <span>ID: {sub.id.slice(0, 20)}...</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <DollarSign className="w-4 h-4" />
                  <span>
                    Créditos: {sub.credits === -1 ? "Ilimitado" : sub.credits}
                  </span>
                </div>
              </div>

              {/* Login URL */}
              <div className="mb-4 p-3 bg-gray-700/50 rounded text-xs">
                <p className="text-gray-400 mb-1">URL de acceso:</p>
                <p className="text-blue-400 break-all">/subscriber/login</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(sub.id)}
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
          <div className="bg-bg-card rounded-lg border border-border max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                Crear Suscriptor
              </h2>

              <form onSubmit={handleCreate} className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Usuario *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder="usuario123"
                    className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Subscription Type */}
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Tipo de Suscripción *
                  </label>
                  <select
                    value={formData.subscription_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        subscription_type: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="VIP">VIP</option>
                    <option value="Basic">Basic</option>
                    <option value="Premium">Premium</option>
                    <option value="Pro">Pro</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
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
                    className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="-1">Ilimitado</option>
                    <option value="100">100 créditos</option>
                    <option value="500">500 créditos</option>
                    <option value="1000">1,000 créditos</option>
                    <option value="5000">5,000 créditos</option>
                    <option value="10000">10,000 créditos</option>
                  </select>
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
                    className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>

                {/* Info */}
                <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3 text-xs text-gray-300">
                  <p className="font-semibold text-blue-300 mb-1">
                    📌 Información importante:
                  </p>
                  <ul className="space-y-1">
                    <li>• El suscriptor accederá en: /subscriber/login</li>
                    <li>• Podrá crear sus propias aplicaciones</li>
                    <li>• Ilimitado = sin restricciones</li>
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
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    Crear
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
