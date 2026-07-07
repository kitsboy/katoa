/** English SEO content injected into static HTML for crawlers. */

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
      url: 'https://katoa.org',
      description: 'Zero-fee Bitcoin creator platform with Lightning Network and Nostr',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://katoa.org/explore?q={search_term_string}',
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
      { name: 'Home', item: 'https://katoa.org/' },
      { name: 'Explore', item: 'https://katoa.org/explore' },
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
      { name: 'Home', item: 'https://katoa.org/' },
      { name: 'About', item: 'https://katoa.org/about' },
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
      { name: 'Home', item: 'https://katoa.org/' },
      { name: 'Comparison', item: 'https://katoa.org/comparison' },
    ],
  },
  {
    path: '/pricing',
    title: 'Pricing — $0 Forever | KATOA',
    description: 'KATOA pricing is simple: $0 platform fees forever. Keep 100% of Bitcoin Lightning earnings.',
    h1: 'Zero Platform Fees Forever',
    paragraphs: ['No subscriptions. No hidden fees. Bitcoin Lightning payments go directly to your wallet.'],
    breadcrumbs: [
      { name: 'Home', item: 'https://katoa.org/' },
      { name: 'Pricing', item: 'https://katoa.org/pricing' },
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
      { name: 'Home', item: 'https://katoa.org/' },
      { name: 'FAQ', item: 'https://katoa.org/faq' },
    ],
  },
  {
    path: '/contact',
    title: 'Contact KATOA',
    description: 'Get in touch with the KATOA team for support, partnerships, or press inquiries.',
    h1: 'Contact Us',
    paragraphs: ['Reach the KATOA team for creator support and general inquiries.'],
    breadcrumbs: [
      { name: 'Home', item: 'https://katoa.org/' },
      { name: 'Contact', item: 'https://katoa.org/contact' },
    ],
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
    path: '/pitch',
    title: 'KATOA Pitch Deck',
    description: 'Overview of KATOA — zero-fee Bitcoin creator commerce on Lightning and Nostr.',
    h1: 'KATOA Pitch',
    paragraphs: ['The zero-fee Bitcoin creator economy — pitch overview.'],
  },
];

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