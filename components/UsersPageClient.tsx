"use client";
import React, { useState } from "react";
import { Users, Search, Filter, LayoutGrid, Clock, RotateCcw, FileText, Trash2, ShieldCheck, Star } from "lucide-react";
import { UserCardMenu } from "@/components/UserCardMenu";
import { CreateUserInlineButton, BulkDeleteUsersModal } from "@/components/CreateMenu";
import Link from "next/link";
import { SubscriptionBadge } from "./LicensesPageClient";

function ClientDate({ iso }: { iso: string }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted || !iso) return <span className="opacity-0">00/00/0000 00:00:00</span>;
  
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return <span>{`${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`}</span>;
}

function ClientDateShort({ iso }: { iso: string }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted || !iso) return <span className="opacity-0">00/00/0000</span>;
  
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return <span>{`${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`}</span>;
}

interface App {
  id: string;
  name: string;
}

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
  const [users, setUsers] = useState<AppUser[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAppId, setSelectedAppId] = useState<string>(defaultAppId || "all");
  const [bannedFilter, setBannedFilter] = useState<"all" | "active" | "banned">("all");
  const [perPage, setPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [sortByDate, setSortByDate] = useState<"desc" | "asc">("desc");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [bulkOpen, setBulkOpen] = useState(false);

  React.useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  // Filtering logic
  const filteredUsers = users.filter((u) => {
    // Search query matching
    const matchSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.ip && u.ip.includes(searchTerm)) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));

    // App matching
    const matchApp = selectedAppId === "all" || u.app_id === selectedAppId;

    // Banned matching
    const matchBanned =
      bannedFilter === "all" ||
      (bannedFilter === "banned" && u.banned) ||
      (bannedFilter === "active" && !u.banned);

    return matchSearch && matchApp && matchBanned;
  });

  // Sorting
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const timeA = new Date(a.created_at).getTime();
    const timeB = new Date(b.created_at).getTime();
    return sortByDate === "desc" ? timeB - timeA : timeA - timeB;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * perPage;
  const pagedUsers = sortedUsers.slice(startIndex, startIndex + perPage);

  function exportUsers() {
    const content = sortedUsers
      .map((u) => `User: ${u.username} | IP: ${u.ip || "N/A"} | HWID: ${u.hwid || "N/A"} | Level: ${u.level === 2 ? "VIP" : "Basic"}`)
      .join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `usuarios_exportados_${selectedAppId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleReset() {
    setSearchTerm("");
    setSelectedAppId("all");
    setBannedFilter("all");
    setSortByDate("desc");
    setPage(1);
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 text-zinc-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-zinc-100">
          <Users className="w-6 h-6 text-emerald-400" />
          Usuarios
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Una vez que los usuarios se registren en tu loader, aparecerán en esta tabla.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
          <input
            type="text"
            placeholder="Buscar usuarios por nombre, IP..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg bg-zinc-950 border border-zinc-850 pl-10 pr-4 py-2 text-sm text-zinc-200 placeholder:text-zinc-650 focus:outline-none focus:border-emerald-500/50 transition-all"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* Toggle Banned filter */}
          <button
            onClick={() => {
              setBannedFilter(bannedFilter === "all" ? "banned" : bannedFilter === "banned" ? "active" : "all");
              setPage(1);
            }}
            title="Filter Status"
            className={`w-9 h-9 rounded-md flex items-center justify-center border transition ${
              bannedFilter !== "all"
                ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-400"
                : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
          
          {/* Toggle View Mode */}
          <button
            onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
            title="Toggle View Mode"
            className={`w-9 h-9 rounded-md flex items-center justify-center border transition ${
              viewMode === "grid"
                ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-400"
                : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          {/* User Inline Creation */}
          <CreateUserInlineButton
            apps={apps}
            defaultAppId={selectedAppId !== "all" ? selectedAppId : undefined}
            className="w-9 h-9 rounded-md flex items-center justify-center border border-emerald-500/40 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-900/30 transition"
          />

          {/* Bulk Delete Users Button */}
          <button
            onClick={() => setBulkOpen(true)}
            className="w-9 h-9 rounded-md flex items-center justify-center border border-danger/40 bg-danger/10 text-danger hover:bg-danger/20 transition"
            title="Eliminar usuarios"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Toggle Sort by Date */}
          <button
            onClick={() => setSortByDate(sortByDate === "desc" ? "asc" : "desc")}
            title={`Order: ${sortByDate === "desc" ? "Recientes" : "Antiguos"}`}
            className="w-9 h-9 rounded-md flex items-center justify-center border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 transition"
          >
            <Clock className={`w-4 h-4 transition-transform ${sortByDate === "asc" ? "rotate-180" : ""}`} />
          </button>

          {/* Reset Search / Filters */}
          <button
            onClick={handleReset}
            title="Reset Filters"
            className="w-9 h-9 rounded-md flex items-center justify-center border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Export Filtered Users */}
          <button
            onClick={exportUsers}
            title="Export to TXT"
            className="w-9 h-9 rounded-md flex items-center justify-center border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 transition"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* App Filters */}
      {apps.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => {
              setSelectedAppId("all");
              setPage(1);
            }}
            className={`rounded-lg px-3.5 py-1.5 border transition ${
              selectedAppId === "all"
                ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-400"
                : "border-zinc-850 text-zinc-500 hover:text-zinc-350"
            }`}
          >
            Todas las Apps
          </button>
          {apps.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                setSelectedAppId(a.id);
                setPage(1);
              }}
              className={`rounded-lg px-3.5 py-1.5 border transition ${
                selectedAppId === a.id
                  ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-400"
                  : "border-zinc-850 text-zinc-500 hover:text-zinc-350"
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>
      )}

      {/* Select All and Total Count */}
      <div className="flex items-center gap-2 text-xs text-zinc-550 font-bold uppercase">
        <span>Mostrar:</span>
        {[10, 100, 300].map((n) => (
          <button
            key={n}
            onClick={() => {
              setPerPage(n);
              setPage(1);
            }}
            className={`px-2 py-1 rounded border transition ${
              perPage === n
                ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-400"
                : "border-zinc-850 text-zinc-500 hover:text-zinc-350"
            }`}
          >
            {n}
          </button>
        ))}
        <span className="ml-auto">{sortedUsers.length} total</span>
      </div>

      {/* Empty State */}
      {sortedUsers.length === 0 ? (
        <div className="rounded-xl border border-zinc-850 bg-zinc-950/20 py-16 text-center">
          <Users className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400 font-semibold text-sm">No se encontraron usuarios</p>
          <p className="text-xs text-zinc-550 mt-1">Crea un usuario manualmente o registra uno usando la API.</p>
        </div>
      ) : viewMode === "grid" ? (
        // Grid View
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pagedUsers.map((u) => {
            const isPaused = u.hwid === "PAUSED";
            return (
              <div key={u.id} className="relative rounded-xl border border-zinc-800 bg-zinc-950/30 p-5 hover:border-emerald-500/20 transition-all flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-150 text-sm">{u.username}</span>
                  <UserCardMenu
                    user={{ id: u.id, banned: u.banned, paused: isPaused, username: u.username, balance: u.balance }}
                    onUpdate={(updated) => setUsers((prev) => prev.map((item) => item.id === u.id ? { ...item, ...updated } : item))}
                    onDelete={() => setUsers((prev) => prev.filter((item) => item.id !== u.id))}
                  />
                </div>
                <div className="text-xs text-zinc-500 space-y-1 font-medium">
                  <div>IP: <span className="font-mono text-zinc-400">{u.ip || "—"}</span></div>
                  <div>HWID: <span className="font-mono text-zinc-400">{u.hwid || "No enlazado"}</span></div>
                  <div>Creado: <span className="text-zinc-400">{new Date(u.created_at).toLocaleDateString()}</span></div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
                  <span className="text-[10px] uppercase font-bold text-zinc-500">Suscripción</span>
                  <SubscriptionBadge level={u.level || 1} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Table View
        <div className="rounded-xl border border-zinc-850 bg-zinc-950/40 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-950 text-zinc-550 text-[10px] font-bold uppercase tracking-wider border-b border-zinc-850">
                <tr>
                  <th className="px-5 py-3.5 w-8">
                    <input type="checkbox" className="accent-emerald-500" />
                  </th>
                  <th className="px-5 py-3.5">Usuario</th>
                  <th className="px-5 py-3.5">Suscripción</th>
                  <th className="px-5 py-3.5">IP</th>
                  <th className="px-5 py-3.5">HWID / 2FA</th>
                  <th className="px-5 py-3.5">Último Acceso</th>
                  <th className="px-5 py-3.5">Creado El</th>
                  <th className="px-5 py-3.5">Estado</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/50">
                {pagedUsers.map((u) => {
                  const isPaused = u.hwid === "PAUSED";
                  const status = u.banned ? "Baneado" : isPaused ? "Pausado" : "Activo";

                  return (
                    <tr key={u.id} className="hover:bg-zinc-900/30 transition">
                      <td className="px-5 py-4">
                        <input type="checkbox" className="accent-emerald-500" />
                      </td>
                      <td className="px-5 py-4 font-bold text-zinc-200">{u.username}</td>
                      <td className="px-5 py-4">
                        <SubscriptionBadge level={u.level || 1} />
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-zinc-400">{u.ip || "—"}</td>
                      <td className="px-5 py-4 font-mono text-xs text-zinc-500">
                        {u.hwid && u.hwid !== "PAUSED" ? (
                          <span title={u.hwid}>{u.hwid.slice(0, 15)}...</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-zinc-400 font-mono">
                        {u.last_login ? <ClientDate iso={u.last_login} /> : "Nunca"}
                      </td>
                      <td className="px-5 py-4 text-xs text-zinc-500 font-mono">
                        <ClientDateShort iso={u.created_at} />
                      </td>
                      <td className="px-5 py-4">
                        {u.banned ? (
                          <span className="inline-flex items-center gap-1 rounded bg-red-950/20 border border-red-900/30 px-2 py-0.5 text-[10px] font-bold text-red-400 uppercase">
                            Baneado
                          </span>
                        ) : isPaused ? (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-950/20 border border-amber-900/30 px-2 py-0.5 text-[10px] font-bold text-amber-400 uppercase">
                            Pausado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">
                            Activo
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <UserCardMenu
                          user={{ id: u.id, banned: u.banned, paused: isPaused, username: u.username, balance: u.balance }}
                          onUpdate={(updated) => setUsers((prev) => prev.map((item) => item.id === u.id ? { ...item, ...updated } : item))}
                          onDelete={() => setUsers((prev) => prev.filter((item) => item.id !== u.id))}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-zinc-500 font-bold uppercase pt-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="px-4 py-2 rounded-lg border border-zinc-850 bg-zinc-950 text-zinc-400 hover:text-zinc-200 disabled:opacity-40 disabled:pointer-events-none transition"
          >
            Anterior
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-lg border border-zinc-850 bg-zinc-950 text-zinc-400 hover:text-zinc-200 disabled:opacity-40 disabled:pointer-events-none transition"
          >
            Siguiente
          </button>
        </div>
      )}
      {bulkOpen && (
        <BulkDeleteUsersModal apps={apps} onClose={() => setBulkOpen(false)} />
      )}
    </div>
  );
}
