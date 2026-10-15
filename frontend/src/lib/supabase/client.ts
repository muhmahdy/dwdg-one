import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/app/config/env';

let client: SupabaseClient | null = null;

/** The browser's Supabase client. Only the publishable key is ever used here; the service role never reaches the browser. */
export function supabase(): SupabaseClient {
  if (!env.supabaseUrl || !env.supabaseKey) throw new Error('Supabase is not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  client ??= createClient(env.supabaseUrl, env.supabaseKey, { auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true } });
  return client;
}
