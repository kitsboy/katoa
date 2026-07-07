import { getBitcoinPrice, usdToSats } from './bitcoinPrice';

export interface ParsedProduct {
  title: string;
  description: string;
  price_usd?: number;
  price_sats?: number;
  image_url: string;
  product_url: string;
  merchant: string;
}

export async function parseProductUrl(url: string): Promise<ParsedProduct | null> {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

    const response = await fetch(proxyUrl);
    const data = await response.json();

    if (!data.contents) {
      throw new Error('Failed to fetch page content');
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, 'text/html');

    let title = '';
    let description = '';
    let price_usd: number | undefined;
    let image_url = '';
    const merchant = hostname.replace('www.', '').split('.')[0];

    title =
      doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
      doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content') ||
      doc.querySelector('h1')?.textContent ||
      doc.querySelector('title')?.textContent ||
      '';

    description =
      doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
      doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
      doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content') ||
      '';

    image_url =
      doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
      doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ||
      doc.querySelector('img[itemprop="image"]')?.getAttribute('src') ||
      doc.querySelector('img')?.getAttribute('src') ||
      '';

    if (image_url && !image_url.startsWith('http')) {
      image_url = new URL(image_url, url).href;
    }

    const priceSelectors = [
      '[itemprop="price"]',
      '.price',
      '[class*="price"]',
      '[id*="price"]',
      'meta[property="product:price:amount"]',
      'span[data-price]'
    ];

    for (const selector of priceSelectors) {
      const element = doc.querySelector(selector);
      if (element) {
        const priceText =
          element.getAttribute('content') ||
          element.getAttribute('data-price') ||
          element.textContent ||
          '';

        const priceMatch = priceText.match(/[\d,]+\.?\d*/);
        if (priceMatch) {
          price_usd = parseFloat(priceMatch[0].replace(/,/g, ''));
          break;
        }
      }
    }

    let price_sats: number | undefined;
    if (price_usd) {
      const btcPrice = await getBitcoinPrice();
      if (btcPrice > 0) {
        price_sats = usdToSats(price_usd, btcPrice);
      }
    }

    return {
      title: title.trim().substring(0, 200),
      description: description.trim().substring(0, 500),
      price_usd,
      price_sats,
      image_url,
      product_url: url,
      merchant: merchant.charAt(0).toUpperCase() + merchant.slice(1)
    };
  } catch (error) {
    console.error('Error parsing product URL:', error);
    return null;
  }
}

export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}
