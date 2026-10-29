"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  User,
  Package,
  MapPin,
  Heart,
  LogOut,
  ChevronRight,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  ShieldAlert,
} from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { useAdminStore } from "@/store/useAdminStore";
import { resolveAdminRole } from "@/lib/adminAuth";

function UnauthorizedAlert() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  if (error !== "unauthorized_admin") return null;

  return (
    <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
      <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
      <div>
        <p className="font-bold">Restricted Area Notice</p>
        <p className="text-amber-700">
          Your account is active as a customer. Administrator or staff credentials are required to access management portals.
        </p>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "profile" | "addresses">("orders");
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const { orders, logoutAdmin } = useAdminStore();

  // Redirect to login if user is not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/login?redirect_url=/account");
    }
  }, [isLoaded, isSignedIn, router]);

  const userEmail = (user?.primaryEmailAddress?.emailAddress || "").trim().toLowerCase();
  const currentUserId = user?.id;

  // Strict Customer Privacy Scoping:
  // A customer MUST ONLY see their own non-demo orders matching their Clerk User ID or verified email.
  const customerOrders = useMemo(() => {
    if (!isSignedIn || !user) return [];

    return orders.filter((order) => {
      // 1. Never expose synthetic demo orders
      if (order.isDemo) return false;
      const demoOrderIds = ["LK-948210", "LK-842918", "LK-720491"];
      if (demoOrderIds.includes(order.id)) return false;

      // 2. Strict matching against authenticated identity
      const orderEmail = (order.email || "").trim().toLowerCase();
      const matchesUserId = Boolean(currentUserId && order.userId && order.userId === currentUserId);
      const matchesEmail = Boolean(userEmail && orderEmail && orderEmail === userEmail);

      return matchesUserId || matchesEmail;
    });
  }, [orders, isSignedIn, user, userEmail, currentUserId]);

  const adminRole = resolveAdminRole(userEmail, user?.publicMetadata?.role);
  const displayName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "LOKI Member";
  const userInitial = displayName.charAt(0).toUpperCase() || "U";

  const handleSignOut = async () => {
    try {
      logoutAdmin();
      await signOut();
      router.push("/");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  return (
    <div className="bg-gray-50/60 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={null}>
          <UnauthorizedAlert />
        </Suspense>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 mb-8 border-b border-gray-200 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-900 text-white flex items-center justify-center font-bold text-xl shadow-md flex-shrink-0">
              {user?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.imageUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{userInitial}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-gray-950">
                  {displayName}
                </h1>
                {adminRole && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    {adminRole === "main" ? "Store Owner" : "Staff"}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {adminRole
                  ? adminRole === "main"
                    ? "Administrator · Ritiz TT Goods Nepal"
                    : "Store Staff · Ritiz TT Goods Nepal"
                  : "LOKI Club Member"} • {userEmail}
              </span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-red-600 hover:text-red-600 rounded-xl text-xs font-semibold bg-white transition w-fit"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-3 space-y-2">
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between transition ${
                activeTab === "orders"
                  ? "bg-black text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>Order History</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between transition ${
                activeTab === "profile"
                  ? "bg-black text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4" />
                <span>Profile &amp; Security</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab("addresses")}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between transition ${
                activeTab === "addresses"
                  ? "bg-black text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4" />
                <span>Saved Addresses</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>

            <Link
              href="/wishlist"
              className="w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between bg-white text-gray-700 hover:bg-gray-100 border border-gray-100 transition"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-red-500" />
                <span>My Wishlist</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Tab Content (9 cols) */}
          <div className="lg:col-span-9">
            {activeTab === "orders" && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-950 mb-4">
                  Past Orders ({customerOrders.length})
                </h3>

                {customerOrders.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center text-gray-500 text-xs">
                    No orders placed yet. Explore our tournament equipment to make your first order!
                  </div>
                ) : (
                  customerOrders.map((order) => {
                    const statusColors: Record<string, string> = {
                      "Pending Confirmation": "bg-amber-50 text-amber-700",
                      Delivered: "bg-emerald-50 text-emerald-700",
                      Dispatched: "bg-blue-50 text-blue-700",
                      Processing: "bg-amber-50 text-amber-700",
                      Cancelled: "bg-red-50 text-red-700",
                    };
                    const badgeClass =
                      statusColors[order.status] || "bg-gray-100 text-gray-700";

                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
                          <div>
                            <span className="font-mono font-bold text-sm text-gray-950">
                              Order #{order.id}
                            </span>
                            <span className="text-xs text-gray-500 block mt-0.5">
                              Placed on {order.date} • {order.city}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${badgeClass}`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{order.status}</span>
                            </span>
                          </div>
                        </div>

                        {/* Order items */}
                        <div className="space-y-3">
                          {order.items.map((item, idx) => (
                            <div
                              key={`${item.id || item.name}-${idx}`}
                              className="flex items-center justify-between gap-4"
                            >
                              <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div>
                                  <h5 className="font-bold text-xs text-gray-900">
                                    {item.name}
                                  </h5>
                                  <span className="text-[11px] text-gray-500">
                                    Qty: {item.quantity}
                                  </span>
                                </div>
                              </div>
                              <span className="font-extrabold text-xs text-gray-950">
                                NPR {(item.price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>

                        {order.courierNote && (
                          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-[11px] text-gray-600 flex items-center gap-2">
                            <span className="font-bold text-gray-900">Courier Note:</span>
                            <span>{order.courierNote}</span>
                          </div>
                        )}

                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            Paid via {order.paymentMethod}
                          </span>
                          <span className="font-black text-sm text-gray-950">
                            Total: NPR {order.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === "profile" && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-gray-950">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      key={`name-${displayName}`}
                      defaultValue={displayName !== "LOKI Member" ? displayName : "Rohan Sharma"}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      defaultValue="+977 9841000000"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      key={`email-${userEmail}`}
                      defaultValue={userEmail !== "customer@example.com" ? userEmail : "rohan.sharma@example.com"}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
                <button className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition">
                  Save Changes
                </button>
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-950">
                    Saved Addresses
                  </h3>
                  <button className="text-xs font-bold text-red-600 hover:underline">
                    + Add New Address
                  </button>
                </div>
                <div className="p-4 rounded-2xl border border-red-500 bg-red-50/20 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wide">
                      Default Delivery Address
                    </span>
                    <span className="text-xs font-semibold text-gray-500">Home</span>
                  </div>
                  <p className="text-xs font-bold text-gray-900">Rohan Sharma</p>
                  <p className="text-xs text-gray-600">
                    New Baneshwor, Ward No. 10, Kathmandu, Nepal
                  </p>
                  <p className="text-xs text-gray-500">+977 9841000000</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
