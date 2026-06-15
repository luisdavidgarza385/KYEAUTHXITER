import { NextRequest } from "next/server";
import { requireAdmin, safeRoute } from "@/lib/api-helpers";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return safeRoute(async () => {
    const me = await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const planType = String(body?.planType || "monthly");
    
    const admin = await store.getAdminById(me.id);
    if (!admin) {
      return { status: 404, data: { success: false, message: "Usuario no encontrado" } };
    }

    // Set role to 'admin' (unlimited access) and give infinite credits/status
    const updated = await store.updateAdmin(admin.id, {
      ...admin,
      role: "admin",
      credits: 999999, // Infinite virtual credits
      status: "Activo",
      permissions: ["generar", "hwid", "ban", "delete"]
    });

    return {
      data: {
        success: true,
        message: "Suscripción actualizada con éxito",
        data: updated
      }
    };
  });
}
