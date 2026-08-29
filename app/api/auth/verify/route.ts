import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { setAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const email = url.searchParams.get("email")?.toLowerCase();

  if (!email) {
    return NextResponse.redirect(new URL("/login?err=invalid_verification", req.url));
  }

  const admin = await store.getAdminByEmail(email);
  if (!admin) {
    return NextResponse.redirect(new URL("/login?err=no_account", req.url));
  }

  // Mark account as active & verified
  admin.status = "active";
  await store.updateAdmin(admin.id, admin);

  const sessionData = {
    id: admin.id,
    email: admin.email,
    role: admin.role as "admin" | "seller",
  };

  const res = NextResponse.redirect(new URL("/dashboard", req.url));

  setAdminSession(sessionData);

  res.cookies.set(
    "ka_admin_session",
    Buffer.from(JSON.stringify(sessionData)).toString("base64"),
    {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    }
  );

  res.cookies.set("ka_pending_verify", "", { path: "/", maxAge: 0 });

  return res;
}
