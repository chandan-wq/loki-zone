"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { Product } from "@/data/products";

interface Props {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onAddToCart: () => void;
}

export default function ProductCard({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
}: Props) {
  const discount = product.discountPercent
    ? product.discountPercent
    : product.originalPrice && product.originalPrice > product.price
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
        <div className="flex items-center gap-1.5 truncate pointer-events-auto">
          <span className="text-[10px] sm:text-xs font-mono font-bold text-gray-800 bg-white/95 backdrop-blur-md border border-gray-200/80 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-wider truncate shadow-xs">
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
          aria-label="Add to wishlist"
          className={`p-2 sm:p-2.5 rounded-full transition shadow-xs pointer-events-auto cursor-pointer ${
            isWishlisted
              ? "bg-red-50 text-red-600"
              : "bg-white/95 backdrop-blur-md text-gray-600 hover:text-red-600 hover:bg-white"
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-600" : ""}`} />
        </button>
      </div>

      {/* 3. Sleek Bottom Frosted Glass Overlay (Title, Price, & Quick Add-to-Bag) */}
      <div className="relative z-10 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/85 to-transparent pt-8 sm:pt-10 flex items-end justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Link href={`/products/${product.id}`} className="block">
            <h3 className="text-sm sm:text-base font-bold sm:font-black text-white group-hover:text-red-400 transition-colors line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-sm sm:text-base font-black text-white truncate">
              NPR {product.price.toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-gray-300 line-through">
                NPR {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onAddToCart}
          aria-label="Add to cart"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition shadow-md shrink-0 active:scale-90 cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
