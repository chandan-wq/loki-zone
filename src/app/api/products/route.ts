import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { PRODUCTS, Product } from "@/data/products";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");

    const supabase = createAdminClient();
    let query = supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("sales_count", { ascending: false });

    if (category && category !== "All") {
      query = query.eq("category", category);
    }

    const { data: dbProducts, error } = await query;

    if (error || !dbProducts || dbProducts.length === 0) {
      // Graceful fallback to static products
      let fallback = PRODUCTS.filter((p) => p.inStock !== false);
      if (category && category !== "All") {
        fallback = fallback.filter((p) => p.category === category);
      }
      return NextResponse.json({
        success: true,
        source: "static_fallback",
        products: fallback,
      });
    }

    const mappedProducts: Product[] = dbProducts.map((p) => ({
      id: p.id,
      name: p.name,
      series: p.series || "PERFORMANCE SERIES",
      subtitle: p.subtitle || "",
      brand: p.brand || "LOKI",
      price: Number(p.price),
      originalPrice: Number(p.original_price),
      discountPercent: p.discount_percent ? Number(p.discount_percent) : 0,
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

    if (tag) {
      const filtered = mappedProducts.filter((p) =>
        p.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
      );
      return NextResponse.json({
        success: true,
        source: "database",
        products: filtered,
      });
    }

    return NextResponse.json({
      success: true,
      source: "database",
      products: mappedProducts,
    });
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) {
      throw err;
    }
    console.error("[Products Fetch Error]:", err);
    return NextResponse.json({
      success: true,
      source: "static_fallback",
      products: PRODUCTS,
    });
  }
}
