import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Create client — will gracefully handle missing Supabase project
// The client object always exists. Queries will fail with network errors
// instead of crashing the entire app.
let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch {
  // createClient might throw if URL is malformed
  supabase = createClient('https://placeholder.supabase.co', 'placeholder');
}

export { supabase };