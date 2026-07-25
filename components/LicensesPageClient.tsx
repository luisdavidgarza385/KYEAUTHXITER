"use client";
import React, { useState } from "react";
import { 
  Key, Search, Filter, LayoutGrid, Clock, FileText, Trash2, Shield, 
  RotateCcw, Check, Copy, Star, ChevronDown, CheckSquare, Square
} from "lucide-react";
import { LicensesPageActions } from "@/components/LicensesPageActions";
import { LicenseCardMenu } from "@/components/LicenseCardMenu";
import { CopyKeyButton } from "@/components/CopyKeyButton";
import Link from "next/link";

export function SubscriptionBadge({ level, packageName }: { level: number; packageName?: string }) {
  let label = "BASIC";
  let cls = "bg-sky-950/40 text-sky-400 border-sky-500/30";
  let isVip = false;

  let subName = "basic";
  if (level === 2) subName = "vip";
  if (level === 3) subName = "combo";

  if (packageName && packageName.trim() !== "" && packageName !== "Bypass") {
    subName = packageName.toLowerCase();
  }

  if (subName === "vip" || subName === "vip (supreme)" || subName === "vip (panel supreme)") {
    label = "VIP";
    cls = "bg-cyan-950/40 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/10";
    isVip = true;
  } else if (subName === "combo" || subName === "ultra vip") {
    label = "ULTRA VIP";
    cls = "bg-blue-950/40 text-blue-300 border-blue-500/40 shadow-sm shadow-blue-500/10";
  } else {
    label = "BASIC";
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-[9px] font-extrabold border uppercase whitespace-nowrap tracking-wider ${cls}`}>
      {isVip && <Star className="w-2.5 h-2.5 fill-cyan-400 text-cyan-400" />}
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
  hasPrefixPerm = false,
}: {
  initialLicenses: License[];
  apps: App[];
  defaultAppId: string;
  adminsById: Record<string, string>;
  role: string;
  subscriptionEnd: string | null;
  hasPrefixPerm?: boolean;
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
    const matchStatus = statusFilter === "all" || l.status === statusFilter;

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
        ? "bg-emerald-950/30 text-emerald-400 border-emerald-500/30"
        : status === "banned"
        ? "bg-red-950/30 text-red-400 border-red-500/30"
        : status === "paused"
        ? "bg-amber-950/30 text-amber-400 border-amber-500/30"
        : "bg-sky-950/30 text-sky-400 border-sky-500/30";
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold border whitespace-nowrap ${cls}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${
          status === "used" ? "bg-emerald-400 shadow-sm shadow-emerald-400" :
          status === "banned" ? "bg-red-400 shadow-sm shadow-red-400" :
          status === "paused" ? "bg-amber-400 shadow-sm shadow-amber-400" :
          "bg-sky-400 shadow-sm shadow-sky-400"
        }`} />
        {label}
      </span>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1450px] mx-auto space-y-6 text-zinc-300">
      
      {/* Top Header Row matching Imagen 3 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-950/40 border border-sky-500/30 flex items-center justify-center shadow-lg shadow-sky-500/10 shrink-0">
            <Key className="w-7 h-7 text-sky-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Licencias</h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Las licencias permiten a tus usuarios registrarse y acceder a tus aplicaciones.
            </p>
          </div>
        </div>

        {/* Right Total Licencias Stat Card with Line Chart (Imagen 3) */}
        <div className="bg-[#050b16]/90 border border-sky-500/30 rounded-2xl p-4 flex items-center justify-between gap-6 shadow-xl shadow-sky-500/10 min-w-[260px] backdrop-blur-md">
          <div>
            <p className="text-3xl font-black text-sky-400 font-mono tracking-tight animate-pulse">
              {selectedAppId === "all" ? licenses.length : licenses.filter((l) => l.app_id === selectedAppId).length}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
              {selectedAppId === "all" ? "TOTAL LICENCIAS (TODAS)" : `LICENCIAS (${apps.find((a) => a.id === selectedAppId)?.name || "APP"})`}
            </p>
          </div>
          <div className="w-24 h-10 relative">
            <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
              <path
                d="M0,35 Q20,20 40,25 T70,10 T100,5"
                fill="none"
                stroke="#00bfff"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="100" cy="5" r="3" fill="#00bfff" className="animate-ping" />
            </svg>
          </div>
        </div>
      </div>

      {/* Toolbar Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-500/70" />
          <input
            type="text"
            placeholder="Buscar licencias..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl bg-[#040812] border border-sky-500/20 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/20 transition-all font-mono"
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
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition ${
              statusFilter !== "all"
                ? "border-sky-400 bg-sky-950/40 text-sky-400"
                : "border-sky-500/20 bg-[#040812] text-zinc-400 hover:text-white"
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
          
          {/* Toggle view mode */}
          <button
            onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
            title="Toggle View Mode"
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition ${
              viewMode === "grid"
                ? "border-sky-400 bg-sky-950/40 text-sky-400"
                : "border-sky-500/20 bg-[#040812] text-zinc-400 hover:text-white"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          {/* Toggle sort order */}
          <button
            onClick={() => setSortByDate(sortByDate === "desc" ? "asc" : "desc")}
            title={`Order: ${sortByDate === "desc" ? "Recientes" : "Antiguos"}`}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-sky-500/20 bg-[#040812] text-zinc-400 hover:text-white transition"
          >
            <Clock className={`w-4 h-4 transition-transform ${sortByDate === "asc" ? "rotate-180" : ""}`} />
          </button>

          {/* Reset Filters */}
          <button
            onClick={handleReset}
            title="Reset Filters"
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-sky-500/20 bg-[#040812] text-zinc-400 hover:text-white transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Export filter */}
          <button
            onClick={exportKeys}
            title="Export to TXT"
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-sky-500/20 bg-[#040812] text-zinc-400 hover:text-white transition"
          >
            <FileText className="w-4 h-4" />
          </button>

          {/* Action buttons (create / delete selected) */}
          <LicensesPageActions
            apps={apps}
            filteredAppId={selectedAppId !== "all" ? selectedAppId : undefined}
            role={role}
            subscriptionEnd={subscriptionEnd}
            hasPrefixPerm={hasPrefixPerm}
          />
        </div>
      </div>

      {/* App Filter Pill Tabs matching Imagen 3 */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap text-xs font-extrabold uppercase tracking-wider">
          <button
            onClick={() => {
              setSelectedAppId("all");
              setPage(1);
            }}
            className={`rounded-xl px-4 py-2 border transition-all ${
              selectedAppId === "all"
                ? "bg-sky-500 text-zinc-950 border-sky-400 shadow-lg shadow-sky-500/25 font-black"
                : "bg-[#040812] border-sky-500/20 text-zinc-400 hover:text-white hover:border-sky-500/40"
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
              className={`rounded-xl px-4 py-2 border transition-all ${
                selectedAppId === a.id
                  ? "bg-sky-500 text-zinc-950 border-sky-400 shadow-lg shadow-sky-500/25 font-black"
                  : "bg-[#040812] border-sky-500/20 text-zinc-400 hover:text-white hover:border-sky-500/40"
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>

        {/* Rows Per Page Selector */}
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="font-bold">Mostrar:</span>
          {[10, 25, 50, 100].map((num) => (
            <button
              key={num}
              onClick={() => {
                setPerPage(num);
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition ${
                perPage === num
                  ? "bg-sky-500 text-zinc-950 border-sky-400"
                  : "bg-[#040812] border-sky-500/20 text-zinc-400 hover:text-white"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table with Glowing Cyan/Sky-Blue Border (Imagen 3) */}
      <div className="relative rounded-2xl border border-sky-500/30 bg-[#040812]/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,191,255,0.1)] overflow-hidden">
        
        {sorted.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 space-y-2">
            <Key className="w-10 h-10 mx-auto text-sky-500/40 animate-pulse" />
            <p className="text-sm font-semibold text-zinc-400">No se encontraron licencias</p>
            <p className="text-xs">Intenta cambiar los filtros o crear una nueva licencia.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead>
                <tr className="border-b border-sky-500/20 bg-sky-950/20 text-[10px] font-extrabold uppercase tracking-wider text-sky-400">
                  <th className="p-4 w-10 text-center">#</th>
                  <th className="p-4">KEY</th>
                  <th className="p-4">SUSCRIPCIÓN</th>
                  <th className="p-4">CREADOR</th>
                  <th className="p-4">DURACIÓN</th>
                  <th className="p-4">HWID</th>
                  <th className="p-4">ESTADO</th>
                  <th className="p-4">FECHA</th>
                  <th className="p-4 text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-500/10">
                {paged.map((l, index) => {
                  const creatorName = l.created_by && adminsById[l.created_by] ? adminsById[l.created_by] : "securex";
                  return (
                    <tr key={l.id} className="hover:bg-sky-500/5 transition-colors group">
                      <td className="p-4 text-center text-zinc-500 font-mono">{startIndex + index + 1}</td>
                      <td className="p-4 font-mono font-bold text-white tracking-wide">
                        <div className="flex items-center gap-2">
                          <span>{l.key}</span>
                          <CopyKeyButton value={l.key} />
                        </div>
                      </td>
                      <td className="p-4">
                        <SubscriptionBadge level={l.level} packageName={l.package_name} />
                      </td>
                      <td className="p-4 font-semibold text-sky-400">
                        {creatorName}
                      </td>
                      <td className="p-4 font-mono text-zinc-400">
                        {l.duration_days}d
                      </td>
                      <td className="p-4 font-bold text-sky-300">
                        {l.hwid_lock ? "Yes" : "No"}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={l.status} />
                      </td>
                      <td className="p-4 font-mono text-zinc-400 text-[11px]">
                        <ClientDate iso={l.created_at} />
                      </td>
                      <td className="p-4 text-right">
                        <LicenseCardMenu license={l} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-zinc-400 pt-2">
          <span>Mostrando {startIndex + 1} a {Math.min(startIndex + perPage, sorted.length)} de {sorted.length} licencias</span>
          <div className="flex items-center gap-2 font-bold">
            <button
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
              className="px-3 py-1.5 rounded-lg border border-sky-500/20 bg-[#040812] disabled:opacity-40 disabled:cursor-not-allowed hover:text-white transition"
            >
              Anterior
            </button>
            <span>Página {currentPage} de {totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
              className="px-3 py-1.5 rounded-lg border border-sky-500/20 bg-[#040812] disabled:opacity-40 disabled:cursor-not-allowed hover:text-white transition"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Footer Branding matching Imagen 3 */}
      <div className="text-center pt-8 border-t border-sky-500/10 text-[11px] text-zinc-500 font-mono flex items-center justify-center gap-2">
        <div className="w-4 h-4 rounded bg-sky-950 border border-sky-500/30 flex items-center justify-center text-[9px] font-bold text-sky-400">SG</div>
        <span>&copy; {new Date().getFullYear()} SecureX Auth. Todos los derechos reservados.</span>
      </div>

    </div>
  );
}
