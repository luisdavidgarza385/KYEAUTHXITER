"use client";

import { useState, useEffect } from "react";
import { Trash2, Ban, Shield, Search, RefreshCw, Plus } from "lucide-react";

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

export default function SellerUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [apps, setApps] = useState<App[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: "",
    email: "",
    password: "",
  });

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
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleBanToggle(user: AppUser) {
    const action = user.banned ? "desbanear" : "banear";
    const reason = user.banned ? "" : prompt("Razón del ban:");
    
    if (!user.banned && !reason) return;

    try {
      const res = await fetch(`/api/seller/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          banned: !user.banned,
          ban_reason: reason || null,
        }),
      });

      if (res.ok) {
        loadUsers();
      } else {
        alert(`Error al ${action} usuario`);
      }
    } catch (error) {
      alert(`Error de conexión al ${action} usuario`);
    }
  }

  async function handleDelete(user: AppUser) {
    if (!confirm(`¿Eliminar el usuario "${user.username}"?`)) return;

    try {
      const res = await fetch(`/api/seller/users/${user.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        loadUsers();
      } else {
        alert("Error al eliminar usuario");
      }
    } catch (error) {
      alert("Error de conexión al eliminar usuario");
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    
    if (!selectedAppId) {
      alert("Selecciona una aplicación");
      return;
    }

    try {
      const res = await fetch("/api/seller/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app_id: selectedAppId,
          ...createForm,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setCreateForm({ username: "", email: "", password: "" });
        loadUsers();
        alert("Usuario creado exitosamente");
      } else {
        alert(data.message || "Error al crear usuario");
      }
    } catch (error) {
      alert("Error de conexión al crear usuario");
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Usuarios de Aplicación
          </h1>
          <p className="text-gray-400 text-sm">
            Gestiona los usuarios registrados en tus aplicaciones
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={apps.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Crear Usuario
        </button>
      </div>

      {/* App Selector & Search */}
      <div className="mb-6 flex gap-4 flex-wrap items-center">
        {/* App Selector */}
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

        {/* Search */}
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

        {/* Refresh Button */}
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
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Total Usuarios</div>
            <div className="text-2xl font-bold text-white">{users.length}</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Usuarios Activos</div>
            <div className="text-2xl font-bold text-emerald-400">
              {users.filter((u) => !u.banned).length}
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Usuarios Baneados</div>
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
        <div className="text-center py-12">
          <p className="text-gray-400">
            {searchTerm ? "No se encontraron usuarios" : "No hay usuarios registrados"}
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
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-900/30 transition">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{user.username}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
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
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleBanToggle(user)}
                          className={`p-2 rounded transition ${
                            user.banned
                              ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400"
                              : "bg-red-500/20 hover:bg-red-500/30 text-red-400"
                          }`}
                          title={user.banned ? "Desbanear" : "Banear"}
                        >
                          {user.banned ? (
                            <Shield className="w-4 h-4" />
                          ) : (
                            <Ban className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-2 bg-gray-700 hover:bg-red-500/20 hover:text-red-400 text-gray-400 rounded transition"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Crear Usuario</h2>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre de Usuario *
                </label>
                <input
                  type="text"
                  required
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  placeholder="usuario123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  placeholder="usuario@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contraseña *
                </label>
                <input
                  type="password"
                  required
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <div className="bg-gray-700/50 border border-gray-600 rounded p-3 text-xs text-gray-400">
                Se creará el usuario para la aplicación: <span className="text-white font-medium">{selectedApp?.name}</span>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateForm({ username: "", email: "", password: "" });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
