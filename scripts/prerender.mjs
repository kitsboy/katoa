import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { PRERENDER_ROUTES, PRERENDER_ROUTE_COUNT, breadcrumbSchema, toJsonLdScript } from './prerender-routes.mjs';
import { SITE_URL } from './site-config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const distDir = join(root, 'dist');
const template = readFileSync(join(distDir, 'index.html'), 'utf8');

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildBody(route) {
  const paragraphs = route.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('\n        ');
  return `<main id="prerender-content">
      <h1>${escapeHtml(route.h1)}</h1>
      ${paragraphs}
      <nav aria-label="Primary">
        <a href="/explore">Explore Projects</a> ·
        <a href="/about">About</a> ·
        <a href="/comparison">Compare Platforms</a> ·
        <a href="/pricing">Pricing</a>
      </nav>
    </main>`;
}

function buildSchemas(route) {
  const schemas = [];
  if (route.schema) schemas.push(route.schema);
  if (route.breadcrumbs?.length) schemas.push(breadcrumbSchema(route.breadcrumbs));
  return schemas
    .map((s) => `<script type="application/ld+json">${toJsonLdScript(s)}</script>`)
    .join('\n    ');
}

function injectRoute(baseHtml, route) {
  const canonical = `${SITE_URL}${route.path === '/' ? '/' : route.path}`;
  let html = baseHtml;

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(route.title)}</title>`);
  html = html.replace(
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escapeHtml(route.description)}" />`
  );
  html = html.replace(
    /<meta property="og:title" content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${escapeHtml(route.title)}" />`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${escapeHtml(route.description)}" />`
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${canonical}" />`
  );
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${escapeHtml(route.title)}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${escapeHtml(route.description)}" />`
  );
  html = html.replace(
    /<link rel="canonical" href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${canonical}" />`
  );

  const robotsContent = route.noindex ? 'noindex, nofollow' : 'index, follow';
  if (html.includes('<meta name="robots"')) {
    html = html.replace(
      /<meta name="robots" content="[^"]*"\s*\/?>/,
      `<meta name="robots" content="${robotsContent}" />`
    );
  } else {
    html = html.replace('</head>', `    <meta name="robots" content="${robotsContent}" />\n  </head>`);
  }

  const extraSchema = buildSchemas(route);
  if (extraSchema) {
    html = html.replace('</head>', `    ${extraSchema}\n  </head>`);
  }

  html = html.replace(
    /<div id="root">[\s\S]*?<\/div>/,
    `<div id="root">${buildBody(route)}</div>`
  );

  return html;
}

let count = 0;

for (const route of PRERENDER_ROUTES) {
  const html = injectRoute(template, route);
  const outPath =
    route.path === '/'
      ? join(distDir, 'index.html')
      : join(distDir, route.path.slice(1), 'index.html');

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html);
  count += 1;
}

console.log(`Prerendered ${count}/${PRERENDER_ROUTE_COUNT} routes with static English SEO content`);