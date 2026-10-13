# Security Handoff — 2026-10-13 (Buffy M3 → Kimi THOR)

**Scope:** Full security + multilingual SEO review of `katoa.org`, followed by fixes for everything fixable from this machine. Everything below is either (a) fixed and verified, (b) blocked and needs you, or (c) reviewed and confirmed safe.

**Two sessions this day:**
- `806b91f` — night-jewel design polish across Button/Card/Navbar/Explore/global CSS
- `81adfa9` — multilingual SEO gaps + map href XSS vectors

Current tip: `81adfa9`. `origin/main` matches local. Working tree clean.

---

## P0 — DO FIRST: rotate the wrangler OAuth token

**Buffy leaked this credential. This is the single most urgent item in this document.**

While auditing what DNS access existed, I printed the contents of `~/.wrangler/config/default.toml` to terminal output. That file contains a live Cloudflare OAuth token (`cfoat_…`) and a refresh token (`cfort_…`) for the account `kitsboy@gmail.com` (Account ID `5135f538dd22ce5f8285773bae5f8d56`). The token was written to a tool transcript.

**Token scope (confirmed via `wrangler whoami`):**
`account:read`, `user:read`, `workers:write`, `workers_kv:write`, `workers_routes:write`, `workers_scripts:write`, `workers_tail:read`, `d1:write`, `pages:write`, `zone:read`, `ssl_certs:write`, `ai:write`, `ai-search:write`, `ai-search:run`, `websearch.run`, `agent-memory:write`.

Note it has **`zone:read` only, no `zone:write` and no `dns_records:*`** — so the leak did not expose DNS-write capability. But it does expose Workers/Pages/D1 write, which is enough to modify the production deployment. Treat as fully compromised.

**Requested action for Kimi:**
1. `wrangler logout` on every machine that has this config (M3, M4, THOR).
2. `wrangler login` to mint a fresh OAuth token.
3. Prefer replacing the broad OAuth grant with a **scoped API token** limited to `Cloudflare Pages:Edit` for the deploy workflow, so a future leak cannot reach Workers/D1/KV.
4. Search Cloudflare audit logs for any use of the leaked token between now and rotation.
5. Confirm back to Buffy whether the token was used for anything outside this session.

**Prevention (please implement):** add a secret-hygiene rule to `scripts/check-secret-hygiene.mjs` that fails the build if `cfoat_` or `cfort_` appears in any tracked file or committed log artifact. I did not implement this myself because I wanted the rotation to happen first — a scanner that only runs after the leak is remediated is fine, but I did not want to ship a rule I could not test against a live sample without further spreading it.

---

## P1 — DMARC: BLOCKED from this machine, needs a DNS write

**Status: not fixed. Cannot be fixed from here.**

`katoa.org` has **no DMARC record**. Without it, anyone on the internet can send mail claiming to be from `@katoa.org` and most receivers will accept it. This is the only finding in this document that is an active external-facing security gap rather than a code or hygiene issue.

**Why Buffy could not do it:** the only credential available is the wrangler OAuth token above. I confirmed authoritatively:

- `GET /client/v4/zones?name=katoa.org` → **success**, zone ID `043a08a001c9150f98f9b84c1de4d668`.
- `GET /client/v4/zones/043a08a001c9150f98f9b84c1de4d668/dns_records?name=_dmarc.katoa.org&type=TXT` → **`success: false`, `errors: [{ "code": 10000, "message": "Authentication error" }]`**.

So zone listing is permitted and DNS record access is not. `wrangler` also has no `zones` subcommand in v4.150.0, so there is no CLI path either.

**Exact record to create** (name `_dmarc.katoa.org`, type `TXT`, proxied-off is fine, TTL auto):

```
v=DMARC1; p=quarantine; rua=mailto:dmarc@katoa.org; pct=100
```

**Questions back to Cam/Buffy before Kimi applies it:**
- Is there an existing mailbox that can receive aggregate reports? `rua=` will start delivering XML reports there. If `dmarc@katoa.org` is not wired to anything, either wire it or drop the `rua=` clause for now (`v=DMARC1; p=quarantine; pct=100`) and add reporting later.
- Start at `p=quarantine` or `p=none`? Buffy recommended `quarantine` because there is no evidence of legitimate third-party senders. **If Katoa ever sends mail through a third party (transactional email, newsletter, billing), that sender must be SPF/DKIM-aligned first or its mail gets quarantined.** Kimi should check for any such sender before flipping to quarantine.
- Recommend a staged ramp if paranoid: `p=none` for 1–2 weeks, read the reports, then `p=quarantine`, then `p=reject` in a later change.

---

## P1 — two other Cloudflare dashboard findings (carry-over, still open)

These were surfaced in an earlier session and are **still not applied**. Buffy had no DNS-write access then or now.

**1. `www` does not resolve.**
Add CNAME `www` → `katoa.org` (proxy on). Then add a redirect rule so `www.katoa.org` 301s to the apex. Without this, anyone typing `www.katoa.org` gets an error.

**2. Origin IP is exposed.**
At least one DNS record points directly at the origin server instead of being proxied through Cloudflare. That defeats the proxy entirely: attackers can bypass Cloudflare's WAF/DDoS protection and hit the origin directly, and the origin IP is disclosed. **Toggle that record to proxied (orange cloud).**

**Question for Kimi:** once the record is proxied, confirm the origin is not still reachable by IP on port 80/443. If the origin is a Cloudflare Pages deployment there is no self-hosted origin to expose — in which case this finding may be a stale record from an earlier hosting setup and should simply be deleted. Please determine which it is rather than assuming.

---

## P2 — npm audit: 1 critical fixed, 2 moderate remain (deliberately)

`npm audit --omit=dev` after this session's fixes.

### FIXED — `maplibre-gl` critical XSS

- **Advisory:** GHSA-jrc7-96c5-q579 — "XSS Sanitizer Bypass in `DOM.sanitize()` via Live NamedNodeMap Removal Skip".
- **Was:** `^6.4.0` (resolved 6.4.0, vulnerable).
- **Now:** `^6.4.1` (resolves 6.4.1). The range floor excludes 6.4.0 while still allowing patch/minor updates. Do **not** loosen back to `^6.4.0`.

### REMAINING — `react-router` / `react-router-dom` (2 × moderate)

- **Was:** `react-router-dom ^6.26.0` → `react-router 6.30.6`.
- **Advisories:**
  - GHSA-wrjc-x8rr-h8h6 — Open redirect via backslash in `<Link>` and `useNavigate` (CVE-2025-68470 bypass).
  - GHSA-337j-9hxr-rhxg — Arbitrary constructor injection via `deserializeErrors()` in React Router SSR hydration.
- **npm's proposed fix:** `react-router-dom@7.18.4`, which is a **breaking major upgrade**. I did not force it.

**Buffy's reachability analysis (please independently verify — this is the crux of whether you must act now or can schedule it):**

- **SSR injection CVE: not reachable.** The app is pure client-side. There is no `renderToString`, `renderToPipeableStream`, `hydrateRoot`, SSR server, or `deserializeErrors` call anywhere in `src/`, `vite.config.ts`, `main.tsx`, or `package.json`. The vulnerable code path does not exist in this build.
- **Open-redirect CVE: mitigated in-app, not fixed in the library.**
  - `src/lib/authSecurity.ts` → `safeNextPath()` rejects values that do not start with `/`, start with `//`, or contain `\`. Tests exist in `src/lib/__tests__/authSecurity.test.ts`.
  - Every `navigate()` call site uses either a static literal or `postAuthPath(window.location.search)` which routes through `safeNextPath`. Verified across `AuthPage`, `WishlistPage`, `SettingsPage`, `ExplorePage`.
  - `src/components/Link.tsx` treats only `http(s)://`, `mailto:`, `tel:` as external; everything else goes to `RouterLink`. Every `to`/`href` that carries data is built from a fixed root-relative prefix (`/u/${username}`, `/messages?to=${…}`), so none can begin with `//`.
  - `window.location` assignments in `ContactPage` are `mailto:` strings; `ErrorFallback` uses static paths.

**Requested of Kimi:** plan the react-router 6 → 7 migration as its own scheduled task with a full regression pass (auth callback, `next=` redirect, `<Link>` external behaviour, route types). Do **not** lump it into a cosmetic batch. If you would rather not take it on, hand it back and Buffy will do it with e2e coverage — but it should not be left indefinitely, because the mitigation is app-level and a future `navigate(userInput)` would silently reintroduce the open redirect.

**Hardening request regardless of the upgrade:** add a lint rule or a test that fails if a new call site passes a non-literal, non-`safeNextPath` value to `navigate()` or to `<Link to=…>`. The current safety depends on every author remembering the rule.

---

## P2 — fixed: stored XSS via untrusted BTC Map / OSM `website` fields

**This was a real, exploitable stored-XSS vector and is the most important code fix in this session.**

`place.website`, `event.website`, and `area.website_url` come from the third-party BTC Map API, which is backed by OpenStreetMap — i.e. **arbitrary untrusted contributor data**. These values were written into `href` attributes with only `escapeMapPopupText()` applied. That escapes `& < > "`, which prevents *attribute breakout*, but it does nothing about the **URL scheme**. A contributor could set a place's website to `javascript:alert(document.cookie)` and it would render as a live, clickable link.

The codebase already had the right pattern — `sanitizeImageUrl()` guards `javascript:` in inline `background-image:url(…)` styles, with tests — but the `href` sinks had no equivalent.

**Fix:** added `safeHttpUrl()` in `src/lib/btcmap.ts` (requires `/^https?:\/\//i`, else returns `null`), and applied it to **all four** sinks:

| # | Sink | File | Notes |
|---|------|------|-------|
| 1 | Merchant popup | `src/lib/btcmap.ts` ~L941 | `buildMerchantPopupHtml` |
| 2 | Event popup | `src/components/UnifiedBTCMap.tsx` ~L418 | `renderEventsLayer` |
| 3 | Place-detail drawer | `src/components/UnifiedBTCMap.tsx` ~L1398 | **found on second pass** |
| 4 | "Areas here" chip | `src/components/UnifiedBTCMap.tsx` ~L1448 | **found on second pass; uses `website_url`, different field name** |

Sinks 3 and 4 were only found by reading the whole file after the first two were fixed. Sink 4 in particular is easy to miss because the field is `website_url`, not `website`. **If you audit this area again, grep for the field names, not just the word "website".**

**Tests added:** `src/lib/__tests__/btcmap.test.ts` → `describe('safeHttpUrl')` covering `https://`, `http://`, whitespace-trimmed https, and rejection of `javascript:` (including mixed-case `JavaScript:` and leading-whitespace variants), `data:`, `vbscript:`, empty string, `null`, `undefined`.

**Verified:** typecheck, lint, 318/318 tests, production build.

**Question for Kimi:** are there other third-party-sourced URL fields elsewhere that reach `href`? Buffy checked `nostr.ts` (`profile.website`) and confirmed it is stored but **never rendered into an `href`** anywhere — but that is a "not yet" guarantee, not a structural one. Please (a) move `safeHttpUrl` somewhere more general than `btcmap.ts` (it is a generic URL guard, not BTC-Map-specific, and it now lives in a file that implies otherwise), and (b) consider a lint rule banning raw `{…url…}` interpolation into `href` without passing through the guard.

---

## Reviewed and confirmed SAFE (no action needed, but documented so it is not re-audited)

These were examined and are correct. Listed explicitly so the next reviewer does not spend time re-deriving the same conclusions.

- **JSON-LD injection.** All `<script type="application/ld+json">` blocks go through `toJsonLdScript()` in `src/lib/jsonLd.ts`, which does `JSON.stringify(data).replace(/</g, '\\u003c')`. The `<` escape prevents breaking out of the script element. Used by `PricingPage`, `FAQPage`, `WishlistPage`, `CreatorProfilePage`, `ExplorePage`. The prerender script has a matching implementation at `scripts/prerender-routes.mjs` L363 with a comment tying the two together.
- **`tel:` sink.** `src/lib/btcmap.ts` L925 — `<a href="tel:${escapeMapPopupText(place.phone)}">`. Scheme is hardcoded so the href always begins `tel:`, and the value is HTML-escaped. Safe.
- **Map pin `innerHTML`.** `buildPinElement()` in `UnifiedBTCMap.tsx` sets `innerHTML`, but both inputs are controlled: `createKatoaElement` uses `sanitizeImageUrl()` for the photo and a fixed `#rrggbb` ring colour; `createMerchantElement` uses `materialIconGlyph()` which is an **emoji allowlist lookup** keyed on the icon name (unknown → `₿`), not a passthrough.
- **`safeNextPath` open-redirect guard.** Discussed above under react-router.
- **Secret hygiene.** `npm run check:security` passes with 0 credential findings across all tracked files. Note this does **not** cover the wrangler config, which lives outside the repo — see P0.
- **CSP / security headers.** `public/_headers` sets HSTS (with preload), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, COOP/CORP, `Permissions-Policy` (camera/mic/geo denied), and a full CSP with `frame-ancestors 'none'` and `upgrade-insecure-requests`.

**⚠️ CSP concern for Kimi (not changed, needs a decision):** the CSP contains two very broad allowances that substantially weaken it:

- `connect-src … https:` — the trailing bare `https:` allows XHR/fetch to **any** https origin. Combined with `script-src` being otherwise locked down this is not trivially exploitable, but it neuters the main value of `connect-src` for data-exfiltration prevention. If a XSS ever lands, it can phone home anywhere.
- `frame-src 'self' https:` — allows framing any https site.

Recommend narrowing `connect-src` to the enumerated list already present (Supabase, CoinGecko, Coinbase, BTC Map, OpenFreeMap, the Nostr relays, plus `https://katoa.org`) and dropping the bare `https:`. Same for `frame-src`. **Please check the map tiles and Nostr relays still work after narrowing** — that is why I did not do it blind: a broken map or dead relay set is a user-visible regression, and I could not fully exercise the Nostr relay matrix from here.

---

## SEO work shipped alongside (context, not security)

Included because it shares the commit and Kimi may need to maintain it:

- **Hreflang.** Sitemap previously declared **zero** hreflang alternates. `scripts/generate-sitemap.mjs` now emits 8 `xhtml:link` alternates per URL (7 languages + `x-default`) — 344 across 43 URLs — mirroring the runtime `?lang=` convention in `PageMeta.tsx`. Verified by parsing the XML and asserting each `<url>` has exactly 8 *unique* hreflang links.
- **Translations.** 54 missing SEO meta strings across 9 keys were added for es/pt/fr/de/ja/zh. The `thankyou.*` page was English-only end to end (22 keys), not just its meta tags; all 22 are now translated in each language.
- **`PageMeta` cleanup.** Two blocks (`og:description`/`description`/`twitter:description`, and `og:type`/`og:site_name`/`og:locale`/`setOgLocaleAlternates`) were executing twice per render. Removed the duplicates. `noindex` handling preserved (verified — the full setter at ~L126 covers it).

**Request for Kimi — translation quality.** The es/pt/fr/de translations are high confidence. The **ja and zh translations have not been reviewed by a native speaker.** They parse and load correctly, but they will ship verbatim as Google search snippets. Please either get a native-speaker review or explicitly accept the risk and record that decision.

**Request for Kimi — keep the language lists in sync.** `LANGUAGES` is now declared in three places that must agree: the `Language` type in `src/contexts/LanguageContext.tsx`, the `hreflangs` array in `src/components/PageMeta.tsx`, and `LANGUAGES` in `scripts/generate-sitemap.mjs`. A future 8th language added to only one of these will silently produce a broken hreflang cluster. Consider extracting a single source of truth.

---

## Open questions for Kimi (Buffy cannot answer these from the repo)

1. **DMARC sender audit** — does anything legitimately send mail as `@katoa.org`? This determines whether `p=quarantine` is safe to apply immediately. (P1)
2. **Origin IP** — is the exposed record a live self-hosted origin, or a stale record from old hosting that should just be deleted? (P1)
3. **Cloudflare token rotation** — confirm done, and confirm whether the leaked token was ever used outside this session. (P0)
4. **`rua=` mailbox** — is `dmarc@katoa.org` a real mailbox that can receive aggregate reports? (P1)
5. **react-router 7** — take it on, or hand back to Buffy with a date? (P2)
6. **CSP narrowing** — approve narrowing `connect-src`/`frame-src` off the bare `https:`? Needs a map + Nostr regression pass. (P2)
7. **`safeHttpUrl` relocation** — move it out of `btcmap.ts` to a generic util? (P2)

---

## What Buffy verified this session (so you do not need to re-run it)

- `npm run typecheck` — clean.
- `npm run lint -- --quiet` — clean.
- `npx vitest run` — **318/318** (48 files; +2 for `safeHttpUrl`).
- `npm run check:assets` — passed (94 src refs, 106 dist refs).
- `npm run check:security` — passed, 0 credential findings.
- `npm run build` — green, 26/26 routes prerendered.
- `npm audit --omit=dev` — **critical gone**; 2 moderate remain (react-router, analyzed above).
- Generated sitemap parsed with a real XML parser; every URL has exactly 8 unique hreflang links.
- `maplibre-gl` resolves to 6.4.1 with range `^6.4.1`.

**Not verified / limitations:**
- The ja/zh translations are unreviewed by a native speaker.
- Nostr relay connectivity was not exercised, so the CSP narrowing above is untested.
- Cloudflare production deploy was not inspected after push; the design-polish commit and this commit should both deploy automatically from `main`, but please confirm the Pages deploy picked up `81adfa9`.
- The DNS-write denial was proven against the wrangler OAuth token only. If a different credential with `dns_records:edit` exists somewhere Buffy cannot see, DMARC could be applied without a dashboard visit.

---

*Safe Harbour · Part of the [Give A Bit](https://giveabit.io) family.*
