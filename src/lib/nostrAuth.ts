import type { Event, UnsignedEvent } from 'nostr-tools';
import { supabase } from './supabase';

export const NOSTR_AUTH_KIND = 22242;
export const NOSTR_AUTH_TTL_SECONDS = 5 * 60;

export interface NostrAuthChallenge {
  challenge: string;
  expires_at: string;
  relay?: string;
}

export interface NostrAuthVerification {
  token_hash: string;
  user_id?: string;
  is_new_user?: boolean;
}

export function safeAuthDomain(locationLike: Pick<Location, 'hostname' | 'host'> = window.location): string {
  return locationLike.hostname === 'localhost' || locationLike.hostname === '127.0.0.1'
    ? locationLike.host
    : locationLike.hostname;
}

export function buildNostrAuthEvent({
  challenge,
  domain = safeAuthDomain(),
  relay,
  now = Math.floor(Date.now() / 1000),
}: {
  challenge: string;
  domain?: string;
  relay?: string;
  now?: number;
}): UnsignedEvent {
  const tags: string[][] = [
    ['challenge', challenge],
    ['domain', domain],
    ['expiration', String(now + NOSTR_AUTH_TTL_SECONDS)],
  ];
  if (relay) tags.push(['relay', relay]);
  return {
    kind: NOSTR_AUTH_KIND,
    created_at: now,
    tags,
    content: 'Sign in to KATOA',
    pubkey: '',
  };
}

export async function requestNostrAuthChallenge(username?: string): Promise<NostrAuthChallenge> {
  const { data, error } = await supabase.functions.invoke('nostr-auth-challenge', {
    body: {
      action: 'challenge',
      domain: safeAuthDomain(),
      username: username?.trim() || undefined,
    },
  });
  if (error) throw error;
  const result = data as Partial<NostrAuthChallenge> | null;
  if (!result?.challenge || !result.expires_at) throw new Error('Nostr challenge was incomplete');
  return {
    challenge: result.challenge,
    expires_at: result.expires_at,
    relay: result.relay,
  };
}

export async function verifyNostrAuthEvent(event: Event, username?: string): Promise<NostrAuthVerification> {
  const { data, error } = await supabase.functions.invoke('nostr-auth-challenge', {
    body: {
      action: 'verify',
      domain: safeAuthDomain(),
      username: username?.trim() || undefined,
      event,
    },
  });
  if (error) throw error;
  const result = data as Partial<NostrAuthVerification> | null;
  if (!result?.token_hash) throw new Error('Nostr verification did not return a session token');
  return {
    token_hash: result.token_hash,
    user_id: result.user_id,
    is_new_user: result.is_new_user,
  };
}

export async function signInWithNostrChallenge(username?: string): Promise<{ userId?: string; isNewUser?: boolean }> {
  if (typeof window === 'undefined' || !window.nostr) {
    throw new Error('Install a Nostr extension such as Alby or nos2x. KATOA never asks for your private key.');
  }
  const challenge = await requestNostrAuthChallenge(username);
  const unsigned = buildNostrAuthEvent({
    challenge: challenge.challenge,
    relay: challenge.relay,
  });
  const signed = await window.nostr.signEvent(unsigned);
  const verification = await verifyNostrAuthEvent(signed, username);
  const { error } = await supabase.auth.verifyOtp({
    type: 'magiclink',
    token_hash: verification.token_hash,
  });
  if (error) throw error;
  return {
    userId: verification.user_id,
    isNewUser: verification.is_new_user,
  };
}
