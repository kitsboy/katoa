import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (import.meta.env.DEV && (supabaseUrl.includes('placeholder') || supabaseAnonKey === 'placeholder-key')) {
  console.warn('[KATOA] Supabase is using placeholder config — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
}

let supabase: SupabaseClient<Database>;

try {
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
} catch {
  supabase = createClient<Database>('https://placeholder.supabase.co', 'placeholder');
}

export { supabase };
export type { Database };

/** Coerce Supabase row data when generic inference is incomplete. */
export function asRow<T>(data: unknown): T | null {
  return (data ?? null) as T | null;
}

export function asRows<T>(data: unknown): T[] {
  return (data ?? []) as T[];
}

/** True when a real Supabase project is configured (not placeholder). */
export function isSupabaseConfigured(): boolean {
  return (
    !supabaseUrl.includes('placeholder') &&
    supabaseAnonKey !== 'placeholder-key' &&
    Boolean(import.meta.env.VITE_SUPABASE_URL)
  );
}