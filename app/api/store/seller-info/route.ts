import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const sellerKey = url.searchParams.get("seller_key");

    if (!sellerKey) {
      return NextResponse.json(
        { success: false, message: "seller_key es requerido" },
        { status: 400 }
      );
    }

    const seller = await store.getSellerByKey(sellerKey);

    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller no encontrado" },
        { status: 404 }
      );
    }

    if (seller.status !== "active") {
      return NextResponse.json(
        { success: false, message: "Seller inactivo" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        username: seller.username,
        status: seller.status,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
