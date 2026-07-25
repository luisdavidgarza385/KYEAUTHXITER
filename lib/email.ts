// Email utility: generates HTML templates AND sends real emails via Resend

// ─────────────────────────────────────────────
// Sender utility
// ─────────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set – email not sent.");
    return;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const fromAddress = process.env.RESEND_FROM_EMAIL || "SecureX Auth <noreply@keyauthpro.xyz>";
    const result = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject,
      html,
    });
    console.log("[email] Sent to", to, ":", result);
  } catch (e) {
    console.error("[email] Failed to send email to", to, ":", e);
  }
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
// HTML Template: Payment Receipt (Image 4 style)
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
// HTML Template: Auth Receipt (Image 5 style)
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
