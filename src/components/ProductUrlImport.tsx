import { useState } from 'react';
import { Link2, Loader2, ExternalLink, Package } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import {
  parseProductUrl,
  isValidUrl,
  normalizeProductUrl,
  type ParsedProduct,
} from '../lib/productParser';
import { useLanguage } from '../contexts/LanguageContext';

export interface ProductUrlImportProps {
  /** Called with parsed product when user confirms */
  onImport: (product: ParsedProduct) => void | Promise<void>;
  disabled?: boolean;
  className?: string;
  /** Compact single-column for mobile sheets */
  compact?: boolean;
}

/**
 * Paste an Amazon / clothing / shop URL → preview → add as wishlist gift item.
 * Supporters can open the same link to buy the product for the creator.
 */
export function ProductUrlImport({ onImport, disabled, className = '', compact }: ProductUrlImportProps) {
  const { t } = useLanguage();
  const [url, setUrl] = useState('');
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ParsedProduct | null>(null);

  async function handleParse() {
    setError(null);
    setPreview(null);
    const normalized = normalizeProductUrl(url);
    if (!isValidUrl(normalized)) {
      setError(t('product.invalidUrl') || 'Enter a valid product link (https://…)');
      return;
    }
    setParsing(true);
    try {
      const parsed = await parseProductUrl(normalized);
      if (!parsed) {
        setError(t('product.parseFailed') || 'Could not read that page. You can still add the link manually below.');
        // Minimal fallback so user can still save the link
        setPreview({
          title: normalized,
          description: 'Product link',
          product_url: normalized,
          image_url: '',
          merchant: 'Store',
          price_sats: 21000,
        });
        return;
      }
      setPreview(parsed);
      setUrl(normalized);
    } catch {
      setError(t('product.parseFailed') || 'Could not parse URL. Try again or edit details manually.');
    } finally {
      setParsing(false);
    }
  }

  async function handleConfirm() {
    if (!preview) return;
    setImporting(true);
    setError(null);
    try {
      await onImport(preview);
      setPreview(null);
      setUrl('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add item');
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 ${className}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-bitcoin-orange-500/15 border border-bitcoin-orange-500/25 flex items-center justify-center shrink-0">
          <Link2 size={18} className="text-bitcoin-orange-400" aria-hidden />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-display font-bold text-white">
            {t('product.importTitle') || 'Add from product link'}
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            {t('product.importHelp') ||
              'Paste Amazon, Nike, Etsy, or any shop link. Supporters can fund in sats or buy the item for you.'}
          </p>
        </div>
      </div>

      <div className={`flex ${compact ? 'flex-col' : 'flex-col sm:flex-row'} gap-2`}>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.amazon.com/... or any product URL"
          aria-label="Product URL"
          className="flex-1 min-h-[48px]"
          disabled={disabled || parsing || importing}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void handleParse();
            }
          }}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => void handleParse()}
          disabled={disabled || parsing || importing || !url.trim()}
          className="min-h-[48px] sm:min-w-[140px] shrink-0"
        >
          {parsing ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              Reading…
            </>
          ) : (
            'Parse link'
          )}
        </Button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-amber-400" role="alert">
          {error}
        </p>
      )}

      {preview && (
        <div className="mt-4 rounded-xl border border-neon-cyan-500/25 bg-black/30 p-3 sm:p-4">
          <div className="flex gap-3">
            {preview.image_url ? (
              <img
                src={preview.image_url}
                alt=""
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover bg-charcoal-900 shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Package size={28} className="text-gray-600" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Title</label>
              <input
                value={preview.title}
                onChange={(e) => setPreview({ ...preview, title: e.target.value })}
                className="w-full mb-2 px-2 py-2 min-h-[40px] rounded-lg bg-white/5 border border-white/10 text-sm text-white"
              />
              <div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-2">
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">{preview.merchant}</span>
                {preview.price_usd != null && (
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                    ~${preview.price_usd.toFixed(2)}
                  </span>
                )}
                {preview.price_sats != null && (
                  <span className="px-2 py-0.5 rounded-md bg-bitcoin-orange-500/15 border border-bitcoin-orange-500/30 text-bitcoin-orange-300 font-mono">
                    {preview.price_sats.toLocaleString()} sats
                  </span>
                )}
              </div>
              <a
                href={preview.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-neon-cyan-400 hover:underline min-h-[36px]"
              >
                Open product page <ExternalLink size={12} />
              </a>
            </div>
          </div>
          <label className="block mt-3">
            <span className="text-[10px] uppercase tracking-wider text-gray-500">Description</span>
            <textarea
              value={preview.description}
              onChange={(e) => setPreview({ ...preview, description: e.target.value })}
              rows={2}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white"
            />
          </label>
          <label className="block mt-2">
            <span className="text-[10px] uppercase tracking-wider text-gray-500">Goal (sats)</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={preview.price_sats ?? ''}
              onChange={(e) =>
                setPreview({
                  ...preview,
                  price_sats: Math.max(1, parseInt(e.target.value, 10) || 0),
                })
              }
              className="mt-1 w-full px-3 py-2 min-h-[44px] rounded-lg bg-white/5 border border-white/10 text-sm text-white font-mono"
            />
          </label>
          <Button
            type="button"
            className="w-full mt-3 min-h-[48px] bg-gradient-to-r from-bitcoin-orange-500 to-amber-600 font-bold"
            onClick={() => void handleConfirm()}
            disabled={importing || !preview.title.trim()}
            loading={importing}
          >
            Add to wishlist
          </Button>
        </div>
      )}
    </div>
  );
}
