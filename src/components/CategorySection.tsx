"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Layers } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useAdminStore } from "@/store/useAdminStore";

interface CategoryCard {
  id: string;
  name: string;
  tagline: string;
  href: string;
  image: string;
  badge: string;
}

const CATEGORIES: CategoryCard[] = [
  {
    id: "bats",
    name: "Table Tennis Bats",
    tagline: "5-ply & 7-ply pro blades tuned for offensive speed and loop stability.",
    href: "/category/rackets",
    image: "/images/product-1-light.png",
    badge: "Tournament Bats",
  },
  {
    id: "balls",
    name: "Table Tennis Balls",
    tagline: "ITTF approved 40+ ABS competition balls with seamless true flight roundness.",
    href: "/category/balls",
    image: "/images/balls-product.png",
    badge: "ITTF 3-Star",
  },
  {
    id: "rubbers",
    name: "Rubbers & Blades",
    tagline: "High-tension tacky rubber sheets and high-elasticity offensive blades.",
    href: "/category/rackets",
    image: "/images/rubber-macro.png",
    badge: "High Elasticity",
  },
  {
    id: "jerseys",
    name: "Jerseys & Match Shirts",
    tagline: "QuickDry ergonomic microfiber jerseys engineered for cool, agile rallies.",
    href: "/category/apparel",
    image: "/images/thumb-tshirt.png",
    badge: "Match Apparel",
  },
  {
    id: "shorts",
    name: "Shorts & Sportswear",
    tagline: "Lightweight 4-way stretch shorts with inner drawcord for swift court movement.",
    href: "/category/apparel",
    image: "/images/thumb-shorts.png",
    badge: "Stretch Fit",
  },
  {
    id: "shoes",
    name: "Table Tennis Shoes",
    tagline: "Non-marking honeycomb gum rubber soles engineered for explosive lateral pivoting.",
    href: "/category/footwear",
    image: "/images/thumb-shoes.png",
    badge: "Court Agility",
  },
  {
    id: "protective-gear",
    name: "Protective Gear & Cases",
    tagline: "Shockproof reinforced EVA armor shells and zippered dual-racket cases.",
    href: "/category/accessories",
    image: "/images/case-product.png",
    badge: "EVA Armor",
  },
  {
    id: "accessories",
    name: "Match Accessories & Care",
    tagline: "100% combed cotton tournament towels, edge tapes, and paddle cleaners.",
    href: "/category/accessories",
    image: "/images/thumb-case.png",
    badge: "Care & Grip",
  },
];

export default function CategorySection() {
  const { categorySection } = useAdminStore();
  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.1 });

  const categories =
    categorySection?.categories && categorySection.categories.length > 0
      ? categorySection.categories
      : CATEGORIES;

  return (
    <section
      ref={sectionRef}
      className="py-12 sm:py-20 bg-[#fafbfc] text-gray-950 border-b border-gray-100 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Scroll Reveal */}
        <div
          className={`flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-10 transition-all duration-700 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-red-50 border border-red-200/60 text-red-600 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest mb-2.5 sm:mb-3">
              <Layers className="w-3.5 h-3.5" />
              <span>{categorySection?.eyebrow || "OUR PRODUCTS"}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-950">
              {categorySection?.title || "Shop by Category"}
            </h2>
            <p className="text-xs sm:text-base text-gray-600 mt-1 sm:mt-1.5 max-w-xl font-medium leading-relaxed">
              {categorySection?.subtitle ||
                "Find rackets, balls, rubbers, shoes, and clothing for table tennis."}
            </p>
          </div>

          <Link
            href="/category/all"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-900 hover:text-red-600 transition group self-start md:self-end"
          >
            <span>View All Equipment ({categories.length} Categories)</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Categories Grid: 1:1 Square Cards on PC & Mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {categories.map((cat, idx) => (
            <div
              key={cat.id}
              style={{
                transitionDelay: `${idx * 40}ms`,
              }}
              className={`transition-all duration-500 ease-out ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <Link
                href={cat.href}
                className="group relative aspect-square w-full bg-white border border-gray-200/90 hover:border-red-500/50 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between block"
              >
                {/* 1. Full-Bleed Category Visual */}
                <div className="absolute inset-0 p-3 sm:p-5 flex items-center justify-center bg-radial from-gray-50/90 via-gray-100/60 to-gray-50/30">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-contain p-3 sm:p-5 group-hover:scale-110 transition-transform duration-500 ease-out select-none pointer-events-none"
                  />
                </div>

                {/* 2. Top Bar: Badge & Explore Arrow */}
                <div className="relative z-10 p-2 sm:p-3 flex items-center justify-between gap-1 pointer-events-none">
                  <span className="text-[9px] sm:text-[10px] font-mono font-bold text-red-600 bg-red-50/95 backdrop-blur-md border border-red-100 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-wider truncate max-w-[80%] shadow-xs">
                    {cat.badge}
                  </span>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/90 backdrop-blur-md border border-gray-200/80 group-hover:bg-red-600 text-gray-500 group-hover:text-white flex items-center justify-center transition-colors shadow-xs shrink-0">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* 3. Sleek Bottom Frosted Glass Overlay */}
                <div className="relative z-10 p-2.5 sm:p-3.5 bg-gradient-to-t from-black/95 via-black/85 to-transparent pt-6 sm:pt-10 flex items-end justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs sm:text-sm font-bold sm:font-black text-white group-hover:text-red-400 transition-colors line-clamp-1 leading-snug">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-gray-300 line-clamp-1 mt-0.5 font-medium leading-snug">
                      {cat.tagline}
                    </p>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-400 group-hover:text-red-400 transition-colors shrink-0">
                    0{idx + 1}
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
