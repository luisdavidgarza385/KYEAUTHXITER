import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, safeRoute } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

const PAYPAL_API = process.env.PAYPAL_API || "https://api-m.paypal.com";
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "";
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";

async function getAccessToken() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Credenciales de PayPal no configuradas en el servidor");
  }
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || "Error de autenticación con PayPal");
  }
  return data.access_token;
}

export async function POST(req: NextRequest) {
  return safeRoute(async () => {
    // 1. Verify authenticated user
    await requireAdmin();

    // 2. Parse request body
    const body = await req.json().catch(() => ({}));
    const planType = String(body?.planType || "monthly");

    // 3. Define price and description based on plan type
    let priceStr = "4.00";
    let planName = "Plan Mensual VIP";
    if (planType === "yearly") {
      priceStr = "15.00";
      planName = "Plan Anual VIP";
    }

    // 4. Get PayPal access token
    const accessToken = await getAccessToken();

    // 5. Call PayPal checkout API to create the order
    const ppRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
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
              value: priceStr,
            },
            description: `${planName} - Tienda Guate Xiter`,
          },
        ],
      }),
    });

    const data = await ppRes.json();
    if (!ppRes.ok) {
      throw new Error(data.message || "Error de PayPal al crear la orden");
    }

    return {
      data: {
        success: true,
        id: data.id,
      },
    };
  });
}
