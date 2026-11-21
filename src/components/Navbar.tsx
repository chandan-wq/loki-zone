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
  ChevronRight,
  User,
  LogOut,
  Package,
  ShieldCheck,
  Sparkles,
  Flame,
  Shirt,
  Footprints,
  Tag,
  Phone,
  Truck,
  MessageCircle,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAdminStore } from "@/store/useAdminStore";
import { resolveAdminRole, extractClerkEmail } from "@/lib/adminAuth";
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
  const { storeSettings, setStoreSettings, logoutAdmin, syncProductsFromDB } = useAdminStore();

  // Sync store settings (announcement bar, contact) live from database
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setStoreSettings(data.settings);
        }
      })
      .catch(() => {});
  }, [setStoreSettings]);
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

  const userEmail = extractClerkEmail(user) || "";
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
      name: "Custom Combo",
      href: "/custom-combo",
      badge: "Save 10%",
      highlight: true,
    },
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

  const mobileCategories = [
    {
      id: "rackets",
      name: "Table Tennis Rackets",
      subtitle: "5-Ply Wood & Carbon Blades",
      icon: Flame,
      color: "text-red-600 bg-red-50",
      badge: "Popular",
      badgeColor: "bg-red-100 text-red-700",
      items: [
        { label: "LOKI Dragon Series", href: "/category/rackets?series=dragon", badge: "Tournament" },
        { label: "Carbon Blades", href: "/category/rackets?type=carbon", badge: "Pro Speed" },
        { label: "All-Round Rackets", href: "/category/rackets?type=allround", badge: "Control" },
        { label: "Pro Rubber Sheets", href: "/category/rackets?type=rubber", badge: "High-Tension" },
        { label: "View All Rackets & Blades →", href: "/category/rackets" },
      ],
    },
    {
      id: "apparel",
      name: "Sportswear & Jerseys",
      subtitle: "QuickDry Match Apparel",
      icon: Shirt,
      color: "text-blue-600 bg-blue-50",
      items: [
        { label: "Match Jerseys", href: "/category/apparel?type=jerseys", badge: "QuickDry" },
        { label: "Performance Shorts", href: "/category/apparel?type=shorts" },
        { label: "Warmup Tracksuits", href: "/category/apparel?type=tracksuits" },
        { label: "View All Sportswear →", href: "/category/apparel" },
      ],
    },
    {
      id: "footwear",
      name: "Court Footwear",
      subtitle: "Honeycomb Grip Shoes",
      icon: Footprints,
      color: "text-amber-600 bg-amber-50",
      items: [
        { label: "Swift Court Shoes", href: "/category/footwear", badge: "Non-Marking" },
        { label: "Anti-Slip Socks", href: "/category/footwear?type=socks" },
        { label: "View All Footwear →", href: "/category/footwear" },
      ],
    },
    {
      id: "accessories",
      name: "Accessories & Balls",
      subtitle: "ITTF 3-Star Balls & Cases",
      icon: Package,
      color: "text-emerald-600 bg-emerald-50",
      items: [
        { label: "3-Star ITTF Balls", href: "/category/accessories?type=balls", badge: "40+ ABS" },
        { label: "Hard-shell EVA Cases", href: "/category/accessories?type=cases" },
        { label: "Edge Tapes & Cleaners", href: "/category/accessories?type=maintenance" },
        { label: "Sports Towels & Wristbands", href: "/category/accessories?type=towels" },
        { label: "View All Accessories →", href: "/category/accessories" },
      ],
    },
    {
      id: "shop",
      name: "All Products & Deals",
      subtitle: "Explore Full Catalog",
      icon: Tag,
      color: "text-purple-600 bg-purple-50",
      items: [
        { label: "🔥 Special Deals & Discounts", href: "/category/deals" },
        { label: "✨ New Arrivals 2026", href: "/category/new" },
        { label: "🏆 Best Sellers", href: "/category/best-sellers" },
        { label: "All Products Catalog", href: "/category/all" },
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
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold transition ${
                      link.highlight
                        ? "text-red-600 hover:text-red-700 font-bold"
                        : link.active
                        ? "text-gray-950"
                        : "text-gray-600 hover:text-gray-950"
                    }`}
                  >
                    {link.highlight && (
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0 animate-pulse" />
                    )}
                    <span>{link.name}</span>
                    {link.badge && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-600 border border-red-200">
                        {link.badge}
                      </span>
                    )}
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

            {/* Right Icons: Custom Combo CTA, Search, Admin Panel, Cart */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Dedicated Custom Combo Button (Tablet & Desktop) */}
              <Link
                href="/custom-combo"
                className="inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-[10px] sm:text-xs shadow-xs hover:shadow-red-600/40 hover:scale-105 active:scale-95 transition-all group shrink-0 border border-red-500/30"
                title="Build Custom Combo - Save 10%"
              >
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300 fill-amber-300 animate-pulse shrink-0" />
                <span className="tracking-tight whitespace-nowrap">
                  <span className="sm:hidden">Combo</span>
                  <span className="hidden sm:inline">Custom Combo</span>
                </span>
                <span className="bg-black/30 text-amber-200 px-1 py-0.2 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider">
                  -10%
                </span>
              </Link>

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
                    className="sm:hidden p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-full transition"
                    aria-label="Sign In to your account"
                    title="Sign In"
                  >
                    <User className="w-5 h-5" />
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
                aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isMobileMenuOpen}
                className="lg:hidden w-9 h-9 flex items-center justify-center text-gray-800 hover:text-black hover:bg-gray-100 active:scale-95 rounded-xl border border-gray-200/90 shadow-2xs transition-all"
                title="Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-900" />
                ) : (
                  <Menu className="w-5 h-5" />
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
            <div className="relative w-[88vw] max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
              {/* Drawer Top Header with Official Logo & Close Button */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 bg-white/95 backdrop-blur-md sticky top-0 z-20">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 group"
                >
                  <div className="relative w-8 h-8 bg-black rounded-xl p-1.5 flex items-center justify-center shadow-xs">
                    <Image
                      src="/images/loki-logo.png"
                      alt="LOKI"
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="font-black text-base tracking-tight text-gray-950">
                        LOKI
                      </span>
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1 py-0.2 rounded tracking-wide">
                        ZONE
                      </span>
                    </div>
                    <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">
                      Official Nepal Store
                    </span>
                  </div>
                </Link>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close Menu"
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-950 hover:bg-gray-100 rounded-full transition active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Navigation Body */}
              <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3.5 overscroll-contain">
                {/* 1. Quick In-Drawer Search Bar */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsSearchOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 text-xs font-semibold border border-gray-200/70 transition shadow-2xs group text-left"
                >
                  <Search className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                  <span className="truncate">Search rackets, blades, shoes, balls...</span>
                </button>

                {/* 2. Featured Custom Combo Studio Card */}
                <Link
                  href="/custom-combo"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block p-3.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-2xl shadow-md shadow-red-600/20 group border border-red-500/30 transition hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm flex items-center gap-1.5 leading-tight">
                          <span>Custom Combo Studio</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-400 text-slate-950 uppercase tracking-wider">
                            -10%
                          </span>
                        </div>
                        <div className="text-[11px] text-white/85 font-normal mt-0.5">
                          Blade + Forehand + Backhand Rubbers
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </div>
                </Link>

                {/* 3. Section Title: Shop by Category */}
                <div>
                  <div className="px-1 mb-1.5 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <span>Shop by Category</span>
                    <Link
                      href="/category/all"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-red-600 font-bold hover:underline normal-case text-xs"
                    >
                      View All
                    </Link>
                  </div>

                  <div className="space-y-1.5">
                    {mobileCategories.map((cat) => {
                      const isExpanded = mobileExpandedCategory === cat.name;
                      const IconComponent = cat.icon;
                      return (
                        <div
                          key={cat.id}
                          className="rounded-xl border border-gray-100 overflow-hidden bg-white shadow-2xs"
                        >
                          <button
                            onClick={() => toggleMobileAccordion(cat.name)}
                            className={`w-full flex items-center justify-between p-3 text-left transition ${
                              isExpanded ? "bg-gray-50/80" : "hover:bg-gray-50/60"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cat.color}`}
                              >
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-bold text-gray-900 truncate">
                                    {cat.name}
                                  </span>
                                  {cat.badge && (
                                    <span
                                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${cat.badgeColor}`}
                                    >
                                      {cat.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-gray-500 truncate font-medium">
                                  {cat.subtitle}
                                </p>
                              </div>
                            </div>
                            <ChevronDown
                              className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                                isExpanded ? "rotate-180 text-red-600" : ""
                              }`}
                            />
                          </button>

                          {isExpanded && (
                            <div className="px-3 pb-2.5 pt-1 space-y-1 bg-gray-50/50 border-t border-gray-100 animate-in fade-in duration-150">
                              {cat.items.map((sub) => (
                                <Link
                                  key={sub.label}
                                  href={sub.href}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="flex items-center justify-between py-2 px-2.5 text-xs font-semibold text-gray-700 hover:text-red-600 hover:bg-white rounded-lg transition"
                                >
                                  <span className="truncate">{sub.label}</span>
                                  {sub.badge && (
                                    <span className="ml-2 text-[9px] font-bold px-1.5 py-0.2 rounded bg-gray-200/80 text-gray-700">
                                      {sub.badge}
                                    </span>
                                  )}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Quick Services & Direct Nepal Support */}
                <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-200/70 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                    Customer Support Nepal
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/order-tracking"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 p-2 bg-white rounded-xl border border-gray-200/60 text-xs font-bold text-gray-800 hover:border-gray-300 transition shadow-2xs"
                    >
                      <Truck className="w-4 h-4 text-red-600 shrink-0" />
                      <span className="truncate">Track Order</span>
                    </Link>
                    <a
                      href="https://wa.me/9779800000000"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-white rounded-xl border border-gray-200/60 text-xs font-bold text-gray-800 hover:border-gray-300 transition shadow-2xs"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">WhatsApp</span>
                    </a>
                  </div>
                  <div className="text-[10px] text-gray-500 px-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Free Kathmandu delivery over NPR 2,000 · COD Nationwide</span>
                  </div>
                </div>
              </div>

              {/* Drawer Bottom Auth Section */}
              <div className="p-4 border-t border-gray-100 bg-gray-50/90 sticky bottom-0 z-20">
                {isMounted && isSignedIn && user ? (
                  <div className="space-y-2.5">
                    {/* User Profile Card */}
                    <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-gray-200/80 shadow-2xs">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
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
                        <span
                          className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                            adminRole === "main"
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : adminRole === "normal"
                              ? "bg-blue-100 text-blue-700 border border-blue-200"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {adminRole === "main"
                            ? "Store Owner / Main Admin"
                            : adminRole === "normal"
                            ? "Staff Desk"
                            : "LOKI Member"}
                        </span>
                      </div>
                    </div>

                    {/* Quick Account Links */}
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/account"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-2 px-3 text-center bg-white hover:bg-gray-100 text-gray-900 border border-gray-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <User className="w-3.5 h-3.5 text-gray-600" />
                        <span>My Profile</span>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="py-2 px-3 text-center bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-600" />
                        <span>Sign Out</span>
                      </button>
                    </div>

                    {/* Admin Access Button (if Store Owner / Staff) */}
                    {isPrivilegedUser && (
                      <Link
                        href="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shadow-red-600/30"
                      >
                        <ShieldCheck className="w-4 h-4 text-white" />
                        <span>Open Admin Workspace</span>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 py-2.5 text-center bg-white hover:bg-gray-100 text-gray-900 border border-gray-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <User className="w-3.5 h-3.5 text-gray-600" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 py-2.5 text-center bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shadow-red-600/30"
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
