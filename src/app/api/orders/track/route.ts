import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = (searchParams.get("id") || "").trim();
    const verifier = (searchParams.get("verifier") || "").trim().toLowerCase();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required." },
        { status: 400 }
      );
    }

    // Resolve Clerk logged-in user if available
    let clerkUserId: string | null = null;
    let clerkEmail: string | null = null;
    try {
      const user = await currentUser();
      if (user) {
        clerkUserId = user.id;
        clerkEmail =
          user.primaryEmailAddress?.emailAddress?.toLowerCase().trim() || null;
      }
    } catch {
      // Unauthenticated visitor
    }

    const supabase = createAdminClient();

    // Query order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .ilike("id", orderId)
      .maybeSingle();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: "No matching order found." },
        { status: 404 }
      );
    }

    // Customer Isolation Verification:
    // 1. Phone match (normalized digits)
    const cleanOrderPhone = (order.phone || "").replace(/[^0-9]/g, "");
    const cleanVerifierPhone = verifier.replace(/[^0-9]/g, "");
    const phoneMatch =
      cleanVerifierPhone.length >= 7 &&
      (cleanOrderPhone.includes(cleanVerifierPhone) ||
        cleanVerifierPhone.includes(cleanOrderPhone));

    // 2. Email match
    const orderEmail = (order.email || "").toLowerCase().trim();
    const emailMatch =
      Boolean(verifier) && verifier.includes("@") && orderEmail === verifier;

    // 3. Authenticated Clerk account ownership
    const clerkMatch = Boolean(
      (clerkUserId && order.clerk_user_id === clerkUserId) ||
        (clerkEmail && orderEmail === clerkEmail)
    );

    if (!phoneMatch && !emailMatch && !clerkMatch) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Order verification failed. Please provide the exact phone number or email used during checkout.",
        },
        { status: 403 }
      );
    }

    // Fetch order line items
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);

    if (itemsError) {
      console.error("[Track Order Items Error]:", itemsError);
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        customerName: order.customer_name,
        city: order.city,
        address: order.address,
        phone: order.phone,
        email: order.email,
        subtotal: Number(order.subtotal),
        deliveryFee: Number(order.delivery_fee),
        discountAmount: Number(order.discount_amount),
        total: Number(order.total),
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status,
        orderStatus: order.order_status,
        courierNote: order.courier_note,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        itemsCount: order.items_count,
        items: (items || []).map((item) => ({
          id: item.product_id,
          name: item.name,
          price: Number(item.price),
          quantity: item.quantity,
          image: item.image,
          subtotal: Number(item.subtotal),
        })),
      },
    });
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) {
      throw err;
    }
    console.error("[Order Tracking Error]:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error looking up order." },
      { status: 500 }
    );
  }
}
