import { NextRequest, NextResponse } from "next/server";
import { getVerifiedAdmin } from "@/lib/adminAuthServer";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const adminSession = await getVerifiedAdmin(req);

    if (!adminSession.authorized) {
      return NextResponse.json(
        { success: false, error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const supabase = createAdminClient();

    // Fetch all orders
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("[Admin Orders Fetch Error]:", ordersError);
      return NextResponse.json(
        { success: false, error: ordersError.message },
        { status: 500 }
      );
    }

    // Fetch all items for these orders
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*");

    if (itemsError) {
      console.error("[Admin Items Fetch Error]:", itemsError);
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

    const formattedOrders = (orders || []).map((o) => ({
      id: o.id,
      userId: o.clerk_user_id,
      customerName: o.customer_name,
      phone: o.phone,
      email: o.email || "",
      city: o.city,
      address: o.address,
      subtotal: Number(o.subtotal),
      deliveryFee: Number(o.delivery_fee),
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
      courierNote: o.courier_note || `Delivery to ${o.city}`,
      isDemo: o.is_demo || false,
    }));

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
    });
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) {
      throw err;
    }
    console.error("[Admin Orders Error]:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching orders." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const adminSession = await getVerifiedAdmin(req);
    const adminEmail = adminSession.email;

    if (!adminSession.authorized) {
      return NextResponse.json(
        { success: false, error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { orderId, newStatus, cancellationReason, courierNote } = body as {
      orderId: string;
      newStatus?: string;
      cancellationReason?: string;
      courierNote?: string;
    };

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // If courier note update
    if (courierNote !== undefined) {
      const { error: noteError } = await supabase
        .from("orders")
        .update({ courier_note: courierNote, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (noteError) {
        return NextResponse.json({ success: false, error: noteError.message }, { status: 500 });
      }

      if (!newStatus) {
        return NextResponse.json({ success: true, orderId, courierNote });
      }
    }

    // If changing to Cancelled, invoke safe atomic procedure to restore stock
    if (newStatus === "Cancelled") {
      const { data, error } = await supabase.rpc("cancel_order_and_restore_stock", {
        p_order_id: orderId,
        p_admin_email: adminEmail || "admin@lokizone.com.np",
        p_cancellation_reason: cancellationReason || "Admin status update to Cancelled",
      });

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        orderId,
        status: "Cancelled",
        stockRestored: true,
      });
    }

    if (newStatus) {
      // Normal status transition (Processing, Dispatched, Delivered)
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          order_status: newStatus,
          payment_status: newStatus === "Delivered" ? "collected" : "unpaid_cod",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (updateError) {
        return NextResponse.json(
          { success: false, error: updateError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      status: newStatus,
      courierNote,
    });
  } catch (err) {
    console.error("[Admin Order Status Update Error]:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error updating order status." },
      { status: 500 }
    );
  }
}
