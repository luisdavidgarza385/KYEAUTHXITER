import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForToken,
  fetchProfile,
  generateState,
  getProviderConfig,
  parseAppleIdToken,
  verifyStateCookie,
} from "@/lib/oauth";
import { store } from "@/lib/store";
import { setAdminSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

async function finishLogin(
  provider: string,
  profile: { provider_user_id: string; email: string | null; name: string | null; avatar_url: string | null },
  req: NextRequest
) {
  let admin = null as any;

  const link = await store.getOAuthLink(provider, profile.provider_user_id);
  if (link) {
    admin = await store.getAdminById(link.admin_id);
  }

  if (!admin && profile.email) {
    admin = await store.getAdminByEmail(profile.email);
  }

  if (!admin) {
    const admins = await store.listAdmins();
    if (admins.length === 0) {
      const placeholderPw = await bcrypt.hash(generateState() + Date.now(), 10);
      const email = profile.email || `${profile.provider_user_id}@${provider}.oauth`;
      admin = await store.createAdmin({ email, password_hash: placeholderPw, role: "admin" });
    } else {
      const params = new URLSearchParams({
        err: "no_account",
        provider,
        email: profile.email || "",
      });
      return NextResponse.redirect(new URL(`/login?${params}`, req.url));
    }
  }

  if (!link) {
    await store.createOAuthLink({
      admin_id: admin.id,
      provider,
      provider_user_id: profile.provider_user_id,
      email: profile.email,
      name: profile.name,
      avatar_url: profile.avatar_url,
    });
  }

  const res = NextResponse.redirect(new URL("/dashboard", req.url));
  setAdminSession({ id: admin.id, email: admin.email, role: admin.role as "admin" | "seller" });
  res.cookies.set("ka_admin_session", Buffer.from(JSON.stringify({ id: admin.id, email: admin.email, role: admin.role })).toString("base64"), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  res.cookies.set("ka_oauth_state", "", { path: "/", maxAge: 0 });
  res.cookies.set("ka_oauth_provider", "", { path: "/", maxAge: 0 });
  return res;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider;
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/login?err=${encodeURIComponent(error)}`, req.url));
  }
  if (!code || !state) {
    return NextResponse.redirect(new URL("/login?err=missing_code", req.url));
  }

  const cookieState = req.cookies.get("ka_oauth_state")?.value;
  const cookieProvider = req.cookies.get("ka_oauth_provider")?.value;
  if (!verifyStateCookie(cookieState, state) || cookieProvider !== provider) {
    return NextResponse.redirect(new URL("/login?err=invalid_state", req.url));
  }

  const cfg = getProviderConfig(provider as any);
  if (!cfg) {
    return NextResponse.redirect(new URL("/login?err=not_configured", req.url));
  }

  if (provider === "apple") {
    const isDemo = cfg.clientId.startsWith("demo_");
    let profile;
    if (isDemo) {
      profile = {
        provider: "apple" as const,
        provider_user_id: "demo_apple_" + Math.random().toString(36).slice(2, 10),
        email: `demo_apple_${Date.now()}@apple.demo`,
        name: "Demo Apple User",
        avatar_url: null,
      };
    } else {
      const r = await fetch(cfg.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: cfg.clientId,
          client_secret: cfg.clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: cfg.redirectUri,
        }).toString(),
      });
      if (!r.ok) return NextResponse.redirect(new URL("/login?err=apple_token", req.url));
      const j = await r.json();
      profile = parseAppleIdToken(j.id_token);
      if (!profile) return NextResponse.redirect(new URL("/login?err=apple_id_token", req.url));
    }
    return finishLogin("apple", profile, req);
  }

  const isDemo = cfg.clientId.startsWith("demo_");
  if (isDemo) {
    const demoProfiles: Record<string, { provider_user_id: string; email: string; name: string; avatar_url: string | null }> = {
      discord: {
        provider_user_id: "demo_discord_" + Math.random().toString(36).slice(2, 10),
        email: `demo_discord_${Date.now()}@discord.demo`,
        name: "DemoDiscordUser",
        avatar_url: null,
      },
      google: {
        provider_user_id: "demo_google_" + Math.random().toString(36).slice(2, 10),
        email: `demo_google_${Date.now()}@google.demo`,
        name: "Demo Google User",
        avatar_url: null,
      },
    };
    const p = demoProfiles[provider];
    if (p) {
      const profile = { ...p, provider: provider as any };
      return finishLogin(provider, profile, req);
    }
  }

  const accessToken = await exchangeCodeForToken(provider as any, code);
  if (!accessToken) return NextResponse.redirect(new URL("/login?err=token_exchange", req.url));
  const profile = await fetchProfile(provider as any, accessToken);
  if (!profile) return NextResponse.redirect(new URL("/login?err=fetch_profile", req.url));
  return finishLogin(provider, profile, req);
}
