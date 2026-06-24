"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Calendar, DollarSign, Users, Check } from "lucide-react";

interface Subscription {
  id: string;
  app_id: string;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  level: number;
  features: string[];
  status: "active" | "inactive";
  created_at: string;
}

interface App {
  id: string;
  name: string;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [apps, setApps] = useState<App[]>([]);
  const [selectedApp, setSelectedApp] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration_days: "30",
    level: "1",
    features: "",
    status: "active",
  });

  useEffect(() => {
    loadApps();
  }, []);

  useEffect(() => {
    if (selectedApp) {
      loadSubscriptions();
    }
  }, [selectedApp]);

  const loadApps = async () => {
    try {
      const response = await fetch("/api/admin/apps");
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        setApps(data.data);
        setSelectedApp(data.data[0].id);
      }
    } catch (error) {
      console.error("Error loading apps:", error);
    }
  };

  const loadSubscriptions = async () => {
    if (!selectedApp) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/subscription-plans?app_id=${selectedApp}`);
      const data = await response.json();
      if (data.success) {
        setSubscriptions(data.data || []);
      }
    } catch (error) {
      console.error("Error loading subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const features = formData.features
        .split(",")
        .map((f) => f.trim())
        .filter((f) => f);

      const response = await fetch("/api/admin/subscription-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app_id: selectedApp,
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          duration_days: parseInt(formData.duration_days),
          level: parseInt(formData.level),
          features,
          status: formData.status,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert("Suscripción creada exitosamente");
        setShowCreateModal(false);
        setFormData({
          name: "",
          description: "",
          price: "",
          duration_days: "30",
          level: "1",
          features: "",
          status: "active",
        });
        loadSubscriptions();
      } else {
        alert(data.message || "Error al crear suscripción");
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      alert("Error al crear suscripción");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta suscripción?")) return;

    try {
      const response = await fetch(`/api/admin/subscription-plans/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      
      if (data.success) {
        alert("Suscripción eliminada");
        loadSubscriptions();
      } else {
        alert(data.message || "Error al eliminar");
      }
    } catch (error) {
      console.error("Error deleting subscription:", error);
      alert("Error al eliminar suscripción");
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      
      const response = await fetch(`/api/admin/subscription-plans/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      
      if (data.success) {
        loadSubscriptions();
      } else {
        alert(data.message || "Error al actualizar");
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      alert("Error al actualizar suscripción");
    }
  };

  const getDurationText = (days: number) => {
    if (days === 1) return "1 día";
    if (days === 7) return "1 semana";
    if (days === 30) return "1 mes";
    if (days === 90) return "3 meses";
    if (days === 180) return "6 meses";
    if (days === 365) return "1 año";
    return `${days} días`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Planes de Suscripción</h1>
          <p className="text-text-muted mt-1">
            Crea y gestiona planes de suscripción para tus aplicaciones
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Crear Plan
        </button>
      </div>

      {/* App Selector */}
      <div className="bg-bg-card p-4 rounded-lg border border-border">
        <label className="block text-sm font-medium text-text-muted mb-2">
          Seleccionar Aplicación
        </label>
        <select
          value={selectedApp}
          onChange={(e) => setSelectedApp(e.target.value)}
          className="w-full md:w-96 px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {apps.map((app) => (
            <option key={app.id} value={app.id}>
              {app.name}
            </option>
          ))}
        </select>
      </div>

      {/* Subscriptions Grid */}
      {loading ? (
        <div className="text-center py-12 text-text-muted">Cargando...</div>
      ) : subscriptions.length === 0 ? (
        <div className="text-center py-12 bg-bg-card rounded-lg border border-border">
          <DollarSign className="w-12 h-12 text-text-dim mx-auto mb-4" />
          <p className="text-text-muted">No hay planes de suscripción creados</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 text-emerald-400 hover:text-emerald-300"
          >
            Crear el primer plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className={`bg-bg-card rounded-lg border-2 p-6 transition ${
                sub.status === "active"
                  ? "border-emerald-500/30 hover:border-emerald-500/50"
                  : "border-border opacity-60"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">{sub.name}</h3>
                  <p className="text-sm text-text-muted">{sub.description}</p>
                </div>
                <button
                  onClick={() => toggleStatus(sub.id, sub.status)}
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    sub.status === "active"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {sub.status === "active" ? "Activo" : "Inactivo"}
                </button>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-emerald-400">
                    ${sub.price}
                  </span>
                  <span className="text-text-muted">/ {getDurationText(sub.duration_days)}</span>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2 text-text-muted">
                  <Calendar className="w-4 h-4" />
                  <span>Duración: {sub.duration_days} días</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <Users className="w-4 h-4" />
                  <span>Nivel: {sub.level}</span>
                </div>
              </div>

              {/* Features */}
              {sub.features && sub.features.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-text-muted mb-2">Características:</p>
                  <ul className="space-y-1">
                    {sub.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-text-muted">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {sub.features.length > 3 && (
                      <li className="text-xs text-text-dim">
                        +{sub.features.length - 3} más...
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-border">
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
          <div className="bg-bg-card rounded-lg border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Crear Plan de Suscripción</h2>

              <form onSubmit={handleCreate} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Nombre del Plan *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Plan Básico, Plan Pro, Plan Premium..."
                    className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción del plan..."
                    rows={3}
                    className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Price and Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                      Precio ($) *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="9.99"
                      className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                      Duración *
                    </label>
                    <select
                      value={formData.duration_days}
                      onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                      className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="1">1 día</option>
                      <option value="7">1 semana</option>
                      <option value="30">1 mes</option>
                      <option value="90">3 meses</option>
                      <option value="180">6 meses</option>
                      <option value="365">1 año</option>
                      <option value="730">2 años</option>
                      <option value="-1">Lifetime (Permanente)</option>
                    </select>
                  </div>
                </div>

                {/* Level */}
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Nivel de Acceso *
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="1">Nivel 1 - Básico</option>
                    <option value="2">Nivel 2 - Intermedio</option>
                    <option value="3">Nivel 3 - Avanzado</option>
                    <option value="4">Nivel 4 - Premium</option>
                    <option value="5">Nivel 5 - VIP</option>
                  </select>
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Características (separadas por coma)
                  </label>
                  <textarea
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    placeholder="Acceso completo, Soporte prioritario, Sin anuncios, Actualizaciones gratis"
                    rows={3}
                    className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-text-dim mt-1">
                    Ejemplo: Acceso completo, Soporte 24/7, Sin límites
                  </p>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
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
                    Crear Plan
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
