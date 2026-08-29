"use client";

import React, { useState, useEffect } from "react";
import {
  Key,
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
  CheckCircle2,
  Pause,
  Play,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
}

interface App {
  id: string;
  name: string;
}

export function LicensesPageClient({
  initialLicenses,
  apps,
  defaultAppId,
  adminsById,
  role,
}: {
  initialLicenses: License[];
  apps: App[];
  defaultAppId: string;
  adminsById: Record<string, string>;
  role: string;
  subscriptionEnd?: string | null;
  hasPrefixPerm?: boolean;
}) {
  const router = useRouter();
  const [licenses, setLicenses] = useState<License[]>(initialLicenses);
  const [searchQuery, setSearchQuery] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Result modal for generated licenses
  const [generatedKeys, setGeneratedKeys] = useState<string[] | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const [selectedAppId, setSelectedAppId] = useState(defaultAppId || (apps[0]?.id ?? "9999"));
  const [selectedAppFilter, setSelectedAppFilter] = useState("all");

  // Modal Fields (Matching Image 1)
  const [count, setCount] = useState(1);
  const [mask, setMask] = useState("******_******_******");
  const [maxUses, setMaxUses] = useState(1);
  const [selectedSub, setSelectedSub] = useState("Complexity (L1)");
  const [caseFormat, setCaseFormat] = useState<"upper" | "lower">("upper");
  const [expiryUnit, setExpiryUnit] = useState<string>("Dias");
  const [expiryDuration, setExpiryDuration] = useState("30");

  // Dynamic subscriptions list
  const [subOptions, setSubOptions] = useState<Array<{ name: string; label: string }>>([
    { name: "Complexity", label: "Complexity (L1)" },
    { name: "default", label: "default (L1)" },
    { name: "vip", label: "vip (L1)" },
    { name: "basic", label: "basic (L1)" },
  ]);

  const activeApp = apps.find((a) => a.id === (selectedAppFilter !== "all" ? selectedAppFilter : defaultAppId)) || apps[0] || { id: "9999", name: "9999" };

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

  const handleCopyKey = (k: string) => {
    navigator.clipboard.writeText(k);
    setCopiedKey(k);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleCopyAllGenerated = () => {
    if (!generatedKeys) return;
    navigator.clipboard.writeText(generatedKeys.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCreateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const targetApp = apps.find((a) => a.id === selectedAppId);
      const appName = targetApp?.name || "";

      const res = await fetch("/api/admin/licenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appId: selectedAppId,
          count,
          durationDays: days,
          level: 1,
          maxUses,
          hwidLock: true,
          packageName: subName,
          mask,
          prefix: appName,
          case: caseFormat,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCreateModalOpen(false);
        setGeneratedKeys(data.data.keys);
        router.refresh();

        const newLicList = data.data.keys.map((k: string, idx: number) => ({
          id: `lic-${Date.now()}-${idx}`,
          app_id: selectedAppId,
          key: k,
          duration_days: days,
          level: 1,
          uses: 0,
          max_uses: maxUses,
          hwid_lock: true,
          ip_lock: false,
          status: "unused",
          used_by: null,
          activated_at: null,
          expires_at: null,
          created_by: "Admin",
          created_at: new Date().toISOString(),
          package_name: subName,
        }));
        setLicenses((prev) => [...newLicList, ...prev]);
      } else {
        // Fallback local key generation
        const generated: string[] = [];
        for (let i = 0; i < count; i++) {
          const raw = `${Math.random().toString(36).substring(2, 8)}-${Math.random().toString(36).substring(2, 8)}-${Math.random().toString(36).substring(2, 8)}`;
          const formatted = caseFormat === "upper" ? raw.toUpperCase() : raw.toLowerCase();
          generated.push(formatted);
        }

        const newLicList = generated.map((k, idx) => ({
          id: `lic-${Date.now()}-${idx}`,
          app_id: selectedAppId,
          key: k,
          duration_days: days,
          level: 1,
          uses: 0,
          max_uses: maxUses,
          hwid_lock: true,
          ip_lock: false,
          status: "unused",
          used_by: null,
          activated_at: null,
          expires_at: null,
          created_by: "Admin",
          created_at: new Date().toISOString(),
          package_name: subName,
        }));

        setLicenses((prev) => [...newLicList, ...prev]);
        setGeneratedKeys(generated);
        setCreateModalOpen(false);
      }
    } catch (err: any) {
      alert(err.message || "Error al crear licencias");
    } finally {
      setLoading(false);
    }
  };

  const handlePauseAllLicenses = async () => {
    setLicenses((prev) =>
      prev.map((l) => (l.status === "active" ? { ...l, status: "paused" } : l))
    );
    try {
      await fetch("/api/admin/licenses/bulk-pause", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId: activeApp.id, action: "pause" }),
      });
      router.refresh();
    } catch {}
  };

  const handleResumeAllLicenses = async () => {
    setLicenses((prev) =>
      prev.map((l) => (l.status === "paused" ? { ...l, status: "active" } : l))
    );
    try {
      await fetch("/api/admin/licenses/bulk-pause", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId: activeApp.id, action: "resume" }),
      });
      router.refresh();
    } catch {}
  };

  const handleToggleSingleLicense = (id: string) => {
    setLicenses((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          const isPaused = l.status === "paused";
          return { ...l, status: isPaused ? "active" : "paused" };
        }
        return l;
      })
    );
  };

  const handleDeleteSingleLicense = async (id: string) => {
    if (!confirm("¿Eliminar esta licencia?")) return;
    setLicenses((prev) => prev.filter((item) => item.id !== id));
    try {
      await fetch(`/api/admin/licenses/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      router.refresh();
    } catch (e) {
      console.error("Error deleting license:", e);
    }
  };

  const handleBulkDelete = async (actionType: "expired" | "unused" | "all") => {
    if (!confirm(`¿Estás seguro de realizar la acción "${actionType}"?`)) return;

    if (actionType === "all") {
      setLicenses((prev) => (selectedAppFilter !== "all" ? prev.filter((l) => l.app_id !== selectedAppFilter) : []));
    } else if (actionType === "unused") {
      setLicenses((prev) => prev.filter((l) => l.status !== "unused"));
    } else {
      setLicenses((prev) => prev.filter((l) => l.status !== "expired"));
    }

    try {
      const appId = selectedAppFilter !== "all" ? selectedAppFilter : undefined;
      await fetch("/api/admin/licenses/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId, mode: actionType }),
      });
      router.refresh();
    } catch (e) {
      console.error("Error bulk deleting licenses:", e);
    }
  };

  const filtered = licenses.filter((l) => {
    if (selectedAppFilter !== "all" && l.app_id !== selectedAppFilter) {
      return false;
    }
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      l.key.toLowerCase().includes(q) ||
      (l.used_by && l.used_by.toLowerCase().includes(q)) ||
      (l.package_name && l.package_name.toLowerCase().includes(q)) ||
      (l.status && l.status.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in text-slate-200">
      {/* ── HEADER BANNER ── */}
      <div className="rounded-2xl bg-[#040e24]/85 border border-[#0099ff]/25 p-6 backdrop-blur-2xl shadow-2xl relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#00ff88]/15 text-[#00ff88] text-[9.5px] font-black border border-[#00ff88]/30">
                • {role === "admin" ? "Admin: SpectralX" : `Rol: ${role}`}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#0088ff]/15 text-[#00c2ff] text-[9.5px] font-black border border-[#0088ff]/30">
                {activeApp.name || "9999"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[9.5px] font-black border border-emerald-500/30">
                Activa
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Licencias</h1>
            <p className="text-xs text-slate-400 mt-1">
              Genera licencias con mascara personalizada, case y unidad de expiracion.
            </p>
          </div>

          <div className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest">
            SECUREXAUTH.COM
          </div>
        </div>
      </div>

      {/* ── APP FILTER TABS (MATCHING USERS PAGE) ── */}
      {appTabs.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {appTabs.map((tab) => {
            const isSelected = selectedAppFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedAppFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all uppercase font-mono cursor-pointer ${
                  isSelected
                    ? "bg-[#00c2ff] text-black shadow-[0_0_12px_rgba(0,194,255,0.4)]"
                    : "bg-[#040e24] hover:bg-[#071738] text-slate-400 hover:text-white border border-[#0099ff]/20"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ── SECTION: CREAR LICENCIAS BAR ── */}
      <div className="rounded-2xl bg-[#040e24]/85 border border-[#0099ff]/25 p-4 backdrop-blur-2xl shadow-xl flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-extrabold text-white">Crear licencias</h3>
        
        <div className="flex items-center gap-2">
          {/* Pause All / Resume All (Requested by User) */}
          <button
            type="button"
            onClick={handlePauseAllLicenses}
            className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>Pausar todas</span>
          </button>
          <button
            type="button"
            onClick={handleResumeAllLicenses}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Reanudar todas</span>
          </button>

          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-[#0080ff] to-[#00b4ff] hover:from-[#0070e0] hover:to-[#00a2ff] text-white font-extrabold text-xs tracking-wide rounded-xl shadow-[0_0_18px_rgba(0,153,255,0.45)] transition-all cursor-pointer"
          >
            Crear licencia
          </button>
        </div>
      </div>

      {/* ── SECTION: LICENCIAS TABLE ── */}
      <div className="rounded-2xl bg-[#040e24]/85 border border-[#0099ff]/25 p-6 backdrop-blur-2xl shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-white tracking-tight">Licencias</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {filtered.length} licencias en {activeApp.name || "9999"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Search Input with Magnifying Glass */}
            <div className="relative flex-1 sm:w-64 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar o pegar clave de licencia..."
                className="w-full bg-[#020713]/90 border border-[#0099ff]/30 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00c2ff] font-mono"
              />
            </div>

            {/* Mass Actions */}
            <button
              type="button"
              onClick={() => handleBulkDelete("expired")}
              className="px-3 py-1.5 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
            >
              Borrar expiradas
            </button>
            <button
              type="button"
              onClick={() => handleBulkDelete("unused")}
              className="px-3 py-1.5 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
            >
              Borrar no usadas
            </button>
            <button
              type="button"
              onClick={() => handleBulkDelete("all")}
              className="px-3 py-1.5 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
            >
              Borrar todas
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider font-mono">
                <th className="py-3 px-3">CLAVE</th>
                <th className="py-3 px-3">GENERADO POR</th>
                <th className="py-3 px-3">DURACION</th>
                <th className="py-3 px-3">EXPIRA</th>
                <th className="py-3 px-3">TIEMPO RESTANTE</th>
                <th className="py-3 px-3">SUSCRIPCION</th>
                <th className="py-3 px-3">USOS</th>
                <th className="py-3 px-3">USUARIO</th>
                <th className="py-3 px-3">HWID</th>
                <th className="py-3 px-3">ESTADO</th>
                <th className="py-3 px-3 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400 text-xs">
                    Sin licencias que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filtered.map((l) => {
                  const isPaused = l.status === "paused";
                  return (
                    <tr key={l.id} className="hover:bg-[#071738]/40 transition-colors">
                      {/* Clave */}
                      <td className="py-3 px-3 font-bold text-white">
                        <div className="flex items-center gap-1.5">
                          <span className="tracking-wider">{l.key}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyKey(l.key)}
                            className="p-1 text-slate-400 hover:text-[#00c2ff] transition-colors cursor-pointer"
                          >
                            {copiedKey === l.key ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Generado Por */}
                      <td className="py-3 px-3 text-slate-300">
                        {l.created_by ? adminsById[l.created_by] || l.created_by : "Admin"}
                      </td>

                      {/* Duracion */}
                      <td className="py-3 px-3 text-slate-300">{l.duration_days} días</td>

                      {/* Expira */}
                      <td className="py-3 px-3 text-slate-400">
                        {l.expires_at ? new Date(l.expires_at).toLocaleDateString() : "—"}
                      </td>

                      {/* Tiempo restante */}
                      <td className="py-3 px-3 text-slate-300">{l.duration_days}d</td>

                      {/* Suscripcion */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-[#0088ff]/15 text-[#00c2ff] text-[9.5px] font-black uppercase border border-[#0088ff]/30">
                          {l.package_name || "Complexity"}
                        </span>
                      </td>

                      {/* Usos */}
                      <td className="py-3 px-3 text-slate-400">
                        {l.uses} / {l.max_uses || 1}
                      </td>

                      {/* Usuario */}
                      <td className="py-3 px-3 text-slate-300">{l.used_by || "—"}</td>

                      {/* HWID */}
                      <td className="py-3 px-3">
                        {l.hwid_lock ? (
                          <span className="text-emerald-400 font-bold">Bloqueado</span>
                        ) : (
                          <span className="text-slate-400">Libre</span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase border ${
                            isPaused
                              ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                              : l.status === "used"
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-sky-500/15 text-sky-400 border-sky-500/30"
                          }`}
                        >
                          {isPaused ? "Pausada" : l.status === "used" ? "Usada" : "Activa"}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 font-sans">
                          {/* Toggle pause/resume license */}
                          <button
                            type="button"
                            onClick={() => handleToggleSingleLicense(l.id)}
                            title={isPaused ? "Reanudar" : "Pausar"}
                            className="p-1.5 rounded-lg bg-[#07193b] hover:bg-[#0c2452] text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                          >
                            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteSingleLicense(l.id)}
                            className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: CREAR LICENCIAS ── */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-3xl bg-[#040e24] border border-[#0099ff]/35 shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-7 space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-2xl font-black text-white">Crear licencias</h2>
            </div>

            <form onSubmit={handleCreateLicense} className="space-y-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Cantidad de licencias *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                    required
                    className="w-full bg-[#020713] border border-[#0099ff]/30 focus:border-[#00c2ff] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Mascara de licencia *
                  </label>
                  <input
                    type="text"
                    value={mask}
                    onChange={(e) => setMask(e.target.value)}
                    required
                    className="w-full bg-[#020713] border border-[#0099ff]/30 focus:border-[#00c2ff] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Max usos por licencia *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxUses}
                    onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
                    required
                    className="w-full bg-[#020713] border border-[#0099ff]/30 focus:border-[#00c2ff] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono"
                  />
                </div>

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
              </div>

              <div className="flex items-center gap-6 text-xs text-slate-300 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="case-select"
                    checked={caseFormat === "lower"}
                    onChange={() => setCaseFormat("lower")}
                    className="accent-[#0088ff] w-4 h-4 cursor-pointer"
                  />
                  <span>Minusculas</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="case-select"
                    checked={caseFormat === "upper"}
                    onChange={() => setCaseFormat("upper")}
                    className="accent-[#0088ff] w-4 h-4 cursor-pointer"
                  />
                  <span>Mayusculas</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

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
                  Crear licencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: RESULTADO COPIAR LICENCIAS GENERADAS ── */}
      {generatedKeys && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#040e24] border border-[#0099ff]/40 shadow-[0_25px_70px_rgba(0,0,0,0.95)] p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">¡Licencias creadas exitosamente!</h3>
                <p className="text-xs text-slate-400">Copia tus claves ahora antes de continuar.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#020612] border border-[#0099ff]/25 max-h-56 overflow-y-auto font-mono text-xs text-slate-200 space-y-1.5 scrollbar-thin scrollbar-thumb-sky-500/20">
              {generatedKeys.map((k, i) => (
                <div key={i} className="flex items-center justify-between py-1 px-2 rounded hover:bg-[#071738]/50">
                  <span className="font-bold tracking-wider">{k}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyKey(k)}
                    className="text-slate-400 hover:text-[#00c2ff] p-0.5"
                  >
                    {copiedKey === k ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyAllGenerated}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#07193b] hover:bg-[#0c2452] border border-[#0099ff]/30 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copiedAll ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#00c2ff]" />}
                <span>{copiedAll ? "¡Todas Copiadas!" : "Copiar todas las licencias"}</span>
              </button>

              <button
                type="button"
                onClick={() => setGeneratedKeys(null)}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#0080ff] to-[#00b4ff] hover:from-[#0070e0] hover:to-[#00a2ff] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
