"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Heart, ShoppingBag, Eye } from "lucide-react";
import { PRODUCTS, Product } from "@/data/products";
import { useCartStore } from "@/store/useCartStore";
import { useAdminStore } from "@/store/useAdminStore";
import ProductCard from "./ProductCard";

export default function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState<string>("All");
  const { addItem, toggleWishlist, isInWishlist } = useCartStore();
  const { products: storeProducts } = useAdminStore();
  const allProducts = storeProducts && storeProducts.length > 0 ? storeProducts : PRODUCTS;

  const tabs = ["All", "Rackets", "Apparel", "Footwear", "Accessories"];

  const filteredProducts =
    activeTab === "All"
      ? allProducts
      : allProducts.filter((p) => p.category === activeTab);

  return (
    <section className="py-20 bg-gray-50/60 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
              Tournament Ready
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight mt-1">
              Featured Products
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Precision crafted gear engineered to give you the competitive edge.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2 mt-6 md:mt-0">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-bold rounded-full transition-all ${
                  activeTab === tab
                    ? "bg-black text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
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
                  selectedColor: product.category === "Rackets" ? "Red" : undefined,
                  selectedHandle:
                    product.category === "Rackets" ? "FL (Flared)" : undefined,
                })
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
