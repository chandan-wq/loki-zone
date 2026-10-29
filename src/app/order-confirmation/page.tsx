"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Package,
  Calendar,
  CreditCard,
  ArrowRight,
  Printer,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";



export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-sm text-gray-500">
          Loading order details...
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "LK-842918";
  const rawTotal = searchParams.get("total") || "2499";
  const method = searchParams.get("method") || "Cash on Delivery";

  const numTotal = Number(String(rawTotal).replace(/,/g, "")) || 2499;

  const { orders } = useAdminStore();
  const matchedOrder = orders.find((o) => o.id === orderId);

  return (
    <div className="bg-gray-50/70 min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden p-8 sm:p-12 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
            ORDER CONFIRMED
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight mt-1">
            Thank You for Your Order!
          </h1>
          <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
            We&apos;ve received your order and our club gear specialists are preparing your tournament package.
          </p>

          {/* Order Details Card */}
          <div className="bg-gray-50 rounded-2xl p-6 mt-8 text-left border border-gray-100 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-gray-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">
                  Order Number
                </span>
                <span className="font-mono font-bold text-base text-gray-900">
                  #{orderId}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">
                  Amount Paid / Payable
                </span>
                <span className="font-bold text-base text-red-600">
                  NPR {numTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="flex items-start gap-2.5">
                <Package className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-gray-800 block">Order Status</span>
                  <span className="text-emerald-600 font-semibold">
                    {matchedOrder?.status || "Processing for Dispatch"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-gray-800 block">Estimated Delivery</span>
                  <span className="text-gray-600">Within 24-48 Hours</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CreditCard className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-gray-800 block">Payment Method</span>
                  <span className="text-gray-600 uppercase font-semibold">
                    {matchedOrder?.paymentMethod || method}
                  </span>
                </div>
              </div>
            </div>

            {/* If matchedOrder found, show shipping address and items */}
            {matchedOrder && (
              <div className="pt-4 border-t border-gray-200/80 space-y-3">
                <div className="flex items-start gap-2 text-xs text-gray-600">
                  <MapPin className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900">
                      Deliver to: {matchedOrder.customerName} ({matchedOrder.phone})
                    </strong>
                    <span className="block text-gray-500">
                      {matchedOrder.address}, {matchedOrder.city}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100">
                  {matchedOrder.items.map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-lg bg-white border border-gray-200 overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="font-medium text-gray-900 line-clamp-1">
                          {item.name} (x{item.quantity})
                        </span>
                      </div>
                      <span className="font-bold text-gray-900">
                        NPR {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto px-8 py-3.5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-xs font-semibold transition flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Order Receipt</span>
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>A confirmation SMS and email have been sent with tracking details.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
