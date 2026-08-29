"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, CreditCard } from "lucide-react";

declare global {
  interface Window {
    paypal?: any;
  }
}

export function PayPalButtonWrapper({
  planId,
  planName,
  price,
}: {
  planId: "vip" | "unlimited";
  planName: string;
  price: string;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [btnContainerId] = useState(() => `paypal-container-${planId}`);

  const clientId = "Acahbaw5KeItx3JVKQxVHi7YqnbGkqMtUwv7VBbgaiPa7vUO2A7QOHdtI3zSZy7TZ6M1Qvnh_4WoIoAj";

  useEffect(() => {
    let checkInterval: any = null;

    const renderButtons = () => {
      const container = document.getElementById(btnContainerId);
      if (!container) return;
      container.innerHTML = "";

      try {
        window.paypal
          .Buttons({
            style: {
              layout: "vertical",
              color: planId === "unlimited" ? "gold" : "blue",
              shape: "pill",
              label: "pay",
            },
            createOrder: async () => {
              setError(null);
              setSuccessMsg(null);
              const res = await fetch("/api/paypal/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId }),
              });
              const data = await res.json();
              if (!res.ok || !data.orderId) {
                throw new Error(data.message || "Error al crear la orden de PayPal.");
              }
              return data.orderId;
            },
            onApprove: async (data: any) => {
              setLoading(true);
              try {
                const res = await fetch("/api/paypal/capture-order", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ orderId: data.orderID, planId }),
                });
                const captureData = await res.json();
                if (res.ok && captureData.success) {
                  setSuccessMsg(captureData.message || "¡Pago completado con éxito! Redirigiendo...");
                  setTimeout(() => {
                    window.location.href = "/dashboard/apps";
                  }, 2000);
                } else {
                  setError(captureData.message || "Error activando la suscripción.");
                }
              } catch (err: any) {
                setError(err.message || "Error procesando la captura de pago.");
              } finally {
                setLoading(false);
              }
            },
            onError: (err: any) => {
              console.error("PayPal Error:", err);
            },
          })
          .render(`#${btnContainerId}`)
          .then(() => {
            setLoading(false);
            setError(null);
          })
          .catch((e: any) => {
            console.error(e);
            setLoading(false);
          });
      } catch (e: any) {
        console.error(e);
        setLoading(false);
      }
    };

    const initPayPal = () => {
      let script = document.getElementById("paypal-sdk-script") as HTMLScriptElement;
      if (!script) {
        script = document.createElement("script");
        script.id = "paypal-sdk-script";
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&components=buttons`;
        script.async = true;
        document.body.appendChild(script);
      }

      let attempts = 0;
      checkInterval = setInterval(() => {
        attempts++;
        if (window.paypal) {
          clearInterval(checkInterval);
          setLoading(false);
          renderButtons();
        } else if (attempts > 50) {
          clearInterval(checkInterval);
          setError("Error cargando pasarela de pago PayPal.");
          setLoading(false);
        }
      }, 200);
    };

    initPayPal();

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [planId, btnContainerId, clientId]);

  if (successMsg) {
    return (
      <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/30 p-4 text-center space-y-2 animate-fade-in">
        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
        <p className="text-xs font-bold text-emerald-300">{successMsg}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full">
      {error && (
        <div className="rounded-xl bg-red-950/40 border border-red-500/30 p-3 text-[11px] text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-2 text-xs text-sky-400 font-mono animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
          <span>Cargando botones de pago...</span>
        </div>
      )}

      <div id={btnContainerId} className="w-full min-h-[45px]" />

      <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 font-mono">
        <CreditCard className="w-3 h-3 text-zinc-400" />
        <span>Acepta PayPal y Tarjetas de Crédito / Débito sin cuenta</span>
      </div>
    </div>
  );
}
