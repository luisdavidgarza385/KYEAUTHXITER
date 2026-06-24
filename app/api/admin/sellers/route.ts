import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

// GET - List all sellers
export async function GET(req: NextRequest) {
  try {
    const adminSession = req.cookies.get("admin_session")?.value;
    if (!adminSession) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
    }

    const admin = await store.getAdminById(adminSession);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Sesión inválida" }, { status: 401 });
    }

    const sellers = await store.listSellers();
    
    // Remove password_hash from response
    const sanitizedSellers = sellers.map(({ password_hash, ...seller }) => seller);

    return NextResponse.json({
      success: true,
      data: sanitizedSellers,
    });
  } catch (error: any) {
    console.error("Error listing sellers:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST - Create a new seller
export async function POST(req: NextRequest) {
  try {
    const adminSession = req.cookies.get("admin_session")?.value;
    if (!adminSession) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
    }

    const admin = await store.getAdminById(adminSession);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Sesión inválida" }, { status: 401 });
    }

    const body = await req.json();
    const { username, password, unlimited_credits, credits, can_use_api } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username y password son requeridos" },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existing = await store.getSellerByUsername(username);
    if (existing) {
      return NextResponse.json(
        { success: false, message: "El username ya existe" },
        { status: 400 }
      );
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Generate seller_key
    const seller_key = randomBytes(16).toString("hex");

    const seller = await store.createSeller({
      username,
      password_hash,
      seller_key,
      credits: unlimited_credits ? 999999999 : (credits || 0),
      unlimited_credits: unlimited_credits || false,
      can_use_api: can_use_api !== false,
      status: "active",
    });

    return NextResponse.json({
      success: true,
      data: {
        id: seller.id,
        username: seller.username,
        seller_key: seller.seller_key,
        credits: seller.credits,
        unlimited_credits: seller.unlimited_credits,
        can_use_api: seller.can_use_api,
        status: seller.status,
        created_at: seller.created_at,
      },
    });
  } catch (error: any) {
    console.error("Error creating seller:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
