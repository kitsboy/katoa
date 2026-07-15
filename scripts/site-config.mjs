/** Shared site URL for build scripts (sitemap, prerender). */
export const SITE_URL = (process.env.VITE_SITE_URL ?? 'https://katoa.org').replace(/\/$/, '');