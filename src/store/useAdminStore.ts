import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product, PRODUCTS } from "@/data/products";

export interface HeroSlideCMS {
  id: number;
  bgImage: string;
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  gradient: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  featuredBadge: string;
}

export interface FloatingPillCMS {
  id: string;
  label: string;
  image: string;
  link: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface AdminOrder {
  id: string;
  userId?: string;
  customerName: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  paymentMethod: "eSewa" | "Khalti" | "Fonepay" | "Cash on Delivery";
  status: "Pending Confirmation" | "Processing" | "Dispatched" | "Delivered" | "Cancelled";
  date: string;
  itemsCount: number;
  items: OrderItem[];
  courierNote?: string;
  isDemo?: boolean;
}

export interface CouponCMS {
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minSpend: number;
  active: boolean;
  usageCount: number;
}

export interface StoreSettingsCMS {
  storeName: string;
  supportPhone: string;
  supportEmail: string;
  announcementText: string;
  deliveryInsideValley: number;
  deliveryOutsideValley: number;
  freeShippingThreshold: number;
  vatRate: number;
}

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  ordersCount: number;
  totalSpent: number;
  joinedDate: string;
}

export interface RateSheetItem {
  sku: string;
  name: string;
  retailNPR: number;
  tier1_9: number;
  tier10_49: number;
  tier50plus: number;
}

export interface ReviewCMS {
  id: string;
  playerName: string;
  roleOrClub: string;
  rating: number;
  equipment: string;
  comment: string;
  date: string;
  verified: boolean;
}

export interface FAQItemCMS {
  id: string;
  question: string;
  answer: string;
  category: "shipping" | "products" | "warranty" | "payment";
}

export interface CTABannerCMS {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryBtnText: string;
  primaryBtnLink: string;
  secondaryBtnText: string;
  secondaryBtnLink: string;
  active: boolean;
}

// -------------------------------------------------------------
// COMPLETE LANDING PAGE CMS INTERFACES
// -------------------------------------------------------------

// 1. Horizontal Scroll Showcase CMS
export interface ShowcaseItemCMS {
  id: string;
  name: string;
  category: string;
  tagline: string;
  price: number;
  originalPrice: number;
  image: string;
  specs: { label: string; value: string; percent?: number; color?: string }[];
  tag: string;
  ittfCertified?: boolean;
  highlightNote?: string;
}

export interface HorizontalShowcaseCMS {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: ShowcaseItemCMS[];
}

// 2. Category Directory CMS
export interface CategoryCardCMS {
  id: string;
  name: string;
  tagline: string;
  href: string;
  image: string;
  badge: string;
}

export interface CategorySectionCMS {
  eyebrow: string;
  title: string;
  subtitle: string;
  categories: CategoryCardCMS[];
}

// 3. Equipment Finder CMS (Control, Spin, Speed, etc.)
export interface FinderOptionCMS {
  id: string; // "control" | "spin" | "speed" or custom
  title: string;
  tagline: string;
  description: string;
  badge: string;
  recommendedProductIds: string[]; // Picked by admin from existing store products
}

export interface EquipmentFinderCMS {
  eyebrow: string;
  title: string;
  subtitle: string;
  options: FinderOptionCMS[];
}

// 4. Best Sellers / Trending CMS
export interface BestSellersCMS {
  eyebrow: string;
  title: string;
  subtitle: string;
  mode: "manual" | "automated"; // "manual" = admin curated product IDs, "automated" = sales velocity
  selectedProductIds: string[]; // Picked by admin from existing store products
}

// 5. Brand Story CMS
export interface BrandStoryPillarCMS {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface BrandStoryCMS {
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  statNumber: string;
  statLabel: string;
  pillars: BrandStoryPillarCMS[];
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: "main" | "normal";
  status: "active" | "inactive";
  lastLogin: string;
}

interface AdminState {
  // Auth State
  isAdminAuthenticated: boolean;
  adminEmail: string;
  adminRole: "main" | "normal";
  setAdminRole: (role: "main" | "normal") => void;
  loginAdmin: (email: string, role?: "main" | "normal") => void;
  logoutAdmin: () => void;

  // Staff Members Management
  staffMembers: StaffMember[];
  addStaffMember: (staff: StaffMember) => void;
  removeStaffMember: (id: string) => void;
  toggleStaffStatus: (id: string) => void;

  // Products CRUD
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, delta: number) => void;
  setProducts: (products: Product[]) => void;
  syncProductsFromDB: () => Promise<void>;

  // Hero Section CMS Data
  heroSlides: HeroSlideCMS[];
  floatingPills: FloatingPillCMS[];
  updateHeroSlide: (id: number, updated: Partial<HeroSlideCMS>) => void;
  addHeroSlide: (slide: HeroSlideCMS) => void;
  deleteHeroSlide: (id: number) => void;
  addFloatingPill: (pill: FloatingPillCMS) => void;
  deleteFloatingPill: (id: string) => void;
  updateFloatingPill: (id: string, updated: Partial<FloatingPillCMS>) => void;

  // Automated Best Seller Sorting Settings
  autoBestSellerEnabled: boolean;
  toggleAutoBestSeller: () => void;

  // Orders Management
  orders: AdminOrder[];
  updateOrderStatus: (orderId: string, status: AdminOrder["status"]) => void;
  updateOrderCourierNote: (orderId: string, note: string) => void;
  createOrder: (order: AdminOrder) => void;
  setOrders: (orders: AdminOrder[]) => void;
  syncOrdersFromDB: () => Promise<void>;

  // Wholesale Rate Sheet Items (Q4)
  rateSheetItems: RateSheetItem[];
  addRateSheetItem: (item: RateSheetItem) => void;
  updateRateSheetItem: (sku: string, updated: Partial<RateSheetItem>) => void;
  deleteRateSheetItem: (sku: string) => void;

  // Coupons / Promo Engine
  coupons: CouponCMS[];
  addCoupon: (coupon: CouponCMS) => void;
  updateCoupon: (code: string, updated: Partial<CouponCMS>) => void;
  deleteCoupon: (code: string) => void;
  toggleCoupon: (code: string) => void;
  incrementCouponUsage: (code: string) => void;

  // Store Configuration Settings
  storeSettings: StoreSettingsCMS;
  updateStoreSettings: (settings: Partial<StoreSettingsCMS>) => void;

  // Customer & Player Reviews CMS
  reviews: ReviewCMS[];
  addReview: (review: ReviewCMS) => void;
  updateReview: (id: string, updated: Partial<ReviewCMS>) => void;
  deleteReview: (id: string) => void;

  // FAQ CMS
  faqs: FAQItemCMS[];
  addFAQ: (faq: FAQItemCMS) => void;
  updateFAQ: (id: string, updated: Partial<FAQItemCMS>) => void;
  deleteFAQ: (id: string) => void;

  // Final CTA Banner CMS
  ctaBanner: CTABannerCMS;
  updateCTABanner: (updated: Partial<CTABannerCMS>) => void;

  // 1. Horizontal Scroll Showcase CMS
  horizontalShowcase: HorizontalShowcaseCMS;
  updateHorizontalShowcase: (updated: Partial<HorizontalShowcaseCMS>) => void;
  updateShowcaseItem: (id: string, updated: Partial<ShowcaseItemCMS>) => void;
  addShowcaseItem: (item: ShowcaseItemCMS) => void;
  deleteShowcaseItem: (id: string) => void;

  // 2. Category Directory CMS
  categorySection: CategorySectionCMS;
  updateCategorySection: (updated: Partial<CategorySectionCMS>) => void;
  updateCategoryCard: (id: string, updated: Partial<CategoryCardCMS>) => void;
  addCategoryCard: (card: CategoryCardCMS) => void;
  deleteCategoryCard: (id: string) => void;

  // 3. Equipment Finder CMS (Control, Spin, Speed)
  equipmentFinder: EquipmentFinderCMS;
  updateEquipmentFinder: (updated: Partial<EquipmentFinderCMS>) => void;
  updateFinderOption: (id: string, updated: Partial<FinderOptionCMS>) => void;
  setFinderRecommendedProducts: (optionId: string, productIds: string[]) => void;
  addFinderOption: (option: FinderOptionCMS) => void;
  deleteFinderOption: (id: string) => void;

  // 4. Best Sellers / Trending CMS
  bestSellersCMS: BestSellersCMS;
  updateBestSellersCMS: (updated: Partial<BestSellersCMS>) => void;
  setSelectedBestSellerProductIds: (productIds: string[]) => void;

  // 5. Brand Story CMS
  brandStory: BrandStoryCMS;
  updateBrandStory: (updated: Partial<BrandStoryCMS>) => void;
  updateBrandStoryPillar: (id: string, updated: Partial<BrandStoryPillarCMS>) => void;
  addBrandStoryPillar: (pillar: BrandStoryPillarCMS) => void;
  deleteBrandStoryPillar: (id: string) => void;

  // Customers Directory
  customers: CustomerRecord[];
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      // Active Admin State (Default to unauthenticated visitor)
      isAdminAuthenticated: false,
      adminEmail: "",
      adminRole: "normal",
      setAdminRole: (role: "main" | "normal") => set({ adminRole: role }),

  loginAdmin: (email: string, role?: "main" | "normal") => {
    const normalized = email.trim().toLowerCase();
    const isMain =
      normalized === "chandanthakurchandan935@gmail.com" ||
      normalized === "joshi.ritiz@gmail.com";
    const resolvedRole = role || (isMain ? "main" : "normal");
    set({
      isAdminAuthenticated: true,
      adminEmail: normalized,
      adminRole: resolvedRole,
    });
  },

  logoutAdmin: () =>
    set({ isAdminAuthenticated: false, adminEmail: "", adminRole: "normal" }),

  // Staff Members Management (Managed by Main Admin)
  staffMembers: [
    {
      id: "STAFF-000",
      name: "Ritiz Joshi",
      email: "joshi.ritiz@gmail.com",
      role: "main",
      status: "active",
      lastLogin: "Active Now",
    },
    {
      id: "STAFF-001",
      name: "Chandan Thakur",
      email: "chandanthakurchandan935@gmail.com",
      role: "main",
      status: "active",
      lastLogin: "Active Now",
    },
    {
      id: "STAFF-002",
      name: "Store Operations Desk",
      email: "staff@lokizone.com.np",
      role: "normal",
      status: "active",
      lastLogin: "Oct 18, 2026",
    },
    {
      id: "STAFF-003",
      name: "Warehouse Dispatch Officer",
      email: "dispatch@lokizone.com.np",
      role: "normal",
      status: "active",
      lastLogin: "Oct 17, 2026",
    },
  ],

  addStaffMember: (newStaff) =>
    set((state) => ({ staffMembers: [newStaff, ...state.staffMembers] })),

  removeStaffMember: (id) =>
    set((state) => ({
      staffMembers: state.staffMembers.filter((s) => s.id !== id),
    })),

  toggleStaffStatus: (id) =>
    set((state) => ({
      staffMembers: state.staffMembers.map((s) =>
        s.id === id
          ? { ...s, status: s.status === "active" ? "inactive" : "active" }
          : s
      ),
    })),

  // Products CRUD initialized from official PRODUCTS
  products: [...PRODUCTS],

  addProduct: (newProduct) =>
    set((state) => ({ products: [newProduct, ...state.products] })),

  updateProduct: (id, updated) =>
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, ...updated } : p)),
    })),

  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),

  adjustStock: (id, delta) =>
    set((state) => ({
      products: state.products.map((p) => {
        if (p.id === id) {
          const newCount = Math.max(0, p.stockCount + delta);
          return { ...p, stockCount: newCount, inStock: newCount > 0 };
        }
        return p;
      }),
    })),

  setProducts: (products) => set({ products }),

  syncProductsFromDB: async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.products) && data.products.length > 0) {
        set({ products: data.products });
      }
    } catch {
      // Keep static fallback
    }
  },

  // Initial Hero Slides managed by Admin
  heroSlides: [
    {
      id: 1,
      bgImage: "/images/hero-bg.jpg",
      eyebrow: "PREMIUM TABLE TENNIS GEAR",
      titleLine1: "PLAY YOUR",
      titleLine2: "BEST GAME",
      gradient: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 30%, #8b5cf6 65%, #ec4899 100%)",
      description:
        "High performance gear for players who never settle. From rackets to apparel, we've got everything you need.",
      ctaText: "Shop Now",
      ctaLink: "/category/all",
      featuredBadge: "Official ITTF 2026 Collection",
    },
    {
      id: 2,
      bgImage: "/images/hero-slide-2.jpg",
      eyebrow: "CHAMPIONSHIP BLADE SERIES",
      titleLine1: "UNLEASH THE",
      titleLine2: "DRAGON SPIN",
      gradient: "linear-gradient(135deg, #ef4444 0%, #f97316 45%, #eab308 100%)",
      description:
        "Engineered with 5-ply alpine wood and carbon micro-mesh for explosive topspin trajectory and unmatched table feel.",
      ctaText: "Explore Dragon 10",
      ctaLink: "/products/loki-dragon-10",
      featuredBadge: "5-Ply Wood & Carbon Grid",
    },
    {
      id: 3,
      bgImage: "/images/hero-slide-3.jpg",
      eyebrow: "MATCH DAY TOURNAMENT ARENA",
      titleLine1: "STAY COOL",
      titleLine2: "DOMINATE RALLIES",
      gradient: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)",
      description:
        "Aeroflex breathable QuickDry jerseys and Swift court grip shoes engineered for rapid lateral footwork.",
      ctaText: "View Match Gear",
      ctaLink: "/category/apparel",
      featuredBadge: "Ultra-Light 4-Way Stretch",
    },
  ],

  floatingPills: [
    {
      id: "racket",
      label: "Racket",
      image: "/images/icon-racket.png",
      link: "/category/rackets",
    },
    {
      id: "tshirt",
      label: "T-Shirt",
      image: "/images/icon-tshirt.png",
      link: "/category/apparel",
    },
    {
      id: "shoes",
      label: "Shoes",
      image: "/images/icon-shoes.png",
      link: "/category/footwear",
    },
    {
      id: "shorts",
      label: "Shorts",
      image: "/images/icon-shorts.png",
      link: "/category/apparel?type=shorts",
    },
  ],

  updateHeroSlide: (id, updated) =>
    set((state) => ({
      heroSlides: state.heroSlides.map((slide) =>
        slide.id === id ? { ...slide, ...updated } : slide
      ),
    })),

  addHeroSlide: (newSlide) =>
    set((state) => ({
      heroSlides: [...state.heroSlides, newSlide],
    })),

  deleteHeroSlide: (id) =>
    set((state) => ({
      heroSlides: state.heroSlides.filter((s) => s.id !== id),
    })),

  addFloatingPill: (newPill) =>
    set((state) => ({
      floatingPills: [...state.floatingPills, newPill],
    })),

  deleteFloatingPill: (id) =>
    set((state) => ({
      floatingPills: state.floatingPills.filter((p) => p.id !== id),
    })),

  updateFloatingPill: (id, updated) =>
    set((state) => ({
      floatingPills: state.floatingPills.map((pill) =>
        pill.id === id ? { ...pill, ...updated } : pill
      ),
    })),

  autoBestSellerEnabled: true,
  toggleAutoBestSeller: () =>
    set((state) => ({ autoBestSellerEnabled: !state.autoBestSellerEnabled })),

  orders: [
    {
      id: "LK-948210",
      customerName: "Rohan Sharma",
      phone: "9841000000",
      email: "rohan.sharma@example.com",
      city: "Kathmandu",
      address: "New Baneshwor, Ward 10",
      subtotal: 2499,
      deliveryFee: 0,
      total: 2499,
      paymentMethod: "eSewa",
      status: "Delivered",
      date: "Oct 18, 2026",
      itemsCount: 1,
      isDemo: true,
      items: [
        {
          id: "loki-dragon-10",
          name: "LOKI Dragon 10 Carbon Racket",
          price: 2499,
          quantity: 1,
          image: "/images/product-1-light.png",
        },
      ],
      courierNote: "Delivered via Pathao Express - AWB #948201",
    },
    {
      id: "LK-842918",
      customerName: "Aayush Adhikari",
      phone: "9818223344",
      email: "aayush.adh@gmail.com",
      city: "Pokhara",
      address: "Lakeside, Street 14",
      subtotal: 5298,
      deliveryFee: 0,
      total: 5298,
      paymentMethod: "Khalti",
      status: "Processing",
      date: "Oct 18, 2026",
      itemsCount: 3,
      isDemo: true,
      items: [
        {
          id: "loki-court-swift-shoes",
          name: "LOKI Swift Court Shoes (Size 42)",
          price: 3499,
          quantity: 1,
          image: "/images/thumb-shoes.png",
        },
        {
          id: "loki-aeroflex-jersey",
          name: "LOKI Aeroflex Pro Jersey (L)",
          price: 1799,
          quantity: 1,
          image: "/images/thumb-tshirt.png",
        },
      ],
      courierNote: "Packed with bubble wrap. Courier pickup scheduled 2:00 PM.",
    },
    {
      id: "LK-720491",
      customerName: "Sunil Shrestha",
      phone: "9803112233",
      email: "sunil.sh@outlook.com",
      city: "Lalitpur",
      address: "Kumaripati",
      subtotal: 1199,
      deliveryFee: 100,
      total: 1299,
      paymentMethod: "Cash on Delivery",
      status: "Dispatched",
      date: "Oct 17, 2026",
      itemsCount: 1,
      isDemo: true,
      items: [
        {
          id: "loki-pro-shorts",
          name: "LOKI Pro Performance Shorts (M)",
          price: 1199,
          quantity: 1,
          image: "/images/thumb-shorts.png",
        },
      ],
      courierNote: "Handed over to Sundar Courier Rider - Contact 9801122334",
    },
  ],

  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      ),
    })),

  updateOrderCourierNote: (orderId, courierNote) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, courierNote } : order
      ),
    })),

  createOrder: (newOrder) => {
    set((state) => {
      const updatedOrders = [newOrder, ...state.orders];

      // Decrement stock & update sales velocity
      const updatedProducts = state.products.map((p) => {
        const matchingItem = newOrder.items.find((item) => item.id === p.id);
        if (matchingItem) {
          const newStock = Math.max(0, p.stockCount - matchingItem.quantity);
          return {
            ...p,
            stockCount: newStock,
            inStock: newStock > 0,
            salesCount: (p.salesCount || 0) + matchingItem.quantity,
            weeklyVelocity: (p.weeklyVelocity || 0) + matchingItem.quantity,
          };
        }
        return p;
      });

      // Update CRM customer record
      const existingIndex = state.customers.findIndex(
        (c) =>
          (newOrder.email && c.email.toLowerCase() === newOrder.email.toLowerCase()) ||
          (newOrder.phone && c.phone === newOrder.phone)
      );

      let updatedCustomers = [...state.customers];
      if (existingIndex > -1) {
        const cust = updatedCustomers[existingIndex];
        updatedCustomers[existingIndex] = {
          ...cust,
          ordersCount: cust.ordersCount + 1,
          totalSpent: cust.totalSpent + newOrder.total,
          city: newOrder.city || cust.city,
        };
      } else if (newOrder.customerName) {
        updatedCustomers.unshift({
          id: `CUST-${String(state.customers.length + 1).padStart(3, "0")}`,
          name: newOrder.customerName,
          email: newOrder.email || "",
          phone: newOrder.phone || "",
          city: newOrder.city || "Kathmandu",
          ordersCount: 1,
          totalSpent: newOrder.total,
          joinedDate: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        });
      }

      return {
        orders: updatedOrders,
        products: updatedProducts,
        customers: updatedCustomers,
      };
    });
  },

  setOrders: (orders) => set({ orders }),

  syncOrdersFromDB: async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        set({ orders: data.orders });
      }
    } catch {
      // Keep existing orders
    }
  },

  // Coupons / Promo Engine
  coupons: [
    {
      code: "LOKI10",
      discountType: "percent",
      discountValue: 10,
      minSpend: 1500,
      active: true,
      usageCount: 48,
    },
    {
      code: "CHAMPION500",
      discountType: "fixed",
      discountValue: 500,
      minSpend: 3000,
      active: true,
      usageCount: 19,
    },
    {
      code: "FREESHIP",
      discountType: "fixed",
      discountValue: 150,
      minSpend: 1000,
      active: false,
      usageCount: 112,
    },
  ],

  // Rate Sheet Matrix Items
  rateSheetItems: [
    {
      sku: "LK-D10-CB",
      name: "LOKI Dragon 10 Carbon Racket",
      retailNPR: 2499,
      tier1_9: 2499,
      tier10_49: 2124,
      tier50plus: 1874,
    },
    {
      sku: "LK-RX-TONG",
      name: "LOKI Rxton 3 Rubber Sheet",
      retailNPR: 1499,
      tier1_9: 1499,
      tier10_49: 1274,
      tier50plus: 1124,
    },
    {
      sku: "LK-SWIFT-SH",
      name: "LOKI Swift Court Shoes",
      retailNPR: 3499,
      tier1_9: 3499,
      tier10_49: 2974,
      tier50plus: 2624,
    },
    {
      sku: "LK-AERO-JS",
      name: "LOKI Aeroflex Pro Jersey",
      retailNPR: 1799,
      tier1_9: 1799,
      tier10_49: 1529,
      tier50plus: 1349,
    },
    {
      sku: "LK-BALL-3S",
      name: "LOKI 3-Star ITTF Balls (6-pack)",
      retailNPR: 599,
      tier1_9: 599,
      tier10_49: 509,
      tier50plus: 449,
    },
  ],

  addRateSheetItem: (item) =>
    set((state) => ({ rateSheetItems: [item, ...state.rateSheetItems] })),

  updateRateSheetItem: (sku, updated) =>
    set((state) => ({
      rateSheetItems: state.rateSheetItems.map((item) =>
        item.sku === sku ? { ...item, ...updated } : item
      ),
    })),

  deleteRateSheetItem: (sku) =>
    set((state) => ({
      rateSheetItems: state.rateSheetItems.filter((item) => item.sku !== sku),
    })),

  // Coupons / Promo Engine
  addCoupon: (newCoupon) =>
    set((state) => ({ coupons: [newCoupon, ...state.coupons] })),

  updateCoupon: (code, updated) =>
    set((state) => ({
      coupons: state.coupons.map((c) =>
        c.code === code ? { ...c, ...updated } : c
      ),
    })),

  deleteCoupon: (code) =>
    set((state) => ({ coupons: state.coupons.filter((c) => c.code !== code) })),

  toggleCoupon: (code) =>
    set((state) => ({
      coupons: state.coupons.map((c) =>
        c.code === code ? { ...c, active: !c.active } : c
      ),
    })),

  incrementCouponUsage: (code) =>
    set((state) => ({
      coupons: state.coupons.map((c) =>
        c.code.toUpperCase() === code.toUpperCase()
          ? { ...c, usageCount: c.usageCount + 1 }
          : c
      ),
    })),

  // Store Configuration Settings
  storeSettings: {
    storeName: "LOKI ZONE NEPAL",
    supportPhone: "+977 9841-000000",
    supportEmail: "support@lokizone.com.np",
    announcementText: "🚚 Free Nationwide Delivery on orders over NPR 2,000 | Official ITTF 2026 Collection Live",
    deliveryInsideValley: 100,
    deliveryOutsideValley: 250,
    freeShippingThreshold: 2000,
    vatRate: 0,
  },

  updateStoreSettings: (newSettings) =>
    set((state) => ({
      storeSettings: { ...state.storeSettings, ...newSettings },
    })),

  // Customer & Player Reviews
  reviews: [
    {
      id: "REV-001",
      playerName: "Rohan Sharma",
      roleOrClub: "National League Player • Kathmandu TT Club",
      rating: 5,
      equipment: "LOKI Dragon 10 Carbon Racket",
      comment:
        "The LOKI Dragon 10 Carbon blade offers phenomenal crispness on third-ball attacks. Outstanding speed with no loss of touch on short pushes. Arrived in Kathmandu within 24 hours!",
      date: "Oct 15, 2026",
      verified: true,
    },
    {
      id: "REV-002",
      playerName: "Aayush Adhikari",
      roleOrClub: "Pokhara Table Tennis Academy",
      rating: 5,
      equipment: "LOKI RXTON 3 Rubber Sheet",
      comment:
        "The arc and spin generation on topspin loop drives with RXTON 3 is massive. Very grippy top sheet and resilient sponge. Best genuine TT equipment shop in Nepal.",
      date: "Oct 10, 2026",
      verified: true,
    },
    {
      id: "REV-003",
      playerName: "Bikash Shrestha",
      roleOrClub: "Senior Coach • Lalitpur Club",
      rating: 5,
      equipment: "LOKI Tournament Series",
      comment:
        "Finally, an authorized supplier in Nepal delivering genuine ITTF-certified gear without exaggerated grey-market prices. Recommended to all our junior and senior squad members.",
      date: "Sep 28, 2026",
      verified: true,
    },
    {
      id: "REV-004",
      playerName: "Suman Thapa",
      roleOrClub: "Inter-College Champion • New Baneshwor",
      rating: 5,
      equipment: "LOKI Swift Court Shoes",
      comment:
        "The gum rubber outsole grip on the Swift shoes completely stops court slipping during lateral recovery steps. Lightweight, cushioned, and very durable.",
      date: "Sep 18, 2026",
      verified: true,
    },
  ],

  addReview: (review) =>
    set((state) => ({ reviews: [review, ...state.reviews] })),

  updateReview: (id, updated) =>
    set((state) => ({
      reviews: state.reviews.map((r) =>
        r.id === id ? { ...r, ...updated } : r
      ),
    })),

  deleteReview: (id) =>
    set((state) => ({ reviews: state.reviews.filter((r) => r.id !== id) })),

  // FAQs Engine
  faqs: [
    {
      id: "FAQ-001",
      question: "How fast is delivery inside Kathmandu Valley and to outside districts?",
      answer:
        "Orders within Kathmandu Valley (Kathmandu, Lalitpur, Bhaktapur) are delivered within 24 hours. Shipments to outside districts (Pokhara, Chitwan, Butwal, Biratnagar, Dharan, Nepalgunj, etc.) arrive within 48 to 72 hours via express courier.",
      category: "shipping",
    },
    {
      id: "FAQ-002",
      question: "Are these products 100% genuine and ITTF tournament approved?",
      answer:
        "Yes, 100%. Ritiz TT Goods is the direct authorized distributor of LOKI table tennis equipment in Nepal. All competition rackets and rubbers bear authentic ITTF stamps valid for official national and international tournaments.",
      category: "products",
    },
    {
      id: "FAQ-003",
      question: "What payment methods do you accept?",
      answer:
        "We accept instant digital payments via eSewa, Khalti, and Fonepay QR (supported by all Nepal mobile banking apps), as well as Cash on Delivery (COD) across Nepal.",
      category: "payment",
    },
    {
      id: "FAQ-004",
      question: "Can I get personalized advice on choosing the right blade and rubber?",
      answer:
        "Yes! You can chat with our LOKI AI Gear Advisor right here on the website, or contact our Kathmandu flagship center via phone or WhatsApp at +977 9841-000000. We will recommend the ideal setup for your offensive, defensive, or all-round playing style.",
      category: "warranty",
    },
    {
      id: "FAQ-005",
      question: "What is your return and exchange policy?",
      answer:
        "We provide a 7-day hassle-free replacement warranty for any manufacturing defect or transit damage. Please contact our support team with your order ID within 7 days of package arrival.",
      category: "warranty",
    },
  ],

  addFAQ: (faq) => set((state) => ({ faqs: [...state.faqs, faq] })),

  updateFAQ: (id, updated) =>
    set((state) => ({
      faqs: state.faqs.map((f) => (f.id === id ? { ...f, ...updated } : f)),
    })),

  deleteFAQ: (id) =>
    set((state) => ({ faqs: state.faqs.filter((f) => f.id !== id) })),

  // Final CTA Banner
  ctaBanner: {
    eyebrow: "READY TO PLAY?",
    title: "Get The Best Table Tennis Gear in Nepal",
    subtitle:
      "Free nationwide delivery on orders over NPR 2,000. 100% genuine ITTF approved products.",
    primaryBtnText: "Shop All Products",
    primaryBtnLink: "/category/all",
    secondaryBtnText: "Contact Us / WhatsApp",
    secondaryBtnLink: "/contact",
    active: true,
  },

  updateCTABanner: (updated) =>
    set((state) => ({
      ctaBanner: { ...state.ctaBanner, ...updated },
    })),

  // 1. Horizontal Scroll Showcase CMS
  horizontalShowcase: {
    eyebrow: "FEATURED PRODUCTS",
    title: "Fast & Powerful Table Tennis Gear",
    subtitle: "Official competition rackets, high-spin rubbers, and gear trusted by players in Nepal.",
    items: [
      {
        id: "loki-dragon-10",
        name: "LOKI Dragon 10 Carbon Pro",
        category: "Pro Tournament Racket",
        tagline: "5-Ply wood with dual carbon mesh for steady loops and explosive speed.",
        price: 2499,
        originalPrice: 3200,
        image: "/images/product-1-light.png",
        specs: [
          { label: "Control", value: "92", percent: 92, color: "bg-emerald-500" },
          { label: "Spin", value: "94", percent: 94, color: "bg-red-500" },
          { label: "Speed", value: "88", percent: 88, color: "bg-blue-500" },
        ],
        tag: "Top Racket",
        ittfCertified: true,
        highlightNote: "5-Ply Carbon • ITTF Approved",
      },
      {
        id: "loki-rxton-3",
        name: "LOKI RXTON 3 Rubber",
        category: "High-Spin Rubber Sheet",
        tagline: "ITTF certified sticky surface delivering high spin and curved loops.",
        price: 1499,
        originalPrice: 1850,
        image: "/images/rubber-macro.png",
        specs: [
          { label: "Tackiness", value: "90", percent: 90, color: "bg-red-500" },
          { label: "Sponge", value: "2.1mm", percent: 85, color: "bg-amber-500" },
          { label: "Speed", value: "85", percent: 85, color: "bg-blue-500" },
        ],
        tag: "Pro Rubber",
        ittfCertified: true,
        highlightNote: "High-Elastic Sponge",
      },
      {
        id: "loki-aeroflex-jersey",
        name: "LOKI Aeroflex Match Jersey",
        category: "Sports Jersey",
        tagline: "Breathable moisture-wicking fabric designed to keep you cool and quick during games.",
        price: 1299,
        originalPrice: 1600,
        image: "/images/thumb-tshirt.png",
        specs: [
          { label: "Breathability", value: "95", percent: 95, color: "bg-blue-500" },
          { label: "Stretch", value: "4-Way", percent: 90, color: "bg-emerald-500" },
          { label: "Weight", value: "140g", percent: 85, color: "bg-purple-500" },
        ],
        tag: "Teamwear",
        ittfCertified: false,
        highlightNote: "QuickDry Microfiber",
      },
      {
        id: "loki-court-swift-shoes",
        name: "LOKI Swift Court Shoes",
        category: "Table Tennis Shoes",
        tagline: "Non-slip gum rubber sole with strong grip for rapid footwork and lateral movement.",
        price: 3499,
        originalPrice: 4200,
        image: "/images/thumb-shoes.png",
        specs: [
          { label: "Grip", value: "96", percent: 96, color: "bg-amber-500" },
          { label: "Cushion", value: "EVA Pro", percent: 88, color: "bg-blue-500" },
          { label: "Stability", value: "Anti-Torsion", percent: 92, color: "bg-emerald-500" },
        ],
        tag: "Court Shoes",
        ittfCertified: false,
        highlightNote: "Non-Slip Rubber Grip",
      },
      {
        id: "loki-3-star-balls",
        name: "ITTF 3-Star Match Balls (6 Pcs)",
        category: "Tournament Balls",
        tagline: "Official 40+ ABS seamless balls with true roundness and reliable bounce.",
        price: 599,
        originalPrice: 750,
        image: "/images/balls-product.png",
        specs: [
          { label: "Roundness", value: "99.2%", percent: 99, color: "bg-emerald-500" },
          { label: "Hardness", value: "Uniform", percent: 92, color: "bg-blue-500" },
          { label: "Bounce", value: "240mm", percent: 94, color: "bg-amber-500" },
        ],
        tag: "3-Star Balls",
        ittfCertified: true,
        highlightNote: "ITTF Approved 40+ ABS",
      },
      {
        id: "loki-hardcase-pro",
        name: "LOKI Carbon Shield Case",
        category: "Racket Case",
        tagline: "Strong hard-shell case to protect your bats and balls from damage.",
        price: 899,
        originalPrice: 1200,
        image: "/images/case-product.png",
        specs: [
          { label: "Protection", value: "Rigid EVA", percent: 95, color: "bg-red-500" },
          { label: "Capacity", value: "2 Rackets", percent: 90, color: "bg-blue-500" },
          { label: "Waterproof", value: "IPX4", percent: 85, color: "bg-emerald-500" },
        ],
        tag: "Hard Case",
        ittfCertified: false,
        highlightNote: "Shock Absorbing Foam",
      },
    ],
  },
  updateHorizontalShowcase: (updated) =>
    set((state) => ({
      horizontalShowcase: { ...state.horizontalShowcase, ...updated },
    })),
  updateShowcaseItem: (id, updated) =>
    set((state) => ({
      horizontalShowcase: {
        ...state.horizontalShowcase,
        items: state.horizontalShowcase.items.map((item) =>
          item.id === id ? { ...item, ...updated } : item
        ),
      },
    })),
  addShowcaseItem: (item) =>
    set((state) => ({
      horizontalShowcase: {
        ...state.horizontalShowcase,
        items: [...state.horizontalShowcase.items, item],
      },
    })),
  deleteShowcaseItem: (id) =>
    set((state) => ({
      horizontalShowcase: {
        ...state.horizontalShowcase,
        items: state.horizontalShowcase.items.filter((item) => item.id !== id),
      },
    })),

  // 2. Category Directory CMS
  categorySection: {
    eyebrow: "CURATED EQUIPMENT DIRECTORY",
    title: "Shop by Category",
    subtitle: "From professional competition bats to championship balls and quick-dry apparel.",
    categories: [
      {
        id: "bats",
        name: "Table Tennis Bats",
        tagline: "5-ply & 7-ply pro blades tuned for offensive speed and loop stability.",
        href: "/category/rackets",
        image: "/images/product-1-light.png",
        badge: "Tournament Bats",
      },
      {
        id: "balls",
        name: "Table Tennis Balls",
        tagline: "ITTF approved 40+ ABS competition balls with seamless true flight roundness.",
        href: "/category/balls",
        image: "/images/balls-product.png",
        badge: "ITTF 3-Star",
      },
      {
        id: "rubbers",
        name: "Rubbers & Blades",
        tagline: "High-tension tacky rubber sheets and high-elasticity offensive blades.",
        href: "/category/rackets",
        image: "/images/rubber-macro.png",
        badge: "High Elasticity",
      },
      {
        id: "jerseys",
        name: "Jerseys & Match Shirts",
        tagline: "QuickDry ergonomic microfiber jerseys engineered for cool, agile rallies.",
        href: "/category/apparel",
        image: "/images/thumb-tshirt.png",
        badge: "Match Apparel",
      },
      {
        id: "shorts",
        name: "Shorts & Sportswear",
        tagline: "Lightweight 4-way stretch shorts with inner drawcord for swift court movement.",
        href: "/category/apparel",
        image: "/images/thumb-shorts.png",
        badge: "Active Wear",
      },
      {
        id: "shoes",
        name: "Table Tennis Shoes",
        tagline: "Non-slip gum rubber soles offering quick pivot traction and heel cushioning.",
        href: "/category/footwear",
        image: "/images/thumb-shoes.png",
        badge: "Court Grip",
      },
      {
        id: "cases",
        name: "Protective Gear & Cases",
        tagline: "Hard-shell EVA racket cases, edge tape protection, and rubber cleaning kits.",
        href: "/category/accessories",
        image: "/images/case-product.png",
        badge: "Gear Shield",
      },
      {
        id: "accessories",
        name: "Match Accessories & Care",
        tagline: "Tournament scoreboards, net clamps, ball catch nets, and grip enhancement wraps.",
        href: "/category/accessories",
        image: "/images/thumb-case.png",
        badge: "Club Accessories",
      },
    ],
  },
  updateCategorySection: (updated) =>
    set((state) => ({
      categorySection: { ...state.categorySection, ...updated },
    })),
  updateCategoryCard: (id, updated) =>
    set((state) => ({
      categorySection: {
        ...state.categorySection,
        categories: state.categorySection.categories.map((c) =>
          c.id === id ? { ...c, ...updated } : c
        ),
      },
    })),
  addCategoryCard: (card) =>
    set((state) => ({
      categorySection: {
        ...state.categorySection,
        categories: [...state.categorySection.categories, card],
      },
    })),
  deleteCategoryCard: (id) =>
    set((state) => ({
      categorySection: {
        ...state.categorySection,
        categories: state.categorySection.categories.filter((c) => c.id !== id),
      },
    })),

  // 3. Equipment Finder CMS (Control, Spin, Speed, etc.)
  equipmentFinder: {
    eyebrow: "CHOOSE YOUR PLAYING STYLE",
    title: "Find The Right Gear For Your Game",
    subtitle: "Whether you like control, spin, or fast attacking speed, we have the right equipment for you.",
    options: [
      {
        id: "control",
        title: "CONTROL",
        tagline: "Placement & Consistency",
        description:
          "Best for tactical players who want steady shots, safe push blocks, and accurate ball placement on the table.",
        badge: "Great Control (92/100)",
        recommendedProductIds: ["loki-dragon-10", "loki-3-star-balls", "loki-hardcase-pro"],
      },
      {
        id: "spin",
        title: "SPIN",
        tagline: "Heavy Topspin & Loops",
        description:
          "Best for attacking players who love strong topspin, curving serves, and high-arc dipping loops.",
        badge: "Heavy Spin (91/100)",
        recommendedProductIds: ["loki-dragon-8", "loki-3-star-balls", "loki-sports-towel"],
      },
      {
        id: "speed",
        title: "SPEED",
        tagline: "Fast Attacks & Quick Smashes",
        description:
          "Best for offensive players who want quick smashes, explosive speed, and fast attacking returns.",
        badge: "High Speed (89/100)",
        recommendedProductIds: ["loki-dragon-8", "loki-court-swift-shoes", "loki-aeroflex-jersey"],
      },
    ],
  },
  updateEquipmentFinder: (updated) =>
    set((state) => ({
      equipmentFinder: { ...state.equipmentFinder, ...updated },
    })),
  updateFinderOption: (id, updated) =>
    set((state) => ({
      equipmentFinder: {
        ...state.equipmentFinder,
        options: state.equipmentFinder.options.map((opt) =>
          opt.id === id ? { ...opt, ...updated } : opt
        ),
      },
    })),
  setFinderRecommendedProducts: (optionId, productIds) =>
    set((state) => ({
      equipmentFinder: {
        ...state.equipmentFinder,
        options: state.equipmentFinder.options.map((opt) =>
          opt.id === optionId ? { ...opt, recommendedProductIds: productIds } : opt
        ),
      },
    })),
  addFinderOption: (option) =>
    set((state) => ({
      equipmentFinder: {
        ...state.equipmentFinder,
        options: [...state.equipmentFinder.options, option],
      },
    })),
  deleteFinderOption: (id) =>
    set((state) => ({
      equipmentFinder: {
        ...state.equipmentFinder,
        options: state.equipmentFinder.options.filter((opt) => opt.id !== id),
      },
    })),

  // 4. Best Sellers / Trending CMS
  bestSellersCMS: {
    eyebrow: "POPULAR PRODUCTS",
    title: "Trending & Best Sellers",
    subtitle: "Top selling table tennis rackets, rubbers, and gear chosen by players in Nepal.",
    mode: "manual",
    selectedProductIds: [
      "loki-3-star-balls",
      "loki-dragon-10",
      "loki-dragon-8",
      "loki-court-swift-shoes",
      "loki-aeroflex-jersey",
      "loki-hardcase-pro",
      "loki-pro-shorts",
      "loki-sports-towel",
    ],
  },
  updateBestSellersCMS: (updated) =>
    set((state) => ({
      bestSellersCMS: { ...state.bestSellersCMS, ...updated },
    })),
  setSelectedBestSellerProductIds: (productIds) =>
    set((state) => ({
      bestSellersCMS: { ...state.bestSellersCMS, selectedProductIds: productIds },
    })),

  // 5. Brand Story CMS
  brandStory: {
    eyebrow: "WHY CHOOSE LOKI",
    title: "Professional Table Tennis Gear Built to Win",
    subtitle: "Designed with champions and coaches for the best performance on the table.",
    description:
      "LOKI makes top quality table tennis equipment trusted by players and clubs across Nepal. Every racket, rubber, and ball is made with premium materials for great speed, strong spin, and easy control.",
    image: "/images/hero-bg.jpg",
    statNumber: "2026",
    statLabel: "Official ITTF Approved Quality",
    pillars: [
      {
        id: "p1",
        title: "Strong 5-Ply Carbon Blade",
        description:
          "High quality wood and carbon layers give you great control and high power on every shot.",
        iconName: "Layers",
      },
      {
        id: "p2",
        title: "Official ITTF Approved Rubber",
        description:
          "Sticky, high-elastic rubber surface helps you produce heavy spin and fast attacking loops.",
        iconName: "Zap",
      },
      {
        id: "p3",
        title: "Comfortable Non-Slip Handle",
        description:
          "Designed for a natural, comfortable grip so your hand does not get tired during long games.",
        iconName: "Crosshair",
      },
      {
        id: "p4",
        title: "Durable Edge Protection",
        description:
          "Strong edge tape and coating protect the racket from accidental bumps on the table.",
        iconName: "ShieldCheck",
      },
    ],
  },
  updateBrandStory: (updated) =>
    set((state) => ({
      brandStory: { ...state.brandStory, ...updated },
    })),
  updateBrandStoryPillar: (id, updated) =>
    set((state) => ({
      brandStory: {
        ...state.brandStory,
        pillars: state.brandStory.pillars.map((p) =>
          p.id === id ? { ...p, ...updated } : p
        ),
      },
    })),
  addBrandStoryPillar: (pillar) =>
    set((state) => ({
      brandStory: {
        ...state.brandStory,
        pillars: [...state.brandStory.pillars, pillar],
      },
    })),
  deleteBrandStoryPillar: (id) =>
    set((state) => ({
      brandStory: {
        ...state.brandStory,
        pillars: state.brandStory.pillars.filter((p) => p.id !== id),
      },
    })),

  // Customer Directory
  customers: [
    {
      id: "CUST-001",
      name: "Rohan Sharma",
      email: "rohan.sharma@example.com",
      phone: "9841000000",
      city: "Kathmandu",
      ordersCount: 3,
      totalSpent: 7497,
      joinedDate: "Aug 12, 2026",
    },
    {
      id: "CUST-002",
      name: "Aayush Adhikari",
      email: "aayush.adh@gmail.com",
      phone: "9818223344",
      city: "Pokhara",
      ordersCount: 2,
      totalSpent: 9498,
      joinedDate: "Sep 01, 2026",
    },
    {
      id: "CUST-003",
      name: "Sunil Shrestha",
      email: "sunil.sh@outlook.com",
      phone: "9803112233",
      city: "Lalitpur",
      ordersCount: 1,
      totalSpent: 1299,
      joinedDate: "Oct 17, 2026",
    },
  ],
}),
{
  name: "loki_admin_store_v5",
  storage: createJSONStorage(() => localStorage),
}
)
);
