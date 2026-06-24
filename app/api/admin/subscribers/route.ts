import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { store } from "@/lib/store";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

// GET - Listar todos los subscribers
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const subscribers = await store.listSubscribers();

    return NextResponse.json({
      success: true,
      data: subscribers.map(sub => ({
        ...sub,
        password_hash: undefined, // No enviar el hash
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo subscriber
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { username, password, subscription_type, credits, status } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username y password son requeridos" },
        { status: 400 }
      );
    }

    // Verificar si el username ya existe
    const existing = await store.getSubscriberByUsername(username);
    if (existing) {
      return NextResponse.json(
        { success: false, message: "El username ya existe" },
        { status: 400 }
      );
    }

    // Hashear contraseña
    const password_hash = await bcrypt.hash(password, 10);

    const subscriber = await store.createSubscriber({
      username,
      password_hash,
      subscription_type: subscription_type || "VIP",
      credits: typeof credits === "number" ? credits : -1,
      status: status || "active",
    });

    return NextResponse.json({
      success: true,
      message: "Subscriber creado exitosamente",
      data: {
        ...subscriber,
        password_hash: undefined,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
