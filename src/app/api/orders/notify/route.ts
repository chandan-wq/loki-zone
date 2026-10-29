import { NextRequest, NextResponse } from "next/server";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface OrderPayload {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  status: string;
  date: string;
  items: OrderItem[];
  courierNote?: string;
}

function escapeHtml(str: unknown): string {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isValidEmail(email: unknown): boolean {
  if (typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request payload" },
        { status: 400 }
      );
    }

    const order = body as OrderPayload;

    // Strict validation of order properties to prevent arbitrary input abuse
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

    const apiKey = process.env.RESEND_API_KEY;
    const adminEmail =
      process.env.MAIN_ADMIN_EMAIL || "chandanthakurchandan935@gmail.com";
    const rawFromEmail =
      process.env.RESEND_FROM_EMAIL || "LOKI Zone <onboarding@resend.dev>";
    const fromEmail = rawFromEmail.replace(/^["']|["']$/g, "").trim();

    if (!apiKey) {
      console.warn(
        `[Order Notification] RESEND_API_KEY not configured. Skipping email dispatch for order ${order.id}.`
      );
      return NextResponse.json({
        success: false,
        warning: "RESEND_API_KEY not configured. Order saved without email dispatch.",
        orderId: order.id,
      });
    }

    // Sanitized values for HTML templates
    const safeCustomerName = escapeHtml(order.customerName.trim());
    const safePhone = escapeHtml(order.phone ? String(order.phone).trim() : "Not provided");
    const safeEmail = escapeHtml(order.email ? String(order.email).trim() : "");
    const safeAddress = escapeHtml(order.address ? String(order.address).trim() : "");
    const safeCity = escapeHtml(order.city ? String(order.city).trim() : "");
    const safeCourierNote = escapeHtml(order.courierNote ? String(order.courierNote).trim() : "");
    const safePaymentMethod = escapeHtml(order.paymentMethod ? String(order.paymentMethod).trim() : "Cash on Delivery");
    const safeDate = escapeHtml(order.date ? String(order.date).trim() : new Date().toLocaleDateString("en-US"));

    // 1. Build Itemized HTML Table with escaped content
    const itemsTableRows = order.items
      .slice(0, 50)
      .map((item) => {
        const safeItemName = escapeHtml(item.name || "Table Tennis Equipment");
        const safeQuantity = Math.max(1, Number(item.quantity) || 1);
        const safePrice = Math.max(0, Number(item.price) || 0);
        return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 10px 8px; font-size: 13px; color: #111827;">${safeItemName}</td>
          <td style="padding: 10px 8px; font-size: 13px; text-align: center; color: #4b5563;">${safeQuantity}</td>
          <td style="padding: 10px 8px; font-size: 13px; text-align: right; color: #111827; font-weight: 600;">NPR ${(safePrice * safeQuantity).toLocaleString()}</td>
        </tr>`;
      })
      .join("");

    // 2. Build Admin Alert Email HTML
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background: #dc2626; color: #ffffff; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 20px; letter-spacing: 1px;">🚨 NEW ORDER RECEIVED</h1>
          <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">Order #${escapeHtml(order.id)} • Call Customer to Confirm Dispatch</p>
        </div>

        <div style="padding: 24px;">
          <!-- Customer Action Card -->
          <div style="background: #fef2f2; border: 2px dashed #dc2626; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <p style="margin: 0 0 8px; font-size: 11px; text-transform: uppercase; color: #991b1b; font-weight: bold; letter-spacing: 1px;">Customer Contact Information</p>
            <p style="margin: 0 0 6px; font-size: 16px; font-weight: bold; color: #111827;">👤 ${safeCustomerName}</p>
            <p style="margin: 0 0 6px; font-size: 15px; color: #111827;">
              📞 Phone: <a href="tel:${safePhone}" style="font-size: 17px; font-weight: bold; color: #dc2626; text-decoration: underline;">${safePhone}</a>
              <span style="font-size: 12px; color: #6b7280; margin-left: 8px;">(Tap to call)</span>
            </p>
            <p style="margin: 0 0 6px; font-size: 14px; color: #374151;">✉️ Email: <a href="mailto:${safeEmail}" style="color: #2563eb;">${safeEmail}</a></p>
            <p style="margin: 0 0 4px; font-size: 14px; color: #374151;">📍 Delivery Address: <strong>${safeAddress}, ${safeCity}</strong></p>
            ${safeCourierNote ? `<p style="margin: 8px 0 0; font-size: 13px; color: #92400e; background: #fef3c7; padding: 8px; border-radius: 6px;">📝 Delivery Note: ${safeCourierNote}</p>` : ""}
          </div>

          <!-- Order Summary Details -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <thead>
              <tr style="background: #f3f4f6; text-align: left;">
                <th style="padding: 8px; font-size: 12px; color: #4b5563;">Product</th>
                <th style="padding: 8px; font-size: 12px; text-align: center; color: #4b5563;">Qty</th>
                <th style="padding: 8px; font-size: 12px; text-align: right; color: #4b5563;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsTableRows}
            </tbody>
          </table>

          <div style="background: #f9fafb; padding: 14px; border-radius: 8px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #4b5563;">
              <span>Subtotal:</span>
              <span style="font-weight: 600;">NPR ${Math.max(0, order.subtotal || 0).toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #4b5563;">
              <span>Delivery Fee:</span>
              <span style="font-weight: 600;">${(order.deliveryFee || 0) === 0 ? "FREE" : `NPR ${order.deliveryFee}`}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 16px; font-weight: bold; color: #111827;">
              <span>Grand Total:</span>
              <span style="color: #dc2626;">NPR ${order.total.toLocaleString()}</span>
            </div>
            <div style="margin-top: 6px; font-size: 12px; color: #6b7280;">
              Payment Method: <strong>${safePaymentMethod}</strong>
            </div>
          </div>

          <p style="font-size: 11px; color: #9ca3af; text-align: center; margin: 0;">
            LOKI Zone Nepal • Ritiz TT Goods • Automatic Admin Order Dispatch System
          </p>
        </div>
      </div>
    `;

    // 3. Build Customer Confirmation Email HTML
    const customerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background: #0f172a; color: #ffffff; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 1.5px; color: #ffffff;">LOKI ZONE NEPAL</h1>
          <p style="margin: 6px 0 0; font-size: 12px; color: #ef4444; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">Official Table Tennis Goods</p>
        </div>

        <div style="padding: 24px;">
          <h2 style="font-size: 18px; color: #111827; margin: 0 0 8px;">Order Confirmed!</h2>
          <p style="font-size: 14px; color: #4b5563; line-height: 1.5; margin: 0 0 20px;">
            Dear <strong>${safeCustomerName}</strong>, thank you for shopping with LOKI Zone Nepal. We have received your order <strong>#${escapeHtml(order.id)}</strong> and are packing it for delivery.
          </p>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
            <p style="margin: 0 0 6px; font-size: 12px; color: #64748b;">Order Number: <strong style="color: #0f172a;">${escapeHtml(order.id)}</strong></p>
            <p style="margin: 0 0 6px; font-size: 12px; color: #64748b;">Order Date: <strong style="color: #0f172a;">${safeDate}</strong></p>
            <p style="margin: 0 0 6px; font-size: 12px; color: #64748b;">Delivery Address: <strong style="color: #0f172a;">${safeAddress}, ${safeCity}</strong></p>
            <p style="margin: 0 0 6px; font-size: 12px; color: #64748b;">Payment Method: <strong style="color: #0f172a;">${safePaymentMethod}</strong></p>
            <p style="margin: 0; font-size: 12px; color: #64748b;">Contact Phone: <strong style="color: #0f172a;">${safePhone}</strong></p>
          </div>

          <h3 style="font-size: 14px; color: #111827; margin: 0 0 10px;">Ordered Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <thead>
              <tr style="background: #f1f5f9; text-align: left;">
                <th style="padding: 8px; font-size: 12px; color: #475569;">Item</th>
                <th style="padding: 8px; font-size: 12px; text-align: center; color: #475569;">Qty</th>
                <th style="padding: 8px; font-size: 12px; text-align: right; color: #475569;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsTableRows}
            </tbody>
          </table>

          <div style="background: #f8fafc; padding: 14px; border-radius: 8px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #475569;">
              <span>Subtotal:</span>
              <span style="font-weight: 600; color: #0f172a;">NPR ${Math.max(0, order.subtotal || 0).toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #475569;">
              <span>Delivery Fee:</span>
              <span style="font-weight: 600; color: #0f172a;">${(order.deliveryFee || 0) === 0 ? "FREE" : `NPR ${order.deliveryFee}`}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid #cbd5e1; font-size: 16px; font-weight: bold; color: #0f172a;">
              <span>Total Amount:</span>
              <span style="color: #dc2626;">NPR ${order.total.toLocaleString()}</span>
            </div>
          </div>

          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px; margin-bottom: 20px; font-size: 12px; color: #1e40af; line-height: 1.5;">
            💡 <strong>Next Steps:</strong> For Cash on Delivery orders, our delivery representative will contact you at <strong>${safePhone}</strong> before arriving. Please keep the exact amount ready upon delivery.
          </div>

          <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0 0 4px;">
            Need help? Contact our customer support at <a href="mailto:${escapeHtml(adminEmail)}" style="color: #dc2626;">${escapeHtml(adminEmail)}</a>.
          </p>
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 20px;">
            Ritiz TT Goods Nepal • Exclusive Authorized LOKI Distributor
          </p>
        </div>
      </div>
    `;

    // 4. Send Admin Alert Email
    const sendAdminPromise = fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [adminEmail],
        subject: `🚨 [NEW ORDER] ${order.id} - NPR ${order.total.toLocaleString()} - Call ${safePhone}`,
        html: adminHtml,
      }),
    });

    // 5. Send Customer Confirmation Email (if customer has provided valid email)
    const canSendCustomer = isValidEmail(order.email);
    const sendCustomerPromise = canSendCustomer
      ? fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [order.email.trim()],
            subject: `Order Confirmed: #${order.id} | LOKI Zone Nepal`,
            html: customerHtml,
          }),
        })
      : Promise.resolve(null);

    const [adminRes, customerRes] = await Promise.allSettled([
      sendAdminPromise,
      sendCustomerPromise,
    ]);

    let adminStatus = "failed";
    let customerStatus = canSendCustomer ? "failed" : "skipped";

    if (adminRes.status === "fulfilled") {
      const adminData = await adminRes.value.json();
      if (adminRes.value.ok) {
        adminStatus = "sent";
      } else {
        console.error("[Order Notification] Admin email failed:", adminData);
        adminStatus = `error: ${adminData?.message || adminRes.value.statusText}`;
      }
    }

    if (customerRes.status === "fulfilled" && customerRes.value) {
      const customerData = await customerRes.value.json();
      if (customerRes.value.ok) {
        customerStatus = "sent";
      } else {
        console.warn("[Order Notification] Customer email warning:", customerData);
        customerStatus = `warning: ${customerData?.message || customerRes.value.statusText}`;
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      adminEmail: adminStatus,
      customerEmail: customerStatus,
    });
  } catch (error: any) {
    console.error("[Order Notification] Unhandled error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to dispatch email notifications",
      },
      { status: 200 }
    );
  }
}
