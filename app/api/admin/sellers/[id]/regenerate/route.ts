import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { store } from "@/lib/store";
import { generateId } from "@/lib/utils";

export const dynamic = "force-dynamic";

// POST - Regenerar seller key
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const sellerId = params.id;

    // Generar nuevo seller key
    const newSellerKey = generateId(32);

    const updated = await store.updateSeller(sellerId, {
      seller_key: newSellerKey,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Seller not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Seller key regenerated successfully",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
