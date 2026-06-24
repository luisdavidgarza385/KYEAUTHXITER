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

    // Get seller's apps
    const apps = await store.listApps({ ownerId: seller.id });
    const appIds = apps.map((app) => app.id);

    let totalLicenses = 0;
    let totalUsers = 0;

    for (const appId of appIds) {
      const licenses = await store.listLicenses({ appId });
      const users = await store.listAppUsers({ appId });
      totalLicenses += licenses.length;
      totalUsers += users.length;
    }

    return NextResponse.json({
      success: true,
      data: {
        totalApps: apps.length,
        totalLicenses,
        totalUsers,
        credits: seller.unlimited_credits ? "∞" : seller.credits,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
