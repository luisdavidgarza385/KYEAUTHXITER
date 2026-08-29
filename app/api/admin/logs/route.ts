import { NextRequest } from "next/server";
import { json, requireAdmin, safeRoute } from "@/lib/api-helpers";
import { store } from "@/lib/store";
import { getScopedAppIds } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return safeRoute(async () => {
    const admin = await requireAdmin();
    const limit = Math.min(100, Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") || "10") || 10));
    
    // Fetch logs
    const logs = await store.listLogs({ limit: 100 });
    
    // Scoped permissions filter for resellers
    const scopedAppIds = await getScopedAppIds(admin);
    const filteredLogs = scopedAppIds === null
      ? logs
      : logs.filter((log) => log.app_id === null || (log.app_id && scopedAppIds.includes(log.app_id)));
      
    return { data: { success: true, data: filteredLogs.slice(0, limit) } };
  });
}
