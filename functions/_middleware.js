/**
 * Katoa — Cloudflare Pages SPA fallback with REAL 404 for unknown routes.
 * The `_redirects` catch-all (`/* /index.html 200`) used to make every junk
 * URL a soft-404 (HTTP 200, homepage). Now only known client routes fall back
 * to the app shell; everything else gets a branded 404.
 */
const SKIP_PREFIXES = ['/assets/', '/api/', '/.well-known/']

// Known client routes (BrowserRouter). Keep in sync with src/App.tsx + sitemap.
const KNOWN_ROUTES = [
  /^\/$/,
  /^\/explore\/?$/,
  /^\/wishlist\/?$/,
  /^\/wishlist\/[^/]+\/?$/,
  /^\/u\/[^/]+\/?$/,
  /^\/profile\/[^/]+\/?$/,
  /^\/auth\/?$/,
  /^\/about\/?$/,
  /^\/contact\/?$/,
  /^\/faq\/?$/,
  /^\/pricing\/?$/,
  /^\/comparison\/?$/,
  /^\/compare\/?$/,
  /^\/pitch\/?$/,
  /^\/security\/?$/,
  /^\/security\/bounty\/?$/,
  /^\/roadmap\/?$/,
  /^\/templates\/?$/,
  /^\/press\/?$/,
  /^\/meetup\/?$/,
  /^\/case-studies\/?$/,
  /^\/creators\/?$/,
  /^\/creators\/guidelines\/?$/,
  /^\/verify\/?$/,
  /^\/verify\/[^/]+\/?$/,
  /^\/thank-you\/?$/,
  /^\/messages\/?$/,
  /^\/nip05\/?$/,
  /^\/terms\/?$/,
  /^\/privacy\/?$/,
  /^\/dashboard\/?$/,
  /^\/project\/?$/,
  /^\/project\/[^/]+\/?$/,
  /^\/settings\/?$/,
  /^\/404\/?$/,
]

function isKnownRoute(pathname) {
  return KNOWN_ROUTES.some((re) => re.test(pathname))
}

function isPageRequest(pathname) {
  if (SKIP_PREFIXES.some((p) => pathname.startsWith(p))) return false
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) return false
  return true
}

const NOT_FOUND_HTML = `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>404 — Page not found · Katoa</title>
<style>html,body{margin:0;height:100%;background:#0b141b;color:#e6f2f9;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
.wrap{min-height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.5rem;text-align:center;padding:2rem}
.code{font-size:5rem;font-weight:800;color:#3bb3e0;line-height:1}h1{font-size:1.4rem;margin:0}
p{color:#93a9b8;margin:0}a{color:#3bb3e0}</style></head><body>
<div class="wrap"><div class="code">404</div><h1>Page not found</h1>
<p>That address doesn't exist on Katoa.</p>
<p><a href="/">← Back to katoa.org</a></p></div></body></html>`

export async function onRequest(context) {
  const { request } = context
  if (request.method !== 'GET') return context.next()
  const { pathname } = new URL(request.url)

  // Static files / assets / APIs pass through untouched.
  if (!isPageRequest(pathname)) return context.next()

  // Unknown client route → real 404, never the SPA shell.
  if (!isKnownRoute(pathname)) {
    return new Response(NOT_FOUND_HTML, {
      status: 404,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'x-robots-tag': 'noindex',
        'cache-control': 'public, max-age=300'
      }
    })
  }

  // Known route → let _redirects serve the SPA shell (index.html).
  return context.next()
}
