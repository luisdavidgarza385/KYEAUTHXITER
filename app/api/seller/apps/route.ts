import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { randomBytes } from "crypto";

// GET - List seller's apps
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

    // Get apps owned by this seller (can be owner_id OR seller_id)
    const ownedApps = await store.listApps({ ownerId: seller.id });
    const sellerApps = await store.listApps({ sellerId: seller.id });
    
    // Merge and deduplicate
    const allApps = [...ownedApps, ...sellerApps];
    const uniqueApps = Array.from(new Map(allApps.map(app => [app.id, app])).values());

    return NextResponse.json({
      success: true,
      data: uniqueApps,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new app
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
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "El nombre es requerido" },
        { status: 400 }
      );
    }

    // Check if seller has enough credits (if limited)
    if (!seller.unlimited_credits && seller.credits <= 0) {
      return NextResponse.json(
        { success: false, message: "No tienes créditos suficientes" },
        { status: 403 }
      );
    }

    // Generate unique IDs
    const appId = `s-${Date.now().toString(36)}.${randomBytes(16).toString("hex")}`;
    const ownerSecret = randomBytes(32).toString("hex");
    const appSecret = randomBytes(32).toString("hex");

    // Create app
    const app = await store.createApp({
      owner_id: seller.id,
      name,
      app_id: appId,
      owner_secret: ownerSecret,
      app_secret: appSecret,
      version: "1.0",
      download_link: null,
      webhook_url: null,
      status: "active",
      seller_id: seller.id,
    });

    return NextResponse.json({
      success: true,
      data: app,
    });
  } catch (error: any) {
    console.error("Error creating app:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
