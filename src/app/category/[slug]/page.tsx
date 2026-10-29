import React, { Suspense } from "react";
import CategoryClient from "./CategoryClient";

export function generateStaticParams() {
  return [
    { slug: "all" },
    { slug: "rackets" },
    { slug: "apparel" },
    { slug: "footwear" },
    { slug: "accessories" },
    { slug: "balls" },
    { slug: "new" },
    { slug: "best-sellers" },
    { slug: "deals" },
  ];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function CategoryContent({ params }: PageProps) {
  const { slug } = await params;
  return <CategoryClient slug={slug} />;
}

export default function CategoryPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CategoryContent params={params} />
    </Suspense>
  );
}
