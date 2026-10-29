"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { useCartStore } from "@/store/useCartStore";
import { useAdminStore } from "@/store/useAdminStore";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addItem } = useCartStore();
  const { products: storeProducts } = useAdminStore();
  const allProducts = storeProducts && storeProducts.length > 0 ? storeProducts : PRODUCTS;

  const wishlistedProducts = allProducts.filter((p) => wishlist.includes(p.id));

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-6 border-b border-gray-100">
          <div>
            <h1 className="text-3xl font-black text-gray-950 tracking-tight">
              My Saved Items
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {wishlistedProducts.length} tournament items saved to your wishlist.
            </p>
          </div>
          <Link
            href="/category/all"
            className="text-xs font-bold text-red-600 hover:underline"
          >
            Explore More Products →
          </Link>
        </div>

        {wishlistedProducts.length === 0 ? (
          <div className="text-center py-24 bg-gray-50 rounded-3xl mt-8 border border-gray-100">
            <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Your wishlist is empty</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Save your favorite rackets, jerseys, and accessories to keep track of them here.
            </p>
            <Link
              href="/category/all"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition shadow-md"
            >
              <span>Discover Gear</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mt-6 sm:mt-8">
            {wishlistedProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition flex flex-col justify-between"
              >
                <div className="relative aspect-square bg-gray-50 p-2 sm:p-6">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    aria-label="Remove item"
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full bg-white text-red-600 shadow-sm hover:bg-red-50 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>

                <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-red-600 uppercase tracking-widest block">
                      {product.category}
                    </span>
                    <Link href={`/products/${product.id}`} className="block mt-0.5 sm:mt-1">
                      <h4 className="font-bold sm:font-black text-xs sm:text-sm text-gray-900 group-hover:text-red-600 transition line-clamp-1 leading-snug">
                        {product.name}
                      </h4>
                    </Link>
                    <span className="text-xs sm:text-sm font-black text-gray-950 block mt-1 sm:mt-2 truncate">
                      NPR {product.price.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      addItem({
                        id: product.id,
                        name: product.name,
                        brand: product.brand,
                        price: product.price,
                        image: product.image,
                        category: product.category,
                      });
                      toggleWishlist(product.id);
                    }}
                    className="w-full mt-2.5 sm:mt-4 py-2 sm:py-2.5 bg-black hover:bg-red-600 text-white rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Move to Bag</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
