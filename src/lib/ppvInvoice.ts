/**
 * PPV unlock invoice path.
 *
 * A paid post is unlocked by a `post_unlocks` row the settlement webhook writes
 * after the invoice settles. This module builds the metadata that webhook needs
 * and creates the invoice; it never unlocks anything itself.
 */

import { getBtcPayService } from './btcpay';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface PpvInvoiceRequest {
  /** Creator's profile id (uuid) — the webhook rejects anything else. */
  creatorId: string | null | undefined;
  /** Signed-in fan's profile id (uuid). */
  fanId: string | null | undefined;
  postKey: string;
  priceSats: number | null | undefined;
}

export type PpvInvoiceMetadata =
  | { ok: true; amountSats: number; orderId: string; metadata: Record<string, string> }
  | { ok: false; error: string };

export function ppvInvoiceMetadata(request: PpvInvoiceRequest): PpvInvoiceMetadata {
  const creatorId = request.creatorId?.trim() ?? '';
  if (!UUID.test(creatorId)) {
    return { ok: false, error: 'This creator has no payable profile id yet.' };
  }
  const fanId = request.fanId?.trim() ?? '';
  if (!UUID.test(fanId)) {
    return { ok: false, error: 'Sign in first — a paid unlock is recorded against your account.' };
  }
  const postKey = request.postKey?.trim() ?? '';
  if (!postKey || postKey.length > 200) {
    return { ok: false, error: 'This post has no payable key.' };
  }
  const priceSats = Number.isFinite(request.priceSats) ? Math.round(request.priceSats ?? 0) : 0;
  if (priceSats <= 0) {
    return { ok: false, error: 'This post has no price, so there is nothing to pay.' };
  }

  const nonce =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8)
      : `${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;

  return {
    ok: true,
    amountSats: priceSats,
    orderId: `ppv-${postKey.slice(0, 24)}-${nonce}`,
    metadata: {
      kind: 'ppv',
      post_key: postKey,
      creator_id: creatorId,
      subscriber_id: fanId,
      price_sats: String(priceSats),
      amount_sats: String(priceSats),
    },
  };
}

export interface PpvInvoiceResult {
  ok: boolean;
  checkoutLink?: string;
  invoiceId?: string;
  amountSats?: number;
  error?: string;
}

export async function createPpvInvoice(request: PpvInvoiceRequest): Promise<PpvInvoiceResult> {
  const built = ppvInvoiceMetadata(request);
  if (!built.ok) return { ok: false, error: built.error };

  const service = await getBtcPayService();
  if (!service) {
    return {
      ok: false,
      error:
        'Paid unlocks need the Lightning invoice proxy, which is not configured on this deployment yet. Nothing was charged and the post stays locked.',
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
      error: error instanceof Error ? error.message : 'Could not create the unlock invoice.',
    };
  }
}
