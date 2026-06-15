import { NextRequest } from "next/server";
import { requireAdmin, safeRoute } from "@/lib/api-helpers";
import { store } from "@/lib/store";
import { canAccessApp } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  return safeRoute(async () => {
    const me = await requireAdmin();
    const existing = await store.getLicenseById(params.id);
    if (!existing) return { status: 404, data: { success: false, message: "License not found" } };
    if (!(await canAccessApp(me, existing.app_id))) {
      return { status: 403, data: { success: false, message: "Forbidden" } };
    }
    const updated = await store.updateLicense(params.id, { hwid_lock: false });
    return { data: { success: true, data: updated } };
  });
}
