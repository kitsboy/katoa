# KATOA Design System

**Last updated:** 2026-08-24  
**Status:** Living document — **night-jewel is the visual target and is live in CSS** (`src/index.css` `--ember-950: #0e0a18`, `--ember-900: #160e24`). DESIGN plum `#12081c` remains the documented page token. Not beige.

> **Quick links:** Tokens live in [`tailwind.config.js`](../tailwind.config.js) and [`src/index.css`](../src/index.css).  
> **Primitives:** [`Card`](../src/components/Card.tsx) · [`Button`](../src/components/Button.tsx) · [`Modal`](../src/components/Modal.tsx) · [`Input`](../src/components/Input.tsx)

---

## 1. Design context

### What KATOA feels like

KATOA is a **night-jewel** product UI: deep plum glass, a violet spark, bitcoin-orange warmth. It should feel:

- **Sovereign** — creators keep 100%; no bank-core aesthetic
- **Jewel, not void** — plum and ember, never pure black, never beige
- **Electric** — violet product energy, cyan on interactive, subtle glow
- **Warm where it matters** — bitcoin-orange for money and sats
- **Global & accessible** — large touch targets, safe areas, **readable contrast** on mobile

### Brand keywords

`0% fees` · `Lightning` · `FOSS` · `privacy-first` · `global` · `keep 100%`

### Visual hierarchy (accent usage)

| Role | Token | Hex | Use for |
|------|-------|-----|---------|
| Page / product surface | Deep plum | `#12081c` | Page backgrounds, product chrome |
| Ember wells | Ember | `#080510` | Deeper bands, landing base, footer wells |
| Product energy | Violet `katoa-violet` | `#a78bfa` | Product accent, hover rings, jewel headlines |
| Money / donate / sats | `bitcoin-orange-500` | `#F7931A` | Donations, pricing, Bitcoin features |
| Interactive | `neon-cyan-500` | `#14E6FF` | Links, focus rings, default interactive |
| Success / savings | `emerald-400` | — | Checkmarks, “you keep 100%” |
| Body text | Near-white | `#f8f4ff` / `#f6f1ea` | Headings + body on dark |
| Muted text | Jewel muted | **≥ `#c4b8d4`** | Descriptions, metadata — never dimmer |
| Glass panels | `white/[0.05]` + highlight trim | — | Cards, drawers, modals |

### Contrast rules (non-negotiable)

Night-jewel fails if type disappears into the plum.

1. **Body is near-white** — `#f8f4ff`, `#f6f1ea`, or `text-white`. Not `gray-300` as a default body color.
2. **Muted ≥ `#c4b8d4`** — lavender-mist. Do not use `text-gray-500`, `text-gray-600`, `#9ca3af`, or `#b4aba2` for secondary copy on dark.
3. **Never `gray-600` on dark.** Tailwind `gray-600` (`#4b5563`) fails WCAG on plum/ember.
4. **Never all-black.** No `#000`, no `bg-black` full-bleed pages. Deepest fill is ember `#080510` or plum `#12081c`. Overlays may use `bg-black/75` only as a **scrim**, not a surface.
5. **Never beige.** `#dfd4c8` marketing theme is retired. Do not reintroduce sand-tan landings.

Eyebrows may use violet or cyan at full token strength — not gray.

### Highlight trim + violet rings

Every elevated surface uses a **three-layer edge** so it lifts off plum — plus a **violet ring** on hover:

1. **Hairline border** — `rgba(255,255,255,0.12)`–`0.15`
2. **Accent trim** — `0 0 0 1px rgba(247, 147, 26, 0.42)` (bitcoin orange)
3. **Inner catch-light** — `inset 0 1px 0 rgba(255,255,255,0.16)`
4. **Hover ring** — `border-katoa-violet/40` + violet glow `0 0 40px rgba(139, 92, 246, 0.14)`

Landing helper: `.lp-card` / `.lp-bento-card` / `.lp-onboarding` / `.lp-cta-panel` / `.lp-metric`. Product primitive: `Card variant="glass"` (hover already uses the violet ring).

Do **not** use `white/3` + `white/10` alone — those cards disappear into the background.

### Visual eras (do not mix)

| Era | Status |
|-----|--------|
| **Night-jewel (now)** | Deep plum `#12081c` + ember `#080510` + violet product + orange money + cyan interactive. **Target.** CSS is landing in parallel. |
| Ember charcoal (2026-08-20) | `--ember-950` `#080510` + highlight trim. Compatible ancestor of night-jewel — keep ember wells. |
| Beige marketing | `#dfd4c8` — **retired.** Failed contrast (cards at 55% white on taupe). |
| All-black | `#000` / `#050509` as a full page — **retired as the look.** Too void; jewel needs plum. |
| Pulse / Protocol widgets | **Removed 2026-07-06.** Footer/nav BTC price strip stays. |
| Legacy CSS only | `night-blue-*` / `sand-tan` remain in `index.css` for reference — do not use in new UI. |

When building **new** UI, use **night-jewel exclusively**.

---

## 2. Color tokens

### Target CSS variables (`:root`)

Parent is aligning `src/index.css` to this table. Prefer these names in new work:

```css
--plum-950: #12081c;        /* night-jewel page */
--ember-950: #080510;       /* deepest wells (Give A Bit ember) */
--ember-900: #0c0816;       /* muted bands */
--surface-1: #1a1028;       /* elevated glass underlay */
--surface-2: #221634;
--ink: #f8f4ff;             /* body near-white */
--ink-muted: #c4b8d4;       /* minimum muted — do not go darker */
--katoa-violet: #a78bfa;    /* product */
--katoa-violet-deep: #8b5cf6;
--bitcoin-orange: #F7931A;  /* money */
--neon-cyan: #14E6FF;       /* interactive */
--trim-orange: rgba(247, 147, 26, 0.42);
--trim-violet: rgba(167, 139, 250, 0.40);
--highlight: rgba(255, 255, 255, 0.16);
```

Existing tokens still in the file (`--charcoal-950: #050509`, `--ink-muted: #b4aba2`) are **migration leftovers**. Do not copy them into new UI. Do not treat charcoal-950 as the night-jewel page color.

### Tailwind extended palette (`tailwind.config.js`)

#### Night-jewel surfaces (target)

| Token | Hex | Usage |
|-------|-----|--------|
| Deep plum | `#12081c` | Body / page bg, product chrome |
| Ember | `#080510` | Deepest wells, landing bands |
| `jewel.violet` / `katoa-violet-500` | `#a78bfa` | Product accent |
| `jewel.fuchsia` | `#e879f9` | Rare jewel highlights |
| `jewel.amber` | `#f59e0b` | Paired with bitcoin-orange |

#### Neon cyan (interactive)

| Token | Hex | Usage |
|-------|-----|--------|
| `neon-cyan-500` | `#14E6FF` | Links, focus, interactive chrome |
| `neon-cyan-400` | `#3DEBFF` | Hover |
| `neon-cyan-600` | `#00D4ED` | Darker cyan |

#### Bitcoin orange (money)

| Token | Hex | Usage |
|-------|-----|--------|
| `bitcoin-orange-500` | `#F7931A` | Donate, pricing, Bitcoin badges |
| `bitcoin-orange-400` | `#F9A825` | Highlights, gradient text |
| `bitcoin-orange-600` | `#E67E00` | Hover on orange buttons |

#### Katoa violet (product)

| Token | Hex | Usage |
|-------|-----|--------|
| `katoa-violet-400` / `500` | `#a78bfa` | Product energy, rings |
| `katoa-violet-600` | `#8b5cf6` | Hover / deep glow |
| `katoa-violet-800` | `#6d28d9` | Ink on light-jewel experiments only |

#### Semantic

| Token | Usage |
|-------|--------|
| `emerald-400` / `emerald-500` | Success, checkmarks, savings |
| `red-400` / `red-500` | Errors, danger, competitor fees |
| Near-white / `--ink` | Body |
| `#c4b8d4` / `--ink-muted` | Muted only |
| `white/5`–`white/15` | Borders and glass overlays |

**Do not** reach for `gray-500` / `gray-600` on dark surfaces.

### Opacity patterns

```
bg-white/[0.05]     — glass card fill (never below 0.05 on plum)
border-white/15     — default glass border
trim-orange ring    — 0 0 0 1px rgba(247,147,26,0.42)
violet hover ring   — border-katoa-violet/40 + 0 0 40px rgba(139,92,246,0.14)
inset highlight     — inset 0 1px 0 rgba(255,255,255,0.16)
bg-black/30         — inset info panels (scrim, not page)
bg-plum/70          — sticky nav (with backdrop-blur); target #12081c
```

Landing (`.lp-page`) is **night-jewel / ember**, same family as the product UI. Do not reintroduce beige `#dfd4c8`.

### Gradient recipes (copy-paste)

```html
<!-- Page background (night-jewel) -->
bg-[#12081c]
<!-- or -->
bg-gradient-to-b from-[#12081c] via-[#0c0816] to-[#080510]

<!-- Hero title -->
bg-gradient-to-r from-bitcoin-orange-400 via-katoa-violet-400 to-neon-cyan-400 bg-clip-text text-transparent

<!-- Bitcoin CTA button (via Button variant="bitcoin") -->
bg-gradient-to-r from-bitcoin-orange-500 to-amber-600

<!-- Ambient glow blob -->
bg-katoa-violet/10 rounded-full blur-3xl
bg-bitcoin-orange-500/10 rounded-full blur-3xl
bg-neon-cyan-500/8 rounded-full blur-3xl

<!-- Divider line -->
bg-gradient-to-r from-transparent via-katoa-violet/40 to-transparent
```

### Text gradient utilities (`src/index.css`)

| Class | Colors |
|-------|--------|
| `.text-gradient-cyan` | `#14E6FF` → `#00D4ED` (interactive) |
| `.text-gradient-bitcoin` | `#F9A825` → `#F7931A` (money) |
| `.text-gradient-emerald` | `#34d399` → `#14E6FF` |
| Jewel headline | violet → fuchsia (`.hero-headline-accent` / lp jewel) |

**Glow text:** `.glow-cyan` · `.glow-orange`

Legacy `.text-gradient-tan` / `.text-gradient-blue` / `.gradient-title` — do not use.

---

## 3. Typography

### Font stacks (`tailwind.config.js`)

| Token | Family | Role |
|-------|--------|------|
| `font-sans` | Inter, system-ui | Body (default on `body`) |
| `font-display` | Space Grotesk, Inter | Headings, KATOA wordmark, hero numbers |
| `font-mono` | JetBrains Mono | Addresses, version strings, API labels |
| `font-serif` | DM Serif Display | Rare / decorative (loaded in `index.html`) |

### Loaded fonts

- **index.html:** Inter (400–800), DM Serif Display, Space Grotesk, JetBrains Mono  

### Body defaults

```
font-size: 15px
letter-spacing: -0.011em
line-height: 1.6
color: near-white on plum #12081c (not gray, not #000 page)
```

### Heading scale (responsive patterns in use)

| Level | Typical classes | Context |
|-------|-----------------|---------|
| Hero H1 | `text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black` | Page heroes |
| Section H2 | `text-2xl sm:text-3xl font-display font-bold` | Section titles |
| Card H3 | `text-xl font-bold` | Plan names, feature titles |
| Eyebrow | `text-[10px] uppercase tracking-widest font-semibold text-katoa-violet` | Section labels (not gray) |
| Mono label | `text-[10px] font-mono tracking-widest uppercase text-[#c4b8d4]` | Footer, API strip |

### Mobile input rule

At `max-width: 640px`, inputs use `font-size: 16px !important` to prevent iOS zoom on focus.

---

## 4. Spacing & layout

### Content width

| Class | Usage |
|-------|--------|
| `max-w-7xl mx-auto` | Primary page content (nav, footer, pricing, dashboard) |
| `max-w-6xl mx-auto` | Medium marketing sections |
| `max-w-4xl mx-auto` | Hero copy, narrow prose |
| `max-w-2xl mx-auto` | Subtitles, FAQ answers |

### Page padding

```
px-4 sm:px-6 lg:px-8        — horizontal page gutter
pt-28 sm:pt-32              — below floating island navbar (~80px + top offset)
pb-16 sm:pb-24              — section bottom (desktop)
```

### App shell (`App.tsx`)

```
<main className="pb-20 md:pb-0">   — clears MobileNav on small screens
```

Floating navbar: ~56px island + `top-3`/`top-4` offset. Use `pt-28 sm:pt-32` on full-page heroes.

### Grid patterns

```
grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8     — pricing plans
grid-cols-1 sm:grid-cols-2 lg:grid-cols-5    — feature grids
grid-cols-1 sm:grid-cols-2 lg:grid-cols-4    — how-it-works steps
```

### Safe areas (mobile)

| Class | Definition |
|-------|------------|
| `.safe-area-bottom` | `padding-bottom: env(safe-area-inset-bottom)` |
| `.pb-safe` | `max(0.5rem, env(safe-area-inset-bottom))` |

Use on: MobileNav, donation drawer, DonateQRModal bottom sheet.

---

## 5. Radius, borders, shadows

### Border radius

| Token | Usage |
|-------|--------|
| `rounded-xl` (12px) | Buttons (default), inputs, small icon boxes |
| `rounded-2xl` (16px) | Cards, modals, section panels |
| `rounded-[1.75rem]` | Mobile bottom sheets |
| `rounded-full` | Pills, badges, avatar rings, step orbs |

### Borders

```
border border-white/15           — glass cards
border-2 border-neon-cyan-500/60 — outline / interactive
border-katoa-violet/40           — hover ring
border-bitcoin-orange-500/50     — featured pricing / money
border-t border-white/10         — footer dividers, mobile nav
```

### Shadows & glow (common arbitrary values)

```
shadow-[0_0_24px_rgba(20,230,255,0.25)]           — cyan interactive
shadow-[0_0_24px_rgba(247,147,26,0.3)]            — bitcoin button
shadow-[0_0_40px_rgba(167,139,250,0.18)]          — violet product hover
shadow-[0_0_40px_rgba(247,147,26,0.12)]           — featured card
shadow-[0_8px_32px_rgba(18,8,28,0.55)]            — glass card lift on plum
shadow-[0_-8px_60px_rgba(247,147,26,0.2)]         — bottom sheet upward glow
```

---

## 6. Motion & animation

### CSS classes (`src/index.css`)

| Class | Duration / easing | Use |
|-------|-------------------|-----|
| `animate-slide-up` | 0.6s ease-out | Section entrance |
| `animate-fade-in` | 0.4s ease-out | Backdrops |
| `animate-scale-in` | 0.4s ease-out | Desktop modals |
| `animate-sheet-up` | 0.38s cubic-bezier(0.32, 0.72, 0, 1) | Mobile bottom sheets |
| `animate-slide-in-right` | 0.3s | Drawers from right |
| `animate-float` | 6s infinite | Decorative |
| `animate-glow` | 2s infinite | Icon boxes |
| `animate-shimmer` | 2s linear | Loading placeholders |
| `animate-gradient` | 6s | Animated gradient bg |
| `animate-subtle-pulse` | 3s | Status indicators |
| `animate-orb-drift` | 20–28s | Hero background orbs |
| `animate-orb-drift-reverse` | 24–32s | Hero background orbs (counter) |

### Interaction transitions

```
transition-all duration-200     — links, buttons (Button base)
transition-all duration-300     — Card hover lift
active:scale-[0.98]             — button press
hover:-translate-y-1            — Card hover
touch-manipulation              — all interactive mobile targets
```

### Hover utilities

- `.hover-lift` — translateY(-8px) + glow shadow  
- `.transition-all-smooth` — 0.3s cubic-bezier global transition

---

## 7. Z-index scale

Use these layers consistently; avoid arbitrary high values unless overlaying modals.

| Layer | z-index | Examples |
|-------|---------|----------|
| Page content | default | — |
| Donation backdrop | `z-40` | Footer drawer overlay |
| Sticky chrome | `z-50` | Navbar, MobileNav, donation drawer |
| QR / donate modal backdrop | `z-[80]` | DonateQRModal |
| QR / donate modal content | `z-[90]` | DonateQRModal sheet |
| Legacy Modal | `99998`–`99999` | `Modal.tsx` (consider lowering to z-[100] in future) |
| Map expanded | `z-[100]` | UnifiedBTCMap (MapLibre) |

---

## 8. Component primitives

### Card (`src/components/Card.tsx`)

```tsx
<Card variant="glass" hover padding="lg" className="...">
```

| Prop | Options | Notes |
|------|---------|-------|
| `variant` | `glass` (default), `solid`, `outline` | Prefer `glass` for new work |
| `hover` | boolean | **Violet ring** + lift (`border-katoa-violet/40`) |
| `padding` | `none`, `sm`, `md`, `lg` | Default `none` — often pass `p-6` via className |

Glass default already includes highlight trim (orange ring + inner catch-light).

**Important:** Card sets `overflow-hidden`. Badges that hang outside the card (e.g. “Most popular”) must sit on a **wrapper** above the Card, not inside it.

### Button (`src/components/Button.tsx`)

```tsx
<Button variant="primary" size="md">Label</Button>
```

| Variant | When |
|---------|------|
| `primary` | Default CTA — cyan interactive (or violet if the page is product-forward) |
| `bitcoin` | Donate, pricing, warm money actions |
| `secondary` | Secondary actions on dark glass |
| `outline` | Tertiary / ghost emphasis |
| `ghost` | Inline toolbar actions |
| `danger` | Destructive |

| Size | Min height |
|------|------------|
| `sm` | 40px |
| `md` | 44px (default touch target) |
| `lg` | 52px |

### Modal (`src/components/Modal.tsx`)

New overlays should follow **DonateQRModal** pattern:

- Mobile: bottom sheet + `animate-sheet-up` + `pb-safe`
- Desktop: centered + `animate-scale-in`
- Body scroll lock + Escape to close
- Backdrop: `bg-black/75 backdrop-blur-md` (**scrim only**)
- Panel fill: plum/ember glass, not `#000`

### Input (`src/components/Input.tsx`)

Target state:

```
bg-white/5 border-white/10 focus:ring-neon-cyan-500/50 rounded-xl
text near-white; placeholder #c4b8d4
```

Do not use `gray-800` fields or `gray-600` labels on dark.

### Icons

**Library:** `lucide-react` (stroke icons, size 16–24 typical)  
**Icon container:** `w-10 h-10 rounded-xl bg-gradient-to-br from-katoa-violet/20 border border-white/10`

---

## 9. Patterns by feature

### Floating island navigation (`Navbar.tsx`)

The navbar is a **floating glass island** — not a full-width sticky bar. It stays dark (night-jewel) on all routes, including home — no light island.

```tsx
// Outer wrapper: fixed, centered, pointer-events-none
className="fixed top-3 sm:top-4 inset-x-0 z-50 px-4 sm:px-6 pointer-events-none"

// Inner island (.nav-island in index.css)
className="nav-island pointer-events-auto max-w-7xl mx-auto rounded-2xl"
```

Nav links use **pill style** (`rounded-full px-3 py-1.5`) with cyan or violet active state.

### Mobile bottom nav

```tsx
className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-white/10 bg-[#12081c]/95 backdrop-blur-xl safe-area-bottom"
// items: min-h-[56px] touch-manipulation, active = violet or cyan
```

### Section eyebrow + title

```tsx
<p className="text-[10px] uppercase tracking-[0.2em] text-katoa-violet font-semibold mb-3">Label</p>
<h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-3">Title</h2>
<p className="text-[#c4b8d4] text-sm sm:text-base max-w-2xl mx-auto">Subtitle</p>
```

### Glass info callout

```tsx
<div className="p-4 sm:p-6 rounded-2xl bg-white/[0.05] border border-white/10 text-center">
```

Avoid `bg-black` panels.

### Pill badge (above card)

```tsx
<div className="relative pt-5">  {/* wrapper reserves space */}
  <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-gradient-to-r from-bitcoin-orange-500 to-amber-600 text-white text-xs font-bold uppercase">
    Most popular
  </div>
  <Card>...</Card>
</div>
```

### Donation / Bitcoin strip

Orange warm accents, `font-mono` for addresses, QR on white background with `imageRendering: crisp-edges`. Footer/nav **BTC price strip** is the ambient Bitcoin chrome. Pulse/Protocol widgets are gone.

### Homepage hero

Motion orbs + glass overlay on plum/ember. Primary CTA may be a **white pill** (`bg-white text-[#12081c] rounded-full`); secondary uses glass outline. Jewel headline uses violet → fuchsia → amber.

---

## 10. Accessibility & mobile checklist

- [ ] Interactive targets ≥ **44px** height (`Button`, nav items, close buttons)
- [ ] Use `touch-manipulation` on tap-heavy controls
- [ ] `pb-safe` / `safe-area-bottom` on fixed bottom UI
- [ ] `aria-label` on icon-only buttons
- [ ] `role="dialog"` + `aria-modal` on modals
- [ ] Body scroll lock when overlays open
- [ ] Escape closes modals/menus
- [ ] Focus visible on form fields (cyan ring on focus)
- [ ] Main content clears MobileNav: `pb-20 md:pb-0` on `<main>`
- [ ] Inputs ≥ 16px font on mobile (global CSS rule)
- [ ] Body near-white; muted ≥ `#c4b8d4`; no `gray-600` on dark
- [ ] Page background is plum/ember, never `#000`

---

## 11. Reference pages (canonical examples)

| Page / component | What to copy |
|------------------|--------------|
| [`HomePage.tsx`](../src/pages/HomePage.tsx) | Landing structure, fee math, discovery |
| [`Navbar.tsx`](../src/components/Navbar.tsx) | Floating island nav (dark on all routes) |
| [`PricingPage.tsx`](../src/pages/PricingPage.tsx) | Section structure, plan cards |
| [`Footer.tsx`](../src/components/Footer.tsx) | Ambient glow, job board, donation drawer, price strip |
| [`DonateQRModal.tsx`](../src/components/DonateQRModal.tsx) | Mobile sheet, z-index, copy/share pattern |
| [`MobileNav.tsx`](../src/components/MobileNav.tsx) | Bottom tab bar, active state |
| [`Card.tsx`](../src/components/Card.tsx) | Highlight trim + violet hover ring |
| [`UnifiedBTCMap.tsx`](../src/components/UnifiedBTCMap.tsx) | MapLibre + OpenFreeMap (not Leaflet) |

---

## 12. How to change tokens later

1. **Colors / fonts / Tailwind extensions** → edit [`tailwind.config.js`](../tailwind.config.js)  
2. **CSS variables, animations, utility classes** → edit [`src/index.css`](../src/index.css)  
3. **Component defaults** → edit primitives in [`src/components/`](../src/components/)  
4. **Update this file** — keep tables in sync so agents and humans honor the same source of truth  
5. **Run** `npm run build` after token changes to catch missing class names

### Parallel CSS note (2026-08-24)

Parent is implementing night-jewel in CSS in parallel with this document. If code still shows `--charcoal-950: #050509` or beige leftover utilities, **do not copy them forward**. Prefer `#12081c` / `#080510` / `#a78bfa` / muted `#c4b8d4`.

### Suggested token additions (future)

- Promote `--plum-950: #12081c` in `:root` and Tailwind
- Raise `--ink-muted` to `#c4b8d4`
- Consolidate `Modal` z-index to the scale in §7
- Deprecate `night-blue` / `sand-tan` / beige lp leftovers from `index.css`

---

## 13. Marketing & pitch alignment

Visual work for decks, social, and landing pages should match **night-jewel**. Narrative copy lives in:

- [`MARKETING.md`](./MARKETING.md) — voice, CTAs, channel messaging  
- [`EXECUTIVE-SUMMARY.md`](./EXECUTIVE-SUMMARY.md) — leadership facts  
- [`marketing/KATOA-Marketing-Presentation.pdf`](./marketing/KATOA-Marketing-Presentation.pdf) — embellished slide deck  

Use **HTML/code for slide text and numbers**; use generated imagery for mood only (see `marketing/katoa-cover.jpg`). Share OG: `public/og-share.svg` (1200×630).

---

## 14. Agent / contributor note

When implementing new UI for KATOA:

1. Read this file first. Night-jewel is the target.  
2. Use `Card` + `Button` primitives — do not invent new button styles.  
3. Prefer plum `#12081c` + ember `#080510` + violet / orange / cyan.  
4. Body near-white; muted ≥ `#c4b8d4`; never `gray-600` on dark; never `#000` pages; never beige.  
5. Highlight trim + violet hover rings on elevated surfaces.  
6. Match spacing: `max-w-7xl`, standard gutters, `pt-24` below nav.  
7. Test at **375px** width — bottom nav and safe areas matter.  
8. Map is **MapLibre + OpenFreeMap**, not Leaflet.  
9. After visual changes, update **§11 reference** or this doc if you introduce a new pattern.

---

*KATOA — Keep All That's Owed Always.*
