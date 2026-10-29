import React from "react";
import { RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";

export default function ReturnsPolicyPage() {
  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
        <div>
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
            BUY WITH CONFIDENCE
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight mt-1">
            Returns &amp; 7-Day Refund Policy
          </h1>
          <p className="text-xs text-gray-500 mt-2">
            Hassle-free equipment returns and swift exchange process.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-red-50/50 border border-red-100 flex items-start gap-4">
          <RotateCcw className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-gray-950">7 Days Return Guarantee</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              If your racket or gear does not match your expectations or exhibits any manufacturing defect, you can request an exchange or 100% refund within 7 days of receiving your package.
            </p>
          </div>
        </div>

        <div className="space-y-6 text-xs text-gray-600 leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-gray-950">1. Eligibility Criteria for Returns</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Item must be unused with factory protective film intact on racket rubbers.</li>
              <li>Original branded packaging, tags, and authenticity certificate must be included.</li>
              <li>Apparel and shoes must be unworn with original tags attached.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-gray-950">2. Refund Timeline</h3>
            <p>
              Once your returned gear is received and inspected at our Kathmandu facility, digital wallet refunds (eSewa / Khalti / Bank transfer) are credited within 24 to 48 hours.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-gray-950">3. How to Initiate a Return</h3>
            <p>
              Simply contact our WhatsApp support line at <strong>+977 9800000000</strong> with your Order Number and photo proof, and our courier rider will schedule a doorstep pickup.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
