import { NextRequest, NextResponse } from "next/server";
import { currentUser, auth } from "@clerk/nextjs/server";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { extractClerkEmail } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    let resolvedUserId: string | null = null;
    let resolvedEmail: string | null = null;

    // 1. Try currentUser()
    try {
      const user = await currentUser();
      if (user) {
        resolvedUserId = user.id;
        resolvedEmail = extractClerkEmail(user)?.toLowerCase().trim() || null;
      }
    } catch {
      // Continue to next auth method
    }

    // 2. Try auth()
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
          }
        }
      } catch {
        // Continue
      }
    }

    // 3. Try Authorization: Bearer <token>
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
            }
          } catch {
            // Unverified
          }
        }
      }
    }

    if (!resolvedUserId && !resolvedEmail) {
      return NextResponse.json(
        { success: false, error: "Please sign in to view your orders." },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    let query = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (resolvedUserId && resolvedEmail) {
      query = query.or(`clerk_user_id.eq.${resolvedUserId},email.ilike.${resolvedEmail}`);
    } else if (resolvedUserId) {
      query = query.eq("clerk_user_id", resolvedUserId);
    } else if (resolvedEmail) {
      query = query.ilike("email", resolvedEmail);
    }

    const { data: orders, error: ordersError } = await query;

    if (ordersError) {
      console.error("[My Orders Fetch Error]:", ordersError);
      return NextResponse.json(
        { success: false, error: ordersError.message },
        { status: 500 }
      );
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        success: true,
        orders: [],
      });
    }

    // Fetch line items for these customer orders
    const orderIds = orders.map((o) => o.id);
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .in("order_id", orderIds);

    if (itemsError) {
      console.warn("[My Orders Items Warning]:", itemsError);
    }

    const itemsByOrder = new Map<string, Array<{ id: string; name: string; price: number; quantity: number; image?: string }>>();
    for (const item of items || []) {
      const list = itemsByOrder.get(item.order_id) || [];
      list.push({
        id: item.product_id,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        image: item.image,
      });
      itemsByOrder.set(item.order_id, list);
    }

    const formattedOrders = orders.map((o) => ({
      id: o.id,
      userId: o.clerk_user_id,
      customerName: o.customer_name,
      phone: o.phone,
      email: o.email || "",
      city: o.city,
      address: o.address,
      subtotal: Number(o.subtotal),
      deliveryFee: Number(o.delivery_fee),
      discountAmount: Number(o.discount_amount || 0),
      total: Number(o.total),
      paymentMethod: o.payment_method,
      status: o.order_status,
      date: new Date(o.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      itemsCount: o.items_count,
      items: itemsByOrder.get(o.id) || [],
      courierNote: o.courier_note || null,
      isDemo: o.is_demo || false,
    }));

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
    });
  } catch (err: any) {
    console.error("[My Orders Unexpected Error]:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching orders." },
      { status: 500 }
    );
  }
}
