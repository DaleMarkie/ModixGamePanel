/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:2010/api/:path*",
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

  // FIXED: proper dev origins
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://*.csb.app",
  ],
};

module.exports = nextConfig;
