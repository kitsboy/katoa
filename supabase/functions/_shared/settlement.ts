/**
 * Family Payment Core — shared settlement logic.
 *
 * Pure and provider-agnostic on purpose: the Edge Function does I/O (verify,
 * look up, write) and these functions decide *what* the event means. Keeping the
 * decisions here is what makes them testable without deploying anything, and it
 * is where the rules that protect money live:
 *
 * - an unsettled event never writes.
 * - a subscription's price is taken from the canonical tier table, never from
 *   the client's metadata.
 * - funding totals are recomputed from confirmed rows, never added to.
 */

/* ------------------------------------------------------------------ */
/* Event parsing                                                       */
/* ------------------------------------------------------------------ */

const SETTLED_EVENT_TYPES = new Set(["InvoiceSettled", "InvoicePaymentSettled"]);

export const CONFIRMED_STATUSES = ["confirmed", "completed", "paid"] as const;

export const PAYMENT_KINDS = ["gift", "tip", "subscription", "ppv", "zap"] as const;
export type PaymentKind = (typeof PAYMENT_KINDS)[number];

export interface SettlementContext {
  /** Provider event type, if the payload named one. */
  type: string | null;
  /** Provider event id — the idempotency key for the payment event ledger. */
  eventId: string | null;
  settled: boolean;
  invoiceId: string | null;
  /** Row id or intent id the payload points at. */
  reference: string | null;
  /** On-chain transaction id, when the provider supplied one. */
  txid: string | null;
  metadata: Record<string, unknown>;
  kind: PaymentKind;
  /** Amount the provider says was paid, rounded to whole sats. */
  providerAmountSats: number | null;
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

/** Whole positive sats, or null. Never returns a partial or negative number. */
export function positiveSats(value: unknown): number | null {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n);
}

export function isConfirmedStatus(status: string | null | undefined): boolean {
  if (!status) return false;
  return (CONFIRMED_STATUSES as readonly string[]).includes(status.toLowerCase());
}

/** Provided metadata may only narrow a match, never widen it. */
export function matchesReference(value: unknown, expected: string | null): boolean {
  if (value == null || expected == null) return true;
  return String(value) === expected;
}

function normalizeKind(value: unknown): PaymentKind {
  const raw = asString(value)?.toLowerCase();
  return (PAYMENT_KINDS as readonly string[]).includes(raw ?? "")
    ? (raw as PaymentKind)
    : "gift";
}

export function parseSettlement(payload: unknown): SettlementContext {
  const root = asRecord(payload);
  const metadata = asRecord(root.metadata);
  const type = asString(root.type);
  const invoiceStatus = asString(root.invoiceStatus);
  const invoiceId = asString(root.invoiceId) ?? asString(root.invoice_id);

  const reference =
    asString(metadata.katoa_tx_id) ??
    asString(metadata.transactionId) ??
    asString(metadata.transaction_id) ??
    asString(root.orderId) ??
    asString(root.order_id) ??
    asString(metadata.orderId) ??
    asString(metadata.order_id) ??
    invoiceId;

  const txid =
    normalizeTxid(metadata.txid) ??
    normalizeTxid(metadata.tx_id) ??
    normalizeTxid(root.txid) ??
    normalizeTxid(asRecord(root.invoice).transactionId);

  return {
    type,
    eventId: asString(root.id) ?? asString(root.eventId),
    settled: (type != null && SETTLED_EVENT_TYPES.has(type)) || invoiceStatus === "Settled",
    invoiceId,
    reference,
    txid,
    metadata,
    kind: normalizeKind(metadata.kind),
    providerAmountSats:
      positiveSats(metadata.amount_sats) ??
      positiveSats(metadata.amountSats) ??
      positiveSats(root.amount_sats) ??
      positiveSats(root.amountSats),
  };
}

/** Lowercase 64-hex on-chain txid, or null (never a truncated or bogus value). */
export function normalizeTxid(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  return /^[0-9a-f]{64}$/.test(trimmed) ? trimmed : null;
}

/* ------------------------------------------------------------------ */
/* Signature                                                           */
/* ------------------------------------------------------------------ */

/** BTCPay sends `sha256=<hex hmac of the raw body>`. */
export async function btcpaySignature(
  secret: string,
  rawBody: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  return `sha256=${[...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("")}`;
}

export function timingSafeEqual(a: string, b: string): boolean {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  if (left.byteLength !== right.byteLength) return false;
  let out = 0;
  for (let i = 0; i < left.byteLength; i += 1) out |= left[i] ^ right[i];
  return out === 0;
}

/* ------------------------------------------------------------------ */
/* Subscriptions                                                       */
/* ------------------------------------------------------------------ */

/**
 * Canonical tier prices. The webhook prices a subscription from here, never from
 * the payload, so a supporter cannot buy the top tier for 1 sat.
 * Guarded against drift with `src/lib/subscriptions.ts` by a test.
 */
export const TIER_PRICES_SATS: Record<string, number> = {
  supporter: 21000,
  patron: 42000,
  champion: 105000,
};

/** Term of a paid tier, in days. One term per tier for now (monthly). */
export const SUBSCRIPTION_TERM_DAYS = 30;

export function tierPriceSats(tierId: string): number | null {
  return TIER_PRICES_SATS[tierId] ?? null;
}

export function subscriptionActiveUntil(now: Date, termDays = SUBSCRIPTION_TERM_DAYS): string {
  return new Date(now.getTime() + termDays * 86_400_000).toISOString();
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* ------------------------------------------------------------------ */
/* Pay-per-view unlocks                                                */
/* ------------------------------------------------------------------ */

export type PpvActivation =
  | { ok: true; fanId: string; creatorId: string; postKey: string; priceSats: number }
  | { ok: false; reason: string };

/**
 * Decide whether a settled payment unlocks one post.
 *
 * The price is taken from the invoice metadata but must be met by the settled
 * amount, so a cheap invoice cannot unlock expensive media. The unlock row is
 * keyed on (fan, post), which makes a replayed invoice harmless.
 */
export function ppvActivation(
  metadata: Record<string, unknown>,
  providerAmountSats: number | null,
): PpvActivation {
  const fanId =
    asString(metadata.subscriber_id) ??
    asString(metadata.subscriberId) ??
    asString(metadata.fan_id) ??
    asString(metadata.fanId);
  if (!fanId || !UUID.test(fanId)) return { ok: false, reason: "missing or invalid fan id" };

  const creatorId = asString(metadata.creator_id) ?? asString(metadata.creatorId);
  if (!creatorId || !UUID.test(creatorId)) return { ok: false, reason: "missing or invalid creator id" };

  const postKey = asString(metadata.post_key) ?? asString(metadata.postKey);
  if (!postKey || postKey.length > 200) return { ok: false, reason: "missing or invalid post key" };

  const price = positiveSats(metadata.price_sats) ?? positiveSats(metadata.priceSats);
  if (price == null) return { ok: false, reason: "invoice has no price" };

  if (providerAmountSats == null) return { ok: false, reason: "missing settled amount" };
  if (providerAmountSats < price) {
    return { ok: false, reason: `underpaid unlock: ${providerAmountSats} < ${price}` };
  }

  return { ok: true, fanId, creatorId, postKey, priceSats: price };
}

export type SubscriptionActivation =
  | {
      ok: true;
      creatorId: string;
      tierId: string;
      priceSats: number;
      activeUntil: string;
    }
  | { ok: false; reason: string };

/**
 * Decide whether a settled payment activates a subscription.
 *
 * Requires a creator id, a known tier and an amount that covers the tier price.
 * Overpayment activates the tier (a supporter may tip on top); underpayment does
 * not, because that would sell the tier for less than it costs.
 */
export function subscriptionActivation(
  metadata: Record<string, unknown>,
  providerAmountSats: number | null,
  now: Date = new Date(),
): SubscriptionActivation {
  const creatorId =
    asString(metadata.creator_id) ?? asString(metadata.creatorId) ?? asString(metadata.creator);
  if (!creatorId) return { ok: false, reason: "missing creator id" };
  if (!UUID.test(creatorId)) return { ok: false, reason: "creator id is not a uuid" };

  const tierId =
    asString(metadata.tier_id) ?? asString(metadata.tierId) ?? asString(metadata.tier);
  if (!tierId) return { ok: false, reason: "missing tier id" };

  const price = tierPriceSats(tierId);
  if (price == null) return { ok: false, reason: `unknown tier: ${tierId}` };

  if (providerAmountSats == null) return { ok: false, reason: "missing settled amount" };
  if (providerAmountSats < price) {
    return { ok: false, reason: `underpaid tier: ${providerAmountSats} < ${price}` };
  }

  return { ok: true, creatorId, tierId, priceSats: price, activeUntil: subscriptionActiveUntil(now) };
}
