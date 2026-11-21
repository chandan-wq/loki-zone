"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, Home, MessageCircle, AlertTriangle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Safely log error without breaking client execution
    console.error("[Storefront Runtime Error]:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-gray-50/50">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-200/80 shadow-xl text-center">
        {/* Warning Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-5 shadow-xs border border-red-100">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h1 className="text-xl font-black text-gray-950 tracking-tight mb-2">
          Temporary Display Glitch
        </h1>

        <p className="text-xs text-gray-600 leading-relaxed mb-6">
          The page experienced a minor runtime error under high load, but your cart,
          account, and orders are 100% safe.
        </p>

        {error?.digest && (
          <div className="mb-6 px-3 py-1.5 rounded-lg bg-gray-100 text-[10px] font-mono text-gray-500 truncate">
            Error Ref: {error.digest}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <button
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-gray-100 text-gray-900 text-xs font-bold border border-gray-200 shadow-2xs active:scale-95 transition-all"
          >
            <Home className="w-4 h-4 text-gray-500" />
            <span>Back to Store</span>
          </Link>
        </div>

        {/* Quick WhatsApp Support */}
        <div className="pt-5 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-500 font-medium">
          <span>Need immediate help?</span>
          <a
            href="https://wa.me/9779800000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
