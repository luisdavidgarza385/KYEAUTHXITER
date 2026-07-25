import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const me = await getCurrentAdmin();
  if (!me) {
    return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
  }

  const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "spectralx@gmail.com";
  const isSuperAdmin = me.email.toLowerCase() === bootstrapEmail.toLowerCase();

  return NextResponse.json({
    success: true,
    data: {
      id: me.id,
      email: me.email,
      role: me.role,
      isSuperAdmin,
    },
  });
}
