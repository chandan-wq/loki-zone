import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

function getServerEnv() {
  if (typeof window !== "undefined") {
    throw new Error(
      "Security Violation: createAdminClient cannot be executed in browser environments."
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error(
      "Missing environment variable: NEXT_PUBLIC_SUPABASE_URL. Please verify your .env.local configuration."
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "Missing environment variable: SUPABASE_SERVICE_ROLE_KEY. This server-only secret is required for backend operations."
    );
  }

  return { url, serviceRoleKey };
}

/**
 * Server-only Supabase client initialized with the service-role secret key.
 * Used exclusively inside Server Actions, Route Handlers, and Server Components
 * for privileged operations (order processing, stock updates, admin workflows).
 *
 * This client bypasses RLS and must NEVER be imported into or executed within
 * client-side components ("use client").
 */
export function createAdminClient(): SupabaseClient<any> {
  const { url, serviceRoleKey } = getServerEnv();

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
