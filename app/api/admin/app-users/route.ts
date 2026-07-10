import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin, safeRoute } from "@/lib/api-helpers";
import { store } from "@/lib/store";
import { getScopedAppIds, checkQuota } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return safeRoute(async () => {
    const me = await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const appId = String(body?.appId || "");
    const username = String(body?.username || "").trim();
    const password = String(body?.password || "");
    const email = String(body?.email || "").trim() || null;

    if (!appId || !username || !password)
      return { status: 400, data: { success: false, message: "appId, username, password required" } };
    if (password.length < 1)
      return { status: 400, data: { success: false, message: "Password must be at least 1 character" } };
    if (username.length < 1 || username.length > 32)
      return { status: 400, data: { success: false, message: "Username must be 1-32 characters" } };

    const app = await store.getAppById(appId);
    if (!app) return { status: 404, data: { success: false, message: "App not found" } };

    const scopedIds = await getScopedAppIds(me);
    if (scopedIds !== null && !scopedIds.includes(appId)) {
      return { status: 403, data: { success: false, message: "Forbidden" } };
    }

    const admin = await store.getAdminById(me.id);
    if (!admin) return { status: 404, data: { success: false, message: "User not found" } };

    const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "spectralx@gmail.com";
    const isUnlimited = admin.email === bootstrapEmail;
    const cost = 20;

    if (!isUnlimited) {
      const userCredits = admin.credits || 0;
      if (userCredits < cost) {
        return { status: 400, data: { success: false, message: `Créditos insuficientes. Registrar un usuario cuesta ${cost} créditos (tienes ${userCredits}).` } };
      }
      admin.credits = userCredits - cost;
      await store.updateAdmin(admin.id, admin);
    }

    const quota = await checkQuota(me, appId);
    if (!quota.ok) {
      return { status: 403, data: { success: false, message: quota.reason } };
    }

    const existing = await store.getAppUser(appId, username);
    if (existing) return { status: 409, data: { success: false, message: "Username already exists in this app" } };

    const level = Math.max(1, parseInt(body?.level) || 1);
    const durationDaysInput = parseInt(body?.durationDays) || 30;
    const unit = body?.unit || "days";

    let durationDays = durationDaysInput;
    if (unit === "months") durationDays = durationDaysInput * 30;
    else if (unit === "years") durationDays = durationDaysInput * 365;
    else if (unit === "lifetime") durationDays = 36500;

    const hash = await bcrypt.hash(password, 10);
    const user = await store.createAppUser({
      app_id: appId,
      username,
      email,
      password_hash: hash,
      hwid: null,
      ip: null,
      last_login: null,
      banned: false,
      ban_reason: null,
    });

    // Auto-generate a used license for this manually created user so they have subscription time
    const now = new Date();
    const expires = new Date(now.getTime() + durationDays * 86400000);
    const licenseKey = `ADMIN-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

    await store.createLicenses([{
      app_id: appId,
      key: licenseKey,
      duration_days: durationDays,
      level,
      uses: 1,
      max_uses: 1,
      hwid_lock: false,
      ip_lock: false,
      status: "used",
      used_by: user.id,
      activated_at: now.toISOString(),
      expires_at: expires.toISOString(),
      created_by: me.id,
      package_name: "Manual",
      note: "Creado manualmente desde panel admin",
    }]);

    return { data: { success: true, data: user } };
  });
}
