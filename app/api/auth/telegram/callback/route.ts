import { NextRequest, NextResponse } from "next/server";
import { verifyTelegramAuth } from "@/lib/oauth";
import { store } from "@/lib/store";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const data: Record<string, string> = {};
  for (const [k, v] of form.entries()) data[k] = String(v);

  const profile = verifyTelegramAuth(data);
  if (!profile) {
    return NextResponse.redirect(new URL("/login?err=telegram_invalid", req.url));
  }

  let admin: any = null;
  const link = await store.getOAuthLink("telegram", profile.provider_user_id);
  if (link) {
    admin = await store.getAdminById(link.admin_id);
  }
  if (!admin) {
    const admins = await store.listAdmins();
    if (admins.length === 0) {
      const placeholderPw = await bcrypt.hash(Math.random().toString(36), 10);
      const email = `${profile.provider_user_id}@telegram.oauth`;
      admin = await store.createAdmin({ email, password_hash: placeholderPw, role: "admin" });
    } else {
      const params = new URLSearchParams({ err: "no_account", provider: "telegram" });
      return NextResponse.redirect(new URL(`/login?${params}`, req.url));
    }
  }
  if (!link) {
    await store.createOAuthLink({
      admin_id: admin.id,
      provider: "telegram",
      provider_user_id: profile.provider_user_id,
      email: profile.email,
      name: profile.name,
      avatar_url: profile.avatar_url,
    });
  }

  const res = NextResponse.redirect(new URL("/dashboard", req.url));
  res.cookies.set("ka_admin_session", Buffer.from(JSON.stringify({ id: admin.id, email: admin.email, role: admin.role })).toString("base64"), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
