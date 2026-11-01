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
  title: "LOKI ZONE | Official Table Tennis Gear & Equipment",
  description:
    "Official LOKI table tennis store. Explore tournament-approved rackets, high-spin rubber blades, apparel, shoes, and ITTF balls. Free delivery over NPR 2,000.",
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