import { NextRequest } from "next/server";
import { currentUser, auth } from "@clerk/nextjs/server";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { extractClerkEmail, resolveAdminRole, AdminRole } from "./adminAuth";

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
      const role = resolveAdminRole(email, user.publicMetadata?.role);
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
        const role = resolveAdminRole(email, user.publicMetadata?.role);
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
              const role = resolveAdminRole(email, user.publicMetadata?.role);
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
