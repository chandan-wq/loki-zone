import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { DEFAULT_HERO_SLIDES } from "../admin/hero/route";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: slides, error } = await supabase
      .from("hero_slides")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });

    if (error || !slides || slides.length === 0) {
      return NextResponse.json({
        success: true,
        slides: DEFAULT_HERO_SLIDES.map((s) => ({
          id: s.id,
          bgImage: s.bg_image,
          eyebrow: s.eyebrow,
          titleLine1: s.title_line1,
          titleLine2: s.title_line2,
          gradient: s.gradient,
          description: s.description,
          ctaText: s.cta_text,
          ctaLink: s.cta_link,
          featuredBadge: s.featured_badge,
        })),
      });
    }

    const mapped = slides.map((s) => ({
      id: s.id,
      bgImage: s.bg_image,
      eyebrow: s.eyebrow,
      titleLine1: s.title_line1,
      titleLine2: s.title_line2,
      gradient: s.gradient,
      description: s.description,
      ctaText: s.cta_text,
      ctaLink: s.cta_link,
      featuredBadge: s.featured_badge,
    }));

    return NextResponse.json({ success: true, slides: mapped });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      slides: DEFAULT_HERO_SLIDES.map((s) => ({
        id: s.id,
        bgImage: s.bg_image,
        eyebrow: s.eyebrow,
        titleLine1: s.title_line1,
        titleLine2: s.title_line2,
        gradient: s.gradient,
        description: s.description,
        ctaText: s.cta_text,
        ctaLink: s.cta_link,
        featuredBadge: s.featured_badge,
      })),
    });
  }
}
