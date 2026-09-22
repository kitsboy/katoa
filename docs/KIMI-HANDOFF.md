## Session — 2026-09-22 · Heavy content, payment, and creator UX polish (Buffy M3)

**Done:**
- Added the integrated `ContentStudio` drawer to ProjectPage: project story editing, wishlist card editing, card reordering, compact/expanded card detail, local autosave, eight-version history, restore, preview, and save actions.
- Added `PaymentDetailDisclosure` in checkout with expandable method, amount, destination, timing, fee, proof, and demo/staged honesty details.
- Added creator profile tabs: Story, Media, Goals, Updates, and Proof without deleting the existing feed, wishlist, trust, or subscription content.
- Added expandable `CreatorStoryChapters` for identity, goals, progress, and trust; added `CreatorPresentation` with progress dots, captions, keyboard arrows, Escape, and demo labels.
- Added focused persistence and story-disclosure tests.

**Verification:**
- `npm test -- --run`: **306/306 tests passed** (45 files).
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run check:security`: passed with 0 credential findings.
- `npm run build`: passed; 26/26 routes prerendered; src/dist asset-reference checks passed.
- Existing non-blocking Vite chunk-size and Browserslist warnings remain.

**Decisions:**
- This is pre-launch polish only. No payment node, provider, credential, real engagement, real creator seed, or production hosting deployment was activated.
- Existing content remains available; tabs add progressive disclosure rather than removing product surfaces.
- Demo edits remain device-local and payment UI never claims browser-side settlement.

**Git State:**
- SHA: `464de3ba4de6080d71bcb4e51fbbead118b03db5` — pushed to `origin/main`.
- Unpushed: none.

---

## Session — 2026-09-22 · Demo sample-data control center (Buffy M3)

**Done:**
- Added a visible `Demo controls` entry point to the demo banner.
- Added three local sample scenarios: Community impact, Creator studio, and Independent music.
- Added Rich walkthrough / Quick skim presentation options and surfaced the current selection inside the homepage demo story.
- Added `Open selected story` shortcut and a safe `Reset demo` action.
- Reset clears only device-local demo state, favorites, filters, onboarding, local engagement previews, and demo projects; it does not touch Supabase, live accounts, payment nodes, credentials, or theme preferences.
- Added focused persistence/reset tests for the demo preview state.

**Verification:**
- `npm test -- --run`: **303/303 tests passed** (43 files).
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed; 26/26 routes prerendered.
- Source and dist asset-reference checks passed.
- Existing non-blocking Vite chunk-size and Browserslist warnings remain.

**Decisions:**
- This is local pre-launch demo tooling only; no payment or market behavior was activated.
- The reset intentionally preserves theme preferences and does not imply live-account deletion.

**Git State:**
- SHA: `53af5f0` — pushed to `origin/main`.
- Unpushed: none.

---

## Session — 2026-09-22 · Heavy pre-launch demo polish (Buffy M3)

**Done:**
- Added `DemoExperience`: three clear demo paths (supporter, creator, evaluator), three multimedia story chapters, expandable detail, and honest sample-only language.
- Added a focused demo test covering path links, chapter switching, and progressive disclosure.
- Added compact/expanded card density controls to Explore for richer browsing without visual overload; creator cards adapt their media framing and metadata.
- Enriched Paul and Skate Colombia sample worlds with milestone posts and contextual comments.
- Hardened `MediaCard` playback for test/browser environments and added a jsdom `matchMedia` shim.
- Updated roadmap boundaries: payment-node selection, provider commitment, live engagement, real creator seeding, market launch, and production deployment are explicitly deferred.

**Verification:**
- `npm test -- --run`: **301/301 tests passed** (42 files).
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed; 26/26 routes prerendered.
- Source and dist asset-reference checks passed.
- No payment node, credentials, live creator data, or production deploy touched.

**Decisions:**
- This is a pre-launch product polish batch, not a market or payment activation batch.
- Demo content remains visibly sample content; local payment/engagement seams remain unchanged.

**Git State:**
- SHA: `1e4d2ba4773925bdaca9449fa33f75e05c66738d`
- Unpushed before final push: `1e4d2ba Polish the pre-launch demo experience`

---

## Session — 2026-09-22 · Guard v2: dynamic paths, CSS url(), prerendered HTML (Buffy M3)

**Done:**
- Extended `scripts/check-asset-references.mjs` with dynamic-path detection in src/: flags template literals (`` `/images/mock/${h}.jpeg` ``) and `'dir/' + n + '.ext'` concatenations — including same-file const prefixes — **only when the static prefix directory exists under public/**, the only dynamic case that can 404 at runtime. CDN/S3 templates pass naturally.
- New `--dist` phase, wired as npm `postbuild` (runs automatically after every build): validates every `url()` in `dist/assets/*.css` and every absolute asset reference in prerendered `dist/*.html` against `dist/` — catches anything Tailwind/minification relocated after the source scan.
- Verified with fault injection: template, concat, const-prefix, and injected-CSS cases all fail with file:line; clean tree passes (86 src refs, 106 dist refs). Fixed a group-index crash in HTML dist scanning found by the first run.
- Shipped `91d469a` (guard v2) + `6374fe7` (stamps); production verified serving `6374fe7`.

**Decisions:**
- Calibration first: surveyed the codebase — all 46 `/images/mock/` refs are static literals (already covered), zero concat/CSS-url patterns exist today; this is regression armor, not a current-bug fix.
- Known limitation, documented: cross-file const prefixes (`const base = '/x/'` exported then templated elsewhere) are not tracked.

**Git State:**
- SHA: `6374fe7` — pushed, live, working tree clean.

---

## Session — 2026-09-22 · Asset-reference build guard (Buffy M3)

**Done:**
- Added `scripts/check-asset-references.mjs` (`npm run check:assets`): scans `src/**` + `index.html` for absolute-path asset references and fails when the file does not exist in `public/`. Handles query strings, percent-encoded segments, and code-context anchoring so placeholder text (e.g. `https://…/preview.mp4`) and template-literal tails are not false positives.
- Wired at the front of `npm run build` and into `npm run check`, so local builds and the GitHub Actions deploy (which runs `npm run build`) both fail fast on missing assets.
- Verified: 86 references pass on the clean tree; reintroducing the `/pngwing.com.png` reference fails with the exact file/line; the ProjectPage placeholder is not flagged.
- Shipped `6f219f4` (guard) + `fa819e8` (stamps); production verified serving `fa819e8`.

**Decisions:**
- Gate lives in the build itself (not the CI workflow), so every entry point (local, Actions, break-glass) is covered with no workflow changes.
- No allowlist entries needed today; escape hatch exists via `KATOA_ASSET_ALLOWLIST` if a legit external case appears.

**Git State:**
- SHA: `fa819e8` — pushed, live, working tree clean.

---

## Session — 2026-09-22 · Prod smoke test, OnlyFans logo fix, donation-QR cleanup (Buffy M3)

**Done:**
- Verified production serves `5166edf` (Family Payment Core, Cam via Aider) via deploy watchdog; fast-forwarded local main and ran the full suite green: 299/299 tests (29 new payment-core), typecheck + lint clean, 26/26 routes prerendered, secret-hygiene gate passed.
- Browser smoke test of katoa.org: `/explore`, `/comparison`, `/u/paul_music` — no error boundaries, SW v18 controlled, creator profile healthy. Found 1 broken image on `/comparison`.
- Fixed the OnlyFans logo: `FeeComparison.tsx` referenced `/pngwing.com.png`, an asset never committed; Cloudflare's SPA fallback served HTML with HTTP 200 so it broke for every visitor. Added `public/onlyfans-logo.svg` (official Simple Icons glyph, brand blue #00AFF0). Pushed `56fc5cc`; re-verified in prod — 0 broken images.
- Settled the long-standing `public/donations-qr.png` deletion: confirmed the static-PNG fallback in `DonateQRModal` was unreachable dead code (Footer passes constant onchain address + lightning URI; profile page guards on `onchain`), removed the branch and the asset in `f9e601d`. Verified the live donation drawer → QR modal still renders its in-browser QRCodeSVG in prod.
- Removed the leftover duplicate `public/donations-qr copy.png` (~97KB) in `49f3208` after confirming zero references.
- Refreshed build stamps at each tip (`f829a3d`).

**Decisions:**
- Brand logos come from verified upstream sources (Simple Icons) with brand color baked into the SVG, matching the existing tile pattern.
- The old PNG URL now returns Cloudflare's SPA fallback (200, text/html) — cosmetic only, nothing references it; noted because the same behavior masked the OnlyFans bug. An asset-reference build guard would catch this class of issue.
- Working tree is fully clean for the first time since July; every deploy verified by `scripts/check-deploy.mjs` before/after.

**Git State:**
- SHA: `49f3208433d89dc0a172b3ffe579ad61f82add35`
- Unpushed: none (all commits pushed and live in production)

---

## Session — 2026-09-21 · Skate Colombia video card polish (Buffy M3)

**Done:**
- Replaced the mismatched ocean/drone video on the featured Medellín project with a skateboard clip from Pexels: `9724317-sd_480_360_30fps.mp4`.
- Fixed the hero media treatment so the video stays clipped inside the card, fills the intended frame, and uses the existing skateboard cover image as its poster.
- Added an `alwaysPlay` mode to `MediaCard` for featured video heroes. The video remains mounted while the volume control toggles its real muted state instead of showing a decorative sound icon over a stopped video.
- Improved the featured card proportions and media height for mobile and desktop.
- Fixed a stray class-brace in the mobile creator shelf markup.

**Decisions:**
- Keep audio opt-in: videos start muted for browser policy and user control; the volume button is functional when the clip has an audio track.
- Keep the Skate Colombia story visually coherent: skateboard cover image, skateboard footage, Medellín project copy, and direct support CTA.
- No payment or settlement behavior changed.

**Verification:** `npm run check` passed with 270/270 tests, typecheck clean, 14 existing lint warnings; build passed with 26/26 prerendered routes; secret-hygiene gate passed.

**Git State:**
- Code and docs stamp are pushed in the current batch; existing `public/donations-qr.png` deletion remains untouched.

**Family note:** This is a reusable media-card pattern for family products: safe object-fit framing, explicit poster, muted-by-default audio, and a real user-controlled sound state.

---

## Session — 2026-09-21 · Skate card recovery after queued deployment (Buffy M3)

**Done:**
- Confirmed Git still contains the skateboard video in `ae74e11`; no work was lost by the Cloudflare redeploy attempt.
- Strengthened the featured media frame with explicit fixed heights and `!aspect-auto`, preventing the video aspect ratio from escaping the card.
- Kept the Skate Colombia Pexels clip and the functional `alwaysPlay` mute/unmute behavior.

**Deployment truth:** Cloudflare had `0834226` stuck in an active build for 27+ minutes while `ae74e11` was queued. Production remained on `1c27cce`; this is a deployment queue problem, not a missing source change.

**Verification:** `npm run check` passed with 270/270 tests, typecheck clean, 14 existing lint warnings; build passed with 26/26 prerendered routes; secret-hygiene gate passed.

**Git State:**
- Latest source fix is pushed after this entry; existing `public/donations-qr.png` deletion remains untouched.

**Next Cloudflare action:** Cancel the stuck `0834226` build, then let the newest deployment build and publish. Do not purge cache until the new deployment is marked Production.

---

## Session — 2026-09-21 · Route cache recovery + creator-world visual upgrades (Buffy M3)

**Done:**
- Diagnosed the live `/explore/` error boundary: the service worker had cached an old asset manifest, and missing hashed chunks were being served as HTML (`Failed to fetch dynamically imported module`). `/comparison` itself rendered correctly; it shared the same stale-cache risk.
- Hardened `public/sw.js`: bumped the static cache to `v18`, never caches `sw.js`, and rejects cached HTML when an asset is expected.
- Pushed `3b03be8` — route/cache fix plus immersive creator profile headers.
- Pushed `8f15e54` — mobile creator splash shelf now uses horizontal snap scrolling with a clear swipe cue.
- Pushed `1c27cce` — demo creator profiles now have richer story fallbacks; Paul and Skate Colombia have curated post drops like Luna and Sasha.
- Profile headers are now full-bleed beauty shots with blurred color wash, floating glass identity card, Demo preview treatment, and one dominant Support CTA.

**Decisions:**
- Keep `/comparison` as the long-form proof page, but make it resilient to the same stale asset-cache problem.
- Mobile discovery should feel like a visual story shelf, not a compressed desktop grid.
- Demo creators must feel like coherent mini-worlds while remaining clearly labeled demo content; no fake live payments or creator claims.

**Verification:** `npm run check` passed with 270/270 tests; typecheck clean; build passed with 26/26 prerendered routes; secret-hygiene gate passed; local preview verified `/explore/`, `/comparison`, and `/u/paul_music` without error boundary or broken images.

**Deployment note:** The cache fix is pushed to `origin/main`; production Cloudflare deployment and one fresh browser reload are still required to clear the already-installed v17 worker.

**Git State:**
- Current code tip before documentation stamp: `1c27cce`.
- Existing `public/donations-qr.png` deletion remains untouched.

**Family note:** Katoa remains the reference implementation. These changes are presentation, demo-content, and cache reliability work; the Family Payment Core contract is unchanged.

---

## Session — 2026-09-21 · Katoa visual simplification and beauty-shot pass (Buffy M3)

**Done:**
- Replaced the long homepage pitch-deck flow with a shorter creator-first path: hero → proof → curated demo shelf → four-step explanation → CTA.
- Expanded the homepage demo shelf to four distinct examples: Luna, Sasha, Medellín Skate Colombia, and Paul the musician. Removed the duplicate Trending/New sections.
- Simplified Explore by removing the duplicate video showcase, recently-viewed strip, and large vertical-chip wall. Full browsing remains in the project grid and optional map.
- Improved media cards with eager loading for priority beauty shots, stable `object-cover` framing, and a branded KATOA demo fallback when an image fails.
- Smoke-verified `/`, `/explore`, `/wishlist/luna-exclusive-videos`, and `/u/paul_music`; all had zero broken images and expected wishlist/profile links.

**Decisions:**
- Home is now a confident splash/product entry point, not the entire marketing site.
- Explore owns discovery depth; the homepage only gives enough examples to make the product feel real.
- Demo content stays visibly demo content; no fake live payment or creator claims were introduced.

**Verification:**
- `npm run check`: 270/270 tests, typecheck clean, 14 existing lint warnings.
- `npm run build`: green, 26/26 routes prerendered.
- Secret-hygiene gate passed.

**Done in follow-up visual batches:**
- `c568adf` — cinematic full-screen creator splash cards: one dominant portrait feature plus supporting portrait stories, handle, one-line story, and one CTA.
- `80cd64c` — segmented Explore browsing with `Projects`, `Creators`, and `Video` tabs; URL state remembers the selected segment.
- `04cceba` — shared premium `Demo preview` badge treatment across splash cards, project cards, and the demo banner.

**Verification:** `npm run check` passed with 270/270 tests, typecheck clean, 14 existing lint warnings; build passed with 26/26 prerendered routes; secret-hygiene gate passed.

**Git State:**
- Visual batch SHAs are pushed to `origin/main`; current tip is `04cceba`.
- Existing `public/donations-qr.png` deletion remains untouched.

**Family note:** Katoa remains the reference implementation; this is presentation work only and does not alter the Family Payment Core contract.

---

## Session — 2026-09-21 · Solo payment foundation and family template handoff (Buffy M3)

**Implemented locally, no live infrastructure:**
- Strict provider-agnostic intent matching for amount, kind, creator, wishlist, item, and tier.
- Staged Supabase migration `20260921000000_family_payment_core.sql` with payment intent fields, durable `payment_events`, RLS read policy, and atomic `increment_funding_totals` function.
- Existing signed webhook now follows append-event-first, mismatch rejection, pending-only update, idempotency, and atomic-total calls. It remains the only settlement writer.
- Shared payment UI now uses `intent`, `pending`, `confirming`, `settled`, `expired`, and `failed`, plus rail and `demo`/`staged`/`live` labels. On-chain shows `0 → 1 → 2 → 6+` confirmations.
- Subscription intent helper uses the same plug and metadata (`kind=subscription`, creator, tier); local unlock remains explicitly demo-only.
- Added creator Payment Audit foundation, provider-health model, and blocking MVP readiness checklist.
- Updated Katoa roadmap, Cam/THOR needs, and latest update for the family template.

**Verification:** `npm run check` passed with **270/270 tests**, typecheck clean, build passed with 26/26 prerendered routes, secret-hygiene gate passed, 14 existing lint warnings.

**Activation boundary for Kimi/THOR:**
- Do not apply the migration to production yet.
- Create/review the provider-neutral invoice proxy before adding any provider credentials.
- Run staging/funded testnet replay tests before production.
- Reconcile and health-check jobs remain un-deployed.
- No THOR, Umbrel, Start9, live node, or real-money connection was made.

**Family template note:** Katoa is the reference implementation. Family products should reuse the contract, metadata, states, rails, health labels, audit semantics, and readiness gates—not create another payment language.

**Git State:** Implementation SHA `54361b0` is pushed to `origin/main`; build/docs stamp follows. Existing `public/donations-qr.png` deletion remains untouched.

---

## Session — 2026-09-21 · Family Payment Core status + Give A Bit identity review (Buffy M3)

**Done:**
- Reviewed and documented Family Payment Core progress: Batch 1 contract (`2cfd461`), Batch 2 BTCPay plug (`59b4efc`), and docs handoff (`4ebb4ec`).
- Updated `docs/ROADMAP.md`, `docs/NEXT-NEEDS-CAM.md`, `docs/NOSTR-NIP05.md`, `docs/NOSTR-REMINDERS.md`, and `LATEST-UPDATE.md`.
- Reviewed Block’s [Buzz](https://github.com/block/buzz). Kept the useful model: signed event history, separate human/agent keys, scoped permissions, and human approval. Rejected copying its full relay/workspace/agent platform into Katoa.
- Documented a future shared namespace using full NIP-05 handles such as `name@giveabit.io` across the Give A Bit family.
- Documented the separation between NIP-05 discoverability, MotoPass passport credentials, and Satohash timestamps/proofs.

**Decisions:**
- NIP-05 proves domain-to-public-key mapping; it does not prove legal identity or KYC.
- Agent keys must be separate, scoped, expiring, revocable, and approved by a human.
- Do not build a global relay, automatic identity merger, broad autonomous agent, or second payment/identity contract yet.
- Current `/nip05` remains a local claim request copied for ops; platform nsec remains THOR-vault-only.

**Git State:**
- Documentation changes are local and not committed or pushed yet.
- Existing `public/donations-qr.png` deletion remains untouched.

**Next recommended order:** Batch 3 strict server amount/creator/tier matching → subscriptions → provider health/reconciliation → shared payment UI chips → family identity registry design.

---

## Session — 2026-09-21 · Family Payment Core Batch 2 — BTCPay plug (Buffy M3)

**Done:**
- Wrapped the existing `src/lib/btcpay.ts` client as `BTCPayPaymentPlug` using the Batch 1 contract.
- Added provider status normalization into family states.
- BTCPay intent creation stays `pending`; the client never writes settlement or database rows.
- Kept the existing signed `supabase/functions/btcpay-webhook` as the sole settlement writer and event source. It was not rebuilt.
- Added fake-client tests for invoice creation, status reads, state mapping, and the empty client event surface.
- No UI changes and no live node, THOR, Umbrel, Start9, secret, or credential changes.

**Decisions:**
- The client plug is intentionally not an event ledger; the signed webhook remains authoritative.
- `katoa_tx_id`, rail, and existing metadata travel through the existing invoice proxy boundary.
- No second payment contract was introduced. Katoa remains the family reference implementation.

**Verified:** `npm run check` passed with **262/262 tests**, typecheck clean, 14 existing lint warnings; secret-hygiene gate passed. Focused Batch 2 tests: 4/4.

**Git State:**
- Code SHA: `59b4efc` on `origin/main`.
- Unpushed: none.
- Existing `public/donations-qr.png` deletion remains untouched.

**Still outside this plug:** subscriptions, zaps, Lightning Address, LNbits, direct LND, Silent Payments, provider health/reconciliation, and the three shared UI chips. These wait for later batches.

**Kimi one-line note:** Katoa is the reference implementation of Family Payment Core; do not write a second contract.

---

## Session — 2026-09-21 · Family Payment Core Batch 1 (Buffy M3)

**Done:**
- Added the family-wide provider interface with `createIntent`, `getStatus`, and `listEvents`.
- Added canonical states: `intent → pending → confirming → settled | expired | failed`.
- Enforced direct Lightning settlement and the on-chain confirming step.
- Added append-first, idempotent event-ledger primitives with provider and amount checks.
- Added fake BTCPay, LNbits, and LND payload fixtures. No live node, THOR funds, credentials, or `VITE_*` secrets.
- Existing gifts, subscriptions, and webhook behavior were not changed in this batch.

**Decisions:**
- The frontend depends on the provider-neutral contract; infrastructure plugs remain behind it.
- `settled`, `expired`, and `failed` are terminal states.
- This is pure M3 code and test infrastructure. THOR/Umbrel/Start9 remains a later configuration and staging task.

**Verified:** `npm run check` passed with **258/258 tests**, typecheck clean, 14 existing lint warnings; secret-hygiene gate passed. Focused payment-core tests: 7/7.

**Git State:**
- SHA: `2cfd461` on `origin/main`.
- Unpushed: none.
- Existing `public/donations-qr.png` deletion remains untouched.

**Next batches:** wrap the existing server/client payment path as the provider plug, then add strict server-side matching. Do not connect THOR funds yet.

---

## Session — 2026-09-21 · Checkout, preview, and trust UX (Buffy M3)

**Three pushed batches:**
- `38eb19f` — mobile-first checkout sheet with larger touch targets, responsive QR, amount/method summary, and copy/wallet actions.
- `d730ea6` — creator preview readiness panel showing missing wallet, story, and profile details before sharing.
- `1bdbfb4` — supporter trust summary in checkout with destination, proof guidance, and explicit backend-confirmation boundary.

**Verified:** `npm run check` passed with **251/251 tests**, typecheck clean, 14 existing lint warnings; `npm run build` passed with 26/26 prerendered routes; secret-hygiene gate passed.

**Git State:**
- `origin/main`: `1bdbfb4` plus the final docs/build stamp below.
- No real-money or fake-confirmation behavior added.
- Existing `public/donations-qr.png` deletion remains untouched.

**Next gate:** production invoice → webhook → confirmed settlement, then live creator data and Nostr identity. Katoa is not MVP yet.

---

## Session — 2026-09-21 · Creator launch progress + wallet readiness + payment timeline (Buffy M3)

**Three pushed batches:**
- `67be386` — creator launch progress bar and persistent 100% “You’re ready to share” state.
- `ba0365a` — live wallet format feedback plus Settings “Ready to receive / Not ready to receive” preview.
- `0fe6a2e` — payment activity timeline for intent, pending, confirmed, demo, and expired states; receipt remains backend-gated.

**Verified:** `npm run check` passed with **251/251 tests**, typecheck clean, 14 existing lint warnings; `npm run build` passed with 26/26 prerendered routes.

**Git State:**
- `origin/main`: `0fe6a2e` plus the final docs/build stamp below.
- No real-money or fake-confirmation behavior added.
- Existing `public/donations-qr.png` deletion remains untouched.

---

## Session — 2026-09-21 · Creator launch path + payment edge + solo UX batches (Buffy M3)

**Three pushed batches:**
- `1d334aa` — first-wishlist one-screen setup: story, goal, visibility, product link, and publish choice.
- `a7c4228` — missing-wallet creator profile state: explicit “Not ready to receive yet,” disabled support CTA, no misleading payment readiness.
- `85e8e20` — payment handoff polish: expiry alert, one-tap retry, copy confirmation, and precise waiting language.

**Final verification:** `npm run check` passed (249/249 tests; typecheck clean; 14 existing lint warnings), `npm run build` passed with 26/26 prerendered routes, and the secret-hygiene gate passed.

**Git State:**
- `origin/main`: `85e8e20`.
- All three requested UX batches are committed and pushed.
- Existing `public/donations-qr.png` deletion was not touched.

---

## Session — 2026-09-21 · Creator launch path + payment edge + trust-first profile (Buffy M3)

**Done:**
- Reworked the dashboard creator checklist into one clear path: **add wallet → create wishlist → publish profile → share**. Live checks use wallet/profile/project visibility; demo checks stay local.
- Added `PaymentStatusStepper`: **Invoice created → Payment sent → Creator received**. The final state is visibly locked behind server confirmation; demo and pending states never claim settlement.
- Added `TrustFirstCreatorCard` to public creator profiles: wallet destination, copy controls, proof badge, “how verification works,” release attestations, and one support CTA in one obvious card.
- Wired the stepper into the payment modal and post-payment state without changing the existing non-custodial behavior.
- Updated roadmap/backlog/latest-update docs to say clearly: Katoa is **not MVP yet**. Real money remains THOR/backend work.

**Decisions:**
- No invoice, paid, or creator-received state is trusted from a browser click. `I paid (waiting)` remains waiting until the backend/webhook confirms.
- No new provider, secret, database migration, or real-money operation was introduced. This batch is fully M3-safe and solo-completable.
- Trust proof is an explanation and live verification entry point; missing proof is never styled as verified.

**Verified:**
- `npm run check`: typecheck passed, lint passed with 14 existing warnings, **249/249 tests passed**.
- `npm run build`: green; 26/26 routes prerendered.
- Existing pre-session deletion `public/donations-qr.png` was not touched.

**Git State:**
- Base pulled: `fb1c643` (`origin/main`).
- Local changes are not committed or pushed yet.

---

## Session — 2026-09-16 · "Released & Bitcoin-anchored" creator release attestations (Andrea · trust-UI port)

**Done:**
- Ported the family trust UI to Katoa (deliverable 3 of `t_da054829`). `src/components/trust/HowProofWorks.jsx` is a **byte-for-byte** copy of `kitsboy/satohash@origin/main` (verified by diff) — zero deps, every string overridable via `labels`. Only local addition is `HowProofWorks.d.ts`, the type surface so Katoa's strict `tsc` build can consume the `.jsx`.
- New `/verify` + deep link `/verify/:hash` (`VerifyReleasePage.tsx`): paste or share a SHA-256, it re-resolves against a real Bitcoin block. Footer gets a "Released & Bitcoin-anchored" link; `/verify` is in the sitemap + prerender list (26/26 routes).
- `ReleaseAttestation.tsx` — the creator release card. Verdict comes **only** from `verifyProof()` (`POST /api/verify`). Stored registry values are rendered as claims, never as a verdict.
- `public/attestations/releases.json` — claims-only registry schema (`katoa.release-attestations.v1`) with a `how_to_check_by_hand` block; one real platform release + one `demo: true` sample. No fabricated "verified" fields anywhere.
- i18n: `src/i18n/trust.ts` adds `trust.*` strings for all 7 locales (en/es/pt/fr/de/ja/zh), wired through `LanguageContext`; `i18nParity` stays green.
- Tests: `src/lib/__tests__/{verifyProof,releaseAttestations}.test.ts`, `src/components/trust/__tests__/{HowProofWorks,ReleaseAttestation}.test.tsx`, plus `e2e/verify-release.spec.ts` (network-stubbed honesty pinning). `vitest.config.ts` include glob widened to `.jsx` for the ported test.

**Decisions:**
- **Honesty contract**: nothing in `releaseAttestations.ts` returns a `verified` flag or invents a block — the registry is a list of CLAIMS. Only the live chain check may produce a verdict. `registry_status` is explicitly never rendered as proof.
- **Assurance requires the means to audit** (Andrea's doctrine): the `.ots` download sits next to the verdict every time, in both `ReleaseAttestation` and `HowProofWorks`. The live `ots_download_url` wins; the registry copy is only a pre-check fallback.
- The verify method is surfaced explicitly (`data-testid="verify-method"`, `data-method="bitcoind|esplora"`) — no silent third party. A forged/unresolved hash renders **"Not proven"**, never softened.

**Verified:**
- `POST https://api.satohash.io/api/verify` live-reconfirmed: `1ce9eb8b…b4f66` → `verified:true`, `verified_method:"bitcoind"`, block `967273`, `ots_download_url` present. All-zeros hash → HTTP **404** + `{verified:false, error:"Hash not found in registry."}` → correctly maps to `not-proven`.
- `npm test` 249/249 pass (32 files) · `npm run typecheck` clean · `npm run build` green, 26/26 prerendered.

**Follow-up fixes landed after first push (live smoke caught both):**
1. `functions/_middleware.js` `KNOWN_ROUTES` lacked `/verify` → hard 404 before the SPA could serve. Added `/verify` + `/verify/:hash` (commit `f9c9d31`).
2. Forged hashes: the API answers 404 (not 200), so `verifyProof()` threw → UI rendered "Waiting for Bitcoin" instead of "Not proven". Structured 4xx bodies with a `verified` field are now returned as verdicts (commit `4e66d6d`), pinned by 2 new unit tests + e2e 404 contract.

**Live-verified on production `https://katoa.org` (Playwright, real API):**
- `/verify` renders; deep link `/verify/1ce9eb8b…` → badge "Anchored to Bitcoin", method `bitcoind`, block 967,273, live `.ots` download link; `/verify/0000…` → "Not proven", no block; `/u/paul_music` → release attestations panel. Screenshots in the kanban task `t_2dd26ade`.

**Git State:** `4e66d6d` on `origin/main`. Unpushed: none.

---
## Session — 2026-08-27 · Breez donate + footer QR fix (Grok M3)

**Done:**
- Public donate drawer on Breez Spark: `katoa@breez.tips` + `bc1plz7d4utggmvzeuvc4h5eh9ej3wfjgcc33jc8rvemwgxjtfjpdr3syn3a89` (`e230fa5`).
- Cam: footer donate “did not work.” Google Charts Infographics QR URL is **HTTP 404**. Footer + enlarge modal now draw `lightning:katoa@breez.tips` in-page (`qrcode.react`, `e0c7626`). `getQrImageUrl` leftover callers → `api.qrserver.com`.
- Live-verified on katoa.org: Donate sats / ₿ FOSS opens drawer; LN + on-chain shown; SVG QR present; enlarge shows `katoa@breez.tips`; no Charts image.

**Decisions:** Public receive = Breez only (family `wallets.json`). Do not invent addresses.

**Git State:** SHA `e0c7626` on `origin/main`. Unpushed: none.

---
## Latest Session Summary (from 2026-08-24 goodbye)

**Chat Topic:** Night-jewel visual era + honest “creator support for everyone” MVP client path, then a full docs/pitch/exec refresh and clean goodbye.

**Key Things We Did**
- Pulled `main`, read handoffs, then YOLO: kill beige-on-cream contrast, night-jewel redesign, mobile chrome clearance, honest auth/wallets/profile/gifts.
- MVP client path: email + Google register; Nostr is check/link only; add/edit wallets; dummy addresses rejected; solid `/u/:username`; legal URLs; gift/tip Lightning follows the **saved wallet** (`6f43b74`).
- ELI16 spoken pitch (investor / 25-year-old / waitress) written, then folded into exec, marketing, diligence, and the 11-slide night-jewel deck.
- Docs/handoffs/pitch/exec updated for goodbye. Do **not** sync to M4 until Kimi says so.

**What We Finished**
- Product HEAD `6f43b74` on `origin/main` (gift dest uses wallet Lightning over stale profile field).
- Night-jewel UI live in CSS (`#0e0a18` / `#160e24`); beige `#dfd4c8` retired; changelog does not auto-open.
- Pitch deck: `docs/marketing/katoa-presentation.html` + PDF (11 slides, August 2026).
- Executive summary + MARKETING.md include the ELI16 pitch and an honesty box.
- Diligence pack (investor / architecture / ask) refreshed to 2026-08-24.

**What We Are Still Aiming to Finish (Cam / THOR)**
- Confirm Cloudflare Pages rebuilt after `6f43b74`.
- Lightning invoice → webhook → `confirmed` (`BTCPAY_WEBHOOK_SECRET` in vault only).
- Platform nsec in THOR vault; NIP-05 merge; NIP-07 challenge login Edge Function.
- Live `metrics.json` (keep sample / 11 demo creators until then).
- Replace local seams (subscribe / PPV / likes / comments / seen).
- Seed real creators with settled sats.

**Update / Status**
As of 2026-08-24, Katoa `main` product is `6f43b74`. M3 code for the visual era + honest MVP is pushed. This goodbye stamps docs, pitch, and exec on top. Production Lightning settlement remains THOR. Security: never fake `confirmed` in the browser; no secrets in git.

**Key Decisions / Notes**
- 0% is **platform** fee. Lightning routing fees still exist.
- Wallet Lightning **wins** over `profiles.lightning_address` for gifts (`pickReceiveDestinations`).
- Public SEO: do not use “OnlyFans alternative.” Internal comparison math may name competitors.
- Night-jewel, not beige, not `#000` slop.
- Pitch slide **bodies** in-app remain English (`/pitch` is `noindex`).

**Mission Tie-in**
Keep All That's Owed Always — creators keep 100%. Give A Bit sovereignty without lying about settlement.

**Finished in this session:** night-jewel + MVP client path + Lightning dest fix + ELI16 pitch + exec/marketing/deck/diligence/handoffs.

**Still to do:** THOR ops list above.

**Next for Kimi:** Integrate this summary into MASTER-BRAIN.md / Kanban / Obsidian vault. Confirm CF Pages + webhook/nsec/NIP-05. Educate Hermes. Use the giveabit-project-handoff skill. **Do not move or sync anything to M4 until you or Kimi say it’s time.**

**Git State:**
- Product SHA: `6f43b743251553f8c2f9a73bf5ae7cf51a1e591e`
- Docs/pitch/goodbye SHA: `dc82bb97bdf33f6b2591debd6d3fa37838bf1c67`
- Unpushed at goodbye start: none (`origin/main` was `6f43b74`).

---

## Session — 2026-08-24 (Grok M3) — Docs, pitch deck, executive summary, goodbye

**Done:**
- Refreshed `docs/EXECUTIVE-SUMMARY.md` (ELI16 pitch + honesty box + product HEAD `6f43b74`).
- Refreshed `docs/MARKETING.md` (ELI16, live CSS tokens, “what’s live to market”).
- Pitch deck night-jewel + honest MVP: HTML + regenerated PDF (11 slides). In-app `PitchPage` copy aligned (no fake “instant invoices”).
- Diligence pack, GROK-HANDOFF, ARCHITECTURE date, NEXT-NEEDS-CAM, README Lightning wording, LATEST-UPDATE, SESSION-SUMMARY.

**Decisions:**
- Market wallets + QR now; do not claim production invoices.
- ELI16 is the spoken pitch; honesty box always travels with it.

**Git State:**
- Product: `6f43b74` · docs stamp: `dc82bb9` on `main`.

---

## Session — 2026-08-24 (Grok M3) — MVP flow: auth, wallets, profile, legal

**Done:**
- Auth: email + Google register/sign-in; Nostr is **check/link only**; signup agrees to Terms/Privacy; no-KYC copy.
- Wallets: add **and edit** Lightning/on-chain; dummy bitcoin.org/example addresses rejected on save (`validateAddress.isDummyPaymentTarget`).
- Profile `/u/:username`: Tip/Follow/Message; owner “Edit addresses”; dummy destinations stripped; subscribe still demo-labeled.
- Legal: `/terms` `/privacy` + 404 SPA; KYC-not-us + Liquid/ZKP as roadmap copy.

**Do not regress:** local seams; no client `confirmed`; no fake Nostr session.

---

## MEGA HANDOFF — 2026-08-24 (Grok M3 → Kimi THOR)

**From:** Grok on M3 (`~/projects/katoa`)  
**To:** Kimi on THOR  
**Git:** `main` pushed through product `6f43b74` (gift dest) plus later docs/pitch stamp. MEGA below was written at `57782b2` — ops questions still apply; bump SHA to `6f43b74` when you hard-refresh.  
**Live:** https://katoa.org · CF Pages project `katoa`

Cam was in meetings. Grok shipped night-jewel + honesty + i18n + mobile clearance **without Cam**. **Security: never fake Lightning settlement. No secrets in git.**

### Kimi — please answer (ops only you can see)

1. Did Cloudflare Pages build `main` after `57782b2`? Hard-refresh katoa.org: header island **opaque plum**, footer clears the mobile dock, no beige hero.
2. Which Lightning rail is on THOR (BTCPay Greenfield / LNbits / LND REST)? Is `supabase/functions/btcpay-webhook` **deployed** with `BTCPAY_WEBHOOK_SECRET` in the vault only?
3. Platform **nsec** in THOR vault? Local `.nostr-platform-secret.local.json` gone?
4. NIP-05: process to merge claims into `public/.well-known/nostr.json`? (UI only copies a request.)
5. NIP-07 **challenge login** Edge Function — still a stub. Status?
6. Keep `metrics.json` labeled **sample** (`raw.demo: true`) until you confirm live counters.

Reply at the top of this file so M3 sees it next session.

---

### Product truth (do not regress)

| Surface | Truth |
|---|---|
| 0% fees | **Platform** fee. Lightning routing fees still exist. |
| Stats | `public/metrics.json` is a labeled sample (11 creators) until live counters. |
| Subscribe / PPV / likes / comments / seen | **localStorage seams**. Unlock ≠ paid. |
| Live gifts | Intent only. Browser never sets `sats_raised` / `confirmed`. |
| Auth Nostr CTA | Extension **check**, not a session. |
| Changelog | Does **not** auto-open (stole first taps). Marks version seen. |
| Visual | Night-jewel `#0e0a18` / `#160e24`. Violet product, orange money, cyan interactive. Beige `#dfd4c8` retired. Not `#000` slop. |

### Security (paramount)

- No `VITE_` payment secrets.
- Dummy bitcoin.org addresses rejected (`isDummyPaymentTarget`).
- Gift close ≠ thank-you.
- JSON-LD escaped (`toJsonLdScript`).
- CSP: no `unsafe-eval`. Google Charts still used for QR (`chart.googleapis.com`). `connect-src` ends with `https:` (wide) — **consider tightening after first-party QR**.
- SPA `/* /index.html 200`; `/assets/*` hard-404.
- NIP-05 CORS `*` on `/.well-known/nostr.json` (required).
- Live account delete = email `hello@giveabit.io` only. No fake wipe.

### Shipped this YOLO (after `5415902`)

Night-jewel CSS; opaque header/footer + safe-area; donate drawer unmounts; desktop nav uncrowded; one `<main>`; skeleton loader; PageShell on terms/privacy; NIP-07 chip + one receive QR; live dashboard wishlists; empty live dashboard = 3 actions (create uses **modal**, not `/project` no-slug); honest gifts; 7-lang `src/i18n/remaining.*.ts`; BreadcrumbList JSON-LD; `og:locale:alternate`.

**Tests:** 216 unit. Playwright landing (header/footer clearance), FAQ, dashboard, 404.

### Code leftovers (next M3, not blocking you)

- Pitch slide **bodies** still EN (`noindex`).
- QR still Google Charts.
- PageShell not on every inner page.
- First-wishlist one-screen wizard / draft autosave.

### Do not

- Code from THOR. M3 pushes; you do Docker/LND/vault.
- Fake “thousands of creators” or paid unlocks.
- Re-introduce beige or auto changelog modal.

---

## Session — 2026-08-24 (Grok M3) — Night-jewel YOLO: contrast, chrome, product, i18n

**Role:** M3 code only. Pushed `main`. Cam in meetings — completed without him.

### Done
- **Contrast:** killed beige `#dfd4c8` overlay that put cream text on light surfaces. Night-jewel: deep plum `#0e0a18`, aurora violet, near-white type, bitcoin-orange money CTAs. Not `#000` slop.
- **Chrome:** Navbar, footer, mobile dock, Button, Card, landing sections share one system. Donate drawer unmounts when closed (was covering the first viewport). Mobile CTAs full-width.
- **Honesty:** no 2.5K fallback, no “makes money when you succeed”, ZK/BOLT12/subscriptions are planned/demo, OF-alternative language out of public copy.
- **Dashboard:** live wishlists for signed-in creators; `/u/{username}` links; demo inbox no longer seeds live users; `/project` no-slug → dashboard.
- **Account:** on-chain wallets, validation, demo persist, kind-0 import, shipping list, honest Nostr (extension check, not login), `?next=`, forgot password.
- **Profile/commerce:** Tip/Follow/Message; dummy bitcoin.org address gone; gift close no longer fakes thank-you; PPV/subscribe stay local seams, labeled demo.
- **Docs/SEO:** exec, marketing, DESIGN, SEO-es/pt/fr/de/zh + new SEO-ja; SEO-sw N/A; OG 1200×630 `og-share.svg`.
- **i18n:** pillars, footer, FAQ (first 8), pricing features, comparison cells, landing meta in 7 langs. Parity test.

**Tests:** 209 unit. Playwright landing (desktop+phone), dashboard, creator-profile, creator-feed, wishlist-template green vs Vite.

**Still blocked (Cam/THOR):** Lightning invoice → webhook → `subscriptions` row; production nsec/NIP-05 merge; confirm CF Pages on this `main`.

**Do not regress:** likes/comments/PPV/seen stay local seams.

**Git State:**
- Tip: `ae53d98` on `origin/main` (handoff stamp). Night-jewel YOLO is fully pushed.

---

## Session — 2026-08-20 (Grok M3) — Landing page ember + highlight trim

**Role:** M3 code only. Pushed `main`.

### Done
- Retired beige `#dfd4c8` marketing theme. Home is dark ember (`--ember-950`) aligned with product + Give A Bit.
- Cards use highlight trim: orange 1px ring + inner white catch-light + deeper fill (`white/5`). Applied to bento, metrics, trust, onboarding, CTA, fee cards, glass `Card`.
- Navbar no longer switches to a light island on `/`.
- Tokens documented in `docs/DESIGN.md` and root `DESIGN.md` v3.
- e2e `e2e/landing.spec.ts` asserts dark background (not beige).

---

## Session — 2026-08-20 (Grok M3) — Close the five dashboard follow-ups

**Role:** M3 code only. Pushed `main`.

### Done
- Dashboard project cards use `CoverImageUpload` (compact dropzone). Demo persists object URLs; live uploads to `media`.
- BTCPay webhook Edge Function confirms txs + bumps sats (HMAC). Client `syncLiveInbox` polls confirmed gifts/follows into the notification center (idempotent ids). Never confirms from the browser.
- `fetchLiveEarnings` treats confirmed/completed/paid; empty wishlists → zero snapshot; dashboard Total Raised prefers `lifetimeSats` from confirmed txs.
- `/u/:username` loads Supabase profiles case-insensitively (`creatorProfile.ts`); live row wins even with 0 wishlists; mocks are fallback only.
- Onboarding `wishlist` auto-checks when demo wishlist storage has items (or live wishlist count > 0). Does not seed demo data on the landing page.

**Tests:** 180 unit. e2e dashboard / project-demo / creator-profile / creator-feed.

**Still blocked:** deploy webhook + `BTCPAY_WEBHOOK_SECRET`; confirm CF Pages; real Lightning.

---

## Session — 2026-08-20 (Grok M3) — Solo sprint: profiles, demo manage, earnings, inbox

**Role:** M3 code only. Pushed `main`. Version **1.1.7**. Parallel agents + parent integration.

### Done
- **Public creator profiles** at `/u/:username` (redirect `/profile/:username`). Luna/Sasha/skate prerender + sitemap. Dashboard/Explore/Wishlist/video cards link there.
- **Demo Manage loop:** `/project/skate-colombia` and `/project/studio-drops` load seeded wishlists from local storage (`demoProjectStore`). Create/edit/delete local.
- **Dashboard tabs:** Projects (search + bulk public/private/draft) · Wishlists · Earnings (`EarningsPanel` sparkline + recent gifts, demo-labeled).
- **Notification center** (local seam) in Navbar — bell, unread, seed demo inbox. Coexists with new-drop badge.
- **Cover video/image upload** restyled to design tokens; new `CoverImageUpload`.
- **i18n:** missing `dashboard.*` keys filled in es/pt/fr/de/ja/zh + creator.profile keys.
- Tests: 148 unit; e2e dashboard / project-demo / creator-profile / creator-feed / wishlist-template.

**Do not regress:** likes/comments/PPV/seen and notifications/earnings/subscriptions stay **local seams** until Nostr + Lightning webhook.

**Still blocked (Cam/THOR):** invoice → webhook → `subscriptions` row; production nsec/NIP-05; confirm CF Pages deployed this `main`.

---

## Session — 2026-08-20 (Grok M3) — Dashboard template polish

**Role:** M3 code only. Pushed `main`. Version **1.1.7** (no bump).

### Done
- Rebuilt `/dashboard`: welcome identity, honest stats (no fake Supporters/Views/“Coming soon”), shortcut chips, two-column projects + sticky rail.
- Demo session seeds two projects + following (Medellín / Luna / Sasha) so the page is not an empty shell; create/edit/delete persist locally.
- Loading skeletons, VisibilityBadge, onboarding checklist dark variant (auto-checks account + Lightning), Lightning-missing callout, referral campaign uses username.
- Public/manage links go to `/project/:slug` (was wrongly `/wishlist/:slug`). Followed creators no longer 404 on missing `/profile/:user`.
- Playwright `e2e/dashboard.spec.ts` (desktop + mobile, demo session).

**Do not regress:** likes/comments/PPV/seen stay local. Dashboard demo numbers are labeled by the global demo banner.

---

## Session — 2026-08-20 (Grok M3) — Wishlist template polish + un-squished tiers

**Role:** M3 code only. Pushed `main`. Version **1.1.7** (no bump).

### Done
- Subscription tiers were jammed into the 1/3 sidebar (`lg:grid-cols-3`) so Patron/Champion cards collapsed. They now sit in a **full-width** band with a 1-col → 3-col grid (`lg:grid-cols-3`).
- Redesigned `SubscriptionTiers` to match Pricing glass cards (bitcoin-orange popular, equal-height, no purple-pink scale-up).
- Wishlist template upgrade: cinematic wide hero, overlapping identity card (avatar / title / location / share / gift + progress), sticky support rail, theme picker collapsed, story + items no longer competing with a portrait OF header.
- Mock wishlists no longer default `card_style` to `creator` (Luna/Sasha still opt in). Creator post feed only renders when posts exist.
- Playwright: `e2e/wishlist-template.spec.ts` asserts three Lightning subscribe buttons sit in a row at 1280px and stack on 390px. Creator-feed e2e 3/3 still green.

### Decisions
- Tiers stay on demo + creator surfaces (`showSubscribe`). Real subscribe remains the local seam until LND/BTCPay webhook.
- Community pages (Medellín skate park) use the wide hero; creator pages keep the post feed above the two-column body.

### Git State
- HEAD: `e0e2757` (pushed)
- Prior: `7733c31` (Cam open-ops reminder)

**Open (unchanged):** Lightning invoice → webhook → `subscriptions` row · production nsec/NIP-05 · confirm CF Pages on latest `main`.

**Do not regress:** likes/comments/PPV/seen stay local until Nostr + Lightning backend.

---

## Session — 2026-08-20 (Grok M3) — Cam reminder: open ops + do-not-regress

**Role:** M3 code only. M3 `main` pulled to `0d94d02` (in sync with origin).

**Open (Cam / THOR — still live):**
- Real subscribe: Lightning invoice → webhook → `subscriptions` row (LND/BTCPay/LNbits on THOR)
- Production Lightning + webhook, platform nsec in the vault, NIP-05 claim ops
- Confirm Cloudflare Pages deployed latest `main`

**Do not regress:**
- Likes, comments, PPV, and “seen” stay local until Nostr + Lightning backend exist. Do not regress that.

---

## 2026-08-19 (Kimi/THOR — Standard Project Kit adopted + debrief + repo re-sync)

**Scope:** Standard Project Kit rollout + first machine-readable session debrief + repo sync check.

**Done:**
- Adopted the senior-engineer **Standard Project Kit** (skill `standard-project-kit`): investigate → bounded implement → verify real system → milestone tag → handoff; two-actor loop (Kimi assistant + Grok/Aider coder). Default build/handoff method for ALL projects.
- Session debrief now runs **automatically at session end** (silent, machine-readable YAML) via the `/goodbye` pipeline.
- Wrote first debrief: `docs/debriefs/session-2026-08-19-001.yaml`.
- Re-synced `/root/ref/katoa` from origin — was 39 commits behind; now at `8c9c3a4`.
- Verified live: `https://katoa.org` → HTTP 200.

**Git State:**
- Tip SHA: `8c9c3a4`; in sync with origin/main.

**Open (unchanged, still live):** see OF-PARITY-ROADMAP + MAP-DISCOVERY-ROADMAP remaining batches.

**Do not regress:** likes/comments/PPV/seen are local seams until Nostr + LND backend · SW tile cache (LRU 1000) · `dist/`/build not committed (CI builds).

---

## Session — 2026-08-16 (Grok M3) — OF-parity P1–P4: 10 solo engagement/discovery items

**Role:** M3 code only. Pushed `main`. Version **1.1.7** (no bump this pass).

### Done — OF-parity solo backlog (see docs/OF-PARITY-ROADMAP.md)
1. **Locked-post blur previews (P1)** — locked post cards/modal now blur the media (OF-style tease) instead of a full black overlay; lock chip + price + CTA.
2. **PPV unlock demo (P2 client)** — per-post unlock persisted locally + toast; real flow is the Lightning-invoice spec.
3. **Manage-subscription UI (P2 client)** — `ManageSubscriptionPanel` shows tier, since (relative), unsubscribe; wired into WishlistPage.
4. **Interactive likes (P4)** — heart toggles on cards + modal, persisted per post, count updates live; like state survives reload.
5. **Comment posting (P4)** — comment input in the modal, persisted locally, merged with mock comments.
6. **Home creator grid (P3)** — `CreatorDiscoveryGrid` on the home page: trending / new sections reusing `CreatorVideoCard`.
7. **Creator search by vertical/tag (P3)** — `filterCreators` lib (query + vertical tags) + live follower count; search box + vertical chips on home.
8. **New-drop unread badge (P4)** — `CreatorNewDropsBadge` in the nav (desktop + mobile) counts unseen new posts from subscribed creators; feed shows a "new" pill + per-post NEW chip (`isNew` mock flag).
9. **Engagement lib** — `src/lib/creatorEngagement.ts` (likes/comments/PPV/seen stores) + `getSubscription`; 13 new unit tests (121 total).
10. **i18n** — 27 new `creator.*` keys × 7 languages; `e2e/creator-feed.spec.ts` (subscribe→manage panel, PPV unlock, like).

### Decisions
- Likes/comments/PPV/seen stay **local seams** (same posture as subscriptions) — real zaps/comments/DB state come with Nostr + the LND backend.
- New-drop badge is mock-driven (`isNew` flag on 2 posts) until real post creation exists.
- Fixed a flaky e2e race surfaced by the new suite: ChangelogModal auto-opens at 1.5s in fresh contexts and intercepts clicks — tests now pre-seed `katoa_changelog_seen` (JSON-encoded, since `getStorage` parses).

### Git State
- HEAD: `a9d4be3` (pushed) · Prior: `1c16bd0` (offline tiles batch)
- Verify: `npm run check` (121 tests) · `npm run build` ✓ · Playwright 8/8 ×3 ✓

---

## Session — 2026-08-16 (Grok M3) — Offline vector tiles (SW tile cache) + map init race fix

**Role:** M3 code only. Pushed `main`. Version **1.1.7** (no bump this pass).

### Done — map fully offline after first view (see docs/MAP-DISCOVERY-ROADMAP.md batch 5)
1. **SW caches OpenFreeMap vector tiles** — `public/sw.js` intercepts `tiles.openfreemap.org` (style JSON, `.pbf` vector tiles, glyphs, sprites) into persistent Cache Storage `katoa-map-tiles-v1` (cap 1,000, LRU eviction, stale-while-revalidate online). Map works fully offline after first view — no MapLibre code changes needed (tile requests flow through the page fetch).
2. **Fixed a map init race (double canvas)** — the init effect assigned `mapRef.current` only after `await loadMerchants/loadEvents/loadAreasAt`; when the `center` deps changed mid-init (ExplorePage `mapCenter` updates as wishlists load async), cleanup ran with `mapRef.current` still null → first map's canvas leaked → second init appended another canvas to the same container (flaky, ~1/5 loads). Fix: register `mapRef.current` immediately after `new maplibregl.Map(...)` + bail out of the async chain after each `await` when cancelled.
3. **Tests** — Playwright offline flow added to `e2e/map.spec.ts`: first view → SW takes control → reload → assert tile cache non-empty → `context.setOffline(true)` → reload → map canvas still renders. Map e2e 3/3 ×3 runs (was flaky), full 5/5, units 108.

### Decisions
- Tile caching lives in the existing SW (not MapLibre) — works for both map components with zero library changes; same-origin shell assets were already SW-cached.
- Kept LRU eviction (1,000 entries) so the tile cache can't grow unbounded on long exploration sessions.

### Git State
- HEAD: `4eec62a` (pushed) · Prior: `7061b85` (batch 4 handoff SHA)
- Verify: `npm run check` (108 tests) · `npm run build` ✓ · Playwright 5/5 ✓

---

## Session — 2026-08-16 (Grok M3) — MapLibre + OpenFreeMap vector parity (#18)

**Role:** M3 code only. Pushed `main`. Version **1.1.7** (no bump this pass).

### Done — map roadmap complete (see docs/MAP-DISCOVERY-ROADMAP.md batch 4)
1. **Leaflet → MapLibre GL v6 migration** — `UnifiedBTCMap` + `KatoaPinsMap` rewritten on MapLibre; `leaflet` + `@types/leaflet` deps removed. Markers are now DOM elements (`buildPinElement` + `maplibregl.Marker`), popups use `maplibregl.Popup`, grid clustering uses `map.project([lon, lat])`, zoom control is `NavigationControl`.
2. **OpenFreeMap vector basemap** — `styles/dark` (dark theme) ↔ `styles/liberty` (light theme) via `map.setStyle` (live swap, camera preserved). Same renderer + style family btcmap.org uses.
3. **Everything preserved** — incremental load + offline cache, events layer, areas chips, place drawer + comments, activity strip, contribute/share/remember-view, category filters, i18n popups, KATOA pin rings, theme detection.
4. **Infra** — CSP `worker-src 'self' blob:` (MapLibre blob worker) + explicit `connect-src tiles.openfreemap.org`; vite manualChunk `leaflet` → `maplibre`; index.css `leaflet-*` → `maplibregl-*` (controls, popup theme `btcmap-maplibre-popup`).
5. **Tests** — lib tests swapped to `MAPLIBRE_STYLE_*` / `mapLibreStyleUrl`; Playwright smoke now asserts `.maplibregl-canvas` (WebGL + vector style render).

### Decisions
- Kept the custom grid clustering (markers as DOM elements) instead of MapLibre GeoJSON sources — preserves the existing render-key perf skip and pin CSS without a layer-spec rewrite.
- `styles/dark` for dark theme (Dark Matter fork) matches the old CARTO dark_all look; `styles/liberty` for light (btcmap.org's default light style).
- Bundle: maplibre-gl ships as its own lazy chunk (`maplibre-*.js`, ~259 kB gzip) loaded only when the map mounts.

### Git State
- HEAD: `dc650ee` (pushed) · Prior: `ac1435b` (batch 3 handoff SHA)
- Verify: `npm run check` (108 tests) · `npm run build` ✓ · Playwright 4/4 ✓

---

## Session — 2026-08-16 (Grok M3) — Map discovery batch 3: P3 parity & polish

**Role:** M3 code only. Pushed `main`. Version **1.1.7** (no bump this pass).

### Done — map P3 (see docs/MAP-DISCOVERY-ROADMAP.md)
1. **Theme-aware basemap** — CARTO `light_all` tiles for light theme; detects OS `prefers-color-scheme` + `.lp-page` / `[data-theme="light"]` ancestor; `tileLayer.setUrl` swaps live (map not recreated).
2. **Offline place cache** — localStorage merged places (cap 600, 24h TTL) + per-place details (cap 200); map seeds from cache for instant render and works offline; detail write-through on fetch. `savePersistedPlaces` / `loadPersistedPlaces` / `savePersistedPlaceDetail` / `loadPersistedPlaceDetail` / `clearPersistedMapCache`.
3. **Marker perf** — memoized merchant divIcons per place (`merchantIconFor` cache), rAF-throttled `moveend` (was 450ms setTimeout), render-fingerprint skip so pans don't re-cluster/rebuild unchanged markers.

### Decisions
- Persistence is localStorage (not IndexedDB) — merged-place + detail sets are small and TTL-capped; full btcmap IBD-style sync is overkill for a widget.
- Theme detection is conservative: OS scheme + light wrapper class; dark glass UI chrome (search/toolbar/legend/popups) stays as-is on both tile sets.

### Git State
- HEAD: `279a775` (pushed) · Prior: `dfe20cf` (batch 2 handoff SHA)
- Verify: `npm run check` (108 tests) · `npm run build` ✓ · Playwright 4/4 ✓

---

## Session — 2026-08-16 (Grok M3) — Map discovery batch 2: 10 solo items shipped

**Role:** M3 code only. Pushed `main`. Version **1.1.7** (no bump this pass).

### Done — map & discovery batch 2 (see docs/MAP-DISCOVERY-ROADMAP.md)
1. **Incremental load on pan** — `mergePlaces` by id + `haversineKm` halo pruning; no more clear-and-refetch flicker; 400-place render cap + "Load more here" (+200/click).
2. **KATOA pin vertical color ring** — `katoaPinColor(category)` tints photo-pin ring + fallback teardrop (ExplorePage passes `category`).
3. **Events layer** — `GET /v4/events`, purple 📅 pins filtered to viewport, date/link popup, persisted layer toggle.
4. **Areas-here chips** — `GET /v4/areas?lat=&lon=` for map center; chips link to area pages.
5. **Place detail drawer** — right-side panel on merchant click: full fields, description, comments, OSM/directions/report/website links.
6. **Read-only comments** — `GET /v4/places/{id}/comments` (top 2) inside the drawer.
7. **Activity strip** — `GET /v4/activity?places=<visible ids>&days=7`; type glyphs + relative time; click flies to place.
8. **Contribute flow** — toolbar ➕ opens OSM note prefilled with map center; drawer gets report-issue + suggest-edit links.
9. **Share map view** — toolbar button copies `?lat&lon&zoom&place` URL with toast.
10. **Remember last view** — last center/zoom persisted; restored when no URL params.
- 25 new `map.*` i18n keys × 7 languages; `e2e/map.spec.ts` Playwright smoke (map mounts, toggles, share, search focus).

### Decisions
- **Areas layer adapted:** `GET /v4/areas` returns no geometry/bbox → chips + links instead of boundaries (documented in roadmap).
- **Contribute uses OSM note deep-link** (`note/new?lat&lon`) — that's the funnel btcmap.org itself uses to ingest new places; no btcmap.org add-place URL exists publicly.
- Merchant markers now open the detail **drawer** on click (popup builder stays in lib for tests/embeds).
- Events are viewport-filtered (`bounds.pad(0.2)`) so global upcoming events don't flood the map.

### Git State
- HEAD: `87fda6b` (pushed) · Prior: `eccc285` subscription seam
- Verify: `npm run check` (103 tests) · `npm run build` ✓ · Playwright 4/4 ✓

---

## Session — 2026-08-16 (Grok M3) — Subscription client seam + handoff spec

**Role:** M3 code only. Pushed `main`. Version **1.1.7**.

### ⭐ HANDOFF TO NEXT LLM (Grok / Kimi on Hermes)
- **Real subscribe flow is SPEC'd and ready to build server-side:** see **`docs/SUBSCRIPTION-FLOW-SPEC.md`**.
- It needs the **LND server on THOR** — tie in via BTCPay Greenfield, LNbits API, or LND REST. The client scaffold (`src/lib/btcpay.ts`) + webhook stub (`supabase/functions/btcpay-webhook/`) already exist; secrets go in THOR's vault, never in git/`VITE_*`.
- Client seam is done: `src/lib/subscriptions.ts` (localStorage demo) + `subscribed` prop wired through `CreatorPostFeed`/`CreatorPostModal`/`WishlistPage`. Replace `subscribeLocal` with invoice → webhook → DB.
- **All other Cam/THOR/LND requirements:** `docs/NEXT-NEEDS-CAM.md` (Lightning, webhook, platform nsec vault, NIP-05 ops, seed creators).

### Done this pass
- `docs/SUBSCRIPTION-FLOW-SPEC.md` — backend handoff (DB table, invoice metadata, webhook, LND rails, acceptance criteria).
- `src/lib/subscriptions.ts` + tests — subscribe/unsubscribe/isSubscribed (local seam).
- "Subscribed" state unlocks locked posts in `CreatorPostFeed` + `CreatorPostModal`; Subscribe button flips to "Subscribed ✓".
- `WishlistPage` `handleSubscribe` (demo) + toast.

### Git State
- HEAD: `eccc285`
- Prior: `c453ada` post modal · `d0f854a` creator feed
- Verify: `npm run check` (90 tests)

---

## Session — 2026-08-16 (Grok M3) — OnlyFans-parity P1: creator post feed

**Role:** M3 code only. Pushed `main`. Version still **1.1.7**.

### Decisions (confirmed with Cam)
- **Content:** tasteful creator content now; adult/18+ later as a config flag.
- **First surface:** creator profile + post feed.
- **Model:** hybrid — subscriptions + tips + wishlists on one profile.
- Plan captured in `docs/OF-PARITY-ROADMAP.md`.

### Done
- `CreatorPostFeed` — stats strip (subscribers/posts/likes), 3-col post grid, locked-post overlay (subscribe or PPV sats), Subscribe CTA.
- `mockCreatorPosts` — tasteful PG-13 posts for Luna + Sasha (locked + PPV examples).
- `formatCompactCount` (1.3K / 2.4M) + tests.
- Wired into `WishlistPage` for `card_style === 'creator'`; 8 `creator.*` i18n keys × 7 langs.
- `CreatorPostModal` — full-size post view (media + caption + tasteful comments + Tip/Subscribe); locked posts show the paywall in the modal. Click-to-open on post cards.

### Git State
- HEAD: `c453ada`
- Prior: `d0f854a` creator feed · `352708f` map batch 1 · `4ace79b` map batch 1
- Verify: `npm run check` (87 tests)

### Next (P1 → P2)
- Post detail modal (caption/likes/comments/tip)
- Real subscribe → Lightning invoice (BTCPay) + persisted unlock state (needs Cam/THOR)
- Discovery/home creator grid (P3)

---

## Session — 2026-08-16 (Grok M3) — Map discovery batch 1: i18n + clustering + deep-links + filters

**Role:** M3 code only. Pushed `main`. Version still **1.1.7** (no bump this pass).

### Done — map & discovery (see docs/MAP-DISCOVERY-ROADMAP.md)
1. **Popup i18n (7 langs)** — 12 `map.popup*` keys; `buildMerchantPopupHtml` accepts `BTCMapPopupStrings` (English defaults); merchant + KATOA popups localized.
2. **Marker clustering** — 64px grid `clusterPlaces()`; count badges; zoom-in on click; re-clusters on `zoomend` without refetch.
3. **URL state sync + place deep-link** — `parseMapViewParams` / `buildMapViewQuery`; reads `?lat=&lon=&zoom=&place=` on init, writes on `moveend` via `replaceState`; `revealPlace(id)` shared by search + deep-link.
4. **Merchant category filter chips** — 6 categories (food/shopping/stay/services/fun/travel) + All; client-side filter before clustering; `merchantCategoryFor` helper.
5. **KATOA pin cover thumbnails** — circular photo pin w/ orange ring for safe http(s) `cover_image`; teardrop "K" fallback; `sanitizeImageUrl` guards inline-style injection.
6. **Search keyboard nav** — combobox/listbox a11y: arrow keys, Enter, Escape; active-option highlight + scroll-into-view.

### Decisions
- Clustering is a custom grid implementation (no `leaflet.markercluster` dependency) to keep the bundle small.
- `place` is one-shot: reveal → next `moveend` replaces it with lat/lon/zoom.
- Category filter is client-side over already-fetched places (btcmap-api v4 places/search has no category param).

### Git State
- HEAD: `352708f` (map batch 1 + pin thumbnails + search keyboard nav)
- Prior: `4ace79b` map batch 1 · `56bf8bb` docs handoff · `9d38deb` map popups/icons/search
- Unpushed: none (pushed after this entry)
- Verify: `npm run check` (85 tests)

### Still needs Cam / THOR
- Unchanged: Lightning/BTCPay, NIP-05 ops, platform nsec vault, seed creators → `docs/NEXT-NEEDS-CAM.md`

### Kimi (THOR)
- Roadmap live: `docs/MAP-DISCOVERY-ROADMAP.md` (batch 1 shipped; next: KATOA pin richness, search keyboard nav, incremental pan load)

---

## Session — 2026-08-11 (Grok M3) — Solo 10-pack + map glory + agent docs

**Role:** M3 code only. Pushed `main`. Version **1.1.7**.

### Done — product (10-pack)
1. Tip menu presets (21k / 50k / custom) on wishlist + Settings tip presets (local)
2. Favorites export / share / download pack (Explore)
3. Wishlist visibility badge (draft / private / public)
4. DM blocked users list (localStorage)
5. Unread messages badge (local) — Navbar + MobileNav
6. Explore vertical filter chips (`?vertical=`)
7. PWA “Add creator” shortcut copy prompt
8. a11y pass — Messages + Creators (+ guidelines titles)
9. Playwright smoke `/messages` opt-in (`e2e/messages.spec.ts`, port **4177**)
10. i18n EN/ES/PT/FR/DE/JA/ZH for tip/favorites/visibility/messages/PWA/creators/a11y/map search

### Done — Explore map (BTC Map)
- **Basemap fix:** dead OpenFreeMap raster URL → CARTO dark Leaflet tiles (`be044e6`)
- Removed full `logo2.png` map markers (logo smear); orange **K** teardrops + cyan merchant pins
- Kept BTC Map features: layer toggles, locate, fit, expand, `api.btcmap.org` merchants
- **Richer popups:** hydrate via `GET /v4/places/{id}` (phone, hours, verified, comments, website)
- **Category icons:** Material `icon` → emoji on pins (`materialIconGlyph`)
- **Search box:** `GET /v4/search/?q=` with map-center bias; fly to place/area

### Done — agent / Obsidian discovery
- `.ai_docs/ecosystem-links.md`, `project-summary.md`, `context-map.md` alias, `current-status.md`
- **`.ai_agent/README.md`** cross-site index (metrics, handoffs, sibling slugs)
- Aligned with giveabit/satohash family pattern for future multi-site labels

### Decisions
- DM prefs / tip presets / unread = **local-only**
- NIP-17 still **opt-in + NIP-07 only**; no nsec in repo
- OpenFreeMap is **vector-only** (MapLibre); Leaflet uses CARTO raster (btcmap.org uses MapLibre + OFM styles)
- Public btcmap-api needs **no API key** for places search/detail/search
- Playwright base URL port **4177** (avoids other apps on 4173)

### Git State
- HEAD: `9d38deb` (map popups/icons/search + .ai_docs)
- Prior: `be044e6` basemap fix · `63f364f` 10-pack · `a1590c1` handoff docs
- Version: **1.1.7** · Unpushed: none
- Verify: `npm run typecheck` · `npm test` (72)

### Still needs Cam / THOR
See **`docs/NEXT-NEEDS-CAM.md`** + **`docs/NOSTR-REMINDERS.md`**:
- Lightning / BTCPay / webhook live
- Platform nsec → THOR vault
- NIP-05 live verify + claim merge process
- CF Pages confirm deploy of `9d38deb`
- Seed creators / growth (human)

### Kimi (THOR)
- Pull handoff into vault if desired
- Optional: mirror `.ai_docs` + `.ai_agent` pattern on any sibling still missing ecosystem-links
- Do **not** expect M3 to touch MASTER-BRAIN

---

## Session — 2026-08-11 (earlier) — Solo 10-pack product UX only

**Git (superseded):** `63f364f` · v1.1.5 — see full session block above for complete day.

---

## REMINDER — 2026-08-11 — Nostr rollout + vault nsec

**Safe rollout:** (1) NIP-05 live verify (2) relays+CSP (3) NIP-65+zaps (4) NIP-17 chat later.

**Not this pass:** Edge NIP-07 login · dynamic creator@katoa.org · self-hosted relay · full NIP-17 UI · commit nsec.

**Cam action:** Backup `.nostr-platform-secret.local.json` → THOR vault, then delete local. Without nsec cannot sign as katoa@katoa.org.

See `docs/NOSTR-REMINDERS.md`.

---

## 2026-08-10 — Kimi/THOR: Lighthouse sweep (DONE, deployed)
Full site optimization sweep completed end-to-end (sw.js 206-crash fix, console-error elimination, a11y + SEO + security pass). See LATEST-UPDATE.md (top) for per-site summary + commit. Scores re-verified by Kimi. Before touching code, re-check the live Lighthouse state; do not regress: sw.js cache guards (status 200 only), CSP analytics allowlist, image width/height attrs, aria-labels on form controls.

# KIMI → GROK HANDOFF — 2026-07-20 (THOR mega ops + less-chat + HQ v2.5 + memory)

**From:** Kimi on THOR  
**To:** Grok on M3  
**Read before coding this session.**

## TL;DR for Grok
Ops on THOR was cleaned and automated. **You still own all code on M3** (`~/projects/*` → `git push`). Do not SSH to THOR for coding. Keep writing `docs/KIMI-HANDOFF.md` after sessions.

## Machine roles (hard)
| Machine | Who | Does |
|---------|-----|------|
| **M3** | Grok | Code only in `~/projects/` → push |
| **THOR** | Kimi | Docker, LNbits/LND, crons, vault docs, HQ deploy |
| **M4** | — | DEPRECATED |

## What shipped on THOR (you need awareness)

### HQ glass (kitsboy/HQ) — v2.5+
- Live: https://hq.giveabit.io
- Password **gate** + browser **Vault** (keys never in git)
- Live pipes: `api.satohash.io/metrics.json`, status pinger
- Status matrix: GH Actions every 15m + THOR `hq-status-refresh` every 30m
- After HQ UI work: push main; CF Pages auto/manual as before
- Pull latest HQ on M3: `cd ~/projects/HQ && git pull`

### Satohash proof plane
- API live: https://api.satohash.io/health + `/metrics.json` (`gab.product-metrics.v1`)
- Runtime on THOR Docker; SPA still CF Pages from your pushes
- Keep `VITE_API_URL` → `https://api.satohash.io` when building SPA
- Family clients: thin satohash-client in suite repos

### Less-chat ops (Cam preference)
- Cam reads **OPS-PULSE** / morning Telegram pulse before opening chats
- You should still not spam handoffs — one clear `docs/KIMI-HANDOFF.md` entry per session is enough
- SEO/design weekly jobs are **change-gates** (silent if no commits) — your pushes reopen the gate

### Automations (do not duplicate on M3)
| Job | Cadence |
|-----|---------|
| Morning pulse | daily 07:30 TG script |
| HQ status refresh | 15m GH + 30m THOR |
| GitHub scan | every 6h |
| Learn loop | Sunday |
| EU / kanban / LNbits digests | **weekly** (not daily) |

### Memory (Hermes)
- Built-in MEMORY/USER denser + limits raised
- External: **holographic** local provider ON
- Cam uses `/goal` and `/learn` on THOR — optional for you on M3 if Hermes available

## What Grok should do on EVERY project session
1. `git pull origin <default-branch>` first  
2. Read this file (or repo `docs/KIMI-HANDOFF.md` top entry)  
3. Read `AGENTS.md` + `GROK-SESSION-PROTOCOL.md`  
4. Code → test → commit → push  
5. **Append** your handoff at top of `docs/KIMI-HANDOFF.md` (or dated file) and push  
6. Never commit secrets / `.env` / macaroons  

## Repo-specific notes
| Repo | Branch | Note |
|------|--------|------|
| giveabit | main | Parent + NIP-05; CF auto |
| satohash | main | API on THOR; SPA CF; metrics.json live |
| katoa | main | CF; manual deploy path may still apply |
| stranded | main | CF auto |
| tadbuy | main | CF |
| motopass | main | CF |
| sherpacarta | main | CF |
| openstrata | **talent** | default branch talent |
| btcminiscript | main | lib/docs |
| HQ | main | ops glass; gate+vault; status.json bot commits OK |

## Doc suite standard (keep current)
Root: `AGENTS.md`, `GROK-SESSION-PROTOCOL.md`, `README.md`, `SOURCE-OF-TRUTH.md` (code), `DILIGENCE.md` (live), `docs/KIMI-HANDOFF.md`, diligence packs as needed.

## Do NOT
- Deploy LNbits/LND/Docker from M3  
- Assume M4 is active  
- Re-open status chats for green suite — Cam uses pulse/HQ  
- Put invoice keys or PATs in repo files  

## Safe Harbour + giveabit.io
All public outputs stay Bitcoin-sovereign + Safe Harbour.

— Kimi · THOR · 2026-07-20

---

## Session — 2026-07-19

**Machine:** M3 (Grok)
**Project:** katoa

### Done
- [x] Thin Satohash timestamp client: `src/lib/satohash.ts`
  - `sha256Hex`, `stampHash`, `getApiHealth`, `verifyUrl`, `stampGuideUrl`
  - API base: `VITE_SATOHASH_API_URL` || `https://api.satohash.io`
  - Frontend links: `VITE_SATOHASH_URL` || `https://satohash.io`
  - POST `/api/stamp` with `X-Satohash-Client: katoa`, optional `X-Satohash-Key`
  - GET `/health`
- [x] Vitest: `src/lib/__tests__/satohash.test.ts` (12 tests)
- [x] Minimal UI: Settings → Advanced → “Timestamp with Satohash” (profile snapshot stamp + API check + verify link)
- [x] Env: `vite-env.d.ts` + `.env.example` for Satohash vars (no secrets committed)

### Decisions
- Client only calls Satohash HTTP API; public OTS calendars stay server-side
- Optional family key via `VITE_SATOHASH_KEY` or `stampHash({ apiKey })` — do not commit real keys
- Wired on Settings Advanced (non-breaking); lib is reusable for explore/export later

### What's Next
- Optional: stamp wishlist export / share payload from ShareButton or map export
- Wire family key server-side (proxy) if paywall blocks public stamps without L402

### Git State
- SHA: `61a15b29a28bc7c29b1ad44da15ee392e8a6a3bb` (feat: `d22f64b`)
- Branch: main

---

*Safe Harbour · Part of the [Give A Bit](https://giveabit.io) family.*

## Handoff to Kimi — 2026-07-06

**Machine:** M3 (Grok)
**Project:** katoa

### Done
- [x] Batch 3A (101–120): ConfirmDialog + toast replace all confirm()/alert(); i18n confirm/error strings; focus-visible; aria-labels
- [x] Batch 3B (121–140): Lucide per-route split; lazy SocialProofTicker/OnboardingChecklist; memo hot components; explore pagination; FeeComparison URL sync
- [x] Batch 3C (141–160): pageStrings i18n for dashboard/wishlist/about/comparison/explore (7 langs); Intl formatting in SatsDisplay
- [x] Batch 3D (161–180): About mobile accordions; wishlist item reorder; dynamic OG meta; comparison earnings slider + breadcrumbs
- [x] Batch 3E (181–200): SW v2; generate-sitemap.mjs; ContributorsWall polish; pitch a11y; EmptyState in PaymentMethodManager
- [x] Hero/nav refresh (`c65d1ed`): HeroOverlayCard, HeroMotionBackground, floating island Navbar

### Decisions
- Removed monolithic lucide manual chunk — icons now split per route (ExplorePage chunk larger, other routes smaller)
- Wishlist item reorder is viewer-local via localStorage, not creator DB sort_order
- PageMeta moved into WishlistPage for dynamic OG; fixed canonical path to `/wishlist/:slug`

### What's Next
- Further lucide tree-shaking on ExplorePage (698KB chunk)
- Full i18n for remaining hardcoded strings on About/Comparison body copy
- Backend: Supabase live data, BTCPay wiring (out of scope for frontend batches)

### Git State
- Last commit SHA: 1373ea1e568e7c1bc835332e4aca4a339ca3605c
- Branch: main
- Unpushed: none

---

*Safe Harbour · Part of the [Give A Bit](https://giveabit.io) family.*

## Handoff to Kimi — 2026-07-06 (docs pass)

**Machine:** M3 (Grok)
**Project:** katoa

### Done
- [x] Audited and updated all stale project docs to match codebase @ `c65d1ed`
- [x] README.md — removed Bitcoin Pulse/Protocol Updates, updated structure, scripts, handoff paths
- [x] docs/DESIGN.md — floating island nav, hero overlay card, motion CSS classes
- [x] docs/ARCHITECTURE.md — 57 components, 17 pages, PWA, removed widgets note
- [x] docs/DIRECTORY-MAP.md — React Router v6, routes table, quick facts
- [x] docs/EXECUTIVE-SUMMARY.md, ROADMAP.md, GROK-HANDOFF.md — July 2026 status
- [x] docs/I18N.md — full LanguageContext + pageStrings documentation
- [x] docs/SEO.md — filled template placeholders with KATOA data
- [x] public/content/updates.md — replaced wrong Saint-Martin content with v1.1.0 changelog
- [x] .ai_docs/context_map.md + docs/.ai_docs/context_map.md — current counts and removed components
- [x] LATEST-UPDATE.md — session one-liner

### Decisions
- Kept ROADMAP.md implementation phases intact; added "Completed Since Last Review" snapshot at top
- Did not regenerate full DIRECTORY-MAP tree (600+ lines); updated Quick Facts + routes + key components instead

### What's Next
- ExplorePage Lucide chunk optimization
- Prerender/SSR for SEO (see docs/SEO.md audit)
- Backend: BTCPay wiring, Supabase live data (out of scope for docs pass)

### Git State
- Last commit SHA: b23dcd88c2af663f403f00fb80dcf49648e2f080
- Branch: main
- Unpushed: none

---

*Safe Harbour · Part of the [Give A Bit](https://giveabit.io) family.*

## Latest Session Summary (from 2026-07-06 goodbye)

**Chat topic:** Multi-batch KATOA frontend modernization (200 improvements, hero/nav refresh, full docs sync) — all frontend-only, live on katoa.org.

**Finished in this session:**
- Charcoal/glass UI across 17 pages / 57 components
- Batches 3A–3E: ConfirmDialog, toast, i18n pageStrings, lazy routes, PWA v2, sitemap, dynamic OG
- Hero motion + floating island navbar (`c65d1ed`)
- Removed BitcoinPulse, ProtocolUpdates, LightningField
- All project docs synced (`b23dcd8`); `SESSION-SUMMARY-2026-07-06.md` created

**Still to do:**
- ExplorePage Lucide chunk (~698KB)
- About/Comparison remaining i18n
- Prerender/SSR for SEO
- BTCPay + Supabase live wiring (backend/Kimi ops)

**Next for Kimi:** Integrate into MASTER-BRAIN / Kanban / Obsidian vault. Read `SESSION-SUMMARY-2026-07-06.md` + `docs/EXECUTIVE-SUMMARY.md`. No raw chat logs needed.

### Git State (final)
- Last commit SHA: 65afe72
- Branch: main
- Unpushed: none
- Live: https://katoa.org

---

*Safe Harbour · Part of the [Give A Bit](https://giveabit.io) family.*

## Handoff to Kimi — 2026-07-07

**Machine:** M3 (Grok)
**Project:** katoa

### Done
- [x] Landing hero redesign (`25eb6e8`): creator-forward light aesthetic (rose/cream, OnlyFans-inspired)
- [x] Live wishlist product screenshot mock in hero header (Medellín skate park mock data)
- [x] Light `lp-*` design system across homepage sections, trust bar, CTA panel
- [x] Navbar `nav-island-hero-light` variant for homepage scroll-top state

### Decisions
- Product showcase built as HTML/CSS mock (not static PNG) using `mockWishlists` data — stays sharp at all sizes
- Dark product UI inside browser frame contrasts against light hero (common creator-platform marketing pattern)
- Full landing page moved to light theme for cohesion; other site pages remain dark charcoal

### What's Next
- User feedback on hero direction; may tune imagery or extend light theme to footer
- FeeComparison component may need light-theme polish on homepage section

### Git State
- Last commit SHA: cf9eb6d
- Branch: main
- Unpushed: none

---

## Handoff to Kimi — 2026-07-07 (favicon + landing palette)

**Machine:** M3 (Grok)
**Project:** katoa

### Done
- [x] Full warm landing palette across homepage (`dedb007`): `lp-*` classes, FeeComparison `variant="landing"`, SectionHeader/OnboardingChecklist light theme
- [x] Favicon from logo2 brush mark (`4aa1e92`, `09cb2dd`): `public/logo2.png`, all favicon sizes, manifest PWA icons, `index.html` links
- [x] Regenerated favicon.ico (285KB → 5KB); SW cache bumped to v7

### Decisions
- User path `/Users/cam/Desktop/Images/image/logo2.png` not on M3 — used identical file from `~/Downloads/Sats (1).png` (same MD5 as `public/logo2.png`)
- Navbar/footer still use `/sats.png`; only favicon/PWA icons switched to logo2 brush mark

### What's Next
- If Cam has a different `logo2.png`, copy to `public/logo2.png` and regenerate favicon sizes
- Optional: align navbar logo with new favicon for brand consistency
- Footer still dark below warm `lp-page` — user may want transition

### Git State
- Last commit SHA: 09cb2dd
- Branch: main
- Unpushed: none

---

## Handoff to Kimi — 2026-07-07 (200 upgrades)

**Machine:** M3 (Grok)
**Project:** katoa

### Done
- [x] 200 upgrades in 8 batches of 25, each committed and pushed to main
- [x] Batch 1 (`de76eae`): PageMeta noindex/lang, ErrorBoundary, Button a11y, CSP headers, favicon QR fix
- [x] Batch 2 (`d6c4846`): Full nav i18n (7 langs), Auth UX, home pillars translated, FAQ desktop link
- [x] Batch 3 (`e5be00f`): Input/Modal/Toast/Link/Tooltip/ShareButton/CurrencySelector polish
- [x] Batch 4 (`1c86952`): Page SEO/a11y — Explore JSON-LD, FAQ, Contact honeypot, noindex pages
- [x] Batch 5 (`0cb669c`): PWA v8, manifest shortcuts, BTC price fallback, CSS a11y
- [x] Batch 6 (`77097c7`): Types/unions, clipboard enum, debug log removal, RouteTransition focus
- [x] Batch 7 (`abb408f`): robots.txt, COOP/CORP headers, semantic breadcrumbs
- [x] Batch 8 (`a668494`): Route announcer, explore preload, FeeComparison scope, STORAGE_KEYS
- [x] `npm run build` passes after batch 8

### Decisions
- Batched commits for clean deploy history on Cloudflare Pages
- navUiStrings block added to LanguageContext for shared nav/demo/pwa/changelog keys

### What's Next
- Monitor Cloudflare deploy for CSP header regressions
- Typecheck still has pre-existing errors (MediaUpload, DashboardPage Supabase types) — not introduced by upgrades

### Git State
- Last commit SHA: a668494
- Branch: main
- Unpushed: none

---

## Handoff to Kimi — 2026-07-07 (40 upgrades post-BTC map)

**Machine:** M3 (Grok)
**Project:** katoa

### Done
- [x] Batch 4A (`b687143`, upgrades 1–20): map layer persistence, UnifiedBTCMap polish (locate/fit-all/escape popups), contact+faq i18n (7 langs), logo2 branding across Footer/Navbar/FeeComparison/PageMeta, PWA sw v9, manifest screenshots, offline logo2, dark Leaflet zoom, Explore aria-live
- [x] Batch 4B (`a828d3f`, upgrades 21–40): index.html OG/Twitter logo2-512, PaymentMethod/WalletAddress double-submit guards, type-safe selectors, comparison sticky table header, ContributorsWall aria-label
- [x] `npm run build` passes

### Decisions
- Contact/FAQ strings split into `contactPageStrings` / `faqPageStrings` blocks in LanguageContext for maintainability
- Chip click on map still uses preventDefault (flies map, blocks nav) — intentional for now

### What's Next
- Consider letting map chips navigate on second tap or add explicit "open" button
- Pre-existing typecheck errors (MediaUpload, DashboardPage) unchanged

### Git State
- Last commit SHA: a828d3f
- Branch: main
- Unpushed: none

---

## Handoff to Kimi — 2026-07-07 (100-fix audit complete)

**Machine:** M3 (Grok)
**Project:** katoa

### Done
- [x] Batch 5A (`2e502ad`): All TypeScript errors fixed; database.ts expanded; asRow/asRows helpers
- [x] Batch 5B (`cd33199`): Full i18n pass (7 langs) + removed 4 dead components
- [x] Batch 5C (`1f0c076`): Branding logo2, hreflang, map chip UX, URL filter sync, validation, a11y
- [x] Batch 5D (`c5cf9c9`): ESLint clean (0 errors); Vitest 14 tests; `npm run check`
- [x] Batch 5E: Prerender wishlist routes, dashboard empty i18n, hooks cleanup

### Decisions
- Supabase joins simplified to flat queries + asRow/asRows casts (staged types lack FK metadata)
- FAQ/legal body copy stays English; UI chrome fully i18n'd
- Vitest unit tests for lib helpers only (no E2E yet)

### What's Next
- Regenerate database.ts from live Supabase when schema stable (`npm run db:types`)
- Add Playwright smoke tests for auth/explore flows
- FAQ Q&A content translation if needed for non-EN markets

### Git State
- Last commit SHA: 99a667e
- Branch: main
- Unpushed: none

---

## Handoff to Kimi — 2026-07-07 (creator video cards + 50 upgrades)

**Machine:** M3 (Grok)
**Project:** katoa

### Done
- [x] Batch 6A (`cc1f5ff`): Creator video cards (OnlyFans-style layout), MOV/MP4/WebM/M4V upload (200MB), Luna + Sasha mock creators on `/explore`, hover video preview, `?videos=1` filter, prerender routes
- [x] Batch 6B (`c043f9a`): 50 polish upgrades — Spanish video i18n, mute/unmute (7 langs), validateAddress refactor, CoverVideoUpload on ProjectPage, VideoObject JSON-LD, ogVideo, PWA sw v11, sitemap, tall skeletons, dashboard hints, cross-page creator copy
- [x] `npm run check` + `npm run build` pass (22 tests)

### Decisions
- "Sexy" examples use subscription-platform UI (#00aff0, tall cards, exclusive badge) with tasteful Pexels stock video — no explicit imagery
- Showcase section shows first 2 creator cards; deduped from main grid
- `card_style: 'creator'` drives tall hero on WishlistPage and CreatorVideoCard in Explore grid

### What's Next
- Verify live deploy: https://katoa.org/explore shows Luna + Sasha with hover preview
- Test `/explore?videos=1` filter and `/wishlist/luna-exclusive-videos` hero
- Consider avatar images for Luna/Sasha mocks (currently null)

### Git State
- Last commit SHA: c043f9a
- Branch: main
- Unpushed: none

---

## Latest Session Summary (from 2026-07-07 goodbye)

**Chat topic:** Creator video cards on explore, MOV uploads, 50 upgrades, then live bug fixes for clipped progress bars and missing video previews.

**Finished in this session:**
- Creator video showcase (Luna + Sasha) with OnlyFans-style UI on `/explore`
- MOV/MP4/WebM/M4V upload support (200MB)
- ~50 polish upgrades (i18n, SEO, PWA, validateAddress, CoverVideoUpload, etc.)
- Fixed progress bar clipping on all explore cards (flex layout + `overflow: visible` on card footer)
- Fixed video previews: added CSP `media-src`, lazy-mount video on hover so posters always show

**Still to do:**
- Verify live deploy: cover images visible, hover plays video on Luna/Sasha cards
- Test `/explore?videos=1` on production
- Optional: avatar images for mock creators, navbar video hint

**Next for Kimi:** Integrate into MASTER-BRAIN / Obsidian. See `SESSION-SUMMARY-2026-07-07.md` for full notes. Do not sync to M4 until Cam says so.

### Git State
- Last commit SHA: fdef859
- Branch: main
- Unpushed: none

---

*Safe Harbour · Part of the [Give A Bit](https://giveabit.io) family.*
## Session — 2026-07-09

**Done:**
- Comprehensive security audit fixes (no code change during audit; remediations applied after)
- Migration `20260709000000_security_hardening_audit.sql`: pending-only transaction inserts, lock contributions, drop open supporter/leaderboard/notification writes, private not enumerable + `get_wishlist_by_slug` RPC, public profile read, storage INSERT owner-folder, SECURITY DEFINER search_path, funding triggers only on `confirmed`
- Gift flow: no client `completed` status; amount validation; dismissible payment modal; pending intent only
- Nostr password=pubkey auth **disabled** (secure challenge auth needed via Edge Function)
- BTCPay: no client API keys/webhook secrets; proxy-only invoice create
- ProtectedRoute for dashboard/settings/project
- Storage uploads under `{userId}/...`
- follows table name alignment; auth/signup loading + profile save error handling
- A11y: reduced-motion, toast assertive errors, settings tabs, lang option roles, JSON-LD escape
- CSP tightened (base-uri, frame-ancestors, connect allowlist + https fallback)

**Decisions:**
- Private wishlists: not listable via SELECT; single-slug access via SECURITY DEFINER RPC
- Funding totals only after server marks `confirmed` (never client `completed`)
- Nostr sign-in UI remains but returns clear security error until Edge Function exists

**Git State (mid-session notes — superseded below):**
- Migration and deploy completed later same session

---

## Latest Session Summary (from 2026-07-09 goodbye)

**Chat topic:** Adversarial security/reliability/a11y audit → remediations → Cloudflare Pages + Supabase production ship.

**Finished in this session:**
- Full audit report (Critical–Informational) then code fixes without leaving critical gaps open
- Migration `20260709000000_security_hardening_audit.sql` **applied** to Supabase `pglqjtipbocjnqmiwmwf`
- Client: pending-only gifts, Nostr weak-auth disabled, BTCPay no client secrets, ProtectedRoute, storage paths, a11y/CSP
- **Deploy:** Cloudflare Pages project `katoa` via `wrangler pages deploy` (token: Pages:Edit in `motopass/.env.local`)
- Live: https://katoa.org + https://katoa.pages.dev — bundle `index-5mqaIOJd.js`, hardened CSP from `public/_headers`
- Removed mistaken Netlify path (`netlify.toml` deleted); CF-only forever

**Still to do:**
- Edge Functions: BTCPay webhook → `confirmed`; Nostr signed challenge auth
- Real payment idempotency / rate limits / CI secret scan
- Audit CF Pages env: no `VITE_BTCPAY_*` secrets
- Optional cleanup of any legacy Nostr pubkey-password accounts

**Next for Kimi:** Integrate into MASTER-BRAIN / Obsidian / Kanban. See `SESSION-SUMMARY-2026-07-09.md`. Do not sync to M4 until Cam says so. Deploy recipe: build → strip crossorigin → `wrangler pages deploy dist/ --project-name katoa --branch main`.

### Git State
- Last commit SHA: `65ea16ca8a2dbc86d6f985408194ddc17f46c7cf` (+ docs goodbye commits if any)
- Branch: main
- Unpushed: none after goodbye push

### Deploy
- Platform: **Cloudflare Pages only** (project `katoa`)
- Preview deploy: https://eae0eb32.katoa.pages.dev
- Production: https://katoa.org

---

*Safe Harbour · Part of the [Give A Bit](https://giveabit.io) family.*

## Session — 2026-07-15

**Done:**
- 100 autonomous upgrades in 4 batches (7A–7D): infra/SEO, a11y/i18n, UX/workflow, tests
- Sitemap wired into build; SearchAction fix; 4 wishlist prerenders; auth/pitch noindex
- CI workflow (npm run check + build); removed unused deps; SW v13; security.txt
- PageMeta og:locale + hreflang cleanup; full share/auth/error i18n; Explore infinite scroll
- Dashboard error toasts; 40 tests passing (was 22); Modal component tests added

**Decisions:**
- Sitemap excludes /auth and /pitch (noindex pages); prerender still covers pitch for direct links
- Explore uses IntersectionObserver infinite scroll with button fallback

**Git State:**
- SHA: `fcd371c`
- Unpushed: none

---

## Latest Session Summary (from 2026-07-15 goodbye)

**Chat topic:** `/whatsup` recovery → 100 autonomous upgrades (7A–7D) → push to main.

**Finished in this session:**
- 100 upgrades: SEO/sitemap pipeline, a11y/i18n, UX (Explore infinite scroll, Dashboard toasts), tests 22→40
- CI workflow; removed unused deps; SW v13; security.txt; SearchAction fix; 4 wishlist prerenders
- All commits pushed; `SESSION-SUMMARY-2026-07-15.md` created

**Still to do:**
- Edge Functions: BTCPay webhook + Nostr challenge auth
- Real payment idempotency; CF env audit (no `VITE_BTCPAY_*`)
- Verify CF Pages deploy picked up `fcd371c`

**Next for Kimi:** Integrate into MASTER-BRAIN / Obsidian / Kanban. See `SESSION-SUMMARY-2026-07-15.md`. Do not sync to M4 until Cam says so.

### Git State (final)
- Last commit SHA: `fcd371c`
- Branch: main
- Unpushed: none
- Live: https://katoa.org (CF deploy may lag latest push)

---

*Safe Harbour · Part of the [Give A Bit](https://giveabit.io) family.*

