import { store } from "@/lib/store";
import { requireAdmin } from "@/lib/auth";
import { Coins, Info, ShieldAlert, Sparkles, UserCheck, Key } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CreditsPage() {
  const me = await requireAdmin();
  const fullAdmin = await store.getAdminById(me.id);

  const credits = typeof fullAdmin?.credits === "number" ? fullAdmin.credits : 0;
  const isUnlimited = fullAdmin?.role === "developer" || fullAdmin?.role === "admin" || fullAdmin?.email === "admin@example.com";

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto space-y-8 text-zinc-350">
      {/* 3D Animated Card for Balance */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-[#09090b]/80 p-8 shadow-2xl backdrop-blur-md transition-all hover:shadow-emerald-500/5 duration-300 group">
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>
        <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-blue-500/5 blur-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              Tu Balance Financiero
            </span>
            <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Créditos de Distribución</h1>
            <p className="text-sm text-zinc-500 max-w-lg">
              Los créditos se utilizan para generar licencias de acceso y registrar nuevos usuarios en tus aplicaciones.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-zinc-900/60 border border-zinc-800 p-6 rounded-xl min-w-[245px] hover:border-emerald-500/30 transition duration-300">
            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Coins className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Saldo Disponible</div>
              <div className="text-3xl font-black text-zinc-100 font-mono tracking-tight">
                {isUnlimited ? "ILIMITADO" : `${credits} Coins`}
              </div>
              <div className="text-[11px] text-zinc-500 font-semibold mt-0.5">
                {isUnlimited ? "Plan Master de Acceso" : "Consumible por uso"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card explaining cost */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-zinc-850 rounded-xl bg-zinc-950/40 p-6 space-y-4">
          <h3 className="font-bold text-base text-zinc-100 flex items-center gap-2">
            <Key className="w-5 h-5 text-emerald-400" />
            Costo de Operaciones
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-zinc-900 pb-2">
              <span className="text-zinc-400">Creación de Licencia (Key)</span>
              <span className="font-bold text-emerald-400 font-mono">20 Créditos</span>
            </div>
            <div className="flex justify-between border-b border-zinc-900 pb-2">
              <span className="text-zinc-400">Registro de Cliente / Usuario</span>
              <span className="font-bold text-emerald-400 font-mono">20 Créditos</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Sub-resellers</span>
              <span className="font-bold text-zinc-400">Gratis (Asigna tus créditos)</span>
            </div>
          </div>
        </div>

        <div className="border border-zinc-850 rounded-xl bg-zinc-950/40 p-6 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-bold text-base text-zinc-100 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-400" />
              ¿Necesitas más créditos?
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Al registrarte recibes un saldo promocional de 200 créditos. Si necesitas generar más licencias de manera ilimitada, puedes comprar una suscripción VIP en nuestra tienda para tener cuotas ilimitadas sin restricciones.
            </p>
          </div>
          <div className="pt-4">
            <a href="/dashboard/shop" className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-600/10">
              Ir a la Tienda VIP
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
