import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  let appId: string | null = null;

  const appDetailMatch = pathname.match(/^\/dashboard\/apps\/([^\/]+)$/);
  if (appDetailMatch && appDetailMatch[1] !== "new") {
    appId = appDetailMatch[1];
  }

  if (!appId) {
    const q = searchParams.get("app");
    if (q && (pathname === "/dashboard/licenses" || pathname === "/dashboard/users" || pathname === "/dashboard/logs")) {
      appId = q;
    }
  }

  if (appId) {
    const res = NextResponse.next();
    res.cookies.set("ka_current_app", appId, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/apps/:id", "/dashboard/licenses", "/dashboard/users", "/dashboard/logs"],
};
