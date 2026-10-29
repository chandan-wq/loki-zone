"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  ChevronDown,
  Star,
  Heart,
  ShoppingBag,
  Grid3X3,
  List,
  Check,
  X,
  Filter,
} from "lucide-react";
import { PRODUCTS, Product } from "@/data/products";
import { useCartStore } from "@/store/useCartStore";
import { useAdminStore } from "@/store/useAdminStore";

export default function CategoryClient({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const typeFilter = searchParams.get("type");
  const seriesFilter = searchParams.get("series");
  const searchQuery = searchParams.get("q") || searchParams.get("search");

  const { addItem, toggleWishlist, isInWishlist } = useCartStore();
  const { products: storeProducts } = useAdminStore();
  const allProducts = storeProducts && storeProducts.length > 0 ? storeProducts : PRODUCTS;

  const [selectedCategory, setSelectedCategory] = useState<string>(
    slug === "all" || slug === "new" || slug === "best-sellers" || slug === "deals"
      ? "All"
      : slug.charAt(0).toUpperCase() + slug.slice(1)
  );

  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const categoriesList = ["All", "Rackets", "Apparel", "Footwear", "Accessories", "Balls"];

  // Dynamic Page Heading & Subtitle
  let pageTitle = selectedCategory === "All" ? "All Table Tennis Equipment" : selectedCategory;
  let pageSubtitle = "ITTF-certified rackets, responsive rubber sheets, match apparel, and club gear designed for competitive performance.";

  if (slug === "new") {
    pageTitle = "New Arrivals & Latest Drops";
    pageSubtitle = "The newest championship rackets, rubber formulations, and tournament apparel in Nepal.";
  } else if (slug === "best-sellers") {
    pageTitle = "Tournament Best Sellers";
    pageSubtitle = "Top-rated competition gear chosen by leading table tennis academies and club champions.";
  } else if (slug === "deals") {
    pageTitle = "Special Deals & Promotional Offers";
    pageSubtitle = "Limited-time discounts and equipment value bundles on official ITTF gear.";
  } else if (typeFilter) {
    pageTitle = `${typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)} Collection`;
    pageSubtitle = `Curated selection of high-performance ${typeFilter} table tennis equipment.`;
  } else if (seriesFilter) {
    pageTitle = `LOKI ${seriesFilter.toUpperCase()} Series`;
    pageSubtitle = "Engineered for explosive topspin speed and pinpoint offensive control.";
  }

  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((product) => {
        if (selectedCategory !== "All" && product.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
        if (product.price > maxPrice) {
          return false;
        }
        if (inStockOnly && (!product.inStock || product.stockCount <= 0)) {
          return false;
        }
        if (slug === "deals" && !product.discountPercent && product.originalPrice <= product.price) {
          return false;
        }
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const match =
            product.name.toLowerCase().includes(q) ||
            product.description.toLowerCase().includes(q) ||
            product.category.toLowerCase().includes(q) ||
            product.brand.toLowerCase().includes(q);
          if (!match) return false;
        }
        if (typeFilter) {
          const tf = typeFilter.toLowerCase();
          const fullText = `${product.name} ${product.description} ${product.category} ${JSON.stringify(
            product.specs || {}
          )} ${product.tags?.join(" ") || ""}`.toLowerCase();
          if (!fullText.includes(tf)) {
            return false;
          }
        }
        if (seriesFilter) {
          const sf = seriesFilter.toLowerCase();
          const matchSeries =
            (product.series && product.series.toLowerCase().includes(sf)) ||
            product.name.toLowerCase().includes(sf);
          if (!matchSeries) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (slug === "best-sellers" && sortBy === "featured") {
          return (b.weeklyVelocity || 0) - (a.weeklyVelocity || 0);
        }
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "rating") return b.rating - a.rating;
        return 0;
      });
  }, [
    allProducts,
    selectedCategory,
    maxPrice,
    inStockOnly,
    sortBy,
    slug,
    typeFilter,
    seriesFilter,
    searchQuery,
  ]);

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gradient-to-r from-neutral-900 to-black text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
            OFFICIAL TOURNAMENT CATALOG
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mt-1">
            {pageTitle}
          </h1>
          <p className="text-sm text-gray-400 mt-2 max-w-xl">
            {pageSubtitle}
          </p>
          {(typeFilter || seriesFilter || searchQuery) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-800/80 text-xs">
              <span className="text-gray-400">Active filter:</span>
              <span className="px-3 py-1 rounded-full bg-red-600/30 border border-red-500/50 text-red-300 font-semibold flex items-center gap-1.5">
                <span>
                  {typeFilter ? `Type: ${typeFilter}` : seriesFilter ? `Series: ${seriesFilter}` : `Search: ${searchQuery}`}
                </span>
                <Link href={`/category/${slug}`} className="hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </Link>
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Mobile Filter Toggle Bar */}
        <div className="lg:hidden mb-5">
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="w-full py-3.5 px-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-sm font-bold text-gray-900 flex items-center justify-between transition cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-red-600" />
              <span>Filter Equipment {selectedCategory !== "All" ? `(${selectedCategory})` : ""}</span>
            </div>
            <span className="text-xs font-semibold text-gray-600">
              {isMobileFiltersOpen ? "Hide Filters ▲" : "Show Filters ▼"}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Filters Sidebar: Collapsible on mobile, always present on desktop */}
          <div className={`lg:col-span-1 space-y-6 ${isMobileFiltersOpen ? "block" : "hidden lg:block"}`}>
            <div className="p-5 sm:p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-gray-700" />
                  <h3 className="font-bold text-sm text-gray-900">Filters</h3>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setMaxPrice(5000);
                    setInStockOnly(false);
                  }}
                  className="text-xs text-red-600 hover:underline font-semibold"
                >
                  Reset
                </button>
              </div>

              {/* Category Filter */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                  Categories
                </h4>
                <div className="space-y-1.5">
                  {categoriesList.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                        selectedCategory === cat
                          ? "bg-black text-white"
                          : "text-gray-600 hover:bg-gray-200/60"
                      }`}
                    >
                      <span>{cat}</span>
                      {selectedCategory === cat && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter Slider */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between text-xs font-bold text-gray-700 mb-2">
                  <span>Max Price:</span>
                  <span className="text-red-600 font-mono">
                    NPR {maxPrice.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="300"
                  max="5000"
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>NPR 300</span>
                  <span>NPR 5,000</span>
                </div>
              </div>

              {/* In Stock Toggle */}
              <div className="pt-2 border-t border-gray-200">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500 accent-red-600"
                  />
                  <span>In Stock Items Only</span>
                </label>
              </div>
            </div>
          </div>

          {/* Products Column */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-500">
                Showing <strong className="text-gray-900">{filteredProducts.length}</strong> products
              </span>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500 font-medium">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    <option value="featured">Featured First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Top Customer Rated</option>
                  </select>
                </div>

                <div className="flex items-center border border-gray-200 rounded-lg p-0.5 bg-gray-50">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md transition ${
                      viewMode === "grid"
                        ? "bg-white shadow-sm text-black"
                        : "text-gray-400 hover:text-black"
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-md transition ${
                      viewMode === "list"
                        ? "bg-white shadow-sm text-black"
                        : "text-gray-400 hover:text-black"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="font-bold text-gray-800 text-base">No products match your filters</p>
                <p className="text-xs text-gray-500 mt-1">
                  Try adjusting the maximum price or selecting another category.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setMaxPrice(5000);
                  }}
                  className="mt-4 px-5 py-2 bg-black text-white text-xs font-semibold rounded-full hover:bg-neutral-800 transition"
                >
                  Clear All Filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCardItem
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
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <ProductListItem
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCardItem({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
}: {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onAddToCart: () => void;
}) {
  const discount = product.discountPercent
    ? product.discountPercent
    : product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group relative aspect-[4/5] sm:aspect-square w-full rounded-2xl sm:rounded-3xl bg-white border border-gray-200/90 hover:border-red-500/50 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      {/* 1. Full-Bleed Product Image Link */}
      <Link
        href={`/products/${product.id}`}
        className="absolute inset-0 p-3 sm:p-5 flex items-center justify-center bg-radial from-gray-50/90 via-gray-100/60 to-gray-50/30"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-3 sm:p-5 group-hover:scale-110 transition-transform duration-500 ease-out select-none pointer-events-none"
        />
      </Link>

      {/* 2. Top Bar: Category/Discount + Wishlist Heart Button */}
      <div className="relative z-10 p-2 sm:p-3 flex items-center justify-between gap-1 pointer-events-none">
        <div className="flex items-center gap-1 truncate pointer-events-auto">
          <span className="text-[10px] sm:text-xs font-mono font-bold text-gray-700 bg-white/95 backdrop-blur-md border border-gray-200/80 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-wider truncate shadow-xs">
            {product.category}
          </span>
          {discount > 0 && (
            <span className="text-[10px] sm:text-xs font-bold text-red-600 bg-red-50/95 backdrop-blur-md border border-red-200 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full shadow-xs shrink-0">
              {discount}% OFF
            </span>
          )}
        </div>

        <button
          onClick={onToggleWishlist}
          aria-label="Wishlist"
          className={`p-2 sm:p-2.5 rounded-full transition shadow-xs pointer-events-auto cursor-pointer ${
            isWishlisted
              ? "bg-red-50 text-red-600"
              : "bg-white/95 backdrop-blur-md text-gray-500 hover:text-red-600 hover:bg-white"
          }`}
        >
          <Heart className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isWishlisted ? "fill-red-600" : ""}`} />
        </button>
      </div>

      {/* 3. Sleek Bottom Frosted Glass Overlay (Title, Price, & Quick Add-to-Bag) */}
      <div className="relative z-10 p-2.5 sm:p-3.5 bg-gradient-to-t from-black/95 via-black/85 to-transparent pt-6 sm:pt-10 flex items-end justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Link href={`/products/${product.id}`} className="block">
            <h3 className="text-sm sm:text-base font-bold sm:font-black text-white group-hover:text-red-400 transition-colors line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-sm sm:text-base font-black text-white truncate">
              NPR {product.price.toLocaleString()}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs sm:text-sm text-gray-400 line-through">
                NPR {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onAddToCart}
          aria-label="Add to cart"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition shadow-md shrink-0 active:scale-90 cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ProductListItem({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
}: {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onAddToCart: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5 hover:shadow-lg transition">
      <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0">
        <Image src={product.image} alt={product.name} fill className="object-cover" />
      </div>

      <div className="flex-1 space-y-2 text-center sm:text-left">
        <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">
          {product.category}
        </span>
        <Link href={`/products/${product.id}`} className="block">
          <h3 className="font-bold text-gray-950 text-lg hover:text-red-600 transition">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-gray-500">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
            ))}
          </div>
          <span>({product.reviewsCount} reviews)</span>
        </div>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100">
        <div className="text-left sm:text-right">
          <span className="text-lg font-black text-gray-950 block">
            NPR {product.price.toLocaleString()}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-gray-400 line-through">
              NPR {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleWishlist}
            className={`p-2.5 rounded-xl border transition ${
              isWishlisted
                ? "border-red-600 bg-red-50 text-red-600"
                : "border-gray-200 text-gray-600 hover:border-gray-400"
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-600" : ""}`} />
          </button>
          <button
            onClick={onAddToCart}
            className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add to Bag</span>
          </button>
        </div>
      </div>
    </div>
  );
}
