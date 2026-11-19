import { ClerkProvider } from "@clerk/nextjs";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Lazy-load off-screen interactive widgets to maximize initial page open speed
const CartDrawer = dynamic(() => import("@/components/CartDrawer"));
const LokiAIAgent = dynamic(() => import("@/components/LokiAIAgent"));

// Font constants disabled for offline build
// const jakarta = { variable: "" };

// Font constants disabled for offline build
// const montserrat = { variable: "" };

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://loki-zone.vercel.app"
  ),
  title: {
    default: "LOKI ZONE | Official Table Tennis Gear & Equipment Nepal",
    template: "%s | LOKI ZONE Nepal",
  },
  description:
    "Official LOKI table tennis store in Nepal. Buy ITTF-approved tournament rackets, carbon blades, high-tension rubbers, match apparel, court shoes, and 3-star balls with cash on delivery across Nepal.",
  keywords: [
    "table tennis Nepal",
    "LOKI table tennis Nepal",
    "TT racket Nepal",
    "table tennis bat price in Nepal",
    "buy table tennis racket Kathmandu",
    "table tennis rubber price Nepal",
    "ping pong gear Kathmandu",
    "ITTF approved balls Nepal",
    "custom combo table tennis racket",
    "LOKI dragon series",
    "Ritiz TT Goods Nepal",
    "online sports store Nepal",
  ],
  authors: [{ name: "LOKI ZONE Nepal", url: "https://loki-zone.vercel.app" }],
  creator: "LOKI ZONE Nepal",
  publisher: "LOKI ZONE Nepal",
  alternates: {
    canonical: "https://loki-zone.vercel.app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_NP",
    url: "https://loki-zone.vercel.app",
    siteName: "LOKI ZONE Nepal",
    title: "LOKI ZONE | Official Table Tennis Gear & Equipment Nepal",
    description:
      "Official LOKI table tennis store in Nepal. ITTF tournament rackets, carbon blades, apparel, shoes, and custom combo builder.",
    images: [
      {
        url: "/images/hero-bg.jpg",
        width: 1200,
        height: 630,
        alt: "LOKI ZONE Nepal Table Tennis Equipment",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LOKI ZONE | Official Table Tennis Gear & Equipment Nepal",
    description:
      "Official LOKI table tennis store in Nepal. ITTF tournament rackets, carbon blades, rubbers, and gear.",
    images: ["/images/hero-bg.jpg"],
  },
};

const storeSchemaJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SportingGoodsStore",
      "@id": "https://loki-zone.vercel.app/#store",
      name: "LOKI ZONE Nepal",
      url: "https://loki-zone.vercel.app",
      logo: "https://loki-zone.vercel.app/images/loki-logo.png",
      image: "https://loki-zone.vercel.app/images/hero-bg.jpg",
      description:
        "Official LOKI Table Tennis Store Nepal. High-performance ITTF-approved tournament rackets, carbon blades, rubbers, and custom combos.",
      telephone: "+977-9800000000",
      priceRange: "NPR 1,200 - NPR 18,500",
      currenciesAccepted: "NPR",
      paymentAccepted: "Cash on Delivery, eSewa, Khalti, Fonepay",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Kathmandu Central Hub",
        addressLocality: "Kathmandu",
        addressRegion: "Bagmati",
        postalCode: "44600",
        addressCountry: "NP",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://loki-zone.vercel.app/#website",
      url: "https://loki-zone.vercel.app",
      name: "LOKI ZONE Nepal",
      description: "Official Table Tennis Equipment Store Nepal",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://loki-zone.vercel.app/category/all?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://img.clerk.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://img.clerk.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchemaJsonLd) }}
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-white text-gray-900 selection:bg-red-600 selection:text-white font-sans"
        suppressHydrationWarning
      >
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          signInUrl="/login"
          signUpUrl="/register"
          signInFallbackRedirectUrl="/"
          signUpFallbackRedirectUrl="/"
        >
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <Suspense fallback={null}>
            <LokiAIAgent />
          </Suspense>
        </ClerkProvider>
      </body>
    </html>
  );
}