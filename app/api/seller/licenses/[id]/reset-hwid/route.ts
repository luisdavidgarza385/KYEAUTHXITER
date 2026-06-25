import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { store } from "@/lib/store";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const sellerCookie = cookieStore.get("seller_session");

    if (!sellerCookie) {
      return NextResponse.json(
        { success: false, message: "No autorizado" },
        { status: 401 }
      );
    }

    const seller = await store.getSellerById(sellerCookie.value);
    if (!seller || seller.status !== "active") {
      return NextResponse.json(
        { success: false, message: "Seller inválido o inactivo" },
        { status: 401 }
      );
    }

    const licenseId = params.id;

    // Obtener la licencia
    const license = await store.getLicenseById(licenseId);
    if (!license) {
      return NextResponse.json(
        { success: false, message: "Licencia no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que la licencia pertenece al seller
    if (license.created_by !== seller.id) {
      return NextResponse.json(
        { success: false, message: "No tienes permiso para modificar esta licencia" },
        { status: 403 }
      );
    }

    // Resetear HWID
    await store.resetLicenseHwid(licenseId);

    return NextResponse.json({
      success: true,
      message: "HWID reseteado correctamente",
    });
  } catch (error: any) {
    console.error("Error resetting HWID:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error del servidor" },
      { status: 500 }
    );
  }
}
