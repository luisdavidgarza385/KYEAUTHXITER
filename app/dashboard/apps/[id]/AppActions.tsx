"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, Pause, Play, Trash2, Save, X } from "lucide-react";
import type { App } from "@/lib/store/types";

export function AppActions({ app }: { app: App }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(app.name);
  const [version, setVersion] = useState(app.version);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const res = await fetch(`/api/admin/apps/${app.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, version }),
    });
    setBusy(false);
    const data = await res.json();
    if (!res.ok) {
      alert(data.message || "Error");
      return;
    }
    setEditing(false);
    router.refresh();
  }

  async function toggleStatus() {
    setBusy(true);
    const next = app.status === "paused" ? "active" : "paused";
    await fetch(`/api/admin/apps/${app.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    router.refresh();
  }

  async function del() {
    if (!confirm(`Delete "${app.name}" and all its users, licenses and sessions?`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/apps/${app.id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) {
      router.push("/dashboard/apps");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.message || "Error");
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 bg-bg-card border border-border rounded-md p-2">
        <input className="input text-sm w-40" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <input className="input text-sm w-20" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="1.0" />
        <button onClick={save} disabled={busy} className="btn-primary text-xs px-3 py-1.5">
          <Save className="w-3.5 h-3.5" /> Save
        </button>
        <button onClick={() => { setEditing(false); setName(app.name); setVersion(app.version); }} className="btn-secondary text-xs px-3 py-1.5">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => setEditing(true)} className="btn-secondary text-sm">
        <Edit className="w-3.5 h-3.5" /> Edit
      </button>
      <button onClick={toggleStatus} disabled={busy} className="btn-secondary text-sm">
        {app.status === "paused" ? <><Play className="w-3.5 h-3.5" /> Resume</> : <><Pause className="w-3.5 h-3.5" /> Pause</>}
      </button>
      <button onClick={del} disabled={busy} className="btn-danger text-sm">
        <Trash2 className="w-3.5 h-3.5" /> Delete
      </button>
    </div>
  );
}
