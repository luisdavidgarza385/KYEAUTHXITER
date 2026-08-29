import { NextRequest } from "next/server";
import { requireAdmin, safeRoute } from "@/lib/api-helpers";
import { store } from "@/lib/store";
import { generateId } from "@/lib/utils";
import { canAccessApp } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  return safeRoute(async () => {
    const me = await requireAdmin();
    const app = await store.getAppById(params.id);
    if (!app) return { status: 404, data: { success: false, message: "App not found" } };
    if (!(await canAccessApp(me, params.id))) {
      return { status: 403, data: { success: false, message: "Forbidden" } };
    }
    const updated = await store.updateApp(params.id, { ...app, app_secret: generateId(48) });
    return { data: { success: true, data: updated } };
  });
}
