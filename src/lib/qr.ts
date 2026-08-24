import { isDummyPaymentTarget } from './validateAddress';

export { isDummyPaymentTarget } from './validateAddress';

/** Client-side QR via Google Charts API (no extra npm dependency). */
export function getQrImageUrl(data: string, size = 300): string {
  const payload = data.trim();
  if (!payload || isDummyPaymentTarget(payload)) return '';
  const encoded = encodeURIComponent(payload);
  return `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encoded}&choe=UTF-8&chld=H|1`;
}

/** BIP-21 `bitcoin:` URI. `amount` is BTC (not sats). Empty if the address is dummy/missing. */
export function bitcoinQrData(address: string, amountSats?: number): string {
  const trimmed = address.trim();
  if (!trimmed || isDummyPaymentTarget(trimmed)) return '';
  if (amountSats != null && amountSats > 0) {
    const btc = amountSats / 100_000_000;
    const amount = btc.toFixed(8).replace(/\.?0+$/, '');
    return `bitcoin:${trimmed}?amount=${amount}`;
  }
  return `bitcoin:${trimmed}`;
}

export function lightningQrData(invoice: string): string {
  const trimmed = invoice.trim();
  if (!trimmed || isDummyPaymentTarget(trimmed)) return '';
  if (
    trimmed.startsWith('lightning:') ||
    trimmed.startsWith('bitcoin:') ||
    trimmed.startsWith('lnurl:')
  ) {
    return trimmed;
  }
  return `lightning:${trimmed}`;
}

export function isBolt11Invoice(value: string): boolean {
  const v = value.trim().replace(/^lightning:/i, '');
  return /^(lnbc|lntbs|lntb|lnbcrt)/i.test(v);
}

export interface WalletChip {
  name: string;
  href: string;
  /** `uri` opens a wallet scheme; `web` is an invoice handler page (not a homepage). */
  kind: 'uri' | 'web';
}

/** Wallets that can actually consume `paymentUri`. Homepage-only chips (WoS, empty muun://) are omitted. */
export function buildWalletDeepLinks(paymentUri: string): WalletChip[] {
  const raw = paymentUri.trim();
  if (!raw) return [];

  const withScheme =
    raw.startsWith('lightning:') || raw.startsWith('bitcoin:') || raw.startsWith('lnurl:')
      ? raw
      : lightningQrData(raw);

  const bolt11 = withScheme.replace(/^lightning:/i, '');
  const chips: WalletChip[] = [];

  if (isBolt11Invoice(withScheme)) {
    chips.push({
      name: 'Phoenix',
      href: `https://phoenix.acinq.co/invoice?data=${encodeURIComponent(bolt11)}`,
      kind: 'web',
    });
    chips.push({
      name: 'Zeus',
      href: `zeusln://send?invoice=${encodeURIComponent(bolt11)}`,
      kind: 'uri',
    });
  }

  if (withScheme.startsWith('bitcoin:')) {
    chips.push({ name: 'Muun', href: withScheme, kind: 'uri' });
  }

  return chips;
}

export function defaultWalletHref(paymentUri: string): string {
  const raw = paymentUri.trim();
  if (!raw) return '';
  if (raw.startsWith('lightning:') || raw.startsWith('bitcoin:') || raw.startsWith('lnurl:')) return raw;
  return lightningQrData(raw);
}