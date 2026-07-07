import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const today = new Date().toISOString().slice(0, 10);

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/explore', priority: '0.9', changefreq: 'daily' },
  { path: '/about', priority: '0.8', changefreq: 'weekly' },
  { path: '/comparison', priority: '0.8', changefreq: 'weekly' },
  { path: '/pricing', priority: '0.7', changefreq: 'monthly' },
  { path: '/pitch', priority: '0.6', changefreq: 'monthly' },
  { path: '/faq', priority: '0.6', changefreq: 'monthly' },
  { path: '/contact', priority: '0.6', changefreq: 'monthly' },
  { path: '/auth', priority: '0.5', changefreq: 'monthly' },
  { path: '/terms', priority: '0.5', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.5', changefreq: 'monthly' },
];

const VIDEO_CREATOR_SLUGS = ['luna-exclusive-videos', 'sasha-vip-content'];

const mockSource = readFileSync(join(root, 'src/data/mockWishlists.ts'), 'utf8');
const extractedSlugs = [...mockSource.matchAll(/slug:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
const slugs = [...new Set([...VIDEO_CREATOR_SLUGS, ...extractedSlugs])];

const urls = [
  ...STATIC_ROUTES.map((r) => ({ loc: `https://katoa.org${r.path}`, ...r })),
  ...slugs.map((slug) => ({
    loc: `https://katoa.org/wishlist/${slug}`,
    priority: '0.7',
    changefreq: 'weekly',
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

writeFileSync(join(root, 'public/sitemap.xml'), xml);
console.log(`Generated sitemap with ${urls.length} URLs (${slugs.length} wishlists)`);