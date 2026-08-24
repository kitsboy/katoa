/** Safe JSON-LD for script tags — escapes `<` to avoid breakouts. */
export function toJsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

const SITE_URL = (import.meta.env.VITE_SITE_URL ?? 'https://katoa.org').replace(/\/$/, '');

export interface BreadcrumbListItem {
  name: string;
  /** Absolute URL or site path (`/` or `/faq`). */
  item: string;
}

function toAbsoluteUrl(item: string): string {
  if (/^https?:\/\//i.test(item)) return item;
  const path = item.startsWith('/') ? item : `/${item}`;
  return `${SITE_URL}${path}`;
}

/** schema.org BreadcrumbList. Paths are resolved against the site origin. */
export function breadcrumbList(items: BreadcrumbListItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList' as const,
    itemListElement: items.map((crumb, index) => ({
      '@type': 'ListItem' as const,
      position: index + 1,
      name: crumb.name,
      item: toAbsoluteUrl(crumb.item),
    })),
  };
}
