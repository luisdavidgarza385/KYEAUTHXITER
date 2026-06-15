/** @type {import('next').NextConfig} */
const nextConfig = {
  skipTrailingSlashRedirect: true,
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
  },
};

module.exports = nextConfig;
