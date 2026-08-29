"use client";
import { useState } from "react";
import Link from "next/link";
import { Copy, Check, Code, RefreshCw, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { CodeSnippet } from "./CodeSnippet";

export function CredentialsCard({ app }: { app: any }) {
  const [refreshing, setRefreshing] = useState(false);
  const [showSnippet, setShowSnippet] = useState(false);
  const router = useRouter();

  if (!app) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-text-dim" />
          <h2 className="font-semibold text-sm">Application Credentials</h2>
        </div>
        <p className="text-sm text-text-muted">Select an application to see its credentials.</p>
      </div>
    );
  }

  const apiUrl = (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000") + "/api/1.0";

  async function refreshSecret() {
    if (!confirm("Generate a new application secret? Your client apps will need to be updated.")) return;
    setRefreshing(true);
    const res = await fetch(`/api/admin/apps/${app.id}/secret`, { method: "POST" });
    setRefreshing(false);
    if (res.ok) {
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      alert(d.message || "Error");
    }
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-4 h-4 text-accent-glow" />
        <h2 className="font-semibold text-sm">Application Credentials</h2>
      </div>
      <p className="text-xs text-text-dim mb-3">Simply replace the placeholder code in the example with these.</p>

      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setShowSnippet((v) => !v)}
          className={"relative w-9 h-5 rounded-full transition " + (showSnippet ? "bg-accent" : "bg-bg-hover border border-border")}
        >
          <span className={"absolute top-0.5 w-4 h-4 rounded-full bg-white transition " + (showSnippet ? "left-4" : "left-0.5")} />
        </button>
        <span className="text-xs text-text-muted">Display Code Snippet</span>
      </div>

      {showSnippet && (
        <div className="mb-4">
          <CodeSnippet
            name={app.name}
            ownerid={app.app_id}
            version={app.version}
            url={apiUrl}
            secret={app.app_secret}
          />
        </div>
      )}

      <div className="space-y-3">
        <CredRow label="APPLICATION NAME" value={app.name} />
        <CredRow label="ACCOUNT OWNER ID" value={app.app_id} />
        <CredRow label="APPLICATION SECRET" value={app.app_secret} secret />
        <div className="grid grid-cols-2 gap-3">
          <CredRow label="APP VERSION" value={app.version} />
          <CredRow label="API URL" value={apiUrl} />
        </div>
        <button
          onClick={refreshSecret}
          disabled={refreshing}
          className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-warning/20 hover:bg-warning/30 text-warning border border-warning/30 px-4 py-2.5 text-sm font-medium transition"
        >
          <RefreshCw className={"w-4 h-4 " + (refreshing ? "animate-spin" : "")} />
          Refresh Application Secret
        </button>
      </div>

      <div className="mt-5 flex items-start gap-2 text-xs text-text-muted bg-accent/5 border border-accent/20 rounded p-3">
        <span className="text-accent-glow text-base leading-none">ⓘ</span>
        <span>
          <strong className="text-text">Notice!</strong> Application secrets are only displayed for users using our older API endpoints. If you&apos;re using our newer API, application secrets are not used!
        </span>
      </div>
    </div>
  );
}

function CredRow({ label, value, secret = false }: { label: string; value: string; secret?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(!secret);
  const display = secret && !visible ? "•".repeat(40) : value;
  return (
    <div>
      <div className="text-[10px] text-text-dim uppercase tracking-wider font-semibold mb-1">{label}</div>
      <div className="flex items-center gap-2 bg-bg rounded px-2 py-1.5 border border-border">
        <code className="text-xs text-text-muted font-mono truncate flex-1">{display}</code>
        {secret && (
          <button
            onClick={() => setVisible(!visible)}
            className="text-text-dim hover:text-text text-xs shrink-0"
            title={visible ? "Hide" : "Show"}
          >
            {visible ? "🙈" : "👁"}
          </button>
        )}
        <button
          onClick={() => {
            navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="text-text-dim hover:text-text shrink-0"
          title="Copy"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
