import React, { Suspense } from "react";
import { Metadata } from "next";
import CategoryClient from "../category/[slug]/CategoryClient";

export const metadata: Metadata = {
  title: "Shop All Equipment | LOKI ZONE Table Tennis Nepal",
  description:
    "Browse official ITTF tournament table tennis rackets, carbon blades, high-friction rubbers, apparel, and club accessories in Nepal.",
};

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CategoryClient slug="all" />
    </Suspense>
  );
}
