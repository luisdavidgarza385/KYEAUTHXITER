import { NextRequest } from "next/server";
import { requireAdmin, safeRoute } from "@/lib/api-helpers";

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
    await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const planId = String(body?.planId || "vip").toLowerCase();

    let amount = "1.99";
    let description = "Plan VIP — SecureX Auth (1 Mes)";
    if (planId === "unlimited") {
      amount = "7.99";
      description = "Plan Ilimitado — SecureX Auth (1 Mes)";
    }

    const accessToken = await getPayPalAccessToken();
    const paypalApi = process.env.PAYPAL_API || "https://api-m.paypal.com";

    const orderRes = await fetch(`${paypalApi}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount,
            },
            description,
          },
        ],
        application_context: {
          brand_name: "SecureX Auth",
          landing_page: "NO_PREFERENCE",
          user_action: "PAY_NOW",
        },
      }),
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok || !orderData.id) {
      return { status: 400, data: { success: false, message: orderData.message || "Error creando orden de PayPal" } };
    }

    return { data: { success: true, orderId: orderData.id } };
  });
}
