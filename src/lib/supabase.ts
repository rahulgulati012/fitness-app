import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
const supabaseUrl = (env?.VITE_SUPABASE_URL ?? '').trim();
const supabaseKey = (
  env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env?.VITE_SUPABASE_ANON_KEY ||
  ''
).trim();

const hasValidConfig =
  Boolean(supabaseUrl) &&
  Boolean(supabaseKey) &&
  /^https?:\/\//i.test(supabaseUrl) &&
  !supabaseUrl.includes('YOUR_SUPABASE');

export const supabase: SupabaseClient | null = hasValidConfig
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}
