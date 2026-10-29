"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  ShieldCheck,
  CheckCircle2,
  Truck,
  CreditCard,
  Lock,
  ArrowLeft,
  Tag,
  X,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAdminStore, AdminOrder } from "@/store/useAdminStore";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const {
    items,
    getCartTotal,
    clearCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getDiscountAmount,
  } = useCartStore();

  const { storeSettings, coupons, createOrder, incrementCouponUsage } =
    useAdminStore();

  const [paymentMethod, setPaymentMethod] = useState<
    "cod" | "esewa" | "khalti" | "fonepay"
  >("cod");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Promo code local input
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");

  const userFullName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "";
  const userEmail = user?.primaryEmailAddress?.emailAddress || "";

  // Form State - initialized clean, populated from authenticated Clerk profile if logged in
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    city: "Kathmandu",
    address: "",
    notes: "Please call before delivery",
  });

  // Automatically sync authenticated user details when Clerk session loads
  useEffect(() => {
    if (!isUserLoaded || !user) return;
    setFormData((prev) => ({
      ...prev,
      fullName: prev.fullName || userFullName,
      email: prev.email || userEmail,
      phone: prev.phone || (user.phoneNumbers?.[0]?.phoneNumber ?? ""),
    }));
  }, [isUserLoaded, user, userFullName, userEmail]);

  const subtotal = getCartTotal();
  const discountAmount = getDiscountAmount(subtotal);

  // Dynamic shipping calculation based on store settings and city
  const isInsideValley =
    formData.city === "Kathmandu" ||
    formData.city === "Lalitpur" ||
    formData.city === "Bhaktapur";

  const standardShipping = isInsideValley
    ? storeSettings.deliveryInsideValley || 100
    : storeSettings.deliveryOutsideValley || 250;

  const freeThreshold = storeSettings.freeShippingThreshold || 2000;
  const isFreeShipping = subtotal - discountAmount >= freeThreshold || subtotal === 0;
  const shippingFee = isFreeShipping ? 0 : standardShipping;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    setPromoSuccess("");

    if (!promoInput.trim()) return;

    const codeToSearch = promoInput.trim().toUpperCase();
    const foundCoupon = coupons.find(
      (c) => c.code.toUpperCase() === codeToSearch
    );

    if (!foundCoupon) {
      if (codeToSearch === "LOKI10" || codeToSearch === "RITIZ10") {
        applyCoupon({
          code: codeToSearch,
          discountType: "percent",
          discountValue: 10,
        });
        setPromoSuccess("10% discount coupon applied successfully!");
        setPromoInput("");
        return;
      }
      setPromoError("Invalid coupon code. Try 'LOKI10'");
      return;
    }

    if (!foundCoupon.active) {
      setPromoError("This coupon is no longer active.");
      return;
    }

    if (subtotal < foundCoupon.minSpend) {
      setPromoError(
        `Minimum spend of NPR ${foundCoupon.minSpend.toLocaleString()} required for this coupon.`
      );
      return;
    }

    applyCoupon({
      code: foundCoupon.code,
      discountType: foundCoupon.discountType,
      discountValue: foundCoupon.discountValue,
    });
    setPromoSuccess(
      `Coupon ${foundCoupon.code} applied! (${
        foundCoupon.discountType === "percent"
          ? `${foundCoupon.discountValue}% OFF`
          : `NPR ${foundCoupon.discountValue} OFF`
      })`
    );
    setPromoInput("");
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert("Your cart is empty. Please add items before checking out.");
      return;
    }

    setIsSubmitting(true);

    const paymentMethodMap: Record<
      typeof paymentMethod,
      AdminOrder["paymentMethod"]
    > = {
      esewa: "eSewa",
      khalti: "Khalti",
      fonepay: "Fonepay",
      cod: "Cash on Delivery",
    };

    try {
      const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey,
          customerName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          city: formData.city,
          address: formData.address,
          notes: formData.notes,
          couponCode: appliedCoupon?.code,
          items: items.map((i) => ({
            productId: i.id,
            quantity: i.quantity,
            name: i.name,
            price: i.price,
            image: i.image,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to process order.");
      }

      const orderId = data.orderId;
      const finalTotal = data.total;

      // 1. Dispatch order to local store for UI continuity
      const newOrder: AdminOrder = {
        id: orderId,
        userId: user?.id,
        customerName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        city: formData.city,
        address: formData.address,
        subtotal: data.subtotal,
        deliveryFee: data.deliveryFee,
        total: finalTotal,
        paymentMethod: paymentMethodMap[paymentMethod],
        status: "Pending Confirmation",
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        itemsCount: items.reduce((sum, i) => sum + i.quantity, 0),
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
        courierNote: formData.notes
          ? `${formData.notes} | Preferred City: ${formData.city}`
          : `Delivery to ${formData.city}`,
      };
      createOrder(newOrder);

      // 2. Increment coupon usage if used
      if (appliedCoupon) {
        incrementCouponUsage(appliedCoupon.code);
      }

      // 3. Clear cart
      clearCart();
      removeCoupon();

      // 4. Redirect to order confirmation with verified CT order ID
      router.push(
        `/order-confirmation?orderId=${orderId}&total=${finalTotal}&method=${encodeURIComponent(
          paymentMethodMap[paymentMethod]
        )}`
      );
    } catch (err: unknown) {
      console.error("[Checkout Error]:", err);
      alert(
        err instanceof Error
          ? err.message
          : "An error occurred while placing your order. Please check your details and try again."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50/60 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-8">
          <Link
            href="/cart"
            className="text-xs font-semibold text-gray-500 hover:text-black flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Bag</span>
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-xs font-bold text-gray-900">Secure Checkout</span>
        </div>

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Delivery & Payment Details (7 cols) */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              {/* Step 1: Contact & Delivery Info */}
              <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm space-y-5 sm:space-y-6">
                <div className="flex items-center gap-3 pb-3 sm:pb-4 border-b border-gray-100">
                  <span className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-gray-950">
                    Contact &amp; Shipping Address
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Mobile Number (For Courier) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Email Address (For Receipt &amp; Tracking) *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      City / Region *
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black"
                    >
                      <option value="Kathmandu">Kathmandu Valley</option>
                      <option value="Lalitpur">Lalitpur</option>
                      <option value="Bhaktapur">Bhaktapur</option>
                      <option value="Pokhara">Pokhara</option>
                      <option value="Chitwan">Chitwan</option>
                      <option value="Butwal">Butwal</option>
                      <option value="Dharan">Dharan / Biratnagar</option>
                      <option value="Other">Other Nepal Districts</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Street / Area Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="House No, Landmark, Street"
                      className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Delivery Instructions / Courier Note
                    </label>
                    <input
                      type="text"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="e.g., Please call 10 mins before arrival, deliver after 2 PM"
                      className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Payment Method */}
              <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm space-y-5 sm:space-y-6">
                <div className="flex items-center gap-3 pb-3 sm:pb-4 border-b border-gray-100">
                  <span className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-gray-950">
                    Payment Method
                  </h2>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {/* Cash on Delivery - Primary Active Method */}
                  <div
                    onClick={() => setPaymentMethod("cod")}
                    className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border-2 border-gray-950 bg-gray-50/70 shadow-sm ring-1 ring-black/5 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-950 text-white font-black text-sm flex items-center justify-center flex-shrink-0 shadow-md">
                        COD
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-gray-950 block">
                            Cash on Delivery (COD)
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                            Verified &amp; Active
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Pay physical cash when your order arrives at your doorstep across Nepal. Our dispatch desk will call you to confirm order specifications before courier release.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">
                        ✓
                      </span>
                    </div>
                  </div>

                  {/* Digital Wallets Advisory */}
                  <div className="p-4 rounded-2xl bg-gray-50 border border-dashed border-gray-200 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      ℹ
                    </div>
                    <div className="text-xs text-gray-500">
                      <strong className="text-gray-800">Online Wallets (eSewa / Khalti / Fonepay):</strong> To ensure 100% stock verification before payment, all retail orders are dispatched via Cash on Delivery. In-store or courier QR payment is available upon physical delivery.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Review (5 cols) */}
            <div className="lg:col-span-5 space-y-5 sm:space-y-6">
              <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm space-y-4 sm:space-y-5 sticky top-28">
                <h3 className="font-black text-lg text-gray-950 pb-3 border-b border-gray-100">
                  Review Order ({items.length} items)
                </h3>

                {/* Items preview list */}
                <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-gray-100 pr-1">
                  {items.map((item) => (
                    <div
                      key={`${item.id}-${item.selectedColor}-${item.selectedHandle}-${item.selectedSize}`}
                      className="pt-3 first:pt-0 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h5 className="font-bold text-sm text-gray-900 line-clamp-1">
                            {item.name}
                          </h5>
                          <span className="text-xs text-gray-500">
                            Qty: {item.quantity}{" "}
                            {item.selectedSize && `• Size: ${item.selectedSize}`}{" "}
                            {item.selectedColor && `• ${item.selectedColor}`}{" "}
                            {item.selectedHandle && `• ${item.selectedHandle}`}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-gray-950">
                        NPR {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Coupon Code Section */}
                <div className="pt-2 border-t border-gray-100">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
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
                        title="Remove coupon"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          placeholder="Promo or Club Code (e.g. LOKI10)"
                          className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium uppercase placeholder:normal-case focus:outline-none focus:ring-1 focus:ring-black"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white text-sm font-bold rounded-xl transition"
                        >
                          Apply
                        </button>
                      </div>
                      {promoError && (
                        <p className="text-xs text-red-600 font-medium">
                          {promoError}
                        </p>
                      )}
                      {promoSuccess && (
                        <p className="text-xs text-emerald-600 font-medium">
                          {promoSuccess}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Financial Totals */}
                <dl className="divide-y divide-gray-100 text-sm space-y-2.5 pt-2 border-t border-gray-100">
                  <div className="pt-2 flex justify-between text-gray-600">
                    <dt>Subtotal</dt>
                    <dd className="font-bold text-gray-900">
                      NPR {subtotal.toLocaleString()}
                    </dd>
                  </div>

                  {discountAmount > 0 && (
                    <div className="pt-2 flex justify-between text-emerald-600">
                      <dt>Coupon Discount</dt>
                      <dd className="font-bold">
                        - NPR {discountAmount.toLocaleString()}
                      </dd>
                    </div>
                  )}

                  <div className="pt-2 flex justify-between text-gray-600">
                    <dt>
                      Delivery ({isInsideValley ? "Inside Valley" : "Outside Valley"})
                    </dt>
                    <dd className="font-semibold text-emerald-600">
                      {shippingFee === 0 ? "FREE" : `NPR ${shippingFee}`}
                    </dd>
                  </div>

                  <div className="pt-3 flex justify-between text-base font-black text-gray-950">
                    <dt>Grand Total</dt>
                    <dd className="text-red-600">
                      NPR {grandTotal.toLocaleString()}
                    </dd>
                  </div>
                </dl>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting || items.length === 0}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-full font-bold text-sm flex items-center justify-center gap-2 transition shadow-xl shadow-red-600/30 active:scale-[0.98]"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? "Placing Order & Updating Stock..."
                      : `Confirm & Pay NPR ${grandTotal.toLocaleString()}`}
                  </span>
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Safe Checkout • 100% Genuine LOKI Gear</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
