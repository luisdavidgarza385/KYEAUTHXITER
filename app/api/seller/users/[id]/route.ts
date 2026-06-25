import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

// PATCH - Update user (ban/unban)
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

    const userId = params.id;
    const user = await store.getAppUserById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verify the user's app belongs to this seller
    const app = await store.getAppById(user.app_id);
    if (!app || app.seller_id !== seller.id) {
      return NextResponse.json(
        { success: false, message: "App no autorizada" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updated = await store.updateAppUser(userId, body);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
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

    const userId = params.id;
    const user = await store.getAppUserById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verify the user's app belongs to this seller
    const app = await store.getAppById(user.app_id);
    if (!app || app.seller_id !== seller.id) {
      return NextResponse.json(
        { success: false, message: "App no autorizada" },
        { status: 403 }
      );
    }

    await store.deleteAppUser(userId);

    return NextResponse.json({
      success: true,
      message: "Usuario eliminado",
    });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
