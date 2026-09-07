"use client";
import { useState, useEffect } from "react";
import { 
  UserCog, Search, Plus, Trash2, Edit, Loader2, Check, X, 
  Eye, EyeOff, RefreshCw, Clock, AlertTriangle, Sparkles, Grid,
  Terminal, Binary, Code2, ShieldCheck, Key
} from "lucide-react";
import { useRouter } from "next/navigation";

interface SubManager {
  id: string;
  email: string;
  role: string;
  created_at: string;
  credits: number;
  status: string;
  permissions: string[];
  subscriptions: string[];
  subscription_end?: string | null;
  can_create_apps?: boolean;
}

export default function SubManagersPage() {
  const [subManagers, setSubManagers] = useState<SubManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Creation Form states
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPlan, setNewPlan] = useState<"ilimitado" | "credits">("ilimitado");
  const [newCredits, setNewCredits] = useState(5000);
  const [newExpiryDays, setNewExpiryDays] = useState(30);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  
  const [permCreateApps, setPermCreateApps] = useState(true);
  const [permBuilder, setPermBuilder] = useState(true);
  const [permHex, setPermHex] = useState(true);
  const [permVariables, setPermVariables] = useState(true);
  const [permGenerar, setPermGenerar] = useState(true);
  const [permResetHwid, setPermResetHwid] = useState(true);
  const [permBan, setPermBan] = useState(true);
  const [permDelete, setPermDelete] = useState(false);
  const [permPrefix, setPermPrefix] = useState(true);

  // Editing Form states
  const [editingSub, setEditingSub] = useState<SubManager | null>(null);
  const [editPassword, setEditPassword] = useState("");
  const [editPlan, setEditPlan] = useState<"ilimitado" | "credits">("ilimitado");
  const [editCredits, setEditCredits] = useState(0);
  const [editExpiryDays, setEditExpiryDays] = useState(30);
  const [editSelectedApps, setEditSelectedApps] = useState<string[]>([]);
  const [editShowPassword, setEditShowPassword] = useState(false);
  
  const [editPermCreateApps, setEditPermCreateApps] = useState(true);
  const [editPermBuilder, setEditPermBuilder] = useState(false);
  const [editPermHex, setEditPermHex] = useState(false);
  const [editPermVariables, setEditPermVariables] = useState(false);
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
      setEditPermCreateApps(val);
      setEditPermBuilder(val);
      setEditPermHex(val);
      setEditPermVariables(val);
      setEditPermGenerar(val);
      setEditPermResetHwid(val);
      setEditPermBan(val);
      setEditPermDelete(val);
      setEditPermPrefix(val);
    } else {
      setPermCreateApps(val);
      setPermBuilder(val);
      setPermHex(val);
      setPermVariables(val);
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

  async function fetchSubManagers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sub-managers");
      const data = await res.json();
      if (res.ok && data.success) {
        setSubManagers(data.data || []);
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
    fetchSubManagers();
    fetchApps();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de que deseas eliminar este sub-manager?")) return;
    try {
      const res = await fetch(`/api/admin/sub-managers?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubManagers(subManagers.filter((s) => s.id !== id));
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
    if (permCreateApps) permissions.push("create_apps");
    if (permBuilder) permissions.push("builder");
    if (permHex) permissions.push("hex_converter");
    if (permVariables) permissions.push("variables");
    if (permGenerar) permissions.push("generar");
    if (permResetHwid) permissions.push("hwid");
    if (permBan) permissions.push("ban");
    if (permDelete) permissions.push("delete");
    if (permPrefix) permissions.push("prefix");

    try {
      const res = await fetch("/api/admin/sub-managers", {
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
        setFormError(data.message || "Error al crear sub-manager");
        return;
      }

      setModalOpen(false);
      setNewUsername("");
      setNewPassword("");
      setNewPlan("ilimitado");
      setNewCredits(5000);
      setNewExpiryDays(30);
      setSelectedApps([]);
      setPermCreateApps(true);
      setPermBuilder(true);
      setPermHex(true);
      setPermVariables(true);
      setPermGenerar(true);
      setPermResetHwid(true);
      setPermBan(true);
      setPermDelete(false);
      setPermPrefix(true);
      
      fetchSubManagers();
    } catch (err) {
      setFormLoading(false);
      setFormError("Error de conexión");
    }
  }

  function startEdit(sub: SubManager) {
    setEditingSub(sub);
    setEditPassword("");
    setEditPlan(sub.credits === -1 ? "ilimitado" : "credits");
    setEditCredits(sub.credits === -1 ? 5000 : sub.credits);
    
    if (sub.subscription_end) {
      const diffDays = Math.max(0, Math.ceil((new Date(sub.subscription_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
      setEditExpiryDays(diffDays);
    } else {
      setEditExpiryDays(0);
    }

    setEditSelectedApps(sub.subscriptions || []);
    setEditPermCreateApps(sub.permissions.includes("create_apps") || sub.can_create_apps === true);
    setEditPermBuilder(sub.permissions.includes("builder"));
    setEditPermHex(sub.permissions.includes("hex_converter"));
    setEditPermVariables(sub.permissions.includes("variables"));
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
    if (editPermCreateApps) permissions.push("create_apps");
    if (editPermBuilder) permissions.push("builder");
    if (editPermHex) permissions.push("hex_converter");
    if (editPermVariables) permissions.push("variables");
    if (editPermGenerar) permissions.push("generar");
    if (editPermResetHwid) permissions.push("hwid");
    if (editPermBan) permissions.push("ban");
    if (editPermDelete) permissions.push("delete");
    if (editPermPrefix) permissions.push("prefix");

    try {
      const res = await fetch("/api/admin/sub-managers", {
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
      fetchSubManagers();
    } catch (err) {
      setFormLoading(false);
      setFormError("Error de conexión");
    }
  }

  const filtered = subManagers.filter((s) => 
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in text-slate-200">
      {/* ── HEADER BANNER ── */}
      <div className="flex items-center justify-between flex-wrap gap-4 rounded-2xl bg-[#040e24]/85 border border-[#0099ff]/25 p-6 backdrop-blur-2xl shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#00c2ff]/15 text-[#00c2ff] text-[9.5px] font-black border border-[#00c2ff]/30 flex items-center gap-1 font-mono">
              <Sparkles className="w-3 h-3" /> Sub-managers ({filtered.length})
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Sub-managers
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Administra a tus managers afiliados, permisos de creación de aplicaciones independientes, licencias y accesos directos.
          </p>
        </div>
        
        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-[#00b4ff] to-[#0066ff] hover:from-[#00a2ff] hover:to-[#0055ee] text-white font-extrabold text-xs tracking-wide rounded-xl shadow-[0_0_18px_rgba(0,180,255,0.45)] transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Crear sub-manager
        </button>
      </div>

      {/* ── SEARCH BAR ── */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar sub-managers por usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#020713]/90 border border-[#0099ff]/30 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00c2ff] transition font-mono"
        />
      </div>

      {/* ── MAIN TABLE ── */}
      {loading ? (
        <div className="py-20 flex items-center justify-center gap-2 text-slate-400 text-xs font-mono">
          <Loader2 className="w-5 h-5 animate-spin text-[#00c2ff]" />
          <span>Cargando sub-managers...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#0099ff]/25 bg-[#040e24]/80 backdrop-blur-xl py-16 text-center shadow-xl">
          <UserCog className="w-10 h-10 text-[#00c2ff]/40 mx-auto mb-3" />
          <p className="text-sm font-bold text-white">No se encontraron sub-managers</p>
          <p className="text-xs text-slate-400 mt-1">Usa el botón superior para crear tu primer sub-manager con permisos de aplicaciones.</p>
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
                  <th className="px-5 py-4">APPS ASIGNADAS</th>
                  <th className="px-5 py-4">PERMISOS</th>
                  <th className="px-5 py-4">ESTADO</th>
                  <th className="px-5 py-4">CREADO</th>
                  <th className="px-5 py-4 text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filtered.map((sub) => {
                  const hasCreateApps = sub.permissions?.includes("create_apps") || sub.can_create_apps === true;
                  return (
                    <tr key={sub.id} className="hover:bg-[#071738]/40 transition">
                      {/* Usuario */}
                      <td className="px-5 py-4 font-black text-white text-sm font-sans tracking-wide">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#00c2ff]/10 border border-[#00c2ff]/30 flex items-center justify-center text-[#00c2ff]">
                            <UserCog className="w-4 h-4" />
                          </div>
                          <span>{sub.email}</span>
                        </div>
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

                      {/* Créditos */}
                      <td className="px-5 py-4 font-bold text-slate-300">
                        {sub.credits === -1 ? "—" : sub.credits.toLocaleString()}
                      </td>

                      {/* Suscripción / Expiración */}
                      <td className="px-5 py-4">
                        {getExpiryBadge(sub.subscription_end)}
                      </td>

                      {/* Apps Asignadas */}
                      <td className="px-5 py-4">
                        {sub.subscriptions && sub.subscriptions.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {sub.subscriptions.map((appId) => {
                              const found = apps.find((a) => a.id === appId);
                              return (
                                <span
                                  key={appId}
                                  className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] text-slate-300 truncate max-w-[120px]"
                                  title={found ? found.name : appId}
                                >
                                  {found ? found.name : appId}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Permisos */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1 text-[9px] max-w-[170px]">
                          {hasCreateApps && (
                            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold flex items-center gap-1">
                              <Grid className="w-2.5 h-2.5 text-cyan-400" /> Crear Apps Ilimitadas
                            </span>
                          )}
                          {sub.permissions?.includes("builder") && (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                              <Terminal className="w-2.5 h-2.5 text-amber-400" /> Builder [VIP]
                            </span>
                          )}
                          {sub.permissions?.includes("hex_converter") && (
                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold flex items-center gap-1">
                              <Binary className="w-2.5 h-2.5 text-purple-400" /> Convertidor Hex
                            </span>
                          )}
                          {sub.permissions?.includes("variables") && (
                            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold flex items-center gap-1">
                              <Code2 className="w-2.5 h-2.5 text-blue-400" /> Variables Premium
                            </span>
                          )}
                          {sub.permissions?.includes("generar") && (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              Generar Licencias
                            </span>
                          )}
                          {sub.permissions?.includes("hwid") && (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              Reset HWID
                            </span>
                          )}
                          {sub.permissions?.includes("ban") && (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              Banear Licencias
                            </span>
                          )}
                          {sub.permissions?.includes("delete") && (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              Eliminar Licencias
                            </span>
                          )}
                          {sub.permissions?.includes("prefix") && (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              Modificar Prefijo
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#00ff88]/15 text-[#00ff88] text-[9.5px] font-black border border-[#00ff88]/30">
                          ACTIVO
                        </span>
                      </td>

                      {/* Creado */}
                      <td className="px-5 py-4 text-slate-400 text-[11px]">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </td>

                      {/* Acciones */}
                      <td className="px-5 py-4 text-right space-x-2">
                        <button
                          onClick={() => startEdit(sub)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="Editar sub-manager"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="p-1.5 rounded-lg bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 transition"
                          title="Eliminar sub-manager"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL: CREAR SUB-MANAGER ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-[#030919] border border-[#0099ff]/30 rounded-2xl shadow-[0_0_40px_rgba(0,153,255,0.25)] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#040e24]">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <UserCog className="w-5 h-5 text-[#00c2ff]" />
                <h3>Crear sub-manager</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-lg bg-red-950/50 border border-red-900/50 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Usuario & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 font-bold mb-1">
                    USUARIO / EMAIL
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="manager@gmail.com o usuario"
                    className="w-full bg-[#020713] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00c2ff] font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                      CONTRASEÑA
                    </label>
                    <button
                      type="button"
                      onClick={() => generatePassword(false)}
                      className="text-[9px] font-mono text-[#00c2ff] hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-2.5 h-2.5" /> Generar
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#020713] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00c2ff] font-mono pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Plan Type Selector */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 font-bold mb-1.5">
                  PLAN DEL SUB-MANAGER
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewPlan("ilimitado")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 font-mono ${
                      newPlan === "ilimitado"
                        ? "bg-[#00ff88]/15 border-[#00ff88]/50 text-[#00ff88] shadow-[0_0_12px_rgba(0,255,136,0.2)]"
                        : "bg-[#020713] border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    ILIMITADO
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPlan("credits")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 font-mono ${
                      newPlan === "credits"
                        ? "bg-[#0088ff]/15 border-[#0088ff]/50 text-[#00c2ff] shadow-[0_0_12px_rgba(0,136,255,0.2)]"
                        : "bg-[#020713] border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    CRÉDITOS (SALDO)
                  </button>
                </div>
              </div>

              {/* Credits Input if Plan is credits */}
              {newPlan === "credits" && (
                <div className="animate-fade-in">
                  <label className="block text-[10px] font-mono uppercase text-slate-400 font-bold mb-1">
                    CANTIDAD DE CRÉDITOS A ASIGNAR
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newCredits}
                    onChange={(e) => setNewCredits(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#020713] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00c2ff] font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    El sub-manager usará estos créditos para generar licencias de usuarios.
                  </p>
                </div>
              )}

              {/* Expiry Days Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#00c2ff]" /> DÍAS DE SUSCRIPCIÓN (DURACIÓN)
                  </label>
                  <span className="text-[10px] font-mono text-[#00ff88]">
                    {newExpiryDays === 0 ? "Ilimitado" : `${newExpiryDays} días`}
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
                      key={p.val}
                      type="button"
                      onClick={() => setNewExpiryDays(p.val)}
                      className={`py-1.5 text-[10px] font-mono font-bold rounded-lg border transition ${
                        newExpiryDays === p.val
                          ? "bg-[#00c2ff]/20 border-[#00c2ff] text-white"
                          : "bg-[#020713] border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="0"
                  value={newExpiryDays}
                  onChange={(e) => setNewExpiryDays(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="Días personalizados (0 = ilimitado)"
                  className="w-full bg-[#020713] border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00c2ff] font-mono"
                />
              </div>

              {/* PERMISOS (Special section for Manager) */}
              <div className="border-t border-slate-800/80 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                    PERMISOS DEL SUB-MANAGER
                  </label>
                  <div className="space-x-2 text-[9px] font-mono">
                    <button
                      type="button"
                      onClick={() => handleSetAllPerms(true, false)}
                      className="text-[#00c2ff] hover:underline"
                    >
                      Todos
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={() => handleSetAllPerms(false, false)}
                      className="text-slate-400 hover:underline"
                    >
                      Ninguno
                    </button>
                  </div>
                </div>

                {/* HIGHLIGHTED: CREATE APPS PERMISSION */}
                <div className="mb-2 p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/40 flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permCreateApps}
                      onChange={(e) => setPermCreateApps(e.target.checked)}
                      className="w-4 h-4 rounded bg-[#020713] border-slate-700 text-[#00c2ff] focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Crear Aplicaciones Ilimitadas
                      </span>
                      <span className="text-[10px] text-cyan-300/80">
                        Permite al manager crear sus propias aplicaciones sin que te aparezcan a ti en tu panel.
                      </span>
                    </div>
                  </label>
                  <span className="px-2 py-0.5 rounded-full bg-[#00ff88]/20 border border-[#00ff88]/40 text-[#00ff88] text-[9px] font-mono font-black shrink-0">
                    MANAGER
                  </span>
                </div>

                {/* HIGHLIGHTED: BUILDER VIP PERMISSION */}
                <div className="mb-3 p-3 rounded-xl bg-amber-950/25 border border-amber-500/40 flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permBuilder}
                      onChange={(e) => setPermBuilder(e.target.checked)}
                      className="w-4 h-4 rounded bg-[#020713] border-slate-700 text-amber-400 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white block">
                          Acceso a Builder
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[8.5px] font-black tracking-wider shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                          VIP
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-200/80">
                        Permite al manager ingresar a la herramienta de compilación y descarga de loaders/ejecutables.
                      </span>
                    </div>
                  </label>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-mono font-black shrink-0">
                    VIP
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permHex}
                      onChange={(e) => setPermHex(e.target.checked)}
                      className="rounded bg-[#020713] border-slate-700 text-purple-400"
                    />
                    <span className="text-slate-300 text-xs">Convertidor Hex</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permVariables}
                      onChange={(e) => setPermVariables(e.target.checked)}
                      className="rounded bg-[#020713] border-slate-700 text-blue-400"
                    />
                    <span className="text-slate-300 text-xs">Variables de apps</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permGenerar}
                      onChange={(e) => setPermGenerar(e.target.checked)}
                      className="rounded bg-[#020713] border-slate-700 text-[#00c2ff]"
                    />
                    <span className="text-slate-300 text-xs">Generar licencias</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permResetHwid}
                      onChange={(e) => setPermResetHwid(e.target.checked)}
                      className="rounded bg-[#020713] border-slate-700 text-[#00c2ff]"
                    />
                    <span className="text-slate-300 text-xs">Reset HWID</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permBan}
                      onChange={(e) => setPermBan(e.target.checked)}
                      className="rounded bg-[#020713] border-slate-700 text-[#00c2ff]"
                    />
                    <span className="text-slate-300 text-xs">Banear licencias</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permDelete}
                      onChange={(e) => setPermDelete(e.target.checked)}
                      className="rounded bg-[#020713] border-slate-700 text-[#00c2ff]"
                    />
                    <span className="text-slate-300 text-xs">Eliminar licencias</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer col-span-2">
                    <input
                      type="checkbox"
                      checked={permPrefix}
                      onChange={(e) => setPermPrefix(e.target.checked)}
                      className="rounded bg-[#020713] border-slate-700 text-[#00c2ff]"
                    />
                    <span className="text-slate-300 text-xs">Modificar prefijo de licencias</span>
                  </label>
                </div>
              </div>

              {/* APLICACIONES ASIGNADAS */}
              <div className="border-t border-slate-800/80 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                    ASIGNAR APLICACIONES EXISTENTES (OPCIONAL)
                  </label>
                  <div className="space-x-2 text-[9px] font-mono">
                    <button
                      type="button"
                      onClick={() => handleSelectAllApps(false)}
                      className="text-[#00c2ff] hover:underline"
                    >
                      Marcar todas
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={() => handleDeselectAllApps(false)}
                      className="text-slate-400 hover:underline"
                    >
                      Desmarcar
                    </button>
                  </div>
                </div>
                {apps.length === 0 ? (
                  <p className="text-[11px] text-slate-500">No hay aplicaciones creadas todavía.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto pr-1">
                    {apps.map((app) => (
                      <label
                        key={app.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-[#020713] border border-slate-800 hover:border-slate-700 cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={selectedApps.includes(app.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedApps([...selectedApps, app.id]);
                            } else {
                              setSelectedApps(selectedApps.filter((id) => id !== app.id));
                            }
                          }}
                          className="rounded bg-slate-900 border-slate-700 text-[#00c2ff]"
                        />
                        <span className="text-slate-300 truncate text-[11px]">{app.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 rounded-xl bg-[#00c2ff] hover:bg-[#00b4ff] text-slate-950 text-xs font-black transition disabled:opacity-50 flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,194,255,0.4)]"
                >
                  {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Crear sub-manager
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDITAR SUB-MANAGER ── */}
      {editModalOpen && editingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-[#030919] border border-[#0099ff]/30 rounded-2xl shadow-[0_0_40px_rgba(0,153,255,0.25)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#040e24]">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Edit className="w-5 h-5 text-[#00c2ff]" />
                <h3>Editar sub-manager: {editingSub.email}</h3>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEdit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-lg bg-red-950/50 border border-red-900/50 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Password update */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                    NUEVA CONTRASEÑA (DEJAR EN BLANCO PARA NO CAMBIAR)
                  </label>
                  <button
                    type="button"
                    onClick={() => generatePassword(true)}
                    className="text-[9px] font-mono text-[#00c2ff] hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-2.5 h-2.5" /> Generar
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={editShowPassword ? "text" : "password"}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Escribe una nueva contraseña..."
                    className="w-full bg-[#020713] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00c2ff] font-mono pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setEditShowPassword(!editShowPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {editShowPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Plan Type Selector */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 font-bold mb-1.5">
                  PLAN DEL SUB-MANAGER
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditPlan("ilimitado")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 font-mono ${
                      editPlan === "ilimitado"
                        ? "bg-[#00ff88]/15 border-[#00ff88]/50 text-[#00ff88]"
                        : "bg-[#020713] border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    ILIMITADO
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditPlan("credits")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 font-mono ${
                      editPlan === "credits"
                        ? "bg-[#0088ff]/15 border-[#0088ff]/50 text-[#00c2ff]"
                        : "bg-[#020713] border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    CRÉDITOS (SALDO)
                  </button>
                </div>
              </div>

              {/* Credits Input if Plan is credits */}
              {editPlan === "credits" && (
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 font-bold mb-1">
                    CANTIDAD DE CRÉDITOS
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editCredits}
                    onChange={(e) => setEditCredits(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#020713] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00c2ff] font-mono"
                  />
                </div>
              )}

              {/* Expiry Days Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#00c2ff]" /> DÍAS DE SUSCRIPCIÓN RESTANTES
                  </label>
                  <span className="text-[10px] font-mono text-[#00ff88]">
                    {editExpiryDays === 0 ? "Ilimitado" : `${editExpiryDays} días`}
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
                      key={p.val}
                      type="button"
                      onClick={() => setEditExpiryDays(p.val)}
                      className={`py-1.5 text-[10px] font-mono font-bold rounded-lg border transition ${
                        editExpiryDays === p.val
                          ? "bg-[#00c2ff]/20 border-[#00c2ff] text-white"
                          : "bg-[#020713] border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="0"
                  value={editExpiryDays}
                  onChange={(e) => setEditExpiryDays(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="Días personalizados (0 = ilimitado)"
                  className="w-full bg-[#020713] border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00c2ff] font-mono"
                />
              </div>

              {/* Permisos */}
              <div className="border-t border-slate-800/80 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                    PERMISOS
                  </label>
                  <div className="space-x-2 text-[9px] font-mono">
                    <button
                      type="button"
                      onClick={() => handleSetAllPerms(true, true)}
                      className="text-[#00c2ff] hover:underline"
                    >
                      Todos
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={() => handleSetAllPerms(false, true)}
                      className="text-slate-400 hover:underline"
                    >
                      Ninguno
                    </button>
                  </div>
                </div>

                {/* HIGHLIGHTED: CREATE APPS PERMISSION */}
                <div className="mb-2 p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/40 flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermCreateApps}
                      onChange={(e) => setEditPermCreateApps(e.target.checked)}
                      className="w-4 h-4 rounded bg-[#020713] border-slate-700 text-[#00c2ff] focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Crear Aplicaciones Ilimitadas
                      </span>
                      <span className="text-[10px] text-cyan-300/80">
                        Permite al manager crear sus propias aplicaciones sin que te aparezcan a ti en tu panel.
                      </span>
                    </div>
                  </label>
                  <span className="px-2 py-0.5 rounded-full bg-[#00ff88]/20 border border-[#00ff88]/40 text-[#00ff88] text-[9px] font-mono font-black shrink-0">
                    MANAGER
                  </span>
                </div>

                {/* HIGHLIGHTED: BUILDER VIP PERMISSION */}
                <div className="mb-3 p-3 rounded-xl bg-amber-950/25 border border-amber-500/40 flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermBuilder}
                      onChange={(e) => setEditPermBuilder(e.target.checked)}
                      className="w-4 h-4 rounded bg-[#020713] border-slate-700 text-amber-400 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white block">
                          Acceso a Builder
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[8.5px] font-black tracking-wider shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                          VIP
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-200/80">
                        Permite al manager ingresar a la herramienta de compilación y descarga de loaders/ejecutables.
                      </span>
                    </div>
                  </label>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-mono font-black shrink-0">
                    VIP
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermHex}
                      onChange={(e) => setEditPermHex(e.target.checked)}
                      className="rounded bg-[#020713] border-slate-700 text-purple-400"
                    />
                    <span className="text-slate-300 text-xs">Convertidor Hex</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermVariables}
                      onChange={(e) => setEditPermVariables(e.target.checked)}
                      className="rounded bg-[#020713] border-slate-700 text-blue-400"
                    />
                    <span className="text-slate-300 text-xs">Variables de apps</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermGenerar}
                      onChange={(e) => setEditPermGenerar(e.target.checked)}
                      className="rounded bg-[#020713] border-slate-700 text-[#00c2ff]"
                    />
                    <span className="text-slate-300 text-xs">Generar licencias</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermResetHwid}
                      onChange={(e) => setEditPermResetHwid(e.target.checked)}
                      className="rounded bg-[#020713] border-slate-700 text-[#00c2ff]"
                    />
                    <span className="text-slate-300 text-xs">Reset HWID</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermBan}
                      onChange={(e) => setEditPermBan(e.target.checked)}
                      className="rounded bg-[#020713] border-slate-700 text-[#00c2ff]"
                    />
                    <span className="text-slate-300 text-xs">Banear licencias</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermDelete}
                      onChange={(e) => setEditPermDelete(e.target.checked)}
                      className="rounded bg-[#020713] border-slate-700 text-[#00c2ff]"
                    />
                    <span className="text-slate-300 text-xs">Eliminar licencias</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer col-span-2">
                    <input
                      type="checkbox"
                      checked={editPermPrefix}
                      onChange={(e) => setEditPermPrefix(e.target.checked)}
                      className="rounded bg-[#020713] border-slate-700 text-[#00c2ff]"
                    />
                    <span className="text-slate-300 text-xs">Modificar prefijo de licencias</span>
                  </label>
                </div>
              </div>

              {/* Apps asignadas */}
              <div className="border-t border-slate-800/80 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                    ASIGNAR APLICACIONES EXISTENTES
                  </label>
                  <div className="space-x-2 text-[9px] font-mono">
                    <button
                      type="button"
                      onClick={() => handleSelectAllApps(true)}
                      className="text-[#00c2ff] hover:underline"
                    >
                      Marcar todas
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={() => handleDeselectAllApps(true)}
                      className="text-slate-400 hover:underline"
                    >
                      Desmarcar
                    </button>
                  </div>
                </div>
                {apps.length === 0 ? (
                  <p className="text-[11px] text-slate-500">No hay aplicaciones creadas todavía.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto pr-1">
                    {apps.map((app) => (
                      <label
                        key={app.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-[#020713] border border-slate-800 hover:border-slate-700 cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={editSelectedApps.includes(app.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditSelectedApps([...editSelectedApps, app.id]);
                            } else {
                              setEditSelectedApps(editSelectedApps.filter((id) => id !== app.id));
                            }
                          }}
                          className="rounded bg-slate-900 border-slate-700 text-[#00c2ff]"
                        />
                        <span className="text-slate-300 truncate text-[11px]">{app.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 rounded-xl bg-[#00c2ff] hover:bg-[#00b4ff] text-slate-950 text-xs font-black transition disabled:opacity-50 flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,194,255,0.4)]"
                >
                  {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
