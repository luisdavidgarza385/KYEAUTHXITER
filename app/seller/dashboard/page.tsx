"use client";

import { useState, useEffect } from "react";
import { Shield, Key, Users, TrendingUp } from "lucide-react";

interface Stats {
  totalApps: number;
  totalLicenses: number;
  totalUsers: number;
  credits: number | string;
}

export default function SellerDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalApps: 0,
    totalLicenses: 0,
    totalUsers: 0,
    credits: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const res = await fetch("/api/seller/stats");
      const data = await res.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-gray-400">Cargando estadísticas...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Bienvenido a tu panel de seller</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Applications */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.totalApps}</div>
          <div className="text-sm text-gray-400">Aplicaciones</div>
        </div>

        {/* Licenses */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Key className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.totalLicenses}</div>
          <div className="text-sm text-gray-400">Licencias</div>
        </div>

        {/* Users */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.totalUsers}</div>
          <div className="text-sm text-gray-400">Usuarios</div>
        </div>

        {/* Credits */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.credits}</div>
          <div className="text-sm text-gray-400">Créditos</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/seller/apps"
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-emerald-500/50 transition"
          >
            <Shield className="w-8 h-8 text-emerald-400 mb-2" />
            <h3 className="font-semibold text-white mb-1">Gestionar Apps</h3>
            <p className="text-sm text-gray-400">Crea y administra tus aplicaciones</p>
          </a>

          <a
            href="/seller/licenses"
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-blue-500/50 transition"
          >
            <Key className="w-8 h-8 text-blue-400 mb-2" />
            <h3 className="font-semibold text-white mb-1">Crear Licencias</h3>
            <p className="text-sm text-gray-400">Genera nuevas licencias</p>
          </a>

          <a
            href="/seller/api"
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-purple-500/50 transition"
          >
            <TrendingUp className="w-8 h-8 text-purple-400 mb-2" />
            <h3 className="font-semibold text-white mb-1">API</h3>
            <p className="text-sm text-gray-400">Accede a tu API key</p>
          </a>
        </div>
      </div>
    </div>
  );
}
