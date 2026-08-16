export function formatSatsLabel(sats: number, locale?: string): string {
  const n = new Intl.NumberFormat(locale).format(sats);
  const word = sats === 1 ? 'sat' : 'sats';
  return `${n} ${word}`;
}

export function formatCurrency(amount: number, currency = 'USD', locale?: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

export function formatNumber(value: number, locale?: string): string {
  return new Intl.NumberFormat(locale).format(value);
}

/** Compact count for badges (1.3K, 2.4M); values under 1,000 stay plain. */
export function formatCompactCount(value: number, locale?: string): string {
  const abs = Math.abs(value);
  const compact = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  if (abs >= 1_000_000) return `${compact.format(value / 1_000_000)}M`;
  if (abs >= 1_000) return `${compact.format(value / 1_000)}K`;
  return new Intl.NumberFormat(locale).format(value);
}

export function formatRelativeTime(date: Date, locale?: string): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 60) return rtf.format(diffSec, 'second');
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), 'hour');
  return rtf.format(Math.round(diffSec / 86400), 'day');
}