import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username y password requeridos" },
        { status: 400 }
      );
    }

    // Get seller by username
    const seller = await store.getSellerByUsername(username);

    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Check if seller is active
    if (seller.status !== "active") {
      return NextResponse.json(
        { success: false, message: "Cuenta desactivada" },
        { status: 403 }
      );
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, seller.password_hash);

    if (!validPassword) {
      return NextResponse.json(
        { success: false, message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      data: {
        id: seller.id,
        username: seller.username,
        credits: seller.credits,
        unlimited_credits: seller.unlimited_credits,
        can_use_api: seller.can_use_api,
      },
    });

    // Set session cookie
    response.cookies.set("seller_session", seller.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Error in seller login:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error en login" },
      { status: 500 }
    );
  }
}
