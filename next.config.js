/** @type {import('next').NextConfig} */
const nextConfig = {
  skipTrailingSlashRedirect: true,
  experimental: {
    serverActions: { bodySizeLimit: "55mb" },
  },
};

module.exports = nextConfig;
