import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = (body.code || "").toUpperCase().trim();
    const subtotal = Number(body.subtotal) || 0;

    if (!code) {
      return NextResponse.json(
        { valid: false, error: "Please enter a coupon code." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code)
      .maybeSingle();

    if (error || !coupon) {
      return NextResponse.json(
        { valid: false, error: `Invalid coupon code '${code}'.` },
        { status: 404 }
      );
    }

    if (!coupon.active) {
      return NextResponse.json(
        { valid: false, error: `Coupon '${code}' is currently inactive.` },
        { status: 400 }
      );
    }

    const minSpend = Number(coupon.min_spend) || 0;
    if (subtotal < minSpend) {
      return NextResponse.json(
        {
          valid: false,
          error: `Minimum spend of NPR ${minSpend.toLocaleString()} required for coupon '${code}'.`,
        },
        { status: 400 }
      );
    }

    const discountType = coupon.discount_type || "percent";
    const discountValue = Number(coupon.discount_value) || 0;
    let discountAmount = 0;
    if (discountType === "percent") {
      discountAmount = Math.round((subtotal * discountValue) / 100);
    } else {
      discountAmount = Math.min(subtotal, discountValue);
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountType,
      discountValue,
      minSpend,
      discountAmount,
      message: `Coupon '${coupon.code}' applied successfully!`,
    });
  } catch (err) {
    console.error("[Coupon Validate Error]:", err);
    return NextResponse.json(
      { valid: false, error: "Error verifying coupon code." },
      { status: 500 }
    );
  }
}
