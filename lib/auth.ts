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
    return parsed as AdminSession;
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
  if (me.role === "admin" || me.role === "developer") return null;
  const apps = await store.listApps({ sellerId: me.id });
  return apps.map((a) => a.id);
}

export async function canAccessApp(me: AdminSession, appId: string): Promise<boolean> {
  if (me.role === "admin" || me.role === "developer") return true;
  const apps = await store.listApps({ sellerId: me.id });
  return apps.some((a) => a.id === appId);
}

export function hasUnlimitedQuota(me: AdminSession): boolean {
  return true;
}

export const QUOTA_LIMIT = 10;

export async function checkQuota(me: AdminSession, appId: string): Promise<{ ok: boolean; reason?: string; users: number; licenses: number; limit: number }> {
  if (hasUnlimitedQuota(me)) {
    return { ok: true, users: 0, licenses: 0, limit: 9999 };
  }
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
}
