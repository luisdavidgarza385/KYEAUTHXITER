import { store } from "@/lib/store";
import { requireAdmin, getScopedAppIds } from "@/lib/auth";
import { AppWindow, Search } from "lucide-react";
import { CreateAppInlineButton } from "@/components/CreateMenu";
import { CredentialsCard } from "./[id]/CredentialsCard";
import { ApplicationRow } from "./ApplicationRow";

export const dynamic = "force-dynamic";

export default async function AppsPage({
  searchParams,
}: {
  searchParams: { q?: string; selected?: string };
}) {
  const me = await requireAdmin();
  const scopedIds = await getScopedAppIds(me);
  const allApps = await store.listApps();
  const apps = scopedIds === null ? allApps : allApps.filter((a) => scopedIds.includes(a.id));

  const userCounts = new Map<string, number>();
  for (const a of apps) {
    const us = await store.listAppUsers({ appId: a.id, limit: 5000 });
    userCounts.set(a.id, us.length);
  }

  let activeCount = 0;
  let pausedCount = 0;
  for (const a of apps) {
    if (a.status === "active") activeCount++;
    if (a.status === "paused") pausedCount++;
  }
  const sessionsCount = apps.reduce((acc, a) => acc + (a.status === "active" ? 1 : 0), 0);

  const q = (searchParams.q || "").toLowerCase();
  const filtered = q ? apps.filter((a) => a.name.toLowerCase().includes(q) || a.app_id.toLowerCase().includes(q)) : apps;
  const selectedId = searchParams.selected || apps[0]?.id || null;
  const selectedApp = selectedId ? apps.find((a) => a.id === selectedId) || null : null;

  return (
    <div>
      <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Manage Applications</h1>
          <p className="text-sm text-text-muted mt-1">
            Manage your applications. Applications are the backbone of all the data.{" "}
            <a href="/docs" className="text-accent-glow hover:text-accent">Learn More.</a>
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Apps" value={apps.length} />
          <StatCard label="Active" value={activeCount} accent="text-success" />
          <StatCard label="Paused" value={pausedCount} accent="text-warning" />
          <StatCard label="Active Sessions" value={sessionsCount} accent="text-accent-glow" />
        </div>

        {apps.length === 0 ? (
          <div className="card text-center py-16">
            <AppWindow className="w-10 h-10 text-text-dim mx-auto mb-3" />
            <p className="text-text-muted mb-4">No applications yet</p>
            <CreateAppInlineButton className="btn-primary text-sm mx-auto" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 space-y-4">
              <CredentialsCard app={selectedApp} />
            </div>

            <div className="lg:col-span-2 space-y-3">
              <div className="card">
                <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                  <h2 className="font-semibold flex items-center gap-2">
                    <AppWindow className="w-4 h-4 text-accent-glow" />
                    My Applications
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                      <input
                        type="text"
                        name="q"
                        defaultValue={q}
                        placeholder="Search applications..."
                        className="w-56 rounded-md bg-bg-secondary border border-border pl-9 pr-3 py-1.5 text-sm placeholder:text-text-dim focus:outline-none focus:border-accent"
                      />
                    </div>
                    <select className="rounded-md bg-bg-secondary border border-border px-2.5 py-1.5 text-sm">
                      <option>All Applications</option>
                      <option>Active</option>
                      <option>Paused</option>
                    </select>
                  </div>
                </div>

                <CreateAppInlineButton
                  className="w-full mb-3 flex items-center justify-center gap-2 rounded-md bg-accent text-white py-2 text-sm font-medium hover:bg-accent/90 transition"
                />

                <div className="space-y-2">
                  {filtered.map((a) => (
                    <ApplicationRow
                      key={a.id}
                      app={a}
                      userCount={userCounts.get(a.id) || 0}
                      isSelected={a.id === selectedId}
                    />
                  ))}
                  {filtered.length === 0 && (
                    <p className="text-sm text-text-dim text-center py-4">No applications match your search.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent = "text-text" }: { label: string; value: number; accent?: string }) {
  return (
    <div className="card">
      <div className="text-xs text-text-dim uppercase tracking-wider mb-1">{label}</div>
      <div className={"text-2xl font-mono " + accent}>{value}</div>
    </div>
  );
}
