const nextConfig = {
  output: "export",

  images: {
    unoptimized: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  experimental: {
    optimizeCss: false,
  },
};

module.exports = nextConfig;
