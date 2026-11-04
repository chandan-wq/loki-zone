import { NextRequest, NextResponse } from "next/server";
import { getVerifiedAdmin } from "@/lib/adminAuthServer";
import { createAdminClient } from "@/lib/supabase/server";

export const DEFAULT_STORE_SETTINGS = {
  storeName: "LOKI ZONE NEPAL",
  supportPhone: "+977 9841-000000",
  supportEmail: "support@lokizone.com.np",
  announcementText: "🚀 Free Nationwide Delivery on orders over NPR 2,000 | Official ITTF 2026 Collection Live",
  deliveryInsideValley: 100,
  deliveryOutsideValley: 250,
  freeShippingThreshold: 2000,
  vatRate: 0,
};

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
      .eq("key", "general")
      .maybeSingle();

    if (error) {
      console.error("[Admin Settings Fetch Error]:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const settings = record?.value ? { ...DEFAULT_STORE_SETTINGS, ...record.value } : DEFAULT_STORE_SETTINGS;

    return NextResponse.json({
      success: true,
      settings,
      updatedAt: record?.updated_at || null,
    });
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) {
      throw err;
    }
    console.error("[Admin Settings GET Exception]:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching settings." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSession = await getVerifiedAdmin(req);
    if (!adminSession.authorized || adminSession.role !== "main") {
      return NextResponse.json(
        { success: false, error: "Access denied. Only Main Admin can modify store settings." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      storeName,
      supportPhone,
      supportEmail,
      announcementText,
      deliveryInsideValley,
      deliveryOutsideValley,
      freeShippingThreshold,
      vatRate,
    } = body;

    const validatedSettings = {
      storeName: String(storeName || DEFAULT_STORE_SETTINGS.storeName).trim(),
      supportPhone: String(supportPhone || DEFAULT_STORE_SETTINGS.supportPhone).trim(),
      supportEmail: String(supportEmail || DEFAULT_STORE_SETTINGS.supportEmail).trim(),
      announcementText: String(announcementText || DEFAULT_STORE_SETTINGS.announcementText).trim(),
      deliveryInsideValley: Math.max(0, Number(deliveryInsideValley) || 0),
      deliveryOutsideValley: Math.max(0, Number(deliveryOutsideValley) || 0),
      freeShippingThreshold: Math.max(0, Number(freeShippingThreshold) || 0),
      vatRate: Math.max(0, Number(vatRate) || 0),
    };

    const supabase = createAdminClient();
    const { error: upsertError } = await supabase
      .from("store_settings")
      .upsert(
        {
          key: "general",
          value: validatedSettings,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

    if (upsertError) {
      console.error("[Admin Settings Upsert Error]:", upsertError);
      return NextResponse.json(
        { success: false, error: upsertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: validatedSettings,
      message: "Store configuration updated and persisted to database.",
    });
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) {
      throw err;
    }
    console.error("[Admin Settings POST Exception]:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error updating settings." },
      { status: 500 }
    );
  }
}
