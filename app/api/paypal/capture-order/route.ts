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

async function sendReceiptEmail(email: string, username: string, planName: string, amount: string, expiresAt: string) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return; // Skip silently if not configured

  const formattedDate = new Date(expiresAt).toLocaleDateString("es-ES", {
    year: "numeric", month: "long", day: "numeric",
  });

  const invoiceHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#010309;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#010309;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#050d1a;border:1px solid #0ea5e920;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg,#0ea5e9 0%,#06b6d4 100%);padding:28px 32px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">✅ Pago Confirmado</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">SecureX Auth — Factura de Suscripción</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="color:#a1a1aa;font-size:14px;margin:0 0 8px;">Hola, <strong style="color:#fff;">${username}</strong> 👋</p>
            <p style="color:#a1a1aa;font-size:14px;margin:0 0 24px;">Tu pago fue procesado correctamente. A continuación el resumen de tu compra:</p>
            <table width="100%" cellpadding="12" cellspacing="0" style="background:#0a1628;border:1px solid #0ea5e915;border-radius:10px;margin-bottom:24px;">
              <tr style="border-bottom:1px solid #0ea5e915;">
                <td style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Plan</td>
                <td align="right" style="color:#fff;font-size:14px;font-weight:700;">${planName}</td>
              </tr>
              <tr style="border-bottom:1px solid #0ea5e915;">
                <td style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Monto Pagado</td>
                <td align="right" style="color:#22c55e;font-size:14px;font-weight:700;">$${amount} USD</td>
              </tr>
              <tr style="border-bottom:1px solid #0ea5e915;">
                <td style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Fecha de Pago</td>
                <td align="right" style="color:#fff;font-size:13px;">${new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}</td>
              </tr>
              <tr>
                <td style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Suscripción Activa Hasta</td>
                <td align="right" style="color:#38bdf8;font-size:13px;font-weight:600;">${formattedDate}</td>
              </tr>
            </table>
            <div style="background:#0f2d0f;border:1px solid #22c55e30;border-radius:8px;padding:14px 18px;margin-bottom:24px;">
              <p style="margin:0;color:#86efac;font-size:13px;">🎉 Tu suscripción <strong>${planName}</strong> está activa. Ahora tienes acceso completo al Builder, Suscripciones y todas las funciones premium de SecureX Auth.</p>
            </div>
            <p style="color:#71717a;font-size:12px;margin:0;">Si no realizaste este pago, contáctanos de inmediato respondiendo a este correo.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#020810;padding:16px 32px;text-align:center;border-top:1px solid #0ea5e910;">
            <p style="margin:0;color:#3f3f46;font-size:11px;">SecureX Auth © ${new Date().getFullYear()} — keyauthpro.xyz</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SecureX Auth <noreply@keyauthpro.xyz>",
        to: [email],
        subject: `✅ Pago Confirmado – ${planName} | SecureX Auth`,
        html: invoiceHtml,
      }),
    });
  } catch {
    // Don't fail the payment if email fails
  }
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

    // Send receipt email (async, non-blocking)
    const planName = isYearly ? "Plan Ilimitado (1 Año)" : "Plan VIP (1 Mes)";
    const amount = isYearly ? "7.99" : "1.99";
    sendReceiptEmail(admin.email, admin.username || admin.email, planName, amount, expiresAt).catch(() => {});

    return {
      data: {
        success: true,
        message: `¡Pago de $${isYearly ? "7.99" : "1.99"} exitoso! Tu suscripción ${isYearly ? "Ilimitada (1 Año - 365 días)" : "VIP (1 Mes - 30 días)"} ha sido activada correctamente.`,
      },
    };
  });
}
