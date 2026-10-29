"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Search as SearchIcon,
  SlidersHorizontal,
  X,
  PackageX,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";
import { useCartStore } from "@/store/useCartStore";
import { PRODUCTS } from "@/data/products";
import { searchProducts } from "@/lib/search";
import ProductCard from "@/components/ProductCard";

export default function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [inputVal, setInputVal] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");

  const { products: storeProducts } = useAdminStore();
  const { addItem, isInWishlist, toggleWishlist } = useCartStore();
  const allProducts = storeProducts && storeProducts.length > 0 ? storeProducts : PRODUCTS;

  // Sync if query param changes externally
  React.useEffect(() => {
    const q = searchParams.get("q") || "";
    setInputVal(q);
    setActiveQuery(q);
  }, [searchParams]);

  // Compute matched products
  const matchedProducts = useMemo(() => {
    if (!activeQuery.trim()) return [];
    return searchProducts(activeQuery, allProducts);
  }, [activeQuery, allProducts]);

  // Available categories within search results
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    matchedProducts.forEach((p) => set.add(p.category));
    return ["All", ...Array.from(set)];
  }, [matchedProducts]);

  // Filtered and sorted products
  const displayedProducts = useMemo(() => {
    let list = matchedProducts;
    if (selectedCategory !== "All") {
      list = list.filter((p) => p.category === selectedCategory);
    }

    const sorted = [...list];
    switch (sortBy) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "featured":
      default:
        sorted.sort((a, b) => b.salesCount - a.salesCount);
        break;
    }
    return sorted;
  }, [matchedProducts, selectedCategory, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputVal.trim();
    if (!clean) return;
    setActiveQuery(clean);
    setSelectedCategory("All");
    router.push(`/search?q=${encodeURIComponent(clean)}`);
  };

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/category/all");
    }
  };

  const popularSuggestions = [
    "TT racket",
    "racket",
    "balls",
    "shoes",
    "Dragon 10",
    "jersey",
    "rubber",
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 to-black text-white py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Breadcrumb & Real Back Control */}
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold transition cursor-pointer"
              aria-label="Navigate Back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <span className="text-gray-500">/</span>
            <Link href="/" className="text-gray-400 hover:text-white transition">
              Home
            </Link>
            <span className="text-gray-500">/</span>
            <span className="text-gray-200 font-medium">Search</span>
          </div>

          <div>
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest block">
              CATALOG SEARCH
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight mt-1 text-white">
              {activeQuery ? (
                <>
                  Results for <span className="text-red-400">&ldquo;{activeQuery}&rdquo;</span>
                </>
              ) : (
                "Search Table Tennis Gear"
              )}
            </h1>
            <p className="text-sm sm:text-base text-gray-400 mt-2">
              {activeQuery
                ? `Found ${matchedProducts.length} product${matchedProducts.length === 1 ? "" : "s"} matching your search query.`
                : "Type keywords such as 'TT racket', 'balls', 'shoes', or specific models to find gear."}
            </p>
          </div>

          {/* Dedicated Search Input Bar on Page */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl">
            <div className="relative flex items-center">
              <SearchIcon className="w-5 h-5 text-gray-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Search rackets, rubbers, apparel, balls, shoes..."
                className="w-full bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-gray-900 border border-white/20 focus:border-red-600 rounded-full pl-12 pr-28 py-3.5 text-sm sm:text-base placeholder:text-gray-400 focus:outline-none transition shadow-lg"
              />
              <button
                type="submit"
                className="absolute right-2 px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm transition cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Popular Tag Quick Search */}
          <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
            <span className="text-gray-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-red-400" />
              Popular:
            </span>
            {popularSuggestions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setInputVal(item);
                  setActiveQuery(item);
                  setSelectedCategory("All");
                  router.push(`/search?q=${encodeURIComponent(item)}`);
                }}
                className={`px-3 py-1 rounded-full border transition cursor-pointer ${
                  activeQuery.toLowerCase() === item.toLowerCase()
                    ? "bg-red-600 border-red-500 text-white font-bold"
                    : "bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/15"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Controls Bar: Categories & Sorting */}
        {matchedProducts.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-gray-100">
            {/* Category pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-black text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat} {cat !== "All" && `(${matchedProducts.filter((p) => p.category === cat).length})`}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs sm:text-sm shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-gray-500" />
              <span className="text-gray-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="featured">Best Matches / Popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        )}

        {/* Search Results Display */}
        {!activeQuery.trim() ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100 p-8 max-w-xl mx-auto">
            <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900">Enter a keyword to start searching</h3>
            <p className="text-sm text-gray-500 mt-1">
              Find genuine ITTF tournament-ready table tennis blades, rubbers, apparel, balls, and shoes.
            </p>
          </div>
        ) : displayedProducts.length === 0 ? (
          /* Zero-Results State */
          <div className="text-center py-16 sm:py-24 bg-gray-50/80 rounded-3xl border border-dashed border-gray-200 p-8 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <PackageX className="w-8 h-8" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-950">
              No products found for &ldquo;{activeQuery}&rdquo;
            </h3>
            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
              We couldn&apos;t find any equipment matching that term. Try checking for typos or searching for a general category.
            </p>

            {/* Help suggestions */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => {
                  setInputVal("racket");
                  setActiveQuery("racket");
                  router.push("/search?q=racket");
                }}
                className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-800 rounded-full text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Search Rackets
              </button>
              <button
                onClick={() => {
                  setInputVal("balls");
                  setActiveQuery("balls");
                  router.push("/search?q=balls");
                }}
                className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-800 rounded-full text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Search Balls
              </button>
              <button
                onClick={() => {
                  setInputVal("shoes");
                  setActiveQuery("shoes");
                  router.push("/search?q=shoes");
                }}
                className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-800 rounded-full text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Search Shoes
              </button>
              <Link
                href="/category/all"
                className="px-5 py-2 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition inline-flex items-center gap-1.5"
              >
                <span>Browse Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          /* Products Grid: using existing ProductCard component */
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isWishlisted={isInWishlist(product.id)}
                  onToggleWishlist={() => toggleWishlist(product.id)}
                  onAddToCart={() =>
                    addItem({
                      id: product.id,
                      name: product.name,
                      brand: product.brand,
                      price: product.price,
                      originalPrice: product.originalPrice,
                      image: product.image,
                      category: product.category,
                    })
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
