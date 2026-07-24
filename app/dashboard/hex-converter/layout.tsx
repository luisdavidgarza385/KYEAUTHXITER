import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HexConverterLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin();
  // Only admin/developer can access hex converter, not sub-resellers
  if (me.role === "seller") {
    redirect("/dashboard");
  }
  return <>{children}</>;
}
