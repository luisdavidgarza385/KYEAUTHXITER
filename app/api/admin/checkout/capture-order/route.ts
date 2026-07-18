import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, safeRoute } from "@/lib/api-helpers";
import { store } from "@/lib/store";
import { setAdminSession } from "@/lib/auth";

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
    const me = await requireAdmin();

    // 2. Parse request body
    const body = await req.json().catch(() => ({}));
    const orderId = String(body?.orderId || "");
    const planType = String(body?.planType || "monthly");

    if (!orderId) {
      return { status: 400, data: { success: false, message: "orderId es requerido" } };
    }

    // 3. Define expected price
    const expectedPrice = planType === "yearly" ? 15.00 : 4.00;

    // 4. Get PayPal access token
    const accessToken = await getAccessToken();

    // 5. Capture the PayPal order
    const ppRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const data = await ppRes.json();
    if (!ppRes.ok) {
      throw new Error(data.message || "Error de PayPal al capturar la orden");
    }

    if (data.status !== "COMPLETED") {
      return {
        status: 400,
        data: { success: false, message: `Pago no completado. Estado: ${data.status}` },
      };
    }

    // 6. Verify paid amount matches expected price
    try {
      const capture = data.purchase_units[0].payments.captures[0];
      const paidAmount = parseFloat(capture.amount.value);
      if (Math.abs(paidAmount - expectedPrice) > 0.01) {
        return {
          status: 400,
          data: {
            success: false,
            message: `El monto pagado ($${paidAmount}) no coincide con el precio del plan ($${expectedPrice})`,
          },
        };
      }
    } catch (parseErr) {
      throw new Error("No se pudo verificar el monto del pago en la respuesta de PayPal");
    }

    // 7. Get admin user from database
    const admin = await store.getAdminById(me.id);
    if (!admin) {
      return { status: 404, data: { success: false, message: "Usuario no encontrado" } };
    }

    // 8. Upgrade role to admin and set status / credits / permissions
    const updated = await store.updateAdmin(admin.id, {
      ...admin,
      role: "admin",
      credits: 999999, // Unlimited credits
      status: "Activo",
      permissions: ["generar", "hwid", "ban", "delete"],
    });

    // Actualizar automáticamente la cookie de sesión en el navegador con el nuevo rol
    setAdminSession({
      id: updated.id,
      email: updated.email,
      role: updated.role
    });

    return {
      data: {
        success: true,
        status: "COMPLETED",
        message: "Suscripción actualizada con éxito",
        data: updated,
      },
    };
  });
}
