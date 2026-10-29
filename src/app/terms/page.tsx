import React from "react";

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div>
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
            LEGAL AGREEMENT
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight mt-1">
            Terms of Service
          </h1>
          <p className="text-xs text-gray-500 mt-2">
            Last modified: October 2026
          </p>
        </div>

        <div className="space-y-6 text-xs text-gray-600 leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-gray-950">1. Acceptance of Terms</h3>
            <p>
              By accessing and placing an order on LOKI Zone, you agree to comply with and be bound by the following terms and conditions.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-gray-950">2. Authenticity &amp; Product Representation</h3>
            <p>
              We guarantee that all LOKI branded items are 100% genuine and authorized. Specifications such as blade ply, rubber tackiness, and weight tolerances conform to international ITTF manufacturing guidelines.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-gray-950">3. Pricing &amp; Currency</h3>
            <p>
              All prices shown on the website are in Nepalese Rupees (NPR) and include applicable taxes. We reserve the right to correct typographical errors on promotions without prior notice.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
