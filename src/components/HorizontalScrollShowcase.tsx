"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Layers,
} from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";

/* =========================================================================
   7 FINALIZED CATEGORY COVERS (Image 1 Cover + 7 Custom Animation Videos)
   ========================================================================= */
export interface CategoryCoverItem {
  id: string;
  number: string; // 01, 02, 03...
  name: string;
  subtitle: string;
  href: string;
  image1: string; // Finalized custom category-cover image (1-7.webp)
  video: string; // Finalized custom animation video (1-7.mp4)
  orientation: "landscape" | "portrait"; // For adaptive 3:4 aspect management
  durationMs: number; // Duration of animation in milliseconds
  alt: string;
}

export const CATEGORY_ITEMS: CategoryCoverItem[] = [
  {
    id: "rackets",
    number: "01",
    name: "Table Tennis Rackets",
    subtitle: "Championship 5-Ply & Carbon Blades",
    href: "/category/rackets",
    image1: "/images/categories/1.webp",
    video: "/videos/categories/1.mp4",
    orientation: "landscape",
    durationMs: 4000,
    alt: "Table Tennis Rackets Category Cover",
  },
  {
    id: "rubbers-blades",
    number: "02",
    name: "Rubbers & Blades",
    subtitle: "High-Tension Tacky Sheets & Pro Blades",
    href: "/category/rackets",
    image1: "/images/categories/2.webp",
    video: "/videos/categories/2.mp4",
    orientation: "portrait",
    durationMs: 4000,
    alt: "Rubbers & Blades Category Cover",
  },
  {
    id: "balls-tables",
    number: "03",
    name: "Table Tennis Balls & Tables",
    subtitle: "40+ ABS Seamless Balls & Match Tables",
    href: "/category/balls",
    image1: "/images/categories/3.webp",
    video: "/videos/categories/3.mp4",
    orientation: "landscape",
    durationMs: 6500,
    alt: "Table Tennis Balls & Tables Category Cover",
  },
  {
    id: "sportswear",
    number: "04",
    name: "Sportswear",
    subtitle: "QuickDry Ergonomic Jerseys & Match Shorts",
    href: "/category/apparel",
    image1: "/images/categories/4.webp",
    video: "/videos/categories/4.mp4",
    orientation: "landscape",
    durationMs: 4000,
    alt: "Sportswear Category Cover",
  },
  {
    id: "sports-shoes",
    number: "05",
    name: "Sports Shoes",
    subtitle: "Non-Marking Honeycomb Court Grip Footwear",
    href: "/category/footwear",
    image1: "/images/categories/5.webp",
    video: "/videos/categories/5.mp4",
    orientation: "landscape",
    durationMs: 8000,
    alt: "Sports Shoes Category Cover",
  },
  {
    id: "tracksuits",
    number: "06",
    name: "Tracksuits & Training Wear",
    subtitle: "Warmup Outerwear & Athletic Clubwear",
    href: "/category/apparel",
    image1: "/images/categories/6.webp",
    video: "/videos/categories/6.mp4",
    orientation: "portrait",
    durationMs: 4000,
    alt: "Tracksuits & Training Wear Category Cover",
  },
  {
    id: "accessories",
    number: "07",
    name: "Bags & Accessories",
    subtitle: "Reinforced EVA Hardcases & Equipment Bags",
    href: "/category/accessories",
    image1: "/images/categories/7.webp",
    video: "/videos/categories/7.mp4",
    orientation: "portrait",
    durationMs: 4000,
    alt: "Bags & Accessories Category Cover",
  },
];

interface CategoryCardItemProps {
  item: CategoryCoverItem;
  index: number;
  currentIndex: number;
  totalCardsCount: number;
  isMobileSpotlight: boolean;
  isDesktopSpotlight: boolean;
  hasDragged: boolean;
  isTriggeredOnMobile: boolean;
  isMobile: boolean;
}

function CategoryCardItem({
  item,
  index,
  currentIndex,
  totalCardsCount,
  isMobileSpotlight,
  isDesktopSpotlight,
  hasDragged,
  isTriggeredOnMobile,
  isMobile,
}: CategoryCardItemProps) {
  const [isSwiped, setIsSwiped] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isPlayingRef = useRef(false);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startAnimation = useCallback(() => {
    setIsSwiped(true);
    isPlayingRef.current = true;

    if (videoRef.current) {
      try {
        videoRef.current.currentTime = 0;
      } catch {
        // Ignore seek error if not ready
      }
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }

    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    // Safety fallback: smoothly return card and pause video
    fallbackTimerRef.current = setTimeout(() => {
      setIsSwiped(false);
      isPlayingRef.current = false;
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }, item.durationMs + 600);
  }, [item.durationMs]);

  // When animation finishes playing to the end, smoothly swipe back
  const handleVideoEnded = useCallback(() => {
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    setIsSwiped(false);
    isPlayingRef.current = false;
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  // Mobile trigger: when user horizontally scrolls to this card or enters Section 2
  useEffect(() => {
    if (isMobile && isTriggeredOnMobile) {
      startAnimation();
    }
  }, [isMobile, isTriggeredOnMobile, startAnimation]);

  // Mobile reset: ONLY on mobile, if user scrolls away to another card while this card was swiped
  useEffect(() => {
    if (isMobile && !isMobileSpotlight && isSwiped) {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
      setIsSwiped(false);
      isPlayingRef.current = false;
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
  }, [isMobile, isMobileSpotlight, isSwiped]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, []);

  // PC Hover handler: mouse enters starts animation.
  // The card stays swiped open for the entire duration until the animation completes!
  const handleMouseEnter = () => {
    if (!isMobile && !isPlayingRef.current) {
      startAnimation();
    }
  };

  return (
    <Link
      href={item.href}
      onClick={(e) => {
        if (hasDragged) {
          e.preventDefault();
          return;
        }
        // On mobile, if not swiped yet, first tap smoothly triggers animation
        if (isMobile && !isSwiped) {
          e.preventDefault();
          startAnimation();
        }
      }}
      onMouseEnter={handleMouseEnter}
      className={`group flex-shrink-0 snap-center sm:snap-start w-[78vw] max-w-[285px] sm:w-[305px] md:w-[320px] lg:w-[330px] rounded-2xl sm:rounded-3xl bg-[#0c121e] border p-2 sm:p-2.5 transition-all duration-300 flex flex-col justify-between block select-none origin-bottom transform-gpu ${
        /* Mobile: 1 elevated, side cards cleanly dimmed without expensive GPU blurs */
        isMobileSpotlight
          ? "translate-y-0 scale-100 opacity-100 z-10 border-slate-700/90 shadow-2xl shadow-black/80 ring-1 ring-red-500/40"
          : "translate-y-1.5 scale-[0.96] opacity-65 z-0 border-slate-800/60 shadow-md"
      } ${
        /* Desktop (md+): 3 elevated, others dimmed */
        isDesktopSpotlight || isSwiped
          ? "md:translate-y-0 md:scale-100 md:opacity-100 md:z-10 md:border-slate-700/90 md:shadow-2xl md:ring-1 md:ring-red-500/30"
          : "md:translate-y-4 md:scale-[0.95] md:opacity-50 md:z-0 md:border-slate-800/60 md:shadow-md"
      } hover:opacity-100 hover:translate-y-0 hover:scale-100 hover:border-red-500/60`}
    >
      {/* 3:4 High-Resolution Artwork Container with Dual-Image/Video Swipe */}
      <div className="relative w-full aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-[#070b12]">
        {/* Layer 1: Category Cover (Slides left when swiped, slides back when animation ends) */}
        <div
          className={`absolute inset-0 bg-[#070b12] p-4 sm:p-5 flex items-center justify-center transition-transform duration-700 ease-out transform ${
            isSwiped ? "-translate-x-full" : "translate-x-0"
          }`}
        >
          <Image
            src={item.image1}
            alt={item.alt}
            fill
            sizes="(max-width: 640px) 280px, (max-width: 1024px) 320px, 340px"
            priority={index < 3}
            className="object-cover object-center select-none pointer-events-none group-hover:scale-[1.03] transition-transform duration-500"
          />
        </div>

        {/* Layer 2: Category Animation Video (Plays full animation, then slides back when finished) */}
        <div
          className={`absolute inset-0 bg-[#070b12] overflow-hidden transition-transform duration-700 ease-out transform ${
            isSwiped ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Main Crisp Animation Video with Seamless 3:4 Fit */}
          <div className="relative z-10 w-full h-full flex items-center justify-center bg-[#070b12]">
            <video
              ref={videoRef}
              src={item.video}
              muted
              playsInline
              preload="none"
              onEnded={handleVideoEnded}
              className="w-full h-full object-cover object-center pointer-events-none select-none"
            />
          </div>

          {/* Subtle Vignette Overlay for smooth cinematic framing */}
          <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-[#0c121e]/80 via-transparent to-[#0c121e]/30" />

          {/* Live Animation Pill */}
          <div className="absolute bottom-3 left-3 z-30 pointer-events-none flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[9px] font-mono font-bold text-red-400 uppercase tracking-wider shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>ANIMATION</span>
          </div>
        </div>

        {/* Subtle Top-Left Minimal Number */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <span className="text-[10px] font-mono font-bold text-white/90 bg-black/75 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
            {item.number}
          </span>
        </div>
      </div>

      {/* Card Footer: Category Title & Interactive Link */}
      <div className="p-3 sm:p-3.5 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-red-400 transition-colors duration-200 truncate">
            {item.name}
          </h3>
          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-medium">
            {item.subtitle}
          </p>

          {/* Animated Accent Line (Expands when swiped, retracts when animation ends) */}
          <div className="w-8 h-0.5 bg-slate-800 mt-2 rounded-full overflow-hidden">
            <div
              className={`w-full h-full bg-gradient-to-r from-red-600 to-rose-500 transform transition-transform duration-500 ease-out ${
                isSwiped ? "translate-x-0" : "-translate-x-full"
              }`}
            />
          </div>
        </div>

        <div
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-200 shadow-sm ${
            isSwiped
              ? "bg-red-600 border-red-500 text-white"
              : "bg-slate-900 border-slate-800 group-hover:bg-red-600 group-hover:border-red-500 text-slate-400 group-hover:text-white"
          }`}
        >
          <ArrowRight
            className={`w-3.5 h-3.5 transition-transform ${
              isSwiped ? "translate-x-0.5" : "group-hover:translate-x-0.5"
            }`}
          />
        </div>
      </div>
    </Link>
  );
}

export default function HorizontalScrollShowcase() {
  const { categorySection } = useAdminStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Mouse drag physics state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollLeft, setStartScrollLeft] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  // Navigation scroll state
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(1);
  const currentIndexRef = useRef(1);

  // Mobile Settle & Video Animation Controller
  const [mobileSwipedIndex, setMobileSwipedIndex] = useState<number | null>(null);
  const scrollSettleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingRafRef = useRef<number | null>(null);

  const totalCardsCount = CATEGORY_ITEMS.length;

  // 1. Mobile Auto-Animation for 1st card on calm entrance
  const hasTriggeredInitialMobileRef = useRef(false);
  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl || typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
          setIsVisible(true);
          if (!hasTriggeredInitialMobileRef.current && isMobile) {
            hasTriggeredInitialMobileRef.current = true;
            // Delay 600ms so user has comfortably stopped vertical scroll
            setTimeout(() => {
              setMobileSwipedIndex(0);
            }, 600);
          }
        }
      },
      {
        threshold: [0.15],
      }
    );

    observer.observe(sectionEl);
    return () => observer.disconnect();
  }, [isMobile]);

  // Sync scroll indicators & detect current card index
  const updateScrollState = useCallback(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = container;

    const maxScroll = scrollWidth - clientWidth;
    const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollLeft / maxScroll)) : 0;
    setScrollProgress(progress);

    // Get all card anchor elements
    const cards = Array.from(container.children).filter(
      (el) => (el as HTMLElement).tagName === "A"
    ) as HTMLElement[];

    let newIndex = 1;
    if (cards.length > 0) {
      if (maxScroll > 0 && scrollLeft >= maxScroll - 35) {
        newIndex = totalCardsCount;
      } else {
        const viewportCenter = scrollLeft + clientWidth / 2;
        let minDistance = Infinity;

        cards.forEach((card, idx) => {
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const distance = Math.abs(cardCenter - viewportCenter);
          if (distance < minDistance) {
            minDistance = distance;
            newIndex = idx + 1;
          }
        });
      }
    }

    currentIndexRef.current = newIndex;
    setCurrentIndex(newIndex);
    setCanScrollLeft(scrollLeft > 15 && newIndex > 1);
    setCanScrollRight(scrollLeft < maxScroll - 20 && newIndex < totalCardsCount);
  }, [totalCardsCount]);

  // High-performance RAF scroll handler with settle debounce for mobile
  const handleScroll = useCallback(() => {
    if (!isScrollingRafRef.current) {
      isScrollingRafRef.current = requestAnimationFrame(() => {
        updateScrollState();
        isScrollingRafRef.current = null;
      });
    }

    // Clear previous settle timer: NO video animation plays while actively scrolling!
    if (scrollSettleTimerRef.current) {
      clearTimeout(scrollSettleTimerRef.current);
    }

    // Trigger video animation ONLY when user has settled on a card for 450ms
    if (isMobile) {
      scrollSettleTimerRef.current = setTimeout(() => {
        setMobileSwipedIndex(currentIndexRef.current - 1);
      }, 450);
    }
  }, [isMobile, updateScrollState]);

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => {
      window.removeEventListener("resize", updateScrollState);
      if (scrollSettleTimerRef.current) clearTimeout(scrollSettleTimerRef.current);
      if (isScrollingRafRef.current) cancelAnimationFrame(isScrollingRafRef.current);
    };
  }, [updateScrollState]);

  // Smooth arrow scrolling that navigates card-by-card
  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const cards = Array.from(container.children).filter(
      (el) => (el as HTMLElement).tagName === "A"
    ) as HTMLElement[];

    let targetIdx = direction === "left" ? currentIndex - 1 : currentIndex + 1;
    targetIdx = Math.max(1, Math.min(totalCardsCount, targetIdx));

    const targetCard = cards[targetIdx - 1];
    if (targetCard) {
      if (targetIdx === 1) {
        container.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      } else {
        const targetScrollLeft =
          targetCard.offsetLeft - (container.clientWidth - targetCard.offsetWidth) / 2;

        container.scrollTo({
          left: Math.max(0, targetScrollLeft),
          behavior: "smooth",
        });
      }
    }
  };

  // Mouse Drag physics for PC/Desktop only (Disabled on mobile to ensure 100% native smooth momentum touch)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current || isMobile) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setStartScrollLeft(scrollRef.current.scrollLeft);
    setHasDragged(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current || isMobile) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.25;
    if (Math.abs(walk) > 6) {
      setHasDragged(true);
    }
    scrollRef.current.scrollLeft = startScrollLeft - walk;
    updateScrollState();
  };

  const handleMouseUp = () => {
    if (isMobile) return;
    setIsDragging(false);
    setTimeout(() => setHasDragged(false), 90);
  };

  const handleMouseLeave = () => {
    if (isDragging && !isMobile) {
      setIsDragging(false);
      setTimeout(() => setHasDragged(false), 90);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="bg-gradient-to-b from-[#080d16] via-[#0b101b] to-[#080d16] text-white py-12 sm:py-20 border-b border-slate-800/80 relative overflow-hidden"
    >
      {/* Background Studio Glow Elements */}
      <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-red-600/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Eyebrow, Title & Horizontal Navigation Arrows */}
        <div
          className={`flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-10 transition-all duration-700 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/15 border border-red-500/30 text-red-400 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest mb-2 sm:mb-2.5">
              <Layers className="w-3 h-3 text-red-500" />
              <span>{categorySection?.eyebrow?.trim() || "SHOP BY CATEGORY"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase font-sans">
              {categorySection?.title?.trim() || "Shop by Category"}
            </h2>
            <p className="text-xs sm:text-base text-slate-400 mt-1 sm:mt-2 max-w-xl font-normal leading-relaxed">
              {categorySection?.subtitle?.trim() ||
                "Explore authentic ITTF competition bats, pro tacky rubbers, tournament apparel, footwear, and club gear."}
            </p>
          </div>

          {/* Controls: Segmented Counter + Navigation Arrows */}
          <div className="flex items-center gap-2.5 sm:gap-3 self-end md:self-auto">
            {/* Step Counter & Progress Track */}
            <div className="flex items-center gap-2 sm:gap-3 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 sm:py-2 shadow-inner">
              <span className="text-[11px] sm:text-xs font-mono font-bold text-white tracking-widest">
                0{currentIndex} <span className="text-slate-500 font-normal">/ 0{totalCardsCount}</span>
              </span>
              <div className="w-12 sm:w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full transition-all duration-150 shadow-sm shadow-red-500/50"
                  style={{ width: `${Math.max(14, scrollProgress * 100)}%` }}
                />
              </div>
            </div>

            {/* Left & Right Horizontal Navigation Arrows */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                aria-label="Previous category"
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center transition-all duration-200 shadow-md ${
                  canScrollLeft
                    ? "bg-slate-900 border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800 hover:border-slate-700 cursor-pointer active:scale-95"
                    : "bg-slate-900/40 border-slate-800/40 text-slate-600 cursor-not-allowed opacity-35"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                aria-label="Next category"
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-200 shadow-md ${
                  canScrollRight
                    ? "bg-red-600 hover:bg-red-500 text-white shadow-red-600/30 cursor-pointer active:scale-95"
                    : "bg-red-600/40 text-white/40 cursor-not-allowed opacity-35"
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* HORIZONTAL CATEGORY COVER TRACK (Adaptive Desktop / Mobile)  */}
        {/* ============================================================ */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseDown={!isMobile ? handleMouseDown : undefined}
          onMouseMove={!isMobile ? handleMouseMove : undefined}
          onMouseUp={!isMobile ? handleMouseUp : undefined}
          onMouseLeave={!isMobile ? handleMouseLeave : undefined}
          className={`flex gap-4 sm:gap-6 overflow-x-auto pb-8 pt-3 scrollbar-none select-none -mx-4 px-4 sm:mx-0 sm:px-0 items-end snap-x snap-mandatory overscroll-x-contain touch-pan-x ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {CATEGORY_ITEMS.map((item, index) => {
            // Mobile Rule: Exactly 1 card is elevated in center spotlight, others blurred/lowered
            const isMobileSpotlight = index + 1 === currentIndex;

            // Desktop Rule: 3 cards in view sit elevated, side cards blurred/lowered
            const isDesktopSpotlight =
              (index + 1 >= currentIndex - 1 && index + 1 <= currentIndex + 1) ||
              (currentIndex <= 2 && index < 3) ||
              (currentIndex >= totalCardsCount - 1 && index >= totalCardsCount - 3);

            // Is swipe animation triggered on mobile for this card?
            const isTriggeredOnMobile = mobileSwipedIndex === index;

            return (
              <CategoryCardItem
                key={item.id}
                item={item}
                index={index}
                currentIndex={currentIndex}
                totalCardsCount={totalCardsCount}
                isMobileSpotlight={isMobileSpotlight}
                isDesktopSpotlight={isDesktopSpotlight}
                hasDragged={hasDragged}
                isTriggeredOnMobile={isTriggeredOnMobile}
                isMobile={isMobile}
              />
            );
          })}

          {/* End spacer to allow Card 7 (Bags & Accessories) to scroll cleanly into full center focus on all devices */}
          <div
            className="w-24 sm:w-40 md:w-72 lg:w-[480px] flex-shrink-0 pointer-events-none"
            aria-hidden="true"
          />
        </div>

        {/* Section Navigation Helper */}
        <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 font-mono px-1">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span>Hover on PC or swipe horizontally on mobile to play category animations</span>
            </span>
          </div>

          <Link
            href="/category/all"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-white transition group"
          >
            <span>View All Equipment</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
