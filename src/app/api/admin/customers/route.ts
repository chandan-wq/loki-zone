import { NextRequest, NextResponse } from "next/server";
import { getVerifiedAdmin } from "@/lib/adminAuthServer";
import { createAdminClient } from "@/lib/supabase/server";

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

    // 1. Fetch recorded customers from customers table
    const { data: dbCustomers, error: custError } = await supabase
      .from("customers")
      .select("*")
      .order("total_spent", { ascending: false });

    if (custError) {
      console.error("[Admin Customers Fetch Error]:", custError);
    }

    // 2. Fetch all orders to aggregate / cross-check with live database orders
    const { data: dbOrders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("[Admin Orders Fetch Error in Customers]:", ordersError);
    }

    // 3. Map orders by phone, email, and clerk_user_id
    const customerMap = new Map<string, {
      id: string;
      name: string;
      email: string;
      phone: string;
      city: string;
      ordersCount: number;
      totalSpent: number;
      joinedDate: string;
      clerkUserId?: string | null;
      orders: any[];
    }>();

    // Seed map with dbCustomers first
    for (const c of dbCustomers || []) {
      const key = (c.phone || c.email || c.id).toLowerCase().trim();
      customerMap.set(key, {
        id: c.id,
        name: c.name || "Customer",
        email: c.email || "N/A",
        phone: c.phone || "N/A",
        city: c.city || "Kathmandu",
        ordersCount: Number(c.orders_count) || 0,
        totalSpent: Number(c.total_spent) || 0,
        joinedDate: c.joined_date ? new Date(c.joined_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A",
        clerkUserId: c.clerk_user_id,
        orders: [],
      });
    }

    // Associate orders and add any customer who placed an order but has no explicit row
    for (const o of dbOrders || []) {
      const key = (o.phone || o.email || o.customer_name || `order-${o.id}`).toLowerCase().trim();
      let record = customerMap.get(key);

      if (!record) {
        // Try match by clerkUserId
        if (o.clerk_user_id) {
          for (const val of customerMap.values()) {
            if (val.clerkUserId === o.clerk_user_id) {
              record = val;
              break;
            }
          }
        }
      }

      const orderSummary = {
        id: o.id,
        date: o.created_at ? new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A",
        total: Number(o.total) || 0,
        subtotal: Number(o.subtotal) || 0,
        deliveryFee: Number(o.delivery_fee) || 0,
        status: o.order_status || "Pending Confirmation",
        paymentMethod: o.payment_method || "Cash on Delivery",
        city: o.city || "Kathmandu",
        address: o.address || "",
        itemsCount: Number(o.items_count) || 1,
      };

      if (record) {
        record.orders.push(orderSummary);
        // If orders weren't pre-aggregated accurately, update them
        if (record.orders.length > record.ordersCount) {
          record.ordersCount = record.orders.length;
          record.totalSpent = record.orders.reduce((sum, ord) => sum + ord.total, 0);
        }
      } else {
        const newRecord = {
          id: o.customer_id || `CUST-${o.id.slice(0, 8)}`,
          name: o.customer_name || "Customer",
          email: o.email || "N/A",
          phone: o.phone || "N/A",
          city: o.city || "Kathmandu",
          ordersCount: 1,
          totalSpent: Number(o.total) || 0,
          joinedDate: o.created_at ? new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A",
          clerkUserId: o.clerk_user_id,
          orders: [orderSummary],
        };
        customerMap.set(key, newRecord);
      }
    }

    const customers = Array.from(customerMap.values()).sort(
      (a, b) => b.totalSpent - a.totalSpent
    );

    return NextResponse.json({
      success: true,
      customers,
    });
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) {
      throw err;
    }
    console.error("[Admin Customers GET Error]:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching customers." },
      { status: 500 }
    );
  }
}
