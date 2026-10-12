# Katoa — Last Updated 2026-10-12 by Buffy

Brief: Settings receive-identity register and Payment Methods wallet tab, WalletAddressManager silent-payment descriptor support, `/demo` demo hub, and docs reconciled to the current build. This session’s work was built, committed, and pushed.

**Done:**
- Settings wallet tab is now labeled `Payment Methods` and the profile receive section includes a `Receive identity` register plus `Open Wallet to add on-chain or silent`.
- `WalletAddressManager` can add a Silent Payment Descriptor (`silent:` / `sp:` placeholder, icon, and format validation).
- `src/lib/validateAddress.ts` and `src/types/database.ts` now include silent-payment descriptor validation plus `silent` in the wallet address types.
- `/demo` is now an honest demo hub: sample creator links, display-currency switcher, language switcher, sample tip presets, and sample-only copy. `/demo/test` routes to the same page.
- Settings uses react-router `Link`/`RouterLink` for in-app public-profile and messages shortcuts.
- Added `docs/STORAGE-CDN.md` to keep R2 as default and document cheap upgrade-ready alternatives.
- Reconciled `docs/KIMI-HANDOFF.md` and `docs/LATEST-UPDATE.md` to the current tip and left Kimi a demo-hub spec question.

**Verification:** typecheck clean; lint clean except 4 pre-existing Navbar warnings; `npm test -- --run` **316/316 tests passed**; 48 test files; `npm run build` green with 26/26 prerendered routes and asset-reference checks; version/metrics/sitemap regenerated after the final build.

**Final repo state:** `git status` clean except for the throwaway `tmp/` dir. `public/metrics.json`, `public/version.json`, and `src/generated/app-version.ts` are build-generated stamp files refreshed by the last green build.

**Git state:** Pushed commit `5e4ceb8` to `origin/main`. Public build label is `v1.1.7+444.29a9cf8` with gitSha `29a9cf8` and commitCount `444`. Working tree is otherwise clean; remote `origin/main` matches local.
