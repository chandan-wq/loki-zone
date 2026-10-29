"use client";

import React from "react";
import { Star, CheckCircle2, Award } from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function PlayerReviewsSection() {
  const { reviews } = useAdminStore();
  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.1 });

  const displayReviews = reviews && reviews.length > 0 ? reviews : [];

  return (
    <section
      ref={sectionRef}
      className="py-14 sm:py-28 bg-[#f8fafc] text-gray-900 border-b border-gray-100 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Scroll Reveal */}
        <div
          className={`flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-14 transition-all duration-700 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200/60 text-red-600 text-xs font-mono font-bold uppercase tracking-widest mb-3">
              <Award className="w-3.5 h-3.5" />
              <span>VERIFIED PLAYER ENDORSEMENTS</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-950">
              Trusted by Champions <span className="text-red-600">Across Nepal</span>
            </h2>
            <p className="text-xs sm:text-base text-gray-600 mt-2 max-w-xl font-medium leading-relaxed">
              From Kathmandu national league contenders to academy coaches in Pokhara, hear firsthand how LOKI gear elevates performance.
            </p>
          </div>

          {/* Social Proof Metric Badge */}
          <div className="flex items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-sm self-start md:self-end">
            <div className="flex flex-col items-center justify-center pr-3 sm:pr-4 border-r border-gray-100">
              <span className="text-xl sm:text-2xl font-black text-gray-950">4.9</span>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-amber-400" />
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs font-bold text-gray-950 block">
                240+ Match Tested
              </span>
              <span className="text-[10px] sm:text-[11px] text-gray-500 block">
                Official Club Players &amp; Coaches
              </span>
            </div>
          </div>
        </div>

        {/* Reviews Grid with Staggered Entrance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {displayReviews.map((rev, idx) => (
            <div
              key={rev.id}
              style={{
                transitionDelay: `${idx * 75}ms`,
              }}
              className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-gray-200/80 hover:border-red-500/40 shadow-sm hover:shadow-xl transition-all duration-500 ease-out flex flex-col justify-between group hover:-translate-y-1.5 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <div>
                {/* Rating & Verified Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>

                  {rev.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified Player</span>
                    </span>
                  )}
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic mb-6">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h4 className="font-extrabold text-sm text-gray-950 group-hover:text-red-600 transition">
                  {rev.playerName}
                </h4>
                <span className="text-[11px] font-medium text-gray-500 block">
                  {rev.roleOrClub}
                </span>

                {rev.equipment && (
                  <div className="mt-3 inline-block">
                    <span className="text-[10px] font-mono font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200 block">
                      Gear: {rev.equipment}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
