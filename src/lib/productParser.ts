import { getBitcoinPrice, usdToSats } from './bitcoinPrice';

export interface ParsedProduct {
  title: string;
  description: string;
  price_usd?: number;
  price_sats?: number;
  image_url: string;
  product_url: string;
  merchant: string;
  /** e.g. amazon, etsy, shopify-generic */
  source?: string;
}

const MERCHANT_LABELS: Record<string, string> = {
  'amazon.com': 'Amazon',
  'amazon.co.uk': 'Amazon UK',
  'amazon.de': 'Amazon DE',
  'amazon.ca': 'Amazon CA',
  'amazon.com.au': 'Amazon AU',
  'amazon.co.jp': 'Amazon JP',
  'amzn.to': 'Amazon',
  'a.co': 'Amazon',
  'ebay.com': 'eBay',
  'ebay.co.uk': 'eBay UK',
  'etsy.com': 'Etsy',
  'walmart.com': 'Walmart',
  'target.com': 'Target',
  'bestbuy.com': 'Best Buy',
  'nike.com': 'Nike',
  'adidas.com': 'Adidas',
  'zappos.com': 'Zappos',
  'nordstrom.com': 'Nordstrom',
  'asos.com': 'ASOS',
  'zara.com': 'Zara',
  'hm.com': 'H&M',
  'uniqlo.com': 'Uniqlo',
  'shopify.com': 'Shopify',
  'aliexpress.com': 'AliExpress',
  'newegg.com': 'Newegg',
  'apple.com': 'Apple',
  'ikea.com': 'IKEA',
  'wayfair.com': 'Wayfair',
  'homedepot.com': 'Home Depot',
  'lowes.com': 'Lowe\'s',
  'sephora.com': 'Sephora',
  'ulta.com': 'Ulta',
  'rei.com': 'REI',
  'patagonia.com': 'Patagonia',
};

export function isValidUrl(string: string): boolean {
  try {
    const u = new URL(string.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function normalizeProductUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function hostKey(hostname: string): string {
  return hostname.replace(/^www\./i, '').toLowerCase();
}

export function merchantFromHostname(hostname: string): string {
  const host = hostKey(hostname);
  if (MERCHANT_LABELS[host]) return MERCHANT_LABELS[host];
  for (const [key, label] of Object.entries(MERCHANT_LABELS)) {
    if (host.endsWith(`.${key}`) || host === key) return label;
  }
  // shop.*.myshopify.com
  if (host.endsWith('.myshopify.com')) {
    const shop = host.replace('.myshopify.com', '').split('.').pop() || 'Store';
    return shop.charAt(0).toUpperCase() + shop.slice(1);
  }
  const base = host.split('.')[0] || 'Store';
  return base.charAt(0).toUpperCase() + base.slice(1);
}

/** Title-ish slug from product path when OG scrape fails */
export function titleFromUrlPath(url: string): string {
  try {
    const u = new URL(url);
    // Amazon /dp/ASIN or /gp/product/ASIN
    const amazon = u.pathname.match(/\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})/i);
    if (amazon) {
      const slug = u.pathname
        .split('/')
        .filter(Boolean)
        .find((p) => p.length > 12 && !/^dp$/i.test(p) && !/^[A-Z0-9]{10}$/i.test(p));
      if (slug) {
        return decodeURIComponent(slug)
          .replace(/[-_+]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .replace(/\b\w/g, (c) => c.toUpperCase())
          .slice(0, 200);
      }
      return `Amazon product ${amazon[1]}`;
    }
    const parts = u.pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1] || parts[parts.length - 2] || u.hostname;
    const cleaned = decodeURIComponent(last)
      .replace(/\.(html?|php|aspx)$/i, '')
      .replace(/[-_+]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (cleaned.length < 3) return merchantFromHostname(u.hostname) + ' product';
    return cleaned.replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 200);
  } catch {
    return 'Wishlist product';
  }
}

function parsePriceFromText(text: string): number | undefined {
  // $1,234.56 or 1234.56 USD or EUR 99
  const patterns = [
    /\$\s*([\d,]+(?:\.\d{1,2})?)/,
    /([\d,]+(?:\.\d{1,2})?)\s*(?:USD|usd)/,
    /(?:USD|EUR|GBP|CAD|AUD)\s*([\d,]+(?:\.\d{1,2})?)/,
    /([\d,]+(?:\.\d{1,2})?)/,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) {
      const n = parseFloat(m[1].replace(/,/g, ''));
      if (Number.isFinite(n) && n > 0 && n < 1_000_000) return n;
    }
  }
  return undefined;
}

function extractFromHtml(html: string, pageUrl: string): Omit<ParsedProduct, 'price_sats' | 'product_url'> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const hostname = new URL(pageUrl).hostname;

  let title =
    doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
    doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content') ||
    doc.querySelector('h1')?.textContent ||
    doc.querySelector('title')?.textContent ||
    '';

  let description =
    doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
    doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
    doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content') ||
    '';

  let image_url =
    doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
    doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ||
    doc.querySelector('meta[property="og:image:secure_url"]')?.getAttribute('content') ||
    doc.querySelector('img[itemprop="image"]')?.getAttribute('src') ||
    doc.querySelector('#landingImage')?.getAttribute('src') ||
    doc.querySelector('#imgBlkFront')?.getAttribute('src') ||
    doc.querySelector('img[data-old-hires]')?.getAttribute('data-old-hires') ||
    '';

  if (image_url && !image_url.startsWith('http')) {
    try {
      image_url = new URL(image_url, pageUrl).href;
    } catch {
      image_url = '';
    }
  }

  let price_usd: number | undefined;
  const priceSelectors = [
    'meta[property="product:price:amount"]',
    'meta[property="og:price:amount"]',
    'meta[itemprop="price"]',
    '[itemprop="price"]',
    '.a-price .a-offscreen',
    '#priceblock_ourprice',
    '#priceblock_dealprice',
    '.price',
    '[class*="price"]',
    '[data-price]',
  ];

  for (const selector of priceSelectors) {
    const element = doc.querySelector(selector);
    if (!element) continue;
    const priceText =
      element.getAttribute('content') ||
      element.getAttribute('data-price') ||
      element.textContent ||
      '';
    const parsed = parsePriceFromText(priceText);
    if (parsed) {
      price_usd = parsed;
      break;
    }
  }

  // JSON-LD Product
  if (!price_usd || !title) {
    doc.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
      try {
        const data = JSON.parse(script.textContent || 'null');
        const nodes = Array.isArray(data) ? data : data?.['@graph'] ? data['@graph'] : [data];
        for (const node of nodes) {
          if (!node || typeof node !== 'object') continue;
          const t = (node as { '@type'?: string | string[] })['@type'];
          const types = Array.isArray(t) ? t : [t];
          if (!types.some((x) => String(x).toLowerCase().includes('product'))) continue;
          const n = node as {
            name?: string;
            description?: string;
            image?: string | string[] | { url?: string };
            offers?: { price?: string | number; lowPrice?: string | number } | Array<{ price?: string | number }>;
          };
          if (!title && n.name) title = String(n.name);
          if (!description && n.description) description = String(n.description).slice(0, 500);
          if (!image_url && n.image) {
            if (typeof n.image === 'string') image_url = n.image;
            else if (Array.isArray(n.image) && n.image[0]) image_url = String(n.image[0]);
            else if (typeof n.image === 'object' && n.image !== null && 'url' in n.image) {
              const u = (n.image as { url?: string }).url;
              if (u) image_url = u;
            }
          }
          if (!price_usd && n.offers) {
            const offer = (Array.isArray(n.offers) ? n.offers[0] : n.offers) as
              | { price?: string | number; lowPrice?: string | number }
              | undefined;
            const p = offer?.price ?? offer?.lowPrice;
            if (p != null) {
              const num = typeof p === 'number' ? p : parseFloat(String(p).replace(/,/g, ''));
              if (Number.isFinite(num) && num > 0) price_usd = num;
            }
          }
        }
      } catch {
        /* ignore bad json-ld */
      }
    });
  }

  return {
    title: (title || titleFromUrlPath(pageUrl)).trim().substring(0, 200),
    description: (description || `Product from ${merchantFromHostname(hostname)}`).trim().substring(0, 500),
    price_usd,
    image_url,
    merchant: merchantFromHostname(hostname),
    source: hostKey(hostname).includes('amazon') ? 'amazon' : hostKey(hostname).split('.')[0],
  };
}

async function fetchPageHtml(url: string): Promise<string | null> {
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  ];

  for (const proxy of proxies) {
    try {
      const response = await fetch(proxy, { signal: AbortSignal.timeout(12000) });
      if (!response.ok) continue;
      const ct = response.headers.get('content-type') || '';
      if (ct.includes('application/json') || proxy.includes('/get?')) {
        const data = await response.json();
        if (typeof data?.contents === 'string' && data.contents.length > 100) return data.contents;
      } else {
        const text = await response.text();
        if (text.length > 100 && !text.trimStart().startsWith('{')) return text;
        // maybe JSON wrapper
        try {
          const data = JSON.parse(text);
          if (typeof data?.contents === 'string') return data.contents;
        } catch {
          if (text.length > 100) return text;
        }
      }
    } catch {
      /* try next */
    }
  }
  return null;
}

/**
 * Parse a product / sales page URL into wishlist item fields.
 * Uses OG/meta scrape when possible; always falls back to URL heuristics
 * so Amazon/clothing/shoe links still become usable wishlist items.
 */
/** Simple client-side rate limit for product URL parses (per browser tab). */
const parseTimestamps: number[] = [];
const PARSE_WINDOW_MS = 60_000;
const PARSE_MAX_PER_WINDOW = 12;

function assertParseRateLimit() {
  const now = Date.now();
  while (parseTimestamps.length && now - parseTimestamps[0] > PARSE_WINDOW_MS) {
    parseTimestamps.shift();
  }
  if (parseTimestamps.length >= PARSE_MAX_PER_WINDOW) {
    throw new Error('Too many product lookups — wait a minute and try again.');
  }
  parseTimestamps.push(now);
}

export async function parseProductUrl(url: string): Promise<ParsedProduct | null> {
  const product_url = normalizeProductUrl(url);
  if (!isValidUrl(product_url)) return null;
  assertParseRateLimit();

  let hostname: string;
  try {
    hostname = new URL(product_url).hostname;
  } catch {
    return null;
  }

  let base: Omit<ParsedProduct, 'price_sats' | 'product_url'> = {
    title: titleFromUrlPath(product_url),
    description: `Buy this for me from ${merchantFromHostname(hostname)}`,
    image_url: '',
    merchant: merchantFromHostname(hostname),
    source: hostKey(hostname).includes('amazon') ? 'amazon' : undefined,
  };

  const html = await fetchPageHtml(product_url);
  if (html) {
    try {
      base = extractFromHtml(html, product_url);
    } catch (e) {
      console.warn('HTML extract failed, using URL fallback', e);
    }
  }

  let price_sats: number | undefined;
  if (base.price_usd && base.price_usd > 0) {
    try {
      const btcPrice = await getBitcoinPrice();
      if (btcPrice > 0) price_sats = usdToSats(base.price_usd, btcPrice);
    } catch {
      /* optional */
    }
  }

  // Default sat goal if no price found — creator can edit
  if (!price_sats) {
    price_sats = 21_000;
  }

  return {
    ...base,
    title: base.title || titleFromUrlPath(product_url),
    description: base.description || `Product link: ${product_url}`,
    price_sats,
    product_url,
    merchant: base.merchant || merchantFromHostname(hostname),
  };
}

export function buyLabel(merchant?: string | null): string {
  const m = (merchant || '').trim();
  if (!m) return 'Buy product';
  return `Buy on ${m}`;
}
