import { NextRequest, NextResponse } from "next/server";
import { buildAuthorizeUrl, generateState, isProviderConfigured } from "@/lib/oauth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider as "discord" | "google" | "apple" | "telegram";

  if (provider === "telegram") {
    return NextResponse.redirect(new URL("/login?err=telegram_not_configured", req.url));
  }

  if (!isProviderConfigured(provider)) {
    return NextResponse.redirect(
      new URL(`/login?err=${provider}_not_configured`, req.url)
    );
  }

  const state = generateState();
  const authorizeUrl = buildAuthorizeUrl(provider, state);

  if (!authorizeUrl) {
    return NextResponse.redirect(
      new URL(`/login?err=${provider}_not_configured`, req.url)
    );
  }

  const res = NextResponse.redirect(authorizeUrl);

  res.cookies.set("ka_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes
  });

  res.cookies.set("ka_oauth_provider", provider, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return res;
}
