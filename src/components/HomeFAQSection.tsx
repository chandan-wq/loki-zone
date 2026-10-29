"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle, Phone, ArrowRight } from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function HomeFAQSection() {
  const { faqs, storeSettings } = useAdminStore();
  const [openId, setOpenId] = useState<string>("FAQ-001");
  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.1 });

  const displayFaqs = faqs && faqs.length > 0 ? faqs : [];

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? "" : id);
  };

  return (
    <section
      ref={sectionRef}
      className="py-14 sm:py-28 bg-white text-gray-900 border-b border-gray-100 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          {/* Left Column: Context & Support Card */}
          <div
            className={`lg:col-span-5 space-y-6 lg:sticky lg:top-28 transition-all duration-700 ease-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200/60 text-red-600 text-xs font-mono font-bold uppercase tracking-widest">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-950 leading-[1.08]">
              Got Questions? <br />
              <span className="text-red-600">We Have Answers.</span>
            </h2>

            <p className="text-xs sm:text-base text-gray-600 font-medium leading-relaxed">
              Find instant answers regarding nationwide express shipping, genuine ITTF authentication, cash on delivery, and customized blade assembly.
            </p>

            {/* Direct Contact Card */}
            <div className="p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-gray-50 border border-gray-200/80 shadow-sm space-y-3.5 sm:space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold shadow-md shadow-red-600/20 flex-shrink-0">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-gray-950">
                    Need Personalized Gear Advice?
                  </h4>
                  <span className="text-xs text-gray-500">
                    Talk to our club specialists in Kathmandu
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                Unsure if you need an offensive carbon blade or an all-round rubber sheet? Our coaches are ready to help.
              </p>

              <div className="pt-2 flex flex-wrap gap-2 sm:gap-2.5">
                <a
                  href={`tel:${storeSettings?.supportPhone || "+9779841000000"}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition shadow-sm active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {storeSettings?.supportPhone || "+977 9841-000000"}</span>
                </a>

                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-800 rounded-full text-xs font-bold border border-gray-200 transition active:scale-95"
                >
                  <span>Flagship Center</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Accordion List with Staggered Entrance */}
          <div className="lg:col-span-7 space-y-3">
            {displayFaqs.map((faq, idx) => {
              const isOpen = openId === faq.id;

              return (
                <div
                  key={faq.id}
                  style={{
                    transitionDelay: `${idx * 60 + 100}ms`,
                  }}
                  className={`rounded-xl sm:rounded-2xl border transition-all duration-500 ease-out overflow-hidden ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  } ${
                    isOpen
                      ? "bg-white border-red-500/50 shadow-md ring-1 ring-red-500/20"
                      : "bg-gray-50/70 border-gray-200/80 hover:border-gray-300 hover:bg-white"
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full p-4 sm:p-6 text-left flex items-center justify-between gap-3 sm:gap-4 cursor-pointer focus:outline-none"
                  >
                    <span className="font-extrabold text-sm sm:text-base text-gray-950 leading-snug">
                      {faq.question}
                    </span>

                    <span
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${
                        isOpen ? "bg-red-50 text-red-600 rotate-180" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </span>
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-4 pb-4 sm:px-6 sm:pb-6 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
