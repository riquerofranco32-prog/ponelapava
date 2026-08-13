import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Public client — safe for reads, respects Row Level Security.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin client — bypasses RLS with the service role key. Server-only:
// never import this from a "use client" component or route that ships
// to the browser.
export function supabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createClient(SUPABASE_URL, serviceKey);
}
