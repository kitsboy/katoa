/**
 * BTCPay → Katoa settlement webhook.
 * Confirms pending gifts server-side. The browser never marks payments complete.
 *
 * Secrets (Supabase Edge env / `supabase secrets set`, never VITE_* or git):
 *   BTCPAY_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SETTLED_TYPES = new Set(["InvoiceSettled", "InvoicePaymentSettled"]);

type TxRow = {
  id: string;
  status: string | null;
  amount_sats: number | null;
  item_id: string | null;
  wishlist_id: string | null;
  payment_hash: string | null;
};

const TX_SELECT = "id, status, amount_sats, item_id, wishlist_id, payment_hash";

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
  const expected = `sha256=${await hmacSha256Hex(secret, rawBody)}`;
  if (!timingSafeEqual(signature, expected)) {
    return text(401, "invalid signature");
  }

  let payload: Record<string, unknown>;
  try {
    payload = asRecord(JSON.parse(rawBody));
  } catch {
    return text(400, "invalid json");
  }

  const type = asString(payload.type);
  const invoiceStatus = asString(payload.invoiceStatus);
  const settled = (type != null && SETTLED_TYPES.has(type)) || invoiceStatus === "Settled";
  if (!settled) {
    return json(200, { ok: true, ignored: true });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim() ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() ?? "";
  if (!supabaseUrl || !serviceKey) {
    return text(501, "not configured");
  }

  const metadata = asRecord(payload.metadata);
  const invoiceId = asString(payload.invoiceId) ?? asString(payload.invoice_id);
  const txId =
    asString(metadata.katoa_tx_id) ??
    asString(metadata.transactionId) ??
    asString(metadata.transaction_id) ??
    asString(payload.orderId) ??
    asString(payload.order_id) ??
    asString(metadata.orderId) ??
    asString(metadata.order_id);

  const supabase = createClient(supabaseUrl, serviceKey);
  const tx = await findTransaction(supabase, txId, invoiceId);
  if (!tx) {
    return json(200, { ok: true, updated: false, reason: "transaction not found" });
  }

  const alreadyRaised = isConfirmedStatus(tx.status);
  if (alreadyRaised) {
    return json(200, { ok: true, updated: false, transactionId: tx.id, idempotent: true });
  }

  const { error: updateError } = await supabase
    .from("transactions")
    .update({ status: "confirmed" })
    .eq("id", tx.id);

  if (updateError) {
    console.error("btcpay-webhook: failed to confirm transaction", updateError.message);
    return text(500, "database error");
  }

  const amount = positiveSats(tx.amount_sats) ?? parseAmountSats(payload, metadata);
  const itemId = asString(metadata.item_id) ?? asString(metadata.itemId) ?? tx.item_id;
  const wishlistId =
    asString(metadata.wishlist_id) ?? asString(metadata.wishlistId) ?? tx.wishlist_id;

  if (amount && itemId) {
    await incrementColumn(supabase, "wishlist_items", "sats_raised", itemId, amount);
  }
  if (amount && wishlistId) {
    await incrementColumn(supabase, "wishlists", "total_sats_raised", wishlistId, amount);
  }

  return json(200, { ok: true, updated: true, transactionId: tx.id });
});

function isConfirmedStatus(status: string | null): boolean {
  return status === "confirmed" || status === "completed";
}

async function findTransaction(
  supabase: ReturnType<typeof createClient>,
  txId: string | null,
  invoiceId: string | null,
): Promise<TxRow | null> {
  if (txId) {
    const byId = await supabase.from("transactions").select(TX_SELECT).eq("id", txId).maybeSingle();
    if (byId.data) return byId.data as TxRow;
  }

  for (const hash of [invoiceId, txId]) {
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

async function incrementColumn(
  supabase: ReturnType<typeof createClient>,
  table: "wishlist_items" | "wishlists",
  column: "sats_raised" | "total_sats_raised",
  id: string,
  amount: number,
): Promise<void> {
  const { data, error } = await supabase.from(table).select(column).eq("id", id).maybeSingle();
  if (error || !data) {
    if (error) console.error(`btcpay-webhook: read ${table}.${column} failed`, error.message);
    return;
  }
  const current = positiveSats((data as Record<string, unknown>)[column]) ?? 0;
  const { error: writeError } = await supabase
    .from(table)
    .update({ [column]: current + amount })
    .eq("id", id);
  if (writeError) {
    console.error(`btcpay-webhook: increment ${table}.${column} failed`, writeError.message);
  }
}

function parseAmountSats(
  payload: Record<string, unknown>,
  metadata: Record<string, unknown>,
): number | null {
  return (
    positiveSats(metadata.amount_sats) ??
    positiveSats(metadata.amountSats) ??
    positiveSats(payload.amount_sats) ??
    positiveSats(payload.amountSats)
  );
}

function positiveSats(value: unknown): number | null {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  if (left.byteLength !== right.byteLength) return false;
  let out = 0;
  for (let i = 0; i < left.byteLength; i += 1) out |= left[i] ^ right[i];
  return out === 0;
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
