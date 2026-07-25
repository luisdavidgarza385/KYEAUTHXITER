import { NextRequest } from "next/server";
import { requireAdmin, safeRoute } from "@/lib/api-helpers";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID || "Acahbaw5KeItx3JVKQxVHi7YqnbGkqMtUwv7VBbgaiPa7vUO2A7QOHdtI3zSZy7TZ6M1Qvnh_4WoIoAj";
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || "EDQVCgyyHSqpMt_YxVLPUx_WLwysZS6b94YPmRgTakhy6fHsbCBatATHtluGRegl5bX5mm-PtC5HD-Xy";
  const paypalApi = process.env.PAYPAL_API || "https://api-m.paypal.com";

  if (!clientId || !clientSecret) {
    throw new Error("Credenciales de PayPal no configuradas.");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${paypalApi}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || "Error de autenticación con PayPal");
  }
  return data.access_token;
}

export async function POST(req: NextRequest) {
  return safeRoute(async () => {
    const me = await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const orderId = String(body?.orderId || "");
    const planId = String(body?.planId || "vip").toLowerCase();

    if (!orderId) {
      return { status: 400, data: { success: false, message: "orderId es requerido" } };
    }

    const accessToken = await getPayPalAccessToken();
    const paypalApi = process.env.PAYPAL_API || "https://api-m.paypal.com";

    const captureRes = await fetch(`${paypalApi}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const captureData = await captureRes.json();
    if (!captureRes.ok || captureData.status !== "COMPLETED") {
      return {
        status: 400,
        data: {
          success: false,
          message: captureData.message || "El pago no pudo ser completado o fue cancelado.",
        },
      };
    }

    // Payment COMPLETED -> Activate subscription for 30 days
    const admin = await store.getAdminById(me.id);
    if (!admin) {
      return { status: 404, data: { success: false, message: "Usuario no encontrado" } };
    }

    const now = Date.now();
    const isYearly = planId === "unlimited";
    const durationMs = (isYearly ? 365 : 30) * 24 * 60 * 60 * 1000; // 365 days for $7.99, 30 days for $1.99
    const expiresAt = new Date(now + durationMs).toISOString();

    const currentSubs: string[] = Array.isArray(admin.subscriptions) ? admin.subscriptions : [];
    const newSubs = Array.from(new Set([...currentSubs, planId, "vip"]));

    let updatedCredits = admin.credits || 0;
    if (planId === "unlimited") {
      updatedCredits = -1; // Unlimited credits
    } else if (updatedCredits >= 0 && updatedCredits < 5000) {
      updatedCredits = 5000;
    }

    await store.updateAdmin(admin.id, {
      ...admin,
      subscriptions: newSubs,
      subscription_end: expiresAt,
      credits: updatedCredits,
    });

    return {
      data: {
        success: true,
        message: `¡Pago de $${isYearly ? "7.99" : "1.99"} exitoso! Tu suscripción ${isYearly ? "Ilimitada (1 Año - 365 días)" : "VIP (1 Mes - 30 días)"} ha sido activada correctamente.`,
      },
    };
  });
}
