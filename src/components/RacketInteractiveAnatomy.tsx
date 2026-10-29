"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShieldCheck, Zap, Crosshair, ArrowRight, ShoppingBag, Eye } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function RacketInteractiveAnatomy() {
  const { addItem } = useCartStore();
  const [activeHotspot, setActiveHotspot] = useState<"rubber" | "blade" | "handle">("rubber");

  const hotspots = {
    rubber: {
      title: "High-Tension Tacky Rubber",
      subtitle: "ITTF Certified Pimples-In Top Sheet",
      description:
        "Micro-textured sticky rubber surface generates explosive topspin arch and sharp ball bite on aggressive loops.",
      spec: "Spin Rating: 94 / 100",
      x: "42%",
      y: "28%",
    },
    blade: {
      title: "5-Ply Wood Blade",
      subtitle: "Alpine Wood Core with Carbon Grid",
      description:
        "Balanced layers of selected hard limba and ayous wood deliver uniform sweet spot and crisp acoustic feedback.",
      spec: "Control Rating: 92 / 100",
      x: "53%",
      y: "48%",
    },
    handle: {
      title: "Ergonomic Flared Handle",
      subtitle: "Anti-Sweat Moisture Absorbing Grip",
      description:
        "Anatomically tapered flared contour designed to lock securely in hand during rapid counter-attack rallies.",
      spec: "Ergonomics: 96 / 100",
      x: "64%",
      y: "70%",
    },
  };

  return (
    <section className="py-24 bg-black text-white relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-xs font-bold text-red-500 uppercase tracking-[0.25em] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              ENGINEERED FOR CHAMPIONS
            </span>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight mt-2 text-white">
              FIND YOUR <span className="text-red-500 italic">EDGE.</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-400 mt-2 max-w-xl">
              Engineered for players who demand more. The LOKI Performance Racket combines precision, control, and power — so you can play with confidence, every time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/products/loki-dragon-10"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-red-600/30"
            >
              <span>Explore Dragon 10 Specs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Interactive Anatomy Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left/Center Visual with Hotspots (lg:col-span-7) */}
          <div className="lg:col-span-7 relative flex items-center justify-center">
            <div className="relative w-full aspect-square max-w-[540px] rounded-3xl bg-gradient-to-b from-neutral-900 via-neutral-950 to-black p-4 border border-white/10 shadow-2xl flex items-center justify-center">
              {/* Product Visual */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden">
                <Image
                  src="/images/dark-racket-glow.png"
                  alt="LOKI Dragon 10 Performance Anatomy"
                  fill
                  className="object-contain p-4"
                />

                {/* Hotspot 1: Rubber */}
                <button
                  onClick={() => setActiveHotspot("rubber")}
                  style={{ left: hotspots.rubber.x, top: hotspots.rubber.y }}
                  aria-label="Rubber Hotspot"
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-20"
                >
                  <span className="relative flex h-7 w-7">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        activeHotspot === "rubber" ? "bg-red-400" : "bg-white/40"
                      }`}
                    />
                    <span
                      className={`relative inline-flex rounded-full h-7 w-7 border-2 border-white items-center justify-center text-[10px] font-bold shadow-xl transition-all ${
                        activeHotspot === "rubber"
                          ? "bg-red-600 text-white scale-110"
                          : "bg-black/80 text-white hover:bg-red-600"
                      }`}
                    >
                      01
                    </span>
                  </span>
                </button>

                {/* Hotspot 2: Blade */}
                <button
                  onClick={() => setActiveHotspot("blade")}
                  style={{ left: hotspots.blade.x, top: hotspots.blade.y }}
                  aria-label="Blade Hotspot"
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-20"
                >
                  <span className="relative flex h-7 w-7">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        activeHotspot === "blade" ? "bg-red-400" : "bg-white/40"
                      }`}
                    />
                    <span
                      className={`relative inline-flex rounded-full h-7 w-7 border-2 border-white items-center justify-center text-[10px] font-bold shadow-xl transition-all ${
                        activeHotspot === "blade"
                          ? "bg-red-600 text-white scale-110"
                          : "bg-black/80 text-white hover:bg-red-600"
                      }`}
                    >
                      02
                    </span>
                  </span>
                </button>

                {/* Hotspot 3: Handle */}
                <button
                  onClick={() => setActiveHotspot("handle")}
                  style={{ left: hotspots.handle.x, top: hotspots.handle.y }}
                  aria-label="Handle Hotspot"
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-20"
                >
                  <span className="relative flex h-7 w-7">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        activeHotspot === "handle" ? "bg-red-400" : "bg-white/40"
                      }`}
                    />
                    <span
                      className={`relative inline-flex rounded-full h-7 w-7 border-2 border-white items-center justify-center text-[10px] font-bold shadow-xl transition-all ${
                        activeHotspot === "handle"
                          ? "bg-red-600 text-white scale-110"
                          : "bg-black/80 text-white hover:bg-red-600"
                      }`}
                    >
                      03
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Active Component Breakdown (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex gap-2 p-1.5 bg-neutral-900 border border-white/10 rounded-2xl">
              {(["rubber", "blade", "handle"] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveHotspot(key)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold capitalize transition ${
                    activeHotspot === key
                      ? "bg-red-600 text-white shadow-lg"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Active Highlight Info Card */}
            <div className="p-6 rounded-3xl bg-neutral-900/90 border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest">
                  {hotspots[activeHotspot].subtitle}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/40 px-2.5 py-0.5 rounded-full">
                  {hotspots[activeHotspot].spec}
                </span>
              </div>

              <h3 className="text-2xl font-black text-white">
                {hotspots[activeHotspot].title}
              </h3>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {hotspots[activeHotspot].description}
              </p>

              {/* Power Diagnostics Bar */}
              <div className="space-y-3 pt-3 border-t border-white/10 text-xs">
                <div>
                  <div className="flex justify-between text-gray-400 font-semibold mb-1">
                    <span>Control Stability</span>
                    <span className="text-white font-mono">92%</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full w-[92%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-gray-400 font-semibold mb-1">
                    <span>Topspin Trajectory</span>
                    <span className="text-white font-mono">94%</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full w-[94%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-gray-400 font-semibold mb-1">
                    <span>Impact Speed</span>
                    <span className="text-white font-mono">88%</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full w-[88%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Price & Add to Bag */}
            <div className="p-5 rounded-3xl bg-neutral-900 border border-white/10 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block">
                  LOKI Dragon 10 Pro
                </span>
                <span className="text-2xl font-black text-white">
                  NPR 2,499
                </span>
              </div>

              <button
                onClick={() =>
                  addItem({
                    id: "loki-dragon-10",
                    name: "LOKI Dragon 10 Racket",
                    brand: "LOKI",
                    price: 2499,
                    originalPrice: 3200,
                    image: "/images/hero-bg.jpg",
                    category: "Rackets",
                    selectedColor: "Red",
                    selectedHandle: "FL (Flared)",
                  })
                }
                className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-red-600/30"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
