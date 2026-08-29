import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { resetTokenStore } from "@/lib/reset-token-store";
import { checkRateLimit, LOGIN_RATE_LIMIT } from "@/lib/rate-limit";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // ─── Rate limiting: max 8/min per IP ───
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = checkRateLimit(`forgot:${ip}`, LOGIN_RATE_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json({ success: false, message: "Demasiados intentos. Espera unos minutos." }, { status: 429 });
    }

    const { email } = await req.json().catch(() => ({}));

    if (!email || typeof email !== "string") {
      return NextResponse.json({ success: false, message: "Email requerido." }, { status: 400 });
    }

    const admin = await store.getAdminByEmail(email.toLowerCase().trim());

    // Always return success to avoid email enumeration
    if (!admin) {
      return NextResponse.json({ success: true, message: "Si ese correo está registrado, recibirás un enlace de restablecimiento." });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
    resetTokenStore.set(token, { adminId: admin.id, expiresAt });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://keyauthpro.xyz"}/reset-password?token=${token}`;
    const resendKey = process.env.RESEND_API_KEY;

    if (resendKey) {
      const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#010309;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#010309;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#050d1a;border:1px solid #0ea5e920;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg,#0ea5e9 0%,#06b6d4 100%);padding:28px 32px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">🔐 Restablecer Contraseña</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">SecureX Auth — Recuperación de Cuenta</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="color:#a1a1aa;font-size:14px;margin:0 0 8px;">Hola, <strong style="color:#fff;">${admin.username || admin.email}</strong> 👋</p>
            <p style="color:#a1a1aa;font-size:14px;margin:0 0 24px;">Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para continuar:</p>
            <div style="text-align:center;margin-bottom:28px;">
              <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#06b6d4);color:#fff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:10px;text-decoration:none;letter-spacing:0.5px;">Restablecer Contraseña →</a>
            </div>
            <p style="color:#71717a;font-size:12px;margin:0 0 8px;">Este enlace expira en <strong style="color:#a1a1aa;">1 hora</strong>.</p>
            <p style="color:#71717a;font-size:12px;margin:0;">Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña seguirá siendo la misma.</p>
            <div style="background:#1a0a00;border:1px solid #f9731630;border-radius:8px;padding:12px 16px;margin-top:20px;">
              <p style="margin:0;color:#fdba74;font-size:12px;">⚠️ Nunca compartas este enlace con nadie. SecureX Auth jamás te pedirá tu contraseña.</p>
            </div>
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

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "SecureX Auth <noreply@keyauthpro.xyz>",
          to: [admin.email],
          subject: "🔐 Restablecer Contraseña — SecureX Auth",
          html,
        }),
      });
    }

    // Return the token in dev mode if no email configured
    return NextResponse.json({
      success: true,
      message: "Si ese correo está registrado, recibirás un enlace de restablecimiento.",
      ...(process.env.NODE_ENV === "development" && !resendKey ? { dev_token: token, dev_url: resetUrl } : {}),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Error interno." }, { status: 500 });
  }
}


