import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { AdminSession } from "@/lib/auth";

export type ApiJson = ReturnType<typeof NextResponse.json>;

const json = (data: unknown, status = 200) => NextResponse.json(data, { status });

export async function getCurrentAdmin(): Promise<AdminSession | null> {
  const cookieStore = cookies();
  const session = cookieStore.get("ka_admin_session")?.value;
  if (!session) return null;
  try {
    return JSON.parse(Buffer.from(session, "base64").toString("utf-8")) as AdminSession;
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("UNAUTHORIZED");
  return admin;
}

export async function safeRoute(
  fn: () => Promise<{ status?: number; data: any } | NextResponse>
): Promise<NextResponse> {
  try {
    const result = await fn();
    if (result instanceof NextResponse) return result;
    return NextResponse.json(result.data, { status: result.status || 200 });
  } catch (e: any) {
    if (e?.digest?.startsWith?.("NEXT_")) throw e;
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { success: false, message: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

export { json };
