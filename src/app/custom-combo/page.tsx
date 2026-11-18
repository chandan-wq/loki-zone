"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
  Check,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  SlidersHorizontal,
  Info,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAdminStore } from "@/store/useAdminStore";
import { PRODUCTS as fallbackProducts, Product } from "@/data/products";

// Bundle Tiered Discount Configuration
// 2 items = 5% off, 3+ items = 10% off
function calculateBundleDiscountPercent(itemCount: number): number {
  if (itemCount >= 3) return 10;
  if (itemCount >= 2) return 5;
  return 0;
}

interface SelectedComboItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export default function CustomComboBuilderPage() {
  const { addItem: addCartItem, openCart } = useCartStore();
  const storeProducts = useAdminStore((s) => s.products);

  // Authoritative catalog: live store products with local catalog fallback
  const catalog: Product[] = useMemo(() => {
    return storeProducts && storeProducts.length > 0
      ? storeProducts
      : fallbackProducts;
  }, [storeProducts]);

  // Selected Combo Items state
  const [selectedItems, setSelectedItems] = useState<SelectedComboItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState<boolean>(false);
  const [recentlyRemoved, setRecentlyRemoved] = useState<SelectedComboItem | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [showAIHelp, setShowAIHelp] = useState<boolean>(true);

  // Variant selector modal state
  const [variantModalProduct, setVariantModalProduct] = useState<Product | null>(null);
  const [chosenVariant, setChosenVariant] = useState<string>("");

  // Categories list derived from catalog
  const categories = useMemo(() => {
    const set = new Set<string>();
    catalog.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["All", ...Array.from(set)];
  }, [catalog]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return catalog.filter((p) => {
      const matchCat =
        activeCategory === "All" ||
        p.category.toLowerCase() === activeCategory.toLowerCase();
      const matchSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchCat && matchSearch;
    });
  }, [catalog, activeCategory, searchQuery]);

  // Calculation Metrics
  const totalItemsCount = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [selectedItems]);

  const rawSubtotal = useMemo(() => {
    return selectedItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  }, [selectedItems]);

  const discountPercent = useMemo(() => {
    return calculateBundleDiscountPercent(totalItemsCount);
  }, [totalItemsCount]);

  const discountAmount = useMemo(() => {
    return Math.round((rawSubtotal * discountPercent) / 100);
  }, [rawSubtotal, discountPercent]);

  const finalTotal = useMemo(() => {
    return Math.max(0, rawSubtotal - discountAmount);
  }, [rawSubtotal, discountAmount]);

  // Add product to combo handler
  const handleAddProduct = (product: Product, variant?: string) => {
    // If product has size or handle styles and none chosen yet, open variant selector
    if (!variant) {
      if (
        product.category === "Footwear" &&
        product.specs?.handleStyle &&
        Array.isArray(product.specs.handleStyle) &&
        product.specs.handleStyle.length > 0
      ) {
        setVariantModalProduct(product);
        setChosenVariant(product.specs.handleStyle[0]);
        return;
      }
      if (
        product.category === "Apparel" &&
        product.specs?.handleStyle &&
        Array.isArray(product.specs.handleStyle) &&
        product.specs.handleStyle.length > 0
      ) {
        setVariantModalProduct(product);
        setChosenVariant(product.specs.handleStyle[0]);
        return;
      }
    }

    setSelectedItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.product.id === product.id && i.selectedVariant === variant
      );
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += 1;
        return copy;
      }
      return [...prev, { product, quantity: 1, selectedVariant: variant }];
    });
  };

  // Quantity controllers inside combo
  const handleUpdateQuantity = (productId: string, delta: number, variant?: string) => {
    setSelectedItems((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId && item.selectedVariant === variant) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as SelectedComboItem[];
    });
  };

  // Remove specific item from combo
  const handleRemoveItem = (productId: string, variant?: string) => {
    const itemToRemove = selectedItems.find(
      (i) => i.product.id === productId && i.selectedVariant === variant
    );
    if (itemToRemove) {
      setRecentlyRemoved(itemToRemove);
    }
    setSelectedItems((prev) =>
      prev.filter(
        (i) => !(i.product.id === productId && i.selectedVariant === variant)
      )
    );
  };

  // Undo accidental removal
  const handleUndoRemoval = () => {
    if (recentlyRemoved) {
      setSelectedItems((prev) => [...prev, recentlyRemoved]);
      setRecentlyRemoved(null);
    }
  };

  // Clear combo with confirmation
  const handleClearCombo = () => {
    if (selectedItems.length === 0) return;
    if (window.confirm("Are you sure you want to clear your current combo?")) {
      setSelectedItems([]);
      setIsBottomSheetOpen(false);
    }
  };

  // AI Preset Configurations Handlers
  const applyAIPreset = (presetKey: "tournament" | "spin_attack" | "essential") => {
    let itemsToAdd: { idKeyword: string; qty: number }[] = [];

    if (presetKey === "tournament") {
      itemsToAdd = [
        { idKeyword: "dragon-10", qty: 1 },
        { idKeyword: "ball", qty: 1 },
        { idKeyword: "case", qty: 1 },
      ];
    } else if (presetKey === "spin_attack") {
      itemsToAdd = [
        { idKeyword: "dragon-8", qty: 1 },
        { idKeyword: "rxton", qty: 1 },
        { idKeyword: "wristband", qty: 1 },
      ];
    } else {
      itemsToAdd = [
        { idKeyword: "dragon-10", qty: 1 },
        { idKeyword: "ball", qty: 1 },
      ];
    }

    const matched: SelectedComboItem[] = [];
    itemsToAdd.forEach((req) => {
      const found = catalog.find(
        (p) =>
          p.id.toLowerCase().includes(req.idKeyword) ||
          p.name.toLowerCase().includes(req.idKeyword)
      );
      if (found) {
        matched.push({ product: found, quantity: req.qty });
      }
    });

    if (matched.length > 0) {
      setSelectedItems(matched);
      setIsBottomSheetOpen(false);
      // Smooth scroll to builder
      const el = document.getElementById("builder-grid");
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Add Completed Combo to Cart
  const handleAddComboToCart = () => {
    if (selectedItems.length === 0) return;

    // Package the combo into a dedicated CartItem
    const comboTitle = `Custom LOKI Combo (${totalItemsCount} items)`;
    const primaryImage =
      selectedItems[0]?.product.image || "/images/product-1-light.png";

    const componentBreakdown = selectedItems.map((i) => ({
      id: i.product.id,
      name: i.product.name,
      price: i.product.price,
      image: i.product.image,
      quantity: i.quantity,
      category: i.product.category,
      selectedVariant: i.selectedVariant,
    }));

    addCartItem({
      id: `combo_${Date.now()}`,
      name: comboTitle,
      brand: "LOKI ZONE BUNDLE",
      price: finalTotal,
      originalPrice: rawSubtotal,
      image: primaryImage,
      category: "Combos",
      isCombo: true,
      comboItems: componentBreakdown,
    });

    setIsBottomSheetOpen(false);
    openCart();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-36">
      {/* 1. COMPACT HERO SECTION (Mobile Optimized) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-900 via-slate-900 to-slate-950 border-b border-slate-800/80 pt-4 sm:pt-6 pb-6 px-4">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-[11px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            <span>Interactive Combo Studio</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase">
            Build Your Own <span className="text-red-500">Combo</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Choose 2 or more genuine ITTF products to build your custom setup and unlock instant bundle savings up to 10% OFF!
          </p>

          {/* Progress Indicator */}
          <div className="max-w-xs mx-auto pt-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span className={selectedItems.length === 0 ? "text-red-500 font-extrabold" : "text-emerald-400 font-extrabold"}>
                1. Select Products
              </span>
              <span className="text-slate-600">→</span>
              <span className={selectedItems.length > 0 && !isBottomSheetOpen ? "text-red-500 font-extrabold" : "text-slate-400"}>
                2. Review Combo
              </span>
              <span className="text-slate-600">→</span>
              <span className="text-slate-500">3. Checkout</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-red-600 h-full transition-all duration-300"
                style={{
                  width: selectedItems.length === 0 ? "33%" : selectedItems.length < 2 ? "66%" : "100%",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. AI SMART SETUP ASSISTANT BANNER (Compact & Dismissible) */}
      {showAIHelp && (
        <section className="max-w-6xl mx-auto px-4 mt-4">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-red-950/60 via-slate-900 to-neutral-900 border border-red-500/30 shadow-lg relative">
            <button
              onClick={() => setShowAIHelp(false)}
              className="absolute top-2.5 right-2.5 text-slate-400 hover:text-white p-1"
              aria-label="Dismiss AI Recommendations"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-red-600 flex items-center justify-center text-white">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs sm:text-sm font-extrabold text-white tracking-tight">
                AI Coach Smart Setups (1-Tap Prefill)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {/* Preset 1 */}
              <div
                onClick={() => applyAIPreset("tournament")}
                className="cursor-pointer p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-red-500/50 transition flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-white block">Club Tournament Kit</span>
                  <span className="text-[10px] text-slate-400 block">Dragon 10 + 3-Star Balls + Bag</span>
                </div>
                <button className="px-2 py-1 rounded bg-red-600 text-white text-[10px] font-bold hover:bg-red-500 transition">
                  Prefill
                </button>
              </div>

              {/* Preset 2 */}
              <div
                onClick={() => applyAIPreset("spin_attack")}
                className="cursor-pointer p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-red-500/50 transition flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-white block">Fast Attack Spin Combo</span>
                  <span className="text-[10px] text-slate-400 block">Dragon 8 Pro + RXTON + Wristband</span>
                </div>
                <button className="px-2 py-1 rounded bg-red-600 text-white text-[10px] font-bold hover:bg-red-500 transition">
                  Prefill
                </button>
              </div>

              {/* Preset 3 */}
              <div
                onClick={() => applyAIPreset("essential")}
                className="cursor-pointer p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-red-500/50 transition flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-white block">Essential Match Setup</span>
                  <span className="text-[10px] text-slate-400 block">Dragon 10 + ITTF Competition Balls</span>
                </div>
                <button className="px-2 py-1 rounded bg-red-600 text-white text-[10px] font-bold hover:bg-red-500 transition">
                  Prefill
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. SEARCH & HORIZONTALLY SCROLLABLE CATEGORY CHIPS */}
      <section className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 py-2.5 px-4 mt-3">
        <div className="max-w-6xl mx-auto space-y-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search gear for your combo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Horizontally Scrollable Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => {
              const active = activeCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    active
                      ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                      : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* UNDO REMOVAL BANNER */}
      {recentlyRemoved && (
        <div className="max-w-6xl mx-auto px-4 mt-3">
          <div className="p-2.5 bg-neutral-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-300">
            <span>
              Removed <strong>{recentlyRemoved.product.name}</strong>
            </span>
            <button
              onClick={handleUndoRemoval}
              className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Undo
            </button>
          </div>
        </div>
      )}

      {/* 4. MAIN PRODUCT GRID (2 Columns on Mobile, 3-4 on Desktop) */}
      <main id="builder-grid" className="max-w-6xl mx-auto px-4 mt-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No products found</h3>
            <p className="text-xs text-slate-400">
              Try choosing another category or clearing your search term.
            </p>
            <button
              onClick={() => {
                setActiveCategory("All");
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((prod) => {
              // Check if in combo
              const comboEntry = selectedItems.find(
                (i) => i.product.id === prod.id
              );
              const inComboCount = comboEntry ? comboEntry.quantity : 0;

              return (
                <div
                  key={prod.id}
                  className={`bg-slate-900/90 rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                    inComboCount > 0
                      ? "border-red-500 shadow-md shadow-red-500/10 ring-1 ring-red-500/40"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {/* Product Image & Badges */}
                  <div className="relative aspect-square bg-slate-950/70 p-3 flex items-center justify-center overflow-hidden">
                    <Image
                      src={prod.image}
                      alt={prod.name}
                      width={220}
                      height={220}
                      className="object-contain max-h-full hover:scale-105 transition-transform duration-300"
                    />

                    {/* Category pill */}
                    <span className="absolute top-2 left-2 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-black/60 text-slate-300 backdrop-blur-sm">
                      {prod.category}
                    </span>

                    {/* Selected badge */}
                    {inComboCount > 0 && (
                      <span className="absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-full bg-red-600 text-white shadow-md flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {inComboCount} in Combo
                      </span>
                    )}
                  </div>

                  {/* Product Info & Action */}
                  <div className="p-3 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-white line-clamp-1">
                        {prod.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs sm:text-sm font-extrabold text-red-400">
                          NPR {prod.price.toLocaleString()}
                        </span>
                        {prod.originalPrice && prod.originalPrice > prod.price && (
                          <span className="text-[10px] text-slate-500 line-through">
                            NPR {prod.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-3">
                      {inComboCount > 0 ? (
                        <div className="flex items-center justify-between bg-slate-800 rounded-xl p-1 border border-red-500/40">
                          <button
                            onClick={() => handleUpdateQuantity(prod.id, -1, comboEntry?.selectedVariant)}
                            className="p-1.5 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-black text-white px-2">
                            {inComboCount}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(prod.id, 1, comboEntry?.selectedVariant)}
                            className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-500 transition"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddProduct(prod)}
                          className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-red-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-700 hover:border-red-500 shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Combo</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 5. STICKY BOTTOM COMBO SUMMARY BAR (Mobile Priority) */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-4 py-2.5 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Summary trigger & Thumbnails */}
          <div
            onClick={() => setIsBottomSheetOpen(true)}
            className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
          >
            {/* Thumbnails preview stack */}
            <div className="flex -space-x-2 overflow-hidden flex-shrink-0">
              {selectedItems.slice(0, 3).map((item, idx) => (
                <div
                  key={`${item.product.id}-${idx}`}
                  className="inline-block h-9 w-9 rounded-full ring-2 ring-slate-900 bg-slate-800 overflow-hidden flex items-center justify-center p-0.5"
                >
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    width={36}
                    height={36}
                    className="object-contain"
                  />
                </div>
              ))}
              {selectedItems.length === 0 && (
                <div className="h-9 w-9 rounded-full bg-slate-800 border border-dashed border-slate-600 flex items-center justify-center text-slate-500">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-white truncate">
                  {totalItemsCount} {totalItemsCount === 1 ? "Item" : "Items"}
                </span>
                {discountPercent > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider">
                    {discountPercent}% OFF
                  </span>
                )}
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="text-[11px] text-red-400 font-extrabold truncate">
                NPR {finalTotal.toLocaleString()}
                {discountAmount > 0 && (
                  <span className="text-slate-400 text-[10px] font-normal line-through ml-1">
                    NPR {rawSubtotal.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Primary Action Button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsBottomSheetOpen(true)}
              className="hidden sm:inline-flex px-3 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition"
            >
              Review Combo
            </button>

            <button
              disabled={selectedItems.length === 0}
              onClick={handleAddComboToCart}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition shadow-lg ${
                selectedItems.length === 0
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-500 text-white shadow-red-600/30 active:scale-95"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </footer>

      {/* 6. EXPANDABLE BOTTOM SHEET (Mobile Drawer) */}
      {isBottomSheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsBottomSheetOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          {/* Sheet Container */}
          <div className="relative z-10 w-full max-w-2xl mx-auto bg-slate-900 rounded-t-3xl border-t border-slate-800 p-4 sm:p-6 max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Sheet Handle */}
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-3" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  Your Custom Combo ({totalItemsCount} items)
                </h3>
                <span className="text-[11px] text-slate-400">
                  {discountPercent > 0
                    ? `🎉 ${discountPercent}% Bundle Savings Applied!`
                    : "Add 1 more item to unlock 5% bundle discount"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {selectedItems.length > 0 && (
                  <button
                    onClick={handleClearCombo}
                    className="text-[11px] text-red-400 hover:text-red-300 font-bold px-2 py-1"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setIsBottomSheetOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Selected Items Scrollable List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 divide-y divide-slate-800/60">
              {selectedItems.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">Your combo is empty</p>
                  <button
                    onClick={() => setIsBottomSheetOpen(false)}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold"
                  >
                    Browse Equipment
                  </button>
                </div>
              ) : (
                selectedItems.map((item, idx) => (
                  <div
                    key={`${item.product.id}-${idx}`}
                    className="pt-2.5 first:pt-0 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-slate-950 p-1 flex-shrink-0 flex items-center justify-center">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          width={44}
                          height={44}
                          className="object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-white block truncate">
                          {item.product.name}
                        </span>
                        {item.selectedVariant && (
                          <span className="text-[10px] text-slate-400 block">
                            Option: {item.selectedVariant}
                          </span>
                        )}
                        <span className="text-xs font-extrabold text-red-400">
                          NPR {(item.product.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Quantity & Delete Controls */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-700 bg-slate-800 rounded-lg">
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, -1, item.selectedVariant)}
                          className="p-1 text-slate-300 hover:text-white"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-white min-w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, 1, item.selectedVariant)}
                          className="p-1 text-slate-300 hover:text-white"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.product.id, item.selectedVariant)}
                        className="p-1 text-slate-500 hover:text-red-400 transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Price Calculations Breakdown */}
            {selectedItems.length > 0 && (
              <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span>NPR {rawSubtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Bundle Discount ({discountPercent}%):</span>
                    <span>- NPR {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-white pt-1 border-t border-slate-800">
                  <span>Final Combo Total:</span>
                  <span className="text-red-400">
                    NPR {finalTotal.toLocaleString()}
                  </span>
                </div>

                {/* Add To Cart CTA */}
                <button
                  onClick={handleAddComboToCart}
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-red-600/30 mt-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add Entire Combo to Cart</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. VARIANT SELECTOR MODAL (Size / Handle) */}
      {variantModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setVariantModalProduct(null)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="relative z-10 w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-white">Select Size / Option</h4>
              <button
                onClick={() => setVariantModalProduct(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Choose your size/variant for <strong>{variantModalProduct.name}</strong>:
            </p>

            <div className="grid grid-cols-3 gap-2">
              {(variantModalProduct.specs?.handleStyle || []).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setChosenVariant(opt)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition ${
                    chosenVariant === opt
                      ? "bg-red-600 text-white border-red-500"
                      : "bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (variantModalProduct) {
                  handleAddProduct(variantModalProduct, chosenVariant);
                  setVariantModalProduct(null);
                }
              }}
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl"
            >
              Add with Option: {chosenVariant}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
