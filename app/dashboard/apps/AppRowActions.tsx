"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Pause, Play, Trash2, FileText, Check, Ban } from "lucide-react";

export function AppRowActions({ app, isSelected }: { app: { id: string; name: string; status: string; version: string }; isSelected: boolean }) {
  const router = useRouter();
  const [renaming, setRenaming] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [name, setName] = useState(app.name);
  const [version, setVersion] = useState(app.version);
  const [status, setStatus] = useState(app.status);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function saveRename() {
    setErr(null);
    if (!name.trim()) { setErr("Name required"); return; }
    setLoading(true);
    const r = await fetch(`/api/admin/apps/${app.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setLoading(false);
    const d = await r.json();
    if (!r.ok) { setErr(d.message || "Error"); return; }
    setRenaming(false);
    router.refresh();
  }

  async function saveEdit() {
    setErr(null);
    setLoading(true);
    const r = await fetch(`/api/admin/apps/${app.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, version, status }),
    });
    setLoading(false);
    const d = await r.json();
    if (!r.ok) { setErr(d.message || "Error"); return; }
    setEditing(false);
    router.refresh();
  }

  async function togglePause() {
    setLoading(true);
    const newStatus = app.status === "paused" ? "active" : "paused";
    const r = await fetch(`/api/admin/apps/${app.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    if (r.ok) router.refresh();
  }

  async function doDelete() {
    setErr(null);
    setLoading(true);
    const r = await fetch(`/api/admin/apps/${app.id}`, { method: "DELETE" });
    setLoading(false);
    const d = await r.json();
    if (!r.ok) { setErr(d.message || "Error"); return; }
    setDeleting(false);
    router.refresh();
  }

  const modal = (title: string, body: React.ReactNode, actions: React.ReactNode, color: string = "bg-bg-card") => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => { setRenaming(false); setEditing(false); setDeleting(false); }}>
      <div className={"relative border border-border rounded-lg shadow-2xl w-full max-w-md my-auto " + color} style={{ maxHeight: "calc(100vh - 2rem)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 className="font-semibold text-sm">{title}</h3>
          <button onClick={() => { setRenaming(false); setEditing(false); setDeleting(false); }} className="text-text-dim hover:text-text p-1 -mr-1">×</button>
        </div>
        <div className="px-5 py-4 space-y-3 overflow-y-auto" style={{ maxHeight: "calc(100vh - 8rem)" }}>
          {body}
          {err && <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded px-3 py-2">{err}</div>}
          <div className="flex justify-end gap-2 pt-1">{actions}</div>
        </div>
      </div>
    </div>
  );

  if (renaming) {
    return modal(
      "Rename application",
      <div>
        <label className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-1.5 block">Application name</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </div>,
      <>
        <button onClick={() => setRenaming(false)} className="btn-secondary text-sm">Cancel</button>
        <button onClick={saveRename} disabled={loading} className="btn-primary text-sm">{loading ? "..." : "Save"}</button>
      </>
    );
  }

  if (editing) {
    return modal(
      "Edit description / version",
      <div className="space-y-3">
        <div>
          <label className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-1.5 block">Application name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-1.5 block">App version</label>
          <input className="input" value={version} onChange={(e) => setVersion(e.target.value)} />
        </div>
        <div>
          <label className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-1.5 block">Status</label>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="banned">Banned</option>
          </select>
        </div>
        <p className="text-[10px] text-text-dim">Use Status to pause or ban this application across all of your end-users.</p>
      </div>,
      <>
        <button onClick={() => setEditing(false)} className="btn-secondary text-sm">Cancel</button>
        <button onClick={saveEdit} disabled={loading} className="btn-primary text-sm">{loading ? "..." : "Save"}</button>
      </>
    );
  }

  if (deleting) {
    return modal(
      "Delete application",
      <div className="text-sm">
        <p>Are you sure you want to delete <span className="font-mono text-text">{app.name}</span>?</p>
        <p className="text-xs text-text-dim mt-2">This will also delete all users, licenses, sessions, variables and logs for this application. This cannot be undone.</p>
      </div>,
      <>
        <button onClick={() => setDeleting(false)} className="btn-secondary text-sm">Cancel</button>
        <button onClick={doDelete} disabled={loading} className="text-sm px-3 py-1.5 rounded-md bg-danger text-white hover:bg-danger/90">{loading ? "..." : "Delete"}</button>
      </>
    );
  }

  return (
    <>
      <ActionButton color="purple" icon={Pencil} title="Rename" onClick={() => setRenaming(true)} />
      <ActionButton color="blue" icon={FileText} title="Edit Description" onClick={() => setEditing(true)} />
      <ActionButton color="orange" icon={app.status === "paused" ? Play : Pause} title={app.status === "paused" ? "Resume" : "Pause"} onClick={togglePause} />
      <ActionButton color="red" icon={Trash2} title="Delete" onClick={() => setDeleting(true)} />
    </>
  );
}

function ActionButton({ color, icon: Icon, title, onClick }: { color: string; icon: any; title: string; onClick?: () => void }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-500/15 text-blue-300 border-blue-500/30 hover:bg-blue-500/25",
    purple: "bg-purple-500/15 text-purple-300 border-purple-500/30 hover:bg-purple-500/25",
    orange: "bg-orange-500/15 text-orange-300 border-orange-500/30 hover:bg-orange-500/25",
    red: "bg-danger/15 text-danger border-danger/30 hover:bg-danger/25",
  };
  return (
    <button
      title={title}
      onClick={onClick}
      className={"inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs border transition " + (colors[color] || colors.blue)}
    >
      <Icon className="w-3.5 h-3.5" />
      {title}
    </button>
  );
}
