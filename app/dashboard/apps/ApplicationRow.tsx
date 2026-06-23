"use client";
import Link from "next/link";
import { Check, Pencil, Pause, Play, Trash2, FileText } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ApplicationRow({ app, userCount, isSelected }: { app: any; userCount: number; isSelected: boolean }) {
  const router = useRouter();
  const [renaming, setRenaming] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [name, setName] = useState(app.name);
  const [version, setVersion] = useState(app.version);
  const [status, setStatus] = useState(app.status);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const standing = app.status === "active" ? { label: "Good", cls: "text-success" } : app.status === "paused" ? { label: "Paused", cls: "text-warning" } : { label: "Banned", cls: "text-danger" };

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

  const modal = (title: string, body: React.ReactNode, actions: React.ReactNode) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => { setRenaming(false); setEditing(false); setDeleting(false); }}>
      <div className="relative bg-bg-card border border-border rounded-lg shadow-2xl w-full max-w-md my-auto" style={{ maxHeight: "calc(100vh - 2rem)" }} onClick={(e) => e.stopPropagation()}>
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
    return <div>{modal("Rename application",
      <div>
        <label className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-1.5 block">Application name</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </div>,
      <>
        <button onClick={() => setRenaming(false)} className="btn-secondary text-sm">Cancel</button>
        <button onClick={saveRename} disabled={loading} className="btn-primary text-sm">{loading ? "..." : "Save"}</button>
      </>
    )}{rowBody()}</div>;
  }
  if (editing) {
    return <div>{modal("Edit application",
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
      </div>,
      <>
        <button onClick={() => setEditing(false)} className="btn-secondary text-sm">Cancel</button>
        <button onClick={saveEdit} disabled={loading} className="btn-primary text-sm">{loading ? "..." : "Save"}</button>
      </>
    )}{rowBody()}</div>;
  }
  if (deleting) {
    return <div>{modal("Delete application",
      <div className="text-sm">
        <p>Are you sure you want to delete <span className="font-mono text-text">{app.name}</span>?</p>
        <p className="text-xs text-text-dim mt-2">This will also delete all users, licenses, sessions, variables and logs. Cannot be undone.</p>
      </div>,
      <>
        <button onClick={() => setDeleting(false)} className="btn-secondary text-sm">Cancel</button>
        <button onClick={doDelete} disabled={loading} className="text-sm px-3 py-1.5 rounded-md bg-danger text-white hover:bg-danger/90">{loading ? "..." : "Delete"}</button>
      </>
    )}{rowBody()}</div>;
  }

  function rowBody() {
    return (
      <div className={"rounded-md border bg-bg-secondary p-3 transition " + (isSelected ? "border-accent/40" : "border-border hover:border-border-light")}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link href={`/dashboard/apps?selected=${app.id}`} className="flex items-center gap-2 min-w-0 flex-1">
            <h3 className="font-semibold truncate">{app.name}</h3>
            {app.status === "active" && <span className="badge-success text-[10px]">ACTIVE</span>}
            {app.status === "paused" && <span className="badge-warning text-[10px]">PAUSED</span>}
            {app.status === "banned" && <span className="badge-danger text-[10px]">BANNED</span>}
          </Link>
          <Link
            href={`/dashboard/apps/${app.id}`}
            className="text-xs text-accent-glow hover:text-accent"
          >
            Open →
          </Link>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-[10px] text-text-dim uppercase tracking-wider">
          <div>
            <div>App Version</div>
            <div className="text-sm text-text font-mono mt-0.5">{app.version}</div>
          </div>
          <div>
            <div>Users</div>
            <div className="text-sm text-text font-mono mt-0.5">{userCount}</div>
          </div>
          <div>
            <div>Application Standing</div>
            <div className={"text-sm font-semibold mt-0.5 " + standing.cls}>{standing.label}</div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Link
            href={`/dashboard/apps?selected=${app.id}`}
            className={"inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs border transition " + (isSelected ? "bg-accent/20 text-accent-glow border-accent/40" : "bg-blue-500/15 text-blue-300 border-blue-500/30 hover:bg-blue-500/25")}
          >
            <Check className="w-3.5 h-3.5" />
            {isSelected ? "Selected" : "Select"}
          </Link>
          <button
            onClick={() => setRenaming(true)}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs border bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25 transition"
          >
            <Pencil className="w-3.5 h-3.5" />
            Rename
          </button>
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs border bg-blue-500/15 text-blue-300 border-blue-500/30 hover:bg-blue-500/25 transition"
          >
            <FileText className="w-3.5 h-3.5" />
            Edit Description
          </button>
          <button
            onClick={togglePause}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs border bg-orange-500/15 text-orange-300 border-orange-500/30 hover:bg-orange-500/25 transition disabled:opacity-50"
          >
            {app.status === "paused" ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            {app.status === "paused" ? "Resume" : "Pause"}
          </button>
          <button
            onClick={() => setDeleting(true)}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs border bg-danger/15 text-danger border-danger/30 hover:bg-danger/25 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>
    );
  }

  return rowBody();
}
