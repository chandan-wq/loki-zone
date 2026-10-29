"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, ArrowLeft, TrendingUp } from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { useAdminStore } from "@/store/useAdminStore";
import { searchProducts } from "@/lib/search";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { products: storeProducts } = useAdminStore();
  const allProducts = storeProducts && storeProducts.length > 0 ? storeProducts : PRODUCTS;

  // Keyboard Escape listener to preserve genuine keyboard-shortcut behavior
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when search modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Enhanced search matching logic across all product fields, categories & synonyms
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    return searchProducts(query, allProducts);
  }, [query, allProducts]);

  const popularSearches = [
    "TT racket",
    "racket",
    "balls",
    "shoes",
    "Dragon 10",
    "jersey",
    "rubber",
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim();
    if (!clean) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(clean)}`);
  };

  const handleSelectSuggestion = (item: string) => {
    onClose();
    router.push(`/search?q=${encodeURIComponent(item)}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative min-h-screen flex items-start justify-center pt-16 sm:pt-20 px-4 sm:px-6">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
          {/* Search Input Bar with Clear Back Control */}
          <form onSubmit={handleFormSubmit} className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
            {/* Clear Back Control: Replaces confusing ESC label with an intuitive Back button */}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-200/80 hover:bg-gray-300 text-gray-800 rounded-full text-xs sm:text-sm font-bold transition cursor-pointer shrink-0"
              aria-label="Back to page"
              title="Back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <Search className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search table tennis rackets, rubber, apparel, accessories..."
              className="w-full bg-transparent border-none text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
                aria-label="Clear search input"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer shadow-sm shadow-red-600/30"
            >
              Search
            </button>
          </form>

          {/* Results or Suggestions */}
          <div className="p-5 sm:p-6 max-h-[60vh] overflow-y-auto">
            {query.trim() === "" ? (
              <div>
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                  <TrendingUp className="w-4 h-4 text-red-600" />
                  <span>Popular Searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      className="px-3.5 py-1.5 text-xs sm:text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full transition cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">
                    Found <strong className="text-gray-900">{searchResults.length}</strong> product
                    {searchResults.length > 1 ? "s" : ""}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                    }}
                    className="text-xs font-bold text-red-600 hover:text-red-700 transition flex items-center gap-1"
                  >
                    <span>View all on dedicated page &rarr;</span>
                  </button>
                </div>
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100 group gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200/60">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold tracking-wider text-red-600 uppercase">
                          {product.category}
                        </span>
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-red-600 transition truncate">
                          {product.name}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {product.series}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <span className="text-sm sm:text-base font-bold text-gray-900">
                        NPR {product.price.toLocaleString()}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-black group-hover:translate-x-1 transition" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <p className="font-bold text-gray-800 text-base">No products found for &ldquo;{query}&rdquo;</p>
                <p className="text-xs text-gray-400 mt-1">
                  Try searching for keywords like &ldquo;TT racket&rdquo;, &ldquo;balls&rdquo;, or &ldquo;shoes&rdquo;.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                  }}
                  className="mt-4 px-5 py-2 bg-black text-white text-xs font-bold rounded-full hover:bg-neutral-800 transition"
                >
                  Open Dedicated Search Page
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
