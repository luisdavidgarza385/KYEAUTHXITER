import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(req: NextRequest) {
  try {
    const adminSession = req.cookies.get("admin_session")?.value;

    if (!adminSession) {
      return NextResponse.json(
        { success: false, message: "No autorizado" },
        { status: 401 }
      );
    }

    const admin = await store.getAdminById(adminSession);

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Sesión inválida" },
        { status: 401 }
      );
    }

    // Obtener estadísticas del revendedor
    const apps = await store.getAppsByAdminId(admin.id);
    const appIds = apps.map((app: any) => app.id);

    let totalLicenses = 0;
    let totalUsers = 0;

    for (const appId of appIds) {
      const licenses = await store.getLicensesByAppId(appId);
      const users = await store.getUsersByAppId(appId);
      totalLicenses += licenses.length;
      totalUsers += users.length;
    }

    return NextResponse.json({
      success: true,
      data: {
        totalApps: apps.length,
        totalLicenses,
        totalUsers,
        credits: admin.credits || 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
