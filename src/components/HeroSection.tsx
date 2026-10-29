"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Truck,
  ShieldCheck,
  Headphones,
  Award,
  Sparkles,
  Zap,
  Sliders,
} from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";

export default function HeroSection() {
  // Clear persisted admin store to avoid stale `file://` URLs that cause Next.js image errors
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('loki_admin_store_v4');
    } catch (e) {
      // ignore any storage errors
    }
  }
  const { heroSlides, floatingPills } = useAdminStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("racket");
  const [isPaused, setIsPaused] = useState(false);

  // Safe fallback if slides array changes
  const slides = heroSlides && heroSlides.length > 0 ? heroSlides : [];
  const slide = slides[currentSlide] || slides[0];

  // Auto-advance slides every 6 seconds if not hovered
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev >= slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev >= slides.length - 1 ? 0 : prev + 1));
  };

  if (!slide) return null;

  return (
    <section
      className="relative w-full bg-[#f6f9fc] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Hero Visual Area */}
      <div className="relative min-h-[540px] sm:min-h-[600px] lg:min-h-[680px] xl:min-h-[720px] flex items-center">
        {/* Background Artwork with Smooth Cross-Fade Transitions */}
        <div className="absolute inset-0 z-0">
          {slides.map((s, idx) => (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                currentSlide === idx ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <Image
                src={s.bgImage?.startsWith('file://') ? '/images/hero-bg.jpg' : s.bgImage}
                alt={`${s.titleLine1} ${s.titleLine2}`}
                fill
                priority={idx === 0}
                quality={100}
                sizes="100vw"
                className="object-cover object-center select-none"
              />
            </div>
          ))}

          {/* Minimal Soft Gradient Scrim: Only softens the far left text area, keeping 100% of the gear, table & action visible */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/75 via-white/30 to-transparent lg:w-[40%] z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/75 via-white/20 to-transparent lg:hidden z-10 pointer-events-none" />
        </div>

        {/* Content Container */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Eyebrow, Massive Title, Description & CTA */}
            <div className="lg:col-span-5 xl:col-span-5 space-y-6">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/95 border border-gray-200/90 shadow-sm backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-red-600 fill-red-600" />
                <span className="text-[11px] font-extrabold tracking-[0.2em] text-gray-800 uppercase">
                  {slide.eyebrow}
                </span>
              </div>

              {/* Massive Impact Title with Perfect Gradient Clipping */}
              <div className="space-y-1">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-950 tracking-tighter leading-[0.92]">
                  {slide.titleLine1}
                </h1>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[0.95] italic">
                  <span
                    style={{
                      background: slide.gradient,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      display: "inline-block",
                    }}
                  >
                    {slide.titleLine2}
                  </span>
                </h2>
              </div>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-gray-700 max-w-md font-medium leading-relaxed drop-shadow-xs">
                {slide.description}
              </p>

              {/* CTA Button & Interactive Badge */}
              <div className="pt-1 flex flex-wrap items-center gap-3">
                <Link
                  href={slide.ctaLink}
                  className="inline-flex items-center gap-3 px-7 py-3.5 bg-gray-950 hover:bg-red-600 text-white rounded-full font-bold text-sm shadow-xl shadow-black/15 hover:shadow-red-600/30 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>{slide.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold text-gray-700 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-full border border-gray-200/80 shadow-xs">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{slide.featuredBadge}</span>
                </div>
              </div>

              {/* Slider Pagination Controls */}
              <div className="pt-4 flex items-center gap-3">
                <button
                  onClick={handlePrev}
                  aria-label="Previous slide"
                  className="w-9 h-9 rounded-full bg-white border border-gray-200 hover:border-black flex items-center justify-center text-gray-700 hover:text-black transition shadow-sm hover:scale-105 active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Indicators */}
                <div className="flex items-center gap-2">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`h-2 rounded-full transition-all duration-500 ${
                        currentSlide === idx
                          ? "w-8 bg-red-600 shadow-md shadow-red-600/40"
                          : "w-2.5 bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  aria-label="Next slide"
                  className="w-9 h-9 rounded-full bg-white border border-gray-200 hover:border-black flex items-center justify-center text-gray-700 hover:text-black transition shadow-sm hover:scale-105 active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <span className="text-[11px] font-mono text-gray-400 pl-2">
                  0{currentSlide + 1} / 0{slides.length}
                </span>
              </div>
            </div>

            {/* Open Center Spacer: Leaves entire center wide open for the artwork */}
            <div className="hidden lg:block lg:col-span-5 xl:col-span-5 pointer-events-none" />

            {/* Right Column: Floating Category Cards Strip */}
            <div className="lg:col-span-2 xl:col-span-2 flex lg:justify-end">
              <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 w-full sm:w-auto">
                {floatingPills.map((item) => {
                  const isActive = selectedCategory === item.id;
                  return (
                    <Link
                      key={item.id}
                      href={item.link}
                      onClick={() => setSelectedCategory(item.id)}
                      className={`group relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl transition-all duration-300 min-w-[80px] sm:min-w-[88px] text-center ${
                        isActive
                          ? "border-2 border-red-500 shadow-red-500/30 scale-105 ring-2 ring-red-500/20"
                          : "border border-white/80 hover:border-gray-300 hover:scale-102 hover:shadow-2xl"
                      }`}
                    >
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden mb-1 flex items-center justify-center bg-gray-50/50">
                        <Image
                          src={item.image}
                          alt={item.label}
                          fill
                          sizes="(max-width: 640px) 56px, 64px"
                          className="object-contain p-1 group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          isActive
                            ? "text-red-600"
                            : "text-gray-800 group-hover:text-black"
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Features / Trust Bar */}
      <div className="relative z-20 bg-white border-t border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-gray-100">
            <div className="flex items-center gap-4 lg:px-6 first:lg:pl-0">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0 text-red-600 shadow-inner">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-950 leading-tight">
                  Free Shipping
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  On orders over NPR 2,000
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 lg:px-6">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0 text-red-600 shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-950 leading-tight">
                  Secure Payment
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  100% safe &amp; encrypted
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 lg:px-6">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0 text-red-600 shadow-inner">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-950 leading-tight">
                  24/7 Support
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  We&apos;re here to help
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 lg:px-6 last:lg:pr-0">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0 text-red-600 shadow-inner">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-950 leading-tight">
                  Trusted by Players
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Quality gear for better play
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
