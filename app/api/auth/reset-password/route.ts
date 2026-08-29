import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { resetTokenStore } from "@/lib/reset-token-store";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json().catch(() => ({}));

    if (!token || typeof token !== "string") {
      return NextResponse.json({ success: false, message: "Token requerido." }, { status: 400 });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ success: false, message: "La contraseña debe tener al menos 6 caracteres." }, { status: 400 });
    }

    const entry = resetTokenStore.get(token);
    if (!entry) {
      return NextResponse.json({ success: false, message: "Token inválido o ya utilizado." }, { status: 400 });
    }

    if (Date.now() > entry.expiresAt) {
      resetTokenStore.delete(token);
      return NextResponse.json({ success: false, message: "El enlace ha expirado. Solicita uno nuevo." }, { status: 400 });
    }

    const admin = await store.getAdminById(entry.adminId);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Cuenta no encontrada." }, { status: 404 });
    }

    // Hash new password and update
    const password_hash = await bcrypt.hash(password, 12);
    await store.updateAdmin(admin.id, { ...admin, password_hash });

    // Invalidate token
    resetTokenStore.delete(token);

    return NextResponse.json({ success: true, message: "¡Contraseña restablecida exitosamente! Ya puedes iniciar sesión." });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Error interno." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ valid: false, message: "Token requerido." }, { status: 400 });
  }

  const entry = resetTokenStore.get(token);
  if (!entry || Date.now() > entry.expiresAt) {
    return NextResponse.json({ valid: false, message: "Token inválido o expirado." }, { status: 400 });
  }

  return NextResponse.json({ valid: true });
}
