import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Read-only public client for the /instruments demo, backed by a separate
 * Supabase project from the one in src/lib/server/supabaseClient.ts. Uses the
 * publishable/anon key, so this is safe to import from client components too.
 */
let client: SupabaseClient | null | undefined;

export function getSupabasePublicClient(): SupabaseClient | null {
  if (client !== undefined) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    client = null;
    return client;
  }

  client = createClient(url, publishableKey);
  return client;
}
