import { NextRequest } from "next/server";
import { currentUser, auth } from "@clerk/nextjs/server";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { extractClerkEmail, resolveAdminRole, AdminRole, MAIN_ADMIN_EMAILS } from "./adminAuth";
import { createAdminClient } from "./supabase/server";

async function verifyEmailRoleWithDatabase(
  email: string | null,
  publicMetadataRole?: unknown
): Promise<AdminRole | null> {
  if (!email) return null;
  const cleanEmail = email.toLowerCase().trim();

  // 1. Permanent Main Admin check
  if (MAIN_ADMIN_EMAILS.includes(cleanEmail)) {
    return "main";
  }

  // 2. Real-time Supabase staff_members roster check
  try {
    const supabase = createAdminClient();
    const { data: staffMember } = await supabase
      .from("staff_members")
      .select("role, status")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (staffMember) {
      if (staffMember.status === "inactive") {
        return null; // Explicitly deactivated by Store Owner
      }
      return (staffMember.role as AdminRole) || "normal";
    }
  } catch (err) {
    console.warn("[adminAuthServer] Database staff lookup warning:", err);
  }

  // 3. Fallback to Clerk-managed publicMetadata
  return resolveAdminRole(cleanEmail, publicMetadataRole);
}

/**
 * Server-Side Unified Admin Session Verification.
 * Supports:
 * 1. Clerk session cookie via currentUser()
 * 2. Clerk auth() session claims
 * 3. HTTP Authorization: Bearer <token> header with Clerk JWT verification
 */
export async function getVerifiedAdmin(req?: NextRequest): Promise<{
  authorized: boolean;
  email: string | null;
  role: AdminRole;
  userId: string | null;
}> {
  // 1. Try standard Clerk currentUser()
  try {
    const user = await currentUser();
    if (user) {
      const email = extractClerkEmail(user);
      const role = await verifyEmailRoleWithDatabase(email, user.publicMetadata?.role);
      if (role) {
        return { authorized: true, email, role, userId: user.id };
      }
    }
  } catch (err) {
    // Continue to fallback strategies
  }

  const clerkKey =
    process.env.CLERK_SECRET_KEY || "sk_test_q7R5ZHEY9dwMoiFmTrtmQcOfAUcvKeSgBH8U6Hvkgz";

  // 2. Try Clerk auth() session claims
  try {
    const { userId } = await auth();
    if (userId && clerkKey) {
      const clerk = createClerkClient({ secretKey: clerkKey });
      const user = await clerk.users.getUser(userId);
      if (user) {
        const email = extractClerkEmail(user);
        const role = await verifyEmailRoleWithDatabase(email, user.publicMetadata?.role);
        if (role) {
          return { authorized: true, email, role, userId: user.id };
        }
      }
    }
  } catch (err) {
    // Continue to bearer token check
  }

  // 3. Try Authorization: Bearer <token> header from client
  if (req && clerkKey) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      if (token) {
        try {
          const verified = (await verifyToken(token, {
            secretKey: clerkKey,
          })) as any;
          const sub = verified?.data?.sub || verified?.sub;
          if (sub) {
            const clerk = createClerkClient({ secretKey: clerkKey });
            const user = await clerk.users.getUser(sub);
            if (user) {
              const email = extractClerkEmail(user);
              const role = await verifyEmailRoleWithDatabase(email, user.publicMetadata?.role);
              if (role) {
                return { authorized: true, email, role, userId: user.id };
              }
            }
          }
        } catch (err) {
          console.warn("[getVerifiedAdmin] Bearer token verification error:", err);
        }
      }
    }
  }

  return { authorized: false, email: null, role: null, userId: null };
}
