import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { DEFAULT_STORE_SETTINGS } from "../admin/settings/route";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: record } = await supabase
      .from("store_settings")
      .select("value")
      .eq("key", "general")
      .maybeSingle();

    const settings = record?.value ? { ...DEFAULT_STORE_SETTINGS, ...record.value } : DEFAULT_STORE_SETTINGS;

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      settings: DEFAULT_STORE_SETTINGS,
    });
  }
}
