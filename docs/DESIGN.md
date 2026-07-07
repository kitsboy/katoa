# KATOA Design System

**Last updated:** 2026-07-01  
**Status:** Living document — reflects current codebase; edit when tokens or patterns change.

> **Quick links:** Tokens live in [`tailwind.config.js`](../tailwind.config.js) and [`src/index.css`](../src/index.css).  
> **Primitives:** [`Card`](../src/components/Card.tsx) · [`Button`](../src/components/Button.tsx) · [`Modal`](../src/components/Modal.tsx) · [`Input`](../src/components/Input.tsx)

---

## 1. Design context

### What KATOA feels like

KATOA is a **dark, glassy, Bitcoin-native** product UI. It should feel:

- **Sovereign** — creators keep 100%; no bank-core aesthetic
- **Electric** — neon cyan accents, subtle glow, motion on interaction
- **Warm where it matters** — bitcoin-orange for money, donation, and CTAs
- **Global & accessible** — large touch targets, safe areas, readable contrast on mobile

### Brand keywords

`0% fees` · `Lightning` · `FOSS` · `privacy-first` · `global` · `instant`

### Visual hierarchy (accent usage)

| Role | Token | Use for |
|------|-------|---------|
| Primary action | `neon-cyan-500` | Default buttons, nav hover, links, “product” energy |
| Money / donate / sats | `bitcoin-orange-500` | Donations, pricing, Bitcoin features, warm CTAs |
| Success / savings | `emerald-400` | Checkmarks, “you keep 100%”, positive comparisons |
| Body text | `gray-300`–`gray-500` | Descriptions, metadata, secondary copy |
| Surfaces | `charcoal-950` / `charcoal-900` | Page backgrounds, nav, footer |
| Glass panels | `white/[0.03]` + `border-white/10` | Cards, drawers, modals |

### Two surface eras (migration note)

**Modern (preferred):** `charcoal-*` + glass + `neon-cyan` / `bitcoin-orange`  
— Home, Footer, Pricing, Navbar, MobileNav, DonateQRModal

**Legacy (still in repo):** `night-blue-500` / `night-blue-shadow-*` + `sand-tan`  
— FAQ, Contact, Auth, some dashboard blocks, older `Modal`

**Migrated (2026-07-06):** About, Comparison, Terms, Privacy → charcoal/glass

When building **new** UI, use the **modern** palette. When touching legacy pages, migrate toward charcoal/glass incrementally.

---

## 2. Color tokens

### CSS variables (`src/index.css` `:root`)

```css
--charcoal-950: #050509;
--charcoal-900: #070711;
--neon-cyan: #14E6FF;
--bitcoin-orange: #F7931A;
--sand-tan: #e1b382;
--sand-tan-shadow: #c89666;
--night-blue: #2d545e;
--night-blue-shadow: #12343b;
```

### Tailwind extended palette (`tailwind.config.js`)

#### Charcoal (backgrounds)

| Token | Hex | Usage |
|-------|-----|--------|
| `charcoal-950` | `#050509` | Body bg, mobile nav, deepest surface |
| `charcoal-900` | `#070711` | Elevated panels, dropdowns, scrollbar track |
| `charcoal-800` | `#0a0a14` | Optional deeper layers |
| `charcoal-700` | `#0d0d1a` | Optional deeper layers |

#### Neon cyan (primary accent)

| Token | Hex | Usage |
|-------|-----|--------|
| `neon-cyan-500` | `#14E6FF` | Primary buttons, active nav, links |
| `neon-cyan-400` | `#3DEBFF` | Hover states, gradient ends |
| `neon-cyan-600` | `#00D4ED` | Darker cyan variant |

#### Bitcoin orange (money accent)

| Token | Hex | Usage |
|-------|-----|--------|
| `bitcoin-orange-500` | `#F7931A` | Donate, pricing, Bitcoin badges |
| `bitcoin-orange-400` | `#F9A825` | Highlights, gradient text |
| `bitcoin-orange-600` | `#E67E00` | Hover on orange buttons |

#### Night blue (legacy surfaces)

| Token | Hex | Usage |
|-------|-----|--------|
| `night-blue-500` | `#2d545e` | Legacy page gradients |
| `night-blue-800` | `#12343b` | Legacy deep bg |
| `night-blue-shadow-700` | `#12343b` | About hero sections |

#### Sand tan (legacy warmth)

| Token | Hex | Usage |
|-------|-----|--------|
| `sand-tan-300` / `500` | `#e1b382` | Legacy gradients, shimmer |
| `sand-tan-600` | `#c89666` | Legacy gradient shadows |

#### Semantic (Tailwind defaults — use consistently)

| Token | Usage |
|-------|--------|
| `emerald-400` / `emerald-500` | Success, checkmarks, savings |
| `red-400` / `red-500` | Errors, danger button, competitor fees |
| `amber-600` | Paired with bitcoin-orange in gradients |
| `gray-300`–`gray-600` | Body and muted text |
| `white/5`–`white/15` | Borders and glass overlays |

### Opacity patterns

```
bg-white/[0.03]     — glass card fill
bg-white/[0.04]     — inline stat bars
border-white/10     — default glass border
border-white/15     — secondary button border
bg-black/30         — inset info panels
bg-charcoal-950/70  — sticky nav (with backdrop-blur)
bg-charcoal-950/95  — mobile nav
```

### Gradient recipes (copy-paste)

```html
<!-- Page background (modern) -->
bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950

<!-- Hero title -->
bg-gradient-to-r from-bitcoin-orange-400 via-amber-300 to-neon-cyan-400 bg-clip-text text-transparent

<!-- Bitcoin CTA button (via Button variant="bitcoin") -->
bg-gradient-to-r from-bitcoin-orange-500 to-amber-600

<!-- Ambient glow blob -->
bg-bitcoin-orange-500/10 rounded-full blur-3xl
bg-neon-cyan-500/8 rounded-full blur-3xl

<!-- Divider line -->
bg-gradient-to-r from-transparent via-neon-cyan-500/40 to-transparent
```

### Text gradient utilities (`src/index.css`)

| Class | Colors |
|-------|--------|
| `.text-gradient-cyan` | `#14E6FF` → `#00D4ED` |
| `.text-gradient-bitcoin` | `#F9A825` → `#F7931A` |
| `.text-gradient-emerald` | `#34d399` → `#14E6FF` |
| `.text-gradient-tan` | sand-tan legacy |
| `.text-gradient-blue` | night-blue legacy |
| `.gradient-title` | sand-tan → night-blue (legacy headings) |

**Glow text:** `.glow-cyan` · `.glow-orange`

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

- **index.html:** Inter (400–800), DM Serif Display  
- **index.css @import:** Space Grotesk (400–700), JetBrains Mono (400–600)

### Body defaults (`index.css`)

```
font-size: 15px
letter-spacing: -0.011em
line-height: 1.6
color: white on charcoal-950
```

### Heading scale (responsive patterns in use)

| Level | Typical classes | Context |
|-------|-----------------|---------|
| Hero H1 | `text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black` | Page heroes |
| Section H2 | `text-2xl sm:text-3xl font-display font-bold` | Section titles |
| Card H3 | `text-xl font-bold` | Plan names, feature titles |
| Eyebrow | `text-[10px] uppercase tracking-widest font-semibold text-gray-500` | Section labels |
| Mono label | `text-[10px] font-mono tracking-widest uppercase` | Footer, API strip |

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
pt-24 sm:pt-28              — below fixed navbar (h-16)
pb-16 sm:pb-24              — section bottom (desktop)
```

### App shell (`App.tsx`)

```
<main className="pb-20 md:pb-0">   — clears MobileNav on small screens
```

Navbar height: `h-16` (64px). Account for it on all full-page layouts.

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
border border-white/10          — glass cards
border-2 border-neon-cyan-500/60 — outline buttons
border-bitcoin-orange-500/50     — featured pricing card
border-t border-white/10         — footer dividers, mobile nav
```

### Shadows & glow (common arbitrary values)

```
shadow-[0_0_24px_rgba(20,230,255,0.25)]           — primary button
shadow-[0_0_24px_rgba(247,147,26,0.3)]            — bitcoin button
shadow-[0_0_40px_rgba(247,147,26,0.12)]           — featured card
shadow-[0_8px_32px_rgba(0,0,0,0.4)]               — glass card (Card component)
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
| `animate-glow` | 2s infinite | Icon boxes (About) |
| `animate-shimmer` | 2s linear | Loading placeholders |
| `animate-gradient` | 6s | Animated gradient bg |
| `animate-subtle-pulse` | 3s | Status indicators |

### Interaction transitions

```
transition-all duration-200     — links, buttons (Button base)
transition-all duration-300     — Card hover lift
active:scale-[0.98]             — button press
hover:-translate-y-1            — Card hover
touch-manipulation              — all interactive mobile targets
```

### Hover utilities

- `.hover-lift` — translateY(-8px) + cyan glow shadow  
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
| Map expanded | `z-[100]` | BTCMapEmbed |

---

## 8. Component primitives

### Card (`src/components/Card.tsx`)

```tsx
<Card variant="glass" hover padding="lg" className="...">
```

| Prop | Options | Notes |
|------|---------|-------|
| `variant` | `glass` (default), `solid`, `outline` | Prefer `glass` for new work |
| `hover` | boolean | Cyan border glow + lift |
| `padding` | `none`, `sm`, `md`, `lg` | Default `none` — often pass `p-6` via className |

**Important:** Card sets `overflow-hidden`. Badges that hang outside the card (e.g. “Most popular”) must sit on a **wrapper** above the Card, not inside it.

### Button (`src/components/Button.tsx`)

```tsx
<Button variant="primary" size="md">Label</Button>
```

| Variant | When |
|---------|------|
| `primary` | Default CTA — neon cyan |
| `bitcoin` | Donate, pricing, warm money actions |
| `secondary` | Secondary actions on dark glass |
| `outline` | Tertiary / ghost emphasis with cyan border |
| `ghost` | Inline toolbar actions |
| `danger` | Destructive |

| Size | Min height |
|------|------------|
| `sm` | 40px |
| `md` | 44px (default touch target) |
| `lg` | 52px |

### Modal (`src/components/Modal.tsx`)

Legacy night-blue modal. New overlays should follow **DonateQRModal** pattern:

- Mobile: bottom sheet + `animate-sheet-up` + `pb-safe`
- Desktop: centered + `animate-scale-in`
- Body scroll lock + Escape to close
- Backdrop: `bg-black/75 backdrop-blur-md`

### Input (`src/components/Input.tsx`)

Still uses legacy `gray-800` / `focus:ring-orange-500`. Acceptable for forms until migrated. Target state:

```
bg-white/5 border-white/10 focus:ring-neon-cyan-500/50 rounded-xl
```

### Icons

**Library:** `lucide-react` (stroke icons, size 16–24 typical)  
**Icon container:** `w-10 h-10 rounded-xl bg-gradient-to-br from-{accent}/20 border border-white/10`

---

## 9. Patterns by feature

### Sticky navigation

```tsx
className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-charcoal-950/70 backdrop-blur-xl"
// inner: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16
```

### Mobile bottom nav

```tsx
className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-white/10 bg-charcoal-950/95 backdrop-blur-xl safe-area-bottom"
// items: min-h-[56px] touch-manipulation, active = text-neon-cyan-500
```

### Section eyebrow + title

```tsx
<p className="text-[10px] uppercase tracking-[0.2em] text-neon-cyan-500 font-semibold mb-3">Label</p>
<h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-3">Title</h2>
<p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">Subtitle</p>
```

### Glass info callout

```tsx
<div className="p-4 sm:p-6 rounded-2xl bg-black/30 border border-white/10 text-center">
```

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

Orange warm accents, `font-mono` for addresses, QR on white background with `imageRendering: crisp-edges`.

---

## 10. Accessibility & mobile checklist

- [ ] Interactive targets ≥ **44px** height (`Button`, nav items, close buttons)
- [ ] Use `touch-manipulation` on tap-heavy controls
- [ ] `pb-safe` / `safe-area-bottom` on fixed bottom UI
- [ ] `aria-label` on icon-only buttons
- [ ] `role="dialog"` + `aria-modal` on modals
- [ ] Body scroll lock when overlays open
- [ ] Escape closes modals/menus
- [ ] Focus visible on form fields (ring on focus)
- [ ] Main content clears MobileNav: `pb-20 md:pb-0` on `<main>`
- [ ] Inputs ≥ 16px font on mobile (global CSS rule)

---

## 11. Reference pages (canonical examples)

| Page / component | What to copy |
|------------------|--------------|
| [`HomePage.tsx`](../src/pages/HomePage.tsx) | Hero scale, glow text, cyan/orange balance |
| [`PricingPage.tsx`](../src/pages/PricingPage.tsx) | Section structure, feature grid, plan cards, badge wrapper |
| [`Footer.tsx`](../src/components/Footer.tsx) | Ambient glow, job board, donation drawer |
| [`DonateQRModal.tsx`](../src/components/DonateQRModal.tsx) | Mobile sheet, z-index, copy/share pattern |
| [`Navbar.tsx`](../src/components/Navbar.tsx) | Sticky glass nav, dropdown panels |
| [`MobileNav.tsx`](../src/components/MobileNav.tsx) | Bottom tab bar, active state |

---

## 12. How to change tokens later

1. **Colors / fonts / Tailwind extensions** → edit [`tailwind.config.js`](../tailwind.config.js)  
2. **CSS variables, animations, utility classes** → edit [`src/index.css`](../src/index.css)  
3. **Component defaults** → edit primitives in [`src/components/`](../src/components/)  
4. **Update this file** — keep tables in sync so agents and humans honor the same source of truth  
5. **Run** `npm run build` after token changes to catch missing class names

### Suggested token additions (future)

- Consolidate `Modal` z-index to the scale in §7
- Migrate `Input` focus ring to `neon-cyan`  
- Deprecate `night-blue` page backgrounds page-by-page  

---

## 13. Marketing & pitch alignment

Visual work for decks, social, and landing pages should match this system. Narrative copy lives in:

- [`MARKETING.md`](./MARKETING.md) — voice, CTAs, channel messaging  
- [`EXECUTIVE-SUMMARY.md`](./EXECUTIVE-SUMMARY.md) — leadership facts  
- [`marketing/KATOA-Marketing-Presentation.pdf`](./marketing/KATOA-Marketing-Presentation.pdf) — embellished slide deck  

Use **HTML/code for slide text and numbers**; use generated imagery for mood only (see `marketing/katoa-cover.jpg`).

---

## 14. Agent / contributor note

When implementing new UI for KATOA:

1. Read this file first.  
2. Use `Card` + `Button` primitives — do not invent new button styles.  
3. Prefer `charcoal` + glass + `neon-cyan` / `bitcoin-orange`.  
4. Match spacing: `max-w-7xl`, standard gutters, `pt-24` below nav.  
5. Test at **375px** width — bottom nav and safe areas matter.  
6. After visual changes, update **§11 reference** or this doc if you introduce a new pattern.

---

*KATOA — Keep All That's Owed Always.*