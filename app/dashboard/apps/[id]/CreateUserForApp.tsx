"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2, Copy, Check } from "lucide-react";

export function CreateUserForApp({ appId }: { appId: string }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [level, setLevel] = useState(1);
  const [unit, setUnit] = useState<"days" | "months" | "years" | "lifetime">("days");
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{ username: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  function gen() {
    setUsername(`user_${Math.random().toString(36).slice(2, 8)}`);
    setPassword(Math.random().toString(36).slice(2, 14) + "A1!");
  }

  async function create() {
    if (!username || !password) return;
    setLoading(true);
    const res = await fetch("/api/admin/app-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId, username, password, email, level, durationDays: duration, unit }),
    });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      alert(data.message || "Error");
      return;
    }
    setCreated({ username, password });
    setUsername("");
    setPassword("");
    setEmail("");
    router.refresh();
  }

  if (created) {
    return (
      <div>
        <p className="text-xs text-text-muted mb-2">User created</p>
        <div className="bg-bg rounded border border-border p-3 text-sm space-y-1.5 mb-3">
          <div className="flex justify-between"><span className="text-text-muted text-xs">username</span><code className="font-mono text-xs">{created.username}</code></div>
          <div className="flex justify-between"><span className="text-text-muted text-xs">password</span><code className="font-mono text-xs">{created.password}</code></div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(`user: ${created.username}\npass: ${created.password}`);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="btn-secondary text-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
            Copy
          </button>
          <button onClick={() => setCreated(null)} className="btn-primary text-xs">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="label text-xs">Username</label>
        <input className="input text-sm" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="john_doe" />
      </div>
      <div>
        <label className="label text-xs">Password</label>
        <div className="flex gap-2">
          <input className="input text-sm flex-1" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          <button onClick={gen} type="button" className="btn-secondary text-xs shrink-0">Generate</button>
        </div>
      </div>
      <div>
        <label className="label text-xs">Nivel de suscripción</label>
        <select className="input text-sm" value={level} onChange={(e) => setLevel(parseInt(e.target.value) || 1)}>
          <option value={1}>Basic (NEW - Nivel 1)</option>
          <option value={2}>VIP (Panel Supreme - Nivel 2)</option>
          <option value={3}>Combo (Basic + VIP - Nivel 3)</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label text-xs">Vencimiento</label>
          <select 
            className="input text-sm" 
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
            <option value="lifetime">De por vida</option>
          </select>
        </div>
        <div>
          <label className="label text-xs">Duración</label>
          <input 
            type="number" 
            min={1} 
            disabled={unit === "lifetime"}
            className="input text-sm font-mono disabled:opacity-55"
            value={duration} 
            onChange={(e) => setDuration(parseInt(e.target.value) || 1)} 
          />
        </div>
      </div>
      <div>
        <label className="label text-xs">Email (optional)</label>
        <input className="input text-sm" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
      </div>
      <button onClick={create} disabled={loading || !username || !password} className="btn-primary text-sm w-full">
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
        Create user
      </button>
    </div>
  );
}
