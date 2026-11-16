import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const env = (import.meta as any).env;
const supabaseUrl: string = (env?.VITE_SUPABASE_URL ?? '').trim();
const supabaseKey: string = (
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
