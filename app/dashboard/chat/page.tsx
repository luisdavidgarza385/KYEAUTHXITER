import { requireAdmin } from "@/lib/auth";
import { ChatClient } from "@/components/ChatClient";

export default async function ChatPage() {
  const me = await requireAdmin();
  const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "spectralx@gmail.com";
  const isSuperAdmin = me.email === bootstrapEmail;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
          Chat Global
        </h1>
        <p className="text-sm text-zinc-400">
          Canal de comunicados globales. Los administradores pueden enviar notificaciones generales en tiempo real.
        </p>
      </div>

      <ChatClient role={me.role} email={me.email} isSuperAdmin={isSuperAdmin} />
    </div>
  );
}
