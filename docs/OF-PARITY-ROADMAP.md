# KATOA — OnlyFans-parity roadmap ("close to OF, but way better")

Drafted 2026-08-16 · decisions confirmed with Cam.

## North star

Rebuild KATOA's creator surface around the OnlyFans *model* — subscription creator profiles with a feed of posts, locked/paywalled content, PPV, and subscriber counts — on top of KATOA's already-shipped Bitcoin spine.

**"Way better" = the differentiation we keep front and center:**

| OnlyFans | KATOA |
|----------|-------|
| 20% platform cut | **0% — creators keep 100%** |
| USD, bank/Paxum payout, days | **sats, instant non-custodial Lightning** |
| Closed, deplatforming risk | **open source, Nostr identity, self-sovereign** |
| Subscription + PPV + tips | same model, every price in sats |

## Confirmed decisions

1. **Content policy:** tasteful creator content now; adult/18+ as a future config flag (age gate + legal review when enabled).
2. **First surface:** creator profile + post feed (the OF core).
3. **Model:** hybrid — subscriptions + tips + wishlists coexist on one profile.

## Current state (baseline)

- `WishlistPage` = wishlist/gift model with OF-style styling (`card_style: 'creator'` tall hero, `CreatorVideoCard`, `SubscriptionTiers`, tip menu, DMs, verticals).
- Missing the OF core: a **post feed**, **locked posts**, **subscriber counts on profile**, **PPV posts**, likes/comments.
- Mock creators `luna-exclusive-videos` / `sasha-vip-content` already carry `subscriber_count`.

## Phases

### P1 — Creator profile + feed (in progress)
- [x] `mockCreatorPosts` data model (media, caption, likes, locked, PPV price)
- [x] `CreatorPostFeed` — stats strip, 3-col post grid, locked overlay (subscribe / PPV), Subscribe CTA
- [x] Wire into `WishlistPage` for `card_style === 'creator'`
- [x] Post detail modal (media + caption + comments + Tip/Subscribe)
- [ ] Per-post "locked" blur instead of full overlay on unlocked thumbnails

### P2 — Subscription paywall
- [ ] Real subscribe flow: tier selection → Lightning invoice (BTCPay) → subscriber state persisted
- [ ] Subscriber-only feed + unlock state (localStorage until DB is authoritative)
- [ ] "You're subscribed" state + manage-subscription UI

### P3 — Discovery + home
- [ ] OF-style creator grid on home (trending / new / top), reuse `CreatorVideoCard`
- [ ] Creator search by vertical/tag, follower counts

### P4 — Engagement
- [ ] Zaps as likes (reuse `nostr-tools` zap path); comments
- [ ] Follow vs subscribe distinction (Nostr kind-3 contacts)
- [ ] Notifications / unread badge (extend existing local unread)

### Needs Cam / THOR (blocked)
- BTCPay/Lightning invoice + webhook for real subscribe paywalls
- Platform nsec vault for NIP-07/NIP-05 + signed kind-0 (follow graph)
- Seed real creators + content moderation policy (tasteful now, adult later)

## Definition of done

- `npm run check` green; tests for new helpers.
- Handoff appended to `docs/KIMI-HANDOFF.md`, `LATEST-UPDATE.md` updated, pushed to `main`.
