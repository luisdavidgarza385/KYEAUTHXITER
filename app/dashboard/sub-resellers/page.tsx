"use client";
import { useState, useEffect } from "react";
import { Users, Search, Plus, Trash2, Edit, Loader2, Copy, Check, X, ShieldAlert } from "lucide-react";
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
}

export default function SubResellersPage() {
  const [subResellers, setSubResellers] = useState<SubReseller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Creation Form states
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPlan, setNewPlan] = useState<"ilimitado" | "credits">("ilimitado");
  const [newCredits, setNewCredits] = useState(10);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  
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
  const [editSelectedApps, setEditSelectedApps] = useState<string[]>([]);
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

  function handleCopy(id: string) {
    const mockupAppId = id.slice(0, 15).replace("-", "");
    navigator.clipboard.writeText(mockupAppId);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

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
    setEditPlan(sub.credits > 0 ? "credits" : "ilimitado");
    setEditCredits(sub.credits);
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
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto text-zinc-300">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-zinc-800/60 pb-5">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-zinc-100">
            <Users className="w-5 h-5 text-emerald-400" />
            Sub-resellers ({filtered.length})
          </h1>
          <p className="text-xs text-zinc-550 mt-1 font-medium">Administra a tus vendedores afiliados, sus permisos y claves API.</p>
        </div>
        
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-650 hover:bg-emerald-550 text-white transition-all shadow-md shadow-emerald-500/10"
        >
          <Plus className="w-4 h-4" /> Crear sub-reseller
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
        <input
          type="text"
          placeholder="Buscar sub-resellers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-850 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-250 placeholder:text-zinc-650 outline-none focus:border-emerald-500/50 transition"
        />
      </div>

      {/* Main List */}
      {loading ? (
        <div className="py-20 flex items-center justify-center gap-2 text-zinc-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
          <span>Cargando vendedores...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/20 py-16 text-center">
          <Users className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-400">No se encontraron sub-resellers</p>
          <p className="text-xs text-zinc-550 mt-1">Usa el botón superior para crear tu primer vendedor.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-950 text-zinc-500 text-[10px] font-bold uppercase tracking-wider border-b border-zinc-800/80">
                <tr>
                  <th className="px-5 py-3.5">Usuario</th>
                  <th className="px-5 py-3.5">ID Aplicación (API Key)</th>
                  <th className="px-5 py-3.5">Plan</th>
                  <th className="px-5 py-3.5">Créditos</th>
                  <th className="px-5 py-3.5">Suscripciones</th>
                  <th className="px-5 py-3.5">Permisos</th>
                  <th className="px-5 py-3.5">Estado</th>
                  <th className="px-5 py-3.5">Creado</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filtered.map((sub) => {
                  const subIdClean = sub.id.slice(0, 15).replace("-", "");
                  return (
                    <tr key={sub.id} className="hover:bg-zinc-900/40 transition">
                      <td className="px-5 py-4 font-bold text-zinc-200">{sub.email}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800/60 rounded px-2 py-1 max-w-fit font-mono text-xs text-zinc-400">
                          <span>{subIdClean}</span>
                          <button
                            onClick={() => handleCopy(sub.id)}
                            className="text-zinc-650 hover:text-zinc-300 transition"
                            title="Copiar ID de aplicación"
                          >
                            {copiedId === sub.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {sub.credits === 0 ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">
                            Ilimitado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-blue-950/20 border border-blue-900/30 px-2 py-0.5 text-[10px] font-bold text-blue-400 uppercase">
                            Créditos
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-zinc-300">{sub.credits === 0 ? "—" : sub.credits}</td>
                      <td className="px-5 py-4 text-xs text-zinc-400">
                        {sub.subscriptions && sub.subscriptions.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {sub.subscriptions.map((s) => {
                              const appObj = apps.find((a) => a.id === s);
                              return (
                                <span key={s} className="bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-855 text-zinc-400 text-[10px]">
                                  {appObj ? appObj.name : s}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          "Ninguna"
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-zinc-400">
                        {sub.permissions && sub.permissions.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {sub.permissions.map((p) => (
                              <span key={p} className="bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-855 text-zinc-500 text-[10px]">
                                {p === "generar" ? "Generar licencias" : p === "hwid" ? "Reset HWID" : p === "ban" ? "Banear licencias" : "Eliminar licencias"}
                              </span>
                            ))}
                          </div>
                        ) : (
                          "Ninguno"
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-950/20 border border-emerald-900/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">
                          Activo
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-zinc-500 font-mono">
                        {new Date(sub.created_at).toLocaleDateString("es-ES")}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => startEdit(sub)}
                            className="p-1.5 rounded hover:bg-emerald-950/20 border border-transparent hover:border-emerald-900/30 text-emerald-400 transition"
                            title="Editar Sub-reseller"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(sub.id)}
                            className="p-1.5 rounded hover:bg-red-950/20 border border-transparent hover:border-red-900/30 text-red-500 transition"
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

      {/* Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-zinc-950 border border-zinc-850 rounded-xl shadow-2xl w-full max-w-lg my-auto overflow-hidden text-zinc-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-zinc-900/20">
              <h3 className="font-bold text-sm text-zinc-100">Crear sub-reseller</h3>
              <button 
                onClick={() => setModalOpen(false)} 
                className="text-zinc-500 hover:text-zinc-350 p-1 rounded-md hover:bg-zinc-900 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">Usuario</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-650 px-3 py-2 rounded-lg text-sm outline-none focus:border-emerald-500/50 transition"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. VENDEDORESGUATEXITER"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">Contraseña</label>
                  <input
                    type="password"
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-650 px-3 py-2 rounded-lg text-sm outline-none focus:border-emerald-500/50 transition font-mono"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Plan Options */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">Plan del sub-reseller</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewPlan("ilimitado")}
                    className={`px-4 py-2.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition ${
                      newPlan === "ilimitado"
                        ? "bg-emerald-950/20 border-emerald-500/50 text-emerald-400"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850"
                    }`}
                  >
                    Ilimitado
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPlan("credits")}
                    className={`px-4 py-2.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition ${
                      newPlan === "credits"
                        ? "bg-blue-950/20 border-blue-500/50 text-blue-400"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850"
                    }`}
                  >
                    Créditos (Coins)
                  </button>
                </div>
              </div>

              {/* Credits input */}
              {newPlan === "credits" && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">Asignar Créditos</label>
                  <input
                    type="number"
                    min={1}
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-650 px-3 py-2 rounded-lg text-sm outline-none focus:border-emerald-500/50 transition font-mono"
                    value={newCredits}
                    onChange={(e) => setNewCredits(parseInt(e.target.value) || 1)}
                  />
                </div>
              )}

              {/* Subscriptions */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">Aplicaciones permitidas</label>
                {apps.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">Primero crea una aplicación para poder asignarla.</p>
                ) : (
                  <div className="flex gap-4 flex-wrap">
                    {apps.map((app) => {
                      const isChecked = selectedApps.includes(app.id);
                      return (
                        <label key={app.id} className="flex items-center gap-2 cursor-pointer text-sm text-zinc-400 hover:text-zinc-200">
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

              {/* Permissions */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">Permisos</label>
                <div className="grid grid-cols-2 gap-2 text-sm text-zinc-400">
                  <label className="flex items-center gap-2 cursor-pointer hover:text-zinc-200">
                    <input
                      type="checkbox"
                      checked={permGenerar}
                      onChange={(e) => setPermGenerar(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                    />
                    <span>Generar licencias</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-zinc-200">
                    <input
                      type="checkbox"
                      checked={permResetHwid}
                      onChange={(e) => setPermResetHwid(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                    />
                    <span>Reset HWID</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-zinc-200">
                    <input
                      type="checkbox"
                      checked={permBan}
                      onChange={(e) => setPermBan(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                    />
                    <span>Banear licencias</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-zinc-200">
                    <input
                      type="checkbox"
                      checked={permDelete}
                      onChange={(e) => setPermDelete(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                    />
                    <span>Eliminar licencias</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-zinc-200">
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
                <div className="text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg px-3 py-2 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-650 hover:bg-emerald-550 text-white shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {formLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Crear sub-reseller"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Editing Modal */}
      {editModalOpen && editingSub && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-zinc-950 border border-zinc-850 rounded-xl shadow-2xl w-full max-w-lg my-auto overflow-hidden text-zinc-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-zinc-900/20">
              <h3 className="font-bold text-sm text-zinc-100">Editar sub-reseller: {editingSub.email}</h3>
              <button 
                onClick={() => setEditModalOpen(false)} 
                className="text-zinc-500 hover:text-zinc-350 p-1 rounded-md hover:bg-zinc-900 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEdit} className="px-6 py-5 space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">Nueva Contraseña (vacío para no cambiar)</label>
                <input
                  type="password"
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-650 px-3 py-2 rounded-lg text-sm outline-none focus:border-emerald-500/50 transition font-mono"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              {/* Plan Options */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">Plan del sub-reseller</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditPlan("ilimitado")}
                    className={`px-4 py-2.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition ${
                      editPlan === "ilimitado"
                        ? "bg-emerald-950/20 border-emerald-500/50 text-emerald-400"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850"
                    }`}
                  >
                    Ilimitado
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditPlan("credits")}
                    className={`px-4 py-2.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition ${
                      editPlan === "credits"
                        ? "bg-blue-950/20 border-blue-500/50 text-blue-400"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850"
                    }`}
                  >
                    Créditos (Coins)
                  </button>
                </div>
              </div>

              {/* Credits input */}
              {editPlan === "credits" && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">Asignar / Modificar Créditos</label>
                  <input
                    type="number"
                    min={0}
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-650 px-3 py-2 rounded-lg text-sm outline-none focus:border-emerald-500/50 transition font-mono"
                    value={editCredits}
                    onChange={(e) => setEditCredits(parseInt(e.target.value) || 0)}
                  />
                </div>
              )}

              {/* Subscriptions */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">Aplicaciones permitidas</label>
                {apps.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">No hay aplicaciones disponibles.</p>
                ) : (
                  <div className="flex gap-4 flex-wrap">
                    {apps.map((app) => {
                      const isChecked = editSelectedApps.includes(app.id);
                      return (
                        <label key={app.id} className="flex items-center gap-2 cursor-pointer text-sm text-zinc-400 hover:text-zinc-200">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditSelectedApps([...editSelectedApps, app.id]);
                              } else {
                                setEditSelectedApps(editSelectedApps.filter((id) => id !== app.id));
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

              {/* Permissions */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">Permisos</label>
                <div className="grid grid-cols-2 gap-2 text-sm text-zinc-400">
                  <label className="flex items-center gap-2 cursor-pointer hover:text-zinc-200">
                    <input
                      type="checkbox"
                      checked={editPermGenerar}
                      onChange={(e) => setEditPermGenerar(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                    />
                    <span>Generar licencias</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-zinc-200">
                    <input
                      type="checkbox"
                      checked={editPermResetHwid}
                      onChange={(e) => setEditPermResetHwid(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                    />
                    <span>Reset HWID</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-zinc-200">
                    <input
                      type="checkbox"
                      checked={editPermBan}
                      onChange={(e) => setEditPermBan(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                    />
                    <span>Banear licencias</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-zinc-200">
                    <input
                      type="checkbox"
                      checked={editPermDelete}
                      onChange={(e) => setEditPermDelete(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                    />
                    <span>Eliminar licencias</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-zinc-200">
                    <input
                      type="checkbox"
                      checked={editPermPrefix}
                      onChange={(e) => setEditPermPrefix(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                    />
                    <span>Modificar prefijo</span>
                  </label>
                </div>
              </div>

              {formError && (
                <div className="text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg px-3 py-2 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-650 hover:bg-emerald-550 text-white shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {formLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
