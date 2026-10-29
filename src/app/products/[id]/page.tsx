import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { PRODUCTS } from "@/data/products";
import ProductDetailClient from "./ProductDetailClient";

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    id: product.id,
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id);

  if (!product) {
    return {
      title: "LOKI Official Table Tennis Gear | Ritiz TT Goods Nepal",
      description: "Official LOKI table tennis equipment, tournament rackets, and accessories in Nepal.",
    };
  }

  return {
    title: `${product.name} | Ritiz TT Goods Nepal`,
    description: product.description,
    openGraph: {
      title: `${product.name} - NPR ${product.price.toLocaleString()} | Ritiz TT Goods Nepal`,
      description: product.description,
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
  };
}

async function ProductContent({ params }: PageProps) {
  const { id } = await params;

  // Let ProductDetailClient dynamically resolve both static catalog and local store products
  return <ProductDetailClient productId={id} />;
}

export default function ProductPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProductContent params={params} />
    </Suspense>
  );
}
