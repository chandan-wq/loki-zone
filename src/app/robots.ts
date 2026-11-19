import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://loki-zone.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/admin/*",
          "/account",
          "/account/*",
          "/checkout",
          "/order-confirmation",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/admin/*",
          "/account",
          "/checkout",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
