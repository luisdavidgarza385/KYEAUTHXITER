"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, User, Key, AppWindow, Loader2, Copy, Check, X, Eye, EyeOff, Info, HelpCircle, Trash2, ChevronDown,
} from "lucide-react";

type App = { id: string; name: string; level?: number };

export function CreateMenu({ apps }: { apps: App[] }) {
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<"user" | "license" | "app" | null>(null);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function pick(kind: "user" | "license" | "app") {
    setOpen(false);
    setModal(kind);
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} className="btn-primary text-sm">
        <Plus className="w-4 h-4" /> Create
        <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-70" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[200px] rounded-md border border-border bg-bg-card shadow-xl overflow-hidden">
          <button onClick={() => pick("user")} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-bg-hover transition">
            <User className="w-4 h-4 text-accent-glow" /> Create User
          </button>
          <button onClick={() => pick("license")} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-bg-hover transition border-t border-border">
            <Key className="w-4 h-4 text-accent-glow" /> Create License
          </button>
          <button onClick={() => pick("app")} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-bg-hover transition border-t border-border">
            <AppWindow className="w-4 h-4 text-accent-glow" /> Create Application
          </button>
        </div>
      )}
      {modal === "user" && <CreateUserModal apps={apps} onClose={() => setModal(null)} />}
      {modal === "license" && <CreateLicenseModal apps={apps} onClose={() => setModal(null)} />}
      {modal === "app" && <CreateAppModal onClose={() => setModal(null)} />}
    </div>
  );
}

export function ModalShell({
  title, children, onClose, width = "md",
}: { title: string; children: React.ReactNode; onClose: () => void; width?: "sm" | "md" | "lg" }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  const maxW = width === "sm" ? "max-w-sm" : width === "lg" ? "max-w-2xl" : "max-w-md";
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className={`relative bg-bg-card border border-border rounded-lg shadow-2xl w-full ${maxW} my-auto`}
        style={{ maxHeight: "calc(100vh - 2rem)" }}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 className="font-semibold text-sm">{title}</h3>
          <button onClick={onClose} className="text-text-dim hover:text-text p-1 -mr-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 8rem)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ children, required, info }: { children: React.ReactNode; required?: boolean; info?: string }) {
  return (
    <label className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-text-muted mb-1.5">
      <span>{children}{required && <span className="text-danger">*</span>}</span>
      {info && (
        <span title={info} className="text-text-dim hover:text-text cursor-help normal-case tracking-normal">
          <HelpCircle className="w-3.5 h-3.5" />
        </span>
      )}
    </label>
  );
}

function CreateUserModal({ apps, onClose, defaultAppId }: { apps: App[]; onClose: () => void; defaultAppId?: string }) {
  const router = useRouter();
  const [appId, setAppId] = useState(defaultAppId || apps[0]?.id || "");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState(generatePassword());
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [level, setLevel] = useState(1);
  const [unit, setUnit] = useState<"days" | "months" | "years" | "lifetime">("days");
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [created, setCreated] = useState<{ username: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedApp = apps.find((a) => a.id === appId);
  const appLevel = selectedApp?.level || 1;

  useEffect(() => {
    if (appLevel === 2) {
      setLevel(2);
    } else {
      setLevel(1);
    }
  }, [appId, appLevel]);

  async function submit() {
    setErr(null);
    if (!appId || !username || !password) {
      setErr("Application, username and password are required");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/admin/app-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId, username, password, email: email || undefined, level, durationDays: duration, unit }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setErr(data.message || "Error");
      return;
    }
    setCreated({ username, password });
    router.refresh();
  }

  function copyCreds() {
    if (!created) return;
    navigator.clipboard.writeText(`Username: ${created.username}\nPassword: ${created.password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <ModalShell title="Create user" onClose={onClose}>
      {created ? (
        <div>
          <p className="text-sm text-text-muted mb-3">
            Share these credentials with the user. The password won&apos;t be shown again.
          </p>
          <div className="bg-bg-secondary border border-border rounded p-3 font-mono text-sm space-y-1 mb-4">
            <div><span className="text-text-dim">Username:</span> {created.username}</div>
            <div><span className="text-text-dim">Password:</span> {created.password}</div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={copyCreds} className="btn-secondary text-sm">
              {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              Copy
            </button>
            <button onClick={onClose} className="btn-primary text-sm">Done</button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <FieldLabel required>Application</FieldLabel>
            <select className="input" value={appId} onChange={(e) => setAppId(e.target.value)}>
              {apps.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel required>Username</FieldLabel>
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. carlos" />
          </div>
          <div>
            <FieldLabel required>Password</FieldLabel>
            <div className="relative">
              <input
                className="input pr-20 font-mono"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-dim hover:text-text">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button type="button" onClick={() => setPassword(generatePassword())} className="text-xs text-accent-glow hover:text-accent mt-1.5">
              Generate random
            </button>
          </div>
          <div>
            <FieldLabel required>Nivel de suscripción</FieldLabel>
            <div className="flex items-center gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-text-muted hover:text-text">
                <input 
                  type="radio" 
                  name="user-level"
                  checked={level === 1} 
                  onChange={() => setLevel(1)} 
                  className="accent-accent w-4 h-4 cursor-pointer" 
                />
                <span>Basic</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-text-muted hover:text-text">
                <input 
                  type="radio" 
                  name="user-level"
                  checked={level === 2} 
                  onChange={() => setLevel(2)} 
                  className="accent-accent w-4 h-4 cursor-pointer" 
                />
                <span>VIP</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel required>Unidad de vencimiento</FieldLabel>
              <select 
                className="input" 
                value={unit} 
                onChange={(e) => {
                  setUnit(e.target.value as any);
                  if (e.target.value === "lifetime") {
                    setDuration(0);
                  } else if (duration === 0) {
                    setDuration(30);
                  }
                }}
              >
                <option value="days">Días</option>
                <option value="months">Meses</option>
                <option value="years">Años</option>
                <option value="lifetime">De por vida (Lifetime)</option>
              </select>
            </div>
            <div>
              <FieldLabel required>Duración</FieldLabel>
              <input 
                type="number" 
                min={1} 
                disabled={unit === "lifetime"}
                className="input font-mono disabled:opacity-55"
                value={duration} 
                onChange={(e) => setDuration(parseInt(e.target.value) || 1)} 
              />
            </div>
          </div>
          <div>
            <FieldLabel info="Optional email for the user">Email</FieldLabel>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
          </div>
          {err && <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded px-3 py-2">{err}</div>}
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
            <button onClick={submit} className="btn-primary text-sm" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create user"}
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}

function CreateLicenseModal({ apps, onClose, defaultAppId, forcePrefix }: { apps: App[]; onClose: () => void; defaultAppId?: string; forcePrefix?: boolean }) {
  const router = useRouter();
  const [appId, setAppId] = useState(defaultAppId || apps[0]?.id || "");
  const [packageName, setPackageName] = useState("");
  const [count, setCount] = useState(1);
  const [prefix, setPrefix] = useState("Guate Xiter");
  const [suffix, setSuffix] = useState("****-****-****-****");
  const [level, setLevel] = useState(1);
  const [note, setNote] = useState("");
  const [unit, setUnit] = useState<"days" | "months" | "years" | "lifetime">("days");
  const [duration, setDuration] = useState(1);

  const selectedApp = apps.find((a) => a.id === appId);
  const appLevel = selectedApp?.level || 1;

  useEffect(() => {
    if (level === 1) {
      setPackageName("basic");
      setPrefix("Guate Xiter");
    } else if (level === 2) {
      setPackageName("VIP");
      setPrefix("Guate Xiter");
    }
  }, [level]);
  const [hwidLock, setHwidLock] = useState(false);
  const [ipLock, setIpLock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [generated, setGenerated] = useState<string[] | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit() {
    setErr(null);
    if (!appId) { setErr("Application required"); return; }
    if (count < 1 || count > 500) { setErr("Cantidad debe ser entre 1 y 500"); return; }
    if (duration < 1 && unit !== "lifetime") { setErr("Duración inválida"); return; }
    
    setLoading(true);
    let durationDays = duration;
    if (unit === "months") durationDays = duration * 30;
    else if (unit === "years") durationDays = duration * 365;
    else if (unit === "lifetime") durationDays = 36500;
    
    const res = await fetch("/api/admin/licenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appId,
        count,
        durationDays,
        level,
        maxUses: 1,
        hwidLock,
        ipLock,
        prefix,
        suffix,
        packageName,
        note
      }),
    });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) { setErr(data.message || "Error"); return; }
    setGenerated(data.data.keys);
    router.refresh();
  }

  function copyAll() {
    if (!generated) return;
    navigator.clipboard.writeText(generated.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <ModalShell title="Generar licencias" onClose={onClose} width="md">
      {generated ? (
        <div className="space-y-4">
          <p className="text-xs text-zinc-400 mb-3">Copia y guarda las licencias ahora — no se volverán a mostrar.</p>
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 max-h-64 overflow-y-auto font-mono text-xs text-emerald-400 space-y-1 mb-4 select-all">
            {generated.map((k) => <div key={k}>{k}</div>)}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={copyAll} className="btn-secondary text-sm">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />} Copiar todas
            </button>
            <button onClick={onClose} className="btn-primary text-sm">Listo</button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 text-zinc-300">
          <div className="text-[11px] font-bold text-zinc-500 uppercase -mt-2">
            Plan: <span className="text-emerald-400">Ilimitado (sin costo)</span>
          </div>
          
          <div className="h-px bg-zinc-800/80 my-2" />

          <div>
            <FieldLabel required>Aplicación</FieldLabel>
            <select className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 px-3 py-2 rounded-lg text-sm outline-none focus:border-emerald-500/50 transition" value={appId} onChange={(e) => setAppId(e.target.value)}>
              {apps.map((a) => <option key={a.id} value={a.id} className="bg-zinc-950">{a.name}</option>)}
            </select>
          </div>

          <div>
            <FieldLabel required>Nivel de Suscripción</FieldLabel>
            <div className="flex items-center gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300 hover:text-white">
                <input 
                  type="radio" 
                  name="license-level"
                  checked={level === 1} 
                  onChange={() => setLevel(1)} 
                  className="accent-emerald-500 w-4 h-4 cursor-pointer" 
                />
                <span>Basic</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300 hover:text-white">
                <input 
                  type="radio" 
                  name="license-level"
                  checked={level === 2} 
                  onChange={() => setLevel(2)} 
                  className="accent-emerald-500 w-4 h-4 cursor-pointer" 
                />
                <span>VIP</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Cantidad</FieldLabel>
              <input 
                type="number" 
                min={1} 
                max={500} 
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-650 px-3 py-2 rounded-lg text-sm outline-none focus:border-purple-500/50 transition font-mono" 
                value={count} 
                onChange={(e) => setCount(parseInt(e.target.value) || 1)} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Unidad de vencimiento</FieldLabel>
              <select 
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2 rounded-lg text-sm outline-none focus:border-purple-500/50 transition" 
                value={unit} 
                onChange={(e) => {
                  setUnit(e.target.value as any);
                  if (e.target.value === "lifetime") {
                    setDuration(0);
                  } else if (duration === 0) {
                    setDuration(1);
                  }
                }}
              >
                <option value="days" className="bg-zinc-950">Días</option>
                <option value="months" className="bg-zinc-950">Meses</option>
                <option value="years" className="bg-zinc-950">Años</option>
                <option value="lifetime" className="bg-zinc-950">De por vida (Lifetime)</option>
              </select>
            </div>
            <div>
              <FieldLabel required>Duración</FieldLabel>
              <input 
                type="number" 
                min={1} 
                disabled={unit === "lifetime"}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2 rounded-lg text-sm outline-none focus:border-purple-500/50 transition font-mono disabled:opacity-55"
                value={duration} 
                onChange={(e) => setDuration(parseInt(e.target.value) || 1)} 
              />
            </div>
          </div>

          <div className="bg-zinc-900/60 rounded-lg p-3 border border-zinc-800/80 text-[11px] text-zinc-400 font-medium">
            <div className="flex items-center gap-2 text-zinc-500 uppercase text-[10px] tracking-wider mb-1">
              <Info className="w-3.5 h-3.5 text-emerald-500" /> Vista previa
            </div>
            <code className="font-mono text-zinc-300 text-[12px]">
              {prefix || "Guate Xiter"}-{suffix || "****-****-****-****"}
            </code>
          </div>

          <div className="flex items-center gap-4 text-xs pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer text-zinc-400 hover:text-zinc-200">
              <input type="checkbox" checked={hwidLock} onChange={(e) => setHwidLock(e.target.checked)} className="accent-emerald-500 w-4 h-4 rounded cursor-pointer" />
              <span>Bloqueo HWID</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-zinc-400 hover:text-zinc-200">
              <input type="checkbox" checked={ipLock} onChange={(e) => setIpLock(e.target.checked)} className="accent-emerald-500 w-4 h-4 rounded cursor-pointer" />
              <span>Bloqueo IP</span>
            </label>
          </div>

          {err && <div className="text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg px-3 py-2">{err}</div>}
          
          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800/40">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200 transition">
              Cancelar
            </button>
            <button 
              type="button" 
              onClick={submit} 
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white shadow-lg shadow-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Crear licencia"}
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}

function CreateAppModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (!name.trim()) { setErr("Name is required"); return; }
    setLoading(true);
    const res = await fetch("/api/admin/apps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), level: 3 }),
    });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) { setErr(data.message || "Error"); return; }
    onClose();
    router.push(`/dashboard/apps/${data.data.id}`);
  }

  return (
    <ModalShell title="Create Application" onClose={onClose}>
      <div className="space-y-3">
        <div>
          <FieldLabel required>Application name</FieldLabel>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. MySoftware" />
          <p className="text-xs text-text-dim mt-1">You can change the name later.</p>
        </div>

        {err && <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded px-3 py-2">{err}</div>}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
          <button onClick={submit} className="btn-primary text-sm" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create application"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

export function CreateAppInlineButton({ label = "Create Application", className }: { label?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className || "btn-primary text-sm"}
      >
        <Plus className="w-4 h-4" /> {label}
      </button>
      {open && <CreateAppModal onClose={() => setOpen(false)} />}
    </>
  );
}

export function CreateUserInlineButton({ apps, defaultAppId, label = "Create User", className }: { apps: App[]; defaultAppId?: string; label?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className || "btn-primary text-sm"}
      >
        <User className="w-4 h-4" /> {label}
      </button>
      {open && <CreateUserModal apps={apps} onClose={() => setOpen(false)} defaultAppId={defaultAppId} />}
    </>
  );
}

export function CreateLicenseInlineButton({ apps, defaultAppId, label = "Create License", className, forcePrefix }: { apps: App[]; defaultAppId?: string; label?: string; className?: string; forcePrefix?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className || "btn-primary text-sm"}
      >
        <Key className="w-4 h-4" /> {label}
      </button>
      {open && <CreateLicenseModal apps={apps} onClose={() => setOpen(false)} defaultAppId={defaultAppId} forcePrefix={forcePrefix} />}
    </>
  );
}

export function BulkDeleteLicensesModal({ apps, onClose }: { apps: App[]; onClose: () => void }) {
  const router = useRouter();
  const [mode, setMode] = useState<"all" | "unused" | "used" | "banned">("unused");
  const [appId, setAppId] = useState(apps[0]?.id || "all");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!confirm(`Delete all ${mode} licenses${appId !== "all" ? " for this app" : ""}?`)) return;
    setLoading(true);
    const res = await fetch("/api/admin/licenses/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, appId: appId === "all" ? undefined : appId }),
    });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) { alert(data.message || "Error"); return; }
    onClose();
    router.refresh();
  }

  return (
    <ModalShell title="Delete license(s)" onClose={onClose} width="sm">
      <div className="space-y-3">
        <div>
          <FieldLabel required>Modo de eliminación</FieldLabel>
          <select className="input" value={mode} onChange={(e) => setMode(e.target.value as any)}>
            <option value="all">All</option>
            <option value="unused">Unused only</option>
            <option value="used">Used only</option>
            <option value="banned">Banned only</option>
          </select>
        </div>
        <div>
          <FieldLabel>Application</FieldLabel>
          <select className="input" value={appId} onChange={(e) => setAppId(e.target.value)}>
            <option value="all">All applications</option>
            {apps.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
          <button onClick={submit} className="btn-danger text-sm" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Delete license(s)</>}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pw = "";
  for (let i = 0; i < 12; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}
