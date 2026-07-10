import { store } from "@/lib/store";
import { requireAdmin, getScopedAppIds } from "@/lib/auth";
import { LayoutDashboard, ChevronRight, Activity, Calendar, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { DashboardStats } from "@/components/DashboardStats";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const me = await requireAdmin();
  const fullAdmin = await store.getAdminById(me.id);
  const scopedIds = await getScopedAppIds(me);

  const [allApps, allLicenses, allUsers, allAdmins] = await Promise.all([
    store.listApps(),
    store.listLicenses({ limit: 10000 }),
    store.listAppUsers({ limit: 10000 }),
    store.listAdmins(),
  ]);

  // Filter apps, licenses and users belonging to this reseller
  let apps = scopedIds === null ? allApps : allApps.filter((a) => scopedIds.includes(a.id));
  
  // IMPORTANT: Admin should NOT see seller apps (seller_id must be null for admin apps)
  if (me.role === "admin" || me.role === "developer") {
    apps = apps.filter((a) => a.seller_id === null || a.seller_id === undefined);
  }
  
  // Find sub-resellers created by this admin
  const subResellers = allAdmins.filter((a) => a.created_by === me.id);
  const subResellerIds = subResellers.map((sr) => sr.id);

  // Active sessions per app (online users)
  const sessionsLists = await Promise.all(
    apps.map((app) => store.listSessionsForApp(app.id, 10000))
  );
  const onlineUsersCount = sessionsLists.reduce((acc, list) => acc + list.length, 0);

  // Licenses created by me or my sub-resellers
  const myLicenses = allLicenses.filter((l) => l.created_by === me.id);
  const subLicenses = allLicenses.filter((l) => l.created_by && subResellerIds.includes(l.created_by));
  const totalLicensesCount = myLicenses.length + subLicenses.length;

  // Active users registered with my licenses or my sub-resellers' licenses
  const myLicenseUserIds = myLicenses.filter((l) => l.used_by).map((l) => l.used_by);
  const subLicenseUserIds = subLicenses.filter((l) => l.used_by).map((l) => l.used_by);
  
  const activeUsers = allUsers.filter((u) => myLicenseUserIds.includes(u.id) || subLicenseUserIds.includes(u.id));
  const activeUsersCount = activeUsers.length;

  // Unique package names
  const uniquePackages = new Set(
    allLicenses
      .filter((l) => l.app_id && (scopedIds === null || scopedIds.includes(l.app_id)))
      .map((l) => l.package_name || "Bypass")
  );
  const packagesCount = uniquePackages.size || 2;

  // Account Information details
  const username = me.email.includes("@") ? me.email.split("@")[0] : me.email;
  const capitalizedUsername = username.charAt(0).toUpperCase() + username.slice(1);
  
  const userLimit = 1000;
  const remainingSlots = Math.max(0, userLimit - activeUsersCount);
  const usePercentage = Math.min(100, Math.round((activeUsersCount / userLimit) * 100));

  const createdDate = fullAdmin?.created_at
    ? new Date(fullAdmin.created_at).toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const lastAccess = new Date().toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const credits = typeof fullAdmin?.credits === "number" ? fullAdmin.credits : 0.0;
  const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "spectralx@gmail.com";
  const isUnlimited = fullAdmin?.email === bootstrapEmail;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto text-zinc-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/60 pb-5">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-zinc-100">
            <LayoutDashboard className="w-5 h-5 text-emerald-400" />
            Dashboard
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Resumen general y estado de tu cuenta de reseller.</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <span>Consola</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-700" />
          <span className="text-emerald-400 font-medium">Dashboard</span>
        </div>
      </div>

      {/* Top Cards (Premium 3D & Glassmorphism) */}
      <DashboardStats
        initialOnlineUsersCount={onlineUsersCount}
        initialActiveUsersCount={activeUsersCount}
        credits={credits}
        isUnlimited={isUnlimited}
        packagesCount={packagesCount}
      />

      {/* Account Info Box (High-fidelity Green Glassmorphism) */}
      <div className="rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-[#0a150c]/90 to-[#030604]/95 p-6 space-y-6 shadow-2xl relative overflow-hidden premium-card-3d hover:border-emerald-500/35 transition-all duration-300">
        <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-gradient-radial from-emerald-500/5 to-transparent blur-xl pointer-events-none" />
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Información de la cuenta
          </h2>
          <span className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
            Activo
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-sm">
          <div>
            <div className="text-zinc-500 text-xs font-semibold mb-1 uppercase tracking-wider">Usuario</div>
            <div className="font-semibold text-zinc-200">{capitalizedUsername}</div>
          </div>
          <div>
            <div className="text-zinc-500 text-xs font-semibold mb-1 uppercase tracking-wider">Límite Usuarios</div>
            <div className="font-semibold text-zinc-200 font-mono">
              {activeUsersCount} / {userLimit}
            </div>
          </div>
          <div>
            <div className="text-zinc-500 text-xs font-semibold mb-1 uppercase tracking-wider">Licencias</div>
            <div className="font-semibold text-zinc-200 font-mono">
              {totalLicensesCount} <span className="text-zinc-500 text-xs">(tuya + sub)</span>
            </div>
          </div>
          <div>
            <div className="text-zinc-500 text-xs font-semibold mb-1 uppercase tracking-wider">Restante</div>
            <div className="font-semibold text-zinc-200 font-mono">
              {remainingSlots} <span className="text-zinc-500 text-xs">({100 - usePercentage}%)</span>
            </div>
          </div>
          <div>
            <div className="text-zinc-500 text-xs font-semibold mb-1 uppercase tracking-wider">Creada</div>
            <div className="font-semibold text-zinc-200 font-mono text-xs">{createdDate}</div>
          </div>
          <div>
            <div className="text-zinc-500 text-xs font-semibold mb-1 uppercase tracking-wider">Último Acceso</div>
            <div className="font-semibold text-zinc-200 font-mono text-xs">{lastAccess}</div>
          </div>
        </div>

        {/* User limit progress bar */}
        <div className="space-y-2 pt-2">
          <div className="h-2 w-full bg-[#020503] rounded-full overflow-hidden border border-emerald-500/10">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-green-450 transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              style={{ width: `${usePercentage}%` }}
            />
          </div>
          <div className="text-right text-[10px] font-mono text-zinc-500">
            {usePercentage}% del límite de usuarios en uso
          </div>
        </div>
      </div>

      {/* Quick Access & Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-emerald-500/15 bg-[#040c06]/30 backdrop-blur-md p-6 space-y-4 shadow-xl premium-card-3d hover:border-emerald-500/35 transition-all duration-300">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Acciones Rápidas
          </h3>
          <p className="text-xs text-zinc-500">Accesos directos a las herramientas de administración frecuentes.</p>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/dashboard/licenses" className="flex items-center justify-between p-3 rounded bg-zinc-900/40 border border-zinc-800/40 hover:bg-zinc-900 hover:border-zinc-700 transition text-xs font-medium">
              <span>Administrar Licencias</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
            </Link>
            <Link href="/dashboard/sub-resellers" className="flex items-center justify-between p-3 rounded bg-zinc-900/40 border border-zinc-800/40 hover:bg-zinc-900 hover:border-zinc-700 transition text-xs font-medium">
              <span>Crear Sub-reseller</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/15 bg-[#040c06]/30 backdrop-blur-md p-6 space-y-4 shadow-xl premium-card-3d hover:border-emerald-500/35 transition-all duration-300">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            Información del Desarrollador
          </h3>
          <p className="text-xs text-zinc-500">Aplicaciones administradas activas en el sistema.</p>
          <div className="divide-y divide-zinc-800/50">
            {apps.length === 0 ? (
              <div className="text-xs text-zinc-500 py-2">No hay aplicaciones asignadas.</div>
            ) : (
              apps.slice(0, 3).map((app) => (
                <div key={app.id} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                  <div className="text-xs font-medium text-zinc-300">{app.name}</div>
                  <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">
                    v{app.version}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
