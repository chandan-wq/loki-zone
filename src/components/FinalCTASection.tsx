"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, RotateCcw, Award } from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function FinalCTASection() {
  const { ctaBanner } = useAdminStore();
  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.1 });

  if (!ctaBanner || ctaBanner.active === false) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="py-14 sm:py-24 bg-white border-b border-gray-100 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div
          className={`relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white p-6 sm:p-14 lg:p-20 overflow-hidden shadow-2xl border border-neutral-800 transition-all duration-700 ease-out ${
            isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-[0.98] translate-y-6"
          }`}
        >
          {/* Subtle Ambient Red Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-red-700/10 rounded-full blur-3xl pointer-events-none" />

          {/* Table Tennis Geometric Micro-Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-5 sm:space-y-6">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] sm:text-xs font-mono font-bold tracking-widest uppercase shadow-sm">
              <Zap className="w-3.5 h-3.5 text-red-500" />
              <span>{ctaBanner.eyebrow || "READY TO PLAY?"}</span>
            </div>

            {/* Headline */}
            <h2 className="text-2xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
              {ctaBanner.title || "Get The Best Table Tennis Gear in Nepal"}
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-base lg:text-lg text-neutral-300 max-w-2xl mx-auto font-medium leading-relaxed">
              {ctaBanner.subtitle ||
                "Free nationwide delivery on orders over NPR 2,000. 100% genuine ITTF approved products."}
            </p>

            {/* Action Buttons */}
            <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                href={ctaBanner.primaryBtnLink || "/category/all"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-full shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>{ctaBanner.primaryBtnText || "Shop All Products"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href={ctaBanner.secondaryBtnLink || "/contact"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 sm:py-4 bg-neutral-800/80 hover:bg-neutral-850 text-neutral-200 hover:text-white font-bold text-xs sm:text-sm rounded-full border border-neutral-700 hover:border-neutral-600 transition duration-200"
              >
                <span>{ctaBanner.secondaryBtnText || "Contact Us / WhatsApp"}</span>
              </Link>
            </div>

            {/* Value Guarantees Row */}
            <div className="pt-6 sm:pt-8 border-t border-neutral-800/80 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-left">
              <div className="flex items-center gap-2 sm:gap-2.5 text-neutral-300">
                <Zap className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-red-500 flex-shrink-0" />
                <span className="text-[11px] sm:text-xs font-semibold">Same-Day Dispatch</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-2.5 text-neutral-300">
                <ShieldCheck className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-[11px] sm:text-xs font-semibold">100% ITTF Certified</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-2.5 text-neutral-300">
                <RotateCcw className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-blue-400 flex-shrink-0" />
                <span className="text-[11px] sm:text-xs font-semibold">7-Day Replacement</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-2.5 text-neutral-300">
                <Award className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-400 flex-shrink-0" />
                <span className="text-[11px] sm:text-xs font-semibold">Official Nepal Dealer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
