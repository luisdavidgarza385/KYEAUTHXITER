import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // Buscar el admin/revendedor
    const admin = await store.getAdminByEmail(email);
    
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, admin.password_hash);
    
    if (!validPassword) {
      return NextResponse.json(
        { success: false, message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Verificar que sea revendedor o admin
    if (admin.role !== "reseller" && admin.role !== "admin" && admin.role !== "developer") {
      return NextResponse.json(
        { success: false, message: "No tienes permisos de revendedor" },
        { status: 403 }
      );
    }

    // Crear sesión (cookie)
    const response = NextResponse.json({
      success: true,
      message: "Login exitoso",
      data: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        role: admin.role,
        credits: admin.credits,
      },
    });

    // Establecer cookie de sesión
    response.cookies.set("admin_session", admin.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Error en login de revendedor:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error al iniciar sesión" },
      { status: 500 }
    );
  }
}
