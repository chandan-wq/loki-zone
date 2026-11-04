import { NextRequest, NextResponse } from "next/server";
import { getVerifiedAdmin } from "@/lib/adminAuthServer";
import { createAdminClient } from "@/lib/supabase/server";

export const DEFAULT_RATE_SHEET_ITEMS = [
  {
    sku: "LK-D10-CB",
    name: "LOKI Dragon 10 Carbon Racket",
    retail_npr: 2499,
    tier1_9: 2499,
    tier10_49: 2124,
    tier50plus: 1874,
    in_stock: true,
  },
  {
    sku: "LK-RX-TONG",
    name: "LOKI Rxton 3 Rubber Sheet",
    retail_npr: 1499,
    tier1_9: 1499,
    tier10_49: 1274,
    tier50plus: 1124,
    in_stock: true,
  },
  {
    sku: "LK-SWIFT-SH",
    name: "LOKI Swift Court Shoes",
    retail_npr: 3499,
    tier1_9: 3499,
    tier10_49: 2974,
    tier50plus: 2624,
    in_stock: true,
  },
  {
    sku: "LK-AERO-JS",
    name: "LOKI Aeroflex Pro Jersey",
    retail_npr: 1799,
    tier1_9: 1799,
    tier10_49: 1529,
    tier50plus: 1349,
    in_stock: true,
  },
  {
    sku: "LK-BALL-3S",
    name: "LOKI 3-Star ITTF Balls (6-pack)",
    retail_npr: 599,
    tier1_9: 599,
    tier10_49: 509,
    tier50plus: 449,
    in_stock: true,
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
    const { data: dbItems, error } = await supabase
      .from("rate_sheet_items")
      .select("*")
      .order("sku", { ascending: true });

    if (error) {
      console.error("[Admin Rates GET Error]:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Auto-seed if empty
    if (!dbItems || dbItems.length === 0) {
      const { error: seedError } = await supabase.from("rate_sheet_items").upsert(DEFAULT_RATE_SHEET_ITEMS);
      if (!seedError) {
        return NextResponse.json({
          success: true,
          rateSheetItems: DEFAULT_RATE_SHEET_ITEMS.map(mapRateItemFromDb),
        });
      }
    }

    return NextResponse.json({
      success: true,
      rateSheetItems: (dbItems || []).map(mapRateItemFromDb),
    });
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[Admin Rates GET Exception]:", err);
    return NextResponse.json({ success: false, error: "Internal server error fetching rates." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSession = await getVerifiedAdmin(req);
    if (!adminSession.authorized || adminSession.role !== "main") {
      return NextResponse.json(
        { success: false, error: "Access denied. Only Main Admin can manage rate sheet items." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const sku = String(body.sku || "").trim().toUpperCase();

    if (!sku) {
      return NextResponse.json({ success: false, error: "SKU identifier is required." }, { status: 400 });
    }

    const retailNPR = Math.max(0, Number(body.retailNPR ?? body.retail_npr) || 0);
    const tier1_9 = Math.max(0, Number(body.tier1_9) || retailNPR);
    const tier10_49 = Math.max(0, Number(body.tier10_49) || Math.round(retailNPR * 0.85));
    const tier50plus = Math.max(0, Number(body.tier50plus) || Math.round(retailNPR * 0.75));

    const row = {
      sku,
      name: String(body.name || "Item").trim(),
      retail_npr: retailNPR,
      tier1_9: tier1_9,
      tier10_49: tier10_49,
      tier50plus: tier50plus,
      in_stock: body.inStock !== undefined ? Boolean(body.inStock) : true,
    };

    const supabase = createAdminClient();
    const { data: saved, error } = await supabase
      .from("rate_sheet_items")
      .upsert(row, { onConflict: "sku" })
      .select()
      .single();

    if (error) {
      console.error("[Admin Rates Upsert Error]:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      item: mapRateItemFromDb(saved || row),
      message: "Rate sheet item saved to database.",
    });
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[Admin Rates POST Exception]:", err);
    return NextResponse.json({ success: false, error: "Internal server error saving rate item." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const adminSession = await getVerifiedAdmin(req);
    if (!adminSession.authorized || adminSession.role !== "main") {
      return NextResponse.json(
        { success: false, error: "Access denied. Only Main Admin can delete rate sheet items." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const sku = searchParams.get("sku");

    if (!sku) {
      return NextResponse.json({ success: false, error: "Missing SKU." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("rate_sheet_items").delete().eq("sku", sku);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Rate item deleted from database." });
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[Admin Rates DELETE Exception]:", err);
    return NextResponse.json({ success: false, error: "Internal server error deleting rate item." }, { status: 500 });
  }
}

function mapRateItemFromDb(row: any) {
  return {
    sku: row.sku,
    name: row.name,
    retailNPR: Number(row.retail_npr) || 0,
    tier1_9: Number(row.tier1_9) || 0,
    tier10_49: Number(row.tier10_49) || 0,
    tier50plus: Number(row.tier50plus) || 0,
  };
}
