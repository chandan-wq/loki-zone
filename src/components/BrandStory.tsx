"use client";

import React from "react";
import Image from "next/image";
import { ShieldCheck, Zap, Crosshair, Layers, Award, CheckCircle2 } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useAdminStore } from "@/store/useAdminStore";

const DEFAULT_PILLARS = [
  {
    icon: Layers,
    title: "Strong 5-Ply Carbon Blade",
    description:
      "High quality wood and carbon layers give you great control and high power on every shot.",
  },
  {
    icon: Zap,
    title: "Official ITTF Approved Rubber",
    description:
      "Sticky, high-elastic rubber surface helps you produce heavy spin and fast attacking loops.",
  },
  {
    icon: Crosshair,
    title: "Comfortable Non-Slip Handle",
    description:
      "Designed for a natural, comfortable grip so your hand does not get tired during long games.",
  },
  {
    icon: ShieldCheck,
    title: "Durable Edge Protection",
    description:
      "Strong edge tape and coating protect the racket from accidental bumps on the table.",
  },
];

export default function BrandStory() {
  const { brandStory } = useAdminStore();
  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.1 });

  const getIcon = (name: string) => {
    switch (name) {
      case "Zap":
        return Zap;
      case "Crosshair":
        return Crosshair;
      case "ShieldCheck":
        return ShieldCheck;
      default:
        return Layers;
    }
  };

  const pillars =
    brandStory?.pillars && brandStory.pillars.length > 0
      ? brandStory.pillars.map((p) => ({
          icon: getIcon(p.iconName),
          title: p.title,
          description: p.description,
        }))
      : DEFAULT_PILLARS;

  return (
    <section
      ref={sectionRef}
      className="py-14 sm:py-28 bg-[#070b13] text-white relative overflow-hidden border-b border-slate-800/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Left Column: Visual Showcase */}
          <div
            className={`lg:col-span-5 relative transition-all duration-700 ease-out ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-800 bg-[#0f172a] aspect-square shadow-2xl">
              <Image
                src={brandStory?.image || "/images/hero-bg.jpg"}
                alt="LOKI Table Tennis Precision Craftsmanship"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover opacity-85 hover:scale-105 transition-transform duration-700 select-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070b13] via-transparent to-transparent" />

              {/* Quality Seal */}
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#111723]/90 backdrop-blur-md border border-slate-700/80 shadow-2xl">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  </div>
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider block">
                      {brandStory?.statNumber || "2026 Collection"}
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-white block">
                      {brandStory?.statLabel || "ITTF Approved Tournament Standard"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative & 4 Pillars with Stagger */}
          <div
            className={`lg:col-span-7 space-y-6 sm:space-y-8 transition-all duration-700 delay-100 ease-out ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <div>
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-red-600/15 border border-red-500/30 text-red-400 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest mb-2.5 sm:mb-3">
                <ShieldCheck className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                <span>{brandStory?.eyebrow || "WHY CHOOSE LOKI"}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.1]">
                {brandStory?.title || "Professional Table Tennis Gear Built to Win"}
              </h2>
              <p className="text-xs sm:text-base text-slate-300 mt-2 sm:mt-4 leading-relaxed font-normal">
                {brandStory?.description ||
                  "LOKI makes top quality table tennis equipment trusted by players and clubs across Nepal. Every racket, rubber, and ball is made with premium materials for great speed, strong spin, and easy control."}
              </p>
            </div>

            {/* 4 Technical Pillars with Staggered Entrance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {pillars.map((pillar, idx) => {
                const IconComponent = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    style={{
                      transitionDelay: `${idx * 80 + 150}ms`,
                    }}
                    className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#111723] border border-slate-800 hover:border-slate-700 hover:-translate-y-1 transition-all duration-500 ease-out ${
                      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                    }`}
                  >
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-2.5 sm:mb-3">
                      <IconComponent className="w-4 h-4 text-red-500" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-white mb-1">
                      {pillar.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Authentic Brand Reassurances */}
            <div className="pt-3 sm:pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-3 sm:gap-6 text-[11px] sm:text-xs text-slate-300 font-medium">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                100% Genuine LOKI Imports
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Tournament Rubber ITTF Certified
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Hand-Tested Blade Balance
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
