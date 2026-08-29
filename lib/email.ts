import nodemailer from "nodemailer";

// ─────────────────────────────────────────────
// Sender utility (Supports Resend and Gmail SMTP)
// ─────────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string) {
  // 1. Try Resend if configured
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendApiKey);
      const fromAddress = process.env.RESEND_FROM_EMAIL || "SecureX Auth <onboarding@resend.dev>";
      const result = await resend.emails.send({
        from: fromAddress,
        to: [to],
        subject,
        html,
      });
      console.log("[email-resend] Sent to", to, ":", result);
      return;
    } catch (e) {
      console.error("[email-resend] Failed to send to", to, ":", e);
    }
  }

  // 2. Try SMTP (Gmail or custom SMTP)
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "465", 10),
        secure: (process.env.SMTP_PORT || "465") === "465",
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || `"SecureX Auth" <${smtpUser}>`,
        to,
        subject,
        html,
      });
      console.log("[email-smtp] Sent to", to, ":", info.messageId);
      return;
    } catch (e) {
      console.error("[email-smtp] Failed to send to", to, ":", e);
    }
  }

  console.warn(`[email] No active mail provider found. Please add RESEND_API_KEY or SMTP_USER/SMTP_PASS in .env.local to send real emails.`);
}

// ─────────────────────────────────────────────
// Verification Email (Notification with Button)
// ─────────────────────────────────────────────
export function generateVerificationEmailHtml(data: {
  username: string;
  email: string;
  verifyUrl: string;
  date?: string;
}) {
  const dateStr = data.date || new Date().toLocaleString();

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Verificación de Acceso — SecureX Auth</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #020612; color: #e2e8f0; margin: 0; padding: 20px; }
  .card { max-width: 520px; margin: 0 auto; background: #040e24; border-radius: 24px; border: 1px solid rgba(0, 153, 255, 0.35); padding: 32px; box-shadow: 0 20px 60px rgba(0,0,0,0.9); }
  .header { text-align: center; margin-bottom: 24px; }
  .header h1 { font-size: 24px; font-weight: 900; color: #ffffff; margin: 0 0 6px 0; letter-spacing: -0.5px; }
  .header p { font-size: 13px; color: #94a3b8; margin: 0; }
  .btn-verify { display: block; background: linear-gradient(135deg, #0088ff, #00c2ff); color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 800; padding: 15px 30px; border-radius: 14px; margin: 24px 0; text-align: center; box-shadow: 0 0 25px rgba(0, 153, 255, 0.45); letter-spacing: 0.5px; }
  .box { background: #020716; border: 1px solid rgba(0, 153, 255, 0.2); border-radius: 18px; padding: 20px; margin-bottom: 20px; }
  .row { display: flex; justify-content: space-between; font-size: 12px; padding: 9px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
  .row:last-child { border-bottom: none; }
  .label { color: #64748b; font-weight: 600; }
  .val { color: #ffffff; font-weight: 700; }
  .val-blue { color: #00c2ff; font-weight: 800; font-family: monospace; }
  .security-notice { background: rgba(0, 255, 136, 0.08); border: 1px solid rgba(0, 255, 136, 0.25); color: #00ff88; border-radius: 14px; padding: 14px; font-size: 12px; line-height: 1.5; margin-bottom: 20px; }
  .footer-row { text-align: center; font-size: 11px; color: #64748b; margin-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 18px; }
</style>
</head>
<body>
  <div class="card">
    <div style="text-align:center;margin-bottom:18px;">
      <div style="display:inline-block;width:60px;height:60px;border-radius:16px;background:linear-gradient(135deg, #0088ff, #0044aa);padding:1px;box-shadow:0 0 20px rgba(0,153,255,0.5);">
        <div style="width:100%;height:100%;background:#040e24;border-radius:15px;display:flex;align-items:center;justify-content:center;font-size:26px;">🛡️</div>
      </div>
    </div>
    <div class="header">
      <span style="font-size:10px;font-weight:900;letter-spacing:2px;color:#00c2ff;text-transform:uppercase;">SECUREX AUTH · SEGURIDAD</span>
      <h1>Verificación de Acceso</h1>
      <p>Hola <strong>${data.username}</strong>, autoriza tu inicio de sesión para ingresar a la plataforma.</p>
    </div>
    
    <div class="box">
      <div class="row"><span class="label">Plataforma</span><span class="val">SecureX Auth Center</span></div>
      <div class="row"><span class="label">Cuenta de acceso</span><span class="val-blue">${data.email}</span></div>
      <div class="row"><span class="label">Fecha de solicitud</span><span class="val">${dateStr}</span></div>
      <div class="row"><span class="label">Estado</span><span class="val" style="color:#f59e0b;">⏳ Pendiente de Verificación</span></div>
    </div>

    <a href="${data.verifyUrl}" class="btn-verify">VERIFICAR Y ENTRAR A SECUREX AUTH ➔</a>

    <div class="security-notice">
      🔒 <strong>Acceso Protegido:</strong> Si tú no solicitaste este acceso, puedes ignorar este mensaje de forma segura.
    </div>

    <div class="footer-row">
      SecureX Auth — Plataforma Oficial de Autenticación y Control de Licencias
    </div>
  </div>
</body>
</html>`;
}

export async function sendVerificationEmail(data: {
  username: string;
  email: string;
  verifyUrl: string;
}) {
  const html = generateVerificationEmailHtml(data);
  await sendEmail(data.email, "🔒 Verifica tu acceso a SecureX Auth", html);
}

// ─────────────────────────────────────────────
// Registration / Auth Welcome Email
// ─────────────────────────────────────────────
export async function sendAuthReceiptEmail(data: {
  username: string;
  email: string;
  licenseKey: string;
  deviceId?: string;
  date?: string;
}) {
  const html = generateAuthReceiptEmailHtml(data);
  await sendEmail(data.email, "Autenticación SecureX Auth – Tu Keyau está activa ✅", html);
}

// ─────────────────────────────────────────────
// Payment / Purchase Receipt Email
// ─────────────────────────────────────────────
export async function sendPaymentReceiptEmail(data: {
  username: string;
  email: string;
  amount: string;
  transactionId: string;
  date?: string;
  paymentMethod?: string;
}) {
  const html = generatePaymentReceiptEmailHtml(data);
  await sendEmail(data.email, `¡${data.username} 🥳, has pagado tu Keyau SecureX Auth!`, html);
}

// ─────────────────────────────────────────────
// HTML Template: Payment Receipt
// ─────────────────────────────────────────────
export function generatePaymentReceiptEmailHtml(data: {
  username: string;
  email: string;
  amount: string;
  transactionId: string;
  date?: string;
  paymentMethod?: string;
}) {
  const dateStr = data.date || new Date().toLocaleString();
  const method = data.paymentMethod || "PayPal / Google Play Store";

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>¡${data.username} 🥳, has pagado tu Keyau SecureX Auth!</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f4f6f8; color: #1e293b; margin: 0; padding: 20px; }
  .card { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 28px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
  .header { text-align: center; margin-bottom: 24px; }
  .header h1 { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0; }
  .header p { font-size: 13px; color: #64748b; margin: 0; }
  .btn-green { display: block; background: #00b060; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 24px; border-radius: 12px; margin: 16px 0 24px 0; text-align: center; }
  .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px; margin-bottom: 20px; }
  .row { display: flex; justify-content: space-between; font-size: 12px; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
  .row:last-child { border-bottom: none; }
  .label { color: #64748b; font-weight: 500; }
  .val { color: #0f172a; font-weight: 700; }
  .val-green { color: #00b060; font-weight: 800; }
  .status-box { background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; border-radius: 14px; padding: 14px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
  .footer-row { display: flex; justify-content: space-around; text-align: center; font-size: 11px; font-weight: 700; color: #475569; margin-top: 20px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
  .footer-row a { color: #475569; text-decoration: none; }
</style>
</head>
<body>
  <div class="card">
    <div style="text-align:center;margin-bottom:16px;">
      <img src="https://keyauthpro.xyz/logo.png" width="56" height="56" style="border-radius:14px;box-shadow:0 4px 12px rgba(0,0,0,0.1);" alt="SecureX Auth" />
    </div>
    <div class="header">
      <h1>¡${data.username} 🥳, has pagado tu Keyau SecureX Auth!</h1>
      <p>Gracias por tu compra.</p>
    </div>
    <a href="https://keyauthpro.xyz/dashboard/shop" class="btn-green">Ver todos los detalles</a>
    <div class="box">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
        <div style="width:36px;height:36px;border-radius:10px;background:#6366f1;color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;">🛡️</div>
        <div>
          <div style="font-size:13px;font-weight:700;">SecureX Auth</div>
          <div style="font-size:11px;color:#64748b;">Keyau (Licencia Premium)</div>
        </div>
      </div>
      <div class="row"><span class="label">Producto</span><span class="val">SecureX Auth – Keyau (Licencia Premium)</span></div>
      <div class="row"><span class="label">Importe</span><span class="val">USD ${data.amount}</span></div>
      <div class="row"><span class="label">Impuestos</span><span class="val">USD 0.00</span></div>
      <div class="row"><span class="label">Total</span><span class="val-green">USD ${data.amount}</span></div>
    </div>
    <div class="box">
      <div class="row"><span class="label">Fecha de pago</span><span class="val">${dateStr}</span></div>
      <div class="row"><span class="label">Método de pago</span><span class="val">${method}</span></div>
      <div class="row"><span class="label">ID de transacción</span><span class="val" style="font-family:monospace;">${data.transactionId}</span></div>
    </div>
    <div class="status-box">✅ <div><strong>Pago completado</strong><br/><span style="font-weight:normal;">Tu Keyau ha sido activada correctamente.</span></div></div>
    <div class="footer-row">
      <a href="https://keyauthpro.xyz/docs">❓ Consulta las preguntas frecuentes</a>
      <a href="https://keyauthpro.xyz/dashboard/chat">🎧 Soporte SecureX Auth</a>
    </div>
  </div>
</body>
</html>`;
}

// ─────────────────────────────────────────────
// HTML Template: Auth Receipt
// ─────────────────────────────────────────────
export function generateAuthReceiptEmailHtml(data: {
  username: string;
  email: string;
  licenseKey: string;
  deviceId?: string;
  date?: string;
}) {
  const dateStr = data.date || new Date().toLocaleString();
  const device = data.deviceId || "Web Client - SecureX Device";

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Autenticación SecureX Auth</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f4f6f8; color: #1e293b; margin: 0; padding: 20px; }
  .card { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 28px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
  .header h1 { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; }
  .header p { font-size: 13px; color: #64748b; margin: 0 0 20px 0; }
  .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px; margin-bottom: 18px; }
  .row { display: flex; justify-content: space-between; font-size: 12px; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
  .row:last-child { border-bottom: none; }
  .label { color: #64748b; font-weight: 500; }
  .val { color: #0f172a; font-weight: 700; }
  .status-badge { background: #dcfce7; color: #15803d; font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; }
  .auth-box { background: #f3e8ff; border: 1px solid #e9d5ff; color: #6b21a8; border-radius: 16px; padding: 16px; margin-bottom: 18px; font-size: 12px; }
  .prot-box { background: #faf5ff; border: 1px solid #f3e8ff; border-radius: 16px; padding: 16px; margin-bottom: 18px; font-size: 12px; }
  .footer-row { display: flex; justify-content: space-around; text-align: center; font-size: 11px; font-weight: 700; color: #475569; margin-top: 18px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
  .footer-row a { color: #475569; text-decoration: none; }
</style>
</head>
<body>
  <div class="card">
    <div style="text-align:center;margin-bottom:16px;">
      <img src="https://keyauthpro.xyz/logo.png" width="56" height="56" style="border-radius:14px;box-shadow:0 4px 12px rgba(0,0,0,0.1);" alt="SecureX Auth" />
    </div>
    <div class="header">
      <h1>Autenticación SecureX Auth</h1>
      <p>Tu Keyau ha sido autenticada correctamente.</p>
    </div>
    <div class="auth-box">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:28px;height:28px;border-radius:50%;background:#7e22ce;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:14px;">✓</div>
        <div>
          <strong style="color:#581c87;">Keyau autenticada</strong><br/>
          <span style="color:#7e22ce;">La licencia SecureX Auth está activa y funcionando correctamente.</span>
        </div>
      </div>
    </div>
    <div class="box">
      <div class="row"><span class="label">Producto</span><span class="val">SecureX Auth – Keyau (Licencia Premium)</span></div>
      <div class="row"><span class="label">Estado</span><span class="status-badge">Activa</span></div>
      <div class="row"><span class="label">Usuario</span><span class="val">${data.username}</span></div>
      <div class="row"><span class="label">Correo</span><span class="val" style="color:#6b21a8;">${data.email}</span></div>
      <div class="row"><span class="label">Fecha de autenticación</span><span class="val">${dateStr}</span></div>
      <div class="row"><span class="label">ID de dispositivo</span><span class="val">${device}</span></div>
      <div class="row"><span class="label">Clave de licencia (Keyau)</span><span class="val" style="font-family:monospace;background:#f3e8ff;padding:2px 8px;border-radius:6px;color:#6b21a8;">${data.licenseKey}</span></div>
    </div>
    <div class="prot-box">
      <strong style="color:#581c87;">🛡️ Tu Keyau está protegida</strong><br/>
      <span style="color:#7e22ce;">No compartas tu clave de licencia con nadie. SecureX Auth protege tu acceso.</span>
    </div>
    <div class="footer-row">
      <a href="https://keyauthpro.xyz/docs">❓ Consulta las preguntas frecuentes</a>
      <a href="https://keyauthpro.xyz/dashboard/licenses">🛡️ Gestionar mi Keyau</a>
    </div>
  </div>
</body>
</html>`;
}
