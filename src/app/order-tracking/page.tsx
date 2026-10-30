"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Phone,
  Mail,
  Lock,
} from "lucide-react";
import { useAdminStore, AdminOrder } from "@/store/useAdminStore";
import { extractClerkEmail } from "@/lib/adminAuth";

export default function OrderTrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OrderTrackingContent />
    </Suspense>
  );
}

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("id") || "";
  const { orders } = useAdminStore();
  const { user } = useUser();

  const userEmail = (extractClerkEmail(user) || "").trim().toLowerCase();
  const userPhone = user?.phoneNumbers?.[0]?.phoneNumber || "";

  const [orderIdQuery, setOrderIdQuery] = useState(initialOrderId);
  const [verifierQuery, setVerifierQuery] = useState(userPhone || userEmail || "");
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [matchedOrder, setMatchedOrder] = useState<AdminOrder | null>(null);

  // Auto-fill verifier if user signs in
  useEffect(() => {
    if (userEmail && !verifierQuery) {
      setVerifierQuery(userEmail);
    }
  }, [userEmail, verifierQuery]);

  const performTrackingLookup = async (cleanId: string, cleanVerifier: string) => {
    setSearchError("");
    setSearched(true);

    if (!cleanId) {
      setSearchError("Please enter your Order Number (e.g. CT-2610-00001).");
      setMatchedOrder(null);
      return;
    }

    // 1. First query server-side database
    try {
      const res = await fetch(
        `/api/orders/track?id=${encodeURIComponent(cleanId)}&verifier=${encodeURIComponent(cleanVerifier)}`
      );
      const data = await res.json();
      if (res.ok && data.success && data.order) {
        setMatchedOrder({
          id: data.order.id,
          userId: data.order.userId,
          customerName: data.order.customerName,
          phone: data.order.phone,
          email: data.order.email,
          city: data.order.city,
          address: data.order.address,
          subtotal: data.order.subtotal,
          deliveryFee: data.order.deliveryFee,
          total: data.order.total,
          paymentMethod: data.order.paymentMethod,
          status: data.order.orderStatus,
          date: new Date(data.order.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          itemsCount: data.order.itemsCount,
          items: data.order.items,
          courierNote: data.order.courierNote,
        });
        setSearchError("");
        return;
      } else if (res.status === 403) {
        setMatchedOrder(null);
        setSearchError(data.error || "Order verification failed. Phone number or email does not match this order.");
        return;
      }
    } catch (err) {
      console.warn("[Tracking] Server lookup error, checking local store:", err);
    }

    // 2. Fallback check against local store
    const found = orders.find((o) => {
      if (o.isDemo) return false;
      const demoIds = ["LK-948210", "LK-842918", "LK-720491"];
      if (demoIds.includes(o.id)) return false;

      if (o.id.toLowerCase() !== cleanId.toLowerCase()) return false;

      if (user && (o.userId === user.id || (userEmail && o.email?.toLowerCase() === userEmail))) {
        return true;
      }

      const cleanOrderPhone = (o.phone || "").replace(/\D/g, "");
      const cleanInputPhone = cleanVerifier.replace(/\D/g, "");
      const phoneMatch = cleanInputPhone.length >= 7 && cleanOrderPhone.includes(cleanInputPhone);
      const orderEmail = (o.email || "").toLowerCase().trim();
      const emailMatch = cleanVerifier.includes("@") && orderEmail === cleanVerifier.toLowerCase();

      return phoneMatch || emailMatch;
    });

    if (found) {
      setMatchedOrder(found);
      setSearchError("");
    } else {
      setMatchedOrder(null);
      setSearchError("No active shipment found matching this order and verification info.");
    }
  };

  // Attempt initial lookup if order ID is present in URL
  useEffect(() => {
    if (!initialOrderId) return;
    performTrackingLookup(initialOrderId.trim(), verifierQuery.trim() || userEmail);
  }, [initialOrderId, userEmail]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await performTrackingLookup(orderIdQuery.trim(), verifierQuery.trim());
  };

  const getStepStatus = (status: AdminOrder["status"]) => {
    switch (status) {
      case "Delivered":
        return 4;
      case "Dispatched":
        return 3;
      case "Processing":
        return 2;
      case "Cancelled":
      default:
        return 1;
    }
  };

  const currentStep = matchedOrder ? getStepStatus(matchedOrder.status) : 1;

  // Mask phone number for privacy (e.g. 9841****00)
  const maskPhone = (phone?: string) => {
    if (!phone) return "";
    const clean = phone.trim();
    if (clean.length < 6) return clean;
    return `${clean.slice(0, 4)}****${clean.slice(-2)}`;
  };

  return (
    <div className="bg-gray-50/60 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
            LOGISTICS DISPATCH LOOKUP
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-950 tracking-tight">
            Track Your Order
          </h1>
          <p className="text-sm text-gray-600 max-w-lg mx-auto">
            Enter your LOKI Zone Order Number (e.g. <span className="font-mono font-semibold text-gray-900">LK-842918</span>) or registered phone number.
          </p>
        </div>

        {/* Search Bar Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={orderIdQuery}
                onChange={(e) => setOrderIdQuery(e.target.value)}
                placeholder="Order Number (e.g. LK-842918)..."
                className="w-full bg-gray-50 border border-gray-200 text-sm text-gray-900 pl-12 pr-4 py-3.5 rounded-2xl focus:outline-none focus:border-red-600 focus:bg-white transition font-mono"
              />
            </div>
            <div className="relative flex-1">
              <Phone className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={verifierQuery}
                onChange={(e) => setVerifierQuery(e.target.value)}
                placeholder="Phone or Email used at checkout..."
                className="w-full bg-gray-50 border border-gray-200 text-sm text-gray-900 pl-12 pr-4 py-3.5 rounded-2xl focus:outline-none focus:border-red-600 focus:bg-white transition"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-2xl transition shadow-lg shadow-red-600/25 shrink-0"
            >
              Track Package
            </button>
          </form>

          {searchError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{searchError}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-gray-400 pt-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure lookup: Both your Order ID and registered phone number or email are required to view tracking.</span>
          </div>
        </div>

        {/* Search Results */}
        {searched && (
          <div>
            {matchedOrder ? (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden divide-y divide-gray-100">
                {/* Status Header */}
                <div className="p-6 sm:p-8 bg-gradient-to-r from-gray-900 to-black text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-red-500 uppercase">
                      SHIPMENT IDENTIFIER
                    </span>
                    <h2 className="text-2xl font-black mt-0.5 font-mono">
                      #{matchedOrder.id}
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                      Ordered on {matchedOrder.date} • {matchedOrder.paymentMethod}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold ${
                        matchedOrder.status === "Delivered"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : matchedOrder.status === "Dispatched"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : matchedOrder.status === "Cancelled"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      {matchedOrder.status}
                    </span>
                  </div>
                </div>

                {/* Progress Steps Timeline */}
                <div className="p-6 sm:p-8">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">
                    Fulfillment Progress
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
                    <div className="flex items-center sm:flex-col sm:items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition ${
                          currentStep >= 1
                            ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        1
                      </div>
                      <div>
                        <span className="font-bold text-sm text-gray-900 block">
                          Order Placed
                        </span>
                        <span className="text-xs text-gray-500">
                          Order received &amp; logged
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center sm:flex-col sm:items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition ${
                          currentStep >= 2
                            ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        2
                      </div>
                      <div>
                        <span className="font-bold text-sm text-gray-900 block">
                          Processing &amp; QC
                        </span>
                        <span className="text-xs text-gray-500">
                          ITTF seal verified &amp; packed
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center sm:flex-col sm:items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition ${
                          currentStep >= 3
                            ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        3
                      </div>
                      <div>
                        <span className="font-bold text-sm text-gray-900 block">
                          Out for Delivery
                        </span>
                        <span className="text-xs text-gray-500">
                          Handed to courier fleet
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center sm:flex-col sm:items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition ${
                          currentStep >= 4
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        4
                      </div>
                      <div>
                        <span className="font-bold text-sm text-gray-900 block">
                          Delivered
                        </span>
                        <span className="text-xs text-gray-500">
                          Package safely received
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Destination & Summary */}
                <div className="p-6 sm:p-8 bg-gray-50/50 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-2">
                    <span className="font-bold text-gray-900 block uppercase tracking-wider text-[10px]">
                      Destination Address
                    </span>
                    <p className="font-semibold text-gray-900 text-sm">
                      {matchedOrder.customerName}
                    </p>
                    <p className="text-gray-600">{matchedOrder.address}</p>
                    <p className="text-gray-600 font-medium">{matchedOrder.city}, Nepal</p>
                    <p className="text-gray-600">Phone: {maskPhone(matchedOrder.phone)}</p>
                  </div>

                  <div className="space-y-2 sm:text-right">
                    <span className="font-bold text-gray-900 block uppercase tracking-wider text-[10px]">
                      Payment &amp; Total
                    </span>
                    <p className="text-sm font-black text-red-600">
                      NPR {matchedOrder.total.toLocaleString()}
                    </p>
                    <p className="text-gray-600 font-medium">
                      Method: {matchedOrder.paymentMethod}
                    </p>
                    {matchedOrder.courierNote && (
                      <p className="text-gray-500 text-[11px] italic">
                        Note: {matchedOrder.courierNote}
                      </p>
                    )}
                  </div>
                </div>

                {/* Items in this order */}
                {matchedOrder.items && matchedOrder.items.length > 0 && (
                  <div className="p-6 sm:p-8 space-y-4">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Ordered Equipment ({matchedOrder.items.length} items)
                    </h4>
                    <div className="divide-y divide-gray-100">
                      {matchedOrder.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="py-3 flex items-center justify-between gap-4 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            {item.image && (
                              <div className="relative w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-gray-900">{item.name}</p>
                              <span className="text-gray-500 text-[11px]">
                                Qty: {item.quantity} × NPR {item.price.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <span className="font-extrabold text-gray-950">
                            NPR {(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-white border border-gray-100 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                <h3 className="font-bold text-base text-gray-900">Order Not Found</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  We couldn&apos;t find an order matching <span className="font-semibold text-gray-800">“{orderIdQuery}”</span>. Please double-check your Order Number and phone or email.
                </p>
                <div className="pt-2">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 text-xs font-bold text-red-600 hover:underline"
                  >
                    <span>Contact Support via WhatsApp</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
