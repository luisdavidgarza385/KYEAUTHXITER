import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Only logged in administrators can fetch the PayPal client-id
    await requireAdmin();

    const clientId = process.env.PAYPAL_CLIENT_ID || "";
    return NextResponse.json({ clientId });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: error.message || "Error del servidor" }, { status: 500 });
  }
}
