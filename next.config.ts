import type { NextConfig } from "next";

const imageHosts = new Set(["cdn.shopify.com", "colorsbynisha.com", "www.colorsbynisha.com"]);
if (process.env.AWS_S3_PUBLIC_URL) {
  const url = new URL(process.env.AWS_S3_PUBLIC_URL);
  if (url.protocol === "https:") imageHosts.add(url.hostname);
}
if (process.env.AWS_S3_BUCKET && process.env.AWS_REGION) {
  imageHosts.add(`${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`);
  imageHosts.add(`${process.env.AWS_S3_BUCKET}.s3.amazonaws.com`);
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [...imageHosts].map(hostname => ({ protocol: "https", hostname, port: "" })),
  },
  cacheComponents: true,
  partialPrefetching: true,
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Content-Security-Policy", value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ...(process.env.NODE_ENV === "production" ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }] : []),
      ],
    }];
  },
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
