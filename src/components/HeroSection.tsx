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
} from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";

export default function HeroSection() {
  const { heroSlides, setHeroSlides } = useAdminStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Sync latest live slides from database
  useEffect(() => {
    fetch("/api/hero")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.slides) && data.slides.length > 0) {
          setHeroSlides(data.slides);
        }
      })
      .catch(() => {});
  }, [setHeroSlides]);

  // One-time cleanup for stale local cache if corrupted
  useEffect(() => {
    try {
      const stored = localStorage.getItem('loki_admin_store_v4');
      if (stored && stored.includes('file://')) {
        localStorage.removeItem('loki_admin_store_v4');
      }
    } catch {
      // ignore
    }
  }, []);

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
                quality={75}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1920px"
                className="object-cover object-center select-none"
              />
            </div>
          ))}

          {/* Soft Gradient Scrim: Crisp contrast for text while keeping table, gear & players fully visible */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent lg:w-[52%] z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/30 to-transparent lg:hidden z-10 pointer-events-none" />
        </div>

        {/* Content Container */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Main Text Content: Clean, Sharp Sports Typography */}
            <div className="lg:col-span-8 xl:col-span-7 space-y-6">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/95 border border-slate-200 shadow-xs backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-red-600 fill-red-600" />
                <span className="text-[11px] font-bold tracking-[0.22em] text-slate-800 uppercase font-mono">
                  {slide.eyebrow}
                </span>
              </div>

              {/* Massive Impact Title: Razor-Sharp Modern Sports Typography */}
              <div className="space-y-1 sm:space-y-2">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.25rem] font-black text-slate-950 tracking-tight leading-[1.0] uppercase">
                  {slide.titleLine1}
                </h1>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.25rem] font-black text-red-600 tracking-tight leading-[1.0] uppercase">
                  {slide.titleLine2}
                </h2>
              </div>

              {/* Subtitle */}
              <p className="text-sm sm:text-base lg:text-lg text-slate-700 max-w-xl font-normal leading-relaxed">
                {slide.description}
              </p>

              {/* CTA Button & Interactive Badge */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <Link
                  href={slide.ctaLink}
                  className="inline-flex items-center gap-3 px-8 py-3.5 bg-slate-950 hover:bg-red-600 text-white rounded-full font-bold text-sm tracking-wide shadow-xl shadow-black/15 hover:shadow-red-600/30 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 uppercase"
                >
                  <span>{slide.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200/90 shadow-xs">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{slide.featuredBadge}</span>
                </div>
              </div>

              {/* Slider Pagination Controls */}
              <div className="pt-4 flex items-center gap-3">
                <button
                  onClick={handlePrev}
                  aria-label="Previous slide"
                  className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:border-black flex items-center justify-center text-slate-700 hover:text-black transition shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
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
                      className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                        currentSlide === idx
                          ? "w-8 bg-red-600 shadow-md shadow-red-600/40"
                          : "w-2.5 bg-slate-300 hover:bg-slate-400"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  aria-label="Next slide"
                  className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:border-black flex items-center justify-center text-slate-700 hover:text-black transition shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <span className="text-[11px] font-mono font-medium text-slate-500 pl-2">
                  0{currentSlide + 1} / 0{slides.length}
                </span>
              </div>
            </div>

            {/* Right Side: Artwork breathing area */}
            <div className="hidden lg:block lg:col-span-4 xl:col-span-5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Bottom Features / Trust Bar */}
      <div className="relative z-20 bg-white border-t border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-0 lg:divide-x lg:divide-slate-100">
            <div className="flex items-center gap-3 sm:gap-4 lg:px-6 first:lg:pl-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0 text-red-600 shadow-inner">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-950 uppercase tracking-tight">
                  Free Shipping
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-medium">
                  Over NPR 2,000
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 lg:px-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0 text-red-600 shadow-inner">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-950 uppercase tracking-tight">
                  Secure Payment
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-medium">
                  100% Safe &amp; COD
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 lg:px-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0 text-red-600 shadow-inner">
                <Headphones className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-950 uppercase tracking-tight">
                  24/7 Support
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-medium">
                  WhatsApp &amp; Call
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 lg:px-6 last:lg:pr-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0 text-red-600 shadow-inner">
                <Award className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-950 uppercase tracking-tight">
                  Trusted by Players
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-medium">
                  ITTF Certified
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
