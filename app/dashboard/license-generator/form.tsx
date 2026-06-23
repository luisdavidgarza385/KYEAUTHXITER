"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Copy, Check, Info, Eye, EyeOff } from "lucide-react";

type App = { id: string; name: string };

export function GeneratorForm({ apps, forcePrefix }: { apps: App[]; forcePrefix: boolean }) {
  const router = useRouter();
  const [appId, setAppId] = useState(apps[0]?.id || "");
  const [packageName, setPackageName] = useState("");
  const [count, setCount] = useState(1);
  const [prefix, setPrefix] = useState(forcePrefix ? "KEYAUTHPRO" : "Spectral X");
  const [suffix, setSuffix] = useState("****-****-****-****");
  const [level, setLevel] = useState(1);
  useEffect(() => {
    if (level === 1) {
      setPackageName("basic");
    } else if (level === 2) {
      setPackageName("VIP");
    }
  }, [level]);

  useEffect(() => {
    setPrefix((prev) => {
      if (forcePrefix) return "KEYAUTHPRO";
      if (prev === "KEYAUTHPRO" || !prev) return "Spectral X";
      return prev;
    });
  }, [forcePrefix]);
  const [note, setNote] = useState("");
  const [durationDisplay, setDurationDisplay] = useState("1|days");
  const [hwidLock, setHwidLock] = useState(false);
  const [ipLock, setIpLock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [generated, setGenerated] = useState<string[] | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedApp = apps.find((a) => a.id === appId);

  async function submit() {
    setErr(null);
    if (!appId) { setErr("Application required"); return; }
    if (count < 1 || count > 500) { setErr("Count must be between 1 and 500"); return; }
    const [durVal, durUnit] = durationDisplay.split("|");
    let durationDays = parseInt(durVal);
    if (durUnit === "months") durationDays *= 30;
    else if (durUnit === "years") durationDays *= 365;
    setLoading(true);
    const res = await fetch("/api/admin/licenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appId,
        count,
        durationDays: durationDays,
        level,
        maxUses: 1,
        hwidLock,
        ipLock,
        prefix,
        suffix,
        packageName,
        note,
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

  function resetForm() {
    setGenerated(null);
    setCopied(false);
    setErr(null);
  }

  if (generated) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Licencias generadas</h3>
          <button onClick={resetForm} className="btn-secondary text-xs">Crear más</button>
        </div>
        <div className="bg-bg-secondary border border-border rounded p-3 max-h-72 overflow-y-auto font-mono text-xs space-y-1 mb-4">
          {generated.map((k, i) => <div key={i}>{k}</div>)}
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={copyAll} className="btn-secondary text-sm">
            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />} Copiar todo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h3 className="font-semibold">Generar licencias</h3>

      <div className="flex items-center gap-3 px-4 py-3 bg-accent/5 border border-accent/20 rounded-lg text-sm">
        <span className="text-text-dim">Plan:</span>
        <span className="font-semibold text-accent">Ilimitado (sin costo)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-1.5 block">
              Aplicación <span className="text-danger">*</span>
            </label>
            <select className="input" value={appId} onChange={(e) => setAppId(e.target.value)}>
              {apps.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            {selectedApp && (
              <p className="text-[10px] text-text-dim mt-1">ID: <code className="text-text-muted">{selectedApp.id}</code></p>
            )}
          </div>



          <div>
            <label className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-1.5 block">
              Cantidad <span className="text-danger">*</span>
            </label>
            <input type="number" min={1} max={500} className="input" value={count} onChange={(e) => setCount(parseInt(e.target.value) || 1)} />
          </div>

          <div>
            <label className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-1.5 block">
              Nivel de Suscripción <span className="text-danger">*</span>
            </label>
            <div className="flex items-center gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-text-muted hover:text-text">
                <input 
                  type="radio" 
                  name="generator-level"
                  checked={level === 1} 
                  onChange={() => setLevel(1)} 
                  className="accent-accent w-4 h-4 cursor-pointer" 
                />
                <span>Basic</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-text-muted hover:text-text">
                <input 
                  type="radio" 
                  name="generator-level"
                  checked={level === 2} 
                  onChange={() => setLevel(2)} 
                  className="accent-accent w-4 h-4 cursor-pointer" 
                />
                <span>VIP</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-1.5 block">
              Duración <span className="text-danger">*</span>
            </label>
            <select className="input" value={durationDisplay} onChange={(e) => setDurationDisplay(e.target.value)}>
              <option value="1|days">1 día</option>
              <option value="3|days">3 días</option>
              <option value="7|days">7 días</option>
              <option value="15|days">15 días</option>
              <option value="30|days">30 días</option>
              <option value="90|days">90 días</option>
              <option value="180|days">180 días</option>
              <option value="365|days">365 días</option>
              <option value="1|months">1 mes</option>
              <option value="3|months">3 meses</option>
              <option value="6|months">6 meses</option>
              <option value="12|months">12 meses</option>
              <option value="1|years">1 año</option>
              <option value="0|lifetime">De por vida</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-1.5 block">
              Formato de licencia <span className="text-danger">*</span>
            </label>
            <div className="flex items-stretch gap-0">
              <input
                className="input rounded-r-none border-r-0 flex-1 disabled:opacity-60 disabled:cursor-not-allowed"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="Spectral X"
                disabled={forcePrefix}
              />
              <span className="flex items-center justify-center px-2 bg-bg-secondary border border-border text-text-dim font-mono">-</span>
              <input
                className="input rounded-l-none border-l-0 flex-[2] font-mono"
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
                placeholder="****-****-****-****"
              />
            </div>
            {forcePrefix && <p className="text-[10px] text-text-dim mt-1">Compra una suscripción para cambiar el prefijo.</p>}
            <p className="text-[11px] text-text-dim mt-1.5 flex items-center gap-1.5">
              <Info className="w-3 h-3" />
              Vista previa: <code className="font-mono text-text-muted">{prefix || "—"}-{suffix || "****"}</code>
            </p>
          </div>



          <div>
            <label className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-1.5 block">
              Nota (opcional)
            </label>
            <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. License for VIP user" />
          </div>

          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-1.5 cursor-pointer text-text-muted">
              <input type="checkbox" checked={hwidLock} onChange={(e) => setHwidLock(e.target.checked)} className="accent-accent" />
              HWID lock
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-text-muted">
              <input type="checkbox" checked={ipLock} onChange={(e) => setIpLock(e.target.checked)} className="accent-accent" />
              IP lock
            </label>
          </div>
        </div>
      </div>

      {err && <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded px-3 py-2">{err}</div>}

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <button onClick={submit} className="btn-primary text-sm flex items-center gap-1.5" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? "Generando..." : "Generar licencias"}
        </button>
      </div>
    </div>
  );
}
