"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  Truck,
  ArrowLeft,
  X,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAdminStore } from "@/store/useAdminStore";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getCartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getDiscountAmount,
  } = useCartStore();

  const { storeSettings, coupons } = useAdminStore();

  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [orderNote, setOrderNote] = useState("");

  const subtotal = getCartTotal();
  const freeShippingThreshold = storeSettings.freeShippingThreshold || 2000;
  const progressToFreeShipping = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const discountAmount = getDiscountAmount(subtotal);
  const shippingFee =
    subtotal - discountAmount >= freeShippingThreshold || subtotal === 0
      ? 0
      : storeSettings.deliveryInsideValley || 100;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    if (!promoCode.trim()) return;

    const codeToSearch = promoCode.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === codeToSearch);

    if (!found) {
      if (codeToSearch === "LOKI10" || codeToSearch === "RITIZ10") {
        applyCoupon({
          code: codeToSearch,
          discountType: "percent",
          discountValue: 10,
        });
        setPromoCode("");
        return;
      }
      setPromoError("Invalid code. Use 'LOKI10' for 10% off.");
      return;
    }

    if (!found.active) {
      setPromoError("This coupon is no longer active.");
      return;
    }

    if (subtotal < found.minSpend) {
      setPromoError(
        `Minimum spend of NPR ${found.minSpend.toLocaleString()} required for ${found.code}.`
      );
      return;
    }

    applyCoupon({
      code: found.code,
      discountType: found.discountType,
      discountValue: found.discountValue,
    });
    setPromoCode("");
  };

  return (
    <div className="bg-white min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-gray-100">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
              Shopping Cart
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Review your tournament gear and proceed to secure checkout.
            </p>
          </div>

          <Link
            href="/category/all"
            className="hidden sm:inline-flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-red-600 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 sm:py-24 bg-gray-50 rounded-2xl sm:rounded-3xl mt-6 sm:mt-8 border border-gray-100">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-4 text-gray-400">
              <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Your cart is empty</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto px-4">
              You haven&apos;t added any table tennis equipment or apparel yet.
            </p>
            <Link
              href="/category/all"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition shadow-md"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 mt-6 sm:mt-8">
            {/* Left Column: Cart Items (8 cols) */}
            <div className="lg:col-span-8 space-y-4 sm:space-y-6">
              {/* Free shipping banner */}
              <div className="bg-red-50/70 border border-red-100 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl flex items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">
                      {remainingForFreeShipping === 0
                        ? "🎉 Free Nationwide Shipping Unlocked!"
                        : `Add NPR ${remainingForFreeShipping.toLocaleString()} more to qualify for FREE Delivery!`}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-gray-500">
                      Standard delivery everywhere in Nepal within 24-48 hours.
                    </span>
                  </div>
                </div>
                <div className="hidden sm:block text-right">
                  <span className="text-xs font-extrabold text-red-600">
                    {progressToFreeShipping}%
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.selectedColor}-${item.selectedHandle}`}
                    className="p-3.5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-gray-50/40 transition"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] sm:text-[10px] font-bold text-red-600 uppercase tracking-wider block">
                          {item.brand} • {item.category}
                        </span>
                        <h4 className="font-bold text-xs sm:text-sm text-gray-950 mt-0.5 truncate">
                          {item.name}
                        </h4>
                        <div className="flex items-center flex-wrap gap-2 mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-gray-500">
                          {item.selectedSize && (
                            <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md">Size: {item.selectedSize}</span>
                          )}
                          {item.selectedColor && (
                            <span>Color: {item.selectedColor}</span>
                          )}
                          {item.selectedHandle && (
                            <>
                              <span>•</span>
                              <span>Handle: {item.selectedHandle}</span>
                            </>
                          )}
                        </div>
                        <div className="mt-1 text-xs font-extrabold text-gray-900">
                          NPR {item.price.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-gray-100">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-gray-200 rounded-full bg-white shadow-sm">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity - 1,
                              item.selectedColor,
                              item.selectedHandle,
                              item.selectedSize
                            )
                          }
                          className="p-1.5 sm:p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-l-full transition"
                        >
                          <Minus className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                        </button>
                        <span className="px-2.5 sm:px-3 text-xs font-bold text-gray-900 min-w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity + 1,
                              item.selectedColor,
                              item.selectedHandle,
                              item.selectedSize
                            )
                          }
                          className="p-1.5 sm:p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-r-full transition"
                        >
                          <Plus className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <span className="text-xs sm:text-sm font-black text-gray-950 min-w-16 sm:min-w-20 text-right">
                        NPR {(item.price * item.quantity).toLocaleString()}
                      </span>

                      {/* Remove Button */}
                      <button
                        onClick={() =>
                          removeItem(
                            item.id,
                            item.selectedColor,
                            item.selectedHandle,
                            item.selectedSize
                          )
                        }
                        className="text-gray-400 hover:text-red-600 p-1 transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Notes */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-100">
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                  Special Delivery Instructions / Note:
                </label>
                <textarea
                  rows={2}
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="e.g., Deliver during office hours, call before arrival..."
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            {/* Right Column: Order Summary (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gray-50 border border-gray-100 shadow-sm space-y-4 sm:space-y-5">
                <h3 className="font-black text-base sm:text-lg text-gray-950">
                  Order Summary
                </h3>

                {/* Promo Coupon Form */}
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span className="text-xs font-bold text-emerald-800">
                          {appliedCoupon.code} Applied
                        </span>
                        <span className="block text-[10px] text-emerald-600">
                          {appliedCoupon.discountType === "percent"
                            ? `${appliedCoupon.discountValue}% OFF`
                            : `NPR ${appliedCoupon.discountValue} OFF`}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-800 transition"
                      title="Remove coupon"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Coupon (LOKI10)"
                          className="w-full bg-white border border-gray-200 text-xs pl-9 pr-3 py-2.5 rounded-xl uppercase placeholder:normal-case focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition"
                      >
                        Apply
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-[11px] text-red-600 font-medium">
                        {promoError}
                      </p>
                    )}
                  </form>
                )}

                {/* Pricing Rows */}
                <dl className="divide-y divide-gray-200/80 text-xs space-y-2.5 pt-2">
                  <div className="pt-2 flex justify-between text-gray-600">
                    <dt>Subtotal</dt>
                    <dd className="font-bold text-gray-900">
                      NPR {subtotal.toLocaleString()}
                    </dd>
                  </div>
                  {discountAmount > 0 && (
                    <div className="pt-2 flex justify-between text-emerald-600 font-medium">
                      <dt>
                        Discount (
                        {appliedCoupon
                          ? appliedCoupon.discountType === "percent"
                            ? `${appliedCoupon.discountValue}%`
                            : `NPR ${appliedCoupon.discountValue}`
                          : ""}
                        )
                      </dt>
                      <dd>- NPR {discountAmount.toLocaleString()}</dd>
                    </div>
                  )}
                  <div className="pt-2 flex justify-between text-gray-600">
                    <dt>Estimated Delivery</dt>
                    <dd className="font-semibold text-emerald-600">
                      {shippingFee === 0 ? "FREE" : `NPR ${shippingFee}`}
                    </dd>
                  </div>
                  <div className="pt-3 flex justify-between text-base font-black text-gray-950">
                    <dt>Total Amount</dt>
                    <dd className="text-red-600">
                      NPR {grandTotal.toLocaleString()}
                    </dd>
                  </div>
                </dl>

                <Link
                  href="/checkout"
                  className="w-full py-3.5 sm:py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xl shadow-red-600/30 text-center"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Genuine LOKI Equipment Warranty</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
