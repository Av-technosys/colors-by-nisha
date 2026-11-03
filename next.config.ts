import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
  async rewrites() {
    return [
      {
        source: "/collections/all",
        destination: "/shop",
      },
      {
        source: "/collections/:category",
        destination: "/shop?category=:category",
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
