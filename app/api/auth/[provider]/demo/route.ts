import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { provider: string } }) {
  const provider = params.provider;
  const state = new URL(req.url).searchParams.get("state") || "";
  return new NextResponse(demoHtml(provider, state), {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function demoHtml(provider: string, state: string): string {
  const title = provider === "discord" ? "Discord" : provider === "google" ? "Google" : "Apple";
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Autorizar ${title} — SecureX Auth</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body { 
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
    background: #010408; 
    color: #e5edf5; 
    margin: 0; 
    min-height: 100vh; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    padding: 24px; 
    box-sizing: border-box;
  }
  .card { 
    max-width: 440px; 
    width: 100%; 
    background: rgba(10, 18, 26, 0.95); 
    border: 1px solid rgba(0, 191, 255, 0.3); 
    border-radius: 20px; 
    overflow: hidden; 
    box-shadow: 0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(0, 191, 255, 0.15); 
    backdrop-filter: blur(16px);
  }
  .header { 
    background: linear-gradient(135deg, rgba(0, 191, 255, 0.15) 0%, rgba(0, 120, 255, 0.05) 100%); 
    padding: 24px; 
    display: flex; 
    align-items: center; 
    gap: 14px; 
    border-bottom: 1px solid rgba(0, 191, 255, 0.2);
  }
  .header h1 { 
    margin: 0; 
    font-size: 18px; 
    color: #fff; 
    font-weight: 700; 
    letter-spacing: 0.02em;
  }
  .body { padding: 24px; }
  .body p { margin: 0 0 12px 0; color: #a1adb8; font-size: 13.5px; line-height: 1.5; }
  .body strong { color: #00bfff; font-weight: 600; }
  .badge { 
    display: inline-block; 
    background: rgba(0, 191, 255, 0.2); 
    color: #00bfff; 
    border: 1px solid rgba(0, 191, 255, 0.4);
    font-size: 10px; 
    font-weight: 700; 
    padding: 3px 8px; 
    border-radius: 6px; 
    margin-left: 8px; 
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .actions { display: flex; gap: 10px; margin-top: 24px; }
  button { 
    flex: 1; 
    padding: 12px 18px; 
    border-radius: 10px; 
    border: 0; 
    font-size: 13.5px; 
    font-weight: 700; 
    cursor: pointer; 
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .primary { 
    background: linear-gradient(135deg, #00bfff 0%, #0082c0 100%); 
    color: #fff; 
    box-shadow: 0 4px 15px rgba(0, 191, 255, 0.3);
  }
  .primary:hover { 
    background: linear-gradient(135deg, #0082c0 0%, #006090 100%); 
    transform: translateY(-1px);
  }
  .secondary { background: rgba(255,255,255,0.06); color: #a1adb8; border: 1px solid rgba(255,255,255,0.1); }
  .secondary:hover { background: rgba(255,255,255,0.1); color: #fff; }
  .email-input { 
    width: 100%; 
    box-sizing: border-box; 
    padding: 12px 14px; 
    background: rgba(0, 0, 0, 0.6); 
    border: 1px solid rgba(0, 191, 255, 0.2); 
    border-radius: 10px; 
    color: #fff; 
    font-size: 13.5px; 
    margin-top: 6px; 
    outline: none;
    transition: all 0.2s;
  }
  .email-input:focus { border-color: #00bfff; box-shadow: 0 0 0 3px rgba(0, 191, 255, 0.2); }
  .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #00bfff; font-weight: 700; display: block; }
</style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div style="width:36px;height:36px;border-radius:10px;background:rgba(0,191,255,0.15);border:1px solid rgba(0,191,255,0.3);display:flex;align-items:center;justify-content:center;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00bfff" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
      </div>
      <div>
        <h1>Autenticación ${title} <span class="badge">SecureX Auth</span></h1>
      </div>
    </div>
    <div class="body">
      <p><strong>SecureX Auth</strong> solicita acceso a tu cuenta de <strong>${title}</strong>.</p>
      <p>Esto permitirá verificar tu identidad e iniciar sesión inmediatamente.</p>
      
      <div style="margin-top:18px">
        <label class="label">Correo Electrónico (opcional)</label>
        <input class="email-input" id="email" placeholder="Déjalo en blanco para usar correo de prueba" />
      </div>

      <div class="actions">
        <button class="secondary" onclick="window.location.href='/login?err=access_denied'">Cancelar</button>
        <button class="primary" onclick="authorize()">Autorizar</button>
      </div>
    </div>
  </div>
  <script>
    window.addEventListener('DOMContentLoaded', function() {
      var saved = localStorage.getItem('ka_saved_oauth_email');
      if (saved) {
        document.getElementById('email').value = saved;
      }
    });
    function authorize() {
      var email = document.getElementById('email').value.trim();
      if (email) {
        localStorage.setItem('ka_saved_oauth_email', email);
      }
      var params = new URLSearchParams({ state: '${state}' });
      if (email) params.set('email', email);
      window.location.href = '/api/auth/${provider}/demo/finish?' + params.toString();
    }
  </script>
</body>
</html>`;
}
