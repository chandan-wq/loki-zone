/**
 * Server-Side Trusted Administrator & Staff Authorization Configuration
 *
 * SECURITY MODEL:
 * ─────────────────────────────────────────────────────────────────────
 * Authorization is evaluated only from trusted server-side sources:
 *   1. Primary email address verified by Clerk (from `currentUser()`)
 *   2. `publicMetadata.role` set via the Clerk Dashboard or Clerk
 *      Backend API — this field is NOT writable by the browser/client.
 *
 * WHAT IS TRUSTED:
 *   • Email matched against MAIN_ADMIN_EMAIL env var (or hardcoded fallback)
 *   • Email matched against STAFF_EMAILS env var list (or hardcoded fallback)
 *   • publicMetadata.role === "main" | "admin" | "staff" | "normal"
 *     (set only in Clerk Dashboard / Backend API, never by the browser)
 *
 * WHAT IS NOT TRUSTED:
 *   • localStorage / Zustand isAdminAuthenticated state (UI-only convenience)
 *   • Any browser-provided payload, form field, or request header
 *   • Staff members added through the in-app UI are stored in localStorage
 *     ONLY — they do NOT gain server-side admin access unless their email
 *     is added to STAFF_EMAILS env var or their Clerk publicMetadata is
 *     set via the Clerk Dashboard.
 *
 * TO ADD A NEW TRUSTED STAFF ACCOUNT:
 *   Option A) Add their email to STAFF_EMAILS env var (comma-separated)
 *   Option B) Set publicMetadata.role = "staff" via Clerk Dashboard for
 *             that user's account.
 */

// Trusted Main Administrators (Store Owners)
export const MAIN_ADMIN_EMAILS = [
  "chandanthakurchandan935@gmail.com",
  "joshi.ritiz@gmail.com",
  "ritiz.joshi@gmail.com",
  "joshl.ritiz@gmail.com",
  ...(process.env.MAIN_ADMIN_EMAIL ? [process.env.MAIN_ADMIN_EMAIL.toLowerCase().trim()] : []),
];

export const MAIN_ADMIN_EMAIL = (
  process.env.MAIN_ADMIN_EMAIL || "chandanthakurchandan935@gmail.com"
)
  .toLowerCase()
  .trim();

// Trusted Store Staff Email Roster (server-side only)
export function getAuthorizedStaffEmails(): string[] {
  const envStaff = process.env.STAFF_EMAILS
    ? process.env.STAFF_EMAILS.split(",").map((e) => e.trim().toLowerCase())
    : [];

  // Default known staff desk accounts + any added via environment configuration
  return Array.from(new Set(["staff@lokizone.com.np", ...envStaff]));
}

export type AdminRole = "main" | "normal" | null;

/**
 * Resolves verified admin role from trusted server identity.
 *
 * Called ONLY in server components / middleware with data from Clerk's
 * `currentUser()` — never from client-provided request body.
 *
 * Resolution order:
 *   1. Email matches MAIN_ADMIN_EMAILS → "main"
 *   2. publicMetadata.role is "main" or "admin" → "main"
 *      (publicMetadata is only writable via Clerk Backend API / Dashboard)
 *   3. Email in getAuthorizedStaffEmails() → "normal"
 *   4. publicMetadata.role is "staff" or "normal" → "normal"
 *   5. Everything else → null (no admin access)
 */
export function extractClerkEmail(user: any): string | null {
  if (!user) return null;
  return (
    user.primaryEmailAddress?.emailAddress ||
    user.emailAddresses?.find((e: any) => e.id === user.primaryEmailAddressId)?.emailAddress ||
    user.emailAddresses?.[0]?.emailAddress ||
    (typeof user.email === "string" ? user.email : null) ||
    null
  );
}

export function resolveAdminRole(
  email?: string | null,
  publicMetadataRole?: unknown
): AdminRole {
  const normalized = email ? email.toLowerCase().trim() : "";

  // 1. Main Admin via verified email (highest priority check)
  if (normalized && MAIN_ADMIN_EMAILS.includes(normalized)) {
    return "main";
  }

  // 2. Main Admin via Clerk-managed publicMetadata role
  //    (only the Clerk Dashboard / Backend API can set this)
  if (publicMetadataRole === "main" || publicMetadataRole === "admin") {
    return "main";
  }

  // 3. Authorized Staff via verified email roster
  const staffList = getAuthorizedStaffEmails();
  if (normalized && staffList.includes(normalized)) {
    return "normal";
  }

  // 4. Staff via Clerk-managed publicMetadata role
  if (publicMetadataRole === "staff" || publicMetadataRole === "normal") {
    return "normal";
  }

  return null;
}
