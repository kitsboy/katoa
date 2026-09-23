import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyEvent, type Event } from "https://esm.sh/nostr-tools@2.17.1";

const KIND_NIP42 = 22242;
const CHALLENGE_TTL_SECONDS = 300;
const MAX_CLOCK_SKEW_SECONDS = 60;
const ALLOWED_ORIGINS = [
  "https://katoa.org",
  "http://localhost:5173",
  ...(Deno.env.get("NOSTR_AUTH_ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
];

type Body = {
  action?: "challenge" | "verify";
  domain?: string;
  username?: string;
  event?: Event;
};

function corsHeaders(origin: string | null): HeadersInit {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0] ?? "https://katoa.org";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
    "Content-Type": "application/json; charset=utf-8",
  };
}

function json(status: number, body: Record<string, unknown>, origin: string | null): Response {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(origin) });
}

function randomChallenge(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function normalizedDomain(value: string | undefined): string {
  const domain = value?.trim().toLowerCase() ?? "";
  if (!domain || domain.includes("/") || domain.includes("\\") || domain.includes("@")) throw new Error("invalid domain");
  return domain;
}

function validUsername(value: string | undefined): string | null {
  const username = value?.trim() ?? "";
  if (!username) return null;
  if (!/^[a-z0-9_\-.]{1,64}$/i.test(username)) throw new Error("invalid username");
  return username;
}

function tagValue(event: Event, name: string): string | null {
  return event.tags.find((tag) => tag[0] === name)?.[1] ?? null;
}

function parseExpiry(event: Event): number {
  const value = Number(tagValue(event, "expiration"));
  if (!Number.isInteger(value)) throw new Error("missing expiration");
  return value;
}

async function findProfile(supabase: ReturnType<typeof createClient>, pubkey: string, username: string | null) {
  const byKey = await supabase.from("profiles").select("id, username").eq("nostr_pubkey", pubkey).maybeSingle();
  if (byKey.error) throw byKey.error;
  if (byKey.data) return { profile: byKey.data, isNewUser: false };
  if (username) {
    const byName = await supabase.from("profiles").select("id").eq("username", username).maybeSingle();
    if (byName.error) throw byName.error;
    if (byName.data) throw new Error("username is already taken");
  }
  return { profile: null, isNewUser: true };
}

serve(async (request) => {
  const origin = request.headers.get("origin");
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(origin) });
  if (origin && !ALLOWED_ORIGINS.includes(origin)) return json(403, { error: "origin not allowed" }, origin);
  if (request.method !== "POST") return json(405, { error: "method not allowed" }, origin);

  try {
    const body = await request.json() as Body;
    const domain = normalizedDomain(body.domain);
    const siteUrl = Deno.env.get("SITE_URL") ?? "https://katoa.org";
    const expectedDomains = new Set([
      normalizedDomain(new URL(siteUrl).hostname),
      "localhost:5173",
      "127.0.0.1:5173",
    ]);
    if (!expectedDomains.has(domain)) return json(400, { error: "domain mismatch" }, origin);

    const serviceUrl = Deno.env.get("SUPABASE_URL")?.trim();
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
    if (!serviceUrl || !serviceKey) return json(501, { error: "not configured" }, origin);
    const supabase = createClient(serviceUrl, serviceKey);

    if (body.action === "challenge") {
      const challenge = randomChallenge();
      const expiresAt = new Date(Date.now() + CHALLENGE_TTL_SECONDS * 1000).toISOString();
      const { error } = await supabase.from("nostr_auth_challenges").insert({
        challenge,
        domain,
        username: validUsername(body.username),
        expires_at: expiresAt,
      });
      if (error) throw error;
      return json(200, { challenge, expires_at: expiresAt }, origin);
    }

    if (body.action !== "verify" || !body.event) return json(400, { error: "invalid action" }, origin);
    const event = body.event;
    const username = validUsername(body.username);
    if (event.kind !== KIND_NIP42 || !verifyEvent(event)) return json(401, { error: "invalid Nostr signature" }, origin);
    if (event.content !== "Sign in to KATOA") return json(401, { error: "invalid auth content" }, origin);
    if (event.created_at < Math.floor(Date.now() / 1000) - MAX_CLOCK_SKEW_SECONDS || event.created_at > Math.floor(Date.now() / 1000) + MAX_CLOCK_SKEW_SECONDS) return json(401, { error: "stale auth event" }, origin);
    if (tagValue(event, "domain") !== domain) return json(401, { error: "domain mismatch" }, origin);
    const expiration = parseExpiry(event);
    if (expiration < Math.floor(Date.now() / 1000) || expiration > Math.floor(Date.now() / 1000) + CHALLENGE_TTL_SECONDS + MAX_CLOCK_SKEW_SECONDS) return json(401, { error: "invalid expiration" }, origin);
    const challenge = tagValue(event, "challenge");
    if (!challenge) return json(401, { error: "missing challenge" }, origin);

    const { data: stored, error: challengeError } = await supabase.from("nostr_auth_challenges").select("id, username, expires_at, used_at").eq("challenge", challenge).eq("domain", domain).maybeSingle();
    if (challengeError) throw challengeError;
    if (!stored || stored.used_at || new Date(stored.expires_at).getTime() < Date.now()) return json(401, { error: "challenge expired or already used" }, origin);
    if (stored.username && stored.username !== username) return json(401, { error: "username mismatch" }, origin);

    const consumed = await supabase.from("nostr_auth_challenges").update({ used_at: new Date().toISOString(), used_pubkey: event.pubkey }).eq("id", stored.id).is("used_at", null).select("id");
    if (consumed.error) throw consumed.error;
    if (!consumed.data?.length) return json(401, { error: "challenge expired or already used" }, origin);

    const match = await findProfile(supabase, event.pubkey, username);
    let userId = match.profile?.id as string | undefined;
    let isNewUser = match.isNewUser;
    const profileUsername = username ?? `nostr-${event.pubkey.slice(0, 12)}`;
    if (!userId) {
      const email = `${event.pubkey}@nostr.katoa.org`;
      const created = await supabase.auth.admin.createUser({ email, email_confirm: true, user_metadata: { nostr_pubkey: event.pubkey, username: profileUsername } });
      if (created.error) throw created.error;
      userId = created.data.user.id;
      const profileInsert = await supabase.from("profiles").insert({ id: userId, username: profileUsername, nostr_pubkey: event.pubkey, nostr_pubkey_verified: true });
      if (profileInsert.error) throw profileInsert.error;
    } else {
      const profileUpdate = await supabase.from("profiles").update({ nostr_pubkey: event.pubkey, nostr_pubkey_verified: true }).eq("id", userId);
      if (profileUpdate.error) throw profileUpdate.error;
    }

    const email = `${event.pubkey}@nostr.katoa.org`;
    const generated = await supabase.auth.admin.generateLink({ type: "magiclink", email });
    if (generated.error) throw generated.error;
    const tokenHash = generated.data.properties?.hashed_token;
    if (!tokenHash) throw new Error("could not create one-time auth token");
    return json(200, { token_hash: tokenHash, user_id: userId, is_new_user: isNewUser }, origin);
  } catch (error) {
    console.error(error);
    return json(400, { error: error instanceof Error ? error.message : "request failed" }, origin);
  }
});
