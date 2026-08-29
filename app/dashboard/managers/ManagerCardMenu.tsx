"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Edit3, Key, Trash2, FolderTree } from "lucide-react";

export function ManagerCardMenu({ manager, apps, currentAssignedIds }: { manager: { id: string; email: string }; apps: { id: string; name: string }[]; currentAssignedIds: string[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [pwChanging, setPwChanging] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [email, setEmail] = useState(manager.email);
  const [password, setPassword] = useState("");
  const [selected, setSelected] = useState<string[]>(currentAssignedIds);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => { setSelected(currentAssignedIds); }, [currentAssignedIds]);

  function toggleApp(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function saveEdit() {
    setErr(null);
    setLoading(true);
    const r = await fetch(`/api/admin/managers/${manager.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    const d = await r.json();
    if (!r.ok) { setErr(d.message || "Error"); return; }
    setEditing(false);
    router.refresh();
  }

  async function savePassword() {
    setErr(null);
    if (password.length < 6) { setErr("Password must be at least 6 characters"); return; }
    setLoading(true);
    const r = await fetch(`/api/admin/managers/${manager.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    const d = await r.json();
    if (!r.ok) { setErr(d.message || "Error"); return; }
    setPwChanging(false);
    setPassword("");
  }

  async function doDelete() {
    setErr(null);
    setLoading(true);
    const r = await fetch(`/api/admin/managers/${manager.id}`, { method: "DELETE" });
    setLoading(false);
    const d = await r.json();
    if (!r.ok) { setErr(d.message || "Error"); return; }
    setDeleting(false);
    router.refresh();
  }

  async function saveAssign() {
    setErr(null);
    setLoading(true);
    const r = await fetch(`/api/admin/managers/${manager.id}/apps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appIds: selected }),
    });
    setLoading(false);
    const d = await r.json();
    if (!r.ok) { setErr(d.message || "Error"); return; }
    setAssigning(false);
    router.refresh();
  }

  const modal = (title: string, body: React.ReactNode, actions: React.ReactNode) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => { setEditing(false); setPwChanging(false); setDeleting(false); setAssigning(false); }}>
      <div className="relative bg-bg-card border border-border rounded-lg shadow-2xl w-full max-w-md my-auto" style={{ maxHeight: "calc(100vh - 2rem)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 className="font-semibold text-sm">{title}</h3>
          <button onClick={() => { setEditing(false); setPwChanging(false); setDeleting(false); setAssigning(false); }} className="text-text-dim hover:text-text p-1 -mr-1">×</button>
        </div>
        <div className="px-5 py-4 space-y-3 overflow-y-auto" style={{ maxHeight: "calc(100vh - 8rem)" }}>
          {body}
          {err && <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded px-3 py-2">{err}</div>}
          <div className="flex justify-end gap-2 pt-1">{actions}</div>
        </div>
      </div>
    </div>
  );

  if (editing || pwChanging || deleting || assigning) {
    let body: React.ReactNode = null;
    let actions: React.ReactNode = null;
    let title = "";
    if (editing) {
      title = "Edit manager";
      body = (
        <div>
          <label className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-1.5 block">Email</label>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      );
      actions = (
        <>
          <button onClick={() => setEditing(false)} className="btn-secondary text-sm">Cancel</button>
          <button onClick={saveEdit} disabled={loading} className="btn-primary text-sm">{loading ? "..." : "Save"}</button>
        </>
      );
    } else if (pwChanging) {
      title = "Change password";
      body = (
        <div>
          <label className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-1.5 block">New password (min 6 chars)</label>
          <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
      );
      actions = (
        <>
          <button onClick={() => setPwChanging(false)} className="btn-secondary text-sm">Cancel</button>
          <button onClick={savePassword} disabled={loading} className="btn-primary text-sm">{loading ? "..." : "Change password"}</button>
        </>
      );
    } else if (deleting) {
      title = "Delete manager";
      body = (
        <div className="text-sm">
          <p>Are you sure you want to delete <span className="font-mono text-text">{manager.email}</span>?</p>
          <p className="text-xs text-text-dim mt-1">Any apps they manage will become unassigned.</p>
        </div>
      );
      actions = (
        <>
          <button onClick={() => setDeleting(false)} className="btn-secondary text-sm">Cancel</button>
          <button onClick={doDelete} disabled={loading} className="text-sm px-3 py-1.5 rounded-md bg-danger text-white hover:bg-danger/90">{loading ? "..." : "Delete"}</button>
        </>
      );
    } else if (assigning) {
      title = "Assign apps";
      body = (
        <div>
          <p className="text-xs text-text-muted mb-2">Pick which apps this manager can access.</p>
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {apps.map((a) => (
              <label key={a.id} className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-bg-secondary hover:border-accent/30 cursor-pointer text-sm">
                <input type="checkbox" checked={selected.includes(a.id)} onChange={() => toggleApp(a.id)} className="accent-accent" />
                <FolderTree className="w-3.5 h-3.5 text-text-dim" />
                <span className="flex-1 truncate">{a.name}</span>
              </label>
            ))}
          </div>
        </div>
      );
      actions = (
        <>
          <button onClick={() => setAssigning(false)} className="btn-secondary text-sm">Cancel</button>
          <button onClick={saveAssign} disabled={loading} className="btn-primary text-sm">{loading ? "..." : "Save"}</button>
        </>
      );
    }
    return <>{modal(title, body, actions)}</>;
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-7 h-7 rounded-md flex items-center justify-center text-text-dim hover:bg-bg-hover hover:text-text"
        title="More"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-30 w-44 bg-bg-card border border-border rounded-md shadow-xl py-1">
          <button onClick={() => { setOpen(false); setAssigning(true); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-bg-hover text-left">
            <FolderTree className="w-3.5 h-3.5" /> Assign apps
          </button>
          <button onClick={() => { setOpen(false); setEditing(true); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-bg-hover text-left">
            <Edit3 className="w-3.5 h-3.5" /> Edit email
          </button>
          <button onClick={() => { setOpen(false); setPwChanging(true); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-bg-hover text-left">
            <Key className="w-3.5 h-3.5" /> Change password
          </button>
          <div className="border-t border-border my-1" />
          <button onClick={() => { setOpen(false); setDeleting(true); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-danger/10 text-danger text-left">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
