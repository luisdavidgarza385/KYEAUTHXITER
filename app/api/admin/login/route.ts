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

    const inputEmail: string = String(body?.email || "").trim();
    const emailLower: string = inputEmail.toLowerCase();
    const password: string = String(body?.password || "");

    console.log("[LOGIN] Attempt for:", emailLower);

    let admin = null;
    try {
      admin = await store.getAdminByEmail(emailLower);
      if (!admin && !emailLower.includes("@")) {
        admin = await store.getAdminByEmail(`${emailLower}@gmail.com`);
      }
    } catch (dbErr: any) {
      console.error("[LOGIN] Error finding admin:", dbErr);
    }

    // Master Admin Auto-Provisioning for spectralx@gmail.com / SpectralX
    const isMasterUser = emailLower === "spectralx@gmail.com" || emailLower === "spectralx";
    const isMasterPass = password === "SpectralX";

    if (isMasterUser && isMasterPass) {
      if (!admin) {
        const hash = await bcrypt.hash("SpectralX", 10);
        admin = await store.createAdmin({
          email: "spectralx@gmail.com",
          password_hash: hash,
          role: "admin",
          status: "Activo",
          credits: 999999999,
          subscription_end: null, // Unlimited
          permissions: ["all", "licenses", "users", "apps", "prefix", "hwid"],
        });
      } else {
        // Ensure master password is up to date
        const matches = await bcrypt.compare(password, admin.password_hash);
        if (!matches) {
          const hash = await bcrypt.hash("SpectralX", 10);
          admin = await store.updateAdmin(admin.id, { ...admin, password_hash: hash, role: "admin" });
        }
      }
    }

    // Standard Bootstrap Check
    if (!admin) {
      const be = process.env.ADMIN_BOOTSTRAP_EMAIL;
      const bp = process.env.ADMIN_BOOTSTRAP_PASSWORD;
      if (be && bp && (emailLower === be.toLowerCase() || emailLower === be.split("@")[0].toLowerCase()) && password === bp) {
        const hash = await bcrypt.hash(password, 10);
        admin = await store.createAdmin({ email: be.toLowerCase(), password_hash: hash, role: "admin" });
      } else {
        return json({ success: false, message: "Invalid credentials" }, 401);
      }
    }

    // Verify Password
    let ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok && isMasterUser && isMasterPass) {
      ok = true;
    }

    if (!ok) {
      return json({ success: false, message: "Invalid credentials" }, 401);
    }

    const effectiveRole = admin.permissions?.includes("manager") || admin.role === "manager" ? "manager" : admin.role;

    const cookieValue = Buffer.from(
      JSON.stringify({ id: admin.id, email: admin.email, role: effectiveRole })
    ).toString("base64");

    const remember = !!body?.remember;
    const cookieOptions: any = {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    };
    if (remember) {
      cookieOptions.maxAge = 60 * 60 * 24 * 30; // 30 days
    }

    const res = json({ success: true, data: { id: admin.id, email: admin.email, role: effectiveRole } });
    res.cookies.set("ka_admin_session", cookieValue, cookieOptions);
    return res;
  } catch (e: any) {
    return json({ success: false, message: e?.message || "Server error" }, 500);
  }
}
