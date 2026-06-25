import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

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
