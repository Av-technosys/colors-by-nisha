import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
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
      {
        source: "/blogs",
        destination: "/blog",
      },
      {
        source: "/blogs/news",
        destination: "/blog",
      },
      {
        source: "/blogs/news/:slug",
        destination: "/blog/:slug",
      },
      {
        source: "/blogs/:slug",
        destination: "/blog/:slug",
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
