import { Crown } from "lucide-react";
import { store } from "@/lib/store";
import { requireAdmin } from "@/lib/auth";
import { SubscriptionsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const me = await requireAdmin();
  if (me.role !== "developer" && me.role !== "admin") {
    return <div className="p-8 text-center text-text-muted">Access denied. Only developers and admins can manage subscriptions.</div>;
  }

  const allAdmins = await store.listAdmins();
  const allApps = await store.listApps();
  const now = Date.now();

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2"><Crown className="w-6 h-6 text-accent-glow" /> Subscriptions</h1>
        <p className="text-sm text-text-muted mt-1">Grant and manage subscriptions for sellers and managers.</p>
      </div>

      <SubscriptionsClient admins={allAdmins} apps={allApps} myId={me.id} now={now} />
    </div>
  );
}
