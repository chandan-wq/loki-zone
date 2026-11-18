import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PHONE_FORMAT_REGEX = /^\+?[0-9\s\-()]+$/;

/**
 * GET /api/account/addresses
 * Retrieves all saved addresses for the authenticated Clerk user.
 * Sorted with default address first, followed by newest addresses.
 */
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const verifiedUserId = user.id;

    const supabase = createAdminClient();
    const { data: addresses, error } = await supabase
      .from("customer_addresses")
      .select("*")
      .eq("clerk_user_id", verifiedUserId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Addresses GET Error]:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch addresses: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, addresses: addresses || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    console.error("[Addresses GET Exception]:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * POST /api/account/addresses
 * Creates a new address for the authenticated Clerk user.
 * Protocol:
 *   1. Always insert initially with is_default = FALSE to guarantee
 *      the partial unique index is never violated.
 *   2. If isDefault is requested, call set_default_customer_address RPC.
 *   3. If the RPC fails, safely roll back by deleting the inserted address.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const verifiedUserId = user.id;

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON payload." }, { status: 400 });
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ success: false, error: "Invalid payload format." }, { status: 400 });
    }

    const { label, fullName, phone, city, address, notes, isDefault } = body;

    // Field Validations
    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Full Name is required (minimum 2 characters)." },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ success: false, error: "Phone number is required." }, { status: 400 });
    }
    const cleanPhone = phone.trim();
    if (!PHONE_FORMAT_REGEX.test(cleanPhone)) {
      return NextResponse.json(
        { success: false, error: "Phone number contains invalid characters. Only digits, +, -, (), and spaces are permitted." },
        { status: 400 }
      );
    }
    const numericPhoneDigits = cleanPhone.replace(/\D/g, "");
    if (numericPhoneDigits.length < 7 || numericPhoneDigits.length > 15) {
      return NextResponse.json(
        { success: false, error: "Phone number must contain between 7 and 15 numeric digits." },
        { status: 400 }
      );
    }

    if (!city || typeof city !== "string" || city.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "City is required (minimum 2 characters)." },
        { status: 400 }
      );
    }

    if (!address || typeof address !== "string" || address.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: "Street address is required (minimum 3 characters)." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // STEP 1: ALWAYS insert with is_default = FALSE
    const { data: newAddress, error: insertErr } = await supabase
      .from("customer_addresses")
      .insert({
        clerk_user_id: verifiedUserId,
        label: typeof label === "string" && label.trim() ? label.trim() : "Home",
        full_name: fullName.trim(),
        phone: cleanPhone,
        city: city.trim(),
        address: address.trim(),
        notes: typeof notes === "string" ? notes.trim() : "",
        is_default: false, // Mandatory: always false on initial insert
      })
      .select()
      .single();

    if (insertErr || !newAddress) {
      console.error("[Address Create Insert Error]:", insertErr);
      return NextResponse.json(
        { success: false, error: insertErr?.message || "Failed to create address record." },
        { status: 500 }
      );
    }

    // STEP 2: If isDefault requested, call set_default_customer_address RPC
    if (Boolean(isDefault)) {
      const { error: rpcErr } = await supabase.rpc("set_default_customer_address", {
        p_clerk_user_id: verifiedUserId,
        p_address_id: newAddress.id,
      });

      if (rpcErr) {
        console.error("[Address Create Default RPC Error] Rolling back inserted address:", rpcErr);
        // Rollback: delete inserted address to avoid inconsistent state
        await supabase
          .from("customer_addresses")
          .delete()
          .eq("id", newAddress.id)
          .eq("clerk_user_id", verifiedUserId);

        return NextResponse.json(
          {
            success: false,
            error: "Failed to establish address as default: " + rpcErr.message + ". Creation was rolled back.",
            failedStep: "set_default_rpc",
          },
          { status: 500 }
        );
      }
      newAddress.is_default = true;
    }

    return NextResponse.json({ success: true, address: newAddress }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    console.error("[Address Create Exception]:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/account/addresses
 * Updates fields of an existing address and/or toggles default address status.
 * Enforces ownership: only addresses owned by verified Clerk user can be updated.
 */
export async function PATCH(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const verifiedUserId = user.id;

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON payload." }, { status: 400 });
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ success: false, error: "Invalid payload format." }, { status: 400 });
    }

    const { id, isDefault, ...fields } = body;

    if (!id || typeof id !== "string" || !UUID_REGEX.test(id)) {
      return NextResponse.json({ success: false, error: "A valid address UUID is required." }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Verify ownership and existence
    const { data: existing, error: findErr } = await supabase
      .from("customer_addresses")
      .select("id, is_default")
      .eq("id", id)
      .eq("clerk_user_id", verifiedUserId)
      .maybeSingle();

    if (findErr) {
      console.error("[Address PATCH Find Error]:", findErr);
      return NextResponse.json(
        { success: false, error: "Database error: " + findErr.message },
        { status: 500 }
      );
    }

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Address not found or unauthorized." },
        { status: 404 }
      );
    }

    // If setting default, execute transaction-safe RPC
    if (isDefault === true && !existing.is_default) {
      const { error: rpcErr } = await supabase.rpc("set_default_customer_address", {
        p_clerk_user_id: verifiedUserId,
        p_address_id: id,
      });

      if (rpcErr) {
        console.error("[Address PATCH Default RPC Error]:", rpcErr);
        return NextResponse.json(
          { success: false, error: "Failed to set default address: " + rpcErr.message },
          { status: 500 }
        );
      }
    }

    // Validate and update fields if supplied
    const updateData: Record<string, string> = {};

    if ("label" in fields) {
      if (typeof fields.label !== "string" || fields.label.trim().length === 0) {
        return NextResponse.json({ success: false, error: "Label must be a non-empty string." }, { status: 400 });
      }
      updateData.label = fields.label.trim();
    }

    if ("fullName" in fields) {
      if (typeof fields.fullName !== "string" || fields.fullName.trim().length < 2) {
        return NextResponse.json({ success: false, error: "Full Name must be at least 2 characters." }, { status: 400 });
      }
      updateData.full_name = fields.fullName.trim();
    }

    if ("phone" in fields) {
      if (typeof fields.phone !== "string") {
        return NextResponse.json({ success: false, error: "Phone must be a string." }, { status: 400 });
      }
      const cleanPhone = fields.phone.trim();
      if (!PHONE_FORMAT_REGEX.test(cleanPhone)) {
        return NextResponse.json(
          { success: false, error: "Phone number contains invalid characters." },
          { status: 400 }
        );
      }
      const digits = cleanPhone.replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 15) {
        return NextResponse.json({ success: false, error: "Phone must contain 7-15 digits." }, { status: 400 });
      }
      updateData.phone = cleanPhone;
    }

    if ("city" in fields) {
      if (typeof fields.city !== "string" || fields.city.trim().length < 2) {
        return NextResponse.json({ success: false, error: "City must be at least 2 characters." }, { status: 400 });
      }
      updateData.city = fields.city.trim();
    }

    if ("address" in fields) {
      if (typeof fields.address !== "string" || fields.address.trim().length < 3) {
        return NextResponse.json({ success: false, error: "Street address must be at least 3 characters." }, { status: 400 });
      }
      updateData.address = fields.address.trim();
    }

    if ("notes" in fields) {
      if (typeof fields.notes !== "string") {
        return NextResponse.json({ success: false, error: "Notes must be a string." }, { status: 400 });
      }
      updateData.notes = fields.notes.trim();
    }

    if (Object.keys(updateData).length > 0) {
      updateData.updated_at = new Date().toISOString();
      const { error: updateErr } = await supabase
        .from("customer_addresses")
        .update(updateData)
        .eq("id", id)
        .eq("clerk_user_id", verifiedUserId);

      if (updateErr) {
        console.error("[Address PATCH Update Error]:", updateErr);
        return NextResponse.json(
          { success: false, error: "Failed to update address: " + updateErr.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    console.error("[Address PATCH Exception]:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/account/addresses
 * Deletes an address for the authenticated Clerk user.
 * If the deleted address was the default, automatically promotes the newest remaining address.
 * Enforces ownership via the delete_customer_address database function.
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const verifiedUserId = user.id;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || typeof id !== "string" || !UUID_REGEX.test(id)) {
      return NextResponse.json({ success: false, error: "A valid address UUID is required." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: rpcResult, error: rpcErr } = await supabase.rpc("delete_customer_address", {
      p_clerk_user_id: verifiedUserId,
      p_address_id: id,
    });

    if (rpcErr) {
      console.error("[Address DELETE RPC Error]:", rpcErr);
      if (rpcErr.message.includes("Address not found or unauthorized")) {
        return NextResponse.json({ success: false, error: "Address not found or unauthorized." }, { status: 404 });
      }
      return NextResponse.json(
        { success: false, error: "Failed to delete address: " + rpcErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, result: rpcResult });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    console.error("[Address DELETE Exception]:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
