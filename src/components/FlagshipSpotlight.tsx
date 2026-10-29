"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Check,
  ShieldCheck,
  Flame,
  Layers,
  Award,
  Zap,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function FlagshipSpotlight() {
  const { addItem } = useCartStore();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addItem({
      id: "loki-dragon-10",
      name: "LOKI Dragon 10 Carbon",
      brand: "LOKI",
      price: 2499,
      originalPrice: 3200,
      image: "/images/product-1-light.png",
      category: "Rackets",
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <section className="py-24 bg-gradient-to-b from-[#0b0f17] via-[#0f172a] to-[#0b0f17] text-white relative overflow-hidden border-b border-slate-800">
      {/* Background Lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-[#121824]/90 border border-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {/* Subtle Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left: Product Imagery with Interactive Hotspots */}
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-square max-w-lg mx-auto rounded-3xl bg-radial from-slate-800/40 to-transparent p-8 flex items-center justify-center">
                {/* Floating Paddle Image (Clean, uncropped) */}
                <div className="relative w-full h-full">
                  <Image
                    src="/images/product-1-light.png"
                    alt="LOKI Dragon 10 Carbon Racket"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-contain drop-shadow-[0_25px_35px_rgba(220,38,38,0.25)] select-none hover:scale-105 transition-transform duration-700"
                    priority
                  />
                </div>

                {/* Floating Callout Badges */}
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md border border-slate-700/80 rounded-2xl px-3.5 py-2 text-left shadow-xl hidden sm:block">
                  <span className="text-[10px] font-mono text-red-400 font-bold block uppercase tracking-wider">
                    Core Ply
                  </span>
                  <span className="text-xs font-bold text-white">5-Ply Alpine Wood</span>
                </div>

                <div className="absolute bottom-6 right-6 bg-black/80 backdrop-blur-md border border-slate-700/80 rounded-2xl px-3.5 py-2 text-left shadow-xl hidden sm:block">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold block uppercase tracking-wider">
                    ITTF Approved
                  </span>
                  <span className="text-xs font-bold text-white">High-Tension Rubber</span>
                </div>
              </div>
            </div>

            {/* Right: Technical Specification Story */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/15 border border-red-500/30 text-red-400 text-xs font-mono font-bold uppercase tracking-widest">
                <Flame className="w-3.5 h-3.5 text-red-500" />
                <span>FLAGSHIP INNOVATION</span>
              </div>

              <div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.05]">
                  LOKI DRAGON 10 <br />
                  <span className="text-red-500">CARBON PRO</span>
                </h2>
                <p className="text-base text-slate-300 mt-4 leading-relaxed font-normal">
                  Engineered in collaboration with national championship athletes. Crafted with a 5-ply alpine wood structure bonded to dual carbon micro-mesh layers for pinpoint looping accuracy and devastating topspin speed.
                </p>
              </div>

              {/* Performance Ratings Matrix */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                    Control
                  </span>
                  <span className="text-2xl font-black text-white mt-1 block">92</span>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full w-[92%]" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                    Spin
                  </span>
                  <span className="text-2xl font-black text-white mt-1 block">94</span>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full w-[94%]" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                    Speed
                  </span>
                  <span className="text-2xl font-black text-white mt-1 block">88</span>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full w-[88%]" />
                  </div>
                </div>
              </div>

              {/* Pricing & High-Conversion Action Bar */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-white">
                      Rs. 2,499
                    </span>
                    <span className="text-sm text-slate-500 line-through">
                      Rs. 3,200
                    </span>
                    <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md">
                      22% OFF
                    </span>
                  </div>
                  <span className="text-xs text-emerald-400 font-semibold mt-1 block">
                    ✓ In Stock • Fast Dispatch Across Nepal
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAddToCart}
                    className={`px-6 py-3.5 rounded-2xl font-bold text-sm transition flex items-center gap-2 cursor-pointer shadow-lg ${
                      isAdded
                        ? "bg-emerald-600 text-white"
                        : "bg-red-600 hover:bg-red-500 text-white shadow-red-600/30"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added to Bag</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add to Bag</span>
                      </>
                    )}
                  </button>

                  <Link
                    href="/products/loki-dragon-10"
                    className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    title="View Technical Details"
                  >
                    <ArrowRight className="w-5 h-5" />
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
