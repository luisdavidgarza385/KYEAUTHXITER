import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // Buscar subscriber por username
    const subscriber = await store.getSubscriberByUsername(username);
    
    if (!subscriber) {
      return NextResponse.json(
        { success: false, message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, subscriber.password_hash);
    
    if (!validPassword) {
      return NextResponse.json(
        { success: false, message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Verificar que esté activo
    if (subscriber.status !== "active") {
      return NextResponse.json(
        { success: false, message: "Cuenta suspendida. Contacta al administrador." },
        { status: 403 }
      );
    }

    // Crear sesión (cookie)
    const response = NextResponse.json({
      success: true,
      message: "Login exitoso",
      data: {
        id: subscriber.id,
        username: subscriber.username,
        subscription_type: subscriber.subscription_type,
        credits: subscriber.credits,
      },
    });

    // Establecer cookie de sesión
    response.cookies.set("subscriber_session", subscriber.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 días
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Error en login de subscriber:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error al iniciar sesión" },
      { status: 500 }
    );
  }
}
