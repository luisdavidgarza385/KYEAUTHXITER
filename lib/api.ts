import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { store } from "./store";
import { generateId, generateKey } from "./utils";

export type ApiSuccess<T> = { success: true; data: T };
export type ApiFailure = { success: false; message: string };
export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiFailure;

export function ok<T>(data: T): NextResponse {
  return NextResponse.json({ success: true, data });
}
export function fail(message: string, status = 400): NextResponse {
  return NextResponse.json({ success: false, message }, { status });
}

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10);
}
export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export async function findAppByName(name: string) {
  return store.getAppByName(name);
}

export async function findAppByAppId(appId: string) {
  return store.getAppByAppId(appId);
}

export async function createSession(opts: {
  appId: string;
  userId?: string | null;
  ip: string;
  hwid?: string;
}) {
  const sessionId = generateId(48);
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);
  const s = await store.createSession({
    session_id: sessionId,
    app_id: opts.appId,
    user_id: opts.userId || null,
    ip: opts.ip,
    hwid: opts.hwid || null,
    expires_at: expires.toISOString(),
    valid: true,
  });
  if (!s) return null;
  return { sessionId, expires };
}

export async function getSession(sessionId: string) {
  return store.getSession(sessionId);
}

export async function invalidateSession(sessionId: string) {
  return store.invalidateSession(sessionId);
}

export async function logEvent(opts: {
  appId?: string;
  userId?: string;
  message: string;
  level?: "info" | "warn" | "error" | "debug";
}) {
  return store.createLog({
    app_id: opts.appId || null,
    user_id: opts.userId || null,
    message: opts.message,
    level: opts.level || "info",
  });
}

export async function generateLicenses(opts: {
  appId: string;
  count: number;
  durationDays: number;
  level: number;
  maxUses: number;
  hwidLock: boolean;
  ipLock: boolean;
  createdBy?: string;
}) {
  const items = Array.from({ length: opts.count }).map(() => ({
    app_id: opts.appId,
    key: generateKey(),
    duration_days: opts.durationDays,
    level: opts.level,
    uses: 0,
    max_uses: opts.maxUses,
    hwid_lock: opts.hwidLock,
    ip_lock: opts.ipLock,
    status: "unused" as const,
    used_by: null,
    activated_at: null,
    expires_at: null,
    created_by: opts.createdBy || null,
  }));
  const created = await store.createLicenses(items);
  return created.map((l) => l.key);
}

export function checkSecret(req: NextRequest, app: { app_secret: string }): Response | null {
  const secret =
    req.headers.get("x-secret") || new URL(req.url).searchParams.get("secret");
  if (secret !== app.app_secret) {
    return fail("Invalid application secret", 401);
  }
  return null;
}
