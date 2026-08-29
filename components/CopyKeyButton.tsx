"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyKeyButton({ value, title = "Copy" }: { value: string; title?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="p-1 rounded text-text-dim hover:text-text"
      title={title}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}
