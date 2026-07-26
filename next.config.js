/** @type {import('next').NextConfig} */
const nextConfig = {
  skipTrailingSlashRedirect: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  
  // ─── Disable source maps in production (prevents code inspection) ───
  productionBrowserSourceMaps: false,

  experimental: {
    serverActions: { bodySizeLimit: "55mb" },
  },

  // ─── Remove "X-Powered-By: Next.js" header ───
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // ─── Clickjacking protection ───
          { key: "X-Frame-Options", value: "DENY" },
          // ─── MIME sniffing protection ───
          { key: "X-Content-Type-Options", value: "nosniff" },
          // ─── Referrer policy ───
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // ─── XSS protection (legacy browsers) ───
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // ─── Disable dangerous browser features ───
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()",
          },
          // ─── HSTS: force HTTPS for 1 year ───
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          // ─── Content Security Policy ───
          // Allows scripts from self + PayPal SDK + prevents inline injections
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com https://www.paypalobjects.com https://pay.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: https://www.paypalobjects.com https://t.paypal.com",
              "connect-src 'self' https://api.resend.com https://api-m.paypal.com https://www.paypal.com https://*.supabase.co wss://*.supabase.co",
              "frame-src https://www.paypal.com https://www.sandbox.paypal.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
          // ─── Hide server tech info ───
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
      // ─── API routes: no caching + strict headers ───
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
    ];
  },

  // ─── Redirect HTTP → HTTPS is handled by Vercel automatically ───
};

module.exports = nextConfig;
