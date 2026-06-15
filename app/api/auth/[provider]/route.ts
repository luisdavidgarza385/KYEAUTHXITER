import { NextRequest, NextResponse } from "next/server";
import { buildAuthorizeUrl, generateState, getProviderConfig, isProviderConfigured } from "@/lib/oauth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider as "discord" | "google" | "apple" | "telegram";

  if (provider === "telegram") {
    return NextResponse.redirect(new URL("/login?err=telegram_widget", req.url));
  }

  const state = generateState();
  const demoMode = !isProviderConfigured(provider);

  const res = NextResponse.redirect(
    demoMode
      ? new URL(`/api/auth/${provider}/demo?state=${state}`, req.url)
      : new URL(buildAuthorizeUrl(provider, state) || "/login?err=oauth_build_failed", req.url)
  );

  res.cookies.set("ka_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  res.cookies.set("ka_oauth_provider", provider, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}

