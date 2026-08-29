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

    return NextResponse.json({
      success: true,
      data: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        role: admin.role,
        credits: admin.credits,
        max_apps: admin.max_apps,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
