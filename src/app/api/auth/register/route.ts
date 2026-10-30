import { NextRequest, NextResponse } from "next/server";
import { createClerkClient } from "@clerk/backend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone } = body || {};

    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanName = (name || "").trim();
    const cleanPassword = (password || "").trim();
    const cleanPhone = (phone || "").trim();

    if (!cleanName) {
      return NextResponse.json(
        { success: false, error: "Please enter your full name." },
        { status: 400 }
      );
    }

    if (!cleanEmail || !cleanEmail.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!cleanPassword || cleanPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const clerkKey = process.env.CLERK_SECRET_KEY;
    if (!clerkKey) {
      return NextResponse.json(
        { success: false, error: "Server authentication service configuration missing." },
        { status: 500 }
      );
    }

    const clerk = createClerkClient({ secretKey: clerkKey });

    // Check if user already exists
    try {
      const existing = await clerk.users.getUserList({
        emailAddress: [cleanEmail],
        limit: 1,
      });

      if (existing.data && existing.data.length > 0) {
        return NextResponse.json(
          {
            success: false,
            code: "form_identifier_exists",
            error: "An account with this email address already exists. Please sign in.",
          },
          { status: 409 }
        );
      }
    } catch {
      // Continue to create
    }

    // Split name into first and last name
    const nameParts = cleanName.split(/\s+/);
    const firstName = nameParts[0] || cleanName;
    const lastName = nameParts.slice(1).join(" ") || undefined;

    // Create user directly through Clerk Backend API
    // This marks the account as verified immediately without sending verification links/redirects to external portals
    const createdUser = await clerk.users.createUser({
      emailAddress: [cleanEmail],
      password: cleanPassword,
      firstName,
      lastName,
      publicMetadata: {
        registeredVia: "in_app_branded",
        phone: cleanPhone || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      userId: createdUser.id,
      email: cleanEmail,
    });
  } catch (err: any) {
    console.error("[In-App Registration Error]:", err);

    const clerkErrors = err?.errors || [];
    const firstError = clerkErrors[0];

    if (firstError?.code === "form_password_pwned") {
      return NextResponse.json(
        {
          success: false,
          error: "This password has been identified in security breaches. Please choose a more unique, secure password.",
        },
        { status: 400 }
      );
    }

    if (firstError?.code === "form_identifier_exists") {
      return NextResponse.json(
        {
          success: false,
          code: "form_identifier_exists",
          error: "An account with this email address already exists. Please sign in.",
        },
        { status: 409 }
      );
    }

    const errorMessage =
      firstError?.longMessage ||
      firstError?.message ||
      err?.message ||
      "Could not complete registration. Please check your information and try again.";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 400 }
    );
  }
}
