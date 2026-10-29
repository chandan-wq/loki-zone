"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { resolveAdminRole } from "@/lib/adminAuth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !user) {
      setAuthorized(false);
      window.location.href = "/login?redirect_url=/admin";
      return;
    }

    const primaryEmail =
      user.primaryEmailAddress?.emailAddress ||
      user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
        ?.emailAddress ||
      user.emailAddresses[0]?.emailAddress ||
      "";

    const role = resolveAdminRole(primaryEmail, user.publicMetadata?.role);

    if (!role) {
      setAuthorized(false);
      window.location.href = "/account?error=unauthorized_admin";
      return;
    }

    setAuthorized(true);
  }, [isLoaded, isSignedIn, user, router]);

  if (!isLoaded || authorized === null) {
    return (
      <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-9 h-9 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">
            Verifying Admin Authorization...
          </p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
