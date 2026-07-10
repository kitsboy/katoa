import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, asRow } from '../lib/supabase';
import { nostrService } from '../lib/nostr';
import {
  canUseDemoAuth,
  DEMO_PROFILE,
  DEMO_USER_ID,
  isDemoSessionActive,
  setDemoSessionActive,
} from '../lib/demoAuth';

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  lightning_address: string | null;
  nostr_pubkey: string | null;
  bio: string;
  banner_url: string | null;
  preferred_currency: string | null;
  banner_video_url: string | null;
  profile_video_url: string | null;
  video_title: string | null;
  video_date: string | null;
  social_feed_url: string | null;
  social_feed_title: string | null;
  social_feed_height: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithNostr: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  syncNostrProfile: () => Promise<{ error: Error | null }>;
  signInAsDemo: () => Promise<{ error: Error | null }>;
  isDemoUser: boolean;
  canUseDemoAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);

  function activateDemoSession() {
    const demoUser = {
      id: DEMO_USER_ID,
      email: 'demo@katoa.org',
      app_metadata: {},
      user_metadata: { username: DEMO_PROFILE.username },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as User;

    setDemoSessionActive(true);
    setIsDemoUser(true);
    setUser(demoUser);
    setProfile(DEMO_PROFILE);
    setSession({ user: demoUser } as Session);
    setLoading(false);
  }

  useEffect(() => {
    if (isDemoSessionActive()) {
      activateDemoSession();
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(asRow<Profile>(data));
      } else {
        console.warn('No profile found for user:', userId);
        setProfile(null);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string, username: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username,
          });

        if (profileError) throw profileError;
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await loadProfile(data.user.id);
      }

      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error as Error };
    }
  }

  async function signInWithGoogle() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { error: error as Error };
    }
  }

  async function signInAsDemo() {
    if (!canUseDemoAuth()) {
      return { error: new Error('Demo mode is not available when Supabase is configured') };
    }
    activateDemoSession();
    return { error: null };
  }

  async function signOut() {
    if (isDemoUser || isDemoSessionActive()) {
      setDemoSessionActive(false);
      setIsDemoUser(false);
      setUser(null);
      setProfile(null);
      setSession(null);
      return;
    }
    await supabase.auth.signOut();
  }

  /**
   * Secure Nostr login requires a server-side challenge (NIP-07 signed event → Edge Function → session).
   * Using the public key as a password is an account-takeover risk and is intentionally disabled.
   * Logged-in users can still link Nostr via syncNostrProfile / settings.
   */
  async function signInWithNostr() {
    try {
      if (!window.nostr) {
        throw new Error('Nostr extension not found. Please install a Nostr browser extension like nos2x or Alby.');
      }

      // Prove extension works without creating a weak auth session
      await window.nostr.getPublicKey();

      return {
        error: new Error(
          'Secure Nostr sign-in is not available yet. Use email, Google, or sign in first and link your Nostr key in Settings. (Public-key-as-password auth was removed for security.)'
        ),
      };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async function syncNostrProfile() {
    if (!user || !profile?.nostr_pubkey) {
      return { error: new Error('Not authenticated with Nostr') };
    }

    try {
      const nostrProfile = await nostrService.getProfile(profile.nostr_pubkey);
      if (!nostrProfile) throw new Error('Nostr profile not found');

      const updates = {
        avatar_url: nostrProfile.picture || profile.avatar_url,
        bio: nostrProfile.about || profile.bio,
        lightning_address: nostrProfile.lud16 || nostrProfile.lud06 || profile.lightning_address,
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      await loadProfile(user.id);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!user) {
      console.error('Update profile failed: Not authenticated');
      return { error: new Error('Not authenticated') };
    }

    if (isDemoUser) {
      setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
      return { error: null };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      await loadProfile(user.id);
      return { error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error: error as Error };
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithNostr,
    signOut,
    updateProfile,
    syncNostrProfile,
    signInAsDemo,
    isDemoUser,
    canUseDemoAuth: canUseDemoAuth(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
