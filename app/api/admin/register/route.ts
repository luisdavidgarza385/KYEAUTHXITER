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
    const username = String(body?.username || "").trim();
    const password = String(body?.password || "");
    if (!email || !password) {
      return json({ success: false, message: "Correo y contraseña son requeridos" }, 400);
    }
    if (password.length < 5) {
      return json({ success: false, message: "La contraseña debe tener al menos 5 caracteres" }, 400);
    }
    if (email.length < 3) {
      return json({ success: false, message: "El usuario o correo debe tener al menos 3 caracteres" }, 400);
    }

    const sellerLabel = username ? username.toLowerCase() : email.split("@")[0];

    // Prevent duplicate emails AND usernames
    const existingByEmail = await store.getAdminByEmail(email);
    const existingByUsername = username ? await store.getAdminByEmail(username) : null;
    if (existingByEmail || existingByUsername) {
      return json({ success: false, message: "Este usuario o correo electrónico ya está registrado. Usa otro o inicia sesión." }, 409);
    }

    // New registrations are always sellers (resellers), NOT developers
    const role = "seller";

    const hash = await bcrypt.hash(password, 10);
    const admin = await store.createAdmin({
      email,
      password_hash: hash,
      role,
      seller_label: sellerLabel,
      credits: 3000,
      status: "active",
      permissions: ["generar", "hwid", "ban", "delete"]
    });

    // Send welcome / auth receipt email via Resend (fire and forget)
    try {
      const { sendAuthReceiptEmail } = await import("@/lib/email");
      const licenseKey = `SXAU-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-4LQZ`;
      sendAuthReceiptEmail({
        username: email.split("@")[0],
        email,
        licenseKey,
        deviceId: "Registro Manual – SecureX Auth",
      }).catch((e) => console.warn("Email dispatch error:", e));
    } catch (e) {
      console.warn("Could not send welcome email:", e);
    }

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
