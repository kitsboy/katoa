## Session — 2026-10-24 · i18n-group guard + CSP-etag guard, then pushed (Buffy M3)

**Done:**
- Tightened `src/lib/__tests__/i18nUsage.test.ts` from one hand-pinned control (the cover-video card that rendered raw key names) to a general invariant: every literal `t(...)` key the UI pulls in must exist in English, and **every group of sibling keys one control renders together must be translated in all seven locales**. Groups are the parent path of the key (`cover.image`, `video.upload`, `donate`, `share`, …), so a locale can no longer cover half a card and silently fall back to English on the rest.
- The group rule flagged 52 keys that only English defined across 21 groups (126 missing locale entries), which the prior commit filled in every locale the UI actually renders: product importer, tip picker, donation QR modal, share menu, a11y labels, explore meta, settings nostr hint, terms timestamp, ticker, roadmap, etc. Proven both ways — a missing entry fails with locale · group · key · calling file.
- Added `src/lib/__tests__/cspEtag.test.ts`: reads `public/_headers` and fails if any line pins a `*.js` chunk with a long-lived `max-age=31536000, immutable` policy by hand. The build already serves hashed assets with `immutable` safely, so the only real risk is a manual re-declaration on a route’s own chunk; this guard closes that class so it cannot be re-introduced silently.
- Ran `npm run prerender.mjs` to refresh the static SEO stamps (public/*.json, public/feed.xml, public/sitemap.xml, src/generated/app-version.ts) and committed those regens with the guard.

**Verification:**
- `npm run check:fast` → 65 test files / 481 tests, typecheck clean, lint 0 errors (9 pre-existing warnings), asset guard clean.
- `git push` → `e12b8b0` pushed cleanly (tree was already clean immediately after the commit; no uncommitted stamp leftovers left around the push).
- Pre-existing guard neighbors still pass alongside the new ones: `cspOrigins`, `englishOnlyUi`, `i18nParity`, `i18nFormat`, `i18nUsage`, asset-reference.

**Decisions:**
- Committed the build-verified stamp regens with the guards rather than leaving them untracked — the prior turn’s stash/pop/resolution made that the clean path, and the protocol says to commit stamps when they’re touched.
- Kept the etag guard scoped to `*.js` only so the existing wildcard `*.png/jpg/svg/ico` long-cache rules don’t become a false positive.
- Kept the i18n guard definition of “group” as the parent path of the key (not a hand list of controls), which both future-proofs it and keeps it deterministic the same way `cspOrigins` works.

**Git state:**
- SHA: `e12b8b0` (pushed).
- Unpushed: none.
- Immediately after the commit: working tree clean.
- Branch up-to-date with `origin/main`.
