import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { store } from "@/lib/store";
import { checkRateLimit, LOGIN_RATE_LIMIT } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const json = (data: unknown, status = 200) =>
    NextResponse.json(data, { status });

  // ─── Rate limiting: max 8 attempts/min per IP, 15 min block ───
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const rl = checkRateLimit(`login:${ip}`, LOGIN_RATE_LIMIT);
  if (!rl.allowed) {
    return json({ success: false, message: `Demasiados intentos. Intenta de nuevo en ${Math.ceil(rl.retryAfterSec / 60)} minutos.` }, 429);
  }

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
    const roleMode: string = String(body?.roleMode || "admin").trim();

    console.log("[DEBUG LOGIN] Attempting login for:", email, "roleMode:", roleMode);

    let admin = null;
    try {
      admin = await store.getAdminByEmail(email);
      console.log("[DEBUG LOGIN] Found admin in DB:", admin ? "YES" : "NO");
    } catch (dbErr: any) {
      console.error("[DEBUG LOGIN] Error getting admin from DB:", dbErr);
    }

    // Sub-reseller API key enforcement
    if (admin && admin.created_by) {
      // User is a Sub-reseller created by an admin
      if (roleMode !== "reseller" && !appId) {
        return json({ success: false, message: "Los revendedores afiliados deben iniciar sesión desde la pestaña 'Revendedor' e ingresar su Clave API / ID de aplicación." }, 401);
      }

      if (!appId) {
        return json({ success: false, message: "El ID de Aplicación / Clave API (API Key) es requerido para revendedores afiliados." }, 401);
      }

      // Normalize both input and DB values (strip hyphens, dashes, spaces, and casing)
      const normInput = appId.toLowerCase().replace(/[^a-z0-9]/g, "");
      const normAdminId = admin.id.toLowerCase().replace(/[^a-z0-9]/g, "");
      const normSellerLabel = (admin.seller_label || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const subs = Array.isArray(admin.subscriptions) ? admin.subscriptions.map(s => s.toLowerCase().replace(/[^a-z0-9]/g, "")) : [];

      const matchesApp = 
        normInput.length >= 3 &&
        (normAdminId.startsWith(normInput) ||
         normInput.startsWith(normAdminId) ||
         normInput === normAdminId ||
         (normSellerLabel && normInput === normSellerLabel) ||
         subs.some(s => s.startsWith(normInput) || normInput.startsWith(s)));

      if (!matchesApp) {
        return json({ success: false, message: "ID de Aplicación / Clave API inválido para este revendedor." }, 401);
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
    if (!ok) {
      ok = await bcrypt.compare(password.toLowerCase(), admin.password_hash);
    }
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

    const remember = !!body?.remember;
    const cookieOptions: any = {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    };
    if (remember) {
      cookieOptions.maxAge = 60 * 60 * 24 * 7; // Expira en 7 días si se seleccionó recordar
    }

    const res = json({ success: true, data: { id: admin.id, email: admin.email, role: admin.role } });
    res.cookies.set("ka_admin_session", cookieValue, cookieOptions);
    return res;
  } catch (e: any) {
    return json({ success: false, message: e?.message || "Server error" }, 500);
  }
}
