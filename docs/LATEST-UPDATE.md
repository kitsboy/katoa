# Katoa — Last Updated 2026-10-13 by Buffy

Brief: exhaustive security handoff for Kimi, plus the multilingual SEO fixes and map XSS fixes that shipped alongside it. Both commits were built, verified, and pushed.

**Read this first:** `docs/SECURITY-HANDOFF-2026-10-13.md` — full security detail for Kimi, with open questions and priority order. Also indexed at the top of `docs/KIMI-HANDOFF.md`.

**Open items Kimi must act on (Buffy could not):**
- **P0** — rotate the wrangler OAuth token; Buffy printed it to terminal output while auditing DNS access. `wrangler logout` everywhere, then re-login, ideally as a scoped `Cloudflare Pages:Edit` token.
- **P1** — DMARC still unset on `katoa.org`. The only available credential has `zone:read`; the DNS records API returns `Authentication error (code 10000)`. Record: `v=DMARC1; p=quarantine; rua=mailto:dmarc@katoa.org; pct=100` on `_dmarc.katoa.org`. Confirm a sender audit and a real `dmarc@` mailbox before applying.
- **P1** — two carry-over Cloudflare findings still open: missing `www` CNAME, and an unproxied record exposing the origin IP.
- **P2** — 2 moderate react-router advisories (breaking 6→7 upgrade, not forced; both verified unreachable in this pure-CSR build).
- **P2** — CSP `connect-src`/`frame-src` allow bare `https:`; narrowing needs a map + Nostr regression pass.

**Shipped this session (`806b91f`, `81adfa9`):**
- Night-jewel design polish across `Button`, `Card`, `Navbar`, `PageHero`, `CreatorVideoCard`, Explore `WishlistCard`, and global CSS (focus rings, scrollbar, `text-wrap: balance`, selection colour).
- `safeHttpUrl()` guards all 4 untrusted BTC Map/OSM `website` → `href` sinks (merchant popup, event popup, place drawer, area chip) — stored XSS closed. The drawer and area-chip sinks were only found on a second read-through; the area chip uses `website_url`, not `website`.
- `maplibre-gl` patched past the critical `DOM.sanitize()` XSS bypass (`^6.4.0` → `^6.4.1`; the range floor excludes 6.4.0).
- Sitemap generator now emits 8 hreflang alternates per URL (344 across 43 URLs), matching the runtime `?lang=` convention in `PageMeta`.
- 54 missing SEO meta translations added for es/pt/fr/de/ja/zh, including the full 22-key `thankyou` block that was English-only end to end.
- Removed duplicated `og:description`/`og:type`/`og:locale` setter blocks in `PageMeta`; `noindex` handling preserved.

**Verification:** typecheck clean; lint clean; `npx vitest run` **318/318** (48 files, +2 for `safeHttpUrl`); `check:assets` passed (94 src / 106 dist refs); `check:security` passed with 0 credential findings; production build green with 26/26 prerendered routes; `npm audit --omit=dev` shows the critical gone with 2 moderate remaining by choice. Generated sitemap parsed with a real XML parser to confirm every URL has exactly 8 unique hreflang links.

**Limitations:** ja/zh translations are unreviewed by a native speaker and ship verbatim as search snippets; Nostr relay connectivity was not exercised, so the CSP narrowing is untested; the Pages deploy for `81adfa9` was not confirmed live; the DNS-write denial was proven against the wrangler OAuth token only, so a different credential with `dns_records:edit` could still apply DMARC without a dashboard visit.

**Git state:** Pushed `81adfa9` to `origin/main`; remote matches local; working tree clean. Build-generated stamps (`public/metrics.json`, `public/version.json`, `src/generated/app-version.ts`) were reverted before committing so they did not pollute the change set.
