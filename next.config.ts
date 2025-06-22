import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  eslint: {
    // This will completely ignore ESLint errors during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // This will completely ignore TypeScript errors during builds
    ignoreBuildErrors: true,
  },
  images: {
    // Allow images from the public directory
    unoptimized: false,
    // If you need to serve images from external domains, add them here
    domains: [
      "pub-7f0ccf30c0134c51b5d048e704c7b9b0.r2.dev"
    ],
  },
};

export default nextConfig;
