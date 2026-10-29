"use client";

import React, { Suspense } from "react";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen bg-gray-50/70 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-gray-150 shadow-xl p-8 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-base font-bold text-gray-900">Connecting your account...</h2>
        <p className="text-xs text-gray-500">Completing secure authentication. Please wait a moment.</p>
        <Suspense fallback={null}>
          <AuthenticateWithRedirectCallback
            signInForceRedirectUrl="/"
            signUpForceRedirectUrl="/"
          />
        </Suspense>
      </div>
    </div>
  );
}
