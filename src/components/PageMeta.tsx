import { useEffect } from 'react';

interface PageMetaProps {
  title: string;
  description?: string;
  path?: string;
  image?: string;
}

export function PageMeta({ title, description, path = '', image = 'https://katoa.org/sats.png' }: PageMetaProps) {
  useEffect(() => {
    const fullTitle = title.includes('KATOA') ? title : `${title} | KATOA`;
    document.title = fullTitle;

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
    setMeta('og:url', `https://katoa.org${path}`, 'property');
    setMeta('og:image', image, 'property');
    setMeta('twitter:image', image);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `https://katoa.org${path || '/'}`;
  }, [title, description, path, image]);

  return null;
}