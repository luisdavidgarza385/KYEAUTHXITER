import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { store } from "./store";

export type AdminSession = {
  id: string;
  email: string;
  role: "admin" | "seller" | "developer";
};

const COOKIE_NAME = "ka_admin_session";

export async function getCurrentAdmin(): Promise<AdminSession | null> {
  const cookieStore = cookies();
  const session = cookieStore.get(COOKIE_NAME)?.value;
  if (!session) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(session, "base64").toString("utf-8")
    );
    const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "spectralx@gmail.com";
    const isSuper = parsed.email?.toLowerCase() === bootstrapEmail.toLowerCase();
    
    // Always enforce seller role for any account that is NOT the bootstrap superadmin
    return {
      id: parsed.id,
      email: parsed.email,
      role: isSuper ? "admin" : "seller",
    };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");
  return admin;
}

export function setAdminSession(admin: AdminSession) {
  const value = Buffer.from(JSON.stringify(admin)).toString("base64");
  cookies().set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAdminSession() {
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export async function getScopedAppIds(me: AdminSession): Promise<string[] | null> {
  const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "spectralx@gmail.com";
  // Superadmin sees all apps
  if (me.email.toLowerCase() === bootstrapEmail.toLowerCase()) {
    return null;
  }

  // All other users (sellers/developers): strictly filter to assigned apps only
  const sellerApps = await store.listApps({ sellerId: me.id });
  const sellerAppIds = sellerApps.map((a) => a.id);

  const adminData = await store.getAdminById(me.id);
  const subscriptionIds: string[] = Array.isArray(adminData?.subscriptions) ? adminData!.subscriptions : [];

  return Array.from(new Set([...sellerAppIds, ...subscriptionIds]));
}

export async function canAccessApp(me: AdminSession, appId: string): Promise<boolean> {
  if (me.role === "admin" || me.role === "developer") {
    const app = await store.getAppById(appId);
    return app?.owner_id === me.id;
  }
  const apps = await store.listApps({ sellerId: me.id });
  return apps.some((a) => a.id === appId);
}

export async function hasUnlimitedQuota(me: AdminSession): Promise<boolean> {
  const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "spectralx@gmail.com";
  if (me.email === bootstrapEmail) return true;
  if (me.role === "admin") return true;
  if (me.role === "seller") {
    const admin = await store.getAdminById(me.id);
    return admin?.credits === -1;
  }
  return false;
}

export async function checkSubResellerExpiration(me: AdminSession): Promise<{ expired: boolean; reason?: string }> {
  if (me.role === "seller") {
    const admin = await store.getAdminById(me.id);
    if (admin && admin.subscription_end) {
      const expDate = new Date(admin.subscription_end).getTime();
      if (expDate < Date.now()) {
        return {
          expired: true,
          reason: "Tu suscripción de sub-reseller ha expirado. Por favor contacta al Desarrollador Principal (Main Developer) para realizar tu pago y reactivar tu acceso."
        };
      }
    }
  }
  return { expired: false };
}

export const QUOTA_LIMIT = 10;

export async function checkQuota(me: AdminSession, appId: string): Promise<{ ok: boolean; reason?: string; users: number; licenses: number; limit: number }> {
  const expCheck = await checkSubResellerExpiration(me);
  if (expCheck.expired) {
    return { ok: false, reason: expCheck.reason, users: 0, licenses: 0, limit: 0 };
  }

  const unlimited = await hasUnlimitedQuota(me);
  if (unlimited) {
    return { ok: true, users: 0, licenses: 0, limit: 9999 };
  }

  if (me.role === "seller") {
    const [users, licenses] = await Promise.all([
      store.listAppUsers({ appId, limit: 1000 }),
      store.listLicenses({ appId, limit: 1000 }),
    ]);
    if (users.length >= QUOTA_LIMIT) {
      return { ok: false, reason: `User limit reached (${QUOTA_LIMIT} per app). Ask the developer to increase your quota.`, users: users.length, licenses: licenses.length, limit: QUOTA_LIMIT };
    }
    if (licenses.length >= QUOTA_LIMIT) {
      return { ok: false, reason: `License limit reached (${QUOTA_LIMIT} per app). Ask the developer to increase your quota.`, users: users.length, licenses: licenses.length, limit: QUOTA_LIMIT };
    }
    return { ok: true, users: users.length, licenses: licenses.length, limit: QUOTA_LIMIT };
  } else {
    // Restricted developer/admin: total limit of 50 across all apps
    const apps = await store.listApps({ ownerId: me.id });
    const appIds = apps.map((a) => a.id);
    
    const [allUsers, allLicenses] = await Promise.all([
      store.listAppUsers({ limit: 10000 }),
      store.listLicenses({ limit: 10000 }),
    ]);
    
    const users = allUsers.filter((u) => appIds.includes(u.app_id));
    const licenses = allLicenses.filter((l) => appIds.includes(l.app_id));
    
    const USER_LIMIT = 50;
    const LICENSE_LIMIT = 60;
    if (users.length >= USER_LIMIT) {
      return {
        ok: false,
        reason: `Has alcanzado el límite máximo de ${USER_LIMIT} usuarios registrados permitidos para tu cuenta.`,
        users: users.length,
        licenses: licenses.length,
        limit: USER_LIMIT,
      };
    }
    if (licenses.length >= LICENSE_LIMIT) {
      return {
        ok: false,
        reason: `Has alcanzado el límite máximo de ${LICENSE_LIMIT} licencias permitidas para tu cuenta.`,
        users: users.length,
        licenses: licenses.length,
        limit: LICENSE_LIMIT,
      };
    }
    return { ok: true, users: users.length, licenses: licenses.length, limit: USER_LIMIT };
  }
}
