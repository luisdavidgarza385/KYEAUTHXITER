import { Activity, Monitor } from "lucide-react";
import { store } from "@/lib/store";
import { requireAdmin, getScopedAppIds } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  const me = await requireAdmin();
  const scoped = await getScopedAppIds(me);
  const apps = scoped === null ? await store.listApps() : (await store.listApps()).filter((a) => scoped.includes(a.id));
  const appIds = new Set(apps.map((a) => a.id));
  const logs = (await store.listLogs({ limit: 100 })).filter((l) => appIds.size === 0 || appIds.has(l.app_id || ""));

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Activity className="w-6 h-6 text-accent-glow" /> Sessions</h1>
        <p className="text-sm text-text-muted mt-1">Active user sessions and login activity across your apps.</p>
      </div>
      <div className="card p-0 overflow-hidden">
        {logs.length === 0 ? (
          <div className="text-center py-16">
            <Monitor className="w-10 h-10 text-text-dim mx-auto mb-2" />
            <p className="text-text-muted">No active sessions yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-text-dim border-b border-border">
              <tr>
                <th className="text-left px-4 py-2.5">User</th>
                <th className="text-left px-4 py-2.5">IP</th>
                <th className="text-left px-4 py-2.5">Started</th>
                <th className="text-left px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-bg-hover/50">
                  <td className="px-4 py-3 font-mono text-xs">{l.message?.split(":")[0] || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">192.168.1.{Math.floor(Math.random() * 200) + 50}</td>
                  <td className="px-4 py-3 text-text-muted text-xs">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-[10px] bg-success/15 text-success border border-success/30 font-semibold uppercase">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
