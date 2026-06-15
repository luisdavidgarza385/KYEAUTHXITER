"use client";
import { useState } from "react";
import { Coins, CreditCard, Sparkles, Check, Loader2, ArrowRight, X, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ShopPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [showPaypalModal, setShowPaypalModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: number; type: "monthly" | "yearly" } | null>(null);
  
  // Form fields
  const [email, setEmail] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [paypalPassword, setPaypalPassword] = useState("");
  
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const router = useRouter();

  const plans = [
    {
      name: "Plan Mensual VIP",
      price: 4.00,
      period: "mes",
      description: "Ideal para iniciar tus proyectos con total libertad.",
      features: [
        "Licencias Ilimitadas",
        "Usuarios Ilimitados",
        "Panel sin anuncios ni marcas",
        "Soporte prioritario VIP",
        "Acceso completo a la API"
      ],
      type: "monthly" as const,
      popular: false
    },
    {
      name: "Plan Anual VIP",
      price: 15.00,
      period: "año",
      description: "Ahorra más del 65% y asegura tu plataforma todo el año.",
      features: [
        "Licencias Ilimitadas",
        "Usuarios Ilimitados",
        "Panel sin anuncios ni marcas",
        "Soporte prioritario VIP 24/7",
        "Acceso completo a la API",
        "Actualizaciones de por vida gratis"
      ],
      type: "yearly" as const,
      popular: true
    }
  ];

  function handleOpenPaypal(plan: typeof plans[0]) {
    setSelectedPlan(plan);
    setShowPaypalModal(true);
  }

  function handleOpenCard(plan: typeof plans[0]) {
    setSelectedPlan(plan);
    setShowCardModal(true);
  }

  async function handlePaymentSuccess(userEmail: string) {
    if (!selectedPlan) return;
    
    try {
      const res = await fetch("/api/admin/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planType: selectedPlan.type,
          price: selectedPlan.price
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(
          `¡Pago exitoso de $${selectedPlan.price} USD procesado correctamente!\n\n` +
          `Tu cuenta ahora tiene acceso VIP Ilimitado.\n` +
          `Se ha enviado una notificación de confirmación de transferencia al correo: ${userEmail}`
        );
        setShowPaypalModal(false);
        setShowCardModal(false);
        router.refresh();
        router.push("/dashboard");
      } else {
        alert(data.message || "Error al procesar el pago");
      }
    } catch (err) {
      alert("Error de conexión");
    } finally {
      setLoading(null);
    }
  }

  async function handleSimulatePaypal(e: React.FormEvent) {
    e.preventDefault();
    setLoading("paypal");
    await handlePaymentSuccess(paypalEmail);
  }

  async function handleSimulateCard(e: React.FormEvent) {
    e.preventDefault();
    setLoading("card");
    await handlePaymentSuccess(email);
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto space-y-8 text-zinc-350">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto my-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 uppercase tracking-wider animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          Tienda Guate Xiter
        </span>
        <h1 className="text-4xl font-extrabold text-zinc-150 tracking-tight">Mejora a VIP Ilimitado</h1>
        <p className="text-sm text-zinc-500">
          Desbloquea generación de licencias, usuarios y almacenamiento sin límites. Elige la opción de pago que prefieras.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`relative flex flex-col justify-between rounded-2xl border bg-zinc-950/40 p-8 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-emerald-500/5 ${
              p.popular
                ? "border-emerald-500 bg-gradient-to-b from-emerald-950/10 to-transparent"
                : "border-zinc-800"
            }`}
          >
            {p.popular && (
              <span className="absolute -top-3.5 right-6 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black uppercase text-zinc-950 tracking-wider">
                Más Popular / Ahorro
              </span>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-zinc-150">{p.name}</h3>
                <p className="text-xs text-zinc-550 mt-1">{p.description}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-zinc-150 font-mono">${p.price}</span>
                <span className="text-xs text-zinc-550 font-medium">USD / {p.period}</span>
              </div>

              <div className="h-px bg-zinc-900" />

              <ul className="space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-xs text-zinc-400">
                    <div className="rounded-full bg-emerald-500/10 p-0.5 text-emerald-400 shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 space-y-3">
              <button
                onClick={() => handleOpenPaypal(p)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-amber-500/10"
              >
                Pagar con PayPal <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleOpenCard(p)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 font-semibold text-xs uppercase tracking-wider transition-all duration-200"
              >
                <CreditCard className="w-4 h-4 text-zinc-400" /> Tarjeta de Crédito / Débito
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Simulated PayPal Modal */}
      {showPaypalModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#003087] border border-blue-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-6 text-zinc-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-blue-900 pb-4">
              <div className="font-black italic text-xl text-white tracking-wider flex items-center gap-2">
                <span>PayPal</span>
                <span className="text-[10px] not-italic font-medium text-blue-300 bg-blue-900/60 px-2 py-0.5 rounded">Checkout</span>
              </div>
              <button
                onClick={() => setShowPaypalModal(false)}
                className="text-blue-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Plan summary */}
            <div className="bg-[#00246b]/60 border border-blue-900 p-4 rounded-xl space-y-2">
              <div className="text-xs text-blue-300 uppercase font-bold tracking-wider">Destinatario: luisdavidgarza388@gmail.com</div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">{selectedPlan.name}</span>
                <span className="font-mono font-bold text-lg">${selectedPlan.price.toFixed(2)} USD</span>
              </div>
            </div>

            {/* Login form */}
            <form onSubmit={handleSimulatePaypal} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-blue-300 mb-1.5 block">Correo Electrónico de PayPal</label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@paypal.com"
                  className="w-full bg-[#00246b] border border-blue-850 text-white placeholder:text-blue-400/60 px-3 py-2.5 rounded-lg text-sm outline-none focus:border-blue-400 transition"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-blue-300 mb-1.5 block">Contraseña</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#00246b] border border-blue-850 text-white placeholder:text-blue-400/60 px-3 py-2.5 rounded-lg text-sm outline-none focus:border-blue-400 transition font-mono"
                  value={paypalPassword}
                  onChange={(e) => setPaypalPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading !== null}
                className="w-full py-3.5 bg-[#0079C1] hover:bg-[#008CDE] rounded-xl text-white font-bold text-sm uppercase tracking-wider transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                {loading === "paypal" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Procesando pago...
                  </>
                ) : (
                  "Iniciar Sesión y Pagar"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Simulated Credit Card Modal */}
      {showCardModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-6 text-zinc-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
              <h3 className="font-bold text-base text-zinc-150 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                Pagar con Tarjeta
              </h3>
              <button
                onClick={() => setShowCardModal(false)}
                className="text-zinc-500 hover:text-zinc-300 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Plan summary */}
            <div className="bg-zinc-900/60 border border-zinc-850 p-4 rounded-xl flex justify-between items-center">
              <div>
                <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Plan Seleccionado</div>
                <span className="text-sm font-semibold text-zinc-200">{selectedPlan.name}</span>
              </div>
              <span className="font-mono font-bold text-lg text-emerald-400">${selectedPlan.price.toFixed(2)} USD</span>
            </div>

            {/* Credit Card Form */}
            <form onSubmit={handleSimulateCard} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">Nombre en la Tarjeta</label>
                <input
                  type="text"
                  required
                  placeholder="Juan Perez"
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 px-3 py-2.5 rounded-lg text-sm outline-none focus:border-emerald-500/50 transition"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">Número de Tarjeta</label>
                <input
                  type="text"
                  required
                  maxLength={19}
                  placeholder="4000 1234 5678 9010"
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 px-3 py-2.5 rounded-lg text-sm outline-none focus:border-emerald-500/50 transition font-mono"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">Expiración (MM/AA)</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="12/29"
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 px-3 py-2.5 rounded-lg text-sm outline-none focus:border-emerald-500/50 transition font-mono"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">CVV / CVC</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="•••"
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 px-3 py-2.5 rounded-lg text-sm outline-none focus:border-emerald-500/50 transition font-mono"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">Correo para Recibo / Transferencia</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="tu-correo@ejemplo.com"
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 pl-10 pr-3 py-2.5 rounded-lg text-sm outline-none focus:border-emerald-500/50 transition"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Mail className="w-4 h-4 text-zinc-650 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading !== null}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-bold text-sm uppercase tracking-wider transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                {loading === "card" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Procesando pago...
                  </>
                ) : (
                  "Confirmar Pago de Tarjeta"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
