import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const me = await getCurrentAdmin();
  if (!me) {
    return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
  }

  const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "spectralx@gmail.com";
  const isSuperAdmin = me.email.toLowerCase() === bootstrapEmail.toLowerCase();

  const fullAdmin = await store.getAdminById(me.id);

  return NextResponse.json({
    success: true,
    data: {
      id: me.id,
      email: me.email,
      seller_label: fullAdmin?.seller_label || me.email.split("@")[0],
      avatar_url: fullAdmin?.avatar_url || null,
      role: me.role,
      isSuperAdmin,
    },
  });
}
