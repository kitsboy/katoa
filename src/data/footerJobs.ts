export interface FooterJob {
  id: string;
  title: string;
  roleSlug: string;
  type: string;
  location: string;
  summary: string;
  tags: string[];
}

const JOBS_EMAIL = 'hello@giveabit.io';

export function buildJobMailto(job: FooterJob): string {
  const subject = encodeURIComponent(`Katoa job-${job.roleSlug}`);
  const body = encodeURIComponent(
    `Hi Give A Bit team,\n\nI'm interested in the ${job.title} role at Katoa.\n\n` +
      `Role: ${job.title}\nType: ${job.type}\nLocation: ${job.location}\n\n` +
      `— [Your name]\n[Link to portfolio or GitHub]\n`
  );
  return `mailto:${JOBS_EMAIL}?subject=${subject}&body=${body}`;
}

export const footerJobs: FooterJob[] = [
  {
    id: 'react-fullstack',
    title: 'React / Full Stack Engineer',
    roleSlug: 'React-full stack posting',
    type: 'Contract · Remote',
    location: 'Global (Bitcoin time zones welcome)',
    summary:
      'Ship creator dashboards, wishlists, and Lightning checkout flows in React 18 + TypeScript. You care about sats-native UX and zero-fee economics.',
    tags: ['React', 'TypeScript', 'Supabase', 'Vite'],
  },
  {
    id: 'lightning-engineer',
    title: 'Lightning Network Engineer',
    roleSlug: 'Lightning Network posting',
    type: 'Part-time · Remote',
    location: 'Remote',
    summary:
      'Wire LNURL, BOLT12, and BTCPay webhooks into production. Make paying creators feel instant—not like filling out a tax form.',
    tags: ['Lightning', 'BTCPay', 'LND/CLN', 'Webhooks'],
  },
  {
    id: 'nostr-specialist',
    title: 'Nostr Protocol Specialist',
    roleSlug: 'Nostr protocol posting',
    type: 'Contract · Remote',
    location: 'Remote',
    summary:
      'Extend NIP-07 auth, zaps, and kind-30078 wishlist publishing. Bridge Nostr identity to Katoa profiles without custodial creep.',
    tags: ['Nostr', 'NIP-57', 'Relays', 'Zaps'],
  },
  {
    id: 'devops-supabase',
    title: 'DevOps / Supabase Engineer',
    roleSlug: 'DevOps-Supabase posting',
    type: 'Contract · Remote',
    location: 'Remote',
    summary:
      'Own migrations, RLS, Edge Functions, and Cloudflare Pages deploys. Keep APIs up and paranoia appropriately high.',
    tags: ['Supabase', 'PostgreSQL', 'Cloudflare', 'CI/CD'],
  },
  {
    id: 'ui-ux-designer',
    title: 'UI/UX Designer (Bitcoin-native)',
    roleSlug: 'UI-UX designer posting',
    type: 'Freelance · Remote',
    location: 'Remote',
    summary:
      'Polish glassmorphic creator surfaces, mobile flows, and sats-first typography. No Web2 donation-platform cosplay.',
    tags: ['Figma', 'Mobile-first', 'Design systems', 'A11y'],
  },
  {
    id: 'developer-relations',
    title: 'Developer Relations & Community',
    roleSlug: 'Developer relations posting',
    type: 'Part-time · Remote',
    location: 'Remote',
    summary:
      'Write docs, run office hours, and grow the FOSS contributor base. Explain Bitcoin gifting without sounding like a whitepaper.',
    tags: ['Docs', 'Community', 'Open source', 'Education'],
  },
];

export const bitcoinQuotes = [
  { text: 'Not your keys, not your coins.', author: 'Andreas M. Antonopoulos', vibe: 'sovereignty' },
  { text: 'Running Bitcoin.', author: 'Hal Finney', vibe: 'genesis' },
  { text: 'Fix the money, fix the world.', author: 'Bitcoin proverb', vibe: 'mission' },
  { text: 'Privacy is not secrecy. It is the power to selectively reveal yourself.', author: 'Satoshi (via cypherpunk ethos)', vibe: 'privacy' },
  { text: 'The price of liberty is eternal vigilance.', author: 'Bitcoin Twitter, probably', vibe: 'wit' },
  { text: 'Sats are the unit of account for human generosity at internet scale.', author: 'Katoa team', vibe: 'katoa' },
];