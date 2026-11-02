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
    "Official LOKI table tennis store in Nepal. Explore ITTF-approved tournament rackets, carbon blades, high-tension rubbers, match apparel, court shoes, and 3-star balls. Free nationwide delivery over NPR 2,000.",
  keywords: [
    "table tennis Nepal",
    "LOKI table tennis",
    "TT racket Nepal",
    "table tennis rubber",
    "ping pong gear Kathmandu",
    "ITTF approved balls",
    "Ritiz TT Goods Nepal",
  ],
  authors: [{ name: "LOKI ZONE Nepal" }],
  openGraph: {
    type: "website",
    locale: "en_NP",
    url: "https://loki-zone.vercel.app",
    siteName: "LOKI ZONE Nepal",
    title: "LOKI ZONE | Official Table Tennis Gear & Equipment Nepal",
    description:
      "Official LOKI table tennis store in Nepal. ITTF tournament rackets, carbon blades, apparel, shoes, and accessories.",
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
      "Official LOKI table tennis store in Nepal. ITTF tournament rackets, carbon blades, and competition equipment.",
    images: ["/images/hero-bg.jpg"],
  },
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
      </head>
      <body
        className="min-h-full flex flex-col bg-white text-gray-900 selection:bg-red-600 selection:text-white font-sans"
        suppressHydrationWarning
      >
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_bWlnaHR5LWNhdC0yNzc4LmNsZXJrLmFjY291bnRzLmRldiQ"}
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