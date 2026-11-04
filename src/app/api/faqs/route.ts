import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { DEFAULT_FAQS } from "../admin/faqs/route";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: faqs, error } = await supabase
      .from("faqs")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error || !faqs || faqs.length === 0) {
      return NextResponse.json({
        success: true,
        faqs: DEFAULT_FAQS.map((f) => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
          category: f.category,
        })),
      });
    }

    const mapped = faqs.map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      category: f.category,
    }));

    return NextResponse.json({ success: true, faqs: mapped });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      faqs: DEFAULT_FAQS.map((f) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        category: f.category,
      })),
    });
  }
}
