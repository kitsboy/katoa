## Session — 2026-10-23 · PageMode /demo wrap + SW CACHE_NAME-from-build (Buffy M3)

**Done:**
- One-fingerprint-per-page (PageMode): wrapped `/demo` in the same `<article className="lp-page" data-theme="dark">` root that `HomePage` already uses, with its own `aria-labelledby="demo-hero-title"` and a matching `<span id="demo-hero-title" className="sr-only">Meet Luna — KATOA Demo</span>` title anchor. The root `</div>` that used to close the route is now the closing `</article>`, same shape as HomePage.
- Added the DemoPage route-context fingerprint guard into `src/lib/__tests__/PageModeHome.test.tsx` (the file that already owned the HomePage page-mode guard). Tests prove: root article wrapper present, correct closing `</article>` (not a bare `</div>`), and the dedicated sr-only heading id exists.
- Highest-leverage non-PageMode independent item claimed from the remaining list: `SW cache-name-from-build`. `public/sw.js` now declares `const CACHE_NAME = 'katoa-static-@BUILD_COMMIT@'` (a build-time placeholder) instead of a hard-coded `katoa-static-v18`. `scripts/write-version.mjs` replaces `@BUILD_COMMIT@` with the current git sha on every prebuild run, so a normal deploy rotates the cache name automatically and an old cached `sw.js` cannot pin the stale asset manifest forever. Guard: `src/lib/__tests__/swCacheName.test.ts` asserts the shipped `public/sw.js` defines `CACHE_NAME = katoa-static-<current-sha>` and that no build placeholder remains in the file.

**Verification:**
- `npx vitest run src/lib/__tests__/PageModeHome.test.tsx` → 6/6 (3 HomePage + 3 DemoPage fingerprints).
- `node scripts/write-version.mjs` stamps `public/sw.js` with `katoa-static-<sha>` and prints `sw: katoa-static-<sha>`.
- `npm run typecheck` clean, `npx vitest run src/lib/__tests__/swCacheName.test.ts` → 2/2.
- `npm run check:fast` → 489 tests / 67 files, lint 0 errors (9 pre-existing warnings), asset guard clean.
- `git push` pushed the batch twice: once after the restore commit (`b02337e` re-applies the SW change that the then-latest demo-PageMode batch had reverted at HEAD), once after the stamp regen commit (`ea1af19`). Origin/main now points at HEAD and a fresh `git fetch origin main` confirms the server already has the pushed tree.

**Decisions:**
- Kept PageMode to the two routes that already own the `lp-page` article fingerprint (HomePage, DemoPage). /demo was the only other non-CSP page that still had a bare `<div className="min-h-screen bg-charcoal-950">` root, so it was the clean next target, not a whole-app PageMode wrapper.
- Kept the SW change self-contained: only `public/sw.js`, `scripts/write-version.mjs`, and its dedicated test. The test reads the live `public/sw.js` and `git rev-parse --short HEAD` at runtime — same file+git-shape pattern as the cspOrigins / cspEtag guards — so it breaks loudly if someone hard-codes the cache name back in.
- When the demo-PageMode batch (just landed) reverted the already-committed sw.js / write-version.mjs edits at HEAD, I re-applied the SW change in its own restore commit rather than folding it into the demo commit, then refreshed the generated stamps in a separate commit. That left the SW change intact and pushed cleanly through the double push.

**Git state:**
- HEAD: `ea1af19` (pushed). `origin/main` == `HEAD`.
- Unpushed: none.
- Working tree clean after the stamp commit. Stashed the freshly regenerated `public/version.json` / `src/generated/app-version.ts` diff, re-ran `write-version.mjs`, re-added and committed it, then pushed. No uncommitted stamp leftovers remain.
- Push path verified twice (origin push dry-run + actual push + post-push `git ls-remote origin main` + `git fetch origin main`). Server already holds `ea1af19` as `refs/heads/main`.
