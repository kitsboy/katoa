# KATOA — Last Updated 2026-08-20 by Grok

Brief: Landing page dark ember + highlight-trim cards; beige marketing theme retired.
Commit: `cc3bca4`

Prior: Wishlist template polish at `e0e2757`.

## What landed
- `SubscriptionTiers` redesigned as glass pricing cards in a full-width band (`lg:grid-cols-3`).
- Wishlist page: wide cover, identity card, sticky donate rail, collapsed theme picker.
- Playwright coverage for desktop row + mobile stack on `/wishlist/medellin-skate-park`.

Prior: OF-parity solo backlog at `a9d4be3`.

## What landed (OF-parity P1–P4 solo items)

1. **P1 blur previews** — locked posts show blurred media + lock chip instead of a full overlay (OnlyFans-style tease).
2. **P2 client** — per-post PPV unlock demo (persisted + toast) and a "You're subscribed" manage panel (tier, since, unsubscribe).
3. **P4 engagement (local seams)** — interactive like buttons on cards/modal, comment posting in the modal, both persisted; real zaps/comments come with Nostr + LND.
4. **P3 discovery** — `CreatorDiscoveryGrid` on the home page (trending / new, reusing `CreatorVideoCard`) with search by vertical/tag and live follower counts (`filterCreators` lib).
5. **P4 notifications** — `CreatorNewDropsBadge` in the nav counts unseen new posts from subscribed creators; feed shows a new-drop pill + NEW chips.
6. **i18n + tests** — 27 new `creator.*` keys × 7 languages; `creatorEngagement`/`creatorSearch` libs (+13 tests); `e2e/creator-feed.spec.ts` (subscribe → manage panel, PPV unlock, like).

## Verified
- `npm run check` 121 tests ✓ · `npm run build` ✓ · Playwright 8/8 ×3 ✓ (also fixed a ChangelogModal flake that intercepts clicks in fresh e2e contexts)

Prior: offline vector tiles SW cache at `4eec62a`. Map roadmap complete; OF-parity P2 backend (Lightning invoices, DB subscriptions) still needs Cam/THOR.
