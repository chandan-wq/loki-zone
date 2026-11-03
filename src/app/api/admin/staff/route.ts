import { NextRequest, NextResponse } from "next/server";
import { getVerifiedAdmin } from "@/lib/adminAuthServer";
import { createAdminClient } from "@/lib/supabase/server";
import { createClerkClient } from "@clerk/backend";
import { MAIN_ADMIN_EMAILS } from "@/lib/adminAuth";

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
    const { data: dbStaff, error: dbError } = await supabase
      .from("staff_members")
      .select("*")
      .order("created_at", { ascending: false });

    if (dbError) {
      console.error("[Admin Staff GET Error]:", dbError);
      return NextResponse.json(
        { success: false, error: dbError.message },
        { status: 500 }
      );
    }

    // Default permanent Main Administrators
    const permanentOwners = [
      {
        id: "owner-chandan",
        name: "Chandan Thakur",
        email: "chandanthakurchandan935@gmail.com",
        role: "main",
        status: "active",
        lastLogin: "Active Now",
      },
      {
        id: "owner-ritiz",
        name: "Ritiz Joshi",
        email: "joshi.ritiz@gmail.com",
        role: "main",
        status: "active",
        lastLogin: "Active Now",
      },
    ];

    const existingEmails = new Set(permanentOwners.map((o) => o.email.toLowerCase()));

    const staffList = [...permanentOwners];

    for (const s of dbStaff || []) {
      const emailLower = (s.email || "").toLowerCase().trim();
      if (!existingEmails.has(emailLower)) {
        existingEmails.add(emailLower);
        staffList.push({
          id: s.id,
          name: s.name,
          email: s.email,
          role: s.role || "normal",
          status: s.status || "active",
          lastLogin: s.last_login
            ? new Date(s.last_login).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Registered",
        });
      }
    }

    return NextResponse.json({
      success: true,
      staff: staffList,
    });
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) {
      throw err;
    }
    console.error("[Admin Staff GET Handler Error]:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching staff roster." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSession = await getVerifiedAdmin(req);
    // ONLY Main Admin (Store Owner) can create new staff
    if (!adminSession.authorized || adminSession.role !== "main") {
      return NextResponse.json(
        { success: false, error: "Access denied. Only Main Admin can add staff accounts." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, email, password } = body as {
      name: string;
      email: string;
      password?: string;
    };

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Full staff name is required (minimum 2 characters)." },
        { status: 400 }
      );
    }

    const cleanEmail = (email || "").toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const cleanPassword = (password || "").trim();
    if (!cleanPassword || cleanPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const clerkKey =
      process.env.CLERK_SECRET_KEY || "sk_test_q7R5ZHEY9dwMoiFmTrtmQcOfAUcvKeSgBH8U6Hvkgz";
    const clerk = createClerkClient({ secretKey: clerkKey });

    let clerkUserId: string | null = null;

    try {
      // 1. Check if user already exists in Clerk
      const existingUsers = await clerk.users.getUserList({
        emailAddress: [cleanEmail],
      });

      if (existingUsers.data && existingUsers.data.length > 0) {
        const existingUser = existingUsers.data[0];
        clerkUserId = existingUser.id;

        // Update existing user with the new password and assign role: normal (staff)
        await clerk.users.updateUser(existingUser.id, {
          password: cleanPassword,
          firstName: name.trim(),
          publicMetadata: {
            ...existingUser.publicMetadata,
            role: "normal",
          },
        });
      } else {
        // 2. Create new Clerk user with the email and password chosen by Admin
        const newUser = await clerk.users.createUser({
          emailAddress: [cleanEmail],
          password: cleanPassword,
          firstName: name.trim(),
          publicMetadata: {
            role: "normal",
          },
          skipPasswordChecks: true,
        });
        clerkUserId = newUser.id;
      }
    } catch (clerkErr: any) {
      console.error("[Clerk Provision Staff Error]:", clerkErr);
      const errMsg =
        clerkErr?.errors?.[0]?.longMessage ||
        clerkErr?.errors?.[0]?.message ||
        clerkErr?.message ||
        "Failed to provision staff account in authentication provider.";
      return NextResponse.json(
        { success: false, error: errMsg },
        { status: 400 }
      );
    }

    // 3. Upsert into Supabase `staff_members` table
    const supabase = createAdminClient();
    const staffId = `st-${Date.now()}`;

    const { data: dbData, error: dbError } = await supabase
      .from("staff_members")
      .upsert({
        id: staffId,
        clerk_user_id: clerkUserId,
        name: name.trim(),
        email: cleanEmail,
        role: "normal",
        status: "active",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error("[Supabase Staff Save Error]:", dbError);
      return NextResponse.json(
        { success: false, error: `Account created in Clerk, but failed to save in database: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Staff account "${name.trim()}" created successfully. They can now log in with their email and password!`,
      staff: {
        id: staffId,
        name: name.trim(),
        email: cleanEmail,
        role: "normal",
        status: "active",
        lastLogin: "Never",
      },
    });
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) {
      throw err;
    }
    console.error("[Admin Staff POST Handler Error]:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error creating staff member." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const adminSession = await getVerifiedAdmin(req);
    if (!adminSession.authorized || adminSession.role !== "main") {
      return NextResponse.json(
        { success: false, error: "Access denied. Only Main Admin can modify staff status." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, status, password } = body as {
      id: string;
      status?: "active" | "inactive";
      password?: string;
    };

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Staff ID is required." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data: staff, error: fetchErr } = await supabase
      .from("staff_members")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !staff) {
      return NextResponse.json(
        { success: false, error: "Staff member not found." },
        { status: 404 }
      );
    }

    // Protect owners from deactivation
    if (MAIN_ADMIN_EMAILS.includes((staff.email || "").toLowerCase())) {
      return NextResponse.json(
        { success: false, error: "Cannot modify permanent Main Admin accounts." },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {};
    if (status) {
      updates.status = status;
    }

    const { error: updateErr } = await supabase
      .from("staff_members")
      .update(updates)
      .eq("id", id);

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
    }

    // Sync role status or password to Clerk
    const clerkKey =
      process.env.CLERK_SECRET_KEY || "sk_test_q7R5ZHEY9dwMoiFmTrtmQcOfAUcvKeSgBH8U6Hvkgz";
    const clerk = createClerkClient({ secretKey: clerkKey });

    if (staff.clerk_user_id) {
      try {
        const clerkUpdate: Record<string, any> = {};
        if (status) {
          clerkUpdate.publicMetadata = {
            role: status === "active" ? "normal" : null,
          };
        }
        if (password && password.trim().length >= 8) {
          clerkUpdate.password = password.trim();
        }

        if (Object.keys(clerkUpdate).length > 0) {
          await clerk.users.updateUser(staff.clerk_user_id, clerkUpdate);
        }
      } catch (clerkSyncErr) {
        console.warn("[Clerk Staff Status Sync Warning]:", clerkSyncErr);
      }
    }

    return NextResponse.json({
      success: true,
      id,
      status,
      message: `Staff member updated successfully.`,
    });
  } catch (err) {
    console.error("[Admin Staff PATCH Error]:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error updating staff member." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const adminSession = await getVerifiedAdmin(req);
    if (!adminSession.authorized || adminSession.role !== "main") {
      return NextResponse.json(
        { success: false, error: "Access denied. Only Main Admin can remove staff." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Staff ID is required." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data: staff, error: fetchErr } = await supabase
      .from("staff_members")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !staff) {
      return NextResponse.json(
        { success: false, error: "Staff member not found." },
        { status: 404 }
      );
    }

    if (MAIN_ADMIN_EMAILS.includes((staff.email || "").toLowerCase())) {
      return NextResponse.json(
        { success: false, error: "Cannot delete permanent Main Admin accounts." },
        { status: 400 }
      );
    }

    // Revoke admin role in Clerk
    if (staff.clerk_user_id) {
      try {
        const clerkKey =
          process.env.CLERK_SECRET_KEY || "sk_test_q7R5ZHEY9dwMoiFmTrtmQcOfAUcvKeSgBH8U6Hvkgz";
        const clerk = createClerkClient({ secretKey: clerkKey });
        await clerk.users.updateUser(staff.clerk_user_id, {
          publicMetadata: { role: null },
        });
      } catch (clerkRevokeErr) {
        console.warn("[Clerk Staff Revoke Role Warning]:", clerkRevokeErr);
      }
    }

    // Delete row from Supabase
    const { error: deleteErr } = await supabase
      .from("staff_members")
      .delete()
      .eq("id", id);

    if (deleteErr) {
      return NextResponse.json({ success: false, error: deleteErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Staff member "${staff.name}" removed successfully.`,
    });
  } catch (err) {
    console.error("[Admin Staff DELETE Error]:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error removing staff." },
      { status: 500 }
    );
  }
}
