import { useLanguage } from '../contexts/LanguageContext';

type Visibility = 'public' | 'private' | 'draft' | string;

const STYLES: Record<string, string> = {
  public: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35',
  private: 'bg-amber-500/15 text-amber-200 border-amber-500/35',
  draft: 'bg-gray-500/20 text-gray-300 border-white/15',
};

/** Draft / private / public badge for wishlist pages. */
export function VisibilityBadge({
  visibility,
  className = '',
}: {
  visibility?: Visibility | null;
  className?: string;
}) {
  const { t } = useLanguage();
  if (!visibility) return null;
  const key = visibility.toLowerCase();
  const label =
    key === 'public'
      ? t('visibility.public')
      : key === 'private'
        ? t('visibility.private')
        : key === 'draft'
          ? t('visibility.draft')
          : visibility;
  const style = STYLES[key] || STYLES.draft;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${style} ${className}`}
      title={t('visibility.help')}
    >
      {label}
    </span>
  );
}
