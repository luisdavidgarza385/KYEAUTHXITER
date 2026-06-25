"use client";

import { useState, useEffect } from "react";
import { Settings as SettingsIcon, User } from "lucide-react";

interface SellerData {
  id: string;
  username: string;
  seller_key: string;
  credits: number;
  unlimited_credits: boolean;
  can_use_api: boolean;
  status: string;
  created_at: string;
}

export default function SellerSettingsPage() {
  const [seller, setSeller] = useState<SellerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSellerData();
  }, []);

  async function loadSellerData() {
    try {
      const res = await fetch("/api/seller/me");
      const data = await res.json();
      
      if (data.success) {
        setSeller(data.data);
      }
    } catch (error) {
      console.error("Error loading seller data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Cargando...</div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-400">Error cargando datos</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Configuración</h1>
        <p className="text-gray-400 text-sm">
          Información de tu cuenta de seller
        </p>
      </div>

      {/* Account Info */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <User className="w-5 h-5 text-emerald-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Información de Cuenta</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Usuario</label>
            <div className="px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white">
              {seller.username}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">API Key</label>
            <div className="px-4 py-2 bg-gray-700 border border-gray-600 rounded text-emerald-400 font-mono text-sm break-all">
              {seller.seller_key}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Estado</label>
              <div
                className={`px-4 py-2 rounded text-center font-medium ${
                  seller.status === "active"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {seller.status === "active" ? "Activo" : "Inactivo"}
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Acceso API</label>
              <div
                className={`px-4 py-2 rounded text-center font-medium ${
                  seller.can_use_api
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-gray-600/20 text-gray-400"
                }`}
              >
                {seller.can_use_api ? "Habilitado" : "Deshabilitado"}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Créditos</label>
            <div className="px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white font-semibold">
              {seller.unlimited_credits ? "∞ Ilimitado" : seller.credits.toLocaleString()}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Cuenta Creada</label>
            <div className="px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white">
              {new Date(seller.created_at).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Información del Sistema</h2>
        </div>

        <div className="space-y-2 text-sm text-gray-300">
          <div className="flex justify-between py-2 border-b border-gray-700">
            <span>Versión</span>
            <span className="text-white font-mono">1.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-700">
            <span>Tipo de Cuenta</span>
            <span className="text-emerald-400 font-semibold">Seller</span>
          </div>
          <div className="flex justify-between py-2">
            <span>ID de Cuenta</span>
            <span className="text-gray-400 font-mono text-xs">{seller.id.substring(0, 20)}...</span>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
        <p className="text-sm text-gray-300">
          💡 <strong>Nota:</strong> Para cambiar tu username, créditos, o permisos de API, contacta al administrador del sistema.
        </p>
      </div>
    </div>
  );
}
