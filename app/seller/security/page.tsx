"use client";

import { useState } from "react";
import { Lock, Shield } from "lucide-react";

export default function SellerSecurityPage() {
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (formData.new_password !== formData.confirm_password) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden" });
      return;
    }

    if (formData.new_password.length < 6) {
      setMessage({ type: "error", text: "La contraseña debe tener al menos 6 caracteres" });
      return;
    }

    try {
      const res = await fetch("/api/seller/security/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: formData.current_password,
          new_password: formData.new_password,
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        setMessage({ type: "success", text: "Contraseña cambiada exitosamente" });
        setFormData({ current_password: "", new_password: "", confirm_password: "" });
      } else {
        setMessage({ type: "error", text: data.message || "Error al cambiar contraseña" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error de conexión" });
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Seguridad</h1>
        <p className="text-gray-400 text-sm">
          Gestiona la seguridad de tu cuenta
        </p>
      </div>

      {/* Change Password */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Lock className="w-5 h-5 text-emerald-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Cambiar Contraseña</h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contraseña Actual
            </label>
            <input
              type="password"
              required
              value={formData.current_password}
              onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nueva Contraseña
            </label>
            <input
              type="password"
              required
              value={formData.new_password}
              onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              required
              value={formData.confirm_password}
              onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded ${
                message.type === "success"
                  ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/20 border border-red-500/30 text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
          >
            Cambiar Contraseña
          </button>
        </form>
      </div>

      {/* Security Tips */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Consejos de Seguridad</h2>
        </div>

        <ul className="text-sm text-gray-300 space-y-2">
          <li>✅ Usa una contraseña fuerte con al menos 8 caracteres</li>
          <li>✅ No compartas tu contraseña con nadie</li>
          <li>✅ Cambia tu contraseña regularmente</li>
          <li>✅ No uses la misma contraseña en múltiples sitios</li>
          <li>✅ Guarda tu API key en un lugar seguro</li>
          <li>✅ No compartas tu API key públicamente</li>
        </ul>
      </div>
    </div>
  );
}
