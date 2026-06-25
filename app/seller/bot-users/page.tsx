"use client";

import { useState, useEffect } from "react";
import { Users, Search, RefreshCw, Bot } from "lucide-react";

interface AppUser {
  id: string;
  app_id: string;
  username: string;
  email?: string;
  hwid?: string;
  ip?: string;
  last_login?: string;
  banned: boolean;
  ban_reason?: string;
  created_at: string;
}

interface App {
  id: string;
  name: string;
  app_id: string;
}

export default function BotUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [apps, setApps] = useState<App[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadApps();
  }, []);

  useEffect(() => {
    if (selectedAppId) {
      loadUsers();
    }
  }, [selectedAppId]);

  async function loadApps() {
    try {
      const res = await fetch("/api/seller/apps");
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        setApps(data.data);
        setSelectedAppId(data.data[0].id);
      }
    } catch (error) {
      console.error("Error loading apps:", error);
    }
  }

  async function loadUsers() {
    if (!selectedAppId) return;
    
    try {
      setLoading(true);
      const res = await fetch(`/api/seller/users?app_id=${selectedAppId}`);
      const data = await res.json();
      if (data.success) {
        // In a real implementation, you'd filter bot-created users here
        // For now, showing all users as we don't have a bot flag yet
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedApp = apps.find((a) => a.id === selectedAppId);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Bot className="w-8 h-8 text-blue-400" />
          <h1 className="text-2xl font-bold text-white">Usuarios de Bot</h1>
        </div>
        <p className="text-gray-400 text-sm">
          Vista simplificada de usuarios creados automáticamente por el Discord Bot
        </p>
      </div>

      {/* App Selector & Search */}
      <div className="mb-6 flex gap-4 flex-wrap items-center">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-gray-400 mb-2">Aplicación</label>
          <select
            value={selectedAppId}
            onChange={(e) => setSelectedAppId(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            {apps.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-gray-400 mb-2">Buscar</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Usuario o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
        </div>

        <div className="flex items-end">
          <button
            onClick={loadUsers}
            disabled={loading}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Stats */}
      {selectedApp && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 border border-blue-700/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Total Usuarios</div>
            <div className="text-2xl font-bold text-blue-400">{users.length}</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Activos</div>
            <div className="text-2xl font-bold text-emerald-400">
              {users.filter((u) => !u.banned).length}
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Baneados</div>
            <div className="text-2xl font-bold text-red-400">
              {users.filter((u) => u.banned).length}
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Cargando...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 border border-gray-700 rounded-lg">
          <Bot className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">
            {searchTerm ? "No se encontraron usuarios" : "Aún no hay usuarios registrados"}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Los usuarios aparecerán aquí cuando se registren a través de la aplicación
          </p>
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    HWID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Último Login
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Registrado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-900/30 transition">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{user.username}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {user.email || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs text-gray-400 font-mono">
                        {user.hwid ? user.hwid.substring(0, 12) + "..." : "-"}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      {user.banned ? (
                        <div>
                          <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-red-500/20 text-red-400">
                            Baneado
                          </span>
                          {user.ban_reason && (
                            <div className="text-xs text-gray-500 mt-1">
                              {user.ban_reason}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-emerald-500/20 text-emerald-400">
                          Activo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleString()
                        : "Nunca"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
