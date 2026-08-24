# KATOA Marketing Assets

Editable presentation and PDF export for pitches, social, and Give A Bit handoffs.

## Files

| File | Purpose |
|------|---------|
| `katoa-presentation.html` | **Source of truth** for slides — edit text/numbers here |
| `KATOA-Marketing-Presentation.pdf` | Exported deck (11 slides, 16:9, night-jewel, August 2026) |
| `katoa-cover.jpg` | Grok Imagine hero background for cover slide |

## Regenerate PDF

From repo root (macOS + Google Chrome):

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=docs/marketing/KATOA-Marketing-Presentation.pdf \
  "file://$(pwd)/docs/marketing/katoa-presentation.html"
```

Or open `katoa-presentation.html` in a browser → **Print** → Save as PDF (landscape, no margins).

## Related docs

- [`../MARKETING.md`](../MARKETING.md) — full pitch & messaging guide  
- [`../EXECUTIVE-SUMMARY.md`](../EXECUTIVE-SUMMARY.md) — leadership summary  
- [`../DESIGN.md`](../DESIGN.md) — visual tokens for new slides  

## Cover art

Replace `katoa-cover.jpg` to refresh the cover mood. Keep text in HTML — generated images are for atmosphere only, not typography.