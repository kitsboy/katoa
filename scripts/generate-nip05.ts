/**
 * scripts/generate-nip05.ts — Katoa
 *
 * Writes `public/.well-known/nostr.json` (NIP-05) for the deploy, so a creator
 * who linked a Nostr key in Settings is served as `username@katoa.org` without an
 * ops edit. The committed file is the baseline (platform identity): with no
 * Supabase credentials in the environment this script reproduces it byte for
 * byte, and the build stays deterministic.
 *
 * Run: npm run nip05   (called by `npm run build`)
 *
 * Mode:
 *   - `profiles` — Supabase REST is reachable; profile state is merged in.
 *   - `baseline` — no credentials / no network; the committed file is kept.
 *
 * It never invents a mapping: a row is published only when it has a valid
 * NIP-05 name and a 64-hex pubkey, and every skipped row is printed with why.
 */
import fs from 'fs';
import path from 'path';
import {
  buildNip05Registry,
  serializeNostrJson,
  type NostrJson,
  type ProfileClaim,
} from '../src/lib/nip05Registry';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'public', '.well-known', 'nostr.json');

/** PostgREST page size; a bigger registry means a bigger deploy, not a bigger page. */
const PAGE = 1000;

function supabaseConfig(): { url: string; key: string } | null {
  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const key =
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    '';
  if (!url || !key || url.includes('placeholder')) return null;
  if (!key.startsWith('eyJ')) return null;
  return { url, key };
}

/**
 * Profile rows that could carry a NIP-05 mapping.
 * Uses the public PostgREST contract directly instead of supabase-js so the
 * build step has no client dependency and a stub server can exercise it.
 */
async function fetchProfiles(config: { url: string; key: string }): Promise<ProfileClaim[]> {
  const rows: ProfileClaim[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const query = new URLSearchParams({
      select: 'username,nostr_pubkey',
      nostr_pubkey: 'not.is.null',
      order: 'username.asc',
      limit: String(PAGE),
      offset: String(offset),
    });
    const res = await fetch(`${config.url}/rest/v1/profiles?${query.toString()}`, {
      headers: { apikey: config.key, Authorization: `Bearer ${config.key}` },
    });
    if (!res.ok) {
      throw new Error(`Supabase responded ${res.status} ${res.statusText}`);
    }
    const page = (await res.json()) as ProfileClaim[];
    if (!Array.isArray(page)) throw new Error('Supabase did not return an array of profiles');
    rows.push(...page);
    if (page.length < PAGE) break;
  }
  return rows;
}

async function main() {
  if (!fs.existsSync(OUT)) {
    throw new Error(`Baseline not found: ${OUT} — commit the platform identity before generating`);
  }
  const baseline = JSON.parse(fs.readFileSync(OUT, 'utf8')) as NostrJson;

  const config = supabaseConfig();
  let profiles: ProfileClaim[] = [];
  let mode: 'profiles' | 'baseline' = 'baseline';

  if (config) {
    try {
      profiles = await fetchProfiles(config);
      mode = 'profiles';
    } catch (error) {
      // A build must still ship the platform identity, but it must say so.
      console.warn(
        `[nip05] Profile state unavailable (${error instanceof Error ? error.message : String(error)}) — writing the committed baseline only.`
      );
    }
  } else {
    console.log('[nip05] No Supabase credentials in this environment — writing the committed baseline only.');
  }

  const { registry, fromProfiles, skipped } = buildNip05Registry(baseline, profiles);
  fs.writeFileSync(OUT, serializeNostrJson(registry));

  console.log(
    `[nip05] mode=${mode} names=${Object.keys(registry.names).length} fromProfiles=${fromProfiles.length}`
  );
  for (const entry of skipped) {
    console.log(`[nip05] skipped ${entry.username ?? '(no username)'}: ${entry.reason}`);
  }
}

main().catch((error) => {
  console.error(`[nip05] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
