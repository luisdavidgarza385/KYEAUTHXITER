import Link from "next/link";
import { Code2, Key, Users, Database, FileJson } from "lucide-react";

export default function DocsPage() {
  return (
    <main className="min-h-screen max-w-4xl mx-auto px-6 py-12">
      <Link href="/" className="text-sm text-text-muted hover:text-text mb-6 inline-block">← Back</Link>
      <h1 className="text-3xl font-bold mb-2">Documentation</h1>
      <p className="text-text-muted mb-10">How to integrate your software with this authentication platform.</p>

      <section className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Key className="w-4 h-4 text-accent-glow" /> 1. Get your credentials</h2>
          <p className="text-sm text-text-muted mb-3">Create an application in the admin panel and copy:</p>
          <ul className="text-sm text-text-muted list-disc pl-5 space-y-1">
            <li><code className="text-accent-glow">app_id</code> — public application id</li>
            <li><code className="text-accent-glow">app_secret</code> — secret (keep private, send as <code>x-secret</code> header or <code>secret</code> query)</li>
          </ul>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Code2 className="w-4 h-4 text-accent-glow" /> 2. API endpoints</h2>
          <p className="text-sm text-text-muted mb-3">All endpoints accept <code className="text-accent-glow">application/json</code> or <code className="text-accent-glow">x-www-form-urlencoded</code>.</p>
          <div className="space-y-3 text-sm font-mono">
            <div className="flex gap-3"><span className="text-success">POST</span><span>/api/1.0/init</span></div>
            <div className="flex gap-3"><span className="text-success">POST</span><span>/api/1.0/login</span></div>
            <div className="flex gap-3"><span className="text-success">POST</span><span>/api/1.0/register</span></div>
            <div className="flex gap-3"><span className="text-success">POST</span><span>/api/1.0/license</span></div>
            <div className="flex gap-3"><span className="text-success">POST</span><span>/api/1.0/var</span></div>
            <div className="flex gap-3"><span className="text-success">POST</span><span>/api/1.0/log</span></div>
            <div className="flex gap-3"><span className="text-success">POST</span><span>/api/1.0/logout</span></div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><FileJson className="w-4 h-4 text-accent-glow" /> 3. Example flow</h2>
          <pre className="bg-bg-secondary rounded p-4 text-xs font-mono overflow-x-auto text-text-muted">
{`# 1) Init
curl -X POST https://your-domain/api/1.0/init \\
  -H "Content-Type: application/json" \\
  -d '{"appid":"YOUR_APP_ID","secret":"YOUR_APP_SECRET","hwid":"abc123"}'
# => { "success": true, "data": { "sessionid": "..." } }

# 2) Register
curl -X POST https://your-domain/api/1.0/register \\
  -H "Content-Type: application/json" \\
  -d '{"appid":"YOUR_APP_ID","secret":"YOUR_APP_SECRET","sessionid":"...","username":"user1","password":"pass","key":"XXXXX-XXXXX-XXXXX-XXXXX","hwid":"abc123"}'

# 3) Login
curl -X POST https://your-domain/api/1.0/login \\
  -H "Content-Type: application/json" \\
  -d '{"appid":"YOUR_APP_ID","secret":"YOUR_APP_SECRET","sessionid":"...","username":"user1","password":"pass","hwid":"abc123"}'

# 4) Validate license
curl -X POST https://your-domain/api/1.0/license \\
  -H "Content-Type: application/json" \\
  -d '{"appid":"YOUR_APP_ID","secret":"YOUR_APP_SECRET","sessionid":"...","key":"XXXXX-XXXXX-XXXXX-XXXXX","hwid":"abc123"}'`}
          </pre>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Database className="w-4 h-4 text-accent-glow" /> 4. Local setup</h2>
          <ol className="text-sm text-text-muted list-decimal pl-5 space-y-1">
            <li>Create a free Supabase project at <code className="text-accent-glow">supabase.com</code></li>
            <li>Run <code className="text-accent-glow">supabase/schema.sql</code> in the SQL editor</li>
            <li>Copy <code className="text-accent-glow">.env.local.example</code> to <code className="text-accent-glow">.env.local</code> and fill in the values</li>
            <li><code className="text-accent-glow">npm install</code> then <code className="text-accent-glow">npm run dev</code></li>
            <li>Login at <code className="text-accent-glow">/dashboard/login</code> with the bootstrap credentials you set</li>
          </ol>
        </div>
      </section>
    </main>
  );
}
