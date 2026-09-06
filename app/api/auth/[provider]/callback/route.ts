import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  exchangeCodeForToken,
  fetchProfile,
  generateState,
  getProviderConfig,
  verifyStateCookie,
  OAuthProvider,
  getBaseUrl,
} from "@/lib/oauth";
import { store } from "@/lib/store";
import { sendVerificationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider as OAuthProvider;
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorDesc = url.searchParams.get("error_description");

  if (error) {
    console.warn(`[OAuth Error] ${provider}: ${error} - ${errorDesc}`);
    return NextResponse.redirect(
      new URL(`/login?err=${encodeURIComponent(error)}`, req.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/login?err=missing_code", req.url));
  }

  const cookieState = req.cookies.get("ka_oauth_state")?.value;
  const cookieProvider = req.cookies.get("ka_oauth_provider")?.value;

  if (!verifyStateCookie(cookieState, state) || cookieProvider !== provider) {
    return NextResponse.redirect(new URL("/login?err=invalid_state", req.url));
  }

  const cfg = getProviderConfig(provider);
  if (!cfg || !cfg.clientId || !cfg.clientSecret) {
    return NextResponse.redirect(new URL(`/login?err=${provider}_not_configured`, req.url));
  }

  // 1. Exchange authorization code for access token
  const { accessToken, error: exchangeErr } = await exchangeCodeForToken(provider, code);
  if (!accessToken) {
    console.error(`[OAuth Callback] Token exchange failed for ${provider}:`, exchangeErr);
    const detailParam = exchangeErr ? `&detail=${encodeURIComponent(exchangeErr)}` : "";
    return NextResponse.redirect(new URL(`/login?err=token_exchange${detailParam}`, req.url));
  }

  // 2. Fetch official user profile from Google
  const profile = await fetchProfile(provider, accessToken);
  if (!profile || !profile.provider_user_id) {
    return NextResponse.redirect(new URL("/login?err=fetch_profile", req.url));
  }

  // 3. Find or create user in the database
  let admin: any = null;

  // A) Check by existing OAuth link
  const link = await store.getOAuthLink(provider, profile.provider_user_id);
  if (link) {
    admin = await store.getAdminById(link.admin_id);
  }

  // B) Check by email
  const userEmail = profile.email ? profile.email.toLowerCase() : null;
  if (!admin && userEmail) {
    admin = await store.getAdminByEmail(userEmail);
  }

  // User display name based strictly on Google Name or Email handle
  const rawDisplayName = profile.name || (userEmail ? userEmail.split("@")[0] : "Usuario");

  // C) If user does not exist yet, auto-register them
  if (!admin) {
    const fallbackEmail = userEmail || `${profile.provider_user_id}@${provider}.user`;
    const randomPassword = await bcrypt.hash(generateState() + Date.now(), 10);

    const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "spectralx@gmail.com";
    const isSuper = fallbackEmail.toLowerCase() === bootstrapEmail.toLowerCase();

    admin = await store.createAdmin({
      email: fallbackEmail,
      password_hash: randomPassword,
      role: isSuper ? "admin" : "seller",
      seller_label: rawDisplayName,
      credits: 5000,
      status: "active",
      permissions: ["generar", "hwid", "ban", "delete"],
    });
  } else {
    // Update seller_label with Google profile name if generic
    if (admin.seller_label === "seller" || !admin.seller_label) {
      admin.seller_label = rawDisplayName;
      await store.updateAdmin(admin.id, admin);
    }
  }

  // D) Ensure OAuth link is registered
  if (!link && admin) {
    await store.createOAuthLink({
      admin_id: admin.id,
      provider,
      provider_user_id: profile.provider_user_id,
      email: userEmail,
      name: rawDisplayName,
      avatar_url: profile.avatar_url,
    });
  }

  // 4. Generate verification token and send verification email notification
  const verifyToken = crypto.randomBytes(24).toString("hex");
  const baseUrl = getBaseUrl();
  const verifyUrl = `${baseUrl}/api/auth/verify?token=${verifyToken}&email=${encodeURIComponent(admin.email)}`;

  // Dispatch email notification
  sendVerificationEmail({
    username: rawDisplayName,
    email: admin.email,
    verifyUrl,
  }).catch((e) => console.warn("Email verification error:", e));

  // Redirect to the verification pending screen
  const res = NextResponse.redirect(
    new URL(`/verify-email?email=${encodeURIComponent(admin.email)}&token=${verifyToken}`, req.url)
  );

  // Set temporary pending verify cookie
  res.cookies.set(
    "ka_pending_verify",
    Buffer.from(JSON.stringify({ id: admin.id, email: admin.email, token: verifyToken })).toString("base64"),
    {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 1800, // 30 minutes
    }
  );

  // Clear OAuth handshake cookies
  res.cookies.set("ka_oauth_state", "", { path: "/", maxAge: 0 });
  res.cookies.set("ka_oauth_provider", "", { path: "/", maxAge: 0 });

  return res;
}
