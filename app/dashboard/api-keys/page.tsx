import { Key, Copy, Plus, Eye, EyeOff } from "lucide-react";

export default function ApiKeysPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Key className="w-6 h-6 text-accent-glow" /> API Keys</h1>
          <p className="text-sm text-text-muted mt-1">Manage your API keys for programmatic access.</p>
        </div>
        <button className="btn-primary text-sm flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> New API Key</button>
      </div>
      <div className="card text-center py-16">
        <Key className="w-10 h-10 text-text-dim mx-auto mb-2" />
        <p className="text-text-muted">No API keys yet.</p>
        <p className="text-xs text-text-dim mt-1">Generate a key to authenticate your scripts.</p>
      </div>
    </div>
  );
}
