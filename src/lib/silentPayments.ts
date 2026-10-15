/**
 * Silent-payment (BIP352) facts used by the supporter handoff.
 *
 * Katoa is receive-only on this rail: it can show an `sp1…` address, but it can
 * never build an invoice, and no webhook can confirm the payment. These facts
 * live here (not in the component) so the copy and its test read the same list.
 */

/**
 * Wallets able to *send* to an `sp1…` address as of mid-2026. Kept as data so a
 * support change is one edit; the community support list is the source.
 */
export const SILENT_PAYMENT_SEND_WALLETS = [
  'Cake Wallet',
  'Sparrow',
  'Nunchuk',
  'Silentium',
  'BitBox02',
  'Wasabi',
] as const;

/** Community-maintained wallet support list (BIP352). */
export const SILENT_PAYMENT_SUPPORT_LIST_URL = 'https://silentpayments.xyz/';

/** Human sentence for the wallet requirement, used in UI copy and tests. */
export function silentPaymentWalletSentence(): string {
  return `Your wallet must support silent payments. Those that do today include ${SILENT_PAYMENT_SEND_WALLETS.join(', ')}. If your send screen rejects the address, it cannot pay this rail.`;
}
