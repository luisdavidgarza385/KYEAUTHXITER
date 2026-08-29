"use client";
import { useState } from "react";
import Link from "next/link";
import { Copy, Check, Code, PlayCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import type { App } from "@/lib/store/types";
import { CodeSnippet } from "./CodeSnippet";

export function CredentialsSection({ app, apiUrl }: { app: App; apiUrl: string }) {
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

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
      <CodeSnippet
        name={app.name}
        ownerid={app.app_id}
        version={app.version}
        url={apiUrl}
        secret={app.app_secret}
      />

      <div className="mt-6 pt-5 border-t border-border space-y-3">
        <CredRow label="Application ID" value={app.app_id} />
        <CredRow label="Account Owner ID" value={app.app_id} />
        <CredRow label="Application Secret" value={app.app_secret} secret />
        <div className="grid grid-cols-2 gap-3">
          <CredRow label="Application Version" value={app.version} />
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
      <div className="label">{label}</div>
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
