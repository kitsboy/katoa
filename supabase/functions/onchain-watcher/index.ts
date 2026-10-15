/**
 * On-chain settlement watcher (scheduled Edge Function).
 *
 * Lightning settles through the BTCPay webhook; on-chain payments reach nobody's
 * server on their own, so this polls the creator's published receive addresses and
 * settles the matching pending gifts. It is the on-chain equivalent of the
 * webhook and uses the same rules: exact amount, enough confirmations, one txid
 * per payment, totals recomputed (never added).
 *
 * Schedule it (Supabase cron or an external pinger, every few minutes):
 *   supabase functions schedule onchain-watcher --cron "*\/5 * * * *"
 *
 * Auth: called by the scheduler, so it requires `WATCHER_SECRET` in the query or
 * `x-watcher-secret` header. Without that secret configured it refuses to run.
 *
 * Env (server only): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, WATCHER_SECRET
 * Optional: MEMPOOL_API_BASE (default https://mempool.space/api)
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  matchOnchainPayments,
  REQUIRED_CONFIRMATIONS,
  type PendingGiftRow,
  type ReceivedOutput,
} from "../_shared/onchain.ts";

const MEMPOOL_API_BASE = (Deno.env.get("MEMPOOL_API_BASE") ?? "https://mempool.space/api").replace(/\/$/, "");
/** Read cap per run so one run cannot hammer the explorer. */
const MAX_ADDRESSES = 25;

type WalletRow = { address_value: string; user_id: string };

serve(async (req: Request) => {
  const secret = Deno.env.get("WATCHER_SECRET")?.trim() ?? "";
  if (!secret) return text(501, "not configured");

  const url = new URL(req.url);
  const provided = req.headers.get("x-watcher-secret")?.trim() ?? url.searchParams.get("secret")?.trim() ?? "";
  if (provided !== secret) return text(401, "unauthorized");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim() ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() ?? "";
  if (!supabaseUrl || !serviceKey) return text(501, "not configured");

  const supabase = createClient(supabaseUrl, serviceKey);

  const { data: wallets, error: walletError } = await supabase
    .from("wallet_addresses")
    .select("address_value, user_id")
    .eq("address_type", "onchain")
    .eq("is_active", true)
    .limit(MAX_ADDRESSES);

  if (walletError) {
    console.error("onchain-watcher: could not read wallets", walletError.message);
    return text(500, "wallet read error");
  }

  const results: Array<Record<string, unknown>> = [];

  for (const wallet of (wallets ?? []) as WalletRow[]) {
    const address = wallet.address_value?.trim();
    if (!address) continue;

    let outputs: ReceivedOutput[];
    try {
      outputs = await fetchReceivedOutputs(address);
    } catch (error) {
      console.error(`onchain-watcher: explorer failed for ${address}`, String(error));
      results.push({ address, error: "explorer unavailable" });
      continue;
    }

    const { data: wishlists } = await supabase
      .from("wishlists")
      .select("id")
      .eq("creator_id", wallet.user_id);
    const wishlistIds = ((wishlists ?? []) as Array<{ id: string }>).map((row) => row.id);
    if (!wishlistIds.length) continue;

    const { data: pendingRows, error: pendingError } = await supabase
      .from("transactions")
      .select("id, amount_sats, status, txid, created_at, wishlist_id, item_id")
      .in("wishlist_id", wishlistIds)
      .eq("status", "pending")
      .is("txid", null)
      .order("created_at", { ascending: true })
      .limit(200);

    if (pendingError) {
      console.error("onchain-watcher: could not read pending gifts", pendingError.message);
      continue;
    }

    const { matches, rejected } = matchOnchainPayments(
      (pendingRows ?? []) as PendingGiftRow[],
      outputs,
    );

    let settled = 0;
    for (const match of matches) {
      // Claim the txid first: the unique index makes a second claim impossible,
      // so two rows can never attribute the same on-chain payment.
      const { data: claimed, error: claimError } = await supabase
        .from("transactions")
        .update({ txid: match.txid })
        .eq("id", match.transactionId)
        .is("txid", null)
        .select("id");

      if (claimError) {
        console.error("onchain-watcher: txid claim failed", claimError.message);
        continue;
      }
      if (!claimed?.length) continue;

      const { error: confirmError } = await supabase
        .from("transactions")
        .update({
          status: "confirmed",
          confirmed_at: new Date().toISOString(),
        })
        .eq("id", match.transactionId)
        .eq("status", "pending");

      if (confirmError) {
        console.error("onchain-watcher: confirm failed", confirmError.message);
        continue;
      }

      const { error: totalsError } = await supabase.rpc("recompute_funding_totals", {
        p_wishlist_id: match.wishlistId,
        p_item_id: match.itemId,
      });
      if (totalsError) {
        console.error("onchain-watcher: recompute failed", totalsError.message);
      }
      settled += 1;
    }

    results.push({
      address,
      outputs: outputs.length,
      settled,
      rejected: rejected.length,
      requiredConfirmations: REQUIRED_CONFIRMATIONS,
    });
  }

  return json(200, { ok: true, wallets: results.length, results });
});

/** Received outputs for an address, oldest first. */
async function fetchReceivedOutputs(address: string): Promise<ReceivedOutput[]> {
  const res = await fetch(`${MEMPOOL_API_BASE}/address/${encodeURIComponent(address)}/txs`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`mempool responded ${res.status}`);

  const body = (await res.json()) as Array<{
    txid?: string;
    status?: { confirmed?: boolean; block_height?: number };
    vout?: Array<{ scriptpubkey_address?: string; value?: number }>;
  }>;

  const tip = await fetchChainTip();
  const out: ReceivedOutput[] = [];

  for (const tx of body ?? []) {
    if (!tx.txid) continue;
    const credited = (tx.vout ?? [])
      .filter((v) => v.scriptpubkey_address === address)
      .reduce((sum, v) => sum + (v.value ?? 0), 0);
    if (credited <= 0) continue;

    const height = tx.status?.block_height ?? 0;
    const confirmations =
      tx.status?.confirmed && tip !== null && height > 0 ? Math.max(1, tip - height + 1) : 0;
    out.push({ txid: tx.txid, amountSats: credited, confirmations });
  }

  return out;
}

async function fetchChainTip(): Promise<number | null> {
  try {
    const res = await fetch(`${MEMPOOL_API_BASE}/blocks/tip/height`, { headers: { Accept: "text/plain" } });
    if (!res.ok) return null;
    const height = Number(await res.text());
    return Number.isFinite(height) ? height : null;
  } catch {
    return null;
  }
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
