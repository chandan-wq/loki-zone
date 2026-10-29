"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Tag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAdminStore } from "@/store/useAdminStore";

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    getCartTotal,
    getItemCount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getDiscountAmount,
  } = useCartStore();

  const { storeSettings, coupons } = useAdminStore();

  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");

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
      setPromoError("Invalid coupon code. Try 'LOKI10'");
      return;
    }

    if (!found.active) {
      setPromoError("This coupon is currently inactive.");
      return;
    }

    if (subtotal < found.minSpend) {
      setPromoError(`Min spend of NPR ${found.minSpend.toLocaleString()} required.`);
      return;
    }

    applyCoupon({
      code: found.code,
      discountType: found.discountType,
      discountValue: found.discountValue,
    });
    setPromoCode("");
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-gray-900" />
              <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                Your Shopping Bag ({getItemCount()})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free shipping progress bar */}
          <div className="bg-red-50/80 px-4 sm:px-5 py-3 border-b border-red-100/60">
            <div className="flex justify-between text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
              <span>
                {remainingForFreeShipping === 0 ? (
                  <strong className="text-emerald-700">🎉 Free Shipping Unlocked!</strong>
                ) : (
                  <>
                    Add <strong className="text-red-600">NPR {remainingForFreeShipping.toLocaleString()}</strong> more for FREE Delivery
                  </>
                )}
              </span>
              <span className="text-gray-500 font-bold">{progressToFreeShipping}%</span>
            </div>
            <div className="w-full bg-red-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-red-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-gray-900 text-base">Your bag is empty</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
                  Looks like you haven&apos;t added any rackets or gear to your bag yet.
                </p>
                <Link
                  href="/category/all"
                  onClick={closeCart}
                  className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-black hover:bg-neutral-800 text-white rounded-full text-sm font-semibold transition"
                >
                  Start Shopping <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.id}-${item.selectedColor}-${item.selectedHandle}-${item.selectedSize}`}
                  className="py-4 first:pt-0 last:pb-0 flex gap-3.5 sm:gap-4"
                >
                  <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                      {item.brand}
                    </span>
                    <h4 className="font-bold text-sm text-gray-900 truncate mt-0.5">
                      {item.name}
                    </h4>

                    {(item.selectedColor || item.selectedHandle || item.selectedSize) && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {item.selectedSize && `Size: ${item.selectedSize}`}
                        {item.selectedSize && (item.selectedColor || item.selectedHandle) && " · "}
                        {item.selectedColor}
                        {item.selectedColor && item.selectedHandle && " / "}
                        {item.selectedHandle}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity buttons */}
                      <div className="flex items-center border border-gray-200 rounded-lg">
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
                          className="p-1.5 hover:bg-gray-100 rounded-l-lg transition"
                        >
                          <Minus className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                        <span className="px-2.5 text-sm font-bold text-gray-900 min-w-7 text-center">
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
                          className="p-1.5 hover:bg-gray-100 rounded-r-lg transition"
                        >
                          <Plus className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <span className="font-black text-sm text-gray-900 block">
                          NPR {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() =>
                          removeItem(
                            item.id,
                            item.selectedColor,
                            item.selectedHandle,
                            item.selectedSize
                          )
                        }
                        className="p-1.5 text-gray-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer summary */}
          {items.length > 0 && (
            <div className="border-t border-gray-100 p-4 sm:p-5 bg-gray-50/50 space-y-3">
              {/* Promo input */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="text-sm font-bold text-emerald-800">
                        {appliedCoupon.code} Applied
                      </span>
                      <span className="block text-xs text-emerald-600">
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
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Coupon code (try LOKI10)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg uppercase placeholder:normal-case focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs sm:text-sm font-bold rounded-lg transition"
                  >
                    Apply
                  </button>
                </form>
              )}
              {promoError && (
                <p className="text-xs text-red-600 font-medium">{promoError}</p>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs sm:text-sm text-gray-600 pt-2 border-t border-gray-200/60">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    NPR {subtotal.toLocaleString()}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>
                      Coupon Discount (
                      {appliedCoupon?.discountType === "percent"
                        ? `${appliedCoupon.discountValue}%`
                        : `NPR ${appliedCoupon?.discountValue}`}
                      )
                    </span>
                    <span>- NPR {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Estimate</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-emerald-600 font-semibold">FREE</span>
                    ) : (
                      `NPR ${shippingFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total Amount</span>
                  <span className="text-red-600 font-black">
                    NPR {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 space-y-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white rounded-full font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition shadow-lg active:scale-[0.99]"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Secure 256-bit encrypted checkout</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
