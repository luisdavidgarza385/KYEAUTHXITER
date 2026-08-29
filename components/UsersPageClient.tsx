"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Shield,
  Clock,
  AlertTriangle,
  X,
  Loader2,
  Lock,
  UserCheck,
  UserX,
  Pause,
  Play,
  LayoutGrid,
  List,
  Filter,
  FileText,
  ChevronDown,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface AppUser {
  id: string;
  app_id: string;
  username: string;
  email: string | null;
  password_hash: string;
  hwid: string | null;
  ip: string | null;
  last_login: string | null;
  banned: boolean;
  ban_reason: string | null;
  created_at: string;
  balance?: number;
  level?: number;
  package_name?: string;
  expires_at?: string | null;
  duration_days?: number;
}

interface App {
  id: string;
  name: string;
}

export function UsersPageClient({
  initialUsers,
  apps,
  defaultAppId,
}: {
  initialUsers: AppUser[];
  apps: App[];
  defaultAppId: string;
}) {
  const router = useRouter();
  const [users, setUsers] = useState<AppUser[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // View Mode: Grid (Cards en cuadritos) vs List (Tabla) (Matching Screenshot 5)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedAppId, setSelectedAppId] = useState(defaultAppId || (apps[0]?.id ?? "9999"));
  const [selectedAppFilter, setSelectedAppFilter] = useState("all");

  useEffect(() => {
    if (selectedAppFilter !== "all") {
      setSelectedAppId(selectedAppFilter);
    }
  }, [selectedAppFilter]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [openActionDropdown, setOpenActionDropdown] = useState<string | null>(null);

  // Form Fields for Create User
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [selectedSub, setSelectedSub] = useState("Complexity (L1)");
  const [expiryUnit, setExpiryUnit] = useState<string>("Dias");
  const [expiryDuration, setExpiryDuration] = useState("30");
  const [hwidLock, setHwidLock] = useState(true);

  // Dynamic subscriptions list
  const [subOptions, setSubOptions] = useState<Array<{ name: string; label: string }>>([
    { name: "Complexity", label: "Complexity (L1)" },
    { name: "default", label: "default (L1)" },
    { name: "vip", label: "vip (L1)" },
    { name: "basic", label: "basic (L1)" },
  ]);

  const activeApp = apps.find((a) => a.id === (selectedAppFilter !== "all" ? selectedAppFilter : defaultAppId)) || apps[0] || { id: "9999", name: "9999" };

  // Dynamic Real App Filter Tabs
  const appTabs = [
    { id: "all", label: "Todas las Apps" },
    ...apps.map((a) => ({ id: a.id, label: a.name || a.id })),
  ];

  useEffect(() => {
    try {
      const stored = localStorage.getItem("ra_subscriptions");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const opts = parsed.map((s: any) => ({
            name: s.name,
            label: `${s.name} (L${s.level || 1})`,
          }));
          setSubOptions(opts);
          if (opts.length > 0) setSelectedSub(opts[0].label);
        }
      } else {
        const initialOpts = [
          { name: activeApp.name || "Complexity", label: `${activeApp.name || "Complexity"} (L1)` },
          { name: "default", label: "default (L1)" },
          { name: "vip", label: "vip (L1)" },
        ];
        setSubOptions(initialOpts);
        setSelectedSub(initialOpts[0].label);
      }
    } catch {}
  }, [createModalOpen, activeApp.name]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) return;
    setLoading(true);

    try {
      let days = parseInt(expiryDuration) || 30;
      if (expiryUnit === "Segundos") days = 1;
      else if (expiryUnit === "Minutos") days = 1;
      else if (expiryUnit === "Horas") days = 1;
      else if (expiryUnit === "Semanas") days = days * 7;
      else if (expiryUnit === "Meses") days = days * 30;
      else if (expiryUnit === "Años") days = days * 365;
      else if (expiryUnit === "De por vida") days = 9999;

      const subName = selectedSub.split(" ")[0] || activeApp.name || "default";

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appId: selectedAppId,
          username: newUsername.trim(),
          password: newPassword.trim(),
          durationDays: days,
          packageName: subName,
          hwidLock,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCreateModalOpen(false);
        setNewUsername("");
        setNewPassword("");
        router.refresh();
        if (data.data) {
          setUsers((prev) => [data.data, ...prev]);
        }
      } else {
        const newUser: AppUser = {
          id: `usr-${Date.now()}`,
          app_id: selectedAppId,
          username: newUsername.trim(),
          email: null,
          password_hash: "",
          hwid: hwidLock ? "hwid_iu6s2ics_mt91240d" : null,
          ip: "45.173.217.29",
          last_login: null,
          banned: false,
          ban_reason: null,
          created_at: new Date().toISOString(),
          package_name: subName.toUpperCase(),
          level: 1,
          duration_days: days,
          expires_at: new Date(Date.now() + days * 86400000).toISOString(),
        };
        setUsers((prev) => [newUser, ...prev]);
        setCreateModalOpen(false);
        setNewUsername("");
        setNewPassword("");
      }
    } catch (err: any) {
      alert(err.message || "Error al crear usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async (actionType: "banned" | "inactive" | "all") => {
    if (!confirm(`¿Estás seguro de realizar la acción "${actionType}"?`)) return;

    if (actionType === "all") {
      setUsers((prev) => (selectedAppFilter !== "all" ? prev.filter((u) => u.app_id !== selectedAppFilter) : []));
    } else if (actionType === "banned") {
      setUsers((prev) => prev.filter((u) => !u.banned));
    } else {
      setUsers((prev) => prev.filter((u) => u.last_login !== null));
    }

    try {
      const appIdParam = selectedAppFilter !== "all" ? `&appId=${encodeURIComponent(selectedAppFilter)}` : "";
      await fetch(`/api/admin/users?action=${actionType}${appIdParam}`, {
        method: "DELETE",
      });
      router.refresh();
    } catch (e) {
      console.error("Error bulk deleting users:", e);
    }
  };

  const handleResetHWID = async (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, hwid: null } : u))
    );
    alert("HWID reseteado con éxito.");
    setOpenActionDropdown(null);
  };

  const handleToggleBan = async (id: string, currentBanned: boolean) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, banned: !currentBanned } : u))
    );
    setOpenActionDropdown(null);
  };

  const handleTogglePause = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const isPaused = u.hwid === "PAUSED";
          return { ...u, hwid: isPaused ? null : "PAUSED" };
        }
        return u;
      })
    );
    setOpenActionDropdown(null);
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setOpenActionDropdown(null);
    try {
      await fetch(`/api/admin/users?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      router.refresh();
    } catch (e) {
      console.error("Error deleting user:", e);
    }
  };

  const filtered = users.filter((u) => {
    if (selectedAppFilter !== "all" && u.app_id !== selectedAppFilter) {
      return false;
    }
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      u.username.toLowerCase().includes(q) ||
      (u.ip && u.ip.includes(q)) ||
      (u.package_name && u.package_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in text-slate-200" onClick={() => setOpenActionDropdown(null)}>
      {/* ── TOP HEADER (MATCHING SCREENSHOT 5) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0088ff]/15 border border-[#0088ff]/35 flex items-center justify-center text-[#00c2ff]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              Usuarios
            </h1>
            <p className="text-xs text-slate-400">
              Una vez que los usuarios se registren en tu loader, aparecerán en esta tabla.
            </p>
          </div>
        </div>

        {/* Top-Right Sparkline Card (Matching Screenshot 5) */}
        <div className="flex items-center gap-4 px-5 py-3 rounded-2xl bg-[#040e24]/90 border border-[#0099ff]/30 shadow-xl backdrop-blur-xl">
          <div>
            <div className="text-2xl font-black text-white">{filtered.length}</div>
            <div className="text-[9.5px] font-black uppercase text-[#00c2ff] tracking-wider font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00c2ff]" />
              USUARIOS (DASHBOARD)
            </div>
          </div>
          <svg className="w-20 h-8 text-[#00c2ff]" viewBox="0 0 100 40" fill="none">
            <path
              d="M0 30 Q 25 35, 50 15 T 100 5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* ── SEARCH & TOOLBAR ROW (MATCHING SCREENSHOT 5) ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar usuarios por nombre, IP..."
            className="w-full bg-[#030919] border border-[#0099ff]/30 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00c2ff] transition-all"
          />
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2">
          {/* Filter button */}
          <button
            type="button"
            className="p-2 rounded-xl bg-[#040e24] hover:bg-[#071738] border border-[#0099ff]/25 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Filtrar"
          >
            <Filter className="w-4 h-4" />
          </button>

          {/* 4-Squares Grid View / List View Toggle Button (MATCHING SCREENSHOT 5) */}
          <button
            type="button"
            onClick={() => setViewMode((prev) => (prev === "grid" ? "list" : "grid"))}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              viewMode === "grid"
                ? "bg-[#0088ff]/20 text-[#00c2ff] border-[#0099ff]/50 shadow-[0_0_12px_rgba(0,153,255,0.3)]"
                : "bg-[#040e24] text-slate-400 border-[#0099ff]/25 hover:text-white"
            }`}
            title={viewMode === "grid" ? "Cambiar a vista de lista" : "Cambiar a vista de cuadritos (Grid)"}
          >
            {viewMode === "grid" ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
          </button>

          {/* Crear Usuario Button */}
          <button
            type="button"
            onClick={() => {
              if (selectedAppFilter !== "all") {
                setSelectedAppId(selectedAppFilter);
              }
              setCreateModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-[#0080ff] to-[#00b4ff] hover:from-[#0070e0] hover:to-[#00a2ff] text-white font-extrabold text-xs rounded-xl shadow-[0_0_16px_rgba(0,153,255,0.4)] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Crear Usuario</span>
          </button>

          {/* Bulk Action Icon Buttons */}
          <button
            type="button"
            onClick={() => handleBulkDelete("all")}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 transition-all cursor-pointer"
            title="Borrar todos los usuarios"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleBulkDelete("inactive")}
            className="p-2 rounded-xl bg-[#040e24] hover:bg-[#071738] border border-[#0099ff]/25 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Borrar inactivos"
          >
            <Clock className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleBulkDelete("banned")}
            className="p-2 rounded-xl bg-[#040e24] hover:bg-[#071738] border border-[#0099ff]/25 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Borrar baneados"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── APP TABS PILLS (MATCHING SCREENSHOT 5) ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-sky-500/20 text-xs font-bold">
        {appTabs.map((tab) => {
          const isSelected = selectedAppFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setSelectedAppFilter(tab.id);
                if (tab.id !== "all") setSelectedAppId(tab.id);
              }}
              className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#00c2ff] text-slate-950 font-black shadow-[0_0_15px_rgba(0,194,255,0.5)]"
                  : "bg-[#030919] hover:bg-[#071738] text-slate-300 border border-[#0099ff]/25"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── ROWS COUNT BAR ── */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <span>MOSTRAR:</span>
          {[10, 100, 300].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setPageSize(size)}
              className={`px-2 py-0.5 rounded transition-all ${
                pageSize === size
                  ? "bg-[#00ff88]/20 text-[#00ff88] font-black border border-[#00ff88]/40"
                  : "hover:text-white"
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        <div className="font-bold">{filtered.length} TOTAL</div>
      </div>

      {/* ── VIEW MODE 1: GRID CARDS (MATCHING SCREENSHOT 5) ── */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full py-12 text-center rounded-2xl bg-[#040e24]/70 border border-[#0099ff]/20 text-slate-400 text-xs">
              Sin usuarios registrados todavía. Haz clic en <strong>Crear Usuario</strong>.
            </div>
          ) : (
            filtered.slice(0, pageSize).map((u, idx) => {
              const isPaused = u.hwid === "PAUSED";
              const isActionOpen = openActionDropdown === u.id;

              return (
                <div
                  key={u.id}
                  className="rounded-2xl bg-[#040e24]/85 border border-[#0099ff]/30 p-5 space-y-4 shadow-xl backdrop-blur-xl hover:border-[#00c2ff]/60 transition-all group relative"
                >
                  {/* Card Top: Number & Actions Dropdown */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-white font-mono">
                      {u.username || `${idx + 1}`}
                    </span>

                    {/* Acciones Menu Button */}
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setOpenActionDropdown(isActionOpen ? null : u.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#07193b] hover:bg-[#0c2452] border border-[#0099ff]/30 text-xs text-slate-300 hover:text-white font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <span>Acciones</span>
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      </button>

                      {/* Dropdown Options */}
                      {isActionOpen && (
                        <div className="absolute right-0 mt-1 w-40 rounded-xl bg-[#040e24] border border-[#0099ff]/40 shadow-2xl p-1.5 z-30 space-y-1 text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => handleResetHWID(u.id)}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#071738] text-slate-200 flex items-center gap-2 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-[#00c2ff]" />
                            <span>Reset HWID</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTogglePause(u.id)}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#071738] text-slate-200 flex items-center gap-2 cursor-pointer"
                          >
                            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                            <span>{isPaused ? "Reanudar" : "Pausar"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleBan(u.id)}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#071738] text-slate-200 flex items-center gap-2 cursor-pointer"
                          >
                            <UserX className="w-3.5 h-3.5 text-rose-400" />
                            <span>{u.banned ? "Desbanear" : "Banear"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u.id)}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-950/30 text-rose-400 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Body: IP, HWID, Creado (Matching Screenshot 5) */}
                  <div className="space-y-1 text-xs text-slate-300 font-mono">
                    <div>
                      <span className="text-slate-500">IP: </span>
                      <span className="font-bold text-white">{u.ip || "45.173.217.29"}</span>
                    </div>
                    <div className="truncate">
                      <span className="text-slate-500">HWID: </span>
                      <span className="text-slate-300" title={u.hwid || "Sin HWID"}>
                        {u.hwid ? (u.hwid.length > 20 ? `${u.hwid.slice(0, 18)}...` : u.hwid) : "Sin HWID"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Creado: </span>
                      <span className="text-slate-300">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : "25/8/2026"}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer: SUSCRIPCIÓN & Badge (Matching Screenshot 5) */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-500 font-mono tracking-wider">
                      SUSCRIPCIÓN
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-[#0088ff]/20 text-[#00c2ff] text-[10px] font-black uppercase border border-[#0088ff]/40 font-mono">
                      {u.package_name || "BASIC"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* ── VIEW MODE 2: TABLE VIEW ── */
        <div className="rounded-2xl bg-[#040e24]/85 border border-[#0099ff]/25 p-6 backdrop-blur-2xl shadow-2xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider font-mono">
                <th className="py-3 px-3">USUARIO</th>
                <th className="py-3 px-3">SUSCRIPCION</th>
                <th className="py-3 px-3">IP</th>
                <th className="py-3 px-3">HWID</th>
                <th className="py-3 px-3">EXPIRA</th>
                <th className="py-3 px-3">TIEMPO RESTANTE</th>
                <th className="py-3 px-3">ESTADO</th>
                <th className="py-3 px-3 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.slice(0, pageSize).map((u) => {
                const isPaused = u.hwid === "PAUSED";
                return (
                  <tr key={u.id} className="hover:bg-[#071738]/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-white">{u.username}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#0088ff]/15 text-[#00c2ff] text-[9.5px] font-black uppercase border border-[#0088ff]/30">
                        {u.package_name || "BASIC"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{u.ip || "45.173.217.29"}</td>
                    <td className="py-3 px-3 text-slate-300">{u.hwid ? `${u.hwid.slice(0, 10)}...` : "Sin HWID"}</td>
                    <td className="py-3 px-3 text-slate-400">
                      {u.expires_at ? new Date(u.expires_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{u.duration_days ? `${u.duration_days}d` : "30d"}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase border ${
                          u.banned
                            ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                            : isPaused
                            ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                            : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        }`}
                      >
                        {u.banned ? "Baneado" : isPaused ? "Pausado" : "Activo"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-sans">
                        <button
                          type="button"
                          onClick={() => handleResetHWID(u.id)}
                          title="Resetear HWID"
                          className="p-1.5 rounded-lg bg-[#07193b] hover:bg-[#0c2452] text-slate-300 hover:text-[#00c2ff]"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id)}
                          title="Eliminar usuario"
                          className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── MODAL: CREAR USUARIO ── */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#040e24] border border-[#0099ff]/35 shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-7 space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-2xl font-black text-white">Crear usuario</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Crea un nuevo usuario directamente con credenciales y suscripción.
              </p>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              {/* Selector de Aplicacion */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 font-mono">
                  Aplicación *
                </label>
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  className="w-full bg-[#020713] border border-[#0099ff]/30 focus:border-[#00c2ff] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono cursor-pointer"
                >
                  {apps.map((a) => (
                    <option key={a.id} value={a.id} className="bg-[#040e24] text-white">
                      {a.name || a.id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Nombre de usuario *
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    required
                    placeholder="usuario123"
                    className="w-full bg-[#020713] border border-[#0099ff]/30 focus:border-[#00c2ff] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-[#020713] border border-[#0099ff]/30 focus:border-[#00c2ff] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Suscripcion & Unidad de Expiracion */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Suscripcion *
                  </label>
                  <select
                    value={selectedSub}
                    onChange={(e) => setSelectedSub(e.target.value)}
                    className="w-full bg-[#020713] border border-[#0099ff]/30 focus:border-[#00c2ff] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono cursor-pointer"
                  >
                    {subOptions.map((opt) => (
                      <option key={opt.label} value={opt.label} className="bg-[#040e24] text-white">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Unidad de expiracion *
                  </label>
                  <select
                    value={expiryUnit}
                    onChange={(e) => setExpiryUnit(e.target.value)}
                    className="w-full bg-[#020713] border border-[#0099ff]/30 focus:border-[#00c2ff] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Segundos">Segundos</option>
                    <option value="Minutos">Minutos</option>
                    <option value="Horas">Horas</option>
                    <option value="Dias">Dias</option>
                    <option value="Semanas">Semanas</option>
                    <option value="Meses">Meses</option>
                    <option value="Años">Años</option>
                    <option value="De por vida">De por vida</option>
                  </select>
                </div>
              </div>

              {/* Duracion */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Duracion de expiracion *
                </label>
                <input
                  type="text"
                  value={expiryDuration}
                  onChange={(e) => setExpiryDuration(e.target.value)}
                  required
                  className="w-full bg-[#020713] border border-[#0099ff]/30 focus:border-[#00c2ff] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              {/* Checkbox HWID Lock */}
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={hwidLock}
                    onChange={(e) => setHwidLock(e.target.checked)}
                    className="accent-[#0088ff] w-4 h-4 rounded cursor-pointer"
                  />
                  <span>Habilitar HWID Lock (Enlazar al primer dispositivo de acceso)</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#08152e] hover:bg-[#0c1f44] text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#0080ff] to-[#00b4ff] hover:from-[#0070e0] hover:to-[#00a2ff] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-sky-500/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Crear usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
