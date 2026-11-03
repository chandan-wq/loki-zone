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
    const { data: coupons, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const mapped = (coupons || []).map((c) => ({
      code: c.code,
      discountType: c.discount_type || "percent",
      discountValue: Number(c.discount_value) || 0,
      minSpend: Number(c.min_spend) || 0,
      active: Boolean(c.active),
      usageCount: Number(c.usage_count) || 0,
      createdAt: c.created_at,
    }));

    return NextResponse.json({ success: true, coupons: mapped });
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) {
      throw err;
    }
    return NextResponse.json({ success: false, error: "Internal server error fetching coupons." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSession = await getVerifiedAdmin(req);
    if (!adminSession.authorized || adminSession.role !== "main") {
      return NextResponse.json(
        { success: false, error: "Access denied. Only Main Admin can manage coupons." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { code, discountType, discountValue, minSpend, active } = body;

    const cleanCode = (code || "").toUpperCase().trim();
    if (!cleanCode || cleanCode.length < 3) {
      return NextResponse.json(
        { success: false, error: "Coupon code must be at least 3 characters." },
        { status: 400 }
      );
    }

    const val = Number(discountValue) || 0;
    if (val <= 0) {
      return NextResponse.json(
        { success: false, error: "Discount value must be greater than zero." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("coupons")
      .upsert({
        code: cleanCode,
        discount_type: discountType === "fixed" ? "fixed" : "percent",
        discount_value: val,
        min_spend: Number(minSpend) || 0,
        active: active !== undefined ? Boolean(active) : true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: data.code,
        discountType: data.discount_type,
        discountValue: Number(data.discount_value),
        minSpend: Number(data.min_spend),
        active: Boolean(data.active),
        usageCount: Number(data.usage_count || 0),
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Internal server error saving coupon." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const adminSession = await getVerifiedAdmin(req);
    if (!adminSession.authorized || adminSession.role !== "main") {
      return NextResponse.json(
        { success: false, error: "Access denied. Only Main Admin can modify coupons." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { code, active } = body;

    if (!code) {
      return NextResponse.json({ success: false, error: "Coupon code required." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("coupons")
      .update({ active: Boolean(active) })
      .eq("code", code.toUpperCase().trim());

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, code, active });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Internal server error updating coupon." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const adminSession = await getVerifiedAdmin(req);
    if (!adminSession.authorized || adminSession.role !== "main") {
      return NextResponse.json(
        { success: false, error: "Access denied. Only Main Admin can delete coupons." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ success: false, error: "Coupon code is required." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("coupons")
      .delete()
      .eq("code", code.toUpperCase().trim());

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Coupon ${code} deleted.` });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Internal server error deleting coupon." }, { status: 500 });
  }
}
