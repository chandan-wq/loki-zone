import { NextRequest, NextResponse } from "next/server";
import { getVerifiedAdmin } from "@/lib/adminAuthServer";
import { createAdminClient } from "@/lib/supabase/server";

export const DEFAULT_FAQS = [
  {
    id: "FAQ-001",
    sort_order: 1,
    question: "How fast is delivery inside Kathmandu Valley and to outside districts?",
    answer: "Orders within Kathmandu Valley (Kathmandu, Lalitpur, Bhaktapur) are delivered within 24 hours. Shipments to outside districts (Pokhara, Chitwan, Butwal, Biratnagar, Dharan, Nepalgunj, etc.) arrive within 48 to 72 hours via express courier.",
    category: "shipping",
    is_active: true,
  },
  {
    id: "FAQ-002",
    sort_order: 2,
    question: "Are these products 100% genuine and ITTF tournament approved?",
    answer: "Yes, 100%. Ritiz TT Goods is the direct authorized distributor of LOKI table tennis equipment in Nepal. All competition rackets and rubbers bear authentic ITTF stamps valid for official national and international tournaments.",
    category: "products",
    is_active: true,
  },
  {
    id: "FAQ-003",
    sort_order: 3,
    question: "What payment methods do you accept?",
    answer: "We accept instant digital payments via eSewa, Khalti, and Fonepay QR (supported by all Nepal mobile banking apps), as well as Cash on Delivery (COD) across Nepal.",
    category: "payment",
    is_active: true,
  },
  {
    id: "FAQ-004",
    sort_order: 4,
    question: "Can I get personalized advice on choosing the right blade and rubber?",
    answer: "Yes! You can chat with our LOKI AI Gear Advisor right here on the website, or contact our Kathmandu flagship center via phone or WhatsApp at +977 9841-000000. We will recommend the ideal setup for your offensive, defensive, or all-round playing style.",
    category: "warranty",
    is_active: true,
  },
  {
    id: "FAQ-005",
    sort_order: 5,
    question: "What is your return and exchange policy?",
    answer: "We provide a 7-day hassle-free replacement warranty for any manufacturing defect or transit damage. Please contact our support team with your order ID within 7 days of package arrival.",
    category: "warranty",
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
    const { data: dbFaqs, error } = await supabase
      .from("faqs")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[Admin FAQs GET Error]:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Auto-seed if empty
    if (!dbFaqs || dbFaqs.length === 0) {
      const { error: seedError } = await supabase.from("faqs").upsert(DEFAULT_FAQS);
      if (!seedError) {
        return NextResponse.json({
          success: true,
          faqs: DEFAULT_FAQS.map(mapFAQFromDb),
        });
      }
    }

    return NextResponse.json({
      success: true,
      faqs: (dbFaqs || []).map(mapFAQFromDb),
    });
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[Admin FAQs GET Exception]:", err);
    return NextResponse.json({ success: false, error: "Internal server error fetching FAQs." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSession = await getVerifiedAdmin(req);
    if (!adminSession.authorized || adminSession.role !== "main") {
      return NextResponse.json(
        { success: false, error: "Access denied. Only Main Admin can manage FAQs." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const id = body.id || `FAQ-${Date.now().toString().slice(-4)}`;
    const validCategories = ["shipping", "products", "warranty", "payment"];
    const category = validCategories.includes(body.category) ? body.category : "shipping";

    const row = {
      id,
      sort_order: Number(body.sort_order ?? body.sortOrder) || 1,
      question: String(body.question || "").trim(),
      answer: String(body.answer || "").trim(),
      category,
      is_active: body.isActive !== undefined ? Boolean(body.isActive) : true,
    };

    const supabase = createAdminClient();
    const { data: saved, error } = await supabase
      .from("faqs")
      .upsert(row, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error("[Admin FAQs Upsert Error]:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      faq: mapFAQFromDb(saved || row),
      message: "FAQ successfully saved to database.",
    });
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[Admin FAQs POST Exception]:", err);
    return NextResponse.json({ success: false, error: "Internal server error saving FAQ." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const adminSession = await getVerifiedAdmin(req);
    if (!adminSession.authorized || adminSession.role !== "main") {
      return NextResponse.json(
        { success: false, error: "Access denied. Only Main Admin can delete FAQs." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing FAQ ID." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("faqs").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "FAQ deleted from database." });
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[Admin FAQs DELETE Exception]:", err);
    return NextResponse.json({ success: false, error: "Internal server error deleting FAQ." }, { status: 500 });
  }
}

function mapFAQFromDb(row: any) {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category,
  };
}
