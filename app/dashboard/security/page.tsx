import { Lock, Shield } from "lucide-react";

export default function SecurityPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[800px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Lock className="w-6 h-6 text-accent-glow" /> Security</h1>
        <p className="text-sm text-text-muted mt-1">Manage your password and security settings.</p>
      </div>
      <div className="card">
        <h3 className="font-semibold flex items-center gap-2 mb-3"><Shield className="w-4 h-4 text-accent-glow" /> Password</h3>
        <p className="text-sm text-text-muted mb-4">Change your password to keep your account secure.</p>
        <a href="/forgot-password" className="btn-primary text-sm inline-flex">Reset password</a>
      </div>
      <div className="card">
        <h3 className="font-semibold flex items-center gap-2 mb-3"><Shield className="w-4 h-4 text-accent-glow" /> Two-Factor Authentication</h3>
        <p className="text-sm text-text-muted">Add an extra layer of security to your account (coming soon).</p>
      </div>
    </div>
  );
}
