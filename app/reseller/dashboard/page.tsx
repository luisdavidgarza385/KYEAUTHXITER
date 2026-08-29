"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ResellerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalApps: 0,
    totalLicenses: 0,
    totalUsers: 0,
    credits: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/reseller/me");
      const data = await response.json();

      if (!data.success) {
        router.push("/reseller/login");
        return;
      }

      setUser(data.data);
      loadStats();
    } catch (error) {
      router.push("/reseller/login");
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch("/api/reseller/stats");
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/reseller/logout", { method: "POST" });
    router.push("/reseller/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">
                🚀 Panel de Revendedor
              </h1>
              <p className="text-gray-400 text-sm">
                Bienvenido, {user?.username || user?.email}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Créditos</p>
                <p className="text-xl font-bold text-purple-400">
                  {stats.credits}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Mis Aplicaciones</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats.totalApps}
                </p>
              </div>
              <div className="text-4xl">📱</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Licencias Totales</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats.totalLicenses}
                </p>
              </div>
              <div className="text-4xl">🔑</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Usuarios Activos</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Créditos</p>
                <p className="text-3xl font-bold text-purple-400 mt-2">
                  {stats.credits}
                </p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            onClick={() => router.push("/dashboard/apps")}
            className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg transition text-left group"
          >
            <div className="text-3xl mb-3">📱</div>
            <h3 className="text-xl font-bold mb-2">Mis Aplicaciones</h3>
            <p className="text-purple-100 text-sm">
              Crea y gestiona tus aplicaciones
            </p>
            <div className="mt-4 text-sm opacity-0 group-hover:opacity-100 transition">
              Click para acceder →
            </div>
          </button>

          <button
            onClick={() => router.push("/dashboard/licenses")}
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg transition text-left group"
          >
            <div className="text-3xl mb-3">🔑</div>
            <h3 className="text-xl font-bold mb-2">Licencias</h3>
            <p className="text-blue-100 text-sm">
              Genera y administra licencias
            </p>
            <div className="mt-4 text-sm opacity-0 group-hover:opacity-100 transition">
              Click para acceder →
            </div>
          </button>

          <button
            onClick={() => router.push("/dashboard/app-users")}
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg transition text-left group"
          >
            <div className="text-3xl mb-3">👥</div>
            <h3 className="text-xl font-bold mb-2">Usuarios</h3>
            <p className="text-green-100 text-sm">
              Gestiona los usuarios de tus apps
            </p>
            <div className="mt-4 text-sm opacity-0 group-hover:opacity-100 transition">
              Click para acceder →
            </div>
          </button>

          <button
            onClick={() => router.push("/dashboard/variables")}
            className="bg-orange-600 hover:bg-orange-700 text-white p-6 rounded-lg transition text-left group"
          >
            <div className="text-3xl mb-3">⚙️</div>
            <h3 className="text-xl font-bold mb-2">Variables</h3>
            <p className="text-orange-100 text-sm">
              Configura variables de tus apps
            </p>
            <div className="mt-4 text-sm opacity-0 group-hover:opacity-100 transition">
              Click para acceder →
            </div>
          </button>

          <button
            onClick={() => router.push("/dashboard/logs")}
            className="bg-gray-600 hover:bg-gray-700 text-white p-6 rounded-lg transition text-left group"
          >
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-xl font-bold mb-2">Logs</h3>
            <p className="text-gray-100 text-sm">
              Revisa la actividad de tus apps
            </p>
            <div className="mt-4 text-sm opacity-0 group-hover:opacity-100 transition">
              Click para acceder →
            </div>
          </button>

          <button
            onClick={() => router.push("/dashboard/credits")}
            className="bg-pink-600 hover:bg-pink-700 text-white p-6 rounded-lg transition text-left group"
          >
            <div className="text-3xl mb-3">💳</div>
            <h3 className="text-xl font-bold mb-2">Comprar Créditos</h3>
            <p className="text-pink-100 text-sm">
              Recarga créditos para más funciones
            </p>
            <div className="mt-4 text-sm opacity-0 group-hover:opacity-100 transition">
              Click para acceder →
            </div>
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
          <h3 className="text-lg font-bold text-purple-300 mb-2">
            💡 ¿Cómo funciona?
          </h3>
          <ul className="text-gray-300 space-y-2 text-sm">
            <li>✅ Crea aplicaciones para tus clientes</li>
            <li>✅ Genera licencias ilimitadas</li>
            <li>✅ Gestiona usuarios y sus suscripciones</li>
            <li>✅ Usa créditos para acciones premium</li>
            <li>✅ Accede a estadísticas en tiempo real</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
