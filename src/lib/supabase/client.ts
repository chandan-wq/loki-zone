import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

function getClientEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing required Supabase environment configuration: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  return { url, key };
}

let browserClient: SupabaseClient<Database> | null = null;

/**
 * Creates or returns the singleton Supabase client for browser / client-side execution.
 * Scoped by Row Level Security (RLS) policies.
 */
export function createBrowserClient(): SupabaseClient<Database> {
  if (browserClient) return browserClient;

  const { url, key } = getClientEnv();
  browserClient = createClient<Database>(url, key, {
    auth: {
      persistSession: false,
    },
  });

  return browserClient;
}
