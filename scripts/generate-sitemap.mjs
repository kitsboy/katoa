import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { SITE_URL } from './site-config.mjs';
import { SITEMAP_STATIC_ROUTES } from './prerender-routes.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function resolveOutDir(argv) {
  const i = argv.indexOf('--out');
  return i !== -1 && argv[i + 1] ? join(root, argv[i + 1]) : join(root, 'dist');
}
const OUT_DIR = resolveOutDir(process.argv.slice(2));
const today = new Date().toISOString().slice(0, 10);

/**
 * Languages offered in-app (src/contexts/LanguageContext.tsx `Language` type).
 * Kept in sync with PageMeta's hreflang emission so crawler-facing and
 * runtime-declared alternates always agree.
 */
const LANGUAGES = ['en', 'es', 'pt', 'fr', 'de', 'ja', 'zh'];

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

/** Escape a URL for XML text content. */
function xmlEscape(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * hreflang alternates for one URL path.
 *
 * Mirrors src/components/PageMeta.tsx exactly: the non-English variants use the
 * `?lang=` query parameter (the app reads it in resolveInitialLanguage), and
 * x-default points at the clean path with no parameter.
 */
function hreflangBlock(path) {
  const clean = `${SITE_URL}${path === '/' ? '/' : path}`;
  const lines = [
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(clean)}"/>`,
  ];
  for (const lang of LANGUAGES) {
    const href = path === '/' ? `${SITE_URL}/?lang=${lang}` : `${clean}?lang=${lang}`;
    lines.push(`    <xhtml:link rel="alternate" hreflang="${lang}" href="${xmlEscape(href)}"/>`);
  }
  return lines.join('\n');
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
${urls
  .map((u) => {
    const path = new URL(u.loc).pathname;
    return `  <url>
    <loc>${xmlEscape(u.loc)}</loc>
${hreflangBlock(path)}
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>
`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, 'sitemap.xml'), xml);
console.log(
  `Generated sitemap with ${urls.length} URLs (${slugs.length} wishlists, ${usernames.length} creators) + ${LANGUAGES.length + 1} hreflang alternates each → ${join(OUT_DIR, 'sitemap.xml')}`
);
