import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

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

    // Remove password_hash from response
    const { password_hash, ...sanitized } = seller;

    return NextResponse.json({
      success: true,
      data: sanitized,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
