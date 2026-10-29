import React, { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { resolveAdminRole } from "@/lib/adminAuth";

async function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const user = await currentUser();

  // 1. Not signed in to Clerk -> Fail closed, redirect to /login
  if (!user) {
    redirect("/login");
  }

  // 2. Extract verified primary email address
  const primaryEmail =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ||
    user.emailAddresses[0]?.emailAddress ||
    null;

  const role = resolveAdminRole(primaryEmail, user.publicMetadata?.role);

  // 3. Authenticated customer, but not an authorized admin or staff -> Fail closed
  if (!role) {
    redirect("/account?error=unauthorized_admin");
  }

  return <>{children}</>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex items-center justify-center p-4">
          <div className="text-center space-y-3">
            <div className="w-9 h-9 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">
              Verifying Server Authorization...
            </p>
          </div>
        </div>
      }
    >
      <AdminAuthGuard>{children}</AdminAuthGuard>
    </Suspense>
  );
}
