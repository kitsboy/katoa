import { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://katoa.org';
const DEFAULT_TITLE = 'Katoa: Zero-Fee Bitcoin Creator Platform | Lightning & Nostr';
const DEFAULT_DESCRIPTION =
  'Create Bitcoin wishlists, receive Lightning gifts instantly, and keep 100% of earnings. Zero platform fees, no KYC, works in 195+ countries.';

interface PageMetaProps {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noindex?: boolean;
}

function toAbsoluteUrl(image: string): string {
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  const path = image.startsWith('/') ? image : `/${image}`;
  return `${SITE_URL}${path}`;
}

export function PageMeta({
  title,
  description,
  path = '',
  image = `${SITE_URL}/sats.png`,
  noindex = false,
}: PageMetaProps) {
  const { language } = useLanguage();
  const absoluteImage = toAbsoluteUrl(image);

  useEffect(() => {
    const fullTitle = title.includes('KATOA') ? title : `${title} | KATOA`;
    document.title = fullTitle;
    document.documentElement.lang = language;

    const setMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    if (description) {
      setMeta('description', description);
      setMeta('og:description', description, 'property');
      setMeta('twitter:description', description);
    }
    setMeta('og:title', fullTitle, 'property');
    setMeta('twitter:title', fullTitle);
    setMeta('og:url', `${SITE_URL}${path}`, 'property');
    setMeta('og:image', absoluteImage, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:image', absoluteImage);
    setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${SITE_URL}${path || '/'}`;

    const hreflangs = ['en', 'es', 'pt', 'fr', 'de', 'ja', 'zh'] as const;
    hreflangs.forEach((lang) => {
      let link = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'alternate';
        document.head.appendChild(link);
      }
      link.hreflang = lang;
      link.href = `${SITE_URL}${path || '/'}?lang=${lang}`;
    });

    let xDefault = document.querySelector('link[rel="alternate"][hreflang="x-default"]') as HTMLLinkElement | null;
    if (!xDefault) {
      xDefault = document.createElement('link');
      xDefault.rel = 'alternate';
      document.head.appendChild(xDefault);
    }
    xDefault.hreflang = 'x-default';
    xDefault.href = `${SITE_URL}${path || '/'}`;

    return () => {
      document.title = DEFAULT_TITLE;
      setMeta('description', DEFAULT_DESCRIPTION);
      setMeta('og:description', DEFAULT_DESCRIPTION, 'property');
      setMeta('twitter:description', DEFAULT_DESCRIPTION);
      setMeta('og:title', DEFAULT_TITLE, 'property');
      setMeta('twitter:title', DEFAULT_TITLE);
      setMeta('og:url', `${SITE_URL}/`, 'property');
      setMeta('robots', 'index, follow');
      if (canonical) canonical.href = `${SITE_URL}/`;
    };
  }, [title, description, path, absoluteImage, noindex, language]);

  return null;
}