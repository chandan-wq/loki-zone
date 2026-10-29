import { ClerkProvider } from "@clerk/nextjs";
import { Suspense } from "react";
import type { Metadata } from "next";
// Font imports disabled for offline build; using system defaults.
// import { Plus_Jakarta_Sans, Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import LokiAIAgent from "@/components/LokiAIAgent";

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