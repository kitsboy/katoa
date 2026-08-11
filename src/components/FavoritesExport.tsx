import { useState } from 'react';
import { Download, Share2, Check } from 'lucide-react';
import { Button } from './Button';
import { copyToClipboard } from '../lib/clipboard';
import { getStorage, STORAGE_KEYS } from '../lib/storage';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from './Toast';

type FavMeta = { id: string; slug?: string; title?: string };

/**
 * Export / share fan favorites pack (localStorage explore favorites).
 */
export function FavoritesExport({
  wishlistMeta = [],
  className = '',
}: {
  /** Optional id→slug/title map for richer export */
  wishlistMeta?: FavMeta[];
  className?: string;
}) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const favorites = getStorage<string[]>(STORAGE_KEYS.exploreFavorites, []);

  function buildPack() {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://katoa.org';
    const lines = favorites.map((id) => {
      const meta = wishlistMeta.find((m) => m.id === id);
      if (meta?.slug) return `${meta.title || meta.slug}: ${origin}/wishlist/${meta.slug}`;
      return `${origin}/explore (favorite id: ${id})`;
    });
    return [
      t('favorites.exportHeader'),
      '',
      ...lines,
      '',
      t('favorites.exportFooter'),
      origin,
    ].join('\n');
  }

  async function copyPack() {
    if (!favorites.length) {
      toast(t('explore.noFavorites'), 'info');
      return;
    }
    const r = await copyToClipboard(buildPack());
    if (r === 'success') {
      setCopied(true);
      toast(t('favorites.copied'), 'success');
      setTimeout(() => setCopied(false), 2000);
    } else toast(t('favorites.copyFailed'), 'error');
  }

  async function sharePack() {
    if (!favorites.length) {
      toast(t('explore.noFavorites'), 'info');
      return;
    }
    const text = buildPack();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: t('favorites.shareTitle'), text });
        return;
      } catch {
        /* fall through */
      }
    }
    await copyPack();
  }

  function downloadPack() {
    if (!favorites.length) {
      toast(t('explore.noFavorites'), 'info');
      return;
    }
    const blob = new Blob([buildPack()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'katoa-favorites.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-[44px]"
        onClick={() => void copyPack()}
        disabled={!favorites.length}
      >
        {copied ? <Check size={16} className="mr-1.5" /> : <Share2 size={16} className="mr-1.5" />}
        {t('favorites.copyPack')}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-[44px]"
        onClick={() => void sharePack()}
        disabled={!favorites.length}
      >
        <Share2 size={16} className="mr-1.5" />
        {t('favorites.sharePack')}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-[44px]"
        onClick={downloadPack}
        disabled={!favorites.length}
      >
        <Download size={16} className="mr-1.5" />
        {t('favorites.download')}
      </Button>
      <span className="text-xs text-gray-500 self-center">
        {favorites.length} {t('favorites.count')}
      </span>
    </div>
  );
}
