import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-gray-50/60 px-4 sm:px-6 py-16">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-xl p-8 sm:p-12 text-center space-y-6">
        <div className="relative">
          <span className="text-8xl font-black text-gray-100 block tracking-tighter">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-black text-red-600">
              Ball Out of Bounds! 🏓
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">
            Page Not Found
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            The page you are looking for may have been moved, renamed, or is temporarily unavailable on our server.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition flex items-center justify-center gap-2 shadow-md"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>

          <Link
            href="/category/all"
            className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Gear</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
