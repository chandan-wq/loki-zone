import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { resolveAdminRole, extractClerkEmail } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const user = await currentUser();
    const role = resolveAdminRole(
      extractClerkEmail(user),
      user?.publicMetadata?.role
    );

    if (!role) {
      return NextResponse.json(
        { success: false, error: "Access denied. Admin role required." },
        { status: 403 }
      );
    }

    const supabase = createAdminClient();
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      products: products || [],
    });
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) {
      throw err;
    }
    console.error("[Admin Products GET Error]:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching admin products." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    const adminEmail = extractClerkEmail(user);
    const role = resolveAdminRole(adminEmail, user?.publicMetadata?.role);

    if (!role) {
      return NextResponse.json(
        { success: false, error: "Access denied. Admin role required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      id,
      name,
      series,
      subtitle,
      brand,
      price,
      originalPrice,
      discountPercent,
      category,
      image,
      additionalImages,
      description,
      stockCount,
      tags,
      specs,
      isActive,
    } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Product name is required." },
        { status: 400 }
      );
    }

    if (typeof price !== "number" || price < 0) {
      return NextResponse.json(
        { success: false, error: "Valid price is required." },
        { status: 400 }
      );
    }

    const validCategories = ["Rackets", "Apparel", "Footwear", "Accessories", "Balls"];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: `Invalid category. Must be one of: ${validCategories.join(", ")}` },
        { status: 400 }
      );
    }

    const productId =
      id && typeof id === "string" && id.trim().length > 0
        ? id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-")
        : `loki-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString().slice(-4)}`;

    const numStock = Math.max(0, Number(stockCount) || 0);
    const inStock = numStock > 0;

    const supabase = createAdminClient();

    const payload = {
      id: productId,
      name: name.trim(),
      series: series || "PERFORMANCE SERIES",
      subtitle: subtitle || "Official LOKI ITTF Approved",
      brand: brand || "LOKI",
      price,
      original_price: Number(originalPrice) || price,
      discount_percent: Number(discountPercent) || 0,
      category,
      image: image || "/images/product-1-light.png",
      additional_images: Array.isArray(additionalImages) ? additionalImages : [],
      description: description || "High-performance table tennis equipment engineered by LOKI.",
      stock_count: numStock,
      in_stock: inStock,
      tags: Array.isArray(tags) ? tags : [],
      specs: specs && typeof specs === "object" ? specs : {},
      is_active: isActive !== undefined ? Boolean(isActive) : true,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("products")
      .upsert(payload)
      .select()
      .single();

    if (error) {
      console.error("[Admin Product Upsert Error]:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      product: data,
    });
  } catch (err) {
    console.error("[Admin Products POST Error]:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error saving product." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await currentUser();
    const adminEmail = extractClerkEmail(user);
    const role = resolveAdminRole(adminEmail, user?.publicMetadata?.role);

    // Only "main" admin or authorized staff can archive
    if (!role) {
      return NextResponse.json(
        { success: false, error: "Access denied. Admin role required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Soft delete / archive to protect foreign-key order history
    const { error } = await supabase
      .from("products")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", productId);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Product ${productId} safely unpublished.`,
    });
  } catch (err) {
    console.error("[Admin Products DELETE Error]:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error archiving product." },
      { status: 500 }
    );
  }
}
