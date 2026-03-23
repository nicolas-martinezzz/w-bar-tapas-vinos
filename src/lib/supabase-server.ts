import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client using the service role key (bypasses RLS).
 * Never import this module from client components.
 */
export function createServiceRoleClient(): SupabaseClient {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://laosyreravqnonxicxwe.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
