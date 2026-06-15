import { NextRequest, NextResponse } from "next/server";
import { getProviderConfig } from "@/lib/oauth";

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
  const colors: Record<string, string> = {
    discord: "#5865F2",
    google: "#4285F4",
    apple: "#000000",
  };
  const bg = colors[provider] || "#5865F2";
  const title = provider === "discord" ? "Discord" : provider === "google" ? "Google" : "Apple";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Authorize ${title} (demo)</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; background: #0a0a0a; color: #e5e5e5; margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .card { max-width: 420px; width: 100%; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
  .header { background: ${bg}; padding: 20px 24px; display: flex; align-items: center; gap: 12px; }
  .header h1 { margin: 0; font-size: 18px; color: #fff; font-weight: 600; }
  .body { padding: 24px; }
  .body p { margin: 0 0 12px 0; color: #b0b0b0; font-size: 14px; line-height: 1.5; }
  .body strong { color: #fff; }
  .demo-badge { display: inline-block; background: #fbbf24; color: #000; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; margin-left: 8px; vertical-align: middle; }
  .actions { display: flex; gap: 8px; margin-top: 20px; }
  button { flex: 1; padding: 11px 16px; border-radius: 6px; border: 0; font-size: 14px; font-weight: 600; cursor: pointer; }
  .primary { background: ${bg}; color: #fff; }
  .primary:hover { filter: brightness(1.1); }
  .secondary { background: #2a2a2a; color: #e5e5e5; }
  .secondary:hover { background: #333; }
  .email-input { width: 100%; box-sizing: border-box; padding: 10px 12px; background: #0a0a0a; border: 1px solid #2a2a2a; border-radius: 6px; color: #e5e5e5; font-size: 14px; margin-bottom: 4px; }
  .email-input:focus { outline: none; border-color: ${bg}; }
  .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #808080; font-weight: 600; margin-bottom: 6px; display: block; }
</style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>${title} OAuth <span class="demo-badge">DEMO MODE</span></h1>
    </div>
    <div class="body">
      <p><strong>Guate Xiter</strong> wants to access your <strong>${title}</strong> account.</p>
      <p>This will let Guate Xiter see your basic profile (name, email, avatar).</p>
      <p style="font-size:12px;color:#808080;margin-top:16px">
        Real OAuth credentials are not configured. This is a demo screen to test the flow.
        Add ${provider.toUpperCase()}_CLIENT_ID and ${provider.toUpperCase()}_CLIENT_SECRET to <code>.env.local</code> to enable real ${title} login.
      </p>
      <div style="margin-top:20px">
        <label class="label">Email (optional, for demo)</label>
        <input class="email-input" id="email" placeholder="leave blank for random demo email" />
      </div>
      <div class="actions">
        <button class="secondary" onclick="window.location.href='/login?err=access_denied'">Cancel</button>
        <button class="primary" onclick="authorize()">Authorize</button>
      </div>
    </div>
  </div>
  <script>
    function authorize() {
      var email = document.getElementById('email').value.trim();
      var params = new URLSearchParams({ state: '${state}' });
      if (email) params.set('email', email);
      window.location.href = '/api/auth/${provider}/demo/finish?' + params.toString();
    }
  </script>
</body>
</html>`;
}
