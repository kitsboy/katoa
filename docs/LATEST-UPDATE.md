# Katoa — Last Updated 2026-10-14 by Kimi (THOR ops)

Brief: executed Buffy's 2026-10-13 security handoff end to end. All infra items are **closed and live-verified from THOR**; the code-lane items are returned to Buffy with verified inputs. Full reply: top of `docs/KIMI-HANDOFF.md` ("📬 REPLY — 2026-10-14").

**Closed this session (THOR, live-verified):**
- **P1 DMARC** — `_dmarc.katoa.org` set to `v=DMARC1; p=none; rua=mailto:kitsboy@gmail.com; pct=100`. Deliberately staged, not your recommended `p=quarantine`: the zone runs Google Workspace MX with **no DKIM record anywhere**, so hard enforcement now would quarantine Cam's own mail. A THOR cron re-checks aggregate reports on **2026-10-27** and flips to `p=quarantine`. Sender audit (your question 1): no mail-sending code exists in the repo; the only legitimate senders are Workspace users.
- **P1 www** — `www.katoa.org` now 301s to the apex (CNAME + edge redirect ruleset). Verified: root, subpath and query-string all redirect and land on 200.
- **P1 "origin IP exposed"** — investigated, **stale finding**. No unproxied origin record exists. The real leftover was the **SPF**, which authorised a defunct ezp.net VPS IP and Cloudflare's *shared* Pages anycast IPs (`+a +mx +ip4:209.54.123.113`) → now `v=spf1 include:_spf.google.com ~all`. Three VPS-era `_acme-challenge` TXT records deleted; the zone now holds exactly 6 records.
- **P0 leaked wrangler token** — **audit clean**: CF audit logs 2026-10-06 → 10-14 show zero non-system writes in any zone (only Pages cert churn + THOR's katoa changes). The grant is superseded by scoped, self-renewing THOR ops tokens. **Still open:** Cam revokes the OAuth grant in the dashboard (My Profile → Access Management → Connected Applications — no API route exists), then **Buffy: `wrangler logout` on M3 and M4 and delete `~/.wrangler/config/default.toml`.**
- **Deploy-lag question** — closed: live site is at `c7b4f5d` (the handoff commit itself).
- **ja/zh translation first pass (your open question)** — quality is GOOD, no missing keys (228 keys in every language). Nits: ja `thankyou.contact.lead` `保険として`→`バックアップとして`; ja `home.shot.satsRaised` `sats 達成`→`sats 集まった`. **Real bug (EN source):** `footer.acronym` and `pitch.slide0.subtitle` are truncated to "Keep All That" while ja/zh carry the full tagline "Keep All That's Owed Always" — fix the EN values.

**Remaining for you (code lane, M3) — details + verified inputs in the KIMI-HANDOFF reply:**
1. react-router 6→7 — your own scheduled task, e2e regression pass, not lumped into cosmetic work.
2. CSP narrowing — **approved with a verified origin list**: all 8 wss relays in code match the CSP exactly; `chart.googleapis.com` has **0 references in code — remove it**; no `<iframe>` anywhere in `src/` — **drop the whole `frame-src` directive**; `connect-src` = current list minus the bare `https:`.
3. Relocate `safeHttpUrl` out of `btcmap.ts` into a generic util.
4. Lint/test guard: fail on non-literal, non-`safeNextPath` targets to `navigate()` / `<Link to=…>`.
5. Secret-hygiene rule for `cfoat_`/`cfort_` in `scripts/check-secret-hygiene.mjs` — safe to add now that rotation is done.
6. The ja/zh nits + EN tagline fix above.

**Standing infra note:** THOR now holds the family Cloudflare ops credentials (`/root/.hermes/cf-credentials.env` + README, 0600) — DNS/zone-settings/page-rules/cache-purge on all 6 family zones + Pages Write, 90-day, self-renewing. Future infra fixes for katoa (and siblings) run from THOR without a dashboard visit or an M3 wrangler session.

---

# Previous session — 2026-10-13 by Buffy (M3)

Brief: exhaustive security handoff for Kimi, plus the multilingual SEO fixes and map XSS fixes that shipped alongside it. Both commits were built, verified, and pushed.

**Read this first:** `docs/SECURITY-HANDOFF-2026-10-13.md` — full security detail, with open questions and priority order. Also indexed at the top of `docs/KIMI-HANDOFF.md`.

**Open items (as of 10-13 — now dispositioned by the 10-14 entry above):**
- P0 — wrangler OAuth token rotation.
- P1 — DMARC, www CNAME, origin-IP finding.
- P2 — react-router 6→7; CSP bare-`https:` narrowing.

**Shipped that session (`806b91f`, `81adfa9`):**
- Night-jewel design polish across `Button`, `Card`, `Navbar`, `PageHero`, `CreatorVideoCard`, Explore `WishlistCard`, and global CSS (focus rings, scrollbar, `text-wrap: balance`, selection colour).
- `safeHttpUrl()` guards all 4 untrusted BTC Map/OSM `website` → `href` sinks (merchant popup, event popup, place drawer, area chip) — stored XSS closed. The drawer and area-chip sinks were only found on a second read-through; the area chip uses `website_url`, not `website`.
- `maplibre-gl` patched past the critical `DOM.sanitize()` XSS bypass (`^6.4.0` → `^6.4.1`; the range floor excludes 6.4.0).
- Sitemap generator now emits 8 hreflang alternates per URL (344 across 43 URLs), matching the runtime `?lang=` convention in `PageMeta`.
- 54 missing SEO meta translations added for es/pt/fr/de/ja/zh, including the full 22-key `thankyou` block that was English-only end to end.
- Removed duplicated `og:description`/`og:type`/`og:locale` setter blocks in `PageMeta`; `noindex` handling preserved.

**Verification (that session):** typecheck clean; lint clean; `npx vitest run` **318/318** (48 files, +2 for `safeHttpUrl`); `check:assets` passed (94 src / 106 dist refs); `check:security` passed with 0 credential findings; production build green with 26/26 prerendered routes; `npm audit --omit=dev` shows the critical gone with 2 moderate remaining by choice. Generated sitemap parsed with a real XML parser to confirm every URL has exactly 8 unique hreflang links.

**Git state at 10-13:** pushed `81adfa9` to `origin/main`; remote matches local; working tree clean.
