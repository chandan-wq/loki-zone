import dynamic from "next/dynamic";
import HeroSection from "@/components/HeroSection";
import HorizontalScrollShowcase from "@/components/HorizontalScrollShowcase";

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
      {/* 1. Hero Section: Clean Sports Baseline with Crossfade Slider */}
      <HeroSection />

      {/* 2. Shop by Category: Interactive 3:4 Horizontal Showcase with Animation Videos */}
      <HorizontalScrollShowcase />

      {/* 3. Interactive Playstyle Advisor: Control / Spin / Speed Equipment Finder */}
      <EquipmentFinderSection />

      {/* 4. Automated Best Sellers & Trending Equipment: Dynamic Purchase Velocity Grid */}
      <AutomatedBestSellers />

      {/* 5. Brand Story & Craftsmanship Diagnostics: ITTF Science & Blade Technology */}
      <BrandStory />

      {/* 6. Verified Player Endorsements: Authentic Nepal Contenders & Club Reviews */}
      <PlayerReviewsSection />

      {/* 7. Frequently Asked Questions: Delivery, COD & Equipment Consultation */}
      <HomeFAQSection />

      {/* 8. Final Call-to-Action Banner: Ready to Dominate the Table */}
      <FinalCTASection />
    </div>
  );
}
