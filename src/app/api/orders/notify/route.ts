import { NextRequest, NextResponse } from "next/server";
import { sendOrderNotification, OrderEmailPayload } from "@/lib/sendOrderEmail";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request payload" },
        { status: 400 }
      );
    }

    const order = body as OrderEmailPayload;

    if (
      typeof order.id !== "string" ||
      !/^[A-Za-z0-9_-]{3,32}$/.test(order.id)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid order ID" },
        { status: 400 }
      );
    }

    if (
      typeof order.customerName !== "string" ||
      order.customerName.trim().length === 0 ||
      order.customerName.length > 120
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid customer name" },
        { status: 400 }
      );
    }

    if (!Array.isArray(order.items) || order.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    if (typeof order.total !== "number" || order.total < 0) {
      return NextResponse.json(
        { success: false, error: "Invalid order total" },
        { status: 400 }
      );
    }

    const result = await sendOrderNotification(order);

    return NextResponse.json({
      success: result.success,
      orderId: order.id,
      adminEmail: result.adminEmail,
      customerEmail: result.customerEmail,
      error: result.error,
    });
  } catch (error: any) {
    console.error("[Order Notification] Unhandled error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to dispatch email notifications",
      },
      { status: 500 }
    );
  }
}
