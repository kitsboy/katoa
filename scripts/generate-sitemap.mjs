import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { SITE_URL } from './site-config.mjs';
import { SITEMAP_STATIC_ROUTES } from './prerender-routes.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const today = new Date().toISOString().slice(0, 10);

const mockSource = readFileSync(join(root, 'src/data/mockWishlists.ts'), 'utf8');
const extractedSlugs = [...mockSource.matchAll(/slug:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
const slugs = [...new Set(extractedSlugs)];
const extractedUsernames = [...mockSource.matchAll(/username:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
const usernames = [...new Set(extractedUsernames)];

const urls = [
  ...SITEMAP_STATIC_ROUTES.map((r) => ({ loc: `${SITE_URL}${r.path}`, ...r })),
  ...slugs.map((slug) => ({
    loc: `${SITE_URL}/wishlist/${slug}`,
    priority: '0.7',
    changefreq: 'weekly',
  })),
  ...usernames.map((username) => ({
    loc: `${SITE_URL}/u/${username}`,
    priority: '0.65',
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
console.log(`Generated sitemap with ${urls.length} URLs (${slugs.length} wishlists, ${usernames.length} creators)`);