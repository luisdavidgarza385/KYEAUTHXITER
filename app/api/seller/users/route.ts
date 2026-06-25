import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import bcrypt from "bcryptjs";

// GET - List users for seller's apps
export async function GET(req: NextRequest) {
  try {
    const sellerSession = req.cookies.get("seller_session")?.value;
    if (!sellerSession) {
      return NextResponse.json(
        { success: false, message: "No autorizado" },
        { status: 401 }
      );
    }

    const seller = await store.getSellerById(sellerSession);
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Sesión inválida" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const appId = url.searchParams.get("app_id");

    if (!appId) {
      return NextResponse.json(
        { success: false, message: "app_id es requerido" },
        { status: 400 }
      );
    }

    // Verify the app belongs to this seller
    const app = await store.getAppById(appId);
    if (!app || app.seller_id !== seller.id) {
      return NextResponse.json(
        { success: false, message: "App no autorizada" },
        { status: 403 }
      );
    }

    const users = await store.listAppUsers({ appId, limit: 500 });

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    console.error("Error listing users:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new user
export async function POST(req: NextRequest) {
  try {
    const sellerSession = req.cookies.get("seller_session")?.value;
    if (!sellerSession) {
      return NextResponse.json(
        { success: false, message: "No autorizado" },
        { status: 401 }
      );
    }

    const seller = await store.getSellerById(sellerSession);
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Sesión inválida" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { app_id, username, email, password } = body;

    if (!app_id || !username || !password) {
      return NextResponse.json(
        { success: false, message: "app_id, username y password son requeridos" },
        { status: 400 }
      );
    }

    // Verify the app belongs to this seller
    const app = await store.getAppById(app_id);
    if (!app || app.seller_id !== seller.id) {
      return NextResponse.json(
        { success: false, message: "App no autorizada" },
        { status: 403 }
      );
    }

    // Check if username already exists for this app
    const existingUsers = await store.listAppUsers({ appId: app_id, limit: 10000 });
    const userExists = existingUsers.some((u) => u.username.toLowerCase() === username.toLowerCase());
    
    if (userExists) {
      return NextResponse.json(
        { success: false, message: "El usuario ya existe en esta aplicación" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await store.createAppUser({
      app_id,
      username,
      email: email || null,
      password_hash: passwordHash,
      hwid: null,
      ip: null,
      last_login: null,
      banned: false,
      ban_reason: null,
    });

    return NextResponse.json({
      success: true,
      data: newUser,
      message: "Usuario creado exitosamente",
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
