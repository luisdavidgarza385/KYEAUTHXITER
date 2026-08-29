import { KeyRound } from "lucide-react";
import { GeneratorForm } from "./form";
import { requireAdmin, getScopedAppIds } from "@/lib/auth";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function LicenseGeneratorPage() {
  const me = await requireAdmin();
  const scopedIds = await getScopedAppIds(me);
  const allApps = await store.listApps();
  const myApps = scopedIds === null ? allApps : allApps.filter((a) => scopedIds.includes(a.id));
  const fullAdmin = await store.getAdminById(me.id);
  const isSeller = me.role === "seller";
  const hasSub = fullAdmin?.subscription_end ? new Date(fullAdmin.subscription_end).getTime() > Date.now() : false;
  const hasPrefixPerm = fullAdmin?.permissions?.includes("prefix") || false;
  const forcePrefix = isSeller && !hasSub && !hasPrefixPerm;

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><KeyRound className="w-6 h-6 text-accent-glow" /> Generar licencias</h1>
        <p className="text-sm text-text-muted mt-1">Crea licencias para tus aplicaciones.</p>
      </div>

      {myApps.length > 0 && (
        <div className="card">
          <GeneratorForm apps={myApps} forcePrefix={forcePrefix} />
        </div>
      )}
    </div>
  );
}
