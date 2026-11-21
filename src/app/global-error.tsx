"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full text-center p-8 bg-gray-50 rounded-3xl border border-gray-200">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 font-black text-xl">
            LOKI
          </div>
          <h2 className="text-lg font-bold text-gray-950 mb-2">
            System Temporarily Unavailable
          </h2>
          <p className="text-xs text-gray-600 mb-6 leading-relaxed">
            We are experiencing high traffic. Please refresh the page or try again in a few moments.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition"
          >
            Reload Page
          </button>
        </div>
      </body>
    </html>
  );
}
