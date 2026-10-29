"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Zap, Clock, ArrowRight, ShoppingBag } from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { useCartStore } from "@/store/useCartStore";

export default function OffersSection() {
  const { addItem } = useCartStore();

  // Simulated live countdown timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 36,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Flash deal product: LOKI Dragon 10
  const flashProduct = PRODUCTS[0];

  return (
    <section className="py-16 bg-gradient-to-br from-neutral-950 via-gray-900 to-black text-white overflow-hidden relative">
      {/* Background glow effects */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-gray-800 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/20 text-red-400 border border-red-500/30 rounded-full text-xs font-bold tracking-wider uppercase mb-3">
              <Zap className="w-3.5 h-3.5 fill-red-400" />
              <span>Flash Tournament Deals</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Limited Time Match Specials
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Hand-picked tournament gear at special introductory prices for club players.
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 bg-gray-900/80 border border-gray-800 px-4 py-2.5 rounded-2xl backdrop-blur-md">
            <Clock className="w-4 h-4 text-red-500" />
            <span className="text-xs font-medium text-gray-400 mr-2">Ends in:</span>
            <div className="flex items-center gap-1 font-mono text-sm font-bold">
              <span className="bg-black/60 px-2 py-1 rounded text-red-400">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-gray-600">:</span>
              <span className="bg-black/60 px-2 py-1 rounded text-red-400">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-gray-600">:</span>
              <span className="bg-black/60 px-2 py-1 rounded text-red-400">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>

        {/* Featured Deal Card */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-900/90 to-neutral-900 rounded-3xl p-6 sm:p-10 border border-gray-800 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-square max-h-[380px] w-full rounded-2xl bg-neutral-950 border border-gray-800 overflow-hidden group">
                <Image
                  src={flashProduct.image}
                  alt={flashProduct.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-red-600 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  22% OFF
                </div>
              </div>
            </div>

            {/* Product details */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
                  {flashProduct.series}
                </span>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
                  {flashProduct.name}
                </h3>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                  {flashProduct.description}
                </p>
              </div>

              {/* Specs pill badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-black/40 border border-gray-800 p-3 rounded-xl">
                  <span className="block text-[10px] text-gray-500 uppercase font-semibold">Blade</span>
                  <span className="text-xs font-bold text-gray-200">5-Ply Wood</span>
                </div>
                <div className="bg-black/40 border border-gray-800 p-3 rounded-xl">
                  <span className="block text-[10px] text-gray-500 uppercase font-semibold">Rubber</span>
                  <span className="text-xs font-bold text-gray-200">High-Grip</span>
                </div>
                <div className="bg-black/40 border border-gray-800 p-3 rounded-xl">
                  <span className="block text-[10px] text-gray-500 uppercase font-semibold">Control</span>
                  <span className="text-xs font-bold text-emerald-400">92 / 100</span>
                </div>
                <div className="bg-black/40 border border-gray-800 p-3 rounded-xl">
                  <span className="block text-[10px] text-gray-500 uppercase font-semibold">Spin</span>
                  <span className="text-xs font-bold text-blue-400">88 / 100</span>
                </div>
              </div>

              {/* Price & Action */}
              <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-gray-800">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-white">
                    NPR {flashProduct.price.toLocaleString()}
                  </span>
                  <span className="text-sm font-semibold text-gray-500 line-through">
                    NPR {flashProduct.originalPrice.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                    Save NPR {(flashProduct.originalPrice - flashProduct.price).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      addItem({
                        id: flashProduct.id,
                        name: flashProduct.name,
                        brand: flashProduct.brand,
                        price: flashProduct.price,
                        originalPrice: flashProduct.originalPrice,
                        image: flashProduct.image,
                        category: flashProduct.category,
                        selectedColor: "Red",
                        selectedHandle: "FL (Flared)",
                      })
                    }
                    className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-600/30 transition transform active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag</span>
                  </button>

                  <Link
                    href={`/products/${flashProduct.id}`}
                    className="px-5 py-3.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-full font-semibold text-sm flex items-center gap-2 transition"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
