# Ecosystem Links — KATOA

**Last Updated:** 2026-08-11

## Role in Ecosystem
KATOA is the **zero-fee Bitcoin creator platform** — wishlists, tips, product links, optional Nostr DMs. Creators keep 100%.

**Live:** https://katoa.org  
**Repo:** kitsboy/katoa

## Connections to Other Projects
| Project | Relationship |
|---------|-------------|
| GiveABit | Parent brand; agent hub; Safe Harbour templates |
| Satohash | Proof/timestamp client (Settings stamp UI) |
| HQ | Ops glass — polls `katoa.org/metrics.json` |
| BTC Map | Merchant layer via public API `api.btcmap.org` (not our repo) |
| MotoPass / Stranded / Tadbuy / OpenStrata / Sherpacarta | Sibling products — shared CF Pages + agent docs pattern |

## Shared Infrastructure
- Cloudflare Pages deploy
- Supabase (auth + wishlists)
- Nostr (NIP-07 only; NIP-05 / NIP-57 / optional NIP-17)
- Product metrics: `https://katoa.org/metrics.json` (`gab.product-metrics.v1`)
- Agent protocol: `AGENTS.md` + `GROK-SESSION-PROTOCOL.md` → `docs/KIMI-HANDOFF.md`

## Agent / Obsidian discovery
| Path | Purpose |
|------|---------|
| `.ai_docs/` | Machine-readable project status, context, ecosystem |
| `.ai_agent/` | Index for cross-site labels + vault pointers |
| `docs/KIMI-HANDOFF.md` | Session handoffs (Grok → Kimi) |
| `docs/LATEST-UPDATE.md` | One-line last update |
| `public/metrics.json` | HQ / portfolio cards |

## Give A Bit Ecosystem
See MASTER-BRAIN/docs/GIVE-A-BIT-ECOSYSTEM.md (THOR vault) for the full family map.
