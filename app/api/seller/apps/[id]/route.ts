import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

// PATCH - Update app
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

    const appId = params.id;

    // Verify the app belongs to this seller
    const app = await store.getAppById(appId);
    if (!app || app.seller_id !== seller.id) {
      return NextResponse.json(
        { success: false, message: "App no autorizada" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, version, status, download_link, webhook_url } = body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (version !== undefined) updates.version = version;
    if (status !== undefined) updates.status = status;
    if (download_link !== undefined) updates.download_link = download_link || null;
    if (webhook_url !== undefined) updates.webhook_url = webhook_url || null;

    const updatedApp = await store.updateApp(appId, updates);

    return NextResponse.json({
      success: true,
      data: updatedApp,
    });
  } catch (error: any) {
    console.error("Error updating app:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete app
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

    const appId = params.id;

    // Verify the app belongs to this seller
    const app = await store.getAppById(appId);
    if (!app || app.seller_id !== seller.id) {
      return NextResponse.json(
        { success: false, message: "App no autorizada" },
        { status: 403 }
      );
    }

    await store.deleteApp(appId);

    return NextResponse.json({
      success: true,
      message: "Aplicación eliminada",
    });
  } catch (error: any) {
    console.error("Error deleting app:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
