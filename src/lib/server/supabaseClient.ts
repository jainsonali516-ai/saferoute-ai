import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client. Never import this from a client component —
 * it reads SUPABASE_SERVICE_ROLE_KEY, which bypasses row-level security and
 * must never reach the browser.
 *
 * Returns null when SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY aren't set, so
 * every store built on top of this can fall back to its in-memory DEMO MODE
 * implementation instead of throwing.
 */
let client: SupabaseClient | null | undefined;

export function getSupabaseClient(): SupabaseClient | null {
  if (client !== undefined) return client;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    client = null;
    return client;
  }

  client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
