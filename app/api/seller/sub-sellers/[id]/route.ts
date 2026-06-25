import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

// PATCH - Update sub-seller
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const subSeller = await store.getSellerById(params.id);
    if (!subSeller || subSeller.parent_seller_id !== seller.id) {
      return NextResponse.json(
        { success: false, message: "Sub-seller no autorizado" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updated = await store.updateSeller(params.id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Sub-seller no encontrado" },
        { status: 404 }
      );
    }

    const { password_hash, ...sanitized } = updated;

    return NextResponse.json({
      success: true,
      data: sanitized,
    });
  } catch (error: any) {
    console.error("Error updating sub-seller:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete sub-seller
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const subSeller = await store.getSellerById(params.id);
    if (!subSeller || subSeller.parent_seller_id !== seller.id) {
      return NextResponse.json(
        { success: false, message: "Sub-seller no autorizado" },
        { status: 403 }
      );
    }

    await store.deleteSeller(params.id);

    return NextResponse.json({
      success: true,
      message: "Sub-seller eliminado",
    });
  } catch (error: any) {
    console.error("Error deleting sub-seller:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
