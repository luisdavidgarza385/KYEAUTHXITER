import { store } from "@/lib/store";
import { requireAdmin, canAccessApp } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { AppActions } from "./AppActions";
import { CreateLicenseForApp } from "./CreateLicenseForApp";
import { CreateUserForApp } from "./CreateUserForApp";
import { formatDate } from "@/lib/utils";
import { Key, Users, Activity, RefreshCw } from "lucide-react";
import { CredentialsSection } from "./CredentialsSection";

export const dynamic = "force-dynamic";

export default async function AppDetailPage({ params }: { params: { id: string } }) {
  const me = await requireAdmin();
  const app = await store.getAppById(params.id);
  if (!app) notFound();
  if (!(await canAccessApp(me, app.id))) {
    redirect("/dashboard/apps");
  }

  const [licenses, users, sessions] = await Promise.all([
    store.listLicenses({ appId: app.id, limit: 50 }),
    store.listAppUsers({ appId: app.id, limit: 50 }),
    store.listSessionsForApp(app.id, 10),
  ]);

  const usedLicenses = licenses.filter((l) => l.status === "used").length;
  const headersList = headers();
  const host = headersList.get("host") || "www.keyauthpro.xyz";
  const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;
  const apiUrl = `${baseUrl}/api/1.0`;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3 text-sm">
        <Link href="/dashboard/apps" className="text-text-muted hover:text-text">← Back to apps</Link>
        <span className="text-text-dim">/</span>
        <span className="text-text">{app.name}</span>
      </div>

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{app.name}</h1>
            <span
              className={
                app.status === "active"
                  ? "badge-success"
                  : app.status === "paused"
                  ? "badge-warning"
                  : "badge-danger"
              }
            >
              {app.status}
            </span>
            <span className="text-xs text-text-dim">v{app.version}</span>
          </div>
          <p className="text-sm text-text-muted mt-1">Created {formatDate(app.created_at)}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/dashboard/licenses?app=${app.id}`}
            className="btn-secondary text-sm"
          >
            <Key className="w-4 h-4" /> Licenses ({licenses.length})
          </Link>
          <Link
            href={`/dashboard/users?app=${app.id}`}
            className="btn-secondary text-sm"
          >
            <Users className="w-4 h-4" /> Users ({users.length})
          </Link>
          <AppActions app={app} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={users.length} />
        <StatCard label="Licenses" value={licenses.length} />
        <StatCard label="Used Licenses" value={usedLicenses} accent="text-success" />
        <StatCard label="Active Sessions" value={sessions.length} accent="text-accent-glow" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <CredentialsSection
          app={app}
          apiUrl={apiUrl}
        />

        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold flex items-center gap-2"><Key className="w-4 h-4 text-accent-glow" /> Generate Licenses</h2>
            </div>
            <CreateLicenseForApp appId={app.id} />
          </div>

          <div className="card">
            <h2 className="font-semibold mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-accent-glow" /> Create User</h2>
            <CreateUserForApp appId={app.id} />
          </div>

          <div className="card">
            <h2 className="font-semibold mb-3">Recent Users</h2>
            {users.length === 0 ? (
              <p className="text-sm text-text-dim text-center py-3">No users yet</p>
            ) : (
              <div className="space-y-1.5">
                {users.slice(0, 6).map((u) => (
                  <div key={u.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
                    <span className="font-mono">{u.username}</span>
                    <div className="flex items-center gap-2">
                      {u.banned && <span className="badge-danger text-[10px]">banned</span>}
                      <span className="text-xs text-text-dim">{formatDate(u.last_login)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="font-semibold mb-3">Recent Licenses</h2>
            {licenses.length === 0 ? (
              <p className="text-sm text-text-dim text-center py-3">No licenses yet</p>
            ) : (
              <div className="space-y-1.5">
                {licenses.slice(0, 6).map((l) => (
                  <div key={l.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
                    <code className="font-mono text-xs">{l.key}</code>
                    <span
                      className={
                        l.status === "used"
                          ? "badge-accent text-[10px]"
                          : l.status === "banned"
                          ? "badge-danger text-[10px]"
                          : "badge-success text-[10px]"
                      }
                    >
                      {l.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent = "text-text" }: { label: string; value: number; accent?: string }) {
  return (
    <div className="card">
      <div className="text-xs text-text-dim uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-2xl font-mono ${accent}`}>{value}</div>
    </div>
  );
}
