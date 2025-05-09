import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Any custom webpack configurations
    return config;
  },
};

export default nextConfig;
