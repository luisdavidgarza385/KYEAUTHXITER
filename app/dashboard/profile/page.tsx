import { User as UserIcon, Mail, Calendar, Shield } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireAdmin();
  const admin = await store.getAdminById(session.id);
  const createdAt = (admin as any)?.created_at || new Date().toISOString();
  return (
    <div className="p-6 lg:p-8 max-w-[800px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><UserIcon className="w-6 h-6 text-accent-glow" /> Profile</h1>
        <p className="text-sm text-text-muted mt-1">Your account information.</p>
      </div>
      <div className="card space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-blue-600 text-white text-2xl font-bold flex items-center justify-center">
            {session.email.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-lg font-semibold">{session.email}</div>
            <div className="text-xs text-text-dim flex items-center gap-1.5 mt-1">
              <Shield className="w-3 h-3" /> Role: <span className="text-accent-glow uppercase">{session.role}</span>
            </div>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 pt-4 border-t border-border">
          <div className="flex items-start gap-2 p-3 rounded-md bg-bg-secondary">
            <Mail className="w-4 h-4 text-text-dim mt-0.5" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-text-dim">Email</div>
              <div className="text-sm font-mono">{session.email}</div>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-md bg-bg-secondary">
            <Calendar className="w-4 h-4 text-text-dim mt-0.5" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-text-dim">Member since</div>
              <div className="text-sm font-mono">{new Date(createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
