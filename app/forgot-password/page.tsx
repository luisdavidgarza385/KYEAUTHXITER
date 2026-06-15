"use client";
import { useState } from "react";
import Link from "next/link";
import { Loader2, KeyRound, ArrowLeft, Check } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!email) { setErr("Email is required"); return; }
    if (!newPassword || newPassword.length < 6) { setErr("New password must be at least 6 characters"); return; }
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.message || "Error"); return; }
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-accent/30">
            <img src="/logo.png" alt="Guate Xiter" className="w-full h-full object-cover" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Guate Xiter</span>
        </div>

        <div className="card !p-6">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text mb-3">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to login
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <KeyRound className="w-5 h-5 text-accent-glow" />
            <h1 className="text-xl font-semibold">Reset your password</h1>
          </div>
          <p className="text-sm text-text-muted mb-5">
            Enter your account email and a new password. This works for self-hosted Guate Xiter instances where the admin doesn&apos;t have email delivery set up.
          </p>

          {done ? (
            <div className="space-y-3">
              <div className="rounded-md bg-success/10 border border-success/30 px-3 py-3 text-sm text-success flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold">Password updated</div>
                  <div className="text-xs mt-0.5">You can now log in with your new password.</div>
                </div>
              </div>
              <Link href="/login" className="btn-primary text-sm w-full text-center">Go to login</Link>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="label">New password</label>
                <input
                  className="input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />
              </div>
              {err && (
                <div className="rounded-md bg-danger/10 border border-danger/30 px-3 py-2 text-sm text-danger">
                  {err}
                </div>
              )}
              <button onClick={submit} disabled={loading} className="btn-primary text-sm w-full">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reset password"}
              </button>
              <p className="text-[11px] text-text-dim text-center">
                In a production deployment with SMTP, this would send a reset link to your email.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
