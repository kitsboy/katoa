/**
 * Payment labelling — Cam mandate (2026-09-18).
 *
 * Every BTC/Lightning payment received must be labelled clearly and UNIQUELY
 * per site (OpenStrata ≠ MotoPass ≠ Satohash ≠ Stranded ≠ Tadbuy …), on-chain
 * and in the ledger. No shared/generic labels. A demo payment and a real
 * payment must never look the same.
 *
 * These prefix codes are baked into the rails + ledger design so that a
 * payments observer can tell at a glance which product a payment belongs to.
 */

/**
 * Canonical per-site prefix codes. Additive only — never reuse or repurpose a
 * code, or historical labels become ambiguous.
 */
export const SITE_PREFIX_CODES = {
  giveabit: 'ga',
  satohash: 'sh',
  stranded: 'sd',
  sherpacarta: 'sc',
  openstrata: 'os',
  tadbuy: 'tb',
  katoa: 'ka',
  motopass: 'mp',
  hq: 'hq',
  admin: 'ad', // internal, not a customer property
} as const;

/**
 * One income stream per product. A new service is one new row — never reuse a
 * prefix, wallet id, or UTXO set. When a real node is attached later, these
 * names map to that node's own wallet:
 *   LNbits wallet id, BTCPay store label, LND account, or Core wallet label.
 * HQ does not receive. Demo labels must never land in a live UTXO set.
 */
export const INCOME_STREAMS = {
  giveabit: { walletId: 'giveabit_main', utxoSet: 'utxo:giveabit', plug: 'lnaddress', receives: true },
  satohash: { walletId: 'satohash', utxoSet: 'utxo:satohash', plug: 'satohash', receives: true },
  stranded: { walletId: 'stranded', utxoSet: 'utxo:stranded', plug: 'lnaddress', receives: true },
  sherpacarta: { walletId: 'sherpacarta', utxoSet: 'utxo:sherpacarta', plug: 'lnaddress', receives: true },
  openstrata: { walletId: 'openstrata', utxoSet: 'utxo:openstrata', plug: 'lnaddress', receives: true },
  tadbuy: { walletId: 'tadbuy', utxoSet: 'utxo:tadbuy', plug: 'lnaddress', receives: true },
  katoa: { walletId: 'katoa', utxoSet: 'utxo:katoa', plug: 'btcpay', receives: true },
  motopass: { walletId: 'motopass', utxoSet: 'utxo:motopass', plug: 'lnaddress', receives: true },
  hq: { walletId: null, utxoSet: null, plug: null, receives: false },
  admin: { walletId: null, utxoSet: null, plug: null, receives: false },
} as const;

export type SiteName = keyof typeof SITE_PREFIX_CODES;
export type IncomeStream = (typeof INCOME_STREAMS)[SiteName];

export type PaymentKind = 'gift' | 'subscription' | 'donation' | 'merch' | 'internal';

/** Adds uniqueness beyond the site so demo vs real never collide. */
export const KIND_CODES: Record<PaymentKind, string> = {
  gift: 'g',
  subscription: 's',
  donation: 'd',
  merch: 'm',
  internal: 'i',
};

export class LabellingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LabellingError';
  }
}

export interface LabelInput {
  site: SiteName;
  kind: PaymentKind;
  /** Counter / short local id within the site+kind. */
  seq: number | string;
  /** Marks this as a demo fixture so it can never look like a real payment. */
  demo?: boolean;
}

/**
 * Build a reference code for a payment. Format:
 *   <site><kind><seq>  (live)   e.g. ka-g-000123
 *   <site><kind><seq>-demo     (demo) e.g. ka-g-000123-demo
 *
 * The `-demo` suffix is deliberately garish/obvious so a demo fixture can
 * never be mistaken for a settled real payment in the ledger or on-chain.
 */
export function referenceCodeFor(input: LabelInput): string {
  const siteCode = SITE_PREFIX_CODES[input.site];
  if (!siteCode) {
    throw new LabellingError(`Unknown site code for "${String(input.site)}"`);
  }
  const kindCode = KIND_CODES[input.kind] ?? 'x';
  const seq = String(input.seq).padStart(6, '0');
  const base = `${siteCode}-${kindCode}-${seq}`;
  return input.demo ? `${base}-demo` : base;
}

/** Read back whether a reference code is a demo fixture. */
export function isDemoReference(code: string): boolean {
  return /-demo$/.test(code);
}

/** Convenience for the common "is this code unique per site" sanity check. */
export function siteOfReference(code: string): SiteName | null {
  const head = code.split(/[-_]/)[0]?.toLowerCase();
  for (const [site, prefix] of Object.entries(SITE_PREFIX_CODES)) {
    if (head === prefix || head === `${prefix}-`) return site as SiteName;
  }
  return null;
}

/** The canonical label that must appear on-chain and in the ledger. */
export function paymentLabel(input: LabelInput): string {
  const code = referenceCodeFor(input);
  const name = String(input.site).toUpperCase();
  return input.demo ? `${name}-DEMO ${code}` : `${name} ${code}`;
}

/** Where this site's income lands. Throws if the site cannot receive. */
export function incomeStreamFor(site: SiteName): IncomeStream {
  const row = INCOME_STREAMS[site];
  if (!row) throw new LabellingError(`Unknown income stream for "${String(site)}"`);
  if (!row.receives || !row.walletId || !row.utxoSet) {
    throw new LabellingError(`${String(site)} does not receive payments`);
  }
  return row;
}

/** Fail if two products would share a wallet, a UTXO set, or a prefix. */
export function assertUniqueIncomeStreams(): void {
  const wallets = new Set<string>();
  const utxoSets = new Set<string>();
  const prefixes = new Set<string>();
  for (const [site, row] of Object.entries(INCOME_STREAMS) as Array<[SiteName, IncomeStream]>) {
    const prefix = SITE_PREFIX_CODES[site];
    if (prefixes.has(prefix)) throw new LabellingError(`Prefix reused: ${prefix}`);
    prefixes.add(prefix);
    if (!row.receives) continue;
    if (!row.walletId || !row.utxoSet) {
      throw new LabellingError(`${site} is marked receiving but has no wallet or UTXO set`);
    }
    if (wallets.has(row.walletId)) throw new LabellingError(`Wallet reused: ${row.walletId}`);
    if (utxoSets.has(row.utxoSet)) throw new LabellingError(`UTXO set reused: ${row.utxoSet}`);
    wallets.add(row.walletId);
    utxoSets.add(row.utxoSet);
  }
}
