import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

let supabase: SupabaseClient<Database>;

try {
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
} catch {
  supabase = createClient<Database>('https://placeholder.supabase.co', 'placeholder');
}

export { supabase };
export type { Database };

/** True when a real Supabase project is configured (not placeholder). */
export function isSupabaseConfigured(): boolean {
  return (
    !supabaseUrl.includes('placeholder') &&
    supabaseAnonKey !== 'placeholder-key' &&
    Boolean(import.meta.env.VITE_SUPABASE_URL)
  );
}