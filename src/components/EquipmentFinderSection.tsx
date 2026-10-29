"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Crosshair,
  RotateCw,
  Zap,
  ArrowRight,
  ShoppingBag,
  Check,
  Star,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { PRODUCTS, Product } from "@/data/products";
import { useCartStore } from "@/store/useCartStore";
import { useAdminStore } from "@/store/useAdminStore";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type PlayStyle = string;

interface StyleOption {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badge: string;
  recommendedProductIds: string[];
}

const STYLE_OPTIONS: StyleOption[] = [
  {
    id: "control",
    title: "CONTROL",
    tagline: "Placement & Consistency",
    description:
      "Best for tactical players who want steady shots, safe push blocks, and accurate ball placement on the table.",
    icon: Crosshair,
    accentColor: "emerald",
    badge: "Great Control (92/100)",
    recommendedProductIds: ["loki-dragon-10", "loki-3-star-balls", "loki-hardcase-pro"],
  },
  {
    id: "spin",
    title: "SPIN",
    tagline: "Heavy Topspin & Loops",
    description:
      "Best for attacking players who love strong topspin, curving serves, and high-arc dipping loops.",
    icon: RotateCw,
    accentColor: "red",
    badge: "Heavy Spin (91/100)",
    recommendedProductIds: ["loki-dragon-8", "loki-3-star-balls", "loki-sports-towel"],
  },
  {
    id: "speed",
    title: "SPEED",
    tagline: "Fast Attacks & Quick Smashes",
    description:
      "Best for offensive players who want quick smashes, explosive speed, and fast attacking returns.",
    icon: Zap,
    accentColor: "blue",
    badge: "High Speed (89/100)",
    recommendedProductIds: ["loki-dragon-8", "loki-court-swift-shoes", "loki-aeroflex-jersey"],
  },
];

export default function EquipmentFinderSection() {
  const [selectedStyle, setSelectedStyle] = useState<PlayStyle>("control");
  const [addedId, setAddedId] = useState<string | null>(null);

  const { addItem } = useCartStore();
  const { products: storeProducts, equipmentFinder } = useAdminStore();
  const allProducts = storeProducts && storeProducts.length > 0 ? storeProducts : PRODUCTS;

  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.1 });

  // Merge CMS options with icons and accent colors
  const styleOptions = (equipmentFinder?.options && equipmentFinder.options.length > 0)
    ? equipmentFinder.options.map((opt) => {
        const fallback = STYLE_OPTIONS.find((s) => s.id === opt.id) || STYLE_OPTIONS[0];
        return {
          ...fallback,
          ...opt,
          icon: opt.id === "control" ? Crosshair : opt.id === "spin" ? RotateCw : Zap,
          accentColor: opt.id === "control" ? "emerald" : opt.id === "spin" ? "red" : "blue",
        };
      })
    : STYLE_OPTIONS;

  const activeOption = styleOptions.find((s) => s.id === selectedStyle) || styleOptions[0];

  const recommendedProducts: Product[] = (activeOption.recommendedProductIds || [])
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      category: product.category,
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <section
      ref={sectionRef}
      className="py-20 sm:py-28 bg-white text-gray-950 border-b border-gray-100 relative overflow-hidden"
    >
      {/* Subtle Ambient Decorative Spot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-600/3 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Scroll Reveal */}
        <div
          className={`max-w-3xl mx-auto text-center mb-14 transition-all duration-700 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200/60 text-red-600 text-xs font-mono font-bold uppercase tracking-widest mb-3.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{equipmentFinder?.eyebrow || "CHOOSE YOUR PLAYING STYLE"}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-950 leading-[1.08]">
            {equipmentFinder?.title || "Find The Right Gear For Your Game"}
          </h2>

          <p className="text-sm sm:text-base text-gray-600 mt-3 font-medium leading-relaxed max-w-xl mx-auto">
            {equipmentFinder?.subtitle || "Whether you like control, spin, or fast attacking speed, we have the right equipment for you."}
          </p>
        </div>

        {/* 3 Interactive Playstyle Cards (Role Radiogroup for Accessibility) */}
        <div
          role="radiogroup"
          aria-label="Select table tennis playstyle"
          className={`grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 mb-8 sm:mb-12 transition-all duration-700 delay-100 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {styleOptions.map((option) => {
            const isSelected = selectedStyle === option.id;
            const IconComponent = option.icon;

            return (
              <button
                key={option.id}
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelectedStyle(option.id)}
                className={`relative text-left p-4 sm:p-7 rounded-2xl sm:rounded-3xl border-2 transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 group ${
                  isSelected
                    ? "bg-[#0b101b] border-gray-950 text-white shadow-2xl shadow-black/15 scale-[1.02]"
                    : "bg-gray-50/80 hover:bg-white border-gray-200/80 hover:border-gray-300 text-gray-900 hover:shadow-lg hover:-translate-y-0.5"
                }`}
              >
                {/* Active Indicator Pip */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div
                    className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold transition-all duration-300 ${
                      isSelected
                        ? "bg-red-600 text-white shadow-lg shadow-red-600/40"
                        : "bg-white border border-gray-200 text-gray-700 group-hover:text-red-600 shadow-xs"
                    }`}
                  >
                    <IconComponent className="w-4 h-4 sm:w-6 sm:h-6" />
                  </div>

                  <span
                    className={`text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border transition truncate max-w-[70%] sm:max-w-none ${
                      isSelected
                        ? "bg-red-500/20 text-red-300 border-red-500/30"
                        : "bg-white text-gray-500 border-gray-200"
                    }`}
                  >
                    {option.badge}
                  </span>
                </div>

                <h3
                  className={`text-base sm:text-xl font-black tracking-tight leading-tight transition ${
                    isSelected ? "text-white" : "text-gray-950 group-hover:text-red-600"
                  }`}
                >
                  {option.title}
                </h3>
                <span
                  className={`text-[11px] sm:text-xs font-bold block mt-0.5 sm:mt-1 transition ${
                    isSelected ? "text-red-400" : "text-gray-600"
                  }`}
                >
                  {option.tagline}
                </span>

                <p
                  className={`text-[11px] sm:text-xs mt-1.5 sm:mt-3 leading-snug sm:leading-relaxed transition line-clamp-2 sm:line-clamp-none ${
                    isSelected ? "text-slate-300" : "text-gray-500"
                  }`}
                >
                  {option.description}
                </p>

                <div
                  className={`mt-3 sm:mt-5 pt-3 sm:pt-4 border-t flex items-center justify-between text-[11px] sm:text-xs font-bold transition ${
                    isSelected
                      ? "border-slate-800 text-red-400"
                      : "border-gray-200 text-gray-600 group-hover:text-black"
                  }`}
                >
                  <span>{isSelected ? "Active Strategy" : "Select Playstyle"}</span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 ${
                      isSelected ? "translate-x-1 text-red-400" : "group-hover:translate-x-0.5"
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Recommendations Panel with Animated Transition */}
        <div
          className={`bg-gray-50/80 rounded-2xl sm:rounded-3xl p-4 sm:p-10 border border-gray-200/80 shadow-xs transition-all duration-700 delay-200 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 mb-5 sm:mb-8 border-b border-gray-200/80">
            <div>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold text-red-600 uppercase tracking-widest block">
                VERIFIED CATALOG SELECTION
              </span>
              <h4 className="text-lg sm:text-2xl font-black text-gray-950 mt-0.5">
                Recommended Gear for {activeOption.title} Play
              </h4>
            </div>

            <Link
              href="/category/all"
              className="inline-flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-gray-900 hover:text-red-600 transition group self-start sm:self-center"
            >
              <span>Explore All Equipment</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Product Cards Row: 2-column on mobile, 3-column on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            {recommendedProducts.map((product) => {
              const isAdded = addedId === product.id;
              const discount = product.discountPercent
                ? product.discountPercent
                : Math.round(
                    ((product.originalPrice - product.price) / product.originalPrice) * 100
                  );

              return (
                <div
                  key={product.id}
                  className="group relative aspect-square w-full rounded-2xl sm:rounded-3xl bg-white border border-gray-200/90 hover:border-red-500/50 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* 1. Product Image Link */}
                  <Link
                    href={`/products/${product.id}`}
                    className="absolute inset-0 p-3 sm:p-5 flex items-center justify-center bg-radial from-gray-50/90 via-gray-100/60 to-gray-50/30"
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-contain p-3 sm:p-5 group-hover:scale-110 transition-transform duration-500 ease-out select-none pointer-events-none"
                    />
                  </Link>

                  {/* 2. Top Bar: Category & Discount */}
                  <div className="relative z-10 p-2 sm:p-3 flex items-center justify-between gap-1 pointer-events-none">
                    <span className="text-[9px] sm:text-[10px] font-mono font-bold text-gray-700 bg-white/90 backdrop-blur-md border border-gray-200/80 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-wider truncate shadow-xs">
                      {product.category}
                    </span>

                    {discount > 0 && (
                      <span className="text-[9px] sm:text-[10px] font-bold text-red-600 bg-red-50/90 backdrop-blur-md border border-red-200 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full shadow-xs shrink-0">
                        {discount}% OFF
                      </span>
                    )}
                  </div>

                  {/* 3. Sleek Bottom Frosted Glass Overlay */}
                  <div className="relative z-10 p-2.5 sm:p-3.5 bg-gradient-to-t from-black/95 via-black/85 to-transparent pt-6 sm:pt-10 flex items-end justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <Link href={`/products/${product.id}`} className="block">
                        <h5 className="text-xs sm:text-sm font-bold sm:font-black text-white group-hover:text-red-400 transition-colors line-clamp-1 leading-snug">
                          {product.name}
                        </h5>
                      </Link>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-xs sm:text-sm font-black text-white truncate">
                          Rs. {product.price.toLocaleString()}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="text-[10px] sm:text-[11px] text-gray-400 line-through">
                            Rs. {product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      aria-label={`Add ${product.name} to cart`}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0 active:scale-90 ${
                        isAdded
                          ? "bg-emerald-600 text-white"
                          : "bg-red-600 hover:bg-red-500 text-white shadow-red-600/30"
                      }`}
                    >
                      {isAdded ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <ShoppingBag className="w-3.5 h-3.5" />
                      )}
                    </button>
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
