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

    const email: string = String(body?.email || "").trim().toLowerCase();
    const password: string = String(body?.password || "");
    const appId: string = String(body?.appId || "").trim();
    if (!email || !password) {
      return json({ success: false, message: "email and password required" }, 400);
    }

    console.log("[DEBUG LOGIN] Attempting login for:", email, "App ID:", appId);

    let admin = null;
    try {
      admin = await store.getAdminByEmail(email);
      console.log("[DEBUG LOGIN] Found admin in DB:", admin ? "YES" : "NO");
    } catch (dbErr: any) {
      console.error("[DEBUG LOGIN] Error getting admin from DB:", dbErr);
    }

    // Reseller Verification Flow
    if (admin && admin.role === "seller") {
      if (!appId) {
        return json({ success: false, message: "ID de Aplicación es requerido para revendedores" }, 401);
      }
      const cleanId = admin.id.slice(0, 15).replace("-", "");
      if (appId !== admin.id && appId !== cleanId) {
        return json({ success: false, message: "ID de Aplicación inválido para este revendedor" }, 401);
      }
    } else if (appId && admin) {
      if (admin.role !== "seller") {
        return json({ success: false, message: "El usuario no es un revendedor" }, 401);
      }
    }

    if (!admin) {
      const be = process.env.ADMIN_BOOTSTRAP_EMAIL;
      const bp = process.env.ADMIN_BOOTSTRAP_PASSWORD;
      if (be && bp && email === be.toLowerCase() && password === bp) {
        console.log("[DEBUG LOGIN] Creating bootstrap admin...");
        try {
          const hash = await bcrypt.hash(password, 10);
          admin = await store.createAdmin({ email, password_hash: hash, role: "admin" });
          console.log("[DEBUG LOGIN] Bootstrap admin created successfully!");
        } catch (createErr: any) {
          console.error("[DEBUG LOGIN] Error creating bootstrap admin:", createErr);
          return json({ success: false, message: "Error creating admin: " + createErr.message }, 500);
        }
      } else {
        console.log("[DEBUG LOGIN] Email/Password did not match bootstrap credentials.");
        return json({ success: false, message: "Invalid credentials" }, 401);
      }
    }

    let ok = await bcrypt.compare(password, admin.password_hash);
    const bp = process.env.ADMIN_BOOTSTRAP_PASSWORD;
    if (!ok && bp && password === bp) {
      console.log("[DEBUG LOGIN] Password mismatch but matched bootstrap password. Updating password hash in DB...");
      const newHash = await bcrypt.hash(password, 10);
      try {
        await store.updateAdmin(admin.id, { ...admin, password_hash: newHash });
        ok = true;
        admin.password_hash = newHash;
        console.log("[DEBUG LOGIN] Password hash updated successfully!");
      } catch (updateErr) {
        console.error("[DEBUG LOGIN] Error updating admin password hash:", updateErr);
      }
    }

    if (!ok) {
      console.log("[DEBUG LOGIN] Password mismatch.");
      return json({ success: false, message: "Invalid credentials" }, 401);
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
