import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { setAdminSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { generateState } from "@/lib/oauth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { provider: string } }) {
  const provider = params.provider;
  const url = new URL(req.url);
  const state = url.searchParams.get("state") || "";
  const cookieState = req.cookies.get("ka_oauth_state")?.value;
  if (!cookieState || cookieState !== state) {
    return NextResponse.redirect(new URL("/login?err=invalid_state", req.url));
  }
  const customEmail = url.searchParams.get("email") || "";

  const fakeId = `${provider}_demo_${Math.random().toString(36).slice(2, 10)}`;
  const email = customEmail || `${fakeId}@${provider}.demo`;
  const name = provider === "discord" ? "DemoDiscordUser" : provider === "google" ? "Demo Google User" : "Demo Apple User";
  const avatar = provider === "discord"
    ? "https://api.dicebear.com/7.x/avataaars/svg?seed=" + fakeId
    : provider === "google"
    ? "https://api.dicebear.com/7.x/initials/svg?seed=DG"
    : null;

  let admin: any = null;
  const link = await store.getOAuthLink(provider, fakeId);
  if (link) {
    admin = await store.getAdminById(link.admin_id);
  }
  if (!admin) {
    admin = await store.getAdminByEmail(email);
  }
  if (!admin) {
    const admins = await store.listAdmins();
    if (admins.length > 0 && !customEmail) {
      return NextResponse.redirect(new URL(`/login?err=no_account&provider=${provider}`, req.url));
    }
    const placeholderPw = await bcrypt.hash(generateState() + Date.now(), 10);
    admin = await store.createAdmin({ email, password_hash: placeholderPw, role: "admin" });
  }
  if (!link) {
    await store.createOAuthLink({
      admin_id: admin.id,
      provider,
      provider_user_id: fakeId,
      email,
      name,
      avatar_url: avatar,
    });
  }

  const res = NextResponse.redirect(new URL("/dashboard?demo=1", req.url));
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
