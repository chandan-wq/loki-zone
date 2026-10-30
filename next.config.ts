import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    turbopackPluginRuntimeStrategy: "forceWorkerThreads",
    cpus: 1,
  },
  cacheComponents: true,
  partialPrefetching: true,
  images: {
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
    ];
  },
};

export default nextConfig;
