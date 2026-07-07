/** Payment address validation helpers for Lightning and on-chain Bitcoin. */

export function validateLightningAddress(address: string): string | null {
  const trimmed = address.trim();
  if (!trimmed) return 'Address is required';

  const lower = trimmed.toLowerCase();
  if (trimmed.includes('@')) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return 'Enter a valid Lightning address (user@domain.com)';
    }
    return null;
  }
  if (lower.startsWith('lnurl')) return null;
  if (lower.startsWith('lnbc') || lower.startsWith('ln')) return null;
  return 'Lightning invoice must start with ln or lnbc, or use a Lightning address';
}

export function validateBitcoinAddress(address: string): string | null {
  const trimmed = address.trim();
  if (!trimmed) return 'Address is required';
  if (trimmed.length < 26 || trimmed.length > 90) {
    return 'Bitcoin address must be between 26 and 90 characters';
  }
  return null;
}