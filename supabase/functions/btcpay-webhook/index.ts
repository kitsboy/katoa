/**
 * Family Payment Core: BTCPay server plug.
 * BTCPay → Katoa settlement webhook.
 *
 * This endpoint is the only writer of settled payment state:
 *  - gift/tip/PPV  → `transactions.status = 'confirmed'` + a totals recompute
 *  - subscription  → an active `subscriptions` row (the paid feed gate)
 * It also records the on-chain `txid` when the provider supplies one, so the
 * creator dashboard can link one specific payment.
 *
 * The browser never marks a payment complete. Decisions live in
 * `../_shared/settlement.ts` (pure, tested in `src/lib/__tests__/`).
 *
 * Secrets (Supabase Edge env / `supabase secrets set`, never VITE_* or git):
 *   BTCPAY_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  asRecord,
  asString,
  btcpaySignature,
  isConfirmedStatus,
  matchesReference,
  parseSettlement,
  positiveSats,
  subscriptionActivation,
  timingSafeEqual,
  type SettlementContext,
} from "../_shared/settlement.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type TxRow = {
  id: string;
  status: string | null;
  amount_sats: number | null;
  item_id: string | null;
  wishlist_id: string | null;
  payment_hash: string | null;
  intent_id: string | null;
  metadata: Record<string, unknown> | null;
};

const TX_SELECT = "id, status, amount_sats, item_id, wishlist_id, payment_hash, intent_id, metadata";

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return text(405, "method not allowed");
  }

  const secret = Deno.env.get("BTCPAY_WEBHOOK_SECRET")?.trim() ?? "";
  if (!secret) {
    return text(501, "not configured");
  }

  const rawBody = await req.text();
  const signature = (req.headers.get("btcpay-sig") ?? "").toLowerCase();
  if (!timingSafeEqual(signature, await btcpaySignature(secret, rawBody))) {
    return text(401, "invalid signature");
  }

  let payload: Record<string, unknown>;
  try {
    payload = asRecord(JSON.parse(rawBody));
  } catch {
    return text(400, "invalid json");
  }

  const context = parseSettlement(payload);
  if (!context.settled) {
    return json(200, { ok: true, ignored: true });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim() ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() ?? "";
  if (!supabaseUrl || !serviceKey) {
    return text(501, "not configured");
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  if (context.kind === "subscription") {
    return await activateSubscription(supabase, context);
  }

  return await confirmGift(supabase, context);
});

/* ------------------------------------------------------------------ */
/* Subscription settlement                                             */
/* ------------------------------------------------------------------ */

async function activateSubscription(
  supabase: ReturnType<typeof createClient>,
  context: SettlementContext,
): Promise<Response> {
  const subscriberId =
    asString(context.metadata.subscriber_id) ?? asString(context.metadata.subscriberId);
  if (!subscriberId || !UUID.test(subscriberId)) {
    return json(422, { ok: false, reason: "missing or invalid subscriber id" });
  }

  // Priced from the canonical tier table, never from the payload.
  const activation = subscriptionActivation(context.metadata, context.providerAmountSats);
  if (!activation.ok) {
    console.error(`btcpay-webhook: subscription not activated — ${activation.reason}`);
    return json(422, { ok: false, reason: activation.reason });
  }

  const { error } = await supabase.from("subscriptions").upsert(
    {
      subscriber_id: subscriberId,
      creator_id: activation.creatorId,
      tier_id: activation.tierId,
      price_sats: activation.priceSats,
      status: "active",
      active_until: activation.activeUntil,
      invoice_id: context.invoiceId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "subscriber_id,creator_id" },
  );

  if (error) {
    console.error("btcpay-webhook: subscription upsert failed", error.message);
    // A duplicate invoice is a replay, not a failure.
    if (error.code === "23505") {
      return json(200, { ok: true, updated: false, idempotent: true });
    }
    return text(500, "database error");
  }

  return json(200, {
    ok: true,
    updated: true,
    kind: "subscription",
    tierId: activation.tierId,
    activeUntil: activation.activeUntil,
  });
}

/* ------------------------------------------------------------------ */
/* Gift settlement                                                     */
/* ------------------------------------------------------------------ */

async function confirmGift(
  supabase: ReturnType<typeof createClient>,
  context: SettlementContext,
): Promise<Response> {
  const tx = await findTransaction(supabase, context.reference, context.invoiceId);
  if (!tx) {
    return json(200, { ok: true, updated: false, reason: "transaction not found" });
  }

  const amount = positiveSats(tx.amount_sats) ?? context.providerAmountSats;
  if (context.providerAmountSats && tx.amount_sats && context.providerAmountSats !== tx.amount_sats) {
    return json(422, { ok: false, reason: "amount mismatch" });
  }
  if (amount == null) {
    return json(422, { ok: false, reason: "amount unavailable" });
  }

  const itemId = asString(context.metadata.item_id) ?? asString(context.metadata.itemId) ?? tx.item_id;
  const wishlistId =
    asString(context.metadata.wishlist_id) ??
    asString(context.metadata.wishlistId) ??
    tx.wishlist_id;

  if (
    !matchesReference(context.metadata.wishlist_id ?? context.metadata.wishlistId, tx.wishlist_id) ||
    !matchesReference(context.metadata.item_id ?? context.metadata.itemId, tx.item_id) ||
    (tx.intent_id &&
      context.reference &&
      tx.intent_id !== context.reference &&
      tx.id !== context.reference)
  ) {
    return json(422, { ok: false, reason: "intent context mismatch" });
  }

  const eventId = context.eventId ?? `${context.type ?? "settled"}:${context.invoiceId ?? tx.id}`;

  const { error: eventError } = await supabase.from("payment_events").insert({
    id: eventId,
    transaction_id: tx.id,
    provider: "btcpay",
    event_type: context.type ?? "InvoiceSettled",
    state: "settled",
    amount_sats: amount,
    external_id: context.invoiceId,
    payload: {
      txid: context.txid,
      kind: context.kind,
      invoiceId: context.invoiceId,
      metadata: context.metadata,
    },
  });
  if (eventError) {
    if (eventError.code === "23505") {
      return json(200, { ok: true, updated: false, transactionId: tx.id, idempotent: true });
    }
    console.error("btcpay-webhook: failed to append payment event", eventError.message);
    return text(500, "event ledger error");
  }

  const patch: Record<string, unknown> = {
    status: "confirmed",
    confirmed_at: new Date().toISOString(),
    external_id: context.invoiceId,
  };
  // Only a real 64-hex txid is written; a bogus one would poison the proof link.
  if (context.txid) patch.txid = context.txid;
  if (context.providerAmountSats) patch.amount_sats = context.providerAmountSats;

  const { data: updatedRows, error: updateError } = await supabase
    .from("transactions")
    .update(patch)
    .eq("id", tx.id)
    .eq("status", "pending")
    .select("id");

  if (updateError) {
    console.error("btcpay-webhook: failed to confirm transaction", updateError.message);
    // A txid collision means another row already claims this on-chain payment.
    if (updateError.code === "23505") {
      return json(409, { ok: false, reason: "txid already recorded on another transaction" });
    }
    return text(500, "database error");
  }
  if (!updatedRows?.length && isConfirmedStatus(tx.status)) {
    return json(200, { ok: true, updated: false, transactionId: tx.id, idempotent: true });
  }

  // Recompute, never add: the same implementation the funding trigger uses, so a
  // provider retry cannot inflate a counter.
  const { error: totalsError } = await supabase.rpc("recompute_funding_totals", {
    p_wishlist_id: wishlistId,
    p_item_id: itemId,
  });
  if (totalsError) {
    console.error("btcpay-webhook: failed to recompute funding totals", totalsError.message);
    return text(500, "funding totals error");
  }

  return json(200, { ok: true, updated: true, transactionId: tx.id, txid: context.txid });
}

async function findTransaction(
  supabase: ReturnType<typeof createClient>,
  reference: string | null,
  invoiceId: string | null,
): Promise<TxRow | null> {
  if (reference) {
    const byId = await supabase.from("transactions").select(TX_SELECT).eq("id", reference).maybeSingle();
    if (byId.data) return byId.data as TxRow;
    const byIntent = await supabase
      .from("transactions")
      .select(TX_SELECT)
      .eq("intent_id", reference)
      .maybeSingle();
    if (byIntent.data) return byIntent.data as TxRow;
  }

  for (const hash of [invoiceId, reference]) {
    if (!hash) continue;
    const byHash = await supabase
      .from("transactions")
      .select(TX_SELECT)
      .eq("payment_hash", hash)
      .maybeSingle();
    if (byHash.data) return byHash.data as TxRow;
  }

  return null;
}

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function text(status: number, body: string): Response {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
