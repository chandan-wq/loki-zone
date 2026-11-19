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
    title: `${product.name} | LOKI Nepal Official`,
    description: `${product.name} - NPR ${product.price.toLocaleString()}. ${product.subtitle || ""}. ${product.description.slice(0, 150)}... Official ITTF Approved equipment available in Nepal.`,
    alternates: {
      canonical: `https://loki-zone.vercel.app/products/${product.id}`,
    },
    openGraph: {
      title: `${product.name} - NPR ${product.price.toLocaleString()} | LOKI Nepal`,
      description: product.description,
      url: `https://loki-zone.vercel.app/products/${product.id}`,
      siteName: "LOKI ZONE Nepal",
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
  const product = PRODUCTS.find((p) => p.id === id);

  const productJsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        image: `https://loki-zone.vercel.app${product.image}`,
        description: product.description,
        brand: {
          "@type": "Brand",
          name: product.brand || "LOKI",
        },
        offers: {
          "@type": "Offer",
          url: `https://loki-zone.vercel.app/products/${product.id}`,
          priceCurrency: "NPR",
          price: product.price,
          itemCondition: "https://schema.org/NewCondition",
          availability: "https://schema.org/InStock",
          seller: {
            "@type": "Organization",
            name: "LOKI ZONE Nepal",
          },
        },
      }
    : null;

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      <ProductDetailClient productId={id} />
    </>
  );
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
