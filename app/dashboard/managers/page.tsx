import { store } from "@/lib/store";
import { requireAdmin } from "@/lib/auth";
import { UserCog, Mail, Key, Trash2, Edit3, FolderTree, Shield } from "lucide-react";
import { ManagerCardMenu } from "./ManagerCardMenu";
import { CreateManagerButton } from "./CreateManagerButton";

export const dynamic = "force-dynamic";

export default async function ManagersPage() {
  const me = await requireAdmin();
  if (me.role !== "admin" && me.role !== "developer") {
    return (
      <div>
        <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
          <div className="card text-center py-16">
            <p className="text-text-muted">Only admins and developers can manage managers.</p>
          </div>
        </div>
      </div>
    );
  }

  const admins = await store.listAdmins();
  const allApps = await store.listApps();
  const managers = admins.filter((a) => a.role === "seller");
  const adminsList = admins.filter((a) => a.role === "admin");
  const appsBySeller = new Map<string, string[]>();
  for (const a of allApps) {
    if (a.seller_id) {
      if (!appsBySeller.has(a.seller_id)) appsBySeller.set(a.seller_id, []);
      appsBySeller.get(a.seller_id)!.push(a.id);
    }
  }
  const appsById = new Map(allApps.map((a) => [a.id, a]));

  return (
    <div>
      <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <UserCog className="w-6 h-6 text-accent-glow" />
              Managers
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Give friends or resellers limited access to specific applications. Managers can create licenses and users, but only for the apps you assign.
            </p>
          </div>
          <CreateManagerButton apps={allApps} />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Total Admins" value={adminsList.length} />
          <Stat label="Total Managers" value={managers.length} />
          <Stat label="Apps Assigned" value={allApps.filter((a) => a.seller_id).length} />
          <Stat label="Unassigned Apps" value={allApps.filter((a) => !a.seller_id).length} />
        </div>

        {managers.length === 0 ? (
          <div className="card text-center py-16">
            <UserCog className="w-10 h-10 text-text-dim mx-auto mb-3" />
            <p className="text-text-muted mb-1">No managers yet</p>
            <p className="text-xs text-text-dim">Click <span className="text-text">+ Create Manager</span> to invite a friend or reseller.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {managers.map((m) => {
              const assignedIds = appsBySeller.get(m.id) || [];
              return (
                <div key={m.id} className="card hover:border-border-light transition group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-md bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {m.email.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold truncate" title={m.email}>{m.email}</div>
                        <div className="text-[10px] text-text-dim font-mono">Manager · ID {m.id.slice(0, 8)}</div>
                      </div>
                    </div>
                    <ManagerCardMenu manager={{ id: m.id, email: m.email }} apps={allApps} currentAssignedIds={appsBySeller.get(m.id) || []} />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <Field icon={Mail} label="Email" value={m.email} mono />
                    <Field icon={Key} label="Role" value="Manager" />
                    <Field icon={FolderTree} label="Apps Assigned" value={String(assignedIds.length)} />
                    <Field icon={UserCog} label="Created" value={new Date(m.created_at).toLocaleDateString("en-US")} />
                  </div>

                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="text-[10px] text-text-dim uppercase tracking-wider mb-2">Can manage</div>
                    {assignedIds.length === 0 ? (
                      <p className="text-xs text-text-dim">No apps assigned yet — edit to assign.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {assignedIds.slice(0, 5).map((id) => {
                          const a = appsById.get(id);
                          return (
                            <span key={id} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] border border-accent/30 bg-accent/10 text-accent-glow">
                              {a?.name || "?"}
                            </span>
                          );
                        })}
                        {assignedIds.length > 5 && (
                          <span className="text-[10px] text-text-dim">+{assignedIds.length - 5} more</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {adminsList.length > 1 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 mt-8">Admins</h2>
            <div className="card divide-y divide-border/50">
              {adminsList.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Shield className="w-4 h-4 text-accent-glow shrink-0" />
                    <div className="min-w-0">
                      <div className="font-mono truncate" title={a.email}>{a.email}</div>
                      <div className="text-[10px] text-text-dim">Joined {new Date(a.created_at).toLocaleDateString("en-US")}</div>
                    </div>
                  </div>
                  <span className="badge-accent text-[10px]">admin</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card">
      <div className="text-xs text-text-dim uppercase tracking-wider mb-1">{label}</div>
      <div className="text-2xl font-mono text-text">{value}</div>
    </div>
  );
}

function Field({ icon: Icon, label, value, mono }: { icon: any; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-1.5">
      <Icon className="w-3 h-3 text-text-dim mt-0.5 shrink-0" />
      <div className="min-w-0">
        <div className="text-text-dim text-[10px] uppercase tracking-wider">{label}</div>
        <div className={(mono ? "font-mono " : "") + "text-text-muted truncate"} title={value}>{value}</div>
      </div>
    </div>
  );
}
