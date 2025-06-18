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
};

export default nextConfig;
