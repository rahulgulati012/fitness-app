import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const metaEnv: Record<string, string | undefined> = (import.meta as any).env ?? {};

const supabaseUrl: string = (
  metaEnv.VITE_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  ''
).trim();

const supabaseKey: string = (
  metaEnv.VITE_SUPABASE_PUBLISHABLE_KEY ||
  metaEnv.VITE_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
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

export function getSupabaseConfigDiagnostics(): string {
  if (supabase !== null) {
    return 'Supabase client initialized.';
  }
  const missing: string[] = [];
  if (!supabaseUrl) missing.push('VITE_SUPABASE_URL');
  if (!supabaseKey) missing.push('VITE_SUPABASE_PUBLISHABLE_KEY');
  if (missing.length > 0) {
    return `Missing env var(s): ${missing.join(', ')}`;
  }
  return 'Invalid VITE_SUPABASE_URL format (must start with https://).';
}
