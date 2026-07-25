import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { store } from "@/lib/store";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const me = await getCurrentAdmin();
    if (!me) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const avatarUrl = typeof body?.avatarUrl === "string" ? body.avatarUrl.trim() : undefined;
    const sellerLabel = typeof body?.sellerLabel === "string" ? body.sellerLabel.trim() : undefined;
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : undefined;

    const fullAdmin = await store.getAdminById(me.id);
    if (!fullAdmin) {
      return NextResponse.json({ success: false, message: "Usuario no encontrado" }, { status: 404 });
    }

    const updateData: any = { ...fullAdmin };

    if (avatarUrl !== undefined) {
      updateData.avatar_url = avatarUrl;
    }
    if (sellerLabel) {
      updateData.seller_label = sellerLabel;
    }
    if (newPassword && newPassword.length >= 5) {
      updateData.password_hash = await bcrypt.hash(newPassword, 10);
    }

    await store.updateAdmin(me.id, updateData);

    return NextResponse.json({
      success: true,
      message: "Perfil actualizado correctamente.",
      data: {
        avatarUrl: updateData.avatar_url,
        sellerLabel: updateData.seller_label,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
