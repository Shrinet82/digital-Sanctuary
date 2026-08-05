import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client (used in Client Components).
 * Reads public env vars injected at build/runtime by Vercel.
 * Safe to import anywhere client-side; does not run during static build.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
