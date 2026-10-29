"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useClerk, useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FileSpreadsheet,
  Tag,
  Settings,
  Users,
  ShieldCheck,
  Search,
  Plus,
  Edit,
  Trash2,
  Clock,
  Truck,
  AlertCircle,
  ExternalLink,
  Filter,
  Sparkles,
  TrendingUp,
  ChevronRight,
  Save,
  UploadCloud,
  X,
  FileText,
  Check,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Percent,
  RefreshCw,
  Eye,
  DollarSign,
  AlertTriangle,
  Sliders,
  Monitor,
  Tablet,
  Smartphone,
  Flame,
  Printer,
  Zap,
  CheckCircle2,
  Lock,
  Layers,
  Award,
  HelpCircle,
  Star,
  LogOut,
  Palette,
} from "lucide-react";
import LandingPageCMSStudio from "@/components/admin/LandingPageCMSStudio";
import {
  useAdminStore,
  HeroSlideCMS,
  FloatingPillCMS,
  AdminOrder,
  CouponCMS,
  StoreSettingsCMS,
  StaffMember,
  CustomerRecord,
  RateSheetItem,
  ReviewCMS,
  FAQItemCMS,
  CTABannerCMS,
} from "@/store/useAdminStore";
import { Product } from "@/data/products";

// Hero CMS Gradient Themes
const GRADIENT_PRESETS = [
  {
    name: "Electric Violet / Blue",
    value: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 30%, #8b5cf6 65%, #ec4899 100%)",
  },
  {
    name: "Hyper Crimson / Flame",
    value: "linear-gradient(135deg, #ef4444 0%, #f97316 45%, #eab308 100%)",
  },
  {
    name: "Cyber Cyan / Neon",
    value: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)",
  },
  {
    name: "Solar Amber / Emerald",
    value: "linear-gradient(135deg, #f59e0b 0%, #10b981 50%, #06b6d4 100%)",
  },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user, isLoaded: isUserLoaded } = useUser();
  const {
    isAdminAuthenticated,
    adminEmail,
    logoutAdmin,
    loginAdmin,
    adminRole,
    setAdminRole,
    products,
    setProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    heroSlides,
    updateHeroSlide,
    addHeroSlide,
    deleteHeroSlide,
    floatingPills,
    addFloatingPill,
    deleteFloatingPill,
    updateFloatingPill,
    autoBestSellerEnabled,
    toggleAutoBestSeller,
    orders,
    setOrders,
    updateOrderStatus,
    updateOrderCourierNote,
    rateSheetItems,
    addRateSheetItem,
    updateRateSheetItem,
    deleteRateSheetItem,
    coupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCoupon,
    storeSettings,
    updateStoreSettings,
    customers,
    staffMembers,
    addStaffMember,
    removeStaffMember,
    toggleStaffStatus,
    reviews,
    addReview,
    updateReview,
    deleteReview,
    faqs,
    addFAQ,
    updateFAQ,
    deleteFAQ,
    ctaBanner,
    updateCTABanner,
  } = useAdminStore();

  const isMaster = adminRole === "main";
  const isNormal = adminRole === "normal";

  // Authentication Guard synchronized with Clerk server session
  const [isClientReady, setIsClientReady] = useState(false);

  useEffect(() => {
    if (!isUserLoaded) return;
    setIsClientReady(true);

    if (!user) {
      logoutAdmin();
      router.replace("/login");
      return;
    }

    const primaryEmail =
      user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
        ?.emailAddress ||
      user.emailAddresses[0]?.emailAddress ||
      "";

    const normalized = primaryEmail.toLowerCase().trim();
    const isMain =
      normalized === "chandanthakurchandan935@gmail.com" ||
      normalized === "joshi.ritiz@gmail.com" ||
      user.publicMetadata?.role === "main";
    const isStaff =
      normalized === "staff@lokizone.com.np" ||
      user.publicMetadata?.role === "normal" ||
      user.publicMetadata?.role === "staff";

    if (isMain) {
      loginAdmin(normalized, "main");
    } else if (isStaff) {
      loginAdmin(normalized, "normal");
    } else {
      logoutAdmin();
      router.replace("/account?error=unauthorized_admin");
      return;
    }

    // Synchronize live database orders and catalog
    const syncDatabaseState = async () => {
      try {
        const [ordersRes, prodsRes] = await Promise.all([
          fetch("/api/admin/orders"),
          fetch("/api/admin/products"),
        ]);
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          if (ordersData.success && Array.isArray(ordersData.orders)) {
            setOrders(ordersData.orders);
          }
        }
        if (prodsRes.ok) {
          const prodsData = await prodsRes.json();
          if (prodsData.success && Array.isArray(prodsData.products)) {
            const mapped = prodsData.products.map((p: any) => ({
              id: p.id,
              name: p.name,
              series: p.series || "PERFORMANCE SERIES",
              subtitle: p.subtitle || "",
              brand: p.brand || "LOKI",
              price: Number(p.price),
              originalPrice: Number(p.original_price),
              discountPercent: Number(p.discount_percent) || 0,
              rating: Number(p.rating) || 5.0,
              reviewsCount: Number(p.reviews_count) || 0,
              category: p.category,
              image: p.image,
              additionalImages: p.additional_images || [],
              description: p.description || "",
              inStock: Boolean(p.in_stock),
              stockCount: Number(p.stock_count) || 0,
              tags: p.tags || [],
              salesCount: Number(p.sales_count) || 0,
              weeklyVelocity: Number(p.weekly_velocity) || 0,
              specs: p.specs || {},
            }));
            setProducts(mapped);
          }
        }
      } catch (err) {
        console.error("[Admin State Sync Error]:", err);
      }
    };
    syncDatabaseState();
  }, [isUserLoaded, user, router, loginAdmin, logoutAdmin, setOrders, setProducts]);

  const handleAdminLogout = async () => {
    try {
      await signOut();
    } catch {
      // Continue client cleanup
    }
    logoutAdmin();
    router.replace("/login");
  };

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Notifications
  const [toastMessage, setToastMessage] = useState<string>("");
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // 1. PRODUCTS STATE
  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState<string>("ALL");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [newProd, setNewProd] = useState({
    name: "",
    subtitle: "",
    category: "Rackets" as Product["category"],
    series: "PERFORMANCE SERIES",
    price: 2499,
    originalPrice: 3200,
    stockCount: 20,
    image: "/images/product-1-light.png",
    description: "",
    speed: 90,
    spin: 92,
    control: 88,
    bladeType: "5-Ply Wood",
    rubber: "High-Grip Pimples-In",
    ballPack: "6-Pack (40+ mm)",
    footwearSizes: "EU 39–44",
    apparelSizes: "S, M, L, XL, XXL",
  });

  // 2. HERO CMS STATE
  const [selectedSlideId, setSelectedSlideId] = useState(1);
  const [devicePreview, setDevicePreview] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const currentSlide = heroSlides.find((s) => s.id === selectedSlideId) || heroSlides[0] || {
    id: 1,
    bgImage: "/images/hero-bg.jpg",
    eyebrow: "PREMIUM TABLE TENNIS GEAR",
    titleLine1: "PLAY YOUR",
    titleLine2: "BEST GAME",
    gradient: GRADIENT_PRESETS[0].value,
    description: "High performance gear for champions.",
    ctaText: "Shop Now",
    ctaLink: "/category/all",
    featuredBadge: "Official Collection",
  };

  // Add Slide Modal
  const [isAddSlideOpen, setIsAddSlideOpen] = useState(false);
  const [newSlideForm, setNewSlideForm] = useState({
    eyebrow: "NEW 2026 EDITION",
    titleLine1: "SPEED &",
    titleLine2: "PRECISION",
    gradient: GRADIENT_PRESETS[0].value,
    description: "Engineered for rapid attacking rallies and high-tension loop drives.",
    ctaText: "Shop Gear",
    ctaLink: "/category/all",
    featuredBadge: "Tournament Ready",
    bgImage: "/images/hero-bg.jpg",
  });

  // Add Pill Modal
  const [isAddPillOpen, setIsAddPillOpen] = useState(false);
  const [newPillForm, setNewPillForm] = useState({
    id: "",
    label: "",
    image: "/images/icon-racket.png",
    link: "/category/all",
  });

  // 3. RATE SHEETS STATE
  const [isAddRateItemOpen, setIsAddRateItemOpen] = useState(false);
  const [isEditRateItemOpen, setIsEditRateItemOpen] = useState(false);
  const [editingRateItem, setEditingRateItem] = useState<RateSheetItem | null>(null);
  const [isUploadSheetOpen, setIsUploadSheetOpen] = useState(false);
  const [csvUploadText, setCsvUploadText] = useState("");

  const [newRateItem, setNewRateItem] = useState({
    sku: "",
    name: "",
    retailNPR: 2500,
    tier1_9: 2500,
    tier10_49: 2125,
    tier50plus: 1875,
  });

  // 4. ORDERS & INVOICE STATE
  const [orderFilter, setOrderFilter] = useState<string>("ALL");
  const [orderSearch, setOrderSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<AdminOrder | null>(null);
  const [courierNoteInput, setCourierNoteInput] = useState("");

  // 5. COUPONS STATE
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [isEditCouponOpen, setIsEditCouponOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponCMS | null>(null);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountType: "percent" as "percent" | "fixed",
    discountValue: 10,
    minSpend: 1500,
  });

  // 6. CUSTOMER DETAILS DRAWER
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  // 7. STAFF STATE
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    role: "normal" as "main" | "normal",
  });

  // 8. STORE SETTINGS STATE
  const [settingsForm, setSettingsForm] = useState<StoreSettingsCMS>({
    ...storeSettings,
  });

  // 9. REVIEWS CMS STATE
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [isEditReviewOpen, setIsEditReviewOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewCMS | null>(null);
  const [newReviewForm, setNewReviewForm] = useState({
    playerName: "",
    roleOrClub: "",
    rating: 5,
    equipment: "",
    comment: "",
    verified: true,
  });

  // 10. FAQ CMS STATE
  const [isAddFAQOpen, setIsAddFAQOpen] = useState(false);
  const [isEditFAQOpen, setIsEditFAQOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQItemCMS | null>(null);
  const [newFAQForm, setNewFAQForm] = useState<{
    question: string;
    answer: string;
    category: "shipping" | "products" | "warranty" | "payment";
  }>({
    question: "",
    answer: "",
    category: "shipping",
  });

  // 11. CTA BANNER CMS STATE
  const [ctaForm, setCtaForm] = useState<CTABannerCMS>({
    ...ctaBanner,
  });

  // FILTER LOGIC
  const filteredProducts = products.filter((p) => {
    const matchCat = productCategory === "ALL" || p.category.toLowerCase() === productCategory.toLowerCase();
    const matchSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(productSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredOrders = orders.filter((o) => {
    const matchStatus = orderFilter === "ALL" || o.status.toUpperCase() === orderFilter.toUpperCase();
    const matchSearch =
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.phone.includes(orderSearch);
    return matchStatus && matchSearch;
  });

  // KPI Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalItemsSold = orders.reduce((sum, o) => sum + o.itemsCount, 0);
  const lowStockCount = products.filter((p) => p.stockCount <= 5).length;
  const processingOrdersCount = orders.filter((o) => o.status === "Processing").length;

  // Role switching
  const handleSwitchToStaff = () => {
    setAdminRole("normal");
    if (["landing-cms", "hero", "coupons", "customers", "staff", "settings", "reviews", "faqs"].includes(activeTab)) {
      setActiveTab("overview");
    }
    showToast("Switched to Store Staff View (Operational Mode)");
  };

  const handleReturnToMainAdmin = () => {
    setAdminRole("main");
    showToast("Returned to Main Admin (Chandan Thakur — Full Access)");
  };

  // PRODUCT HANDLERS
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMaster) return;
    const id = "loki-" + newProd.name.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now().toString().slice(-4);
    const created: Product = {
      id,
      name: newProd.name,
      subtitle: newProd.subtitle || "Official LOKI ITTF Approved",
      series: newProd.series,
      brand: "LOKI",
      category: newProd.category,
      price: Number(newProd.price),
      originalPrice: Number(newProd.originalPrice),
      stockCount: Number(newProd.stockCount),
      inStock: Number(newProd.stockCount) > 0,
      image: newProd.image || "/images/product-1-light.png",
      additionalImages: [newProd.image || "/images/product-1-light.png"],
      description: newProd.description || "High-performance table tennis equipment engineered by LOKI.",
      rating: 5.0,
      reviewsCount: 1,
      tags: ["Official ITTF Authorized", "Fast Nationwide Delivery", "100% Genuine"],
      salesCount: 0,
      weeklyVelocity: 0,
      specs:
        newProd.category === "Rackets"
          ? {
              control: Number(newProd.control),
              spin: Number(newProd.spin),
              speed: Number(newProd.speed),
              bladeType: newProd.bladeType || "5-Ply Wood",
              rubber: newProd.rubber || "High-Grip Pimples-In",
            }
          : newProd.category === "Balls"
          ? {
              bladeType: newProd.ballPack || "6-Pack (40+ mm)",
            }
          : newProd.category === "Footwear"
          ? {
              handleStyle: ["EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44"],
            }
          : newProd.category === "Apparel"
          ? {
              handleStyle: ["S", "M", "L", "XL", "XXL"],
            }
          : {},
    };
    addProduct(created);
    setIsAddProductOpen(false);
    showToast(`✅ Created product "${created.name}" successfully!`);
    fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(created),
    }).catch((err) => console.error("Failed to save product to database:", err));
    setNewProd({
      name: "",
      subtitle: "",
      category: "Rackets",
      series: "PERFORMANCE SERIES",
      price: 2499,
      originalPrice: 3200,
      stockCount: 20,
      image: "/images/product-1-light.png",
      description: "",
      speed: 90,
      spin: 92,
      control: 88,
      bladeType: "5-Ply Wood",
      rubber: "High-Grip Pimples-In",
      ballPack: "6-Pack (40+ mm)",
      footwearSizes: "EU 39–44",
      apparelSizes: "S, M, L, XL, XXL",
    });
  };

  const handleSaveProductEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !isMaster) return;
    updateProduct(editingProduct.id, editingProduct);
    setIsEditProductOpen(false);
    showToast(`✅ Updated "${editingProduct.name}" completely!`);
    fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingProduct),
    }).catch((err) => console.error("Failed to update product in database:", err));
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (!isMaster) return;
    if (confirm(`Are you sure you want to delete "${name}" from catalog?`)) {
      deleteProduct(id);
      showToast(`🗑️ Deleted "${name}" from catalog.`);
      fetch("/api/admin/products?id=" + encodeURIComponent(id), {
        method: "DELETE",
      }).catch((err) => console.error("Failed to archive product in database:", err));
    }
  };

  // HERO SLIDE HANDLERS
  const handleCreateSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMaster) return;
    const nextId = Math.max(...heroSlides.map((s) => s.id), 0) + 1;
    const created: HeroSlideCMS = {
      id: nextId,
      ...newSlideForm,
    };
    addHeroSlide(created);
    setSelectedSlideId(nextId);
    setIsAddSlideOpen(false);
    showToast(`✅ Created Slide #${nextId} "${created.titleLine1} ${created.titleLine2}"!`);
  };

  const handleDeleteSlide = (id: number) => {
    if (!isMaster) return;
    if (heroSlides.length <= 1) {
      alert("At least one slide must remain active in the hero carousel.");
      return;
    }
    if (confirm(`Delete Slide #${id}?`)) {
      deleteHeroSlide(id);
      const remaining = heroSlides.filter((s) => s.id !== id);
      setSelectedSlideId(remaining[0].id);
      showToast(`🗑️ Slide #${id} removed.`);
    }
  };

  const handleSlideChange = (field: keyof HeroSlideCMS, value: string) => {
    if (!isMaster) return;
    updateHeroSlide(currentSlide.id, { [field]: value });
  };

  // FLOATING PILLS HANDLERS
  const handleCreatePill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMaster) return;
    const pillId = newPillForm.id.trim() || newPillForm.label.toLowerCase().replace(/[^a-z0-9]/g, "-") || `pill-${Date.now().toString().slice(-4)}`;
    addFloatingPill({
      id: pillId,
      label: newPillForm.label.trim(),
      image: newPillForm.image.trim(),
      link: newPillForm.link.trim(),
    });
    setIsAddPillOpen(false);
    showToast(`✅ Added floating pill "${newPillForm.label}"!`);
    setNewPillForm({ id: "", label: "", image: "/images/icon-racket.png", link: "/category/all" });
  };

  const handleDeletePill = (id: string, label: string) => {
    if (!isMaster) return;
    if (confirm(`Delete category pill "${label}"?`)) {
      deleteFloatingPill(id);
      showToast(`🗑️ Removed "${label}" pill.`);
    }
  };

  const handlePillChange = (id: string, field: keyof FloatingPillCMS, value: string) => {
    if (!isMaster) return;
    updateFloatingPill(id, { [field]: value });
  };

  // RATE SHEET HANDLERS
  const handleCreateRateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMaster) return;
    addRateSheetItem({
      sku: newRateItem.sku.toUpperCase().trim(),
      name: newRateItem.name,
      retailNPR: Number(newRateItem.retailNPR),
      tier1_9: Number(newRateItem.tier1_9),
      tier10_49: Number(newRateItem.tier10_49),
      tier50plus: Number(newRateItem.tier50plus),
    });
    setIsAddRateItemOpen(false);
    showToast(`✅ Added "${newRateItem.name}" to Wholesale Rate Matrix!`);
    setNewRateItem({
      sku: "",
      name: "",
      retailNPR: 2500,
      tier1_9: 2500,
      tier10_49: 2125,
      tier50plus: 1875,
    });
  };

  const handleSaveRateItemEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRateItem || !isMaster) return;
    updateRateSheetItem(editingRateItem.sku, editingRateItem);
    setIsEditRateItemOpen(false);
    showToast(`✅ Updated wholesale tiers for "${editingRateItem.name}"!`);
  };

  const handleDeleteRateItem = (sku: string, name: string) => {
    if (!isMaster) return;
    if (confirm(`Delete rate matrix row for "${name}" (${sku})?`)) {
      deleteRateSheetItem(sku);
      showToast(`🗑️ Removed ${sku} from matrix.`);
    }
  };

  const handleProcessCsvUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMaster) return;
    const lines = csvUploadText.trim().split("\n");
    let addedCount = 0;
    lines.forEach((line) => {
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length >= 5) {
        const [sku, name, retail, t10_49, t50plus] = parts;
        if (sku && name && !isNaN(Number(retail))) {
          addRateSheetItem({
            sku: sku.toUpperCase(),
            name,
            retailNPR: Number(retail),
            tier1_9: Number(retail),
            tier10_49: Number(t10_49) || Math.round(Number(retail) * 0.85),
            tier50plus: Number(t50plus) || Math.round(Number(retail) * 0.75),
          });
          addedCount++;
        }
      }
    });
    setIsUploadSheetOpen(false);
    setCsvUploadText("");
    showToast(`✅ Successfully imported ${addedCount} rate items into matrix!`);
  };

  // COUPON HANDLERS
  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMaster) return;
    addCoupon({
      code: newCoupon.code.toUpperCase().trim(),
      discountType: newCoupon.discountType,
      discountValue: Number(newCoupon.discountValue),
      minSpend: Number(newCoupon.minSpend),
      active: true,
      usageCount: 0,
    });
    setIsAddCouponOpen(false);
    showToast(`✅ Created coupon code "${newCoupon.code.toUpperCase()}"!`);
    setNewCoupon({ code: "", discountType: "percent", discountValue: 10, minSpend: 1500 });
  };

  const handleSaveCouponEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon || !isMaster) return;
    updateCoupon(editingCoupon.code, editingCoupon);
    setIsEditCouponOpen(false);
    showToast(`✅ Saved changes to coupon "${editingCoupon.code}"!`);
  };

  // STAFF HANDLERS
  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMaster) return;
    const staffId = "STAFF-" + (staffMembers.length + 1).toString().padStart(3, "0");
    addStaffMember({
      id: staffId,
      name: newStaff.name,
      email: newStaff.email.toLowerCase().trim(),
      role: newStaff.role,
      status: "active",
      lastLogin: "Just Created",
    });
    setIsAddStaffOpen(false);
    showToast(`✅ Added ${newStaff.name} as ${newStaff.role === "main" ? "Main Admin" : "Normal Admin"}.`);
    setNewStaff({ name: "", email: "", role: "normal" });
  };

  // SETTINGS HANDLER
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMaster) return;
    updateStoreSettings(settingsForm);
    showToast("✅ Store configuration & delivery tariffs saved!");
  };

  // REVIEWS HANDLERS
  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMaster) return;
    const newId = "REV-" + Date.now().toString().slice(-4);
    const created: ReviewCMS = {
      id: newId,
      playerName: newReviewForm.playerName.trim(),
      roleOrClub: newReviewForm.roleOrClub.trim() || "Club Player",
      rating: Number(newReviewForm.rating) || 5,
      equipment: newReviewForm.equipment.trim() || "LOKI Tournament Gear",
      comment: newReviewForm.comment.trim(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      verified: newReviewForm.verified,
    };
    addReview(created);
    setIsAddReviewOpen(false);
    setNewReviewForm({
      playerName: "",
      roleOrClub: "",
      rating: 5,
      equipment: "",
      comment: "",
      verified: true,
    });
    showToast(`✅ Added player review from "${created.playerName}"!`);
  };

  const handleSaveReviewEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview || !isMaster) return;
    updateReview(editingReview.id, editingReview);
    setIsEditReviewOpen(false);
    showToast(`✅ Saved changes to review from "${editingReview.playerName}"!`);
  };

  const handleDeleteReview = (id: string, name: string) => {
    if (!isMaster) return;
    if (confirm(`Delete endorsement review from "${name}"?`)) {
      deleteReview(id);
      showToast(`🗑️ Removed review from "${name}".`);
    }
  };

  // FAQS HANDLERS
  const handleCreateFAQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMaster) return;
    const newId = "FAQ-" + Date.now().toString().slice(-4);
    const created: FAQItemCMS = {
      id: newId,
      question: newFAQForm.question.trim(),
      answer: newFAQForm.answer.trim(),
      category: newFAQForm.category,
    };
    addFAQ(created);
    setIsAddFAQOpen(false);
    setNewFAQForm({
      question: "",
      answer: "",
      category: "shipping",
    });
    showToast(`✅ Added FAQ question!`);
  };

  const handleSaveFAQEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFAQ || !isMaster) return;
    updateFAQ(editingFAQ.id, editingFAQ);
    setIsEditFAQOpen(false);
    showToast(`✅ Saved FAQ item!`);
  };

  const handleDeleteFAQ = (id: string, question: string) => {
    if (!isMaster) return;
    if (confirm(`Delete FAQ "${question.slice(0, 35)}..."?`)) {
      deleteFAQ(id);
      showToast(`🗑️ Removed FAQ item.`);
    }
  };

  // CTA BANNER HANDLER
  const handleSaveCTABanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMaster) return;
    updateCTABanner(ctaForm);
    showToast("✅ Pre-Footer Final CTA Banner updated & live on homepage!");
  };

  // NAVIGATION TABS BASED ON ROLE
  const navTabs = isMaster
    ? [
        { id: "overview", label: "Overview & Analytics", icon: LayoutDashboard },
        { id: "products", label: "Products & Inventory", icon: Package, badge: products.length },
        { id: "landing-cms", label: "Landing Page Studio (CMS)", icon: Palette, badge: "Full CMS" },
        { id: "hero", label: "Hero & Pills CMS", icon: Sliders },
        { id: "reviews", label: "Player Reviews CMS", icon: Award, badge: reviews.length },
        { id: "faqs", label: "FAQs & Help CMS", icon: HelpCircle, badge: faqs.length },
        { id: "rates", label: "Rate Sheets", icon: FileSpreadsheet, badge: "Q4" },
        { id: "orders", label: "Orders & Courier", icon: ShoppingBag, badge: orders.length },
        { id: "coupons", label: "Coupons & Promos", icon: Tag, badge: coupons.length },
        { id: "customers", label: "Customers CRM", icon: Users, badge: customers.length },
        { id: "staff", label: "Two-Admin Roles", icon: ShieldCheck, badge: staffMembers.length },
        { id: "settings", label: "Store Settings", icon: Settings },
      ]
    : [
        { id: "overview", label: "Staff Desk Overview", icon: LayoutDashboard },
        { id: "products", label: "Stock Adjustment", icon: Package, badge: products.length },
        { id: "orders", label: "Orders & Dispatch", icon: ShoppingBag, badge: orders.length },
        { id: "rates", label: "Wholesale Rate Lookup", icon: FileSpreadsheet, badge: "Matrix" },
      ];

  if (!isClientReady || !isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-9 h-9 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">
            Checking Authorized Access...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161f30] border border-red-500/40 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl animate-fade-in">
          <Sparkles className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* STAFF PREVIEW NOTIFICATION BANNER (ONLY visible when Master is previewing Staff view) */}
      {isNormal && (
        <div className="bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-blue-900/90 border-b border-blue-500/40 px-4 py-2 text-xs flex items-center justify-between text-blue-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="font-bold">Store Staff (Normal Admin) View:</span>
            <span className="text-blue-200 hidden sm:inline">
              Only stock adjusting, order fulfillment, and wholesale matrix lookup are accessible.
            </span>
          </div>
          <button
            onClick={handleReturnToMainAdmin}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] transition shadow-md shadow-red-600/30"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Return to Main Admin ↩</span>
          </button>
        </div>
      )}

      {/* TOP COMMAND BAR */}
      <header className="sticky top-0 z-30 bg-[#0d121c]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3 transition-all">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Branding & Role Status */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-black border border-slate-700 p-1 flex items-center justify-center group-hover:scale-105 transition">
                <Image
                  src="/images/loki-logo.png"
                  alt="LOKI"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="font-black text-sm tracking-tight text-white flex items-center gap-1">
                  LOKI <span className="text-red-500">ADMIN HUB</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {isMaster ? "Executive Store & Catalog Manager" : "Staff Operations Desk"}
                </span>
              </div>
            </Link>

            {/* Current Active Role Badge */}
            <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
              {isMaster ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span>MAIN ADMIN</span>
                  <span className="hidden md:inline text-[11px] text-red-300 font-semibold opacity-85">
                    ({adminEmail?.includes("ritiz") ? "Ritiz Joshi" : "Chandan Thakur"} · Full Authority)
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                  <span>STORE STAFF DESK</span>
                  <span className="hidden md:inline text-[11px] text-blue-300 font-semibold opacity-85">
                    (Operational Access Only)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* The Switch View button is ONLY shown to Main Admin! Never to staff! */}
            {isMaster && (
              <button
                onClick={handleSwitchToStaff}
                title="Preview how Store Staff operates"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold transition shadow-md"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Staff View</span>
              </button>
            )}

            {/* Back to Website */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Storefront</span>
            </Link>

            {/* Log Out */}
            <button
              onClick={handleAdminLogout}
              title="Sign Out of Admin Session"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 text-xs font-bold text-red-400 hover:text-red-300 transition shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN ADMIN WORKSPACE */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 bg-[#0d121c] border-b md:border-b-0 md:border-r border-slate-800/80 p-3 sm:p-4 flex-shrink-0 flex md:flex-col justify-between overflow-x-auto md:overflow-x-visible">
          <div className="w-full">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1 mb-2 hidden md:block">
              {isMaster ? "Master Administration" : "Staff Operations"}
            </div>
            <nav className="flex md:flex-col gap-1 w-full">
              {navTabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left whitespace-nowrap ${
                      isActive
                        ? isMaster
                          ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                          : "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-4 h-4 flex-shrink-0" />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge !== undefined && (
                      <span className="text-[10px] bg-slate-800/90 text-slate-300 px-2 py-0.5 rounded-full">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User Profile Mini Footer */}
          <div className="hidden md:block pt-4 border-t border-slate-800/80 mt-auto">
            <div className="bg-[#121824] border border-slate-800 rounded-xl p-3">
              <div className="text-[11px] font-bold text-slate-200">
                {isMaster ? "Chandan Thakur (Owner)" : "Store Operations Officer"}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
                <span>Scope:</span>
                <span className={`font-bold ${isMaster ? "text-red-400" : "text-blue-400"}`}>
                  {isMaster ? "All 11 Modules" : "Operational Only"}
                </span>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800/70 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 truncate max-w-[130px] font-mono">
                  {adminEmail || "Admin Session"}
                </span>
                <button
                  onClick={handleAdminLogout}
                  className="text-[10px] text-red-400 hover:text-red-300 font-bold transition flex items-center gap-1"
                  title="Sign Out"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Exit</span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN VIEWPORT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121824] border border-slate-800 rounded-2xl p-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {isMaster ? "Master Admin Command Center" : "Store Staff Operations Desk"}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    {isMaster
                      ? "Complete store management: Full add/edit controls for catalog, pricing, slides, rate sheets, coupons, and staff."
                      : "Staff workspace: Adjust stock quantities (+ / -), fulfill customer orders, and inspect wholesale rates."}
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => setActiveTab("products")}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 text-white rounded-xl text-xs font-bold transition shadow-md ${
                      isMaster
                        ? "bg-red-600 hover:bg-red-500 shadow-red-600/30"
                        : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/30"
                    }`}
                  >
                    <span>{isMaster ? "Manage Inventory" : "Adjust Stock"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {isMaster ? (
                  <div className="bg-[#121824] border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                      <span>Total Revenue</span>
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-black text-white">
                      Rs. {totalRevenue.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                      <span className="text-emerald-400 font-bold">+18.4%</span>
                      <span>from last month</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#121824] border border-blue-500/20 rounded-2xl p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                      <span>Pending Dispatch</span>
                      <Clock className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-2xl font-black text-white">
                      {processingOrdersCount} Orders
                    </div>
                    <div className="text-[11px] text-slate-400 mt-2">
                      Ready for packing &amp; courier
                    </div>
                  </div>
                )}

                <div className="bg-[#121824] border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <span>Processed Orders</span>
                    <ShoppingBag className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{orders.length} Orders</div>
                  <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                    <span className="text-blue-400 font-bold">{totalItemsSold} items</span>
                    <span>shipped nationwide</span>
                  </div>
                </div>

                <div className="bg-[#121824] border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <span>Active Products</span>
                    <Package className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{products.length} Products</div>
                  <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                    <span className="text-purple-400 font-bold">100% Genuine</span>
                    <span>ITTF tournament gear</span>
                  </div>
                </div>

                <div className="bg-[#121824] border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <span>Low Stock Alerts</span>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-amber-400">{lowStockCount} Items</div>
                  <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                    <span>Stock &lt;= 5 units</span>
                  </div>
                </div>
              </div>

              {/* Main Admin Only: Real-Time Best Sellers Rankings */}
              {isMaster && (
                <div className="bg-[#121824] border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Flame className="w-4 h-4 text-red-500" />
                        <span>Automated Best Sellers Algorithm Ranking</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Real-time storefront product priority calculated from sales velocity.
                      </p>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                      {autoBestSellerEnabled ? "Engine Active" : "Default Catalog"}
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[#0b0f17] border-b border-slate-800 text-slate-400 font-bold">
                          <th className="py-2.5 px-4">Rank</th>
                          <th className="py-2.5 px-4">Product Name</th>
                          <th className="py-2.5 px-4">Category</th>
                          <th className="py-2.5 px-4">Retail Price</th>
                          <th className="py-2.5 px-4">Units Sold</th>
                          <th className="py-2.5 px-4">7-Day Velocity</th>
                          <th className="py-2.5 px-4">Badge</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {[...products]
                          .sort((a, b) => (b.salesCount + b.weeklyVelocity) - (a.salesCount + a.weeklyVelocity))
                          .slice(0, 5)
                          .map((prod, index) => (
                            <tr key={prod.id} className="hover:bg-slate-800/20 transition">
                              <td className="py-3 px-4 font-bold">
                                <span
                                  className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black ${
                                    index === 0
                                      ? "bg-amber-400 text-slate-950"
                                      : index === 1
                                      ? "bg-slate-300 text-slate-900"
                                      : index === 2
                                      ? "bg-amber-700/60 text-white"
                                      : "text-slate-400"
                                  }`}
                                >
                                  #{index + 1}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-bold text-white">{prod.name}</td>
                              <td className="py-3 px-4 text-slate-400">{prod.category}</td>
                              <td className="py-3 px-4 font-bold text-white">
                                Rs. {prod.price.toLocaleString()}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-slate-300">
                                {prod.salesCount} pcs
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                                +{prod.weeklyVelocity}/wk
                              </td>
                              <td className="py-3 px-4">
                                {index === 0 ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">
                                    <Flame className="w-3 h-3 text-red-400" />
                                    #1 Best Seller
                                  </span>
                                ) : index === 1 ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                                    <Sparkles className="w-3 h-3 text-amber-400" />
                                    High Demand
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-500">Popular</span>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRODUCTS & STOCK */}
          {activeTab === "products" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121824] border border-slate-800 rounded-2xl p-5">
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                    <span>{isMaster ? "Product Catalog & Full CRUD Editor" : "Stock Quantity Adjustment Desk"}</span>
                    <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400 font-normal">
                      {filteredProducts.length} items
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {isMaster
                      ? "Main Admin has full access to add products with specs, inline edit prices (NPR), edit all details, and delete."
                      : "Store Staff can adjust live inventory stock count (+ / -) in real time."}
                  </p>
                </div>
                {/* Add Product Button ONLY for Main Admin */}
                {isMaster && (
                  <button
                    onClick={() => setIsAddProductOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-red-600/30"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Product</span>
                  </button>
                )}
              </div>

              {/* Search & Category Filter */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search by product title or SKU..."
                    className="w-full pl-10 pr-4 py-2 bg-[#121824] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  {["ALL", "Rackets", "Rubbers", "Apparel", "Footwear", "Accessories"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setProductCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                        productCategory.toLowerCase() === cat.toLowerCase()
                          ? isMaster ? "bg-red-600 text-white" : "bg-blue-600 text-white"
                          : "bg-[#121824] text-slate-400 hover:text-white border border-slate-800"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="bg-[#121824] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold bg-[#0d121c]">
                        <th className="py-3 px-4">Product Details</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4 text-center">Live Stock</th>
                        <th className="py-3 px-4">Retail Price (NPR)</th>
                        {isMaster && <th className="py-3 px-4 text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-800/20 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 p-1 flex-shrink-0 flex items-center justify-center">
                                <Image
                                  src={p.image}
                                  alt={p.name}
                                  width={40}
                                  height={40}
                                  className="object-contain max-h-10"
                                />
                              </div>
                              <div>
                                <div className="font-bold text-white text-xs hover:text-red-400 transition">
                                  {p.name}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  SKU: <span className="font-mono text-slate-300">{p.id}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-semibold text-[10px]">
                              {p.category}
                            </span>
                          </td>
                          {/* Live Stock Adjustment: Available for both roles */}
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex items-center gap-2 bg-[#0b0f17] border border-slate-800 rounded-xl px-2 py-1">
                              <button
                                onClick={() => adjustStock(p.id, -1)}
                                className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs transition"
                                title="Decrease Stock (-1)"
                              >
                                -
                              </button>
                              <span
                                className={`w-10 text-center font-mono font-bold text-xs ${
                                  p.stockCount <= 5 ? "text-amber-400" : "text-emerald-400"
                                }`}
                              >
                                {p.stockCount}
                              </span>
                              <button
                                onClick={() => adjustStock(p.id, 1)}
                                className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs transition"
                                title="Increase Stock (+1)"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          {/* Price: Inline edit for Master; clean text for Staff */}
                          <td className="py-3 px-4">
                            {isMaster ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-400 font-semibold">Rs.</span>
                                <input
                                  type="number"
                                  defaultValue={p.price}
                                  onBlur={(e) => {
                                    const val = Number(e.target.value);
                                    if (val > 0 && val !== p.price) {
                                      updateProduct(p.id, { price: val });
                                      showToast(`Updated "${p.name}" price to Rs. ${val}`);
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.currentTarget.blur();
                                    }
                                  }}
                                  className="w-24 px-2 py-1 rounded-lg bg-[#0b0f17] border border-slate-700 text-white font-bold text-xs focus:border-red-500 focus:outline-none"
                                />
                              </div>
                            ) : (
                              <div className="text-slate-200 font-bold">
                                Rs. {p.price.toLocaleString()}
                              </div>
                            )}
                          </td>
                          {/* Actions: Main Admin only */}
                          {isMaster && (
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingProduct({ ...p });
                                    setIsEditProductOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                                  title="Edit Product Details"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: COMPLETE LANDING PAGE CMS STUDIO (MAIN ADMIN ONLY) */}
          {activeTab === "landing-cms" && isMaster && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest mb-2">
                    <Palette className="w-3.5 h-3.5 text-red-500" />
                    <span>Complete Landing Page Visual CMS Studio</span>
                  </div>
                  <h2 className="text-xl font-black text-white">Full Storefront Landing Page Editor</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Select products from your inventory for the Trending grid, recommend gear for Control / Spin / Speed playstyles, customize categories, and edit all section copy.
                  </p>
                </div>

                <Link
                  href="/"
                  target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-red-600/30 whitespace-nowrap self-start sm:self-auto"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Preview Live Homepage</span>
                </Link>
              </div>

              <LandingPageCMSStudio />
            </div>
          )}

          {/* TAB 3: HERO & PILLS CMS (MAIN ADMIN ONLY) */}
          {activeTab === "hero" && isMaster && (
            <div className="space-y-6">
              <div className="bg-[#121824] border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white">Hero Section CMS &amp; Live Viewports</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage storefront hero slides, add custom slides via form, typography gradients, and category pills.
                  </p>
                </div>
                {/* Device Selector & Add Slide Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAddSlideOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-red-600/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Slide</span>
                  </button>

                  <div className="flex items-center gap-1 bg-[#0b0f17] p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setDevicePreview("desktop")}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        devicePreview === "desktop" ? "bg-red-600 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDevicePreview("tablet")}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        devicePreview === "tablet" ? "bg-red-600 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Tablet className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDevicePreview("mobile")}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        devicePreview === "mobile" ? "bg-red-600 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Slide Selector & Delete */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {heroSlides.map((slide) => (
                    <button
                      key={slide.id}
                      onClick={() => setSelectedSlideId(slide.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                        selectedSlideId === slide.id
                          ? "bg-red-600 border-red-500 text-white shadow-md shadow-red-600/20"
                          : "bg-[#121824] border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      Slide {slide.id}: {slide.titleLine1} {slide.titleLine2}
                    </button>
                  ))}
                </div>
                {heroSlides.length > 1 && (
                  <button
                    onClick={() => handleDeleteSlide(currentSlide.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-bold transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Slide #{currentSlide.id}</span>
                  </button>
                )}
              </div>

              {/* Visual Live Device Preview Container */}
              <div className="bg-[#121824] border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-red-500" />
                    <span>Live Render Preview ({devicePreview.toUpperCase()})</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold">
                    Slide #{currentSlide.id}
                  </span>
                </div>

                <div className="flex justify-center bg-[#0b0f17] p-6 rounded-2xl border border-slate-800 overflow-hidden">
                  <div
                    className={`relative rounded-2xl p-8 border border-slate-700 bg-cover bg-center transition-all duration-300 shadow-2xl flex flex-col justify-end min-h-[340px] ${
                      devicePreview === "desktop"
                        ? "w-full max-w-4xl"
                        : devicePreview === "tablet"
                        ? "w-[560px]"
                        : "w-[340px]"
                    }`}
                    style={{ backgroundImage: `url(${currentSlide.bgImage})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent rounded-2xl" />
                    <div className="relative z-10 space-y-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] tracking-wider uppercase inline-block">
                        {currentSlide.featuredBadge}
                      </span>
                      <div className="text-xs font-bold text-red-400 tracking-widest uppercase">
                        {currentSlide.eyebrow}
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                        {currentSlide.titleLine1}{" "}
                        <span
                          style={{
                            background: currentSlide.gradient,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          {currentSlide.titleLine2}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-300 max-w-lg line-clamp-2">
                        {currentSlide.description}
                      </p>
                      <div className="pt-2">
                        <span className="inline-block px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl shadow-lg">
                          {currentSlide.ctaText} →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gradient Presets Selector */}
              <div className="bg-[#121824] border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-2">Typography Gradient Presets</h3>
                <p className="text-xs text-slate-400 mb-4">Click to apply instant high-contrast visual styling for title highlights.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {GRADIENT_PRESETS.map((gp) => (
                    <button
                      key={gp.name}
                      onClick={() => handleSlideChange("gradient", gp.value)}
                      className={`p-3 rounded-xl border text-left transition ${
                        currentSlide.gradient === gp.value
                          ? "border-red-500 bg-red-500/10"
                          : "border-slate-800 bg-[#0b0f17] hover:border-slate-700"
                      }`}
                    >
                      <div className="text-xs font-bold text-white mb-1.5">{gp.name}</div>
                      <div
                        className="h-3 rounded-full"
                        style={{ background: gp.value }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Slide Fields Editor */}
              <div className="bg-[#121824] border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">Edit Slide #{currentSlide.id} Content</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Eyebrow Headline</label>
                    <input
                      type="text"
                      value={currentSlide.eyebrow}
                      onChange={(e) => handleSlideChange("eyebrow", e.target.value)}
                      className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Featured Badge</label>
                    <input
                      type="text"
                      value={currentSlide.featuredBadge}
                      onChange={(e) => handleSlideChange("featuredBadge", e.target.value)}
                      className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Title Line 1</label>
                    <input
                      type="text"
                      value={currentSlide.titleLine1}
                      onChange={(e) => handleSlideChange("titleLine1", e.target.value)}
                      className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Title Line 2 (Gradient Highlight)</label>
                    <input
                      type="text"
                      value={currentSlide.titleLine2}
                      onChange={(e) => handleSlideChange("titleLine2", e.target.value)}
                      className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-300 mb-1">Slide Description</label>
                    <textarea
                      rows={2}
                      value={currentSlide.description}
                      onChange={(e) => handleSlideChange("description", e.target.value)}
                      className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">CTA Button Text</label>
                    <input
                      type="text"
                      value={currentSlide.ctaText}
                      onChange={(e) => handleSlideChange("ctaText", e.target.value)}
                      className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Background Image URL</label>
                    <input
                      type="text"
                      value={currentSlide.bgImage}
                      onChange={(e) => handleSlideChange("bgImage", e.target.value)}
                      className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Floating Pills CMS */}
              <div className="bg-[#121824] border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">Floating Category Navigation Pills CMS</h3>
                  <button
                    onClick={() => setIsAddPillOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-red-600/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Category Pill</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  {floatingPills.map((pill) => (
                    <div key={pill.id} className="bg-[#0b0f17] border border-slate-800 rounded-xl p-4 space-y-2 relative">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Image src={pill.image} alt={pill.label} width={24} height={24} className="object-contain" />
                          <span className="font-bold text-white">{pill.label} Pill</span>
                        </div>
                        {floatingPills.length > 1 && (
                          <button
                            onClick={() => handleDeletePill(pill.id, pill.label)}
                            className="text-slate-500 hover:text-red-400 p-1"
                            title="Delete Pill"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block">Label</label>
                        <input
                          type="text"
                          value={pill.label}
                          onChange={(e) => handlePillChange(pill.id, "label", e.target.value)}
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block">Target Link</label>
                        <input
                          type="text"
                          value={pill.link}
                          onChange={(e) => handlePillChange(pill.id, "link", e.target.value)}
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PLAYER REVIEWS CMS (MAIN ADMIN ONLY) */}
          {activeTab === "reviews" && isMaster && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121824] border border-slate-800 rounded-2xl p-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-[10px] uppercase tracking-wider mb-2">
                    <Award className="w-3 h-3" />
                    <span>Home Page Section #7</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Player Reviews &amp; Endorsements CMS
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Manage real match player feedback, club credentials, ratings, and equipment tags displayed in the verified social proof grid.
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => setIsAddReviewOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-red-600/30"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Player Review</span>
                  </button>
                </div>
              </div>

              {/* Reviews Table */}
              <div className="bg-[#121824] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    Active Endorsements ({reviews.length})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Live synced to homepage with 4.9 aggregate badge
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#0b0f17] text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Player &amp; Affiliation</th>
                        <th className="py-3 px-4">Rating</th>
                        <th className="py-3 px-4">Equipment Tag</th>
                        <th className="py-3 px-4">Testimonial Quote</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {reviews.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500">
                            No reviews added yet. Click &quot;Add Player Review&quot; to publish one.
                          </td>
                        </tr>
                      ) : (
                        reviews.map((rev) => (
                          <tr key={rev.id} className="hover:bg-slate-800/40 transition">
                            <td className="py-3.5 px-4">
                              <div className="font-extrabold text-white text-sm">
                                {rev.playerName}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {rev.roleOrClub}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex text-amber-400">
                                {[...Array(rev.rating || 5)].map((_, i) => (
                                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                                ))}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">
                                {rev.equipment || "LOKI Gear"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 max-w-xs">
                              <p className="line-clamp-2 text-slate-300 italic">
                                &ldquo;{rev.comment}&rdquo;
                              </p>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {rev.verified ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Verified</span>
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500">Standard</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingReview(rev);
                                    setIsEditReviewOpen(true);
                                  }}
                                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                                  title="Edit review"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteReview(rev.id, rev.playerName)}
                                  className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                                  title="Delete review"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: FAQS & HELP CMS (MAIN ADMIN ONLY) */}
          {activeTab === "faqs" && isMaster && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121824] border border-slate-800 rounded-2xl p-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-[10px] uppercase tracking-wider mb-2">
                    <HelpCircle className="w-3 h-3" />
                    <span>Home Page Section #8</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Frequently Asked Questions (FAQ) CMS
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Manage interactive accordion questions covering Kathmandu &amp; nationwide delivery, ITTF authenticity, Fonepay payments, and warranty.
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => setIsAddFAQOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-red-600/30"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add FAQ Question</span>
                  </button>
                </div>
              </div>

              {/* FAQ Accordion List */}
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-[#121824] border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[10px] uppercase">
                          {faq.category}
                        </span>
                        <h3 className="font-bold text-white text-sm">
                          {faq.question}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <button
                          onClick={() => {
                            setEditingFAQ(faq);
                            setIsEditFAQOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-bold transition"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteFAQ(faq.id, faq.question)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-[11px] font-bold transition"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed pl-1">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: WHOLESALE BULK RATE SHEETS */}
          {activeTab === "rates" && (
            <div className="space-y-6">
              <div className="bg-[#121824] border border-slate-800 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-[10px]">
                        ACTIVE RATE MATRIX
                      </span>
                      <span className="text-xs text-slate-400">v4.2 Q4</span>
                    </div>
                    <h2 className="text-xl font-black text-white mt-2">
                      LOKI Official Wholesale Price Matrix Q4 2026
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Validity Period: <strong className="text-slate-200">2026-10-01 to 2026-12-31</strong> • Approver: <strong className="text-slate-200">Chandan Thakur</strong>
                    </p>
                  </div>
                  {/* Actions ONLY for Main Admin */}
                  {isMaster && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsAddRateItemOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-red-600/30"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Rate Item</span>
                      </button>
                      <button
                        onClick={() => setIsUploadSheetOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload Sheet</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Rate Matrix Table with Edit/Delete for Master */}
              <div className="bg-[#121824] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>Tiered Quantity Price Matrix (NPR)</span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    {isMaster ? "Full Edit & Add Privileges" : "Staff Quote Lookup Desk"}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold bg-[#0d121c]">
                        <th className="py-3 px-4">Item SKU &amp; Name</th>
                        <th className="py-3 px-4">Standard Retail (1-9 pcs)</th>
                        <th className="py-3 px-4 text-emerald-400">Wholesale Tier (10-49 pcs) [-15%]</th>
                        <th className="py-3 px-4 text-amber-400">Club Bulk Tier (50+ pcs) [-25%]</th>
                        {isMaster && <th className="py-3 px-4 text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {rateSheetItems.map((item) => (
                        <tr key={item.sku} className="hover:bg-slate-800/20 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{item.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{item.sku}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-300">
                            Rs. {item.retailNPR.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                            Rs. {item.tier10_49.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                            Rs. {item.tier50plus.toLocaleString()}
                          </td>
                          {isMaster && (
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => {
                                    setEditingRateItem({ ...item });
                                    setIsEditRateItemOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                                  title="Edit Rate Item"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteRateItem(item.sku, item.name)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                                  title="Delete Item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ORDERS & COURIER DISPATCH */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121824] border border-slate-800 rounded-2xl p-5">
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                    <span>Customer Orders &amp; Dispatch Desk</span>
                    <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400 font-normal">
                      {filteredOrders.length} orders
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Both Main Admin and Store Staff can fulfill orders, update tracking notes, and print official dispatch invoices.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {["ALL", "Processing", "Dispatched", "Delivered"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        orderFilter.toUpperCase() === st.toUpperCase()
                          ? isMaster ? "bg-red-600 text-white" : "bg-blue-600 text-white"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="bg-[#121824] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold bg-[#0d121c]">
                        <th className="py-3 px-4">Order ID &amp; Date</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Items</th>
                        <th className="py-3 px-4">Total (NPR)</th>
                        <th className="py-3 px-4">Payment</th>
                        <th className="py-3 px-4">Fulfillment Status</th>
                        <th className="py-3 px-4 text-right">Invoice &amp; Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-800/20 transition">
                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-white">{o.id}</div>
                            <div className="text-[10px] text-slate-400">{o.date}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-200">{o.customerName}</div>
                            <div className="text-[10px] text-slate-400">{o.phone} • {o.city}</div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-300">
                            {o.itemsCount} {o.itemsCount === 1 ? "item" : "items"}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                            Rs. {o.total.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px]">
                              {o.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={o.status}
                              onChange={async (e) => {
                                const newStatus = e.target.value as AdminOrder["status"];
                                updateOrderStatus(o.id, newStatus);
                                showToast(`Order ${o.id} marked as ${newStatus}.`);
                                try {
                                  await fetch("/api/admin/orders", {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      orderId: o.id,
                                      newStatus,
                                      cancellationReason: newStatus === "Cancelled" ? "Admin cancelled from dashboard" : undefined,
                                    }),
                                  });
                                } catch (err) {
                                  console.error("Order status update failed:", err);
                                }
                              }}
                              className="bg-[#0b0f17] border border-slate-700 text-white font-bold text-[11px] rounded-lg px-2.5 py-1 focus:outline-none focus:border-red-500"
                            >
                              <option value="Pending Confirmation">Pending Confirmation</option>
                              <option value="Pending Confirmation">Pending Confirmation</option>
                  <option value="Processing">Processing</option>
                              <option value="Dispatched">Dispatched</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedInvoiceOrder(o);
                                  setCourierNoteInput(o.courierNote || "");
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 font-bold text-[11px] border border-red-500/20 transition"
                                title="Inspect & Print Invoice"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Invoice</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedOrder(o);
                                  setCourierNoteInput(o.courierNote || "");
                                }}
                                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] transition"
                              >
                                Note
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: COUPONS (MAIN ADMIN ONLY) */}
          {activeTab === "coupons" && isMaster && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121824] border border-slate-800 rounded-2xl p-5">
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight">
                    Promotions &amp; Coupon Engine
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Create and edit promotional discount vouchers with custom spend minimums.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddCouponOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-red-600/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Coupon</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map((c) => (
                  <div
                    key={c.code}
                    className="bg-[#121824] border border-slate-800 rounded-2xl p-5 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-black text-base text-white tracking-wider">
                        {c.code}
                      </span>
                      <button
                        onClick={() => toggleCoupon(c.code)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.active
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {c.active ? "ACTIVE" : "PAUSED"}
                      </button>
                    </div>
                    <div className="text-xl font-bold text-red-400 mt-1">
                      {c.discountType === "percent"
                        ? `${c.discountValue}% OFF`
                        : `Rs. ${c.discountValue} OFF`}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-2">
                      Min Spend: Rs. {c.minSpend.toLocaleString()} • Redemptions: {c.usageCount}
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setEditingCoupon({ ...c });
                          setIsEditCouponOpen(true);
                        }}
                        className="text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => deleteCoupon(c.code)}
                        className="text-slate-500 hover:text-red-400 text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: CUSTOMERS CRM (MAIN ADMIN ONLY) */}
          {activeTab === "customers" && isMaster && (
            <div className="space-y-4">
              <div className="bg-[#121824] border border-slate-800 rounded-2xl p-5">
                <h2 className="text-lg font-black text-white tracking-tight">Customer Directory &amp; Lifetime Value</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Directory of customer accounts, click any customer to view past orders and details.
                </p>
              </div>

              <div className="bg-[#121824] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold bg-[#0d121c]">
                      <th className="py-3 px-4">Customer ID &amp; Name</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">City</th>
                      <th className="py-3 px-4 text-center">Orders</th>
                      <th className="py-3 px-4 text-right">Lifetime Spent (NPR)</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-800/20 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{c.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{c.id}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-300">{c.email}</div>
                          <div className="text-[10px] text-slate-400">{c.phone}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{c.city}</td>
                        <td className="py-3 px-4 text-center font-bold text-white">{c.ordersCount}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                          Rs. {c.totalSpent.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedCustomer(c)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] transition"
                          >
                            View History
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: STAFF & TWO-ADMIN ROLES (MAIN ADMIN ONLY) */}
          {activeTab === "staff" && isMaster && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121824] border border-slate-800 rounded-2xl p-5">
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight">
                    Staff Accounts &amp; Two-Admin Hierarchy
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage store operators. Assign Main Admin (Full Authority) or Normal Admin (Staff Desk).
                  </p>
                </div>
                <button
                  onClick={() => setIsAddStaffOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-red-600/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Staff Account</span>
                </button>
              </div>

              {/* ⚠️ Important limitation notice */}
              <div className="bg-amber-900/20 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-300 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-amber-200">Staff Access Limitation — Read Before Adding Staff</p>
                  <p className="text-amber-300/90">
                    Staff added here are stored in <strong>this browser only</strong> (localStorage). They will appear in this roster but
                    <strong> cannot log in to the admin panel</strong> until their email is also added to the
                    <code className="mx-1 px-1 bg-amber-900/50 rounded text-amber-100">STAFF_EMAILS</code>
                    environment variable on the server, or their Clerk account has
                    <code className="mx-1 px-1 bg-amber-900/50 rounded text-amber-100">publicMetadata.role = &quot;staff&quot;</code>
                    set via the Clerk Dashboard.
                  </p>
                  <p className="text-amber-400 font-semibold">Pre-authorized server-side staff: staff@lokizone.com.np</p>
                </div>
              </div>

              <div className="bg-[#121824] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold bg-[#0d121c]">
                      <th className="py-3 px-4">Staff ID &amp; Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Administrative Role</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4">Last Active</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {staffMembers.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-800/20 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{st.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{st.id}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">{st.email}</td>
                        <td className="py-3 px-4">
                          {st.role === "main" ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-bold text-[10px]">
                              MAIN ADMIN
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold text-[10px]">
                              NORMAL ADMIN
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => toggleStaffStatus(st.id)}
                            disabled={st.role === "main"}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              st.status === "active"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {st.status.toUpperCase()}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-slate-400">{st.lastLogin}</td>
                        <td className="py-3 px-4 text-right">
                          {st.role !== "main" && (
                            <button
                              onClick={() => removeStaffMember(st.id)}
                              className="text-slate-500 hover:text-red-400 font-semibold text-xs transition"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: STORE SETTINGS (MAIN ADMIN ONLY) */}
          {activeTab === "settings" && isMaster && (
            <div className="space-y-4">
              <div className="bg-[#121824] border border-slate-800 rounded-2xl p-6 max-w-2xl">
                <h2 className="text-lg font-black text-white tracking-tight mb-1">
                  Store Configuration &amp; Delivery Tariffs
                </h2>
                <p className="text-xs text-slate-400 mb-6">
                  Manage store identity, support lines, announcement bar, and delivery rates.
                </p>

                <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Official Store Name</label>
                    <input
                      type="text"
                      value={settingsForm.storeName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Top Announcement Bar Text</label>
                    <input
                      type="text"
                      value={settingsForm.announcementText}
                      onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Support Helpline Phone</label>
                      <input
                        type="text"
                        value={settingsForm.supportPhone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, supportPhone: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Support Email</label>
                      <input
                        type="email"
                        value={settingsForm.supportEmail}
                        onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Inside Valley Delivery (NPR)</label>
                      <input
                        type="number"
                        value={settingsForm.deliveryInsideValley}
                        onChange={(e) => setSettingsForm({ ...settingsForm, deliveryInsideValley: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Outside Valley Delivery (NPR)</label>
                      <input
                        type="number"
                        value={settingsForm.deliveryOutsideValley}
                        onChange={(e) => setSettingsForm({ ...settingsForm, deliveryOutsideValley: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Free Shipping Min (NPR)</label>
                      <input
                        type="number"
                        value={settingsForm.freeShippingThreshold}
                        onChange={(e) => setSettingsForm({ ...settingsForm, freeShippingThreshold: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#0b0f17] border border-slate-700">
                      <div>
                        <span className="font-bold text-white block">Automated Best Sellers Algorithm</span>
                        <span className="text-[11px] text-slate-400">Sort products automatically by weekly purchase velocity</span>
                      </div>
                      <button
                        type="button"
                        onClick={toggleAutoBestSeller}
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          autoBestSellerEnabled ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-400"
                        }`}
                      >
                        {autoBestSellerEnabled ? "ENABLED" : "DISABLED"}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="mt-4 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition shadow-md shadow-red-600/30"
                  >
                    Save Store Settings
                  </button>
                </form>
              </div>

              {/* Pre-Footer Final CTA Banner Editor */}
              <div className="bg-[#121824] border border-slate-800 rounded-2xl p-6 max-w-2xl">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-[10px] uppercase tracking-wider mb-1">
                      <Zap className="w-3 h-3" />
                      <span>Home Page Section #9</span>
                    </div>
                    <h2 className="text-base font-black text-white tracking-tight">
                      Pre-Footer Final CTA Banner CMS
                    </h2>
                    <p className="text-xs text-slate-400">
                      Customize the high-conversion tournament invitation banner right above the footer.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextState = !ctaForm.active;
                      setCtaForm({ ...ctaForm, active: nextState });
                      updateCTABanner({ active: nextState });
                      showToast(nextState ? "✅ Pre-Footer Banner is now ACTIVE" : "⚠️ Pre-Footer Banner is now HIDDEN");
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                      ctaForm.active ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    {ctaForm.active ? "BANNER ACTIVE" : "BANNER HIDDEN"}
                  </button>
                </div>

                <form onSubmit={handleSaveCTABanner} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Eyebrow Headline</label>
                    <input
                      type="text"
                      value={ctaForm.eyebrow}
                      onChange={(e) => setCtaForm({ ...ctaForm, eyebrow: e.target.value })}
                      placeholder="e.g. READY TO DOMINATE THE TABLE?"
                      className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Headline Title *</label>
                    <input
                      type="text"
                      required
                      value={ctaForm.title}
                      onChange={(e) => setCtaForm({ ...ctaForm, title: e.target.value })}
                      placeholder="e.g. Equip Your Game with Championship Precision"
                      className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Subtitle Description</label>
                    <textarea
                      rows={3}
                      value={ctaForm.subtitle}
                      onChange={(e) => setCtaForm({ ...ctaForm, subtitle: e.target.value })}
                      placeholder="Describe your invitation or free delivery threshold..."
                      className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Primary Button Text</label>
                      <input
                        type="text"
                        value={ctaForm.primaryBtnText}
                        onChange={(e) => setCtaForm({ ...ctaForm, primaryBtnText: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Primary Button Link</label>
                      <input
                        type="text"
                        value={ctaForm.primaryBtnLink}
                        onChange={(e) => setCtaForm({ ...ctaForm, primaryBtnLink: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Secondary Button Text</label>
                      <input
                        type="text"
                        value={ctaForm.secondaryBtnText}
                        onChange={(e) => setCtaForm({ ...ctaForm, secondaryBtnText: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Secondary Button Link</label>
                      <input
                        type="text"
                        value={ctaForm.secondaryBtnLink}
                        onChange={(e) => setCtaForm({ ...ctaForm, secondaryBtnLink: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Live Preview Card */}
                  <div className="p-4 rounded-xl bg-black border border-slate-800 text-center space-y-2">
                    <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider">
                      {ctaForm.eyebrow}
                    </span>
                    <h4 className="text-sm font-black text-white">
                      {ctaForm.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                      {ctaForm.subtitle}
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <span className="px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-bold">
                        {ctaForm.primaryBtnText}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
                        {ctaForm.secondaryBtnText}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition shadow-md shadow-red-600/30"
                  >
                    Save CTA Banner
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================
          MODAL 1: ADD PRODUCT (MAIN ADMIN)
          ======================================================== */}
      {isAddProductOpen && isMaster && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-xs shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add New Catalog Product</h3>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LOKI Arthur Pro Carbon Blade"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value as Product["category"] })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Rackets">Rackets</option>
                    <option value="Balls">Balls</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Series Badge</label>
                  <input
                    type="text"
                    value={newProd.series}
                    onChange={(e) => setNewProd({ ...newProd, series: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Tagline / Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. 5-Ply Pure Wood + 2-Ply Carbon Attack"
                  value={newProd.subtitle}
                  onChange={(e) => setNewProd({ ...newProd, subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Price (NPR) *</label>
                  <input
                    type="number"
                    min="1"
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Strike Price</label>
                  <input
                    type="number"
                    min="1"
                    value={newProd.originalPrice}
                    onChange={(e) => setNewProd({ ...newProd, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={newProd.stockCount}
                    onChange={(e) => setNewProd({ ...newProd, stockCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Category-Specific Specifications Fields */}
              {newProd.category === "Rackets" && (
                <div className="p-3 bg-[#0b0f17] border border-slate-800 rounded-xl space-y-3">
                  <span className="font-bold text-slate-300 block text-xs">Racket Performance Ratings (0–100)</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Speed: {newProd.speed}</span>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={newProd.speed}
                        onChange={(e) => setNewProd({ ...newProd, speed: Number(e.target.value) })}
                        className="w-full accent-red-600"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Spin: {newProd.spin}</span>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={newProd.spin}
                        onChange={(e) => setNewProd({ ...newProd, spin: Number(e.target.value) })}
                        className="w-full accent-red-600"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Control: {newProd.control}</span>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={newProd.control}
                        onChange={(e) => setNewProd({ ...newProd, control: Number(e.target.value) })}
                        className="w-full accent-red-600"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Blade Construction</label>
                      <input
                        type="text"
                        placeholder="e.g. 5-Ply Pure Wood"
                        value={newProd.bladeType}
                        onChange={(e) => setNewProd({ ...newProd, bladeType: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-[#121824] border border-slate-700 rounded-lg text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Rubber Surface</label>
                      <input
                        type="text"
                        placeholder="e.g. High-Grip Pimples-In"
                        value={newProd.rubber}
                        onChange={(e) => setNewProd({ ...newProd, rubber: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-[#121824] border border-slate-700 rounded-lg text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {newProd.category === "Balls" && (
                <div className="p-3 bg-[#0b0f17] border border-slate-800 rounded-xl space-y-2">
                  <span className="font-bold text-slate-300 block text-xs">Ball Packaging &amp; ITTF Standards</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Pack Specification</label>
                      <input
                        type="text"
                        placeholder="e.g. 6-Pack (40+ mm)"
                        value={newProd.ballPack}
                        onChange={(e) => setNewProd({ ...newProd, ballPack: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-[#121824] border border-slate-700 rounded-lg text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Ball Rating</label>
                      <input
                        type="text"
                        disabled
                        value="ITTF 3-Star Competition Approved"
                        className="w-full px-2.5 py-1.5 bg-[#121824] border border-slate-800 rounded-lg text-slate-400 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {newProd.category === "Footwear" && (
                <div className="p-3 bg-[#0b0f17] border border-slate-800 rounded-xl space-y-2">
                  <span className="font-bold text-slate-300 block text-xs">Footwear Sizing &amp; Sole Grip</span>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Available EU Sizes</label>
                    <input
                      type="text"
                      placeholder="e.g. EU 39, 40, 41, 42, 43, 44"
                      value={newProd.footwearSizes}
                      onChange={(e) => setNewProd({ ...newProd, footwearSizes: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-[#121824] border border-slate-700 rounded-lg text-white text-xs"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Non-marking natural gum rubber sole configured by default.</p>
                  </div>
                </div>
              )}

              {newProd.category === "Apparel" && (
                <div className="p-3 bg-[#0b0f17] border border-slate-800 rounded-xl space-y-2">
                  <span className="font-bold text-slate-300 block text-xs">Apparel Sizing &amp; Fabric Fit</span>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Available Sizes</label>
                    <input
                      type="text"
                      placeholder="e.g. S, M, L, XL, XXL"
                      value={newProd.apparelSizes}
                      onChange={(e) => setNewProd({ ...newProd, apparelSizes: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-[#121824] border border-slate-700 rounded-lg text-white text-xs"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Aeroflex QuickDry athletic stretch fit configured by default.</p>
                  </div>
                </div>
              )}

              {newProd.category === "Accessories" && (
                <div className="p-3 bg-[#0b0f17] border border-slate-800 rounded-xl space-y-2">
                  <span className="font-bold text-slate-300 block text-xs">Accessory Specification</span>
                  <p className="text-[11px] text-slate-400">Protective gear, ITTF rubber sheets, edge tapes, and tournament accessories.</p>
                </div>
              )}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Image URL</label>
                <input
                  type="text"
                  value={newProd.image}
                  onChange={(e) => setNewProd({ ...newProd, image: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Product Description</label>
                <textarea
                  rows={2}
                  placeholder="Engineered for explosive topspin trajectory..."
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition shadow-md shadow-red-600/30"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: EDIT PRODUCT (MAIN ADMIN)
          ======================================================== */}
      {isEditProductOpen && editingProduct && isMaster && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-xs shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Full Product Editor: {editingProduct.name}</h3>
              <button
                onClick={() => setIsEditProductOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveProductEdit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Product Title</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={editingProduct.subtitle}
                  onChange={(e) => setEditingProduct({ ...editingProduct, subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as Product["category"] })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Rackets">Rackets</option>
                    <option value="Balls">Balls</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Series Badge</label>
                  <input
                    type="text"
                    value={editingProduct.series}
                    onChange={(e) => setEditingProduct({ ...editingProduct, series: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Retail Price (NPR)</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Original Price</label>
                  <input
                    type="number"
                    value={editingProduct.originalPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Stock Count</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.stockCount}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stockCount: Number(e.target.value), inStock: Number(e.target.value) > 0 })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              {/* Category-Specific Specifications */}
              {editingProduct.category === "Rackets" && (
                <div className="p-3 bg-[#0b0f17] border border-slate-800 rounded-xl space-y-2">
                  <span className="font-bold text-slate-300 block text-xs">Racket Performance Ratings (0–100)</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Speed: {editingProduct.specs?.speed ?? 85}</span>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={editingProduct.specs?.speed ?? 85}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            specs: { ...editingProduct.specs, speed: Number(e.target.value) },
                          })
                        }
                        className="w-full accent-red-600"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Spin: {editingProduct.specs?.spin ?? 88}</span>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={editingProduct.specs?.spin ?? 88}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            specs: { ...editingProduct.specs, spin: Number(e.target.value) },
                          })
                        }
                        className="w-full accent-red-600"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Control: {editingProduct.specs?.control ?? 90}</span>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={editingProduct.specs?.control ?? 90}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            specs: { ...editingProduct.specs, control: Number(e.target.value) },
                          })
                        }
                        className="w-full accent-red-600"
                      />
                    </div>
                  </div>
                </div>
              )}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Image URL</label>
                <input
                  type="text"
                  value={editingProduct.image}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditProductOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition shadow-md shadow-red-600/30"
                >
                  Save All Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: OFFICIAL PRINTABLE INVOICE / DISPATCH SLIP
          ======================================================== */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-xs shadow-2xl relative max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-500 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Official Dispatch Slip &amp; Invoice #{selectedInvoiceOrder.id}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Order Date: {selectedInvoiceOrder.date}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Shipping Summary */}
            <div className="my-5 p-4 rounded-xl bg-[#0b0f17] border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
                  Customer Information
                </span>
                <h4 className="font-bold text-sm text-white mt-1">
                  {selectedInvoiceOrder.customerName}
                </h4>
                <div className="flex items-center gap-1.5 text-slate-300 mt-1">
                  <Phone className="w-3.5 h-3.5 text-red-400" />
                  <a href={`tel:${selectedInvoiceOrder.phone}`} className="font-mono text-red-400 font-bold hover:underline">
                    {selectedInvoiceOrder.phone}
                  </a>
                </div>
                <div className="text-slate-400 mt-0.5">{selectedInvoiceOrder.email}</div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
                  Delivery Destination
                </span>
                <div className="flex items-start gap-1.5 text-slate-300 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>{selectedInvoiceOrder.address}, {selectedInvoiceOrder.city}</span>
                </div>
                <div className="mt-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
                    Payment Gateway
                  </span>
                  <span className="inline-block mt-0.5 font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700 text-[10px]">
                    {selectedInvoiceOrder.paymentMethod}
                  </span>
                </div>
              </div>
            </div>

            {/* Itemized Products */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Purchased Equipment
              </span>
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-[#0b0f17]">
                {selectedInvoiceOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-1">
                        <Image src={item.image} alt={item.name} width={32} height={32} className="object-contain" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">{item.name}</div>
                        <div className="text-[10px] text-slate-400">
                          Qty: {item.quantity} × Rs. {item.price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-white">
                      Rs. {(item.quantity * item.price).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="mt-4 p-4 rounded-xl bg-[#0b0f17] border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>Rs. {selectedInvoiceOrder.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery Charge</span>
                <span>
                  {selectedInvoiceOrder.deliveryFee === 0 ? "FREE" : `Rs. ${selectedInvoiceOrder.deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-emerald-400 pt-2 border-t border-slate-800">
                <span>Total Amount (NPR)</span>
                <span>Rs. {selectedInvoiceOrder.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Courier Dispatch Tracking Note Input */}
            <div className="mt-4 space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Courier Tracking / Dispatch Note
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Sent via Pathao Express AWB #948210. Rider 9800000000."
                  value={courierNoteInput}
                  onChange={(e) => setCourierNoteInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    updateOrderCourierNote(selectedInvoiceOrder.id, courierNoteInput);
                    showToast(`Courier note updated for ${selectedInvoiceOrder.id}`);
                    fetch("/api/admin/orders", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        orderId: selectedInvoiceOrder.id,
                        courierNote: courierNoteInput,
                      }),
                    }).catch((err) => console.error("Failed to update courier note:", err));
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
                >
                  Save Note
                </button>
              </div>
            </div>

            {/* Actions & Print */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold">Status:</span>
                <select
                  value={selectedInvoiceOrder.status}
                  onChange={async (e) => {
                    const newStatus = e.target.value as any;
                    updateOrderStatus(selectedInvoiceOrder.id, newStatus);
                    setSelectedInvoiceOrder({
                      ...selectedInvoiceOrder,
                      status: newStatus,
                    });
                    showToast(`Order status updated to ${newStatus}`);
                    try {
                      await fetch("/api/admin/orders", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          orderId: selectedInvoiceOrder.id,
                          newStatus,
                          cancellationReason: newStatus === "Cancelled" ? "Admin cancelled from dashboard" : undefined,
                        }),
                      });
                    } catch (err) {
                      console.error("Order status update failed:", err);
                    }
                  }}
                  className="bg-[#0b0f17] border border-slate-700 text-white font-bold text-xs rounded-lg px-2.5 py-1"
                >
                  <option value="Pending Confirmation">Pending Confirmation</option>
                  <option value="Processing">Processing</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition shadow-md shadow-red-600/30"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setSelectedInvoiceOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: ORDER QUICK NOTE (STAFF & MASTER)
          ======================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-xs shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Order {selectedOrder.id} Note</h3>
                <span className="text-[11px] text-slate-400">{selectedOrder.customerName} • {selectedOrder.phone}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-[#0b0f17] border border-slate-800 rounded-xl p-3">
                <div className="font-bold text-slate-300 mb-1">Delivery Address:</div>
                <div className="text-slate-400">{selectedOrder.address}, {selectedOrder.city}</div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Courier Tracking / Rider Dispatch Note
                </label>
                <textarea
                  rows={3}
                  value={courierNoteInput}
                  onChange={(e) => setCourierNoteInput(e.target.value)}
                  placeholder="e.g. Shipped via Pathao Express AWB #948201. Rider contact 9800000000."
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateOrderCourierNote(selectedOrder.id, courierNoteInput);
                    setSelectedOrder(null);
                    showToast(`Saved courier note for ${selectedOrder.id}.`);
                  }}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition shadow-md shadow-red-600/30"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 5: ADD SLIDE MODAL (MAIN ADMIN)
          ======================================================== */}
      {isAddSlideOpen && isMaster && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-xs shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add New Hero Carousel Slide</h3>
              <button
                onClick={() => setIsAddSlideOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSlide} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Eyebrow Headline *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TOURNAMENT EDITION 2026"
                    value={newSlideForm.eyebrow}
                    onChange={(e) => setNewSlideForm({ ...newSlideForm, eyebrow: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Featured Badge</label>
                  <input
                    type="text"
                    placeholder="e.g. ITTF Approved"
                    value={newSlideForm.featuredBadge}
                    onChange={(e) => setNewSlideForm({ ...newSlideForm, featuredBadge: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Title Line 1 *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. POWER &"
                    value={newSlideForm.titleLine1}
                    onChange={(e) => setNewSlideForm({ ...newSlideForm, titleLine1: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Title Line 2 (Gradient) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CONTROL"
                    value={newSlideForm.titleLine2}
                    onChange={(e) => setNewSlideForm({ ...newSlideForm, titleLine2: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Slide Description</label>
                <textarea
                  rows={2}
                  placeholder="High-tension topspin and pure aerodynamic loop control."
                  value={newSlideForm.description}
                  onChange={(e) => setNewSlideForm({ ...newSlideForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={newSlideForm.ctaText}
                    onChange={(e) => setNewSlideForm({ ...newSlideForm, ctaText: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">CTA Link</label>
                  <input
                    type="text"
                    value={newSlideForm.ctaLink}
                    onChange={(e) => setNewSlideForm({ ...newSlideForm, ctaLink: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Background Image URL</label>
                <input
                  type="text"
                  value={newSlideForm.bgImage}
                  onChange={(e) => setNewSlideForm({ ...newSlideForm, bgImage: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSlideOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition shadow-md shadow-red-600/30"
                >
                  Create Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 6: ADD CATEGORY PILL (MAIN ADMIN)
          ======================================================== */}
      {isAddPillOpen && isMaster && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full text-xs shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add Floating Category Pill</h3>
              <button
                onClick={() => setIsAddPillOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePill} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Pill Label *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Balls, Cases, Rubbers"
                  value={newPillForm.label}
                  onChange={(e) => setNewPillForm({ ...newPillForm, label: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Target Route URL *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. /category/accessories"
                  value={newPillForm.link}
                  onChange={(e) => setNewPillForm({ ...newPillForm, link: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Icon / Image URL</label>
                <input
                  type="text"
                  value={newPillForm.image}
                  onChange={(e) => setNewPillForm({ ...newPillForm, image: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPillOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition shadow-md shadow-red-600/30"
                >
                  Add Pill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 7: ADD RATE ITEM (MAIN ADMIN)
          ======================================================== */}
      {isAddRateItemOpen && isMaster && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full text-xs shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add Item to Wholesale Rate Matrix</h3>
              <button
                onClick={() => setIsAddRateItemOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateRateItem} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">SKU Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LK-PRO-BLADE"
                  value={newRateItem.sku}
                  onChange={(e) => setNewRateItem({ ...newRateItem, sku: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white font-mono uppercase"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Item Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LOKI Arthur Carbon Blade"
                  value={newRateItem.name}
                  onChange={(e) => setNewRateItem({ ...newRateItem, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Standard (1-9)</label>
                  <input
                    type="number"
                    value={newRateItem.retailNPR}
                    onChange={(e) => setNewRateItem({ ...newRateItem, retailNPR: Number(e.target.value), tier1_9: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Tier 10-49</label>
                  <input
                    type="number"
                    value={newRateItem.tier10_49}
                    onChange={(e) => setNewRateItem({ ...newRateItem, tier10_49: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Bulk 50+</label>
                  <input
                    type="number"
                    value={newRateItem.tier50plus}
                    onChange={(e) => setNewRateItem({ ...newRateItem, tier50plus: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddRateItemOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition shadow-md shadow-red-600/30"
                >
                  Add Rate Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 8: EDIT RATE ITEM (MAIN ADMIN)
          ======================================================== */}
      {isEditRateItemOpen && editingRateItem && isMaster && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full text-xs shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Edit Wholesale Tiers: {editingRateItem.sku}</h3>
              <button
                onClick={() => setIsEditRateItemOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveRateItemEdit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Item Title</label>
                <input
                  type="text"
                  value={editingRateItem.name}
                  onChange={(e) => setEditingRateItem({ ...editingRateItem, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Standard (1-9)</label>
                  <input
                    type="number"
                    value={editingRateItem.retailNPR}
                    onChange={(e) => setEditingRateItem({ ...editingRateItem, retailNPR: Number(e.target.value), tier1_9: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Tier 10-49</label>
                  <input
                    type="number"
                    value={editingRateItem.tier10_49}
                    onChange={(e) => setEditingRateItem({ ...editingRateItem, tier10_49: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Bulk 50+</label>
                  <input
                    type="number"
                    value={editingRateItem.tier50plus}
                    onChange={(e) => setEditingRateItem({ ...editingRateItem, tier50plus: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditRateItemOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition shadow-md shadow-red-600/30"
                >
                  Save Tiers
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 9: UPLOAD RATE SHEET MODAL (MAIN ADMIN)
          ======================================================== */}
      {isUploadSheetOpen && isMaster && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-xs shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Import Wholesale Rate Sheet</h3>
              <button
                onClick={() => setIsUploadSheetOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleProcessCsvUpload} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Paste CSV Lines (Format: SKU, Item Name, Retail NPR, Tier 10-49, Bulk 50+)
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="LK-BLADE-PRO, LOKI Pro Carbon Blade, 2499, 2124, 1874&#10;LK-RUBBER-V9, LOKI V9 Sticky Rubber, 1599, 1359, 1199"
                  value={csvUploadText}
                  onChange={(e) => setCsvUploadText(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white font-mono text-[11px]"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                You can paste multiple lines at once. Each valid line will be added immediately to the active wholesale matrix.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadSheetOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition shadow-md shadow-red-600/30"
                >
                  Import Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 10: ADD / EDIT COUPON (MAIN ADMIN)
          ======================================================== */}
      {isAddCouponOpen && isMaster && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full text-xs shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create New Coupon</h3>
              <button
                onClick={() => setIsAddCouponOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE20"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white font-mono uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Discount Type</label>
                  <select
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value as "percent" | "fixed" })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed NPR (Rs.)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Value</label>
                  <input
                    type="number"
                    min="1"
                    value={newCoupon.discountValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Minimum Spend (NPR)</label>
                <input
                  type="number"
                  min="0"
                  value={newCoupon.minSpend}
                  onChange={(e) => setNewCoupon({ ...newCoupon, minSpend: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCouponOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition shadow-md shadow-red-600/30"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditCouponOpen && editingCoupon && isMaster && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full text-xs shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Edit Coupon: {editingCoupon.code}</h3>
              <button
                onClick={() => setIsEditCouponOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveCouponEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Discount Type</label>
                  <select
                    value={editingCoupon.discountType}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, discountType: e.target.value as "percent" | "fixed" })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed NPR (Rs.)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Value</label>
                  <input
                    type="number"
                    min="1"
                    value={editingCoupon.discountValue}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Minimum Spend (NPR)</label>
                <input
                  type="number"
                  min="0"
                  value={editingCoupon.minSpend}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, minSpend: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditCouponOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition shadow-md shadow-red-600/30"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 11: CUSTOMER ORDER HISTORY DRAWER (MAIN ADMIN)
          ======================================================== */}
      {selectedCustomer && isMaster && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-xs shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">{selectedCustomer.name}</h3>
                <span className="text-[11px] text-slate-400">{selectedCustomer.phone} • {selectedCustomer.city}</span>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#0b0f17] border border-slate-800 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Lifetime Orders</span>
                  <span className="text-sm font-bold text-white">{selectedCustomer.ordersCount} orders</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Lifetime Total Spent</span>
                  <span className="text-sm font-bold text-emerald-400">Rs. {selectedCustomer.totalSpent.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-300 block mb-2">Customer Order Records</span>
                <div className="space-y-2">
                  {orders
                    .filter((o) => o.customerName.toLowerCase() === selectedCustomer.name.toLowerCase() || o.phone === selectedCustomer.phone)
                    .map((co) => (
                      <div key={co.id} className="p-3 bg-[#0b0f17] border border-slate-800 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-mono font-bold text-white">{co.id}</div>
                          <div className="text-[10px] text-slate-400">{co.date} • {co.status}</div>
                        </div>
                        <span className="font-mono font-bold text-emerald-400">Rs. {co.total.toLocaleString()}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="px-5 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 12: ADD STAFF (MAIN ADMIN)
          ======================================================== */}
      {isAddStaffOpen && isMaster && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full text-xs shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add Staff Account</h3>
              <button
                onClick={() => setIsAddStaffOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Thapa"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Staff Email</label>
                <input
                  type="email"
                  required
                  placeholder="staff@lokizone.com.np"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Role Permission</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as "main" | "normal" })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                >
                  <option value="normal">Normal Admin (Store Staff - Stock &amp; Orders)</option>
                  <option value="main">Main Admin (Full Unrestricted Access)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition shadow-md shadow-red-600/30"
                >
                  Add Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD PLAYER REVIEW (MAIN ADMIN ONLY)
          ======================================================== */}
      {isAddReviewOpen && isMaster && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-xs shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-red-500" />
                <span>Add Player Endorsement Review</span>
              </h3>
              <button
                onClick={() => setIsAddReviewOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateReview} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Player Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suman Shakya"
                    value={newReviewForm.playerName}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, playerName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Club / Role / City</label>
                  <input
                    type="text"
                    placeholder="e.g. Kathmandu TT Club / National Player"
                    value={newReviewForm.roleOrClub}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, roleOrClub: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Star Rating (1 - 5)</label>
                  <select
                    value={newReviewForm.rating}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5 Stars (Exceptional)</option>
                    <option value={4}>⭐⭐⭐⭐ 4 Stars (Very Good)</option>
                    <option value={3}>⭐⭐⭐ 3 Stars (Good)</option>
                    <option value={2}>⭐⭐ 2 Stars (Fair)</option>
                    <option value={1}>⭐ 1 Star</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Gear / Equipment Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. LOKI Arthur Carbon + Rxton 5"
                    value={newReviewForm.equipment}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, equipment: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={newReviewForm.verified}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, verified: e.target.checked })}
                    className="w-4 h-4 rounded text-red-600 bg-slate-900 border-slate-700"
                  />
                  <span className="font-bold text-slate-200">Show &ldquo;Verified Player&rdquo; Green Badge</span>
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Review Testimonial *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share the player's authentic experience with the rubber's dwell time, speed, or blade control..."
                  value={newReviewForm.comment}
                  onChange={(e) => setNewReviewForm({ ...newReviewForm, comment: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddReviewOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition shadow-md shadow-red-600/30"
                >
                  Publish Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: EDIT PLAYER REVIEW (MAIN ADMIN ONLY)
          ======================================================== */}
      {isEditReviewOpen && isMaster && editingReview && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-xs shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-red-500" />
                <span>Edit Review from &ldquo;{editingReview.playerName}&rdquo;</span>
              </h3>
              <button
                onClick={() => setIsEditReviewOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveReviewEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Player Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editingReview.playerName}
                    onChange={(e) => setEditingReview({ ...editingReview, playerName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Club / Role / City</label>
                  <input
                    type="text"
                    value={editingReview.roleOrClub}
                    onChange={(e) => setEditingReview({ ...editingReview, roleOrClub: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Star Rating (1 - 5)</label>
                  <select
                    value={editingReview.rating}
                    onChange={(e) => setEditingReview({ ...editingReview, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                    <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                    <option value={3}>⭐⭐⭐ 3 Stars</option>
                    <option value={2}>⭐⭐ 2 Stars</option>
                    <option value={1}>⭐ 1 Star</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Gear / Equipment Tag</label>
                  <input
                    type="text"
                    value={editingReview.equipment}
                    onChange={(e) => setEditingReview({ ...editingReview, equipment: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={editingReview.verified}
                    onChange={(e) => setEditingReview({ ...editingReview, verified: e.target.checked })}
                    className="w-4 h-4 rounded text-red-600 bg-slate-900 border-slate-700"
                  />
                  <span className="font-bold text-slate-200">Verified Player Badge</span>
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Review Testimonial *</label>
                <textarea
                  rows={4}
                  required
                  value={editingReview.comment}
                  onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditReviewOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition shadow-md shadow-red-600/30"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD FAQ (MAIN ADMIN ONLY)
          ======================================================== */}
      {isAddFAQOpen && isMaster && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-xs shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-red-500" />
                <span>Add FAQ Question &amp; Answer</span>
              </h3>
              <button
                onClick={() => setIsAddFAQOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateFAQ} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Topic Category</label>
                <select
                  value={newFAQForm.category}
                  onChange={(e) => setNewFAQForm({ ...newFAQForm, category: e.target.value as FAQItemCMS["category"] })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                >
                  <option value="shipping">🚚 Shipping &amp; Delivery</option>
                  <option value="products">🏓 Products &amp; Authenticity</option>
                  <option value="payment">💳 Fonepay &amp; Payments</option>
                  <option value="warranty">🛡️ Warranty &amp; Replacement</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Question Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How fast is delivery inside Kathmandu Valley?"
                  value={newFAQForm.question}
                  onChange={(e) => setNewFAQForm({ ...newFAQForm, question: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Answer Description *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide clear, concise guidance for customers..."
                  value={newFAQForm.answer}
                  onChange={(e) => setNewFAQForm({ ...newFAQForm, answer: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddFAQOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition shadow-md shadow-red-600/30"
                >
                  Create FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: EDIT FAQ (MAIN ADMIN ONLY)
          ======================================================== */}
      {isEditFAQOpen && isMaster && editingFAQ && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-xs shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-red-500" />
                <span>Edit FAQ Question</span>
              </h3>
              <button
                onClick={() => setIsEditFAQOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveFAQEdit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Topic Category</label>
                <select
                  value={editingFAQ.category}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, category: e.target.value as FAQItemCMS["category"] })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                >
                  <option value="shipping">🚚 Shipping &amp; Delivery</option>
                  <option value="products">🏓 Products &amp; Authenticity</option>
                  <option value="payment">💳 Fonepay &amp; Payments</option>
                  <option value="warranty">🛡️ Warranty &amp; Replacement</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Question Title *</label>
                <input
                  type="text"
                  required
                  value={editingFAQ.question}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, question: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Answer Description *</label>
                <textarea
                  rows={4}
                  required
                  value={editingFAQ.answer}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, answer: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditFAQOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition shadow-md shadow-red-600/30"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
