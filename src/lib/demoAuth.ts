import { isSupabaseConfigured } from './supabase';

export const DEMO_SESSION_KEY = 'katoa-demo-session';

export const DEMO_USER_ID = '00000000-0000-4000-a000-000000000001';

export const DEMO_PROFILE = {
  id: DEMO_USER_ID,
  username: 'demo_creator',
  avatar_url: null as string | null,
  lightning_address: 'demo@getalby.com',
  nostr_pubkey: null as string | null,
  bio: 'Preview account — explore the Katoa dashboard before Supabase is connected.',
  banner_url: null as string | null,
  preferred_currency: 'USD' as string | null,
  banner_video_url: null as string | null,
  profile_video_url: null as string | null,
  video_title: null as string | null,
  video_date: null as string | null,
  social_feed_url: null as string | null,
  social_feed_title: null as string | null,
  social_feed_height: null as string | null,
};

/** UI preview when Supabase is not live, or VITE_DEMO_MODE=true */
export function canUseDemoAuth(): boolean {
  return import.meta.env.VITE_DEMO_MODE === 'true' || !isSupabaseConfigured();
}

export function isDemoSessionActive(): boolean {
  return sessionStorage.getItem(DEMO_SESSION_KEY) === '1';
}

export function setDemoSessionActive(active: boolean): void {
  if (active) {
    sessionStorage.setItem(DEMO_SESSION_KEY, '1');
  } else {
    sessionStorage.removeItem(DEMO_SESSION_KEY);
  }
}