import { NextRequest } from "next/server";
import { json, requireAdmin, safeRoute } from "@/lib/api-helpers";
import { store } from "@/lib/store";
import { generateId } from "@/lib/utils";
import { getScopedAppIds } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return safeRoute(async () => {
    const admin = await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const name = String(body?.name || "").trim();
    const version = String(body?.version || "1.0").trim() || "1.0";
    const level = Math.max(1, parseInt(body?.level) || 1);
    if (!name) return { status: 400, data: { success: false, message: "name required" } };

    const existing = await store.getAppByName(name);
    if (existing) return { status: 409, data: { success: false, message: "Application name already exists" } };

    const app = await store.createApp({
      owner_id: admin.id,
      name,
      app_id: generateId(32),
      owner_secret: generateId(48),
      app_secret: generateId(48),
      version,
      download_link: null,
      webhook_url: null,
      status: "active",
      seller_id: null,
      level,
    });
    return { data: { success: true, data: app } };
  });
}

export async function GET(req: NextRequest) {
  return safeRoute(async () => {
    const admin = await requireAdmin();
    const allApps = await store.listApps();
    const scopedIds = await getScopedAppIds(admin);
    const filtered = scopedIds === null ? allApps : allApps.filter((a) => scopedIds.includes(a.id));
    return { data: { success: true, data: filtered } };
  });
}
