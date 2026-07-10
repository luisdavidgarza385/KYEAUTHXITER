import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const json = (data: unknown, status = 200) =>
    NextResponse.json(data, { status });

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return json({ success: false, message: "Invalid JSON" }, 400);
    }

    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    if (!email || !password) {
      return json({ success: false, message: "email and password required" }, 400);
    }
    if (password.length < 8) {
      return json({ success: false, message: "Password must be at least 8 characters" }, 400);
    }
    if (email.length < 3) {
      return json({ success: false, message: "Username or email must be at least 3 characters" }, 400);
    }

    const existing = await store.getAdminByEmail(email);
    if (existing) {
      return json({ success: false, message: "Email already registered" }, 409);
    }

    const role = "developer";

    const hash = await bcrypt.hash(password, 10);
    const admin = await store.createAdmin({
      email,
      password_hash: hash,
      role,
      credits: 3000,
      status: "Activo",
      permissions: ["generar", "hwid", "ban", "delete"]
    });

    const cookieValue = Buffer.from(
      JSON.stringify({ id: admin.id, email: admin.email, role: admin.role })
    ).toString("base64");

    const res = json({ success: true, data: { id: admin.id, email: admin.email, role: admin.role } });
    res.cookies.set("ka_admin_session", cookieValue, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e: any) {
    return json({ success: false, message: e?.message || "Server error" }, 500);
  }
}
