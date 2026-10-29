import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Truck, RotateCcw, Clock, ShieldCheck, CheckCircle2, Phone, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping & Returns Policy | LOKI ZONE Table Tennis Nepal",
  description:
    "Information regarding fast delivery across Nepal, free shipping over NPR 2,000, and our hassle-free 7-day replacement guarantee.",
};

export default function ShippingReturnsPage() {
  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
            LOGISTICS &amp; GUARANTEE
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-950 tracking-tight">
            Shipping &amp; Returns
          </h1>
          <p className="text-sm text-gray-600 max-w-xl mx-auto">
            Everything you need to know about deliveries across Nepal, free shipping thresholds, and our 7-day replacement policy.
          </p>
        </div>

        {/* Highlight Feature Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
            <Truck className="w-6 h-6 text-red-600" />
            <h3 className="font-bold text-sm text-gray-950">Free Delivery Over NPR 2,000</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Standard orders above NPR 2,000 qualify for 100% free nationwide express delivery.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
            <Clock className="w-6 h-6 text-red-600" />
            <h3 className="font-bold text-sm text-gray-950">24-48 Hours Fast Transit</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Same-day dispatch inside Kathmandu Valley; 1-2 business days across all 77 districts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
            <RotateCcw className="w-6 h-6 text-red-600" />
            <h3 className="font-bold text-sm text-gray-950">7-Day Hassle-Free Returns</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              100% replacement or refund on unopened gear with factory seal intact.
            </p>
          </div>
        </div>

        {/* Shipping Details */}
        <div className="p-8 rounded-3xl bg-gray-50/70 border border-gray-100 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <Truck className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-bold text-gray-950">1. Delivery Zones, Speeds &amp; Rates</h2>
          </div>
          <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
            <p>
              We maintain direct logistics partnerships across Nepal to ensure rapid, shock-protected transit for delicate tournament table tennis blades and rubber sheets.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white border border-gray-200 space-y-1">
                <span className="font-bold text-gray-900 block text-sm">Inside Kathmandu Valley</span>
                <span className="text-red-600 font-semibold block">NPR 100 (Free over NPR 2,000)</span>
                <span className="text-gray-500 text-[11px] block">
                  Delivered via direct rider within 24 hours of order confirmation.
                </span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-gray-200 space-y-1">
                <span className="font-bold text-gray-900 block text-sm">Outside Kathmandu Valley</span>
                <span className="text-red-600 font-semibold block">NPR 250 (Free over NPR 2,000)</span>
                <span className="text-gray-500 text-[11px] block">
                  Dispatched via Express Courier (Pokhara, Chitwan, Butwal, Biratnagar, Dharan, etc.) in 24-48 hours.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Returns & Replacement Policy */}
        <div className="p-8 rounded-3xl bg-gray-50/70 border border-gray-100 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <RotateCcw className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-bold text-gray-950">2. 7-Day Replacement &amp; Return Policy</h2>
          </div>
          <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
            <p>
              We want you to play with absolute confidence. If your gear arrives damaged, defective, or incorrect, you can request an immediate exchange or full refund within 7 calendar days.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Rubber Protective Film:</strong> Must remain intact. Rubbers with peeled factory protective sheets are non-returnable due to hygiene and ITTF certification standards.</li>
              <li><strong>Original Packaging:</strong> Racket box, tags, and authenticity certificate must be in clean condition.</li>
              <li><strong>Apparel &amp; Footwear:</strong> Items must be unworn with original tags attached.</li>
            </ul>
          </div>
        </div>

        {/* Return Coordination Callout */}
        <div className="p-6 rounded-2xl bg-slate-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-bold text-base">Need Assistance with a Delivery or Return?</h4>
            <p className="text-xs text-gray-400">
              Our customer service team is available Sunday through Friday, 9:00 AM – 7:30 PM.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/contact"
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full transition shadow-md"
            >
              Contact Support
            </Link>
            <Link
              href="/category/all"
              className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded-full transition"
            >
              Explore Gear
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
