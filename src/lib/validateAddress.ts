/** Payment address validation helpers for Lightning, on-chain Bitcoin, and related identifiers. */

/** Strip bitcoin: / lightning: URI wrappers (QR paste) before validate/save. */
export function decodePaymentUri(raw: string): string {
  const trimmed = raw.trim();
  const match = /^(bitcoin|lightning):(?:\/\/)?(.+)$/i.exec(trimmed);
  if (!match) return trimmed;
  const rest = match[2] ?? '';
  const withoutQuery = rest.split('?')[0] ?? '';
  try {
    return decodeURIComponent(withoutQuery);
  } catch {
    return withoutQuery;
  }
}

export function validateLightningAddress(address: string): string | null {
  const trimmed = decodePaymentUri(address);
  if (!trimmed) return 'Address is required';

  const lower = trimmed.toLowerCase();
  if (trimmed.includes('@')) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return 'Enter a valid Lightning address (user@domain.com)';
    }
    return null;
  }
  if (lower.startsWith('lnurl')) return null;
  if (lower.startsWith('lnbc') || lower.startsWith('lntb')) return null;
  return 'Lightning must be lnbc/lntb, lnurl, or a Lightning address (user@domain)';
}

export function validateBitcoinAddress(address: string): string | null {
  const trimmed = decodePaymentUri(address);
  if (!trimmed) return 'Address is required';
  if (!/^(bc1|tb1|[13])/.test(trimmed)) {
    return 'Bitcoin address must start with bc1, tb1, 1, or 3';
  }
  if (trimmed.length < 26 || trimmed.length > 90) {
    return 'Bitcoin address must be between 26 and 90 characters';
  }
  return null;
}

export function validateXpub(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Address is required';
  if (!/^(xpub|ypub|zpub|tpub|vpub|upub)/i.test(trimmed)) {
    return 'Extended public key must start with xpub, ypub, zpub, tpub, vpub, or upub';
  }
  if (trimmed.length < 20) return 'Extended public key looks too short';
  return null;
}

export function validateNpub(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Address is required';
  if (!trimmed.toLowerCase().startsWith('npub1')) {
    return 'Nostr public key must start with npub1';
  }
  if (trimmed.length < 20) return 'Nostr public key looks too short';
  return null;
}

export function validatePynym(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Address is required';
  if (!trimmed.startsWith('PM8T')) {
    return 'PYNYM payment code must start with PM8T';
  }
  return null;
}

export type WalletAddressKind = 'lightning' | 'xpub' | 'pynym' | 'nostr' | 'onchain';

export function validateWalletAddress(
  addressType: WalletAddressKind,
  addressValue: string
): string | null {
  const trimmed = decodePaymentUri(addressValue);
  if (!trimmed) return 'Address is required';

  switch (addressType) {
    case 'lightning':
      return validateLightningAddress(trimmed);
    case 'onchain':
      return validateBitcoinAddress(trimmed);
    case 'xpub':
      return validateXpub(trimmed);
    case 'nostr':
      return validateNpub(trimmed);
    case 'pynym':
      return validatePynym(trimmed);
    default:
      return null;
  }
}
