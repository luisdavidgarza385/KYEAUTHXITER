import { requireAdmin } from "@/lib/auth";

export default async function HexConverterLayout({ children }: { children: React.ReactNode }) {
  // Allow all logged-in users (free and paid) to access Hex Converter
  await requireAdmin();
  return <>{children}</>;
}
