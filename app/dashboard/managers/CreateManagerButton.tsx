"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, UserCog, FolderTree, Shield, Code, Store, Copy, Check } from "lucide-react";

export function CreateManagerButton({ apps }: { apps: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"seller" | "developer" | "admin">("seller");
  const [selected, setSelected] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"create" | "assign" | "done">("create");
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [createdApp, setCreatedApp] = useState<{ app_id: string; app_secret: string; owner_secret: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  function reset() {
    setOpen(false);
    setEmail("");
    setPassword("");
    setSelected([]);
    setRole("seller");
    setErr(null);
    setStep("create");
    setCreatedId(null);
    setCreatedApp(null);
  }

  function toggleApp(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function createManager() {
    setErr(null);
    if (!email || !email.includes("@")) { setErr("Valid email required"); return; }
    if (password.length < 6) { setErr("Password must be at least 6 characters"); return; }
    setLoading(true);
    const r = await fetch("/api/admin/managers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    setLoading(false);
    const d = await r.json();
    if (!r.ok) { setErr(d.message || "Error"); return; }
    setCreatedId(d.data.id);
    if (d.data.app) {
      setCreatedApp({ app_id: d.data.app.app_id, app_secret: d.data.app.app_secret, owner_secret: d.data.app.owner_secret });
      setStep("done");
    } else {
      setStep("assign");
    }
  }

  async function saveAssign() {
    if (!createdId) return;
    setLoading(true);
    const r = await fetch(`/api/admin/managers/${createdId}/apps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appIds: selected }),
    });
    setLoading(false);
    const d = await r.json();
    if (!r.ok) { setErr(d.message || "Error"); return; }
    router.refresh();
    reset();
  }

  function copyAppCreds() {
    if (!createdApp) return;
    navigator.clipboard.writeText(`App ID: ${createdApp.app_id}\nApp Secret: ${createdApp.app_secret}\nOwner Secret: ${createdApp.owner_secret}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary text-sm">
        <Plus className="w-4 h-4" /> Create Manager
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={reset}>
      <div className="relative bg-bg-card border border-border rounded-lg shadow-2xl w-full max-w-md my-auto" style={{ maxHeight: "calc(100vh - 2rem)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <UserCog className="w-4 h-4 text-accent-glow" />
            {step === "create" ? "Create manager" : "Assign apps"}
          </h3>
          <button onClick={reset} className="text-text-dim hover:text-text p-1 -mr-1">×</button>
        </div>
        <div className="px-5 py-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 8rem)" }}>
          {step === "create" ? (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-1.5 block">Email *</label>
                <input type="email" className="input" placeholder="friend@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-1.5 block">Password *</label>
                <input type="password" className="input" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
                <p className="text-[10px] text-text-dim mt-1">Share this with the manager. They can change it later.</p>
              </div>
              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-1.5 block">Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["seller", "developer", "admin"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-md border text-sm transition ${
                        role === r
                          ? "border-accent/40 bg-accent/10 text-accent-glow"
                          : "border-border bg-bg-secondary text-text-muted hover:border-border-light"
                      }`}
                    >
                      {r === "seller" ? <Store className="w-4 h-4" /> : r === "developer" ? <Code className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      <span className="text-[10px] font-medium capitalize">{r}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-text-dim mt-1.5">
                  {role === "seller" ? "Can create users & licenses for assigned apps." : ""}
                  {role === "developer" ? "Gets their own App ID & secret. Full access." : ""}
                  {role === "admin" ? "Full access to everything." : ""}
                </p>
              </div>
              {err && <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded px-3 py-2">{err}</div>}
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={reset} className="btn-secondary text-sm">Cancel</button>
                <button onClick={createManager} disabled={loading} className="btn-primary text-sm">
                  {loading ? "..." : role === "developer" ? "Create" : "Next: assign apps"}
                </button>
              </div>
            </div>
          ) : step === "assign" ? (
            <div className="space-y-3">
              <p className="text-xs text-text-muted">
                Select which applications <span className="font-mono text-text">{email}</span> can manage. They can create licenses and users for these apps only.
              </p>
              {apps.length === 0 ? (
                <p className="text-sm text-text-dim">No applications yet — create some first.</p>
              ) : (
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {apps.map((a) => (
                    <label key={a.id} className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-bg-secondary hover:border-accent/30 cursor-pointer text-sm">
                      <input type="checkbox" checked={selected.includes(a.id)} onChange={() => toggleApp(a.id)} className="accent-accent" />
                      <FolderTree className="w-3.5 h-3.5 text-text-dim" />
                      <span className="flex-1 truncate">{a.name}</span>
                    </label>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-text-dim">Skip for now and assign later from the manager card.</p>
              {err && <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded px-3 py-2">{err}</div>}
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={reset} className="btn-secondary text-sm">Cancel</button>
                <button onClick={saveAssign} disabled={loading} className="btn-primary text-sm">
                  {loading ? "..." : "Done"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-success">
                <Check className="w-5 h-5" />
                <span className="font-semibold">Developer created!</span>
              </div>
              <p className="text-xs text-text-muted">Share these credentials with the developer.</p>
              <div className="bg-bg-secondary border border-border rounded p-3 font-mono text-xs space-y-2">
                <div><span className="text-text-dim">Email:</span> {email}</div>
                <div><span className="text-text-dim">Password:</span> {password}</div>
                <div className="border-t border-border pt-2 mt-2">
                  <span className="text-accent-glow text-[10px] font-semibold uppercase tracking-wider">Application</span>
                </div>
                <div><span className="text-text-dim">App ID:</span> {createdApp?.app_id}</div>
                <div><span className="text-text-dim">App Secret:</span> {createdApp?.app_secret}</div>
                <div><span className="text-text-dim">Owner Secret:</span> {createdApp?.owner_secret}</div>
              </div>
              <p className="text-[10px] text-warning flex items-center gap-1">
                Recordatorio: Guarda estas credenciales. No se mostrarán de nuevo.
              </p>
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={copyAppCreds} className="btn-secondary text-sm">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy all
                </button>
                <button onClick={reset} className="btn-primary text-sm">Done</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
