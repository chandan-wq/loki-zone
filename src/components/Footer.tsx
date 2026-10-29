"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, CheckCircle2, MapPin, Phone, ShieldCheck } from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";

export default function Footer() {
  const { storeSettings } = useAdminStore();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="bg-slate-950 text-white border-t border-gray-900 pt-12 sm:pt-16 pb-10 sm:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Signup Row */}
        <div className="pb-8 sm:pb-12 mb-8 sm:mb-12 border-b border-gray-800/80 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          <div className="lg:col-span-6">
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
              LOKI CLUB INSIDER
            </span>
            <h3 className="text-xl sm:text-3xl font-extrabold text-white mt-1">
              Get 10% Off Your First Order
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              Join thousands of players across Nepal. Receive exclusive tournament tips, equipment drops, and VIP flash discounts.
            </p>
          </div>
          <div className="lg:col-span-6">
            {subscribed ? (
              <div className="flex items-center gap-2 p-4 bg-emerald-950/60 border border-emerald-800/60 rounded-2xl text-emerald-300 text-sm font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>Thank you for subscribing! Your 10% coupon code is <strong>LOKI10</strong>.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="w-full bg-gray-900/90 border border-gray-800 text-xs sm:text-sm text-white pl-12 pr-4 py-3 sm:py-3.5 rounded-full focus:outline-none focus:border-red-500 transition"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 sm:px-7 py-3 sm:py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold rounded-full transition shadow-lg shadow-red-600/30"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* 4 Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-10 pb-8 sm:pb-12 border-b border-gray-800/80">
          {/* Col 1: Brand Info */}
          <div className="col-span-2 lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl p-1.5 flex items-center justify-center shadow-md">
                <Image
                  src="/images/loki-logo.png"
                  alt="LOKI"
                  width={34}
                  height={34}
                  className="object-contain invert"
                />
              </div>
              <div>
                <span className="font-black text-xl tracking-tight text-white">
                  {storeSettings.storeName || "LOKI ZONE"}
                </span>
                <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                  Official Table Tennis Store
                </span>
              </div>
            </Link>
            <p className="text-sm sm:text-xs text-gray-400 leading-relaxed max-w-sm">
              Nepal&apos;s premier destination for genuine tournament-grade table tennis blades, rubbers, apparel, balls, and accessories. Play better. Be stronger.
            </p>
            <div className="space-y-2 text-sm sm:text-xs text-gray-400 pt-1 sm:pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>Kathmandu &amp; Lalitpur, Nepal</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{storeSettings.supportPhone || "+977 9841-000000"} / Support Line</span>
              </div>
            </div>
          </div>

          {/* Col 2: Equipment & Shop */}
          <div>
            <h4 className="text-sm sm:text-xs font-bold uppercase tracking-widest text-white mb-4">
              Equipment
            </h4>
            <ul className="space-y-3 sm:space-y-2.5 text-sm sm:text-xs text-gray-400">
              <li>
                <Link href="/category/rackets" className="hover:text-red-400 transition">
                  Carbon Rackets
                </Link>
              </li>
              <li>
                <Link href="/category/rackets?type=rubber" className="hover:text-red-400 transition">
                  High-Grip Rubbers
                </Link>
              </li>
              <li>
                <Link href="/category/accessories?type=balls" className="hover:text-red-400 transition">
                  ITTF 3-Star Balls
                </Link>
              </li>
              <li>
                <Link href="/category/apparel" className="hover:text-red-400 transition">
                  Match Jerseys &amp; Shorts
                </Link>
              </li>
              <li>
                <Link href="/category/footwear" className="hover:text-red-400 transition">
                  Swift Grip Court Shoes
                </Link>
              </li>
              <li>
                <Link href="/category/accessories?type=cases" className="hover:text-red-400 transition">
                  Hard-Shell Cases
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div>
            <h4 className="text-sm sm:text-xs font-bold uppercase tracking-widest text-white mb-4">
              Customer Care
            </h4>
            <ul className="space-y-3 sm:space-y-2.5 text-sm sm:text-xs text-gray-400">
              <li>
                <Link href="/faq" className="hover:text-red-400 transition">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-red-400 transition">
                  Shipping &amp; Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-red-400 transition">
                  Returns &amp; 7-Day Refund
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-red-400 transition">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/order-tracking" className="hover:text-red-400 transition">
                  Track Your Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Company & Legal */}
          <div>
            <h4 className="text-sm sm:text-xs font-bold uppercase tracking-widest text-white mb-4">
              About &amp; Trust
            </h4>
            <ul className="space-y-3 sm:space-y-2.5 text-sm sm:text-xs text-gray-400">
              <li>
                <Link href="/about" className="hover:text-red-400 transition">
                  About LOKI Brand
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-red-400 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-red-400 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-red-400 transition">
                  My Wishlist
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-red-400 transition">
                  Shopping Bag
                </Link>
              </li>
              <li>
                <Link href="/order-tracking" className="hover:text-red-400 transition">
                  Track Your Order
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Payment Badges */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-gray-400">
          <p>© 2026 LOKI Table Tennis Store. All rights reserved.</p>

          {/* Payment Providers in Nepal */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-400 mr-2">Payment Methods:</span>
            <span className="px-2.5 py-1 bg-gray-900 border border-gray-800 rounded font-bold text-xs text-emerald-400">
              eSewa
            </span>
            <span className="px-2.5 py-1 bg-gray-900 border border-gray-800 rounded font-bold text-xs text-purple-400">
              Khalti
            </span>
            <span className="px-2.5 py-1 bg-gray-900 border border-gray-800 rounded font-bold text-xs text-red-400">
              Fonepay
            </span>
            <span className="px-2.5 py-1 bg-gray-900 border border-gray-800 rounded font-semibold text-xs text-gray-200">
              Visa / Card
            </span>
            <span className="px-2.5 py-1 bg-gray-900 border border-gray-800 rounded font-semibold text-xs text-amber-400">
              Cash on Delivery
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
