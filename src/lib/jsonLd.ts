/** Safe JSON-LD for script tags — escapes `<` to avoid breakouts. */
export function toJsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
