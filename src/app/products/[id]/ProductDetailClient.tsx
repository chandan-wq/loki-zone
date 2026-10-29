"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Check,
  Award,
  Zap,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { PRODUCTS, Product } from "@/data/products";
import { useCartStore } from "@/store/useCartStore";
import { useAdminStore } from "@/store/useAdminStore";

export default function ProductDetailClient({ productId }: { productId: string }) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const { products: storeProducts } = useAdminStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const allProducts = isMounted && storeProducts && storeProducts.length > 0 ? storeProducts : PRODUCTS;
  const product = allProducts.find((p) => p.id === productId);

  // During SSR or before client hydration completes, if not in static catalog, show clean loading state
  if (!isMounted && !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Once mounted, strictly trigger 404 if product is not found in either static catalog or local store
  if (isMounted && !product) {
    notFound();
  }

  if (!product) {
    return null;
  }

  const { addItem, toggleWishlist, isInWishlist } = useCartStore();
  const isWishlisted = isInWishlist(product.id);

  // Gallery Images - Authentic local assets
  const galleryImages = useMemo(() => {
    if (product.additionalImages && product.additionalImages.length > 0) {
      const extra = product.additionalImages.filter((img) => img !== product.image);
      return [product.image, ...extra];
    }
    if (product.category === "Rackets") {
      return [
        product.image,
        "/images/rubber-macro.png",
        "/images/detail-blade.png",
        "/images/detail-handle.png",
      ];
    }
    if (product.category === "Balls") {
      return [product.image, "/images/thumb-balls.png"];
    }
    if (product.category === "Accessories" && product.id === "loki-hardcase-pro") {
      return [product.image, "/images/thumb-case.png"];
    }
    return [product.image];
  }, [product]);

  // Gallery, Quantity & Variant states
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Category-specific variant configurations
  const isRacket = product.category === "Rackets";
  const isApparel = product.category === "Apparel";
  const isFootwear = product.category === "Footwear";
  const requiresSize = isApparel || isFootwear;

  const availableHandles = product.specs?.handleStyle || ["FL (Flared)", "ST (Straight)", "AN (Anatomic)"];
  const [selectedColor, setSelectedColor] = useState("Red");
  const [selectedHandle, setSelectedHandle] = useState(availableHandles[0] || "FL (Flared)");

  // Apparel & Footwear sizing options
  const apparelSizes = ["S", "M", "L", "XL", "XXL"];
  const shoeSizes = ["EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44"];
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [sizeError, setSizeError] = useState(false);

  // Stock calculations
  const maxStock = product.inStock && product.stockCount > 0 ? product.stockCount : 0;
  const isOutOfStock = maxStock === 0;

  // Reset indices and quantity when viewing a different product
  useEffect(() => {
    setActiveImageIndex(0);
    setQuantity(1);
    setSelectedColor("Red");
    if (availableHandles[0]) {
      setSelectedHandle(availableHandles[0]);
    }
    setSelectedSize("");
    setSizeError(false);
  }, [productId, availableHandles]);

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setQuantity((prev) => Math.min(maxStock, prev + 1));
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    if (requiresSize && !selectedSize) {
      setSizeError(true);
      return;
    }

    addItem(
      {
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image, // Authentic product image
        category: product.category,
        selectedColor: isRacket ? selectedColor : undefined,
        selectedHandle: isRacket ? selectedHandle : undefined,
        selectedSize: requiresSize ? selectedSize : undefined,
      },
      quantity
    );

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;

    if (requiresSize && !selectedSize) {
      setSizeError(true);
      return;
    }

    addItem(
      {
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        category: product.category,
        selectedColor: isRacket ? selectedColor : undefined,
        selectedHandle: isRacket ? selectedHandle : undefined,
        selectedSize: requiresSize ? selectedSize : undefined,
      },
      quantity
    );
    router.push("/checkout");
  };

  // Related products (prioritize same category)
  const relatedProducts = useMemo(() => {
    const sameCategory = allProducts.filter(
      (p) => p.id !== product.id && p.category === product.category
    );
    const otherCategory = allProducts.filter(
      (p) => p.id !== product.id && p.category !== product.category
    );
    return [...sameCategory, ...otherCategory].slice(0, 4);
  }, [allProducts, product]);

  const hasTechnicalSpecs = Boolean(
    product.specs &&
      (product.specs.bladeType ||
        product.specs.rubber ||
        product.specs.weight ||
        product.specs.speed !== undefined)
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-red-500 selection:text-white pb-20 lg:pb-0">
      {/* 1. Breadcrumbs Bar */}
      <nav
        aria-label="Breadcrumb"
        className="border-b border-gray-100 bg-gray-50/70 py-3.5"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center flex-wrap gap-2 text-xs text-gray-500">
            <li>
              <Link href="/" className="hover:text-red-600 transition font-medium">
                Home
              </Link>
            </li>
            <li className="text-gray-300">/</li>
            <li>
              <Link href="/category/all" className="hover:text-red-600 transition font-medium">
                Shop
              </Link>
            </li>
            <li className="text-gray-300">/</li>
            <li>
              <Link
                href={`/category/${product.category.toLowerCase()}`}
                className="hover:text-red-600 transition font-medium"
              >
                {product.category}
              </Link>
            </li>
            <li className="text-gray-300">/</li>
            <li className="text-gray-900 font-semibold truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {product.name}
            </li>
          </ol>
        </div>
      </nav>

      {/* 2. Main Product Showcase */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
            {/* Gallery Column (7 cols) */}
            <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4 items-start">
              {/* Thumbnail Rail (only if multiple images) */}
              {galleryImages.length > 1 && (
                <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0 w-full md:w-20 shrink-0">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      aria-label={`View image ${idx + 1}`}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-gray-50 ${
                        activeImageIndex === idx
                          ? "border-red-600 ring-2 ring-red-600/20 shadow-md scale-102"
                          : "border-gray-200 hover:border-gray-300 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} view ${idx + 1}`}
                        fill
                        sizes="(max-width: 768px) 64px, 80px"
                        className="object-contain p-1.5"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image Stage */}
              <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square bg-gradient-to-b from-gray-50 via-white to-gray-50 rounded-3xl border border-gray-200/80 overflow-hidden flex items-center justify-center p-6 sm:p-10 group shadow-sm">
                {/* Main Product Image */}
                <div className="relative w-full h-full">
                  <Image
                    src={galleryImages[activeImageIndex] || product.image}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 55vw"
                    className="object-contain transition-transform duration-500 group-hover:scale-105 select-none"
                  />
                </div>

                {/* Tags Badge Top-Left */}
                <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-white/90 text-gray-900 border border-gray-200 shadow-sm backdrop-blur-md">
                    <Sparkles className="w-3 h-3 text-red-600" />
                    {product.tags?.[0] || product.brand}
                  </span>
                </div>

                {/* Slider Nav & Page Counter (if multiple images) */}
                {galleryImages.length > 1 && (
                  <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/95 text-gray-800 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md border border-gray-200 text-xs font-semibold">
                    <span>
                      0{activeImageIndex + 1} / 0{galleryImages.length}
                    </span>
                    <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
                      <button
                        onClick={() =>
                          setActiveImageIndex((prev) =>
                            prev === 0 ? galleryImages.length - 1 : prev - 1
                          )
                        }
                        aria-label="Previous image"
                        className="hover:text-red-600 p-0.5"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setActiveImageIndex((prev) =>
                            prev === galleryImages.length - 1 ? 0 : prev + 1
                          )
                        }
                        aria-label="Next image"
                        className="hover:text-red-600 p-0.5"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Details & Purchase Actions (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Eyebrow & Brand Series */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold tracking-widest text-red-600 uppercase">
                    {product.brand} • {product.series}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-gray-950 tracking-tight leading-tight mt-1">
                  {product.name}
                </h1>

                {product.subtitle && (
                  <p className="text-sm font-medium text-gray-500 mt-1">
                    {product.subtitle}
                  </p>
                )}

                {/* Rating & Social Proof */}
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-200 fill-gray-200"
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-gray-800 ml-1">
                      {product.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500 font-medium">
                    {product.reviewsCount} verified reviews
                  </span>
                  {product.weeklyVelocity && product.weeklyVelocity > 25 && (
                    <>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs font-semibold text-red-600 flex items-center gap-1">
                        <Zap className="w-3 h-3 fill-red-600" />
                        {product.weeklyVelocity} bought this week
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Price & Stock Status Bar */}
              <div className="pt-2 pb-4 border-y border-gray-100 flex items-baseline justify-between flex-wrap gap-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-gray-950">
                    NPR {product.price.toLocaleString()}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-sm sm:text-base font-medium text-gray-400 line-through">
                      NPR {product.originalPrice.toLocaleString()}
                    </span>
                  )}
                  {product.discountPercent && (
                    <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200/80 px-2.5 py-0.5 rounded-full uppercase">
                      SAVE {product.discountPercent}%
                    </span>
                  )}
                </div>

                {/* Accurate Stock Badge */}
                <div>
                  {product.inStock && product.stockCount > 0 ? (
                    product.stockCount <= 10 ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Only {product.stockCount} left in stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        In Stock ({product.stockCount} units)
                      </span>
                    )
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-800 bg-rose-50 px-3 py-1 rounded-full border border-rose-200/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                {product.description}
              </p>

              {/* Racket-Specific Selectors: Rubber Color & Handle Style */}
              {isRacket && (
                <div className="space-y-4 pt-2">
                  {/* Rubber Color */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm font-bold uppercase tracking-wider">
                      <span className="text-gray-500">Rubber Color:</span>
                      <span className="text-gray-900">{selectedColor}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedColor("Red")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition ${
                          selectedColor === "Red"
                            ? "border-red-600 bg-red-50 text-red-700 ring-2 ring-red-600/20 shadow-sm"
                            : "border-gray-200 text-gray-700 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full bg-red-600 shadow-sm inline-block" />
                        <span>Red Rubber</span>
                        {selectedColor === "Red" && <Check className="w-3.5 h-3.5 ml-1 text-red-600" />}
                      </button>

                      <button
                        onClick={() => setSelectedColor("Black")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition ${
                          selectedColor === "Black"
                            ? "border-gray-950 bg-gray-900 text-white ring-2 ring-gray-900/20 shadow-sm"
                            : "border-gray-200 text-gray-700 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full bg-gray-900 shadow-sm inline-block border border-gray-600" />
                        <span>Black Rubber</span>
                        {selectedColor === "Black" && <Check className="w-3.5 h-3.5 ml-1 text-white" />}
                      </button>
                    </div>
                  </div>

                  {/* Handle Style */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm font-bold uppercase tracking-wider">
                      <span className="text-gray-500">Handle Grip:</span>
                      <span className="text-gray-900">{selectedHandle}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {availableHandles.map((style) => (
                        <button
                          key={style}
                          onClick={() => setSelectedHandle(style)}
                          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold text-center border transition ${
                            selectedHandle === style
                              ? "border-red-600 bg-red-600 text-white shadow-md shadow-red-600/20"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Apparel Clothing Size Selector (Jerseys & Shorts) */}
              {isApparel && (
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-xs sm:text-sm font-bold uppercase tracking-wider">
                    <span className="text-gray-500">
                      Clothing Size:{" "}
                      <span className={selectedSize ? "text-gray-950 font-black" : "text-amber-600 font-medium normal-case"}>
                        {selectedSize || "(Select a size)"}
                      </span>
                    </span>
                    <span className="text-xs font-semibold text-gray-500 normal-case">
                      Standard Athletic Fit
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {apparelSizes.map((size) => {
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            setSelectedSize(size);
                            setSizeError(false);
                          }}
                          className={`h-11 rounded-xl text-sm font-bold border transition flex items-center justify-center ${
                            isSelected
                              ? "border-red-600 bg-red-600 text-white shadow-md shadow-red-600/20"
                              : sizeError
                              ? "border-red-300 bg-red-50/50 text-gray-800 hover:border-red-500"
                              : "border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>

                  {sizeError && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-50 px-3.5 py-2.5 rounded-xl border border-red-200 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Please select a clothing size (S–XXL) to continue.</span>
                    </div>
                  )}

                  <p className="text-xs text-gray-400">
                    * S–XXL sizing options available. Inventory validation is based on total product stock ({product.stockCount} units available).
                  </p>
                </div>
              )}

              {/* Footwear Shoe Size Selector (Court Shoes) */}
              {isFootwear && (
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-xs sm:text-sm font-bold uppercase tracking-wider">
                    <span className="text-gray-500">
                      Shoe Size:{" "}
                      <span className={selectedSize ? "text-gray-950 font-black" : "text-amber-600 font-medium normal-case"}>
                        {selectedSize || "(Select EU size)"}
                      </span>
                    </span>
                    <span className="text-xs font-semibold text-gray-500 normal-case">
                      EU Standard Sizing
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {shoeSizes.map((size) => {
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            setSelectedSize(size);
                            setSizeError(false);
                          }}
                          className={`h-11 rounded-xl text-sm font-bold border transition flex items-center justify-center ${
                            isSelected
                              ? "border-red-600 bg-red-600 text-white shadow-md shadow-red-600/20"
                              : sizeError
                              ? "border-red-300 bg-red-50/50 text-gray-800 hover:border-red-500"
                              : "border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>

                  {sizeError && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-50 px-3.5 py-2.5 rounded-xl border border-red-200 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Please select your shoe size (EU 39–44) to continue.</span>
                    </div>
                  )}

                  <p className="text-xs text-gray-400">
                    * EU 39–44 size options offered pending individual size inventory breakdown. Total model stock: {product.stockCount} pairs.
                  </p>
                </div>
              )}

              {/* Quantity Selector & Add to Cart Action */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  {/* Quantity Counter */}
                  <div className="flex items-center shrink-0">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      disabled={quantity <= 1 || isOutOfStock}
                      aria-label="Decrease quantity"
                      className="w-10 h-12 flex items-center justify-center rounded-l-2xl border border-r-0 border-gray-200 bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-12 h-12 flex items-center justify-center border-y border-gray-200 text-sm font-bold text-gray-900 bg-white">
                      {quantity}
                    </div>
                    <button
                      type="button"
                      onClick={handleIncrement}
                      disabled={quantity >= maxStock || isOutOfStock}
                      aria-label="Increase quantity"
                      className="w-10 h-12 flex items-center justify-center rounded-r-2xl border border-l-0 border-gray-200 bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Add to Bag CTA */}
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all duration-200 ${
                      isOutOfStock
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                        : addedAnimation
                        ? "bg-emerald-600 text-white shadow-emerald-600/20"
                        : "bg-red-600 hover:bg-red-700 text-white shadow-red-600/25 active:scale-[0.99]"
                    }`}
                  >
                    {isOutOfStock ? (
                      <span>Out of Stock</span>
                    ) : addedAnimation ? (
                      <>
                        <Check className="w-4 h-4 text-white animate-bounce" />
                        <span>Added {quantity > 1 ? `(${quantity})` : ""} to Bag!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add to Bag — NPR {(product.price * quantity).toLocaleString()}</span>
                      </>
                    )}
                  </button>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    className={`w-12 h-12 shrink-0 rounded-2xl border transition flex items-center justify-center shadow-sm ${
                      isWishlisted
                        ? "border-red-600 bg-red-50 text-red-600"
                        : "border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 bg-white"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${isWishlisted ? "fill-red-600 text-red-600" : ""}`}
                    />
                  </button>
                </div>

                {/* Instant 1-Click Buy Now Button */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="w-full h-12 rounded-2xl font-bold text-sm bg-black hover:bg-neutral-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white flex items-center justify-center gap-2 transition shadow-md active:scale-[0.99]"
                >
                  <Zap className="w-4 h-4 fill-white text-white" />
                  <span>Buy Now (Cash on Delivery)</span>
                </button>
              </div>

              {/* Service & Delivery Benefits Strip */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-4 border-t border-gray-100 text-center">
                <div className="flex flex-col items-center p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gray-50/70 border border-gray-100">
                  <Truck className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-red-600 mb-1" />
                  <span className="text-xs sm:text-sm font-bold text-gray-950 leading-tight">
                    Free Delivery
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Over NPR 2,000</span>
                </div>

                <div className="flex flex-col items-center p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gray-50/70 border border-gray-100">
                  <RotateCcw className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-red-600 mb-1" />
                  <span className="text-xs sm:text-sm font-bold text-gray-950 leading-tight">
                    7 Days Return
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Easy replace</span>
                </div>

                <div className="flex flex-col items-center p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gray-50/70 border border-gray-100">
                  <ShieldCheck className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-red-600 mb-1" />
                  <span className="text-xs sm:text-sm font-bold text-gray-950 leading-tight">
                    100% Genuine
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-500 mt-0.5">ITTF Certified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Technical Specifications Section (Only rendered if genuine specs exist) */}
      {hasTechnicalSpecs && (
        <section className="py-12 lg:py-16 bg-gray-50/50 border-t border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-8">
              <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
                ENGINEERING & PERFORMANCE
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight mt-1">
                Technical Specifications
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Authentic factory metrics and materials configured for high-level competitive table tennis.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Performance Metrics (Sliders/Bars) */}
              <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-sm space-y-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 pb-2 border-b border-gray-100 flex items-center justify-between">
                  <span>Performance Ratings</span>
                  <Award className="w-4 h-4 text-red-600" />
                </h3>

                {product.specs?.speed !== undefined && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-gray-700">
                      <span>Speed</span>
                      <span className="text-red-600">{product.specs.speed} / 100</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-red-600 rounded-full transition-all duration-700"
                        style={{ width: `${product.specs.speed}%` }}
                      />
                    </div>
                  </div>
                )}

                {product.specs?.spin !== undefined && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-gray-700">
                      <span>Spin</span>
                      <span className="text-red-600">{product.specs.spin} / 100</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-red-600 rounded-full transition-all duration-700"
                        style={{ width: `${product.specs.spin}%` }}
                      />
                    </div>
                  </div>
                )}

                {product.specs?.control !== undefined && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-gray-700">
                      <span>Control</span>
                      <span className="text-red-600">{product.specs.control} / 100</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-red-600 rounded-full transition-all duration-700"
                        style={{ width: `${product.specs.control}%` }}
                      />
                    </div>
                  </div>
                )}

                {product.specs?.durability !== undefined && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-gray-700">
                      <span>Durability</span>
                      <span className="text-red-600">{product.specs.durability} / 100</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-red-600 rounded-full transition-all duration-700"
                        style={{ width: `${product.specs.durability}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Data Table */}
              <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 pb-2 border-b border-gray-100">
                  Build &amp; Architecture
                </h3>
                <dl className="divide-y divide-gray-100 text-xs">
                  {product.specs?.bladeType && (
                    <div className="py-3 flex justify-between">
                      <dt className="text-gray-500 font-medium">Blade Composition</dt>
                      <dd className="font-bold text-gray-900">{product.specs.bladeType}</dd>
                    </div>
                  )}

                  {product.specs?.rubber && (
                    <div className="py-3 flex justify-between">
                      <dt className="text-gray-500 font-medium">Rubber Formulation</dt>
                      <dd className="font-bold text-gray-900">{product.specs.rubber}</dd>
                    </div>
                  )}

                  {product.specs?.handleStyle && product.specs.handleStyle.length > 0 && (
                    <div className="py-3 flex justify-between">
                      <dt className="text-gray-500 font-medium">Handle Geometry</dt>
                      <dd className="font-bold text-gray-900">
                        {product.specs.handleStyle.join(", ")}
                      </dd>
                    </div>
                  )}

                  {product.specs?.weight && (
                    <div className="py-3 flex justify-between">
                      <dt className="text-gray-500 font-medium">Approximate Weight</dt>
                      <dd className="font-bold text-gray-900">{product.specs.weight}</dd>
                    </div>
                  )}

                  {product.specs?.playingStyle && (
                    <div className="py-3 flex justify-between">
                      <dt className="text-gray-500 font-medium">Recommended Play Style</dt>
                      <dd className="font-bold text-gray-900">{product.specs.playingStyle}</dd>
                    </div>
                  )}

                  <div className="py-3 flex justify-between">
                    <dt className="text-gray-500 font-medium">Brand Origin</dt>
                    <dd className="font-bold text-gray-900">Official {product.brand} Nepal</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Related & Recommended Gear Section */}
      <section className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
                EXPLORE MORE
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight mt-1">
                Complete Your Setup
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Authentic gear paired to elevate your training and match performance.
              </p>
            </div>

            <Link
              href="/category/all"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 transition"
            >
              <span>View All Gear</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.id}`}
                className="group bg-white rounded-2xl sm:rounded-3xl border border-gray-150 overflow-hidden shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Stage */}
                <div className="relative aspect-square bg-gray-50/70 p-2 sm:p-6 flex items-center justify-center overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-contain p-1 sm:p-4 group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2 left-2 sm:top-3 sm:left-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-white/95 px-2 py-0.5 rounded-full border border-gray-200 text-gray-700 truncate max-w-[70%]">
                    {item.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] sm:text-xs font-bold text-red-600 tracking-wider uppercase block">
                      {item.brand}
                    </span>
                    <h3 className="font-bold sm:font-black text-sm sm:text-base text-gray-950 group-hover:text-red-600 transition-colors line-clamp-1 mt-0.5 leading-snug">
                      {item.name}
                    </h3>
                  </div>

                  <div className="mt-2.5 sm:mt-4 pt-2.5 sm:pt-3 border-t border-gray-100 flex items-center justify-between gap-1">
                    <div className="min-w-0">
                      <span className="text-sm sm:text-base font-black text-gray-950 block truncate">
                        NPR {item.price.toLocaleString()}
                      </span>
                      {item.originalPrice > item.price && (
                        <span className="text-xs sm:text-sm text-gray-400 line-through truncate block">
                          NPR {item.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <span className="text-xs sm:text-sm font-semibold text-red-600 group-hover:translate-x-0.5 transition-transform shrink-0">
                      View &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/category/all"
              className="inline-flex items-center gap-1.5 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full text-sm font-bold transition"
            >
              <span>View All Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Mobile Sticky Add to Bag Bar (Shows on mobile viewports for effortless purchase) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[11px] text-gray-500 font-medium block truncate max-w-[170px] sm:max-w-xs">
            {product.name}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-gray-950">
              NPR {product.price.toLocaleString()}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                NPR {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`h-11 px-5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] shrink-0 ${
            isOutOfStock
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : addedAnimation
              ? "bg-emerald-600 text-white"
              : "bg-red-600 hover:bg-red-700 text-white shadow-red-600/30"
          }`}
        >
          {isOutOfStock ? (
            <span>Out of Stock</span>
          ) : addedAnimation ? (
            <>
              <Check className="w-4 h-4 text-white animate-bounce" />
              <span>Added!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Bag</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
