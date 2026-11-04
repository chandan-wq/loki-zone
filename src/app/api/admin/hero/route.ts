import { NextRequest, NextResponse } from "next/server";
import { getVerifiedAdmin } from "@/lib/adminAuthServer";
import { createAdminClient } from "@/lib/supabase/server";

export const DEFAULT_HERO_SLIDES = [
  {
    id: 1,
    sort_order: 1,
    bg_image: "/images/hero-bg.jpg",
    eyebrow: "PREMIUM TABLE TENNIS GEAR",
    title_line1: "PLAY YOUR",
    title_line2: "BEST GAME",
    gradient: "#dc2626",
    description: "High performance gear for players who never settle. From rackets to apparel, we've got everything you need.",
    cta_text: "Shop Now",
    cta_link: "/category/all",
    featured_badge: "Official ITTF 2026 Collection",
    is_active: true,
  },
  {
    id: 2,
    sort_order: 2,
    bg_image: "/images/hero-slide-2.jpg",
    eyebrow: "CHAMPIONSHIP BLADE SERIES",
    title_line1: "UNLEASH THE",
    title_line2: "DRAGON SPIN",
    gradient: "#dc2626",
    description: "Engineered with 5-ply alpine wood and carbon micro-mesh for explosive topspin trajectory and unmatched table feel.",
    cta_text: "Explore Dragon 10",
    cta_link: "/products/loki-dragon-10",
    featured_badge: "5-Ply Wood & Carbon Grid",
    is_active: true,
  },
  {
    id: 3,
    sort_order: 3,
    bg_image: "/images/hero-slide-3.jpg",
    eyebrow: "MATCH DAY TOURNAMENT ARENA",
    title_line1: "STAY COOL",
    title_line2: "DOMINATE RALLIES",
    gradient: "#dc2626",
    description: "Aeroflex breathable QuickDry jerseys and Swift court grip shoes engineered for rapid lateral footwork.",
    cta_text: "View Match Gear",
    cta_link: "/category/apparel",
    featured_badge: "Ultra-Light 4-Way Stretch",
    is_active: true,
  },
];

export async function GET(req: NextRequest) {
  try {
    const adminSession = await getVerifiedAdmin(req);
    if (!adminSession.authorized) {
      return NextResponse.json(
        { success: false, error: "Access denied. Admin authorization required." },
        { status: 403 }
      );
    }

    const supabase = createAdminClient();
    const { data: slides, error } = await supabase
      .from("hero_slides")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      console.error("[Admin Hero GET Error]:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Auto-seed defaults if table is empty
    if (!slides || slides.length === 0) {
      const { error: seedError } = await supabase.from("hero_slides").upsert(DEFAULT_HERO_SLIDES);
      if (!seedError) {
        return NextResponse.json({
          success: true,
          slides: DEFAULT_HERO_SLIDES.map(mapSlideFromDb),
        });
      }
    }

    return NextResponse.json({
      success: true,
      slides: (slides || []).map(mapSlideFromDb),
    });
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[Admin Hero GET Exception]:", err);
    return NextResponse.json({ success: false, error: "Internal server error fetching slides." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSession = await getVerifiedAdmin(req);
    if (!adminSession.authorized || adminSession.role !== "main") {
      return NextResponse.json(
        { success: false, error: "Access denied. Only Main Admin can edit hero slides." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const slideId = Number(body.id) || Date.now() % 100000;

    const row = {
      id: slideId,
      sort_order: Number(body.sort_order ?? body.sortOrder) || 1,
      bg_image: String(body.bgImage || body.bg_image || "/images/hero-bg.jpg").trim(),
      eyebrow: String(body.eyebrow || "PREMIUM GEAR").trim(),
      title_line1: String(body.titleLine1 || body.title_line1 || "PLAY YOUR").trim(),
      title_line2: String(body.titleLine2 || body.title_line2 || "BEST GAME").trim(),
      gradient: String(body.gradient || "#dc2626").trim(),
      description: String(body.description || "").trim(),
      cta_text: String(body.ctaText || body.cta_text || "Shop Now").trim(),
      cta_link: String(body.ctaLink || body.cta_link || "/category/all").trim(),
      featured_badge: String(body.featuredBadge || body.featured_badge || "").trim(),
      is_active: body.isActive !== undefined ? Boolean(body.isActive) : true,
    };

    const supabase = createAdminClient();
    const { data: saved, error } = await supabase
      .from("hero_slides")
      .upsert(row, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error("[Admin Hero Upsert Error]:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      slide: mapSlideFromDb(saved || row),
      message: "Hero slide successfully saved to database.",
    });
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[Admin Hero POST Exception]:", err);
    return NextResponse.json({ success: false, error: "Internal server error saving hero slide." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const adminSession = await getVerifiedAdmin(req);
    if (!adminSession.authorized || adminSession.role !== "main") {
      return NextResponse.json(
        { success: false, error: "Access denied. Only Main Admin can delete hero slides." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing slide ID." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("hero_slides").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Hero slide deleted from database." });
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[Admin Hero DELETE Exception]:", err);
    return NextResponse.json({ success: false, error: "Internal server error deleting hero slide." }, { status: 500 });
  }
}

function mapSlideFromDb(row: any) {
  return {
    id: row.id,
    bgImage: row.bg_image,
    eyebrow: row.eyebrow,
    titleLine1: row.title_line1,
    titleLine2: row.title_line2,
    gradient: row.gradient,
    description: row.description,
    ctaText: row.cta_text,
    ctaLink: row.cta_link,
    featuredBadge: row.featured_badge,
    isActive: row.is_active,
  };
}
