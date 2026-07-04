"use client";
import { useState, useEffect } from "react";
import { Coins, CreditCard, Sparkles, Check, Loader2, ArrowRight, X, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ShopPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [showPaypalModal, setShowPaypalModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: number; type: "monthly" | "yearly" } | null>(null);
  
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkLoading, setSdkLoading] = useState(false);

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
    setSdkReady(false);
    setSdkLoading(false);
  }

  function handleOpenCard(plan: typeof plans[0]) {
    // Both point to PayPal because PayPal SDK renders Debit/Credit card options securely!
    setSelectedPlan(plan);
    setShowPaypalModal(true);
    setSdkReady(false);
    setSdkLoading(false);
  }

  // Effect to load PayPal SDK dynamically when modal is opened
  useEffect(() => {
    if (!showPaypalModal || !selectedPlan) return;
    
    let isMounted = true;
    
    async function initPaypal() {
      if ((window as any).paypal) {
        setSdkReady(true);
        return;
      }
      
      setSdkLoading(true);
      try {
        const res = await fetch("/api/admin/checkout/config");
        const data = await res.json();
        if (!res.ok || !data.clientId) {
          throw new Error("No se pudo obtener el Client ID de PayPal");
        }
        
        if (!isMounted) return;
        
        // Check if script already exists to avoid duplication
        const existingScript = document.getElementById("paypal-sdk-script");
        if (existingScript) {
          const interval = setInterval(() => {
            if ((window as any).paypal) {
              clearInterval(interval);
              if (isMounted) {
                setSdkReady(true);
                setSdkLoading(false);
              }
            }
          }, 100);
          return;
        }
        
        const script = document.createElement("script");
        script.id = "paypal-sdk-script";
        script.src = `https://www.paypal.com/sdk/js?client-id=${data.clientId}&currency=USD&intent=capture&enable-funding=card`;
        script.onload = () => {
          if (isMounted) {
            setSdkReady(true);
            setSdkLoading(false);
          }
        };
        script.onerror = () => {
          console.error("Error al cargar el SDK de PayPal");
          if (isMounted) {
            setSdkLoading(false);
            alert("No se pudo cargar la pasarela de PayPal");
          }
        };
        document.body.appendChild(script);
      } catch (err: any) {
        console.error("Error al inicializar PayPal:", err);
        if (isMounted) {
          setSdkLoading(false);
          alert("Error al inicializar PayPal: " + err.message);
        }
      }
    }
    
    initPaypal();
    
    return () => {
      isMounted = false;
    };
  }, [showPaypalModal, selectedPlan]);

  // Effect to render PayPal Buttons when SDK is ready and element exists
  useEffect(() => {
    if (!sdkReady || !showPaypalModal || !selectedPlan) return;
    
    const container = document.getElementById("paypal-button-container");
    if (!container) return;
    
    // Clear any previous button rendering
    container.innerHTML = "";
    
    try {
      (window as any).paypal.Buttons({
        style: {
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "pay",
          height: 45
        },
        createOrder: async () => {
          const res = await fetch("/api/admin/checkout/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ planType: selectedPlan.type }),
          });
          const orderData = await res.json();
          if (!res.ok || !orderData.id) {
            throw new Error(orderData.message || "Error al crear la orden de pago");
          }
          return orderData.id;
        },
        onApprove: async (approveData: any) => {
          setLoading("paypal_capture");
          try {
            const res = await fetch("/api/admin/checkout/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: approveData.orderID, planType: selectedPlan.type }),
            });
            const captureData = await res.json();
            if (res.ok && captureData.success) {
              alert(`¡Pago exitoso! Plan activado correctamente.\n\nTu cuenta ahora cuenta con acceso VIP Ilimitado.`);
              setShowPaypalModal(false);
              router.refresh();
              router.push("/dashboard");
            } else {
              alert(captureData.message || "Error al capturar el pago");
            }
          } catch (err) {
            alert("Error de red al procesar el pago");
          } finally {
            setLoading(null);
          }
        },
        onError: (err: any) => {
          console.error("PayPal Error:", err);
          alert("Error en la pasarela de PayPal. Por favor, intente de nuevo.");
        }
      }).render("#paypal-button-container");
    } catch (err) {
      console.error("Fallo al renderizar los botones de PayPal:", err);
    }
  }, [sdkReady, showPaypalModal, selectedPlan]);

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

      {/* Real PayPal Modal */}
      {showPaypalModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-6 text-zinc-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-zinc-150">Pagar Suscripción</h3>
                <p className="text-xs text-zinc-500 mt-1">Conexión cifrada de extremo a extremo</p>
              </div>
              <button
                onClick={() => setShowPaypalModal(false)}
                className="text-zinc-400 hover:text-zinc-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Plan summary */}
            <div className="bg-zinc-950/50 border border-zinc-850 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-zinc-350">{selectedPlan.name}</span>
                <span className="font-mono font-bold text-lg text-emerald-400">${selectedPlan.price.toFixed(2)} USD</span>
              </div>
            </div>

            {/* Loader / PayPal Container */}
            <div className="space-y-4">
              {sdkLoading && (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  <span className="text-xs text-zinc-400">Cargando métodos de pago seguros...</span>
                </div>
              )}
              
              <div 
                id="paypal-button-container" 
                className={sdkLoading ? "hidden" : "block min-h-[150px]"}
              />
              
              {loading === "paypal_capture" && (
                <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-3.5 text-xs text-emerald-400 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Verificando y activando su suscripción VIP... Por favor, no cierre esta ventana.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

