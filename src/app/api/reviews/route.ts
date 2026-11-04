import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { DEFAULT_REVIEWS } from "../admin/reviews/route";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (error || !reviews || reviews.length === 0) {
      return NextResponse.json({
        success: true,
        reviews: DEFAULT_REVIEWS.map((r) => ({
          id: r.id,
          playerName: r.player_name,
          roleOrClub: r.role_or_club,
          rating: Number(r.rating) || 5,
          equipment: r.equipment,
          comment: r.comment,
          date: r.date,
          verified: Boolean(r.verified),
        })),
      });
    }

    const mapped = reviews.map((r) => ({
      id: r.id,
      playerName: r.player_name,
      roleOrClub: r.role_or_club,
      rating: Number(r.rating) || 5,
      equipment: r.equipment,
      comment: r.comment,
      date: r.date,
      verified: Boolean(r.verified),
    }));

    return NextResponse.json({ success: true, reviews: mapped });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      reviews: DEFAULT_REVIEWS.map((r) => ({
        id: r.id,
        playerName: r.player_name,
        roleOrClub: r.role_or_club,
        rating: Number(r.rating) || 5,
        equipment: r.equipment,
        comment: r.comment,
        date: r.date,
        verified: Boolean(r.verified),
      })),
    });
  }
}
