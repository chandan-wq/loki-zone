import { NextRequest, NextResponse } from "next/server";
import { getVerifiedAdmin } from "@/lib/adminAuthServer";
import { createAdminClient } from "@/lib/supabase/server";

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
    const { data: record, error } = await supabase
      .from("store_settings")
      .select("value, updated_at")
      .eq("key", "landing_cms")
      .maybeSingle();

    if (error) {
      console.error("[Admin Landing CMS Fetch Error]:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      landingCMS: record?.value || null,
      updatedAt: record?.updated_at || null,
    });
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[Admin Landing CMS GET Exception]:", err);
    return NextResponse.json({ success: false, error: "Internal server error fetching landing CMS." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSession = await getVerifiedAdmin(req);
    if (!adminSession.authorized || adminSession.role !== "main") {
      return NextResponse.json(
        { success: false, error: "Access denied. Only Main Admin can modify landing CMS configuration." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const supabase = createAdminClient();

    // 1. Persist entire Landing CMS bundle into store_settings
    const { error: upsertError } = await supabase
      .from("store_settings")
      .upsert(
        {
          key: "landing_cms",
          value: body,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

    if (upsertError) {
      console.error("[Admin Landing CMS Upsert Error]:", upsertError);
      return NextResponse.json({ success: false, error: upsertError.message }, { status: 500 });
    }

    // 2. Also sync cta_banners table if ctaBanner provided
    if (body.ctaBanner) {
      const c = body.ctaBanner;
      await supabase.from("cta_banners").upsert({
        id: "main-cta",
        eyebrow: c.eyebrow || "OFFICIAL ITTF DISTRIBUTOR",
        title: c.title || "Ready to Level Up Your Game?",
        subtitle: c.subtitle || "Order genuine LOKI blades, rubbers, and apparel.",
        primary_btn_text: c.primaryBtnText || "Shop All Equipment",
        primary_btn_link: c.primaryBtnLink || "/category/all",
        secondary_btn_text: c.secondaryBtnText || "Explore Carbon Blades",
        secondary_btn_link: c.secondaryBtnLink || "/products/loki-dragon-10",
        is_active: c.active !== undefined ? Boolean(c.active) : true,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Landing page CMS configuration persisted to database successfully.",
    });
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[Admin Landing CMS POST Exception]:", err);
    return NextResponse.json({ success: false, error: "Internal server error saving landing CMS." }, { status: 500 });
  }
}
