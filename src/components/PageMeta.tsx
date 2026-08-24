import { useEffect } from 'react';
import { useLanguage, type Language } from '../contexts/LanguageContext';

const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://katoa.org';
const DEFAULT_TITLE = 'Katoa: Zero-Fee Bitcoin Creator Platform | Lightning & Nostr';
const DEFAULT_DESCRIPTION =
  'Create Bitcoin wishlists, receive Lightning gifts instantly, and keep 100% of earnings. Zero platform fees, no KYC, works in 195+ countries.';
/** Default share card is 1200×630. Do not pair logo2-512.png with these dimensions. */
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-share.svg`;
const OG_SHARE_WIDTH = '1200';
const OG_SHARE_HEIGHT = '630';
const LOGO_512_WIDTH = '512';
const LOGO_512_HEIGHT = '512';

const OG_LOCALE: Record<Language, string> = {
  en: 'en_US',
  es: 'es_ES',
  pt: 'pt_BR',
  fr: 'fr_FR',
  de: 'de_DE',
  ja: 'ja_JP',
  zh: 'zh_CN',
};

interface PageMetaProps {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  /** Open Graph video URL for video wishlists / creator pages */
  ogVideo?: string;
  noindex?: boolean;
}

function toAbsoluteUrl(image: string): string {
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  const imgPath = image.startsWith('/') ? image : `/${image}`;
  return `${SITE_URL}${imgPath}`;
}

export function PageMeta({
  title,
  description,
  path = '',
  image = DEFAULT_OG_IMAGE,
  ogVideo,
  noindex = false,
}: PageMetaProps) {
  const { language } = useLanguage();
  const absoluteImage = toAbsoluteUrl(image);
  const canonicalPath = path || '/';

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
    setMeta('og:url', `${SITE_URL}${canonicalPath}`, 'property');
    setMeta('og:image', absoluteImage, 'property');
    const imagePath = absoluteImage.split('?')[0];
    if (imagePath.endsWith('/og-share.svg')) {
      setMeta('og:image:width', OG_SHARE_WIDTH, 'property');
      setMeta('og:image:height', OG_SHARE_HEIGHT, 'property');
    } else if (imagePath.endsWith('/logo2-512.png')) {
      setMeta('og:image:width', LOGO_512_WIDTH, 'property');
      setMeta('og:image:height', LOGO_512_HEIGHT, 'property');
    } else {
      document.querySelector('meta[property="og:image:width"]')?.remove();
      document.querySelector('meta[property="og:image:height"]')?.remove();
    }
    setMeta('og:image:alt', fullTitle, 'property');
    setMeta('twitter:image', absoluteImage);
    setMeta('og:type', ogVideo ? 'video.other' : 'website', 'property');
    setMeta('og:site_name', 'KATOA', 'property');
    setMeta('og:locale', OG_LOCALE[language], 'property');
    // Creator-economy positioning for share previews
    setMeta('twitter:site', '@give_bit');
    if (ogVideo) {
      const absoluteVideo = toAbsoluteUrl(ogVideo);
      setMeta('og:video', absoluteVideo, 'property');
      setMeta('og:video:secure_url', absoluteVideo, 'property');
      setMeta('og:video:type', 'video/mp4', 'property');
      setMeta('twitter:card', 'player');
      setMeta('twitter:player', absoluteVideo);
    } else {
      setMeta('twitter:card', 'summary_large_image');
      setMeta('twitter:image', absoluteImage);
    }
    setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${SITE_URL}${canonicalPath}`;

    const hreflangs = ['en', 'es', 'pt', 'fr', 'de', 'ja', 'zh'] as const;
    hreflangs.forEach((lang) => {
      let link = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'alternate';
        document.head.appendChild(link);
      }
      link.hreflang = lang;
      link.href = `${SITE_URL}${canonicalPath === '/' ? '/' : canonicalPath}?lang=${lang}`;
    });

    let xDefault = document.querySelector('link[rel="alternate"][hreflang="x-default"]') as HTMLLinkElement | null;
    if (!xDefault) {
      xDefault = document.createElement('link');
      xDefault.rel = 'alternate';
      document.head.appendChild(xDefault);
    }
    xDefault.hreflang = 'x-default';
    xDefault.href = `${SITE_URL}${canonicalPath}`;

    return () => {
      document.title = DEFAULT_TITLE;
      setMeta('description', DEFAULT_DESCRIPTION);
      setMeta('og:description', DEFAULT_DESCRIPTION, 'property');
      setMeta('twitter:description', DEFAULT_DESCRIPTION);
      setMeta('og:title', DEFAULT_TITLE, 'property');
      setMeta('twitter:title', DEFAULT_TITLE);
      setMeta('og:url', `${SITE_URL}/`, 'property');
      setMeta('og:locale', 'en_US', 'property');
      setMeta('robots', 'index, follow');
      if (canonical) canonical.href = `${SITE_URL}/`;
      hreflangs.forEach((lang) => {
        const link = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`) as HTMLLinkElement | null;
        if (link) link.href = `${SITE_URL}/?lang=${lang}`;
      });
      if (xDefault) xDefault.href = `${SITE_URL}/`;
    };
  }, [title, description, canonicalPath, absoluteImage, ogVideo, noindex, language]);

  return null;
}