import { describe, expect, it } from 'vitest';
import { authCallbackError, googleRedirectTo, postAuthPath, safeNextPath } from '../authSecurity';
import { NOSTR_AUTH_KIND, buildNostrAuthEvent, safeAuthDomain } from '../nostrAuth';

describe('auth security helpers', () => {
  it('allows only internal post-login paths', () => {
    expect(safeNextPath('?next=%2Fsettings')).toBe('/settings');
    expect(safeNextPath('?next=https%3A%2F%2Fevil.example')).toBeNull();
    expect(safeNextPath('?next=%2F%2Fevil.example')).toBeNull();
    expect(postAuthPath('?next=%2Fdashboard')).toBe('/dashboard');
  });

  it('keeps Google OAuth redirects on the auth callback route', () => {
    expect(googleRedirectTo('https://katoa.org', '?next=%2Fsettings')).toBe('https://katoa.org/auth?next=%2Fsettings');
    expect(googleRedirectTo('https://katoa.org', '')).toBe('https://katoa.org/auth');
  });

  it('extracts callback errors without preserving them in the URL', () => {
    expect(authCallbackError('?error=access_denied&error_description=Nope')).toBe('Nope');
    expect(authCallbackError('')).toBeNull();
  });

  it('constructs a short-lived domain-bound NIP-42 event', () => {
    const event = buildNostrAuthEvent({ challenge: 'abc', domain: 'katoa.org', relay: 'wss://relay.example', now: 1000 });
    expect(event.kind).toBe(NOSTR_AUTH_KIND);
    expect(event.content).toBe('Sign in to KATOA');
    expect(event.tags).toContainEqual(['challenge', 'abc']);
    expect(event.tags).toContainEqual(['domain', 'katoa.org']);
    expect(event.tags).toContainEqual(['expiration', '1300']);
    expect(safeAuthDomain({ hostname: 'localhost', host: 'localhost:5173' })).toBe('localhost:5173');
  });
});
