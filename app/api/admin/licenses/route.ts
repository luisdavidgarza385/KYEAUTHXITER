import { NextRequest } from "next/server";
import { requireAdmin, safeRoute } from "@/lib/api-helpers";
import { store } from "@/lib/store";
import { generateKey } from "@/lib/utils";
import { getScopedAppIds, checkQuota } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return safeRoute(async () => {
    const me = await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const appId = String(body?.appId || "");
    const count = Math.min(Math.max(parseInt(String(body?.count || 1)) || 1, 1), 500);
    const durationDays = body?.durationDays === 0 || body?.durationDays === "lifetime"
      ? 36500
      : Math.max(parseInt(String(body?.durationDays ?? 30)) || 30, 1);
    const level = Math.max(parseInt(String(body?.level || 1)) || 1, 1);
    const maxUses = Math.max(parseInt(String(body?.maxUses || 1)) || 1, 1);
    const hwidLock = !!body?.hwidLock;
    const ipLock = !!body?.ipLock;
    const prefix = String(body?.prefix || "Spectral X").trim() || "Spectral X";
    const suffix = String(body?.suffix || "****-****-****-****").trim() || "****-****-****-****";
    
    let packageName = String(body?.packageName || "").trim();
    if (!packageName || packageName === "Bypass") {
      if (level === 2) packageName = "VIP";
      else if (level === 3) packageName = "Combo";
      else packageName = "basic";
    }

    const note = String(body?.note || "").trim();

    if (!appId) return { status: 400, data: { success: false, message: "appId required" } };

    const app = await store.getAppById(appId);
    if (!app) return { status: 404, data: { success: false, message: "App not found" } };

    const scopedIds = await getScopedAppIds(me);
    if (scopedIds !== null && !scopedIds.includes(appId)) {
      return { status: 403, data: { success: false, message: "Forbidden" } };
    }

    const admin = await store.getAdminById(me.id);
    if (!admin) return { status: 404, data: { success: false, message: "User not found" } };

    // Ilimitado si: es el super admin (bootstrap email) o un seller con plan ilimitado
    const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "spectralx@gmail.com";
    const isUnlimited =
      admin.email === bootstrapEmail ||
      (admin.role === "seller" && (admin.credits === 0 || admin.credits === null || admin.credits === undefined));

    const cost = count * 20;

    if (!isUnlimited) {
      const userCredits = admin.credits || 0;
      if (userCredits < cost) {
        return { status: 400, data: { success: false, message: `Créditos insuficientes. Generar ${count} licencias cuesta ${cost} créditos (tienes ${userCredits}).` } };
      }
      admin.credits = userCredits - cost;
      await store.updateAdmin(admin.id, admin);
    }

    const quota = await checkQuota(me, appId);
    if (!quota.ok) {
      return { status: 403, data: { success: false, message: quota.reason } };
    }
    if (quota.limit < Infinity && quota.licenses + count > quota.limit) {
      return { status: 403, data: { success: false, message: `License limit is ${quota.limit}. You have ${quota.licenses} and tried to add ${count}.` } };
    }

    const generatedKeys = new Set<string>();
    let retries = 0;
    const maxRetries = 1000;

    while (generatedKeys.size < count && retries < maxRetries) {
      retries++;
      const segs = suffix.split("-").map((seg) =>
        seg.replace(/\*/g, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(Math.floor(Math.random() * 36)))
      );
      const key = prefix ? `${prefix}-${segs.join("-")}` : segs.join("-");
      if (!generatedKeys.has(key)) {
        generatedKeys.add(key);
      }
    }

    const keysArray = Array.from(generatedKeys);
    
    // Check database to find if any of these keys exist
    const existingKeys = new Set<string>();
    if (process.env.STORAGE_BACKEND !== "local") {
      try {
        const supabase = supabaseAdmin();
        const { data } = await supabase
          .from("licenses")
          .select("key")
          .eq("app_id", appId)
          .in("key", keysArray);
        if (data) {
          data.forEach((l: any) => existingKeys.add(l.key));
        }
      } catch (err) {
        console.error("Error checking license key existence in database:", err);
      }
    } else {
      // In local mode, check local store
      for (const k of keysArray) {
        const check = await store.getLicenseByKey(appId, k);
        if (check) existingKeys.add(k);
      }
    }

    // Replace keys that already exist in the database with brand-new random keys
    const finalKeys: string[] = [];
    for (const key of keysArray) {
      if (!existingKeys.has(key)) {
        finalKeys.push(key);
      } else {
        let replacedKey = key;
        let replaceRetries = 0;
        while (replaceRetries < 100) {
          const randSuffix = Array.from({ length: 6 }).map(() =>
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(Math.floor(Math.random() * 36))
          ).join("");
          const candidate = `${key}-${randSuffix}`;
          
          let check = false;
          if (process.env.STORAGE_BACKEND !== "local") {
            const { data } = await supabaseAdmin()
              .from("licenses")
              .select("key")
              .eq("app_id", appId)
              .eq("key", candidate)
              .maybeSingle();
            if (data) check = true;
          } else {
            const checkObj = await store.getLicenseByKey(appId, candidate);
            if (checkObj) check = true;
          }
          
          if (!check && !generatedKeys.has(candidate) && !finalKeys.includes(candidate)) {
            replacedKey = candidate;
            break;
          }
          replaceRetries++;
        }
        finalKeys.push(replacedKey);
      }
    }

    const items = finalKeys.map((key) => {
      return {
        app_id: appId,
        key,
        duration_days: durationDays,
        level,
        uses: 0,
        max_uses: maxUses,
        hwid_lock: hwidLock,
        ip_lock: ipLock,
        status: "unused" as const,
        used_by: null,
        activated_at: null,
        expires_at: null,
        created_by: me.id,
        package_name: packageName,
        note,
      } as any;
    });
    const created = await store.createLicenses(items);
    return { data: { success: true, data: { keys: created.map((l) => l.key) } } };
  });
}

export async function GET(req: NextRequest) {
  return safeRoute(async () => {
    const me = await requireAdmin();
    const appId = new URL(req.url).searchParams.get("app") || undefined;
    const scopedIds = await getScopedAppIds(me);
    const all = await store.listLicenses({ appId, limit: 200 });
    let filtered = scopedIds ? all.filter((l) => scopedIds.includes(l.app_id)) : all;
    if (me.role === "seller") {
      filtered = filtered.filter((l) => l.created_by === me.id);
    }
    return { data: { success: true, data: filtered } };
  });
}
