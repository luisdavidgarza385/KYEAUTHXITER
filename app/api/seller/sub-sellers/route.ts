import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

// GET - List sub-sellers
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

    // Get sub-sellers (sellers where parent_seller_id = this seller's id)
    const subSellers = await store.listSubSellers(seller.id);
    
    // Remove password_hash from response
    const sanitized = subSellers.map(({ password_hash, ...s }: any) => s);

    return NextResponse.json({
      success: true,
      data: sanitized,
    });
  } catch (error: any) {
    console.error("Error listing sub-sellers:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a sub-seller
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

    // Check if parent has enough credits
    const creditCost = unlimited_credits ? 0 : (credits || 0);
    if (!seller.unlimited_credits && creditCost > 0) {
      if (seller.credits < creditCost) {
        return NextResponse.json(
          { success: false, message: `Créditos insuficientes. Necesitas ${creditCost}, tienes ${seller.credits}` },
          { status: 403 }
        );
      }
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Generate seller_key
    const seller_key = randomBytes(16).toString("hex");

    const subSeller = await store.createSeller({
      username,
      password_hash,
      seller_key,
      credits: unlimited_credits ? 999999999 : (credits || 0),
      unlimited_credits: unlimited_credits || false,
      can_use_api: can_use_api !== false,
      status: "active",
      parent_seller_id: seller.id,
    });

    // Deduct credits from parent seller if needed
    if (!seller.unlimited_credits && creditCost > 0) {
      await store.updateSeller(seller.id, { credits: seller.credits - creditCost });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: subSeller.id,
        username: subSeller.username,
        seller_key: subSeller.seller_key,
        credits: subSeller.credits,
        unlimited_credits: subSeller.unlimited_credits,
        can_use_api: subSeller.can_use_api,
        status: subSeller.status,
        created_at: subSeller.created_at,
      },
    });
  } catch (error: any) {
    console.error("Error creating sub-seller:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
