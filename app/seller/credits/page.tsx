"use client";

import { useState, useEffect } from "react";
import { Coins, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface SellerData {
  username: string;
  credits: number;
  unlimited_credits: boolean;
}

export default function SellerCreditsPage() {
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
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Créditos</h1>
        <p className="text-gray-400 text-sm">
          Gestiona el saldo de tus créditos
        </p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border border-emerald-700/50 rounded-lg p-8 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center">
            <Coins className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Saldo Actual</div>
            <div className="text-4xl font-bold text-white">
              {seller.unlimited_credits ? (
                <span className="text-emerald-400">∞ Ilimitado</span>
              ) : (
                <span>{seller.credits.toLocaleString()}</span>
              )}
            </div>
          </div>
        </div>

        {!seller.unlimited_credits && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              💡 <strong>Tip:</strong> Cada licencia generada consume 1 crédito
            </div>
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Cómo Funcionan</h3>
          </div>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• 1 crédito = 1 licencia generada</li>
            <li>• Los créditos se descuentan automáticamente</li>
            <li>• Puedes generar licencias vía dashboard, API o tienda web</li>
            <li>• Créditos ilimitados = sin restricciones</li>
          </ul>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Recargar Créditos</h3>
          </div>
          <p className="text-sm text-gray-300 mb-4">
            Para recargar créditos, contacta al administrador del sistema.
          </p>
          <button
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition"
            onClick={() => window.open("mailto:admin@example.com?subject=Recarga de Créditos")}
          >
            Solicitar Recarga
          </button>
        </div>
      </div>

      {/* Warning */}
      {!seller.unlimited_credits && seller.credits < 10 && (
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <TrendingDown className="w-5 h-5 text-yellow-400" />
            <div>
              <h3 className="font-semibold text-yellow-400">Créditos Bajos</h3>
              <p className="text-sm text-gray-300 mt-1">
                Te quedan pocos créditos. Solicita una recarga para seguir generando licencias.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Usage Info */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Uso de Créditos</h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span>Dashboard (Crear Licencias)</span>
            <span className="text-emerald-400 font-semibold">1 crédito/licencia</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span>API Seller</span>
            <span className="text-emerald-400 font-semibold">1 crédito/licencia</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span>Tienda Web Pública</span>
            <span className="text-emerald-400 font-semibold">1 crédito/licencia</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span>Discord Bot</span>
            <span className="text-emerald-400 font-semibold">1 crédito/licencia</span>
          </div>
        </div>
      </div>
    </div>
  );
}
