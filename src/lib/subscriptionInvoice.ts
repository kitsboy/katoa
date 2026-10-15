/**
 * Client half of the subscription settlement path.
 *
 * The webhook (`supabase/functions/btcpay-webhook`) is what activates a
 * subscription, and it prices the tier itself from the canonical table. This
 * module builds the metadata it needs and creates the invoice through the
 * server proxy, so the fan pays a real invoice instead of toggling a browser
 * flag. Nothing here unlocks content: only a settled invoice does.
 */

import { getBtcPayService } from './btcpay';
import {
  SUBSCRIPTION_TIER_IDS,
  subscriptionTierSats,
  type SubscriptionTierId,
} from './subscriptions';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface SubscriptionInvoiceRequest {
  /** Creator's profile id (uuid) — the webhook rejects anything else. */
  creatorId: string | null | undefined;
  /** Signed-in supporter's profile id (uuid). */
  subscriberId: string | null | undefined;
  tierId: string;
  creatorSlug?: string;
  /** Overrides the tier price only upward (a supporter may tip on top). */
  bonusSats?: number;
}

export type SubscriptionInvoiceMetadata =
  | { ok: true; amountSats: number; orderId: string; metadata: Record<string, string> }
  | { ok: false; error: string };

const KINDS = new Set<string>(SUBSCRIPTION_TIER_IDS);

/**
 * Validate everything the webhook will re-check server-side. Pure, so the rules
 * are testable without a proxy: a slug is never accepted in place of a uuid, and
 * the amount always comes from the tier table, never from a caller.
 */
export function subscriptionInvoiceMetadata(
  request: SubscriptionInvoiceRequest,
): SubscriptionInvoiceMetadata {
  const creatorId = request.creatorId?.trim() ?? '';
  if (!UUID.test(creatorId)) {
    return { ok: false, error: 'This creator has no payable profile id yet, so a subscription cannot be started.' };
  }

  const subscriberId = request.subscriberId?.trim() ?? '';
  if (!UUID.test(subscriberId)) {
    return { ok: false, error: 'Sign in first — a subscription is recorded against your account.' };
  }

  const tierId = request.tierId.trim().toLowerCase();
  if (!KINDS.has(tierId)) {
    return { ok: false, error: `Unknown tier "${request.tierId}".` };
  }

  const bonus = Number.isFinite(request.bonusSats) ? Math.max(0, Math.round(request.bonusSats ?? 0)) : 0;
  const amountSats = subscriptionTierSats(tierId as SubscriptionTierId) + bonus;

  // Unique per attempt: a reused order id would let an old invoice be replayed.
  const nonce =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8)
      : `${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;

  return {
    ok: true,
    amountSats,
    orderId: `sub-${subscriberId.slice(0, 8)}-${tierId}-${nonce}`,
    metadata: {
      kind: 'subscription',
      tier_id: tierId,
      creator_id: creatorId,
      subscriber_id: subscriberId,
      creator_slug: request.creatorSlug?.trim() ?? '',
      amount_sats: String(amountSats),
    },
  };
}

export interface SubscriptionInvoiceResult {
  ok: boolean;
  /** Where the fan pays. Opened by the caller, never auto-followed. */
  checkoutLink?: string;
  invoiceId?: string;
  amountSats?: number;
  error?: string;
}

/** Create the invoice the webhook will activate once it settles. */
export async function createSubscriptionInvoice(
  request: SubscriptionInvoiceRequest,
): Promise<SubscriptionInvoiceResult> {
  const built = subscriptionInvoiceMetadata(request);
  if (!built.ok) return { ok: false, error: built.error };

  const service = await getBtcPayService();
  if (!service) {
    return {
      ok: false,
      error:
        'Subscriptions need the Lightning invoice proxy, which is not configured on this deployment yet. Nothing was charged and nothing unlocked.',
    };
  }

  try {
    const invoice = await service.createInvoice(
      built.amountSats,
      'SATS',
      built.orderId,
      built.metadata,
    );
    return {
      ok: true,
      checkoutLink: invoice.checkoutLink,
      invoiceId: invoice.id,
      amountSats: built.amountSats,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Could not create the subscription invoice.',
    };
  }
}
