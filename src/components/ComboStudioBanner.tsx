"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Zap, ShieldCheck } from "lucide-react";

export default function ComboStudioBanner() {
  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-neutral-900 to-black text-white p-6 sm:p-10 lg:p-12 border border-slate-800 shadow-2xl">
          {/* Subtle Accent Glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>NEW • CUSTOM COMBO STUDIO</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Build Your Own Set. <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-400">
                  Save Up to 10% Automatically.
                </span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Select your competition blade, high-tension rubber sheets, apparel, and court shoes. Bundle 2 products for 5% off or 3+ products for 10% off with free delivery inside Nepal.
              </p>

              {/* Tier Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold">
                <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/15 text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-amber-400" /> 2 Items = 5% OFF
                </span>
                <span className="px-3 py-1 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-red-400" /> 3+ Items = 10% OFF
                </span>
                <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/15 text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Free Assembly &amp; Delivery
                </span>
              </div>
            </div>

            {/* CTA Action */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <Link
                href="/custom-combo"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-red-600 hover:bg-red-500 text-white rounded-full font-black text-sm tracking-wide transition shadow-lg shadow-red-600/30 active:scale-[0.98] group"
              >
                <span>Launch Combo Studio</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <span className="text-[11px] text-slate-400 text-center lg:text-left">
                ⚡ 3 easy clicks to build &amp; order
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
