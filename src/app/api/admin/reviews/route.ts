import { NextRequest, NextResponse } from "next/server";
import { getVerifiedAdmin } from "@/lib/adminAuthServer";
import { createAdminClient } from "@/lib/supabase/server";

export const DEFAULT_REVIEWS = [
  {
    id: "REV-001",
    player_name: "Rohan Sharma",
    role_or_club: "National League Player • Kathmandu TT Club",
    rating: 5,
    equipment: "LOKI Dragon 10 Carbon Racket",
    comment: "The LOKI Dragon 10 Carbon blade offers phenomenal crispness on third-ball attacks. Outstanding speed with no loss of touch on short pushes. Arrived in Kathmandu within 24 hours!",
    date: "Oct 15, 2026",
    verified: true,
    is_approved: true,
  },
  {
    id: "REV-002",
    player_name: "Aayush Adhikari",
    role_or_club: "Pokhara Table Tennis Academy",
    rating: 5,
    equipment: "LOKI RXTON 3 Rubber Sheet",
    comment: "The arc and spin generation on topspin loop drives with RXTON 3 is massive. Very grippy top sheet and resilient sponge. Best genuine TT equipment shop in Nepal.",
    date: "Oct 10, 2026",
    verified: true,
    is_approved: true,
  },
  {
    id: "REV-003",
    player_name: "Bikash Shrestha",
    role_or_club: "Senior Coach • Lalitpur Club",
    rating: 5,
    equipment: "LOKI Tournament Series",
    comment: "Finally, an authorized supplier in Nepal delivering genuine ITTF-certified gear without exaggerated grey-market prices. Recommended to all our junior and senior squad members.",
    date: "Sep 28, 2026",
    verified: true,
    is_approved: true,
  },
  {
    id: "REV-004",
    player_name: "Suman Thapa",
    role_or_club: "Inter-College Champion • New Baneshwor",
    rating: 5,
    equipment: "LOKI Swift Court Shoes",
    comment: "The gum rubber outsole grip on the Swift shoes completely stops court slipping during lateral recovery steps. Lightweight, cushioned, and very durable.",
    date: "Sep 18, 2026",
    verified: true,
    is_approved: true,
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
    const { data: dbReviews, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Admin Reviews GET Error]:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Auto-seed if empty
    if (!dbReviews || dbReviews.length === 0) {
      const { error: seedError } = await supabase.from("reviews").upsert(DEFAULT_REVIEWS);
      if (!seedError) {
        return NextResponse.json({
          success: true,
          reviews: DEFAULT_REVIEWS.map(mapReviewFromDb),
        });
      }
    }

    return NextResponse.json({
      success: true,
      reviews: (dbReviews || []).map(mapReviewFromDb),
    });
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[Admin Reviews GET Exception]:", err);
    return NextResponse.json({ success: false, error: "Internal server error fetching reviews." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSession = await getVerifiedAdmin(req);
    if (!adminSession.authorized || adminSession.role !== "main") {
      return NextResponse.json(
        { success: false, error: "Access denied. Only Main Admin can manage player reviews." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const id = body.id || `REV-${Date.now().toString().slice(-4)}`;

    const row = {
      id,
      player_name: String(body.playerName || body.player_name || "Player").trim(),
      role_or_club: String(body.roleOrClub || body.role_or_club || "Club Player").trim(),
      rating: Math.min(5, Math.max(1, Number(body.rating) || 5)),
      equipment: String(body.equipment || "LOKI Tournament Gear").trim(),
      comment: String(body.comment || "").trim(),
      date: String(body.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })),
      verified: body.verified !== undefined ? Boolean(body.verified) : true,
      is_approved: body.isApproved !== undefined ? Boolean(body.isApproved) : true,
    };

    const supabase = createAdminClient();
    const { data: saved, error } = await supabase
      .from("reviews")
      .upsert(row, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error("[Admin Reviews Upsert Error]:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      review: mapReviewFromDb(saved || row),
      message: "Review successfully saved to database.",
    });
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[Admin Reviews POST Exception]:", err);
    return NextResponse.json({ success: false, error: "Internal server error saving review." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const adminSession = await getVerifiedAdmin(req);
    if (!adminSession.authorized || adminSession.role !== "main") {
      return NextResponse.json(
        { success: false, error: "Access denied. Only Main Admin can delete reviews." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing review ID." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("reviews").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Review deleted from database." });
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[Admin Reviews DELETE Exception]:", err);
    return NextResponse.json({ success: false, error: "Internal server error deleting review." }, { status: 500 });
  }
}

function mapReviewFromDb(row: any) {
  return {
    id: row.id,
    playerName: row.player_name,
    roleOrClub: row.role_or_club,
    rating: Number(row.rating) || 5,
    equipment: row.equipment,
    comment: row.comment,
    date: row.date,
    verified: Boolean(row.verified),
  };
}
