"use client";
import React, { useState } from "react";
import { Key, Search, Filter, LayoutGrid, Clock, FileText, Trash2, Shield, RotateCcw, Check, Copy, Star } from "lucide-react";
import { LicensesPageActions } from "@/components/LicensesPageActions";
import { LicenseCardMenu } from "@/components/LicenseCardMenu";
import { CopyKeyButton } from "@/components/CopyKeyButton";
import Link from "next/link";

function SubscriptionBadge({ level, packageName }: { level: number; packageName?: string }) {
  let label = "Basic (NEW)";
  let cls = "bg-zinc-900 text-zinc-400 border-zinc-800";
  let isVip = false;

  let subName = "basic";
  if (level === 2) subName = "vip";
  if (level === 3) subName = "combo";

  if (packageName && packageName.trim() !== "" && packageName !== "Bypass") {
    subName = packageName.toLowerCase();
  }

  if (subName === "vip" || subName === "vip (supreme)" || subName === "vip (panel supreme)") {
    label = "VIP (Supreme)";
    cls = "bg-purple-950/20 text-purple-400 border-purple-900/30";
    isVip = true;
  } else if (subName === "combo" || subName === "ultra vip") {
    label = "Ultra VIP";
    cls = "bg-amber-950/20 text-amber-400 border-amber-900/30";
  } else {
    label = "Basic (NEW)";
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-[9px] font-bold border uppercase whitespace-nowrap ${cls}`}>
      {isVip && <Star className="w-2.5 h-2.5 fill-purple-400" />}
      {label}
    </span>
  );
}

function ClientDate({ iso }: { iso: string }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted || !iso) return <span className="opacity-0">00/00/0000 00:00:00</span>;
  
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return <span>{`${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`}</span>;
}

interface App {
  id: string;
  name: string;
}

interface License {
  id: string;
  app_id: string;
  key: string;
  duration_days: number;
  level: number;
  uses: number;
  max_uses: number;
  hwid_lock: boolean;
  ip_lock: boolean;
  status: string;
  used_by: string | null;
  activated_at: string | null;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
  package_name?: string;
  note?: string;
}

export function LicensesPageClient({
  initialLicenses,
  apps,
  defaultAppId,
  adminsById,
  role,
  subscriptionEnd,
}: {
  initialLicenses: License[];
  apps: App[];
  defaultAppId: string;
  adminsById: Record<string, string>;
  role: string;
  subscriptionEnd: string | null;
}) {
  const [licenses, setLicenses] = useState<License[]>(initialLicenses);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAppId, setSelectedAppId] = useState<string>(defaultAppId || "all");
  const [statusFilter, setStatusFilter] = useState<"all" | "unused" | "used" | "banned">("all");
  const [perPage, setPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [sortByDate, setSortByDate] = useState<"desc" | "asc">("desc");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  React.useEffect(() => {
    setLicenses(initialLicenses);
  }, [initialLicenses]);

  // Filtering
  const filtered = licenses.filter((l) => {
    const matchSearch =
      l.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.package_name && l.package_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.note && l.note.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchApp = selectedAppId === "all" || l.app_id === selectedAppId;

    const matchStatus =
      statusFilter === "all" ||
      l.status === statusFilter;

    return matchSearch && matchApp && matchStatus;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    const timeA = new Date(a.created_at).getTime();
    const timeB = new Date(b.created_at).getTime();
    return sortByDate === "desc" ? timeB - timeA : timeA - timeB;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * perPage;
  const paged = sorted.slice(startIndex, startIndex + perPage);

  function exportKeys() {
    const content = sorted.map((l) => l.key).join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `licencias_filtradas_${selectedAppId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleReset() {
    setSearchTerm("");
    setSelectedAppId("all");
    setStatusFilter("all");
    setSortByDate("desc");
    setPage(1);
  }

  function StatusBadge({ status }: { status: string }) {
    const label =
      status === "used" ? "Used" : status === "banned" ? "Banned" : status === "paused" ? "Paused" : "Not Used";
    const cls =
      status === "used"
        ? "bg-purple-950/20 text-purple-400 border-purple-900/30"
        : status === "banned"
        ? "bg-red-950/20 text-red-400 border-red-900/30"
        : status === "paused"
        ? "bg-amber-950/20 text-amber-400 border-amber-900/30"
        : "bg-zinc-900 text-zinc-400 border-zinc-800";
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border whitespace-nowrap ${cls}`}>
        {label}
      </span>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 text-zinc-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-zinc-100">
          <Key className="w-6 h-6 text-purple-400" />
          Licencias
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Las licencias permiten a tus usuarios registrarse y acceder a tus aplicaciones.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
          <input
            type="text"
            placeholder="Buscar licencias..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg bg-zinc-950 border border-zinc-850 pl-10 pr-4 py-2 text-sm text-zinc-200 placeholder:text-zinc-650 focus:outline-none focus:border-purple-500/50 transition-all"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* Toggle status filter */}
          <button
            onClick={() => {
              setStatusFilter(statusFilter === "all" ? "unused" : statusFilter === "unused" ? "used" : statusFilter === "used" ? "banned" : "all");
              setPage(1);
            }}
            title="Filter Status"
            className={`w-9 h-9 rounded-md flex items-center justify-center border transition ${
              statusFilter !== "all"
                ? "border-purple-500/40 bg-purple-950/20 text-purple-400"
                : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
          
          {/* Toggle view mode */}
          <button
            onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
            title="Toggle View Mode"
            className={`w-9 h-9 rounded-md flex items-center justify-center border transition ${
              viewMode === "grid"
                ? "border-purple-500/40 bg-purple-950/20 text-purple-400"
                : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          {/* Toggle sort order */}
          <button
            onClick={() => setSortByDate(sortByDate === "desc" ? "asc" : "desc")}
            title={`Order: ${sortByDate === "desc" ? "Recientes" : "Antiguos"}`}
            className="w-9 h-9 rounded-md flex items-center justify-center border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 transition"
          >
            <Clock className={`w-4 h-4 transition-transform ${sortByDate === "asc" ? "rotate-180" : ""}`} />
          </button>

          {/* Reset Filters */}
          <button
            onClick={handleReset}
            title="Reset Filters"
            className="w-9 h-9 rounded-md flex items-center justify-center border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Export filter */}
          <button
            onClick={exportKeys}
            title="Export to TXT"
            className="w-9 h-9 rounded-md flex items-center justify-center border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 transition"
          >
            <FileText className="w-4 h-4" />
          </button>

          {/* Action buttons (create / delete selected) */}
          <LicensesPageActions
            apps={apps}
            filteredAppId={selectedAppId !== "all" ? selectedAppId : undefined}
            role={role}
            subscriptionEnd={subscriptionEnd}
          />
        </div>
      </div>

      {/* Filter status links */}
      <div className="flex items-center gap-2 flex-wrap text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => {
            setSelectedAppId("all");
            setPage(1);
          }}
          className={`rounded-lg px-3.5 py-1.5 border transition ${
            selectedAppId === "all"
              ? "bg-purple-950/20 border-purple-500/40 text-purple-400"
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
                ? "bg-purple-950/20 border-purple-500/40 text-purple-400"
                : "border-zinc-850 text-zinc-500 hover:text-zinc-350"
            }`}
          >
            {a.name}
          </button>
        ))}
      </div>

      {/* Select limit & total count */}
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
                ? "bg-purple-950/20 border-purple-500/40 text-purple-400"
                : "border-zinc-850 text-zinc-500 hover:text-zinc-350"
            }`}
          >
            {n}
          </button>
        ))}
        <span className="ml-auto">{sorted.length} total</span>
      </div>

      {/* Empty State */}
      {sorted.length === 0 ? (
        <div className="rounded-xl border border-zinc-850 bg-zinc-950/20 py-16 text-center">
          <Key className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400 font-semibold text-sm">No se encontraron licencias</p>
          <p className="text-xs text-zinc-550 mt-1">Usa el botón 'Crear' para generar licencias.</p>
        </div>
      ) : viewMode === "grid" ? (
        // Grid view cards
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paged.map((l) => (
            <div key={l.id} className="relative rounded-xl border border-zinc-800 bg-zinc-950/30 p-5 hover:border-purple-500/20 transition-all flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-zinc-250 truncate max-w-[80%]">{l.key}</span>
                <LicenseCardMenu 
                  license={{ id: l.id, status: l.status, key: l.key }} 
                  onUpdate={(updated) => setLicenses((prev) => prev.map((item) => item.id === l.id ? { ...item, ...updated } : item))}
                  onDelete={() => setLicenses((prev) => prev.filter((item) => item.id !== l.id))}
                />
              </div>
              <div className="text-xs text-zinc-550 space-y-1.5 font-medium">
                <div className="flex items-center gap-1.5">
                  <span>Suscripción:</span>
                  <SubscriptionBadge level={l.level} packageName={l.package_name} />
                </div>
                <div>Creador: <span className="text-zinc-350">{l.created_by ? adminsById[l.created_by] || "—" : "—"}</span></div>
                <div>Duración: <span className="text-zinc-350">{l.duration_days >= 36500 ? "∞" : l.duration_days + "d"}</span></div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Estado</span>
                <StatusBadge status={l.status} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Table view
        <div className="rounded-xl border border-zinc-850 bg-zinc-950/40 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-950 text-zinc-550 text-[10px] font-bold uppercase tracking-wider border-b border-zinc-850">
                <tr>
                  <th className="px-5 py-3.5 w-8">
                    <input type="checkbox" className="accent-purple-500" />
                  </th>
                  <th className="px-5 py-3.5">Key</th>
                  <th className="px-5 py-3.5">Suscripción</th>
                  <th className="px-5 py-3.5">Creador</th>
                  <th className="px-5 py-3.5">Duración</th>
                  <th className="px-5 py-3.5">HWID</th>
                  <th className="px-5 py-3.5">Estado</th>
                  <th className="px-5 py-3.5">Fecha</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/50">
                {paged.map((l) => (
                  <tr key={l.id} className="hover:bg-zinc-900/30 transition">
                    <td className="px-5 py-4">
                      <input type="checkbox" className="accent-purple-500" />
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-zinc-200">
                      <div className="flex items-center gap-2">
                        <code className="text-xs">{l.key.length > 28 ? l.key.slice(0, 28) + "…" : l.key}</code>
                        <CopyKeyButton value={l.key} />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <SubscriptionBadge level={l.level} packageName={l.package_name} />
                    </td>
                    <td className="px-5 py-4 text-zinc-400">{l.created_by ? adminsById[l.created_by] || "—" : "—"}</td>
                    <td className="px-5 py-4 text-zinc-400">{l.duration_days >= 36500 ? "∞" : l.duration_days + "d"}</td>
                    <td className="px-5 py-4 font-mono text-xs text-zinc-500">
                      {l.hwid_lock ? (
                        <span>{l.used_by ? "Locked" : "Yes"}</span>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="px-5 py-4 text-xs text-zinc-500 font-mono">
                      <ClientDate iso={l.created_at} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <LicenseCardMenu 
                        license={{ id: l.id, status: l.status, key: l.key }} 
                        onUpdate={(updated) => setLicenses((prev) => prev.map((item) => item.id === l.id ? { ...item, ...updated } : item))}
                        onDelete={() => setLicenses((prev) => prev.filter((item) => item.id !== l.id))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-zinc-500 font-bold uppercase pt-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="px-4 py-2 rounded-lg border border-zinc-850 bg-zinc-950 text-zinc-400 hover:text-zinc-200 disabled:opacity-40 disabled:pointer-events-none transition"
          >
            Anterior
          </button>
          <span>PÃ¡gina {currentPage} de {totalPages}</span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-lg border border-zinc-850 bg-zinc-950 text-zinc-400 hover:text-zinc-200 disabled:opacity-40 disabled:pointer-events-none transition"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}

