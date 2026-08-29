"use client";
import { useState, useEffect } from "react";
import { 
  Users, Search, Plus, Trash2, Edit, Loader2, Copy, Check, X, ShieldAlert, 
  Eye, EyeOff, RefreshCw, CheckSquare, Square, Clock, AlertTriangle 
} from "lucide-react";
import { useRouter } from "next/navigation";

interface SubReseller {
  id: string;
  email: string;
  role: string;
  created_at: string;
  credits: number;
  status: string;
  permissions: string[];
  subscriptions: string[];
  subscription_end?: string | null;
}

export default function SubResellersPage() {
  const [subResellers, setSubResellers] = useState<SubReseller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Creation Form states (Matching Image 3)
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPlan, setNewPlan] = useState<"ilimitado" | "credits">("ilimitado");
  const [newCredits, setNewCredits] = useState(10);
  const [newExpiryDays, setNewExpiryDays] = useState(30);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  
  const [permGenerar, setPermGenerar] = useState(true);
  const [permResetHwid, setPermResetHwid] = useState(false);
  const [permBan, setPermBan] = useState(false);
  const [permDelete, setPermDelete] = useState(false);
  const [permPrefix, setPermPrefix] = useState(false);

  // Editing Form states
  const [editingSub, setEditingSub] = useState<SubReseller | null>(null);
  const [editPassword, setEditPassword] = useState("");
  const [editPlan, setEditPlan] = useState<"ilimitado" | "credits">("ilimitado");
  const [editCredits, setEditCredits] = useState(0);
  const [editExpiryDays, setEditExpiryDays] = useState(30);
  const [editSelectedApps, setEditSelectedApps] = useState<string[]>([]);
  const [editShowPassword, setEditShowPassword] = useState(false);
  const [editPermGenerar, setEditPermGenerar] = useState(true);
  const [editPermResetHwid, setEditPermResetHwid] = useState(false);
  const [editPermBan, setEditPermBan] = useState(false);
  const [editPermDelete, setEditPermDelete] = useState(false);
  const [editPermPrefix, setEditPermPrefix] = useState(false);
  
  // Apps state
  const [apps, setApps] = useState<{ id: string; name: string }[]>([]);
  
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  const router = useRouter();

  function generatePassword(isEdit = false) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (isEdit) {
      setEditPassword(pwd);
      setEditShowPassword(true);
    } else {
      setNewPassword(pwd);
      setShowPassword(true);
    }
  }

  function handleSelectAllApps(isEdit = false) {
    const allIds = apps.map((a) => a.id);
    if (isEdit) {
      setEditSelectedApps(allIds);
    } else {
      setSelectedApps(allIds);
    }
  }

  function handleDeselectAllApps(isEdit = false) {
    if (isEdit) {
      setEditSelectedApps([]);
    } else {
      setSelectedApps([]);
    }
  }

  function handleSetAllPerms(val: boolean, isEdit = false) {
    if (isEdit) {
      setEditPermGenerar(val);
      setEditPermResetHwid(val);
      setEditPermBan(val);
      setEditPermDelete(val);
      setEditPermPrefix(val);
    } else {
      setPermGenerar(val);
      setPermResetHwid(val);
      setPermBan(val);
      setPermDelete(val);
      setPermPrefix(val);
    }
  }

  function getExpiryBadge(subEnd?: string | null) {
    if (!subEnd) {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-[#03152a] border border-[#00ff88]/30 px-2.5 py-1 text-xs font-mono font-bold text-[#00ff88]">
          <Clock className="w-3.5 h-3.5" /> Ilimitado
        </span>
      );
    }
    const expDate = new Date(subEnd).getTime();
    const diffDays = Math.ceil((expDate - Date.now()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-red-950/40 border border-red-900/50 px-2.5 py-1 text-xs font-mono font-bold text-red-400">
          <AlertTriangle className="w-3.5 h-3.5" /> Expirado (0 días)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#041d22] border border-emerald-500/40 px-3 py-1.5 text-xs font-mono font-bold text-emerald-400 shadow-inner">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>{diffDays} días restantes</span>
        </span>
      );
    }
  }

  async function fetchSubResellers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sub-resellers");
      const data = await res.json();
      if (res.ok && data.success) {
        setSubResellers(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchApps() {
    try {
      const res = await fetch("/api/admin/apps");
      const data = await res.json();
      if (res.ok && data.success) {
        setApps(data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  }
  
  useEffect(() => {
    fetchSubResellers();
    fetchApps();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de que deseas eliminar este sub-reseller?")) return;
    try {
      const res = await fetch(`/api/admin/sub-resellers?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubResellers(subResellers.filter((s) => s.id !== id));
      } else {
        alert(data.message || "Error al eliminar");
      }
    } catch (err) {
      alert("Error de conexión");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    const subscriptions: string[] = selectedApps;
    const permissions: string[] = [];
    if (permGenerar) permissions.push("generar");
    if (permResetHwid) permissions.push("hwid");
    if (permBan) permissions.push("ban");
    if (permDelete) permissions.push("delete");
    if (permPrefix) permissions.push("prefix");

    try {
      const res = await fetch("/api/admin/sub-resellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newUsername,
          password: newPassword,
          plan: newPlan,
          credits: newPlan === "credits" ? newCredits : 0,
          expiryDays: newExpiryDays,
          permissions,
          subscriptions
        })
      });
      
      const data = await res.json();
      setFormLoading(false);

      if (!res.ok) {
        setFormError(data.message || "Error al crear sub-reseller");
        return;
      }

      setModalOpen(false);
      setNewUsername("");
      setNewPassword("");
      setNewPlan("ilimitado");
      setNewCredits(10);
      setNewExpiryDays(30);
      setSelectedApps([]);
      setPermGenerar(true);
      setPermResetHwid(false);
      setPermBan(false);
      setPermDelete(false);
      setPermPrefix(false);
      
      fetchSubResellers();
    } catch (err) {
      setFormLoading(false);
      setFormError("Error de conexión");
    }
  }

  function startEdit(sub: SubReseller) {
    setEditingSub(sub);
    setEditPassword("");
    setEditPlan(sub.credits === -1 ? "ilimitado" : "credits");
    setEditCredits(sub.credits === -1 ? 10 : sub.credits);
    
    if (sub.subscription_end) {
      const diffDays = Math.max(0, Math.ceil((new Date(sub.subscription_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
      setEditExpiryDays(diffDays);
    } else {
      setEditExpiryDays(0);
    }

    setEditSelectedApps(sub.subscriptions || []);
    setEditPermGenerar(sub.permissions.includes("generar"));
    setEditPermResetHwid(sub.permissions.includes("hwid"));
    setEditPermBan(sub.permissions.includes("ban"));
    setEditPermDelete(sub.permissions.includes("delete"));
    setEditPermPrefix(sub.permissions.includes("prefix"));
    setFormError(null);
    setEditModalOpen(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSub) return;
    setFormError(null);
    setFormLoading(true);

    const permissions: string[] = [];
    if (editPermGenerar) permissions.push("generar");
    if (editPermResetHwid) permissions.push("hwid");
    if (editPermBan) permissions.push("ban");
    if (editPermDelete) permissions.push("delete");
    if (editPermPrefix) permissions.push("prefix");

    try {
      const res = await fetch("/api/admin/sub-resellers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingSub.id,
          password: editPassword || undefined,
          plan: editPlan,
          credits: editPlan === "credits" ? editCredits : 0,
          expiryDays: editExpiryDays,
          permissions,
          subscriptions: editSelectedApps
        })
      });

      const data = await res.json();
      setFormLoading(false);

      if (!res.ok) {
        setFormError(data.message || "Error al actualizar");
        return;
      }

      setEditModalOpen(false);
      setEditingSub(null);
      setEditPassword("");
      fetchSubResellers();
    } catch (err) {
      setFormLoading(false);
      setFormError("Error de conexión");
    }
  }

  const filtered = subResellers.filter((s) => 
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in text-slate-200">
      {/* ── HEADER BANNER ── */}
      <div className="flex items-center justify-between flex-wrap gap-4 rounded-2xl bg-[#040e24]/85 border border-[#0099ff]/25 p-6 backdrop-blur-2xl shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#00ff88]/15 text-[#00ff88] text-[9.5px] font-black border border-[#00ff88]/30">
              • Sub-resellers ({filtered.length})
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Sub-resellers
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Administra a tus vendedores afiliados, sus permisos, días de suscripción y accesos directos.
          </p>
        </div>
        
        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-[#0080ff] to-[#00b4ff] hover:from-[#0070e0] hover:to-[#00a2ff] text-white font-extrabold text-xs tracking-wide rounded-xl shadow-[0_0_18px_rgba(0,153,255,0.45)] transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Crear sub-reseller
        </button>
      </div>

      {/* ── SEARCH BAR ── */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar sub-resellers por usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#020713]/90 border border-[#0099ff]/30 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00c2ff] transition font-mono"
        />
      </div>

      {/* ── MAIN TABLE (MATCHING EXACT SCREENSHOT 4) ── */}
      {loading ? (
        <div className="py-20 flex items-center justify-center gap-2 text-slate-400 text-xs font-mono">
          <Loader2 className="w-5 h-5 animate-spin text-[#00c2ff]" />
          <span>Cargando sub-resellers...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#0099ff]/25 bg-[#040e24]/80 backdrop-blur-xl py-16 text-center shadow-xl">
          <Users className="w-10 h-10 text-[#00c2ff]/40 mx-auto mb-3" />
          <p className="text-sm font-bold text-white">No se encontraron sub-resellers</p>
          <p className="text-xs text-slate-400 mt-1">Usa el botón superior para crear tu primer vendedor.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#0099ff]/25 bg-[#040e24]/85 backdrop-blur-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#030919] text-[#00c2ff] text-[10px] font-black uppercase tracking-wider border-b border-[#0099ff]/20 font-mono">
                <tr>
                  <th className="px-5 py-4">USUARIO</th>
                  <th className="px-5 py-4">PLAN</th>
                  <th className="px-5 py-4">CRÉDITOS</th>
                  <th className="px-5 py-4">SUSCRIPCIÓN / EXPIRACIÓN</th>
                  <th className="px-5 py-4">SUSCRIPCIONES (APPS)</th>
                  <th className="px-5 py-4">PERMISOS</th>
                  <th className="px-5 py-4">ESTADO</th>
                  <th className="px-5 py-4">CREADO</th>
                  <th className="px-5 py-4 text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filtered.map((sub) => {
                  return (
                    <tr key={sub.id} className="hover:bg-[#071738]/40 transition">
                      {/* Usuario */}
                      <td className="px-5 py-4 font-black text-white text-sm font-sans tracking-wide">
                        {sub.email}
                      </td>

                      {/* Plan */}
                      <td className="px-5 py-4">
                        {sub.credits === -1 ? (
                          <span className="px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-[9.5px] font-black text-emerald-400 uppercase">
                            ILIMITADO
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded bg-[#0088ff]/20 border border-[#0088ff]/40 text-[9.5px] font-black text-[#00c2ff] uppercase">
                            CRÉDITOS
                          </span>
                        )}
                      </td>

                      {/* Créditos (Large Numbers e.g. 756767576) */}
                      <td className="px-5 py-4 font-mono font-black text-white text-xs">
                        {sub.credits === -1 ? "—" : sub.credits}
                      </td>

                      {/* Suscripción / Expiración */}
                      <td className="px-5 py-4">
                        {getExpiryBadge(sub.subscription_end)}
                      </td>

                      {/* Suscripciones (Apps) */}
                      <td className="px-5 py-4 text-xs text-slate-300">
                        {sub.subscriptions && sub.subscriptions.length > 0 ? (
                          <div className="flex gap-1.5 flex-wrap">
                            {sub.subscriptions.map((s) => {
                              const appObj = apps.find((a) => a.id === s);
                              return (
                                <span key={s} className="bg-[#030919] px-2 py-1 rounded-md border border-slate-700 text-slate-300 text-[10px] font-bold">
                                  {appObj ? appObj.name : s}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-slate-500">Ninguna</span>
                        )}
                      </td>

                      {/* Permisos (Stacked Pills matching Screenshot 4) */}
                      <td className="px-5 py-4 text-xs">
                        {sub.permissions && sub.permissions.length > 0 ? (
                          <div className="flex flex-col gap-1 max-w-[140px]">
                            {sub.permissions.map((p) => (
                              <span key={p} className="bg-[#030919] px-2 py-0.5 rounded border border-slate-700 text-slate-300 text-[9.5px] font-mono">
                                {p === "generar" ? "Generar licencias" : p === "hwid" ? "Reset HWID" : p === "ban" ? "Banear licencias" : p === "delete" ? "Eliminar licencias" : p}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500">Ninguno</span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded bg-[#00ff88]/15 border border-[#00ff88]/30 text-[9.5px] font-black text-[#00ff88] uppercase">
                          ACTIVO
                        </span>
                      </td>

                      {/* Creado */}
                      <td className="px-5 py-4 text-xs text-slate-400 font-mono">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </td>

                      {/* Acciones */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => startEdit(sub)}
                            className="p-1.5 rounded-lg bg-[#07193b] hover:bg-[#0c2452] text-slate-300 hover:text-emerald-400 transition cursor-pointer"
                            title="Editar Sub-reseller"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(sub.id)}
                            className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 transition cursor-pointer"
                            title="Eliminar Sub-reseller"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL: CREAR SUB-RESELLER (MATCHING EXACT SCREENSHOT 3) ── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-[#040e24] border border-[#0099ff]/35 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] w-full max-w-xl my-auto overflow-hidden text-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-800">
              <h3 className="font-black text-lg text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" /> Crear sub-reseller
              </h3>
              <button 
                onClick={() => setModalOpen(false)} 
                className="text-slate-400 hover:text-white p-1 rounded-md transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreate} className="px-7 py-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block font-mono">
                    USUARIO
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[#020713] border border-[#0099ff]/30 text-white px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-[#00c2ff] transition font-mono"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="spectrax@gmail.com"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                      CONTRASEÑA
                    </label>
                    <button
                      type="button"
                      onClick={() => generatePassword(false)}
                      className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 font-bold font-mono"
                    >
                      <RefreshCw className="w-3 h-3" /> Generar
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      className="w-full bg-[#020713] border border-[#0099ff]/30 text-white pl-3.5 pr-9 py-2.5 rounded-xl text-xs outline-none focus:border-[#00c2ff] transition font-mono"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Plan Options (Matching Screenshot 3) */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block font-mono">
                  PLAN DEL SUB-RESELLER
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewPlan("ilimitado")}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider transition ${
                      newPlan === "ilimitado"
                        ? "bg-[#041d22] border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                        : "bg-[#020713] border-[#0099ff]/25 text-slate-400 hover:bg-[#071738]"
                    }`}
                  >
                    ILIMITADO
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPlan("credits")}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider transition ${
                      newPlan === "credits"
                        ? "bg-[#041738] border-[#0099ff] text-[#00c2ff] shadow-[0_0_12px_rgba(0,153,255,0.3)]"
                        : "bg-[#020713] border-[#0099ff]/25 text-slate-400 hover:bg-[#071738]"
                    }`}
                  >
                    CRÉDITOS (COINS)
                  </button>
                </div>
              </div>

              {/* Credits input (up to 60+ digits supported) */}
              {newPlan === "credits" && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block font-mono">
                    ASIGNAR CRÉDITOS
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    className="w-full bg-[#020713] border border-[#0099ff]/30 text-white px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-[#00c2ff] transition font-mono"
                    value={newCredits}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      setNewCredits(Number(val) || 0);
                    }}
                    placeholder="Ej. 756767576"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Introduce la cantidad de créditos deseada.</p>
                </div>
              )}

              {/* Días de Suscripción (Matching Screenshot 3) */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" /> DÍAS DE SUSCRIPCIÓN (DURACIÓN)
                  </label>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    {newExpiryDays > 0 ? `${newExpiryDays} días` : "Ilimitado"}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 mb-2">
                  {[
                    { label: "30 Días", val: 30 },
                    { label: "1 Año", val: 365 },
                    { label: "2 Años", val: 730 },
                    { label: "5 Años", val: 1825 },
                    { label: "Ilimitado", val: 0 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setNewExpiryDays(p.val)}
                      className={`py-1.5 rounded-lg border text-[10.5px] font-bold transition text-center truncate ${
                        newExpiryDays === p.val
                          ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                          : "bg-[#020713] border-[#0099ff]/25 text-slate-400 hover:bg-[#071738]"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={0}
                  className="w-full bg-[#020713] border border-[#0099ff]/30 text-white px-3.5 py-2 rounded-xl text-xs outline-none focus:border-[#00c2ff] transition font-mono"
                  value={newExpiryDays}
                  onChange={(e) => setNewExpiryDays(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="0 para ilimitado / sin expiración"
                />
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                  * Al expirar los días, el acceso del sub-reseller quedará bloqueado y se le solicitará pago al Main Developer.
                </p>
              </div>

              {/* Subscriptions Apps (Matching Screenshot 3) */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block font-mono">
                    APLICACIONES PERMITIDAS
                  </label>
                  <div className="flex items-center gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => handleSelectAllApps(false)}
                      className="text-emerald-400 hover:underline font-bold"
                    >
                      Marcar todas
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={() => handleDeselectAllApps(false)}
                      className="text-slate-400 hover:underline font-bold"
                    >
                      Desmarcar
                    </button>
                  </div>
                </div>
                {apps.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Primero crea una aplicación para poder asignarla.</p>
                ) : (
                  <div className="flex gap-4 flex-wrap">
                    {apps.map((app) => {
                      const isChecked = selectedApps.includes(app.id);
                      return (
                        <label key={app.id} className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedApps([...selectedApps, app.id]);
                              } else {
                                setSelectedApps(selectedApps.filter((id) => id !== app.id));
                              }
                            }}
                            className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                          />
                          <span>{app.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Permissions (Matching Screenshot 3) */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block font-mono">
                    PERMISOS
                  </label>
                  <div className="flex items-center gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => handleSetAllPerms(true, false)}
                      className="text-emerald-400 hover:underline font-bold"
                    >
                      Todos
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={() => handleSetAllPerms(false, false)}
                      className="text-slate-400 hover:underline font-bold"
                    >
                      Ninguno
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                    <input
                      type="checkbox"
                      checked={permGenerar}
                      onChange={(e) => setPermGenerar(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                    />
                    <span>Generar licencias</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                    <input
                      type="checkbox"
                      checked={permResetHwid}
                      onChange={(e) => setPermResetHwid(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                    />
                    <span>Reset HWID</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                    <input
                      type="checkbox"
                      checked={permBan}
                      onChange={(e) => setPermBan(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                    />
                    <span>Banear licencias</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                    <input
                      type="checkbox"
                      checked={permDelete}
                      onChange={(e) => setPermDelete(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                    />
                    <span>Eliminar licencias</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                    <input
                      type="checkbox"
                      checked={permPrefix}
                      onChange={(e) => setPermPrefix(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                    />
                    <span>Modificar prefijo</span>
                  </label>
                </div>
              </div>

              {formError && (
                <div className="text-xs text-rose-400 bg-rose-950/20 border border-rose-500/30 rounded-xl px-3 py-2 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#08152e] hover:bg-[#0c1f44] text-slate-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2.5 text-xs font-black rounded-xl bg-[#00ff88]/20 hover:bg-[#00ff88]/30 border border-[#00ff88]/50 text-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.3)] flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Crear sub-reseller</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDITING MODAL ── */}
      {editModalOpen && editingSub && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-[#040e24] border border-[#0099ff]/35 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] w-full max-w-xl my-auto overflow-hidden text-slate-200">
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-800">
              <h3 className="font-black text-lg text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-emerald-400" /> Editar sub-reseller: {editingSub.email}
              </h3>
              <button 
                onClick={() => setEditModalOpen(false)} 
                className="text-slate-400 hover:text-white p-1 rounded-md transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEdit} className="px-7 py-5 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block font-mono">
                  NUEVA CONTRASEÑA (OPCIONAL)
                </label>
                <div className="relative">
                  <input
                    type={editShowPassword ? "text" : "password"}
                    className="w-full bg-[#020713] border border-[#0099ff]/30 text-white pl-3.5 pr-9 py-2.5 rounded-xl text-xs outline-none focus:border-[#00c2ff] transition font-mono"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Dejar vacío para no cambiar"
                  />
                  <button
                    type="button"
                    onClick={() => setEditShowPassword(!editShowPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {editShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block font-mono">
                  PLAN DEL SUB-RESELLER
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditPlan("ilimitado")}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider transition ${
                      editPlan === "ilimitado"
                        ? "bg-[#041d22] border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                        : "bg-[#020713] border-[#0099ff]/25 text-slate-400 hover:bg-[#071738]"
                    }`}
                  >
                    ILIMITADO
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditPlan("credits")}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider transition ${
                      editPlan === "credits"
                        ? "bg-[#041738] border-[#0099ff] text-[#00c2ff] shadow-[0_0_12px_rgba(0,153,255,0.3)]"
                        : "bg-[#020713] border-[#0099ff]/25 text-slate-400 hover:bg-[#071738]"
                    }`}
                  >
                    CRÉDITOS (COINS)
                  </button>
                </div>
              </div>

              {editPlan === "credits" && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block font-mono">
                    CRÉDITOS
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    className="w-full bg-[#020713] border border-[#0099ff]/30 text-white px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-[#00c2ff] transition font-mono"
                    value={editCredits}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      setEditCredits(Number(val) || 0);
                    }}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#08152e] hover:bg-[#0c1f44] text-slate-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2.5 text-xs font-black rounded-xl bg-[#00ff88]/20 hover:bg-[#00ff88]/30 border border-[#00ff88]/50 text-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.3)] flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Guardar cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
