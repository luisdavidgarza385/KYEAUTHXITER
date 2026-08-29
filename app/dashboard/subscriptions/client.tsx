"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Gift } from "lucide-react";

type App = { id: string; name: string };
type AdminWithSub = { id: string; email: string; role: string; created_at: string; subscription_end: string | null; subscription_app_id: string | null };

export function SubscriptionsClient({ admins, apps, myId, now }: { admins: AdminWithSub[]; apps: App[]; myId: string; now: number }) {
  const router = useRouter();
  const [granting, setGranting] = useState<string | null>(null);
  const [duration, setDuration] = useState(30);

  async function grant(adminId: string) {
    const res = await fetch("/api/admin/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminId, durationDays: duration }),
    });
    if (!res.ok) { const d = await res.json(); alert(d.message || "Error"); return; }
    setGranting(null);
    router.refresh();
  }

  async function revoke(adminId: string) {
    if (!confirm("Revoke this subscription?")) return;
    await fetch(`/api/admin/subscriptions?adminId=${adminId}`, { method: "DELETE" });
    router.refresh();
  }

  function hasActiveSub(admin: AdminWithSub): boolean {
    if (!admin.subscription_end) return false;
    return new Date(admin.subscription_end).getTime() > now;
  }

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-bg-secondary/60 text-text-dim text-[11px] uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Role</th>
            <th className="px-4 py-3 text-left">Registered</th>
            <th className="px-4 py-3 text-left">Subscription</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {admins.filter((a) => a.id !== myId).map((admin) => {
            const active = hasActiveSub(admin);
            const isGranting = granting === admin.id;
            return (
              <tr key={admin.id} className="border-t border-border/60 hover:bg-bg-secondary/30 transition">
                <td className="px-4 py-3 font-medium">{admin.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                    admin.role === "developer" ? "border-accent/30 bg-accent/10 text-accent-glow"
                    : admin.role === "admin" ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                    : "border-text-dim/30 bg-text-dim/10 text-text-muted"
                  }`}>{admin.role}</span>
                </td>
                <td className="px-4 py-3 text-xs text-text-muted">{formatDate(admin.created_at)}</td>
                <td className="px-4 py-3">
                  {active ? (
                    <span className="flex items-center gap-1.5 text-success text-xs">
                      <Check className="w-3.5 h-3.5" />
                      Expires {formatDate(admin.subscription_end!)}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-text-dim text-xs">
                      <X className="w-3.5 h-3.5" />
                      No active sub
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {isGranting ? (
                    <div className="flex items-center gap-2 justify-end">
                      <select className="input text-xs py-1 w-20" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))}>
                        <option value="7">7d</option>
                        <option value="15">15d</option>
                        <option value="30">30d</option>
                        <option value="90">90d</option>
                        <option value="180">180d</option>
                        <option value="365">365d</option>
                      </select>
                      <button onClick={() => grant(admin.id)} className="btn-primary text-xs py-1">Grant</button>
                      <button onClick={() => setGranting(null)} className="btn-secondary text-xs py-1">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setGranting(admin.id)}
                        className="text-xs flex items-center gap-1 text-accent-glow hover:text-accent"
                      >
                        <Gift className="w-3.5 h-3.5" /> Grant sub
                      </button>
                      {active && (
                        <button
                          onClick={() => revoke(admin.id)}
                          className="text-xs text-danger hover:text-danger/80"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false,
  });
}
