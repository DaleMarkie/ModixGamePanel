/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:2010/api/:path*",
      },
    ];
  },
  images: {
    domains: ["cdn.cloudflare.steamstatic.com"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ["https://<sandbox-id>-3000.csb.app"],
};

module.exports = nextConfig;
