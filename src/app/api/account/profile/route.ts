import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/backend";
import { createAdminClient } from "@/lib/supabase/server";
import { extractClerkEmail } from "@/lib/adminAuth";

/**
 * GET /api/account/profile
 * Retrieves profile for the verified authenticated Clerk customer.
 * - If customer record exists in Supabase: DB is authoritative with null-aware fallbacks.
 * - If no customer record exists (zero-checkout): falls back to Clerk profile & publicMetadata.
 */
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const verifiedUserId = user.id;

    const supabase = createAdminClient();
    const { data: customer, error: fetchErr } = await supabase
      .from("customers")
      .select("*")
      .eq("clerk_user_id", verifiedUserId)
      .maybeSingle();

    if (fetchErr) {
      return NextResponse.json(
        { success: false, error: "Database error fetching profile: " + fetchErr.message },
        { status: 500 }
      );
    }

    // Source of Truth Resolution:
    // When a customer record exists in the database, DB values are strictly authoritative.
    // Use null-aware fallbacks (not ||) so empty strings ("") or explicit values are preserved,
    // ensuring stale Clerk metadata never overwrites existing database values.
    let phoneSecondary = "";
    let city = "Kathmandu";
    let name = user.fullName ?? [user.firstName, user.lastName].filter(Boolean).join(" ") ?? "";

    if (customer) {
      // 1. Name: Use DB name if present; only fall back to Clerk if DB name is null/empty
      if (customer.name !== null && customer.name !== undefined && customer.name.trim() !== "") {
        name = customer.name;
      }

      // 2. City: Use DB city if present; only fall back to Clerk metadata if DB city is null/empty
      if (customer.city !== null && customer.city !== undefined && customer.city.trim() !== "") {
        city = customer.city;
      } else {
        city = (user.publicMetadata?.city as string) ?? "Kathmandu";
      }

      // 3. Alternate Phone: DB value is authoritative whenever populated (including empty string "" when cleared)
      // Stale Clerk metadata is NEVER allowed to resurrect a cleared alternate phone
      if (customer.phone_secondary !== null && customer.phone_secondary !== undefined) {
        phoneSecondary = customer.phone_secondary;
      } else {
        // Only if DB column is strictly null (unmigrated legacy row), use Clerk metadata as fallback
        phoneSecondary = (user.publicMetadata?.phoneSecondary as string) ?? "";
      }
    } else {
      // Zero-checkout account: customer row does not exist yet; read from Clerk metadata
      city = (user.publicMetadata?.city as string) ?? "Kathmandu";
      phoneSecondary = (user.publicMetadata?.phoneSecondary as string) ?? "";
    }

    return NextResponse.json({
      success: true,
      existsInDb: Boolean(customer),
      name,
      email: extractClerkEmail(user),
      phone: customer?.phone || user.phoneNumbers?.[0]?.phoneNumber || (user.publicMetadata?.phone as string) || "",
      phoneSecondary,
      city,
      ordersCount: customer?.orders_count || 0,
      totalSpent: Number(customer?.total_spent || 0),
      joinedDate: customer?.joined_date || user.createdAt,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/account/profile
 * Updates permitted profile fields (name, city, phoneSecondary).
 * - Strict PATCH semantics: omitted fields are preserved; empty strings/null clear phoneSecondary.
 * - Input validation: checks field types, lengths, and phone numeric digits.
 * - Row count verification: checks updatedRows.length > 0 on DB update.
 * - Dual-write handling: updates DB first (if row exists), then Clerk metadata.
 *   Returns status 207 Multi-Status if DB succeeds but Clerk sync fails.
 */
export async function PATCH(req: NextRequest) {
  try {
    // 1. Authenticate server session
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const verifiedUserId = user.id;

    // 2. Validate request body
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON payload." }, { status: 400 });
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ success: false, error: "Invalid JSON payload." }, { status: 400 });
    }

    const dbUpdatePayload: Record<string, string> = {};
    const clerkMetadataUpdate: Record<string, string> = {};
    let clerkNameUpdate: { firstName: string; lastName: string } | null = null;
    let hasUpdates = false;

    // Field: name (Strict PATCH: preserve if omitted, validate if supplied)
    if ("name" in body) {
      if (typeof body.name !== "string" || body.name.trim().length < 2) {
        return NextResponse.json(
          { success: false, error: "Name must be a valid string of at least 2 characters." },
          { status: 400 }
        );
      }
      const cleanName = body.name.trim();
      dbUpdatePayload.name = cleanName;

      const nameParts = cleanName.split(/\s+/);
      clerkNameUpdate = {
        firstName: nameParts[0] || cleanName,
        lastName: nameParts.slice(1).join(" "), // Empty string if single-word name, ensuring previous surname is cleared in Clerk
      };
      hasUpdates = true;
    }

    // Field: city (Strict PATCH: preserve if omitted, do NOT default to Kathmandu)
    if ("city" in body) {
      if (typeof body.city !== "string" || body.city.trim().length < 2) {
        return NextResponse.json(
          { success: false, error: "City must be a valid string of at least 2 characters." },
          { status: 400 }
        );
      }
      const cleanCity = body.city.trim();
      dbUpdatePayload.city = cleanCity;
      clerkMetadataUpdate.city = cleanCity;
      hasUpdates = true;
    }

    // Field: phoneSecondary (Strict PATCH: allows null/"" to explicitly clear, counts actual numeric digits)
    if ("phoneSecondary" in body) {
      if (body.phoneSecondary === null || body.phoneSecondary === "") {
        dbUpdatePayload.phone_secondary = "";
        clerkMetadataUpdate.phoneSecondary = "";
        hasUpdates = true;
      } else if (typeof body.phoneSecondary === "string") {
        const cleanPhone = body.phoneSecondary.trim();
        if (cleanPhone === "") {
          dbUpdatePayload.phone_secondary = "";
          clerkMetadataUpdate.phoneSecondary = "";
          hasUpdates = true;
        } else {
          // Permitted format: optional leading '+', digits, spaces, hyphens, and parentheses only
          const phoneFormatRegex = /^\+?[0-9\s\-()]+$/;
          if (!phoneFormatRegex.test(cleanPhone)) {
            return NextResponse.json(
              { success: false, error: "Alternate phone contains invalid characters. Only digits, +, -, (), and spaces are permitted." },
              { status: 400 }
            );
          }

          // Count actual numeric digits (excluding '+', '-', '()', spaces)
          const actualDigits = cleanPhone.replace(/\D/g, "");
          if (actualDigits.length < 7 || actualDigits.length > 15) {
            return NextResponse.json(
              { success: false, error: "Alternate phone must contain between 7 and 15 numeric digits." },
              { status: 400 }
            );
          }

          dbUpdatePayload.phone_secondary = cleanPhone;
          clerkMetadataUpdate.phoneSecondary = cleanPhone;
          hasUpdates = true;
        }
      } else {
        return NextResponse.json(
          { success: false, error: "phoneSecondary must be a string or null." },
          { status: 400 }
        );
      }
    }

    if (!hasUpdates) {
      return NextResponse.json(
        { success: false, error: "No valid profile fields provided for update. Allowed fields: name, city, phoneSecondary." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check if customer record exists in database
    const { data: customer, error: fetchErr } = await supabase
      .from("customers")
      .select("id")
      .eq("clerk_user_id", verifiedUserId)
      .maybeSingle();

    if (fetchErr) {
      return NextResponse.json(
        { success: false, error: "Database error fetching profile: " + fetchErr.message, failedStep: "database_fetch" },
        { status: 500 }
      );
    }

    // 3. Database Write (Executed FIRST if customer row exists)
    if (customer) {
      const dbPayloadWithTimestamp: Record<string, string> = {
        ...dbUpdatePayload,
        updated_at: new Date().toISOString(),
      };

      const { data: updatedRows, error: dbErr } = await supabase
        .from("customers")
        .update(dbPayloadWithTimestamp)
        .eq("clerk_user_id", verifiedUserId)
        .select("id");

      if (dbErr) {
        console.error("[Profile Update DB Error]:", dbErr);
        return NextResponse.json(
          { success: false, error: "Database update failed: " + dbErr.message, failedStep: "database_write" },
          { status: 500 }
        );
      }

      if (!updatedRows || updatedRows.length === 0) {
        return NextResponse.json(
          { success: false, error: "Zero rows updated. Customer record was not found.", failedStep: "database_zero_rows_affected" },
          { status: 404 }
        );
      }
    }

    // 4. Targeted Clerk Sync (Executed only for fields actually changed)
    try {
      const clerkKey = process.env.CLERK_SECRET_KEY;
      if (!clerkKey) throw new Error("CLERK_SECRET_KEY is not configured.");
      const clerk = createClerkClient({ secretKey: clerkKey });

      const clerkPayload: Record<string, unknown> = {};
      if (clerkNameUpdate) {
        clerkPayload.firstName = clerkNameUpdate.firstName;
        clerkPayload.lastName = clerkNameUpdate.lastName;
      }
      if (Object.keys(clerkMetadataUpdate).length > 0) {
        clerkPayload.publicMetadata = {
          ...(user.publicMetadata as Record<string, unknown>),
          ...clerkMetadataUpdate,
        };
      }

      if (Object.keys(clerkPayload).length > 0) {
        await clerk.users.updateUser(verifiedUserId, clerkPayload);
      }
    } catch (clerkErr: unknown) {
      console.warn("[Profile Clerk Sync Warning]:", clerkErr);
      const clerkErrorMessage = clerkErr instanceof Error ? clerkErr.message : "Clerk synchronization error";
      if (!customer) {
        // If user has no DB row and Clerk update fails, whole update failed
        return NextResponse.json(
          { success: false, error: "Failed to update profile: " + clerkErrorMessage, failedStep: "clerk_metadata" },
          { status: 500 }
        );
      }
      // If DB update succeeded, return explicit partial-failure response
      return NextResponse.json(
        {
          success: false,
          error: "Profile saved to database, but identity provider sync failed. Please retry to synchronize.",
          partialFailure: true,
          failedStep: "clerk_sync",
          syncedInDatabase: true,
          updatedFields: Object.keys(dbUpdatePayload).filter((k) => k !== "updated_at"),
        },
        { status: 207 }
      );
    }

    return NextResponse.json({
      success: true,
      updatedFields: Object.keys(dbUpdatePayload).filter((k) => k !== "updated_at"),
    });
  } catch (err: unknown) {
    console.error("[Profile PATCH Server Error]:", err);
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
