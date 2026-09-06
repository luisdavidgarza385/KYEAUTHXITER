import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { store } from "./store";
import crypto from "crypto";

export type AdminSession = {
  id: string;
  email: string;
  role: "admin" | "seller" | "developer" | "manager";
};

const COOKIE_NAME = "ka_admin_session";
const AUTH_SECRET = process.env.AUTH_SECRET || "securex_auth_super_secret_hmac_key_2026";

function signToken(dataStr: string): string {
  const hmac = crypto.createHmac("sha256", AUTH_SECRET).update(dataStr).digest("hex");
  return `${dataStr}.${hmac}`;
}

function verifyToken(tokenStr: string): string | null {
  if (!tokenStr) return null;
  const lastDot = tokenStr.lastIndexOf(".");
  if (lastDot !== -1) {
    const rawData = tokenStr.slice(0, lastDot);
    const signature = tokenStr.slice(lastDot + 1);
    const expected = crypto.createHmac("sha256", AUTH_SECRET).update(rawData).digest("hex");
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
      return rawData;
    }
  }
  // Fallback for legacy unsigned cookies
  try {
    const rawParsed = JSON.parse(Buffer.from(tokenStr, "base64").toString("utf-8"));
    if (rawParsed?.id && rawParsed?.email) return tokenStr;
  } catch {}
  return null;
}

export async function getCurrentAdmin(): Promise<AdminSession | null> {
  const cookieStore = cookies();
  const session = cookieStore.get(COOKIE_NAME)?.value;
  if (!session) return null;
  try {
    const verified = verifyToken(session);
    if (!verified) return null;

    const parsed = JSON.parse(
      Buffer.from(verified, "base64").toString("utf-8")
    );
    if (!parsed?.id || !parsed?.email) return null;

    const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "spectralx@gmail.com";
    const isSuper = parsed.email?.toLowerCase() === bootstrapEmail.toLowerCase() || parsed.role === "admin";
    
    return {
      id: parsed.id,
      email: parsed.email,
      role: isSuper ? "admin" : ((parsed.role as any) || "seller"),
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
  const base64 = Buffer.from(JSON.stringify(admin)).toString("base64");
  const signed = signToken(base64);
  cookies().set(COOKIE_NAME, signed, {
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
  // SuperAdmin and Admins have global access to ALL applications
  if (me.email.toLowerCase() === bootstrapEmail.toLowerCase() || me.role === "admin") {
    return null;
  }

  const [ownedApps, sellerApps] = await Promise.all([
    store.listApps({ ownerId: me.id }),
    store.listApps({ sellerId: me.id }),
  ]);
  const userAppIds = [...ownedApps.map((a) => a.id), ...sellerApps.map((a) => a.id)];

  const adminData = await store.getAdminById(me.id);
  const subscriptionIds: string[] = Array.isArray(adminData?.subscriptions) ? adminData!.subscriptions : [];

  return Array.from(new Set([...userAppIds, ...subscriptionIds]));
}

export async function canAccessApp(me: AdminSession, appId: string): Promise<boolean> {
  if (me.role === "admin") return true;
  const app = await store.getAppById(appId);
  if (!app) return false;
  if (app.owner_id === me.id || app.seller_id === me.id) return true;
  const scopedIds = await getScopedAppIds(me);
  return scopedIds === null || scopedIds.includes(appId);
}

export async function hasUnlimitedQuota(me: AdminSession): Promise<boolean> {
  const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "spectralx@gmail.com";
  if (me.email.toLowerCase() === bootstrapEmail.toLowerCase() || me.role === "admin") return true;
  const admin = await store.getAdminById(me.id);
  if (!admin) return false;
  if (admin.credits === -1) return true;
  const hasPaidSub = Array.isArray(admin.subscriptions) && admin.subscriptions.length > 0;
  const subNotExpired = admin.subscription_end ? new Date(admin.subscription_end).getTime() > Date.now() : false;
  return hasPaidSub || subNotExpired;
}

export async function checkSubResellerExpiration(me: AdminSession): Promise<{ expired: boolean; reason?: string }> {
  if (me.role === "seller" || me.role === "manager") {
    const admin = await store.getAdminById(me.id);
    if (admin && admin.subscription_end) {
      const expDate = new Date(admin.subscription_end).getTime();
      if (expDate < Date.now()) {
        return {
          expired: true,
          reason: "Tu suscripción ha expirado. Por favor contacta al Administrador Principal para reactivar tu acceso."
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
      return { ok: false, reason: `Límite de usuarios alcanzado (${QUOTA_LIMIT} por app).`, users: users.length, licenses: licenses.length, limit: QUOTA_LIMIT };
    }
    if (licenses.length >= QUOTA_LIMIT) {
      return { ok: false, reason: `Límite de licencias alcanzado (${QUOTA_LIMIT} por app).`, users: users.length, licenses: licenses.length, limit: QUOTA_LIMIT };
    }
    return { ok: true, users: users.length, licenses: licenses.length, limit: QUOTA_LIMIT };
  }
  return { ok: true, users: 0, licenses: 0, limit: 9999 };
}
