import { store } from "@/lib/store";
import { requireAdmin } from "@/lib/auth";
import { Layers, Search, ShieldAlert } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SubUsersPage() {
  const me = await requireAdmin();

  // Get all sub-resellers created by this user
  const allAdmins = await store.listAdmins();
  const subResellers = allAdmins.filter((a) => a.created_by === me.id);
  const subResellerIds = subResellers.map((sr) => sr.id);
  const subResellerNames = new Map(subResellers.map((sr) => [sr.id, sr.email.split("@")[0]]));

  // Get all licenses in the database
  const allLicenses = await store.listLicenses({ limit: 10000 });
  
  // Find licenses created by my sub-resellers
  const subLicenses = allLicenses.filter(
    (l) => l.created_by && subResellerIds.includes(l.created_by)
  );

  // Find all used licenses that have used_by set
  const subUsedLicenses = subLicenses.filter((l) => l.status === "used" && l.used_by);
  const usedByUserIds = subUsedLicenses.map((l) => l.used_by!);

  // Fetch all app users
  const allUsers = await store.listAppUsers({ limit: 10000 });
  
  // Filter users that activated a sub-reseller's license key
  const subUsers = allUsers.filter((u) => usedByUserIds.includes(u.id));

  // Build mapping of user ID -> license details
  const userLicenseMap = new Map();
  for (const lic of subUsedLicenses) {
    if (lic.used_by) {
      userLicenseMap.set(lic.used_by, lic);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 text-zinc-300">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2 text-zinc-100">
          <Layers className="w-5 h-5 text-emerald-400" />
          Sub-usuarios ({subUsers.length})
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Lista de usuarios de tus sub-resellers (clientes finales que registraron llaves vendidas por tus sub-resellers).
        </p>
      </div>

      {subUsers.length === 0 ? (
        <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/20 py-16 text-center">
          <Layers className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-400">No hay sub-usuarios registrados</p>
          <p className="text-xs text-zinc-500 mt-1">Aparecerán aquí cuando un cliente se registre con una llave creada por tus sub-resellers.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-950 text-zinc-500 text-[10px] font-bold uppercase tracking-wider border-b border-zinc-800/80">
                <tr>
                  <th className="px-5 py-3.5">Usuario</th>
                  <th className="px-5 py-3.5">Licencia Usada</th>
                  <th className="px-5 py-3.5">Paquete</th>
                  <th className="px-5 py-3.5">Sub-reseller Creador</th>
                  <th className="px-5 py-3.5">HWID</th>
                  <th className="px-5 py-3.5">IP</th>
                  <th className="px-5 py-3.5">Último Acceso</th>
                  <th className="px-5 py-3.5">Creado El</th>
                  <th className="px-5 py-3.5">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {subUsers.map((user) => {
                  const license = userLicenseMap.get(user.id);
                  const subResellerName = license?.created_by 
                    ? subResellerNames.get(license.created_by) || "Sub-reseller" 
                    : "—";
                  
                  const active = !user.banned;

                  return (
                    <tr key={user.id} className="hover:bg-zinc-900/40 transition">
                      <td className="px-5 py-4 font-bold text-zinc-200">{user.username}</td>
                      <td className="px-5 py-4 font-mono text-xs text-zinc-400">
                        {license ? (
                          <span title={license.key}>
                            {license.key.length > 20 ? license.key.slice(0, 20) + "..." : license.key}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-zinc-400">
                        <span className="bg-zinc-900 px-2 py-0.5 rounded border border-zinc-850 text-zinc-350 text-[10px] uppercase font-bold">
                          {license?.package_name || "Bypass"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-zinc-300 font-semibold">{subResellerName}</td>
                      <td className="px-5 py-4 font-mono text-xs text-zinc-500">
                        {user.hwid ? (
                          <span title={user.hwid}>
                            {user.hwid.slice(0, 15)}...
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-zinc-400">{user.ip || "—"}</td>
                      <td className="px-5 py-4 text-xs text-zinc-500 font-mono">
                        {user.last_login ? new Date(user.last_login).toLocaleString("es-ES", {
                          day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
                        }) : "Nunca"}
                      </td>
                      <td className="px-5 py-4 text-xs text-zinc-500 font-mono">
                        {new Date(user.created_at).toLocaleDateString("es-ES")}
                      </td>
                      <td className="px-5 py-4">
                        {active ? (
                          <span className="inline-flex items-center gap-1 rounded bg-green-950/20 border border-green-900/30 px-2 py-0.5 text-[10px] font-bold text-green-400 uppercase">
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-red-950/20 border border-red-900/30 px-2 py-0.5 text-[10px] font-bold text-red-400 uppercase">
                            Banned
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
