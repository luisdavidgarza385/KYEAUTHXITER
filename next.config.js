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
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
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
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com https://*.paypal.com https://www.paypalobjects.com https://pay.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: https://www.paypalobjects.com https://*.paypal.com https://t.paypal.com",
              "connect-src 'self' https://api.resend.com https://api-m.paypal.com https://www.paypal.com https://*.paypal.com https://*.supabase.co wss://*.supabase.co",
              "frame-src 'self' https://www.paypal.com https://*.paypal.com https://www.sandbox.paypal.com",
              "base-uri 'self'",
              "form-action 'self' https://www.paypal.com https://*.paypal.com",
              "upgrade-insecure-requests",
            ].join("; "),
          },
          // ─── Hide server tech info + Allow PayPal Popups ───
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
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
};

module.exports = nextConfig;
