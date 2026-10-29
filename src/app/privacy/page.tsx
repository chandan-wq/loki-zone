import React from "react";
import { Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div>
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
            DATA SECURITY &amp; TRUST
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight mt-1">
            Privacy Policy
          </h1>
          <p className="text-xs text-gray-500 mt-2">
            Effective: October 2026 • LOKI Zone Nepal
          </p>
        </div>

        <div className="space-y-6 text-xs text-gray-600 leading-relaxed">
          <p>
            At LOKI Zone, your privacy is paramount. This policy describes how we collect, use, and protect your personal data when ordering table tennis equipment through our website.
          </p>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-gray-950">1. Information We Collect</h3>
            <p>
              We collect your name, delivery address, phone number, and email address solely to process and deliver your sports gear orders and send shipping tracking notifications.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-gray-950">2. Payment Security</h3>
            <p>
              All online digital payments (eSewa, Khalti, Fonepay, Card) are processed via secure 256-bit encrypted gateways. We never store your bank pins or digital wallet credentials on our servers.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-gray-950">3. Non-Disclosure</h3>
            <p>
              We will never sell or rent your personal information to third-party advertisers. Data is shared exclusively with our courier delivery partners to fulfill your packages.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
