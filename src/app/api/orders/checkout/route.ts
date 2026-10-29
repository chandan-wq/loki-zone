import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";

interface CheckoutRequestBody {
  idempotencyKey?: string;
  customerName: string;
  phone: string;
  email?: string;
  city: string;
  address: string;
  notes?: string;
  couponCode?: string;
  items: Array<{
    productId: string;
    quantity: number;
    name?: string;
    price?: number;
    image?: string;
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckoutRequestBody;

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const {
      idempotencyKey,
      customerName,
      phone,
      email,
      city,
      address,
      notes,
      couponCode,
      items,
    } = body;

    // Server-side input validations
    if (!customerName || typeof customerName !== "string" || customerName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Valid customer name is required." },
        { status: 400 }
      );
    }

    const cleanPhone = (phone || "").replace(/[^0-9+]/g, "").trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: "Valid phone number (at least 10 digits) is required." },
        { status: 400 }
      );
    }

    if (!city || typeof city !== "string" || city.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Delivery city is required." },
        { status: 400 }
      );
    }

    if (!address || typeof address !== "string" || address.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: "Delivery address is required." },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart cannot be empty." },
        { status: 400 }
      );
    }

    // Sanitize cart items for database function (support both lower and camelCase keys for Postgres recordset)
    const sanitizedCartItems = items.map((item) => ({
      productId: String(item.productId),
      productid: String(item.productId),
      product_id: String(item.productId),
      quantity: Math.max(1, Math.min(10, Number(item.quantity) || 1)),
    }));

    // Server-side verified Clerk authentication
    let verifiedClerkId: string | null = null;
    let verifiedClerkEmail: string | null = null;
    try {
      const user = await currentUser();
      if (user) {
        verifiedClerkId = user.id;
        verifiedClerkEmail =
          user.primaryEmailAddress?.emailAddress?.toLowerCase().trim() || null;
      }
    } catch {
      // Guest checkout allowed
    }

    const resolvedEmail = email?.trim() || verifiedClerkEmail || null;

    // Privileged Supabase Server Client
    const supabase = createAdminClient();

    // Call atomic stored procedure
    const { data, error } = await supabase.rpc("process_cod_checkout", {
      p_idempotency_key: idempotencyKey ? idempotencyKey.trim() : null,
      p_customer_name: customerName.trim(),
      p_phone: cleanPhone,
      p_email: resolvedEmail,
      p_city: city.trim(),
      p_address: notes ? `${address.trim()} (Note: ${notes.trim()})` : address.trim(),
      p_coupon_code: couponCode ? couponCode.trim() : null,
      p_cart_items: sanitizedCartItems,
      p_clerk_user_id: verifiedClerkId,
    });

    if (error) {
      console.error("[Checkout RPC Error]:", error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || "Failed to process checkout transaction.",
        },
        { status: 400 }
      );
    }

    const result = data as {
      success: boolean;
      order_id: string;
      subtotal: number;
      delivery_fee: number;
      discount: number;
      total: number;
      duplicate?: boolean;
    };

    // If order was created (not a duplicate request replay), trigger notification asynchronously
    if (result && result.order_id && !result.duplicate) {
      try {
        const notifyPayload = {
          id: result.order_id,
          customerName: customerName.trim(),
          phone: cleanPhone,
          email: resolvedEmail || "",
          city: city.trim(),
          address: address.trim(),
          subtotal: result.subtotal,
          deliveryFee: result.delivery_fee,
          total: result.total,
          paymentMethod: "Cash on Delivery",
          status: "Pending Confirmation",
          date: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          items: items.map((i) => ({
            id: i.productId,
            name: i.name || i.productId,
            price: i.price || 0,
            quantity: i.quantity,
            image: i.image,
          })),
          courierNote: notes ? `${notes} | City: ${city}` : `Delivery to ${city}`,
        };

        // Fire and await notification route internally
        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        fetch(`${baseUrl}/api/orders/notify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(notifyPayload),
        }).catch((err) => {
          console.warn("[Checkout] Background notification trigger failed:", err);
        });
      } catch (notifyErr) {
        console.warn("[Checkout] Notification dispatch warning:", notifyErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: result.order_id,
      subtotal: result.subtotal,
      deliveryFee: result.delivery_fee,
      discount: result.discount,
      total: result.total,
      duplicate: result.duplicate || false,
    });
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) {
      throw err;
    }
    console.error("[Checkout Server Error]:", err);
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "An unexpected server error occurred during checkout.",
      },
      { status: 500 }
    );
  }
}
