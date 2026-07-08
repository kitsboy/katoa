# KATOA Session Summary — 2026-07-07

## Chat Topic

Building OnlyFans-style creator video cards on `/explore`, enabling MOV/video uploads for creator projects, shipping ~50 polish upgrades, then fixing live bugs where progress bars were clipped and video previews never appeared.

## Key Things We Did

- Added `CreatorVideoCard` with tall previews, #00aff0 accents, exclusive badges, and hover autoplay
- Enabled MP4/MOV/WebM/M4V uploads (200MB) via `videoFormats.ts` and `MediaUpload`
- Added Luna + Sasha mock creators with Pexels cover video/images on `/explore`
- Shipped ~50 polish upgrades: i18n, `validateAddress`, `CoverVideoUpload`, VideoObject JSON-LD, PWA v11→v12, sitemap/prerender routes
- Fixed production bugs: CSP `media-src` for Pexels videos, lazy video mount on hover (poster always visible), flex/grid layout so progress bars are not clipped

## What We Finished

- [x] Creator video showcase section on `/explore` (Luna + Sasha)
- [x] MOV/video upload pipeline for creator projects
- [x] ~50 site-wide polish upgrades (batch 6B)
- [x] Progress bar clipping fix on all explore cards
- [x] Video preview loading fix (CSP + lazy-mount video on hover)
- [x] `npm run check` + `npm run build` pass (22 tests)
- [x] All commits pushed to `main`

## What We Are Still Aiming to Finish

- [ ] Verify live deploy after `1904795`: https://katoa.org/explore shows cover images + hover video on Luna/Sasha
- [ ] Confirm `/explore?videos=1` filter works on production
- [ ] Add avatar images for Luna/Sasha mocks (currently null placeholders)
- [ ] Optional: navbar video hint, ComparisonPage creator copy, DemoBanner when `videosOnly`

## Update / Status

As of 2026-07-07, KATOA has a full creator-video feature on explore with OnlyFans-inspired UI (tasteful stock media, no explicit content). Two production bugs reported post-deploy — clipped progress bars and missing video/images — were diagnosed and fixed in `1904795`. Root causes: missing `media-src` in CSP blocked Pexels MP4s, empty `<video>` layers covered poster images, and `overflow-hidden` + stretched flex grid clipped card footers. Repo is clean on `main` at `fdef859`.

## Key Decisions / Notes

- "Sexy" examples = subscription-platform layout/colors, not explicit imagery (Pexels stock only)
- Mock creators always merged into explore list: `[...mockWishlists, ...dbWishlists]`
- Videos lazy-load on hover/touch so cover images always show by default
- `card_style: 'creator'` drives tall hero on wishlist pages and `CreatorVideoCard` in grid

## Mission Tie-in

KATOA gives Bitcoin-native creators a direct-to-fan monetization path — 0% platform fees, Lightning instant — without payment processors or ad platforms taking a cut. The video creator UX positions KATOA as a sovereign alternative to OnlyFans-style platforms.

## Git Commits (this session)

| SHA | Description |
|-----|-------------|
| `cc1f5ff` | Creator video cards, MOV upload, explore showcase |
| `c043f9a` | 50 video-creator polish upgrades |
| `42ea8dc` | Handoff docs |
| `1904795` | Fix progress clipping + video preview loading |
| `fdef859` | Docs: Kimi NIP-05 identity |

---

*Safe Harbour · Part of the [Give A Bit](https://giveabit.io) family.*