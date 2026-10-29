"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  ShoppingBag,
  Check,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { PRODUCTS, Product } from "@/data/products";
import { useAdminStore } from "@/store/useAdminStore";
import { useCartStore } from "@/store/useCartStore";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function AutomatedBestSellers() {
  const { autoBestSellerEnabled, products: storeProducts, bestSellersCMS } = useAdminStore();
  const { addItem } = useCartStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [addedId, setAddedId] = useState<string | null>(null);

  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.08 });

  const sourceProducts = storeProducts && storeProducts.length > 0 ? storeProducts : PRODUCTS;

  const sortedProducts = useMemo(() => {
    // 1. Manual Curated Selection by Admin (highest priority if set to manual)
    if (bestSellersCMS?.mode === "manual" && bestSellersCMS.selectedProductIds?.length > 0) {
      let curatedList = bestSellersCMS.selectedProductIds
        .map((id) => sourceProducts.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p));

      // Fallback if none matched
      if (curatedList.length === 0) {
        curatedList = [...sourceProducts];
      }

      if (selectedCategory !== "All") {
        curatedList = curatedList.filter((p) => p.category === selectedCategory);
      }
      return curatedList;
    }

    // 2. Automated Sales Velocity Mode
    let list = [...sourceProducts];

    if (autoBestSellerEnabled || bestSellersCMS?.mode === "automated") {
      list.sort((a, b) => {
        const scoreA =
          a.salesCount * 0.35 +
          a.weeklyVelocity * 0.5 +
          (a.price >= 2000 ? 60 : 0);
        const scoreB =
          b.salesCount * 0.35 +
          b.weeklyVelocity * 0.5 +
          (b.price >= 2000 ? 60 : 0);
        return scoreB - scoreA;
      });
    }

    if (selectedCategory !== "All") {
      list = list.filter((p) => p.category === selectedCategory);
    }

    return list;
  }, [sourceProducts, autoBestSellerEnabled, bestSellersCMS, selectedCategory]);

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

  const categories = ["All", "Rackets", "Apparel", "Footwear", "Accessories", "Balls"];

  return (
    <section
      ref={sectionRef}
      className="py-14 sm:py-28 bg-[#090e17] text-white relative overflow-hidden border-b border-slate-800/80"
    >
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header with Scroll Reveal */}
        <div
          className={`flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-6 mb-8 sm:mb-12 transition-all duration-700 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-red-600/15 border border-red-500/30 text-red-400 text-xs sm:text-sm font-mono font-bold uppercase tracking-widest mb-2.5 sm:mb-3">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{bestSellersCMS?.eyebrow || "POPULAR PRODUCTS"}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              {bestSellersCMS?.title || "Trending & Best Sellers"}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 mt-1.5 sm:mt-2 max-w-xl font-medium leading-relaxed">
              {bestSellersCMS?.subtitle || "Top selling table tennis equipment chosen by players and clubs in Nepal."}
            </p>
          </div>

          {/* Category Filter Pills with Smooth Feedback */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap cursor-pointer active:scale-95 ${
                  selectedCategory === cat
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid: 1:1 Square Cards on PC & Mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {sortedProducts.map((product, idx) => {
            const isAdded = addedId === product.id;
            const discount = product.discountPercent
              ? product.discountPercent
              : Math.round(
                  ((product.originalPrice - product.price) /
                    product.originalPrice) *
                    100
                );

            return (
              <div
                key={product.id}
                style={{
                  transitionDelay: `${idx * 40}ms`,
                }}
                className={`relative aspect-[4/5] sm:aspect-square w-full rounded-2xl sm:rounded-3xl bg-[#0e1420] border border-slate-800 hover:border-red-500/50 overflow-hidden group shadow-lg hover:shadow-2xl hover:shadow-red-600/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                {/* 1. Full-Bleed Product Image Link */}
                <Link
                  href={`/products/${product.id}`}
                  className="absolute inset-0 p-3 sm:p-5 flex items-center justify-center bg-radial from-[#151f30]/50 via-[#0d1420]/70 to-[#0a0f18]"
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-contain p-3 sm:p-5 group-hover:scale-110 transition-transform duration-500 ease-out select-none pointer-events-none"
                  />
                </Link>

                {/* 2. Top Bar: Category Pill & Discount Badge */}
                <div className="relative z-10 p-2 sm:p-3 flex items-center justify-between gap-1 pointer-events-none">
                  <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-300 bg-black/75 backdrop-blur-md border border-white/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-wider truncate shadow-sm">
                    {product.category}
                  </span>

                  {discount > 0 && (
                    <span className="text-[10px] sm:text-xs font-bold text-red-400 bg-red-950/80 backdrop-blur-md border border-red-500/30 px-2 py-0.5 sm:px-2 sm:py-0.5 rounded-full shadow-sm shrink-0">
                      {discount}% OFF
                    </span>
                  )}
                </div>

                {/* 3. Sleek Bottom Frosted Overlay (Title, Price, & Quick Add-to-Bag) */}
                <div className="relative z-10 p-2.5 sm:p-3.5 bg-gradient-to-t from-black/95 via-black/85 to-transparent pt-6 sm:pt-10 flex items-end justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <Link href={`/products/${product.id}`} className="block">
                      <h3 className="text-sm sm:text-base font-bold sm:font-black text-white group-hover:text-red-400 transition-colors line-clamp-1 leading-snug">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-sm sm:text-base font-black text-white truncate">
                        Rs. {product.price.toLocaleString()}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-xs sm:text-sm text-slate-400 line-through">
                          Rs. {product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    aria-label={`Add ${product.name} to bag`}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0 active:scale-90 ${
                      isAdded
                        ? "bg-emerald-600 text-white"
                        : "bg-red-600 hover:bg-red-500 text-white shadow-red-600/30"
                    }`}
                  >
                    {isAdded ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <ShoppingBag className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Footer Link with Stagger */}
        <div
          className={`mt-12 text-center transition-all duration-700 delay-300 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Link
            href="/category/all"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-sm font-bold text-white hover:text-red-400 transition shadow-lg group"
          >
            <span>Explore Complete Tournament Catalog</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
