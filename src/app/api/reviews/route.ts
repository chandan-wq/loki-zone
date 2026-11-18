import { NextRequest, NextResponse } from "next/server";
import { currentUser, auth } from "@clerk/nextjs/server";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { createAdminClient } from "@/lib/supabase/server";
import { getVerifiedAdmin } from "@/lib/adminAuthServer";
import { extractClerkEmail } from "@/lib/adminAuth";
import { DEFAULT_REVIEWS } from "../admin/reviews/route";

interface ReviewEligibility {
  isLoggedIn: boolean;
  isAdmin: boolean;
  isVerifiedBuyer: boolean;
  canReview: boolean;
  reviewerName: string | null;
  reviewerEmail: string | null;
}

// Helper to resolve current authenticated user and check purchase verification
async function resolveReviewerEligibility(
  req: NextRequest,
  productId?: string | null
): Promise<ReviewEligibility> {
  // 1. Check if store administrator
  try {
    const adminSession = await getVerifiedAdmin(req);
    if (adminSession.authorized) {
      return {
        isLoggedIn: true,
        isAdmin: true,
        isVerifiedBuyer: false,
        canReview: true,
        reviewerName: adminSession.email?.split("@")[0] || "Store Administrator",
        reviewerEmail: adminSession.email || null,
      };
    }
  } catch {
    // Continue to customer verification
  }

  // 2. Resolve Clerk customer identity
  let resolvedUserId: string | null = null;
  let resolvedEmail: string | null = null;
  let resolvedName: string | null = null;

  try {
    const user = await currentUser();
    if (user) {
      resolvedUserId = user.id;
      resolvedEmail = extractClerkEmail(user)?.toLowerCase().trim() || null;
      resolvedName =
        [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
        user.username ||
        null;
    }
  } catch {
    // Continue
  }

  if (!resolvedUserId) {
    try {
      const { userId } = await auth();
      if (userId) {
        resolvedUserId = userId;
        const clerkKey = process.env.CLERK_SECRET_KEY;
        if (clerkKey) {
          const clerk = createClerkClient({ secretKey: clerkKey });
          const user = await clerk.users.getUser(userId);
          resolvedEmail = extractClerkEmail(user)?.toLowerCase().trim() || null;
          resolvedName =
            [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
            user.username ||
            null;
        }
      }
    } catch {
      // Continue
    }
  }

  if (!resolvedUserId) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      const clerkKey = process.env.CLERK_SECRET_KEY;
      if (token && clerkKey) {
        try {
          const verified = (await verifyToken(token, { secretKey: clerkKey })) as any;
          const sub = verified?.data?.sub || verified?.sub;
          if (sub) {
            resolvedUserId = sub;
            const clerk = createClerkClient({ secretKey: clerkKey });
            const user = await clerk.users.getUser(sub);
            resolvedEmail = extractClerkEmail(user)?.toLowerCase().trim() || null;
            resolvedName =
              [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
              user.username ||
              null;
          }
        } catch {
          // Unverified
        }
      }
    }
  }

  // If not logged in at all
  if (!resolvedUserId && !resolvedEmail) {
    return {
      isLoggedIn: false,
      isAdmin: false,
      isVerifiedBuyer: false,
      canReview: false,
      reviewerName: null,
      reviewerEmail: null,
    };
  }

  // If no product requested to check against
  if (!productId) {
    return {
      isLoggedIn: true,
      isAdmin: false,
      isVerifiedBuyer: false,
      canReview: false,
      reviewerName: resolvedName,
      reviewerEmail: resolvedEmail,
    };
  }

  // 3. Query orders in Supabase to verify purchase of this product
  try {
    const supabase = createAdminClient();
    let query = supabase
      .from("orders")
      .select("id, order_status")
      .neq("order_status", "cancelled");

    if (resolvedUserId && resolvedEmail) {
      query = query.or(`clerk_user_id.eq.${resolvedUserId},email.ilike.${resolvedEmail}`);
    } else if (resolvedUserId) {
      query = query.eq("clerk_user_id", resolvedUserId);
    } else if (resolvedEmail) {
      query = query.ilike("email", resolvedEmail);
    }

    const { data: customerOrders, error: orderErr } = await query;
    if (orderErr || !customerOrders || customerOrders.length === 0) {
      return {
        isLoggedIn: true,
        isAdmin: false,
        isVerifiedBuyer: false,
        canReview: false,
        reviewerName: resolvedName,
        reviewerEmail: resolvedEmail,
      };
    }

    const orderIds = customerOrders.map((o) => o.id);
    const { data: matchedItems, error: itemsErr } = await supabase
      .from("order_items")
      .select("id")
      .in("order_id", orderIds)
      .eq("product_id", productId)
      .limit(1);

    const hasPurchased = Boolean(!itemsErr && matchedItems && matchedItems.length > 0);

    return {
      isLoggedIn: true,
      isAdmin: false,
      isVerifiedBuyer: hasPurchased,
      canReview: hasPurchased,
      reviewerName: resolvedName,
      reviewerEmail: resolvedEmail,
    };
  } catch (err) {
    console.warn("[Reviews Eligibility Error]:", err);
    return {
      isLoggedIn: true,
      isAdmin: false,
      isVerifiedBuyer: false,
      canReview: false,
      reviewerName: resolvedName,
      reviewerEmail: resolvedEmail,
    };
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId")?.trim() || null;

    const supabase = createAdminClient();
    let query = supabase
      .from("reviews")
      .select("*")
      .eq("is_approved", true);

    if (productId) {
      query = query.eq("product_id", productId);
    }

    const { data: reviews, error } = await query;

    // Resolve viewer's review eligibility
    const eligibility = await resolveReviewerEligibility(req, productId);

    if (error || !reviews || reviews.length === 0) {
      // If product-specific reviews are empty, return empty list or fallback reviews
      const fallbackList = productId
        ? []
        : DEFAULT_REVIEWS.map((r) => ({
            id: r.id,
            productId: null,
            playerName: r.player_name,
            roleOrClub: r.role_or_club,
            rating: Number(r.rating) || 5,
            equipment: r.equipment,
            comment: r.comment,
            date: r.date,
            verified: Boolean(r.verified),
          }));

      return NextResponse.json({
        success: true,
        reviews: fallbackList,
        eligibility,
      });
    }

    const mapped = reviews.map((r) => ({
      id: r.id,
      productId: r.product_id,
      playerName: r.player_name,
      roleOrClub: r.role_or_club,
      rating: Number(r.rating) || 5,
      equipment: r.equipment,
      comment: r.comment,
      date: r.date,
      verified: Boolean(r.verified),
    }));

    return NextResponse.json({
      success: true,
      reviews: mapped,
      eligibility,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      reviews: DEFAULT_REVIEWS.map((r) => ({
        id: r.id,
        productId: null,
        playerName: r.player_name,
        roleOrClub: r.role_or_club,
        rating: Number(r.rating) || 5,
        equipment: r.equipment,
        comment: r.comment,
        date: r.date,
        verified: Boolean(r.verified),
      })),
      eligibility: {
        isLoggedIn: false,
        isAdmin: false,
        isVerifiedBuyer: false,
        canReview: false,
        reviewerName: null,
        reviewerEmail: null,
      },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productId,
      playerName,
      roleOrClub,
      rating,
      equipment,
      comment,
    } = body;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { success: false, error: "Product ID is required." },
        { status: 400 }
      );
    }

    if (!comment || typeof comment !== "string" || comment.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: "Review comment must be at least 5 characters long." },
        { status: 400 }
      );
    }

    const numericRating = Math.min(5, Math.max(1, Number(rating) || 5));

    // Verify Eligibility: Must be an Admin OR a Verified Purchaser
    const eligibility = await resolveReviewerEligibility(req, productId);

    if (!eligibility.isLoggedIn) {
      return NextResponse.json(
        {
          success: false,
          error: "You must be signed in to submit a product review. Please login or sign up first.",
        },
        { status: 401 }
      );
    }

    if (!eligibility.canReview) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Review submission is restricted. Only verified customers who have purchased this product (or store administrators) are permitted to submit reviews.",
        },
        { status: 403 }
      );
    }

    const supabase = createAdminClient();
    const reviewId = `REV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    const effectiveName =
      (playerName && typeof playerName === "string" && playerName.trim()) ||
      eligibility.reviewerName ||
      "Verified Player";

    const effectiveRole =
      (roleOrClub && typeof roleOrClub === "string" && roleOrClub.trim()) ||
      (eligibility.isAdmin ? "Official Store Administrator" : "Verified Equipment Purchaser");

    const formattedDate = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const newRecord = {
      id: reviewId,
      product_id: productId,
      player_name: effectiveName,
      role_or_club: effectiveRole,
      rating: numericRating,
      equipment: equipment?.trim() || "ITTF Approved LOKI Equipment",
      comment: comment.trim(),
      date: formattedDate,
      verified: true,
      is_approved: true,
    };

    const { error: insertErr } = await supabase.from("reviews").insert(newRecord);

    if (insertErr) {
      console.error("[Review Insert Error]:", insertErr);
      return NextResponse.json(
        { success: false, error: "Failed to save review: " + insertErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      review: {
        id: newRecord.id,
        productId: newRecord.product_id,
        playerName: newRecord.player_name,
        roleOrClub: newRecord.role_or_club,
        rating: newRecord.rating,
        equipment: newRecord.equipment,
        comment: newRecord.comment,
        date: newRecord.date,
        verified: newRecord.verified,
      },
    });
  } catch (err: any) {
    console.error("[Review Submission Exception]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to process review." },
      { status: 500 }
    );
  }
}
