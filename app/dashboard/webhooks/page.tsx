import { Webhook, Plus } from "lucide-react";

export default function WebhooksPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Webhook className="w-6 h-6 text-accent-glow" /> Webhooks</h1>
          <p className="text-sm text-text-muted mt-1">Receive real-time events on your endpoints.</p>
        </div>
        <button className="btn-primary text-sm flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> New Webhook</button>
      </div>
      <div className="card text-center py-16">
        <Webhook className="w-10 h-10 text-text-dim mx-auto mb-2" />
        <p className="text-text-muted">No webhooks configured.</p>
        <p className="text-xs text-text-dim mt-1">Add a URL to receive license events in real time.</p>
      </div>
    </div>
  );
}
