import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, username } = body;

    // Validaciones
    if (!email || !password || !username) {
      return NextResponse.json(
        { success: false, message: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const existingAdmin = await store.getAdminByEmail(email);
    if (existingAdmin) {
      return NextResponse.json(
        { success: false, message: "Este email ya está registrado" },
        { status: 400 }
      );
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el revendedor con permisos completos
    const reseller = await store.createAdmin({
      email,
      password: hashedPassword,
      username,
      role: "reseller", // Rol de revendedor
      credits: 1000, // Créditos iniciales
      max_apps: 10, // Máximo 10 aplicaciones
      can_create_apps: true,
      can_generate_licenses: true,
      can_delete_licenses: true,
      can_reset_hwid: true,
      can_ban_users: true,
      can_modify_profile: true,
    });

    return NextResponse.json({
      success: true,
      message: "Cuenta de revendedor creada exitosamente",
      data: {
        id: reseller.id,
        email: reseller.email,
        username: reseller.username,
        credits: reseller.credits,
      },
    });
  } catch (error: any) {
    console.error("Error en registro de revendedor:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error al crear cuenta" },
      { status: 500 }
    );
  }
}
