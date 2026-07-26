import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, API_RATE_LIMIT } from "@/lib/rate-limit";

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // ─── Get real IP ───
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  // ─── Block suspicious User-Agents (bots, scanners, curl scanners) ───
  const ua = (req.headers.get("user-agent") || "").toLowerCase();
  const badAgents = [
    "sqlmap", "nikto", "nmap", "masscan", "zgrab", "dirbuster",
    "gobuster", "wfuzz", "burpsuite", "acunetix", "nessus",
    "openvas", "metasploit", "havij", "hydra", "python-requests/2.2",
    "go-http-client/1.1", "libwww-perl", "perl", "phantomjs",
  ];
  if (badAgents.some((b) => ua.includes(b))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // ─── Global API rate limiting ───
  if (pathname.startsWith("/api/")) {
    const rl = checkRateLimit(`api:${ip}`, API_RATE_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, message: "Rate limit exceeded. Please slow down." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rl.retryAfterSec),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
  }

  // ─── Block path traversal attempts ───
  if (pathname.includes("..") || pathname.includes("%2e%2e") || pathname.includes("%252e")) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  // ─── Block common vulnerability scanner paths ───
  const scanPaths = [
    "/.env", "/.git", "/wp-admin", "/wp-login", "/phpmyadmin",
    "/admin.php", "/xmlrpc.php", "/shell", "/cmd", "/eval",
    "/.aws", "/.ssh", "/etc/passwd", "/proc/self",
  ];
  if (scanPaths.some((p) => pathname.toLowerCase().startsWith(p))) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // ─── Set current app cookie for dashboard context ───
  let appId: string | null = null;
  const appDetailMatch = pathname.match(/^\/dashboard\/apps\/([^\/]+)$/);
  if (appDetailMatch && appDetailMatch[1] !== "new") {
    appId = appDetailMatch[1];
  }
  if (!appId) {
    const q = searchParams.get("app");
    if (
      q &&
      (pathname === "/dashboard/licenses" ||
        pathname === "/dashboard/users" ||
        pathname === "/dashboard/logs")
    ) {
      appId = q;
    }
  }

  const res = NextResponse.next();

  if (appId) {
    res.cookies.set("ka_current_app", appId, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  // ─── Add security headers on all responses ───
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-XSS-Protection", "1; mode=block");

  return res;
}

export const config = {
  matcher: [
    // Apply to all routes except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf)).*)",
  ],
};
