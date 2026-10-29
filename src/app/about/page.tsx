import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Award, ShieldCheck, Zap, Globe, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
            THE LOKI HERITAGE
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-950 tracking-tight">
            Engineered for Precision. Born for Champions.
          </h1>
          <p className="text-base text-gray-600 leading-relaxed">
            LOKI is a world-class table tennis equipment brand trusted by international competitors, national team players, and passionate club athletes worldwide.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-video lg:aspect-square rounded-3xl overflow-hidden shadow-2xl bg-gray-900 border border-gray-100">
            <Image
              src="/images/hero-bg.jpg"
              alt="LOKI Table Tennis"
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-gray-950">
              Championship Grade Table Tennis Technology
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Every LOKI blade, rubber sheet, and competition ball is designed with aerospace precision engineering. Through rigorous aerodynamic wind-tunnel testing and high-speed spin diagnostics, our gear empowers players to execute aggressive topspin loops with unrivaled control.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              In Nepal, LOKI Zone is the authorized flagship distributor, bringing 100% genuine ITTF-approved equipment directly to local academies, national clubs, and aspiring youth players.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-2xl font-black text-red-600 block">ITTF</span>
                <span className="text-xs font-bold text-gray-800">Officially Approved</span>
                <span className="text-[11px] text-gray-500 block">Competition standard</span>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-2xl font-black text-red-600 block">10,000+</span>
                <span className="text-xs font-bold text-gray-800">Players Served</span>
                <span className="text-[11px] text-gray-500 block">Across Nepal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="pt-12 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
              <Award className="w-6 h-6 text-red-600" />
              <h3 className="font-bold text-base text-gray-900">Olympic Pedigree</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Co-developed with world champions Wang Hao and Olympic coaching legends for uncompromising tournament play.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
              <ShieldCheck className="w-6 h-6 text-red-600" />
              <h3 className="font-bold text-base text-gray-900">100% Genuine Guarantee</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Every racket comes with verifiable serial numbers and authentic manufacturer warranty seal.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
              <Globe className="w-6 h-6 text-red-600" />
              <h3 className="font-bold text-base text-gray-900">Nationwide Delivery</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Direct insured shipping to Kathmandu, Pokhara, Chitwan, Biratnagar, and every corner of Nepal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
