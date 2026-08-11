import { describe, it, expect } from 'vitest';
import {
  DEFAULT_RELAYS,
  LEGACY_RELAYS,
  NostrService,
  hasNip07,
  nip07UserMessage,
  PLATFORM_PUBKEY_HEX,
} from '../nostr';
import type { Event } from 'nostr-tools';

describe('NostrService config', () => {
  it('keeps all legacy relays in defaults', () => {
    for (const r of LEGACY_RELAYS) {
      expect(DEFAULT_RELAYS).toContain(r);
    }
  });

  it('platform pubkey is 64 hex chars', () => {
    expect(PLATFORM_PUBKEY_HEX).toMatch(/^[0-9a-f]{64}$/);
  });

  it('hasNip07 false in node', () => {
    expect(hasNip07()).toBe(false);
  });
});

describe('validateZapReceipt', () => {
  const svc = new NostrService();

  it('rejects non-9735', () => {
    const ev = { kind: 1, tags: [], content: '', pubkey: 'a', id: 'x', sig: '', created_at: 1 } as Event;
    expect(svc.validateZapReceipt(ev).valid).toBe(false);
  });

  it('parses amount from description 9734', () => {
    const request = {
      kind: 9734,
      pubkey: 'senderhex',
      created_at: 1,
      tags: [
        ['p', 'recipienthex'],
        ['amount', '21000000'],
      ],
      content: '',
      id: 'req',
      sig: 's',
    };
    const receipt = {
      kind: 9735,
      pubkey: 'wallet',
      created_at: 2,
      tags: [
        ['p', 'recipienthex'],
        ['bolt11', 'lnbc1…'],
        ['description', JSON.stringify(request)],
      ],
      content: '',
      id: 'rcpt',
      sig: 's',
    } as Event;
    const v = svc.validateZapReceipt(receipt);
    expect(v.valid).toBe(true);
    expect(v.amountSats).toBe(21000);
    expect(v.recipient).toBe('recipienthex');
    expect(v.sender).toBe('senderhex');
  });
});

describe('nip07UserMessage', () => {
  it('guides missing extension', () => {
    expect(nip07UserMessage(new Error('Nostr extension not found'))).toMatch(/Alby|nos2x|extension/i);
  });
});
