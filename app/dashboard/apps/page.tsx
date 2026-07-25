import { store } from "@/lib/store";
import { requireAdmin, getScopedAppIds, checkQuota } from "@/lib/auth";
import { AppWindow, Search, Zap, Star, Lock, ShieldCheck, TrendingUp } from "lucide-react";
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
  const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "spectralx@gmail.com";
  const isSuperAdmin = me.email.toLowerCase() === bootstrapEmail.toLowerCase();
  let apps: typeof allApps = [];
  if (isSuperAdmin) {
    apps = allApps;
  } else {
    apps = allApps.filter((a) => a.seller_id === me.id || (scopedIds && scopedIds.includes(a.id)));
  }

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

  // Compute quota for non-superadmin
  const quota = !isSuperAdmin ? await checkQuota(me, apps[0]?.id || "none") : null;
  const adminData = !isSuperAdmin ? await store.getAdminById(me.id) : null;
  const hasPaidPlan = Array.isArray(adminData?.subscriptions) && (adminData?.subscriptions?.length ?? 0) > 0;
  const isFreePlan = !isSuperAdmin && !hasPaidPlan;

  const appLimit = 2;
  const licenseLimit = 60;
  const userLimit = 50;
  const totalLicenses = quota?.licenses ?? 0;
  const totalUsers = quota?.users ?? 0;

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

        {/* ── Free Plan Usage Banner ── */}
        {isFreePlan && (
          <div className="rounded-2xl border border-sky-500/20 bg-gradient-to-br from-[#04112b]/80 to-[#020816]/90 p-5 space-y-4 shadow-xl shadow-sky-500/5 backdrop-blur">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Plan Gratuito Activo</p>
                  <p className="text-xs text-zinc-400">Actuáliza para desbloquear Apps, Licencias y Usuarios ilimitados</p>
                </div>
              </div>
              <a
                href="/dashboard/subscriptions"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-sky-500/25 shrink-0"
              >
                <Star className="w-3.5 h-3.5" />
                Ver Planes VIP
              </a>
            </div>

            {/* Usage bars */}
            <div className="grid sm:grid-cols-3 gap-3">
              <UsageBar label="Aplicaciones" used={apps.length} limit={appLimit} color="sky" />
              <UsageBar label="Licencias (total)" used={totalLicenses} limit={licenseLimit} color="emerald" />
              <UsageBar label="Usuarios (total)" used={totalUsers} limit={userLimit} color="purple" />
            </div>
          </div>
        )}

        {apps.length === 0 ? (
          <div className="rounded-2xl border border-border bg-bg-secondary text-center py-16 space-y-4">
            <AppWindow className="w-10 h-10 text-text-dim mx-auto" />
            <div>
              <p className="text-text-muted mb-1">No tienes aplicaciones aún</p>
              {isFreePlan && (
                <p className="text-xs text-zinc-500">Plan Gratuito: puedes crear hasta <span className="text-sky-400 font-bold">2 aplicaciones</span></p>
              )}
            </div>
            {me.role !== "seller" && <CreateAppInlineButton className="btn-primary text-sm mx-auto" />}
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
                    {isFreePlan && (
                      <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full">
                        {apps.length}/{appLimit} usadas
                      </span>
                    )}
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

                {me.role !== "seller" && (
                  <CreateAppInlineButton
                    className="w-full mb-3 flex items-center justify-center gap-2 rounded-md bg-accent text-white py-2 text-sm font-medium hover:bg-accent/90 transition"
                  />
                )}

                <div className="space-y-2">
                  {filtered.map((a) => (
                    <ApplicationRow
                      key={a.id}
                      app={a}
                      userCount={userCounts.get(a.id) || 0}
                      isSelected={a.id === selectedId}
                      role={me.role}
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

        {/* ── Upgrade CTA if at limit ── */}
        {isFreePlan && apps.length >= appLimit && (
          <div className="rounded-2xl border border-amber-500/25 bg-amber-950/10 p-5 flex flex-col sm:flex-row items-center gap-4">
            <Lock className="w-8 h-8 text-amber-400 shrink-0" />
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm font-bold text-amber-300">Límite de aplicaciones alcanzado</p>
              <p className="text-xs text-zinc-400 mt-0.5">Ya tienes 2 aplicaciones (límite del Plan Gratuito). Actualiza a <span className="text-amber-300 font-semibold">Plan VIP</span> para crear aplicaciones ilimitadas.</p>
            </div>
            <a
              href="/dashboard/subscriptions"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-bold transition-all shadow-lg shadow-amber-500/20 shrink-0"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Mejorar Plan
            </a>
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

function UsageBar({ label, used, limit, color }: { label: string; used: number; limit: number; color: "sky" | "emerald" | "purple" }) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const isNear = pct >= 80;
  const colorClasses = {
    sky: { bar: "bg-sky-500", text: "text-sky-400", track: "bg-sky-500/10" },
    emerald: { bar: "bg-emerald-500", text: "text-emerald-400", track: "bg-emerald-500/10" },
    purple: { bar: "bg-purple-500", text: "text-purple-400", track: "bg-purple-500/10" },
  }[color];

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[11px] text-zinc-400 font-medium">{label}</span>
        <span className={`text-[11px] font-bold font-mono ${isNear ? "text-amber-400" : colorClasses.text}`}>{used}/{limit}</span>
      </div>
      <div className={`h-1.5 rounded-full ${colorClasses.track} overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all ${isNear ? "bg-amber-400" : colorClasses.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
