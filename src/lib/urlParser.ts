export interface ParsedProduct {
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
  merchant?: string;
  url: string;
}

export async function parseProductUrl(url: string): Promise<ParsedProduct | null> {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    if (hostname.includes('amazon')) {
      return parseAmazonUrl(url, urlObj);
    } else if (hostname.includes('ebay')) {
      return parseEbayUrl(url, urlObj);
    } else if (hostname.includes('etsy')) {
      return parseEtsyUrl(url, urlObj);
    } else {
      return parseGenericUrl(url);
    }
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
}

function parseAmazonUrl(url: string, urlObj: URL): ParsedProduct {
  const pathParts = urlObj.pathname.split('/');
  const dpIndex = pathParts.findIndex(part => part === 'dp');
  const asin = dpIndex >= 0 ? pathParts[dpIndex + 1] : '';

  let title = 'Amazon Product';
  const titleMatch = urlObj.pathname.match(/\/([^\/]+)\/dp\//);
  if (titleMatch) {
    title = decodeURIComponent(titleMatch[1].replace(/-/g, ' '));
  }

  const merchant = urlObj.hostname.includes('.ca') ? 'Amazon.ca' :
                   urlObj.hostname.includes('.uk') ? 'Amazon.co.uk' :
                   urlObj.hostname.includes('.de') ? 'Amazon.de' : 'Amazon.com';

  return {
    title,
    merchant,
    url,
    imageUrl: `https://images-na.ssl-images-amazon.com/images/I/${asin}.jpg`,
  };
}

function parseEbayUrl(url: string, urlObj: URL): ParsedProduct {
  const itemMatch = urlObj.pathname.match(/\/itm\/([^\/]+)/);
  const title = itemMatch ? decodeURIComponent(itemMatch[1].replace(/-/g, ' ')) : 'eBay Item';

  return {
    title,
    merchant: 'eBay',
    url,
  };
}

function parseEtsyUrl(url: string, urlObj: URL): ParsedProduct {
  const listingMatch = urlObj.pathname.match(/\/listing\/\d+\/([^?]+)/);
  const title = listingMatch ? decodeURIComponent(listingMatch[1].replace(/-/g, ' ')) : 'Etsy Item';

  return {
    title,
    merchant: 'Etsy',
    url,
  };
}

function parseGenericUrl(url: string): ParsedProduct {
  const urlObj = new URL(url);
  const hostname = urlObj.hostname.replace('www.', '');
  const merchant = hostname.split('.')[0];

  return {
    title: 'Product',
    merchant: merchant.charAt(0).toUpperCase() + merchant.slice(1),
    url,
  };
}

export function convertToSats(amount: number, currency: string = 'USD'): number {
  const btcPrices: Record<string, number> = {
    'USD': 100000,
    'CAD': 135000,
    'EUR': 92000,
    'GBP': 79000,
    'AUD': 150000,
    'JPY': 14000000,
    'BRL': 550000,
  };

  const btcPrice = btcPrices[currency] || btcPrices['USD'];
  const btcAmount = amount / btcPrice;
  return Math.floor(btcAmount * 100000000); // Convert BTC to sats
}

export function extractImageFromHtml(html: string): string | null {
  const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
  if (ogImageMatch) return ogImageMatch[1];

  const imgMatch = html.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
  if (imgMatch) return imgMatch[1];

  return null;
}
