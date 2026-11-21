import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compress: true,
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "acp-aep-cs-blobstore-prod-jpn3-data.adobe.io",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "**",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      {
        source: "/sign-up",
        destination: "/register",
        permanent: false,
      },
      {
        source: "/sign-up/:path*",
        destination: "/register",
        permanent: false,
      },
      {
        source: "/sign-in",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/sign-in/:path*",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/track-order",
        destination: "/order-tracking",
        permanent: false,
      },
      {
        source: "/track-order/:path*",
        destination: "/order-tracking",
        permanent: false,
      },
      {
        source: "/combo",
        destination: "/custom-combo",
        permanent: false,
      },
      {
        source: "/custom",
        destination: "/custom-combo",
        permanent: false,
      },
      {
        source: "/combo-builder",
        destination: "/custom-combo",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*.(svg|jpg|jpeg|png|webp|avif|ico|woff|woff2|mp4)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
