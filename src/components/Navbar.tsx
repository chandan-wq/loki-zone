"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Package,
  ShieldCheck,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAdminStore } from "@/store/useAdminStore";
import { resolveAdminRole } from "@/lib/adminAuth";
import SearchModal from "./SearchModal";

const DEFAULT_ANNOUNCEMENT =
  "🚚 Free Nationwide Delivery on orders over NPR 2,000 | Official ITTF 2026 Collection Live";

export default function Navbar() {
  const [isMounted, setIsMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedCategory, setMobileExpandedCategory] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const toggleMobileAccordion = (name: string) => {
    setMobileExpandedCategory((prev) => (prev === name ? null : name));
  };

  // Prevent background scroll when mobile navigation drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const { openCart, getItemCount } = useCartStore();
  const { storeSettings, logoutAdmin, syncProductsFromDB } = useAdminStore();
  const itemCount = getItemCount();

  useEffect(() => {
    setIsMounted(true);
    syncProductsFromDB();
  }, [syncProductsFromDB]);

  // Handle click outside to close desktop profile dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle escape key to close menus
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSignOut = async () => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    try {
      logoutAdmin();
      await signOut();
      router.push("/");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const userEmail = user?.primaryEmailAddress?.emailAddress || "";
  const adminRole = resolveAdminRole(userEmail, user?.publicMetadata?.role);
  const isPrivilegedUser = adminRole === "main" || adminRole === "normal";
  const displayName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    userEmail.split("@")[0] ||
    "Customer";
  const userInitial = displayName.charAt(0).toUpperCase() || "U";

  const navLinks = [
    { name: "Home", href: "/", active: true },
    {
      name: "Shop",
      href: "/category/all",
      hasDropdown: true,
      items: [
        { label: "All Products", href: "/category/all" },
        { label: "New Arrivals", href: "/category/new" },
        { label: "Best Sellers", href: "/category/best-sellers" },
        { label: "Special Deals", href: "/category/deals" },
      ],
    },
    {
      name: "Rackets",
      href: "/category/rackets",
      hasDropdown: true,
      items: [
        { label: "LOKI Dragon Series", href: "/category/rackets?series=dragon" },
        { label: "Carbon Blades", href: "/category/rackets?type=carbon" },
        { label: "All-Round Rackets", href: "/category/rackets?type=allround" },
        { label: "Pro Rubber Sheets", href: "/category/rackets?type=rubber" },
      ],
    },
    {
      name: "Apparel",
      href: "/category/apparel",
      hasDropdown: true,
      items: [
        { label: "Match Jerseys", href: "/category/apparel?type=jerseys" },
        { label: "Performance Shorts", href: "/category/apparel?type=shorts" },
        { label: "Warmup Tracksuits", href: "/category/apparel?type=tracksuits" },
      ],
    },
    {
      name: "Footwear",
      href: "/category/footwear",
      hasDropdown: true,
      items: [
        { label: "Swift Court Shoes", href: "/category/footwear" },
        { label: "Anti-Slip Socks", href: "/category/footwear?type=socks" },
      ],
    },
    {
      name: "Accessories",
      href: "/category/accessories",
      hasDropdown: true,
      items: [
        { label: "3-Star ITTF Balls", href: "/category/accessories?type=balls" },
        { label: "Hard-shell Cases", href: "/category/accessories?type=cases" },
        { label: "Edge Tapes & Cleaners", href: "/category/accessories?type=maintenance" },
        { label: "Sports Towels", href: "/category/accessories?type=towels" },
      ],
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all">
        {/* Top Mini Bar for Announcements */}
        <div className="bg-slate-950 text-white text-[11px] font-medium py-1.5 px-4 text-center tracking-wide">
          <span>
            {isMounted
              ? storeSettings?.announcementText || DEFAULT_ANNOUNCEMENT
              : DEFAULT_ANNOUNCEMENT}
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left: Brand Logo & Tagline */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-black rounded-xl p-1.5 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Image
                  src="/images/loki-logo.png"
                  alt="LOKI"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="font-black text-lg sm:text-xl tracking-tight text-gray-900 group-hover:text-red-600 transition">
                    LOKI
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded tracking-wide">
                    ZONE
                  </span>
                </div>
                <span className="hidden sm:block text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  Play Better · Be Stronger
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {navLinks.map((link) => (
                <div
                  key={link.name}
                  className="relative group"
                  onMouseEnter={() =>
                    link.hasDropdown ? setActiveDropdown(link.name) : null
                  }
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className={`inline-flex items-center gap-1 px-3.5 py-2 text-sm font-semibold transition ${
                      link.active
                        ? "text-gray-950"
                        : "text-gray-600 hover:text-gray-950"
                    }`}
                  >
                    <span>{link.name}</span>
                    {link.hasDropdown && (
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 transition" />
                    )}
                  </Link>

                  {/* Active Indicator Underline */}
                  {link.active && (
                    <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-red-600 rounded-full" />
                  )}

                  {/* Dropdown Menu */}
                  {link.hasDropdown && activeDropdown === link.name && (
                    <div className="absolute top-full left-0 w-52 bg-white shadow-xl rounded-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-1 duration-150">
                      {link.items?.map((sub) => (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 transition"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Icons: Search, Admin Panel, Cart */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Search Icon */}
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search"
                className="p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-full transition"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* User Profile / Auth Area */}
              {isMounted && isSignedIn && user ? (
                // Signed-In: Profile Avatar Button + Dropdown (compact circle on mobile, expanded pill on desktop)
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                    aria-label="Account menu"
                    className="inline-flex items-center gap-1.5 py-1 pl-1 pr-1 sm:pr-2.5 rounded-full border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition shadow-sm group focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    <div className="relative w-7 h-7 rounded-full overflow-hidden bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-1 ring-gray-200 group-hover:ring-red-500 transition flex-shrink-0">
                      {user.imageUrl ? (
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
                    <span className="hidden sm:inline-block text-xs font-bold text-gray-800 max-w-[90px] truncate">
                      {user.firstName || displayName.split(" ")[0]}
                    </span>
                    <ChevronDown
                      className={`hidden sm:inline-block w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 transition-transform duration-200 ${
                        isUserMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* User Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                            {user.imageUrl ? (
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
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-gray-950 truncate">
                              {displayName}
                            </p>
                            <p className="text-[11px] text-gray-500 truncate">
                              {userEmail}
                            </p>
                            <div className="mt-1">
                              <span
                                className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                  adminRole === "main"
                                    ? "bg-red-50 text-red-700 border border-red-200"
                                    : adminRole === "normal"
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : "bg-gray-100 text-gray-700 border border-gray-200"
                                }`}
                              >
                                {adminRole === "main"
                                  ? "Store Owner / Main Admin"
                                  : adminRole === "normal"
                                  ? "Staff Desk"
                                  : "LOKI Club Member"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Navigation Links */}
                      <div className="py-1">
                        <Link
                          href="/account"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:text-red-600 hover:bg-gray-50 transition"
                        >
                          <User className="w-4 h-4 text-gray-500" />
                          <span>My Account &amp; Profile</span>
                        </Link>
                        <Link
                          href="/order-tracking"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:text-red-600 hover:bg-gray-50 transition"
                        >
                          <Package className="w-4 h-4 text-gray-500" />
                          <span>Track My Orders</span>
                        </Link>

                        {isPrivilegedUser && (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center justify-between px-4 py-2 text-xs font-bold text-gray-900 bg-red-50/60 hover:bg-red-50 hover:text-red-600 transition border-y border-red-100/70 my-1"
                          >
                            <div className="flex items-center gap-2.5">
                              <ShieldCheck className="w-4 h-4 text-red-600" />
                              <span>Admin Workspace</span>
                            </div>
                            <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                              {adminRole === "main" ? "Owner" : "Staff"}
                            </span>
                          </Link>
                        )}
                      </div>

                      {/* Sign Out Button */}
                      <div className="pt-1 border-t border-gray-100">
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                        >
                          <LogOut className="w-4 h-4 text-red-600" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Signed-Out: Direct Mobile Sign In Pill + Desktop Full Buttons
                <>
                  <Link
                    href="/login"
                    className="sm:hidden inline-flex items-center gap-1.5 py-1.5 px-3 text-xs font-bold text-gray-800 hover:text-red-600 bg-gray-100/80 hover:bg-gray-100 border border-gray-200 rounded-full transition shadow-xs"
                    aria-label="Sign In to your account"
                    title="Sign In"
                  >
                    <User className="w-3.5 h-3.5 text-gray-600" />
                    <span>Sign In</span>
                  </Link>

                  <div className="hidden sm:inline-flex items-center gap-2">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-gray-800 hover:text-red-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full transition shadow-sm"
                      title="Sign In to your account"
                    >
                      <User className="w-3.5 h-3.5 text-gray-500" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-full transition shadow-sm shadow-red-600/20"
                      title="Create a new account"
                    >
                      <span>Sign Up</span>
                    </Link>
                  </div>
                </>
              )}

              {/* Shopping Bag / Cart */}
              <button
                onClick={openCart}
                aria-label="Shopping Cart"
                className="relative p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-full transition group"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  {isMounted ? itemCount : 0}
                </span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Open Menu"
                className="lg:hidden p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer & Backdrop */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            {/* Dark Backdrop (tap outside to close) */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-out Drawer */}
            <div className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
              {/* Drawer Top Header with Logo & Close Button */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-sm tracking-wider shadow-sm">
                    LK
                  </div>
                  <span className="font-black text-lg tracking-tight text-gray-950">
                    LOKI <span className="text-red-600">ZONE</span>
                  </span>
                </Link>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close Menu"
                  className="p-2 text-gray-500 hover:text-gray-950 hover:bg-gray-100 rounded-full transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Navigation Body */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
                {navLinks.map((link) => {
                  const isExpanded = mobileExpandedCategory === link.name;
                  return (
                    <div key={link.name} className="border-b border-gray-100/80 pb-2">
                      {link.hasDropdown ? (
                        <div>
                          <button
                            onClick={() => toggleMobileAccordion(link.name)}
                            className="w-full flex items-center justify-between py-2.5 text-base font-bold text-gray-900 hover:text-red-600 transition"
                          >
                            <span>{link.name}</span>
                            <ChevronDown
                              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                                isExpanded ? "rotate-180 text-red-600" : ""
                              }`}
                            />
                          </button>

                          {isExpanded && (
                            <div className="pl-3 pr-1 py-1 space-y-1 bg-gray-50/70 rounded-xl mb-1">
                              {link.items?.map((sub) => (
                                <Link
                                  key={sub.label}
                                  href={sub.href}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="block py-2 px-3 text-sm font-semibold text-gray-700 hover:text-red-600 hover:bg-white rounded-lg transition"
                                >
                                  {sub.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block py-2.5 text-base font-bold text-gray-900 hover:text-red-600 transition"
                        >
                          {link.name}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Drawer Bottom Auth Section */}
              <div className="p-5 border-t border-gray-100 bg-gray-50/60">
                {isMounted && isSignedIn && user ? (
                  <div className="space-y-3">
                    {/* User Profile */}
                    <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-200/80 shadow-xs">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                        {user.imageUrl ? (
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
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-950 truncate">
                          {displayName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {userEmail}
                        </p>
                        <span
                          className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            adminRole === "main"
                              ? "bg-red-100 text-red-700"
                              : adminRole === "normal"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {adminRole === "main"
                            ? "Store Owner"
                            : adminRole === "normal"
                            ? "Staff Desk"
                            : "LOKI Member"}
                        </span>
                      </div>
                    </div>

                    {/* Account Links */}
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/account"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-2.5 px-3 text-center bg-white hover:bg-gray-100 text-gray-900 border border-gray-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <User className="w-4 h-4 text-gray-600" />
                        <span>My Account</span>
                      </Link>
                      <Link
                        href="/order-tracking"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-2.5 px-3 text-center bg-white hover:bg-gray-100 text-gray-900 border border-gray-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Package className="w-4 h-4 text-gray-600" />
                        <span>Track Orders</span>
                      </Link>
                    </div>

                    {isPrivilegedUser && (
                      <Link
                        href="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-red-600" />
                        <span>Admin Workspace</span>
                      </Link>
                    )}

                    {/* Sign Out Button */}
                    <button
                      onClick={handleSignOut}
                      className="w-full py-2.5 text-center border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="w-4 h-4 text-red-600" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 py-3 text-center bg-white hover:bg-gray-100 text-gray-900 border border-gray-200 rounded-xl text-sm font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <User className="w-4 h-4" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 py-3 text-center bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-red-600/20"
                    >
                      <span>Sign Up</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
