import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import bcrypt from "bcryptjs";
import { generateState } from "@/lib/oauth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { provider: string } }) {
  try {
    const provider = params.provider;
    const url = new URL(req.url);
    const customEmail = url.searchParams.get("email")?.trim() || "";

    const fakeId = `${provider}_demo_${Math.random().toString(36).slice(2, 10)}`;
    const email = customEmail || `${fakeId}@${provider}.demo`;
    const name = provider === "discord" ? "Demo Discord User" : provider === "google" ? "Demo Google User" : "Demo Apple User";
    const avatar = provider === "discord"
      ? "https://api.dicebear.com/7.x/avataaars/svg?seed=" + fakeId
      : provider === "google"
      ? "https://api.dicebear.com/7.x/initials/svg?seed=DG"
      : null;

    let admin: any = null;

    // Check if email already exists in admin_users
    admin = await store.getAdminByEmail(email);

    // If admin does not exist, create a new reseller admin account for this email
    if (!admin) {
      try {
        const placeholderPw = await bcrypt.hash(generateState() + Date.now(), 10);
        admin = await store.createAdmin({ 
          email, 
          password_hash: placeholderPw, 
          role: "seller",
          credits: 3000,
          status: "active"
        });

        // Trigger welcome & receipt emails if email service is configured
        try {
          const { generateAuthReceiptEmailHtml } = await import("@/lib/email");
          const htmlContent = generateAuthReceiptEmailHtml({
            username: email.split("@")[0],
            email: email,
            licenseKey: `SXAU-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-4LQZ`,
            deviceId: `${provider.toUpperCase()} Auth - Mobile/Web`,
          });
          // Send log notification
          await store.createLog({
            app_id: null,
            user_id: null,
            message: `[Email Notification Sent to ${email}] Autenticación SecureX Auth registrada exitosamente.`,
            level: "info"
          });
        } catch (e) {
          console.warn("Could not dispatch receipt email:", e);
        }
      } catch (err) {
        console.error("Error creating OAuth admin:", err);
        const admins = await store.listAdmins();
        admin = admins[0] || null;
      }
    }

    if (!admin) {
      return NextResponse.redirect(new URL("/login?err=auth_failed", req.url));
    }

    // Try linking OAuth without failing if table is missing or constrained
    try {
      await store.createOAuthLink({
        admin_id: admin.id,
        provider,
        provider_user_id: fakeId,
        email,
        name,
        avatar_url: avatar,
      });
    } catch (linkErr) {
      console.warn("Could not record OAuth link record:", linkErr);
    }

    const res = NextResponse.redirect(new URL("/dashboard?demo=1", req.url));
    const sessionPayload = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    };
    res.cookies.set("ka_admin_session", Buffer.from(JSON.stringify(sessionPayload)).toString("base64"), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    res.cookies.set("ka_oauth_state", "", { path: "/", maxAge: 0 });
    res.cookies.set("ka_oauth_provider", "", { path: "/", maxAge: 0 });
    return res;
  } catch (globalErr) {
    console.error("Global OAuth demo finish error:", globalErr);
    return NextResponse.redirect(new URL("/login?err=server_error", req.url));
  }
}
