/** English SEO content injected into static HTML for crawlers. */

import { SITE_URL } from './site-config.mjs';

/** Indexable static routes for sitemap (excludes noindex pages like /auth, /pitch). */
export const SITEMAP_STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/explore', priority: '0.9', changefreq: 'daily' },
  { path: '/about', priority: '0.8', changefreq: 'weekly' },
  { path: '/comparison', priority: '0.8', changefreq: 'weekly' },
  { path: '/pricing', priority: '0.7', changefreq: 'monthly' },
  { path: '/faq', priority: '0.6', changefreq: 'monthly' },
  { path: '/contact', priority: '0.6', changefreq: 'monthly' },
  { path: '/security', priority: '0.7', changefreq: 'monthly' },
  { path: '/security/bounty', priority: '0.4', changefreq: 'monthly' },
  { path: '/verify', priority: '0.6', changefreq: 'monthly' },
  { path: '/roadmap', priority: '0.6', changefreq: 'weekly' },
  { path: '/templates', priority: '0.7', changefreq: 'weekly' },
  { path: '/press', priority: '0.5', changefreq: 'monthly' },
  { path: '/meetup', priority: '0.4', changefreq: 'monthly' },
  { path: '/creators', priority: '0.85', changefreq: 'weekly' },
  { path: '/creators/guidelines', priority: '0.6', changefreq: 'monthly' },
  { path: '/case-studies', priority: '0.6', changefreq: 'monthly' },
  { path: '/terms', priority: '0.5', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.5', changefreq: 'monthly' },
];

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is KATOA?', acceptedAnswer: { '@type': 'Answer', text: 'KATOA is a privacy-centric, zero-fee creator platform powered by Bitcoin Lightning and Nostr.' } },
    { '@type': 'Question', name: 'Are there really zero fees?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. KATOA charges 0% platform fees forever. You only pay tiny Lightning network fees.' } },
    { '@type': 'Question', name: 'Do I need KYC?', acceptedAnswer: { '@type': 'Answer', text: 'No. Start with a username or Nostr key. Bitcoin does the settlement.' } },
  ],
};

export const PRERENDER_ROUTES = [
  {
    path: '/',
    title: 'Katoa: Zero-Fee Bitcoin Creator Platform | Lightning & Nostr',
    description:
      'Create Bitcoin wishlists, receive Lightning gifts instantly, and keep 100% of earnings. Zero platform fees, no KYC, works in 195+ countries.',
    h1: 'Keep 100% of Your Creator Earnings',
    paragraphs: [
      'KATOA is a zero-fee, privacy-first Bitcoin creator platform powered by Lightning Network and Nostr.',
      'Create wishlists, share your story, and receive instant Bitcoin support from supporters worldwide — no bank account required.',
    ],
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'KATOA',
      url: SITE_URL,
      description: 'Zero-fee Bitcoin creator platform with Lightning Network and Nostr',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/explore?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  },
  {
    path: '/explore',
    title: 'Explore Bitcoin Creator Projects | KATOA',
    description:
      'Discover Bitcoin-funded creator projects and wishlists worldwide. Support causes with Lightning — zero platform fees.',
    h1: 'Explore All Projects',
    paragraphs: [
      'Browse creator wishlists funded with Bitcoin Lightning. Filter by category, country, and funding progress.',
    ],
    breadcrumbs: [
      { name: 'Home', item: `${SITE_URL}/` },
      { name: 'Explore', item: `${SITE_URL}/explore` },
    ],
  },
  {
    path: '/about',
    title: 'About KATOA — Zero-Fee Bitcoin for Creators',
    description:
      "Learn how KATOA helps creators keep 100% via Bitcoin Lightning. No platform fees, no KYC, censorship-resistant by design.",
    h1: 'The Platform That Actually Serves Creators',
    paragraphs: [
      'Traditional platforms take 8–20% of creator earnings. KATOA charges 0% forever using peer-to-peer Bitcoin Lightning payments.',
      'Built on Lightning Network and Nostr for instant settlements, global reach, and creator-owned identity.',
    ],
    breadcrumbs: [
      { name: 'Home', item: `${SITE_URL}/` },
      { name: 'About', item: `${SITE_URL}/about` },
    ],
  },
  {
    path: '/comparison',
    title: 'KATOA vs OnlyFans, Kickstarter & More | Platform Comparison',
    description:
      'Compare KATOA to OnlyFans, Throne, Linktree, Kickstarter, and Indiegogo. See fee savings, payout speed, and privacy differences.',
    h1: 'Why Choose KATOA?',
    paragraphs: [
      'Honest side-by-side comparison: 0% fees, instant Lightning payouts, no bank account, 195+ countries.',
    ],
    breadcrumbs: [
      { name: 'Home', item: `${SITE_URL}/` },
      { name: 'Comparison', item: `${SITE_URL}/comparison` },
    ],
  },
  {
    path: '/pricing',
    title: 'Pricing — $0 Forever | KATOA',
    description: 'KATOA pricing is simple: $0 platform fees forever. Keep 100% of Bitcoin Lightning earnings.',
    h1: 'Zero Platform Fees Forever',
    paragraphs: ['No subscriptions. No hidden fees. Bitcoin Lightning payments go directly to your wallet.'],
    breadcrumbs: [
      { name: 'Home', item: `${SITE_URL}/` },
      { name: 'Pricing', item: `${SITE_URL}/pricing` },
    ],
  },
  {
    path: '/faq',
    title: 'FAQ — Zero Fees, Lightning & Privacy | KATOA',
    description:
      'Frequently asked questions about KATOA: zero fees, Lightning Network, Nostr login, wishlists, and privacy.',
    h1: 'Frequently Asked Questions',
    paragraphs: [
      'Answers about Bitcoin wishlists, Lightning payments, Nostr identity, and keeping 100% of creator earnings.',
    ],
    breadcrumbs: [
      { name: 'Home', item: `${SITE_URL}/` },
      { name: 'FAQ', item: `${SITE_URL}/faq` },
    ],
    schema: FAQ_SCHEMA,
  },
  {
    path: '/contact',
    title: 'Contact KATOA',
    description: 'Get in touch with the KATOA team for support, partnerships, or press inquiries.',
    h1: 'Contact Us',
    paragraphs: ['Reach the KATOA team for creator support and general inquiries.'],
    breadcrumbs: [
      { name: 'Home', item: `${SITE_URL}/` },
      { name: 'Contact', item: `${SITE_URL}/contact` },
    ],
  },
  {
    path: '/thank-you',
    title: 'Thank you — what happens next | KATOA',
    description:
      'Your KATOA action completed. See exactly what happened and the three steps that come next: confirm your email, add a Lightning address, publish your first wishlist.',
    h1: 'Thank you — that worked',
    paragraphs: [
      'This is the end of the flow you just completed: account sign-up, the contact form, or a support payment. Nothing else is required from you right now.',
      'What happens next, in order: confirm the email address you used, add a Lightning address so gifts reach you directly, then publish your first wishlist and share the link.',
      'KATOA never custodies your funds and charges 0% platform fees, so every sat a supporter sends arrives in your own wallet.',
    ],
    noindex: true,
  },
  {
    path: '/terms',
    title: 'Terms of Service | KATOA',
    description: 'KATOA terms of service for creators and supporters using the Bitcoin wishlist platform.',
    h1: 'Terms of Service',
    paragraphs: ['Terms governing use of the KATOA zero-fee Bitcoin creator platform.'],
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | KATOA',
    description: 'How KATOA protects creator privacy with minimal data collection and Nostr-native identity.',
    h1: 'Privacy Policy',
    paragraphs: ['Privacy-first design: your data stays yours on the KATOA platform.'],
  },
  {
    path: '/u/luna_vip',
    title: '@luna_vip — Creator Profile | KATOA',
    description:
      'Video creator · VIP drops · Bitcoin-native monetization. Support Luna with Lightning — 0% platform fees.',
    h1: '@luna_vip',
    paragraphs: [
      'Public creator profile for Luna. Exclusive video wishlists funded with Bitcoin Lightning on KATOA.',
    ],
    breadcrumbs: [
      { name: 'Home', item: `${SITE_URL}/` },
      { name: 'Explore', item: `${SITE_URL}/explore` },
      { name: '@luna_vip', item: `${SITE_URL}/u/luna_vip` },
    ],
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'luna_vip',
      url: `${SITE_URL}/u/luna_vip`,
      description: 'Video creator · VIP drops · Bitcoin-native monetization',
    },
  },
  {
    path: '/u/sasha_vip',
    title: '@sasha_vip — Creator Profile | KATOA',
    description:
      'Movement artist · Premium video · 0% fee Lightning payouts. Support Sasha directly on KATOA.',
    h1: '@sasha_vip',
    paragraphs: [
      'Public creator profile for Sasha. VIP video wishlists funded with Bitcoin Lightning on KATOA.',
    ],
    breadcrumbs: [
      { name: 'Home', item: `${SITE_URL}/` },
      { name: 'Explore', item: `${SITE_URL}/explore` },
      { name: '@sasha_vip', item: `${SITE_URL}/u/sasha_vip` },
    ],
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'sasha_vip',
      url: `${SITE_URL}/u/sasha_vip`,
      description: 'Movement artist · Premium video · 0% fee Lightning payouts',
    },
  },
  {
    path: '/u/skate_colombia',
    title: '@skate_colombia — Creator Profile | KATOA',
    description:
      'Founder of Skate Colombia Foundation. Support the Medellín youth skatepark with Bitcoin Lightning.',
    h1: '@skate_colombia',
    paragraphs: [
      'Public creator profile for Skate Colombia. Community skatepark wishlists funded with Bitcoin Lightning on KATOA.',
    ],
    breadcrumbs: [
      { name: 'Home', item: `${SITE_URL}/` },
      { name: 'Explore', item: `${SITE_URL}/explore` },
      { name: '@skate_colombia', item: `${SITE_URL}/u/skate_colombia` },
    ],
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'skate_colombia',
      url: `${SITE_URL}/u/skate_colombia`,
      description: 'Founder of Skate Colombia Foundation. Using skateboarding to empower youth in Medellín.',
    },
  },
  {
    path: '/wishlist/luna-exclusive-videos',
    title: 'Luna — Exclusive Video Collection | KATOA',
    description: 'Premium video creator wishlist on Bitcoin Lightning — 0% platform fees.',
    h1: 'Luna — Exclusive Video Collection',
    paragraphs: ['Support independent video creators with instant Lightning tips on KATOA.'],
    breadcrumbs: [
      { name: 'Home', item: `${SITE_URL}/` },
      { name: 'Explore', item: `${SITE_URL}/explore` },
      { name: 'Video Creators', item: `${SITE_URL}/explore?videos=1` },
      { name: 'Luna — Exclusive Video Collection', item: `${SITE_URL}/wishlist/luna-exclusive-videos` },
    ],
  },
  {
    path: '/wishlist/sasha-vip-content',
    title: 'Sasha — VIP Video Wishlist | KATOA',
    description: 'VIP video content funded via Bitcoin Lightning — creators keep 100%.',
    h1: 'Sasha — VIP Video Wishlist',
    paragraphs: ['Direct-to-fan video monetization without platform cuts.'],
    breadcrumbs: [
      { name: 'Home', item: `${SITE_URL}/` },
      { name: 'Explore', item: `${SITE_URL}/explore` },
      { name: 'Video Creators', item: `${SITE_URL}/explore?videos=1` },
      { name: 'Sasha — VIP Video Wishlist', item: `${SITE_URL}/wishlist/sasha-vip-content` },
    ],
  },
  {
    path: '/pitch',
    title: 'KATOA Pitch Deck',
    description: 'Overview of KATOA — zero-fee Bitcoin creator commerce on Lightning and Nostr.',
    h1: 'KATOA Pitch',
    paragraphs: ['The zero-fee Bitcoin creator economy — pitch overview.'],
    noindex: true,
  },
  {
    path: '/wishlist/paul-first-ep',
    title: 'Paul — First Independent EP | KATOA Wishlist',
    description: 'Fund the instrument, studio days, and release of a first independent EP with Bitcoin Lightning — zero platform fees.',
    h1: 'Paul — First Independent EP',
    paragraphs: ['A street musician recording a first EP, funded directly by the people listening.'],
  },
  {
    path: '/wishlist/maria-codes-live',
    title: 'Maria Codes — Live Build Series | KATOA Wishlist',
    description: 'Fund a São Paulo developer\'s live build streams and workstation via Bitcoin Lightning on KATOA.',
    h1: 'Maria Codes — Live Build Series',
    paragraphs: ['Learning to build in public, funded by the people watching the streams.'],
  },
  {
    path: '/wishlist/accesstech-build-in-public',
    title: 'AccessTech Tokyo — Build in Public | KATOA Wishlist',
    description: 'Fund design tools for a screen-reader team in Tokyo — 0% fees on KATOA.',
    h1: 'AccessTech Tokyo — Build in Public',
    paragraphs: ['Bitcoin-native funding for accessibility tools built in the open.'],
  },
  {
    path: '/wishlist/outback-camera-traps',
    title: 'Steve — Outback Camera Traps | KATOA Wishlist',
    description: 'Fund wildlife camera traps in the Australian Outback with Bitcoin Lightning.',
    h1: 'Steve — Outback Camera Traps',
    paragraphs: ['Field work funded without payment processor cuts, filmed as it happens.'],
  },
  {
    path: '/wishlist/medellin-skate-park',
    title: 'Medellín Skate Park | KATOA Wishlist',
    description: 'Support the Medellín community skate park build with Bitcoin Lightning — zero platform fees.',
    h1: 'Medellín Skate Park',
    paragraphs: ['Fund community skate infrastructure with instant Bitcoin Lightning gifts on KATOA.'],
  },
  {
    path: '/wishlist/maya-reading-club',
    title: 'Maya — Reading Club, Antigua | KATOA Wishlist',
    description: 'Fund the book sets behind a weekly read-along series in Guatemala via Bitcoin Lightning on KATOA.',
    h1: 'Maya — Reading Club, Antigua',
    paragraphs: ['A classroom read-along funded directly by the people watching it.'],
  },
  {
    path: '/wishlist/omondi-field-diaries',
    title: 'Dr. Omondi — Field Diaries | KATOA Wishlist',
    description: 'Fund clinic supplies on camera in Kenya with Bitcoin Lightning — 0% platform fees.',
    h1: 'Dr. Omondi — Field Diaries',
    paragraphs: ['Documentary shorts that fund the clinic supplies they film.'],
  },
  {
    path: '/wishlist/neukoelln-garden-club',
    title: 'Anna — Neukölln Garden Club | KATOA Wishlist',
    description: 'Support a Berlin grow-along series and its 30 family garden plot with Bitcoin on KATOA.',
    h1: 'Anna — Neukölln Garden Club',
    paragraphs: ['A shared garden funded without payment processor gatekeeping.'],
  },
  {
    path: '/wishlist/water4life-well-documentary',
    title: 'Water4Life — Well Documentary | KATOA Wishlist',
    description: 'Fund a village borehole and the crew documenting it via Bitcoin Lightning wishlists.',
    h1: 'Water4Life — Well Documentary',
    paragraphs: ['Bitcoin-native funding for a well, filmed from survey to first water.'],
  },
  {
    path: '/verify',
    title: 'Check a Release — Bitcoin-anchored Proof | KATOA',
    description:
      'Verify any released file against an actual Bitcoin block. Paste a SHA-256 hash, see how the check was done (own node or public explorer), download the .ots proof, and re-verify it yourself forever.',
    h1: 'Check a release — you do not have to trust us',
    paragraphs: [
      'KATOA releases are fingerprinted with SHA-256, sent to public OpenTimestamps calendars, and anchored into a Bitcoin block. Anyone can re-check the anchor against the blockchain itself — no account, no KYC, no KATOA needing to be trusted.',
      'When a hash verifies, the page names the method used: Katoa\'s own Bitcoin node (bitcoind) or a public blockchain explorer (esplora). Every verdict comes with the downloadable .ots proof file so you can audit it independently, forever. A forged or unresolved hash is reported plainly as "Not proven" — never softened.',
    ],
  },
];

/** Total static prerender routes (marketing pages + featured wishlists). */
export const PRERENDER_ROUTE_COUNT = PRERENDER_ROUTES.length;

/** Mirrors src/lib/jsonLd.ts breadcrumbList — keep item URLs absolute. */
export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

/** Same `<` escape as src/lib/jsonLd.ts toJsonLdScript. */
export function toJsonLdScript(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}