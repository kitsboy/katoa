# katoa — Context Map

## Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL, cloud-hosted) |
| Auth | Google OAuth |
| i18n | 7 languages |
| Payments | BTCPay Server (wiring in progress) |
| Identity | Nostr |

## Ports
| Service | Port |
|---------|------|
| Dev server | 5173 |
| Supabase | Cloud-hosted (project: pglqjtipbocjnqmiwmwf) |

## Key Architecture
- Zero-fee Bitcoin Lightning creator support
- Wishlists, crowdfunding, Bitcoin Pulse widget
- Custom routing (not HashRouter)
- Nostr NIP-05 identity for creators
- Mobile-first responsive design

## External Services
| Service | Purpose |
|---------|---------|
| Supabase | Auth, database, realtime |
| Google OAuth | User sign-in (Web client + redirect configured) |
| BTCPay | Lightning payment processing (pending) |

## Hosting
Cloudflare Pages — manual deploy from M4
Custom domain: katoa.org
