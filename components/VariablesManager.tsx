"use client";
import { useState } from "react";
import { Plus, Trash2, Loader2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

type App = { id: string; name: string };

type Variable = {
  id: string;
  app_id: string;
  name: string;
  value: string;
  authed: boolean;
};

export function VariablesManager({ apps }: { apps: App[] }) {
  const [appId, setAppId] = useState(apps[0]?.id || "");
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [authed, setAuthed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [vars, setVars] = useState<Variable[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const router = useRouter();

  async function loadVars(id: string) {
    setLoaded(false);
    const res = await fetch(`/api/admin/variables?app=${id}`);
    const data = await res.json();
    if (res.ok) {
      setVars(data.data || []);
    }
    setLoaded(true);
  }

  async function add() {
    if (!appId || !name) return;
    setLoading(true);
    const res = await fetch("/api/admin/variables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId, name, value, authed }),
    });
    setLoading(false);
    if (res.ok) {
      setName("");
      setValue("");
      loadVars(appId);
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.message || "Error");
    }
  }

  async function del(id: string) {
    if (!confirm("Delete this variable?")) return;
    await fetch(`/api/admin/variables?id=${id}`, { method: "DELETE" });
    loadVars(appId);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select
          className="input max-w-xs"
          value={appId}
          onChange={(e) => {
            setAppId(e.target.value);
            loadVars(e.target.value);
          }}
        >
          {apps.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      <div className="rounded border border-border bg-bg-secondary/40 p-3 space-y-2">
        <div className="grid sm:grid-cols-2 gap-2">
          <input className="input" placeholder="var_name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input" placeholder="value" value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={authed} onChange={(e) => setAuthed(e.target.checked)} className="accent-accent" />
            Requires authentication
          </label>
          <button onClick={add} disabled={loading || !appId} className="btn-primary text-sm">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Add
          </button>
        </div>
      </div>

      {appId && (
        loaded ? (
          vars.length === 0 ? (
            <p className="text-sm text-text-dim text-center py-4">No variables yet</p>
          ) : (
            <div className="rounded border border-border divide-y divide-border">
              {vars.map((v) => (
                <div key={v.id} className="flex items-center gap-2 px-3 py-2 text-sm">
                  <code className="font-mono text-xs text-accent-glow shrink-0">{v.name}</code>
                  <code className="font-mono text-xs text-text-muted truncate flex-1">
                    {showValues[v.id] ? v.value : "••••••"}
                  </code>
                  {v.authed && <span className="badge-accent text-[10px]">auth</span>}
                  <button onClick={() => setShowValues((s) => ({ ...s, [v.id]: !s[v.id] }))} className="text-text-dim hover:text-text">
                    {showValues[v.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => del(v.id)} className="text-text-dim hover:text-danger">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-3 text-sm text-text-dim">Loading...</div>
        )
      )}
    </div>
  );
}
