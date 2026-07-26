import { requireAdmin } from "@/lib/auth";
import { store } from "@/lib/store";
import { redirect } from "next/navigation";

export default async function SubscriptionsLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin();
  const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "spectralx@gmail.com";
  const isSuperAdmin = me.email.toLowerCase() === bootstrapEmail.toLowerCase();

  const fullAdmin = await store.getAdminById(me.id);
  const hasSubscription = Boolean(fullAdmin?.subscription_end);

  // Subscriptions management requires a paid VIP/Unlimited subscription or Admin access
  if (!isSuperAdmin && !hasSubscription) {
    redirect("/dashboard/upgrade");
  }

  return <>{children}</>;
}
