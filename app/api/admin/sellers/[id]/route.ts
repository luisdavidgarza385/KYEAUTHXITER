import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSession = req.cookies.get("admin_session")?.value;
    if (!adminSession) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
    }

    const admin = await store.getAdminById(adminSession);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Sesión inválida" }, { status: 401 });
    }

    const body = await req.json();
    const updated = await store.updateSeller(params.id, body);

    if (!updated) {
      return NextResponse.json({ success: false, message: "Seller no encontrado" }, { status: 404 });
    }

    // Remove password_hash from response
    const { password_hash, ...sanitized } = updated;

    return NextResponse.json({
      success: true,
      data: sanitized,
    });
  } catch (error: any) {
    console.error("Error updating seller:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSession = req.cookies.get("admin_session")?.value;
    if (!adminSession) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
    }

    const admin = await store.getAdminById(adminSession);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Sesión inválida" }, { status: 401 });
    }

    await store.deleteSeller(params.id);

    return NextResponse.json({
      success: true,
      message: "Seller eliminado",
    });
  } catch (error: any) {
    console.error("Error deleting seller:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
