# Storage & CDN strategy — KATOA

## Current default
- Cloudflare R2 is the current default object store for any user media we keep server-side.
- We already pay for it on our server, so it stays as the first stop.

## Upgrade-ready alternatives
If we ever outgrow R2 or want a different cost curve, these are the first candidates:

- Cloudflare R2: simplest to keep now; egress-free model is the main reason to stay.
- Backblaze B2: strong S3-compatible option; good when plain storage cost is the priority.
- Wasabi: competitive hot-storage pricing; watch for minimum retention / egress rules before switching.
- S3-compatible provider on our own infra: possible later, but operational cost usually beats pure storage cost for us.

## How to swap later
- Keep the storage layer behind one internal helper, not scattered across components.
- Swap the provider by changing the helper + any signed-URL / public-url behavior, not by editing every page.
- Do not hardcode bucket names, CDN URLs, or storage-specific assumptions in UI code.
- Treat media URLs as replaceable; do not bake them into public copy or marketing assets.

## Cost model preference
- Prefer consumption-based or egress-aware pricing.
- Prefer the cheapest option that still preserves performance for profile media and creator assets.
- Avoid long-term lock-in until we have real usage numbers.

## Notes
- This file is directional, not a commitment. We will choose the final provider based on real usage, performance, and cost.
- R2 remains the default until we have a reason to move.
