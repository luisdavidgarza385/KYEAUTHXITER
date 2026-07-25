import { requireAdmin } from "@/lib/auth";
import { store } from "@/lib/store";
import { Star, Zap, Check, Lock, Users, Key, AppWindow, Shield, Headphones, Infinity } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mejorar Plan — SecureX Auth",
};

const PLANS = [
  {
    id: "free",
    name: "Plan Gratuito",
    price: "$0",
    period: "",
    description: "Para empezar a probar la plataforma",
    badge: null,
    color: "zinc",
    features: [
      { text: "2 Aplicaciones", included: true },
      { text: "60 Licencias (total)", included: true },
      { text: "50 Usuarios (total)", included: true },
      { text: "3,000 Créditos iniciales", included: true },
      { text: "Soporte comunitario", included: true },
      { text: "Sub-resellers", included: false },
      { text: "Licencias ilimitadas", included: false },
      { text: "Usuarios ilimitados", included: false },
      { text: "Apps ilimitadas", included: false },
      { text: "Soporte prioritario", included: false },
    ],
    cta: "Plan Actual",
    ctaDisabled: true,
  },
  {
    id: "vip",
    name: "Plan VIP",
    price: "$1.99",
    period: "/ mes",
    description: "Para revendedores activos y profesionales",
    badge: "⭐ Más Popular",
    color: "sky",
    features: [
      { text: "Apps Ilimitadas", included: true },
      { text: "Licencias Ilimitadas", included: true },
      { text: "Usuarios Ilimitados", included: true },
      { text: "Créditos incluidos según plan", included: true },
      { text: "Sub-resellers habilitados", included: true },
      { text: "Panel avanzado", included: true },
      { text: "Acceso a todas las apps", included: true },
      { text: "Soporte prioritario", included: true },
      { text: "Contador de tiempo real", included: true },
      { text: "Builder de ejecutables", included: true },
    ],
    cta: "Comprar Plan VIP ($1.99)",
    ctaDisabled: false,
    ctaHref: "https://wa.me/1234567890",
  },
  {
    id: "unlimited",
    name: "Plan Ilimitado",
    price: "$7.99",
    period: "/ mes",
    description: "Para operaciones de gran escala",
    badge: "👑 Premium",
    color: "amber",
    features: [
      { text: "Todo del Plan VIP", included: true },
      { text: "Créditos ilimitados (-1)", included: true },
      { text: "Sin cuotas de ningún tipo", included: true },
      { text: "Múltiples sub-resellers", included: true },
      { text: "Soporte 24/7 directo", included: true },
      { text: "Builder personalizado", included: true },
      { text: "API Key dedicada", included: true },
      { text: "Onboarding personalizado", included: true },
      { text: "Acceso anticipado a features", included: true },
      { text: "Branding propio", included: true },
    ],
    cta: "Comprar Plan Ilimitado ($7.99)",
    ctaDisabled: false,
    ctaHref: "https://wa.me/1234567890",
  },
];

const colorMap: Record<string, { border: string; badge: string; cta: string; icon: string; glow: string }> = {
  zinc: {
    border: "border-zinc-700/50",
    badge: "bg-zinc-800 text-zinc-400",
    cta: "bg-zinc-800 border border-zinc-700 text-zinc-400 cursor-default",
    icon: "text-zinc-400",
    glow: "",
  },
  sky: {
    border: "border-sky-500/40",
    badge: "bg-sky-500/20 text-sky-300 border border-sky-500/30",
    cta: "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-sky-500/30",
    icon: "text-sky-400",
    glow: "shadow-[0_0_40px_rgba(14,165,233,0.15)]",
  },
  amber: {
    border: "border-amber-500/40",
    badge: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    cta: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/30",
    icon: "text-amber-400",
    glow: "shadow-[0_0_40px_rgba(245,158,11,0.12)]",
  },
};

export default async function UpgradePage() {
  const me = await requireAdmin();
  const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "spectralx@gmail.com";
  const isSuperAdmin = me.email.toLowerCase() === bootstrapEmail.toLowerCase();
  const adminData = await store.getAdminById(me.id);
  const hasPaidPlan = Array.isArray(adminData?.subscriptions) && (adminData?.subscriptions?.length ?? 0) > 0;
  const isUnlimited = adminData?.credits === -1;

  const currentPlan = isSuperAdmin || isUnlimited ? "unlimited" : hasPaidPlan ? "vip" : "free";

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold font-mono uppercase tracking-widest mb-2">
          <Zap className="w-3.5 h-3.5" />
          Planes y Precios
        </div>
        <h1 className="text-3xl font-black text-white">Elige tu Plan</h1>
        <p className="text-zinc-400 text-sm max-w-xl mx-auto">
          Desbloquea todo el potencial de SecureX Auth. Escala tu negocio de licencias sin límites.
        </p>
      </div>

      {/* Current plan indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
        <Shield className="w-3.5 h-3.5" />
        Plan actual:{" "}
        <span className={`font-bold ${currentPlan === "free" ? "text-zinc-400" : currentPlan === "vip" ? "text-sky-400" : "text-amber-400"}`}>
          {currentPlan === "free" ? "Gratuito" : currentPlan === "vip" ? "VIP" : "Ilimitado / Admin"}
        </span>
      </div>

      {/* Plan cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const c = colorMap[plan.color];
          const isCurrent = plan.id === currentPlan;
          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl border bg-[#030916]/90 backdrop-blur p-6 space-y-5 flex flex-col transition-transform hover:-translate-y-1 ${c.border} ${c.glow} ${isCurrent ? "ring-2 ring-offset-2 ring-offset-[#010307]" : ""} ${plan.color === "sky" ? "ring-sky-500/50" : plan.color === "amber" ? "ring-amber-500/50" : ""}`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold ${c.badge}`}>
                  {plan.badge}
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3.5 right-4 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ✓ Activo
                </div>
              )}

              {/* Plan name & price */}
              <div>
                <div className={`text-xs font-mono font-bold uppercase tracking-widest mb-2 ${c.icon}`}>{plan.name}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">{plan.price}</span>
                  {plan.period && <span className="text-zinc-500 text-sm">{plan.period}</span>}
                </div>
                <p className="text-xs text-zinc-500 mt-1">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className={`flex items-center gap-2.5 text-xs ${f.included ? "text-zinc-200" : "text-zinc-600 line-through"}`}>
                    {f.included ? (
                      <Check className={`w-3.5 h-3.5 shrink-0 ${c.icon}`} />
                    ) : (
                      <Lock className="w-3.5 h-3.5 shrink-0 text-zinc-700" />
                    )}
                    {f.text}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {plan.ctaHref ? (
                <a
                  href={plan.ctaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full text-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${c.cta}`}
                >
                  {plan.cta}
                </a>
              ) : (
                <button
                  disabled={plan.ctaDisabled}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${c.cta}`}
                >
                  {plan.cta}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparison table */}
      <div className="rounded-2xl border border-sky-500/15 bg-[#030916]/80 backdrop-blur overflow-hidden">
        <div className="px-6 py-4 border-b border-sky-500/10">
          <h2 className="font-bold text-white text-sm flex items-center gap-2">
            <Star className="w-4 h-4 text-sky-400" />
            Comparación de límites
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-sky-500/10">
                <th className="px-6 py-3 text-left text-zinc-500 font-semibold">Característica</th>
                <th className="px-4 py-3 text-center text-zinc-400 font-semibold">Gratis</th>
                <th className="px-4 py-3 text-center text-sky-400 font-bold">VIP</th>
                <th className="px-4 py-3 text-center text-amber-400 font-bold">Ilimitado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-500/5">
              {[
                ["Aplicaciones", "2", "Ilimitadas", "Ilimitadas"],
                ["Licencias (total)", "60", "Ilimitadas", "Ilimitadas"],
                ["Usuarios (total)", "50", "Ilimitados", "Ilimitados"],
                ["Créditos", "3,000", "Según plan", "−1 (∞)"],
                ["Sub-resellers", "✗", "✓", "✓"],
                ["Soporte", "Básico", "Prioritario", "24/7 Directo"],
              ].map(([feat, free, vip, unlimited]) => (
                <tr key={feat} className="hover:bg-sky-500/3 transition-colors">
                  <td className="px-6 py-3 text-zinc-400">{feat}</td>
                  <td className="px-4 py-3 text-center text-zinc-500">{free}</td>
                  <td className="px-4 py-3 text-center text-sky-300 font-semibold">{vip}</td>
                  <td className="px-4 py-3 text-center text-amber-300 font-semibold">{unlimited}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contact note */}
      <div className="text-center text-xs text-zinc-500 pb-4">
        <Headphones className="w-4 h-4 mx-auto mb-1 text-zinc-600" />
        Para activar un plan de pago, contacta directamente con el developer principal (Main Admin) a través del Chat Global o WhatsApp.
      </div>
    </div>
  );
}
