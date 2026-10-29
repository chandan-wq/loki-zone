export interface Product {
  id: string;
  name: string;
  series: string;
  subtitle: string;
  brand: string;
  price: number;
  originalPrice: number;
  discountPercent?: number;
  rating: number;
  reviewsCount: number;
  category: "Rackets" | "Apparel" | "Footwear" | "Accessories" | "Balls";
  image: string;
  additionalImages?: string[];
  description: string;
  inStock: boolean;
  stockCount: number;
  tags: string[];
  salesCount: number; // Total units purchased
  weeklyVelocity: number; // Recent 7-day purchase velocity
  specs?: {
    bladeType?: string;
    rubber?: string;
    handleStyle?: string[];
    weight?: string;
    playingStyle?: string;
    control?: number; // 0-100
    spin?: number;
    speed?: number;
    durability?: number;
  };
}

export const PRODUCTS: Product[] = [
  {
    id: "loki-dragon-10",
    name: "LOKI Dragon 10",
    series: "PERFORMANCE SERIES",
    subtitle: "Control. Spin. Your Game.",
    brand: "LOKI",
    price: 2499,
    originalPrice: 3200,
    discountPercent: 22,
    rating: 5.0,
    reviewsCount: 124,
    category: "Rackets",
    image: "/images/product-1-light.png",
    description:
      "The LOKI Dragon 10 is crafted for players who want precision, spin and stability in every shot. With high-quality rubber and a responsive 5-ply wood blade, it delivers the ultimate balance of control and power.",
    inStock: true,
    stockCount: 18,
    tags: ["Best Seller", "Pro Choice", "ITTF Approved"],
    salesCount: 842,
    weeklyVelocity: 94,
    specs: {
      bladeType: "5-Ply Wood",
      rubber: "High-Grip Pimples-In",
      handleStyle: ["FL (Flared)", "ST (Straight)", "AN (Anatomic)"],
      weight: "~ 85g (approx.)",
      playingStyle: "All-Round / Offensive",
      control: 92,
      spin: 88,
      speed: 85,
      durability: 94,
    },
  },
  {
    id: "loki-aeroflex-jersey",
    name: "LOKI Aeroflex Pro Jersey",
    series: "CHAMPIONSHIP APPAREL",
    subtitle: "Breathable. Dynamic. Ultra-light.",
    brand: "LOKI",
    price: 1799,
    originalPrice: 2200,
    discountPercent: 18,
    rating: 4.9,
    reviewsCount: 86,
    category: "Apparel",
    image: "/images/thumb-tshirt.png",
    description:
      "Engineered with moisture-wicking QuickDry microfiber fabric, this ergonomic jersey keeps you cool under intense rallies. Official team cut with reinforced flatlock stitching.",
    inStock: true,
    stockCount: 25,
    tags: ["New Arrival", "Moisture Wicking"],
    salesCount: 420,
    weeklyVelocity: 58,
    specs: {
      playingStyle: "High Activity",
    },
  },
  {
    id: "loki-court-swift-shoes",
    name: "LOKI Swift Court Shoes",
    series: "FOOTWEAR ELITE",
    subtitle: "Anti-slip gum rubber sole for explosive footwork.",
    brand: "LOKI",
    price: 3499,
    originalPrice: 4200,
    discountPercent: 17,
    rating: 4.8,
    reviewsCount: 64,
    category: "Footwear",
    image: "/images/thumb-shoes.png",
    description:
      "Designed specifically for quick lateral table tennis movements. Features non-marking honeycomb gum sole, reinforced heel cup, and breathable mesh upper.",
    inStock: true,
    stockCount: 12,
    tags: ["High Grip", "Impact Cushion"],
    salesCount: 295,
    weeklyVelocity: 41,
  },
  {
    id: "loki-pro-shorts",
    name: "LOKI Pro Performance Shorts",
    series: "MATCH WEAR",
    subtitle: "Flexible movement with dual side pockets.",
    brand: "LOKI",
    price: 1199,
    originalPrice: 1500,
    discountPercent: 20,
    rating: 4.9,
    reviewsCount: 52,
    category: "Apparel",
    image: "/images/thumb-shorts.png",
    description:
      "Elastic waistband with inner drawcord. Lightweight 4-way stretch fabric for maximum agility during fast footwork drills.",
    inStock: true,
    stockCount: 30,
    tags: ["Stretch Fit", "Official Match Gear"],
    salesCount: 310,
    weeklyVelocity: 36,
  },
  {
    id: "loki-3-star-balls",
    name: "LOKI 3-Star ITTF Competition Balls",
    series: "OFFICIAL MATCH BALLS",
    subtitle: "Consistent bounce, true roundness, 40+ ABS.",
    brand: "LOKI",
    price: 299,
    originalPrice: 380,
    discountPercent: 21,
    rating: 5.0,
    reviewsCount: 210,
    category: "Balls",
    image: "/images/balls-product.png",
    description:
      "ITTF approved seamless white 40+ ABS plastic competition balls. Pack of 6. Perfectly balanced weight and spin response for club and tournament play.",
    inStock: true,
    stockCount: 150,
    tags: ["ITTF Approved", "Pack of 6", "Best Value"],
    salesCount: 1250,
    weeklyVelocity: 165,
  },
  {
    id: "loki-hardcase-pro",
    name: "LOKI Hard-Shell Racket Case",
    series: "PROTECTION GEAR",
    subtitle: "Reinforced EVA armor with ball storage pocket.",
    brand: "LOKI",
    price: 499,
    originalPrice: 650,
    discountPercent: 23,
    rating: 4.9,
    reviewsCount: 77,
    category: "Accessories",
    image: "/images/case-product.png",
    description:
      "Shockproof water-resistant carbon matte finish case holds 1-2 rackets safely and includes elastic net pocket for extra balls and rubber cleaner.",
    inStock: true,
    stockCount: 40,
    tags: ["Water Resistant", "EVA Shell"],
    salesCount: 380,
    weeklyVelocity: 47,
  },
  {
    id: "loki-sports-towel",
    name: "LOKI High-Absorbency Towel",
    series: "MATCH ESSENTIALS",
    subtitle: "100% combed cotton, quick moisture absorption.",
    brand: "LOKI",
    price: 299,
    originalPrice: 399,
    discountPercent: 25,
    rating: 4.7,
    reviewsCount: 39,
    category: "Accessories",
    image: "/images/thumb-case.png",
    description:
      "Plush black sports towel with embroidered LOKI branding. Soft on skin and highly absorbent during intense table tennis tournaments.",
    inStock: true,
    stockCount: 85,
    tags: ["100% Cotton", "Super Soft"],
    salesCount: 180,
    weeklyVelocity: 22,
  },
  {
    id: "loki-dragon-8",
    name: "LOKI Dragon 8 Pro",
    series: "PERFORMANCE SERIES",
    subtitle: "High precision speed racket for intermediate attacking players.",
    brand: "LOKI",
    price: 2199,
    originalPrice: 2800,
    discountPercent: 21,
    rating: 4.8,
    reviewsCount: 94,
    category: "Rackets",
    image: "/images/pdp-main-racket.png",
    description:
      "Engineered with 7-layer hybrid construction for crisp offensive loop drives. Outstanding elasticity and feedback on every ball impact.",
    inStock: true,
    stockCount: 14,
    tags: ["Offensive", "7-Ply"],
    salesCount: 512,
    weeklyVelocity: 68,
    specs: {
      bladeType: "7-Ply Hybrid Wood",
      rubber: "High-Tension Sticky Rubber",
      handleStyle: ["FL (Flared)", "ST (Straight)"],
      weight: "~ 88g",
      playingStyle: "Offensive Loop",
      control: 85,
      spin: 91,
      speed: 89,
      durability: 92,
    },
  },
  {
    id: "loki-rxton-3",
    name: "LOKI RXTON 3 Rubber",
    series: "HIGH‑TENSION RUBBERS",
    subtitle: "ITTF certified tacky pimples‑in formulation delivering immense topspin arc.",
    brand: "LOKI",
    price: 1499,
    originalPrice: 1850,
    rating: 0,
    reviewsCount: 0,
    category: "Accessories",
    image: "/images/rubber-macro.png",
    description: "Rubber sheet for high‑tension play.",
    inStock: true,
    stockCount: 0,
    tags: ["High‑Tension", "Rubber"],
    salesCount: 0,
    weeklyVelocity: 0,
    specs: {
      speed: 85,
    },
  },
];