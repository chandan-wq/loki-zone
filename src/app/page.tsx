import dynamic from "next/dynamic";
import HeroSection from "@/components/HeroSection";
import HorizontalScrollShowcase from "@/components/HorizontalScrollShowcase";
import CategorySection from "@/components/CategorySection";

// Defer below-the-fold sections so Hero and top showcase load immediately
const EquipmentFinderSection = dynamic(() => import("@/components/EquipmentFinderSection"));
const AutomatedBestSellers = dynamic(() => import("@/components/AutomatedBestSellers"));
const BrandStory = dynamic(() => import("@/components/BrandStory"));
const PlayerReviewsSection = dynamic(() => import("@/components/PlayerReviewsSection"));
const HomeFAQSection = dynamic(() => import("@/components/HomeFAQSection"));
const FinalCTASection = dynamic(() => import("@/components/FinalCTASection"));

export default function HomePage() {
  return (
    <div className="w-full bg-white text-gray-950">
      {/* 1. Hero Section: Protected Baseline with 3-Slide Crossfade & Floating Category Strip */}
      <HeroSection />

      {/* 2. The Championship Arsenal: Horizontal Row Scrolling Showcase with Spec Meters & Direct Add-to-Cart */}
      <HorizontalScrollShowcase />

      {/* 3. Curated Equipment Series by Category: Fast Discovery Directory */}
      <CategorySection />

      {/* 4. Interactive Playstyle Advisor: Control / Spin / Speed Equipment Finder */}
      <EquipmentFinderSection />

      {/* 5. Automated Best Sellers & Trending Equipment: Dynamic Purchase Velocity Grid */}
      <AutomatedBestSellers />

      {/* 6. Brand Story & Craftsmanship Diagnostics: ITTF Science & Blade Technology */}
      <BrandStory />

      {/* 7. Verified Player Endorsements: Authentic Nepal Contenders & Club Reviews */}
      <PlayerReviewsSection />

      {/* 8. Frequently Asked Questions: Delivery, COD & Equipment Consultation */}
      <HomeFAQSection />

      {/* 9. Final Call-to-Action Banner: Ready to Dominate the Table */}
      <FinalCTASection />
    </div>
  );
}
