/**
 * URL safety helpers for `href` / `src` sinks.
 *
 * HTML-escaping alone does not make a URL scheme safe: `javascript:` and
 * `data:` payloads survive escaping. Anything sourced from outside our own
 * code (OpenStreetMap / BTC Map website fields, user-submitted links, remote
 * API responses) must pass through here before it reaches a sink.
 */

/**
 * Return a safe http(s) URL, or null.
 * Guards `href="..."` sinks against `javascript:` / `data:` / `vbscript:`.
 */
export function safeHttpUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) return null;
  return trimmed;
}
