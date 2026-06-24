import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { store } from "@/lib/store";
import { generateId } from "@/lib/utils";

export const dynamic = "force-dynamic";

// GET - Listar todos los sellers
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const sellers = await store.listSellers();

    return NextResponse.json({
      success: true,
      data: sellers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo seller
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { username, credits, status } = body;

    if (!username) {
      return NextResponse.json(
        { success: false, message: "Username es requerido" },
        { status: 400 }
      );
    }

    // Generar seller key único
    const sellerKey = generateId(32);

    const seller = await store.createSeller({
      username,
      seller_key: sellerKey,
      credits: typeof credits === "number" ? credits : -1,
      status: status || "active",
    });

    return NextResponse.json({
      success: true,
      message: "Seller creado exitosamente",
      data: seller,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
