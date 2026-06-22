import { NextRequest } from "next/server";
import { json, requireAdmin, safeRoute } from "@/lib/api-helpers";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return safeRoute(async () => {
    const admin = await requireAdmin();
    // Only allow admin or developer roles to create notifications
    if (admin.role !== "admin" && admin.role !== "developer") {
      return { status: 403, data: { success: false, message: "Acción no permitida" } };
    }

    const body = await req.json().catch(() => ({}));
    const message = String(body?.message || "").trim();
    const level = String(body?.level || "info").trim();

    if (!message) {
      return { status: 400, data: { success: false, message: "Mensaje es requerido" } };
    }

    // Create a broadcast log
    await store.createLog({
      app_id: null,
      user_id: null,
      message: `[Broadcast] ${message}`,
      level: level as any,
    });

    return { data: { success: true, message: "Notificación enviada con éxito" } };
  });
}
