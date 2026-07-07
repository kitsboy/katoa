import { useState, useEffect, useRef } from 'react';
import { Link } from './Link';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Home, Compass, LayoutDashboard, User, Settings, HelpCircle, MoreHorizontal, X, Zap } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const mainItems = [
  { href: '/', icon: Home, labelKey: 'nav.home', match: (p: string) => p === '/' },
  { href: '/explore', icon: Compass, labelKey: 'nav.explore', match: (p: string) => p.startsWith('/explore') || p.startsWith('/wishlist') },
  { href: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard', match: (p: string) => p.startsWith('/dashboard') || p.startsWith('/project') },
  { href: '/settings', icon: Settings, labelKey: 'nav.settings', match: (p: string) => p.startsWith('/settings') },
];

const moreItems = [
  { href: '/faq', icon: HelpCircle, labelKey: 'nav.faq', match: (p: string) => p.startsWith('/faq') },
  { href: '/comparison', icon: Zap, labelKey: 'nav.comparison', match: (p: string) => p.startsWith('/comparison') },
];

export function MobileNav() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);
  const moreDialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMore) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowMore(false);
    };
    window.addEventListener('keydown', onKey);
    moreDialogRef.current?.querySelector<HTMLElement>('button, a')?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [showMore]);

  const items = user
    ? mainItems
    : [
        ...mainItems.slice(0, 3),
        { href: '/auth', icon: User, labelKey: 'nav.login', match: (p: string) => p.startsWith('/auth') },
      ];

  const moreActive = moreItems.some((item) => item.match(location.pathname));

  return (
    <>
      {showMore && (
        <div className="md:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-labelledby="more-nav-title">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowMore(false)}
            aria-label="Close menu"
          />
          <div ref={moreDialogRef} className="absolute bottom-[calc(56px+env(safe-area-inset-bottom))] inset-x-3 animate-sheet-up">
            <div className="bg-charcoal-900/98 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl">
              <div className="flex items-center justify-between px-2 pb-2 mb-1 border-b border-white/10">
                <span id="more-nav-title" className="text-sm font-bold text-white">{t('nav.more')}</span>
                <button
                  type="button"
                  onClick={() => setShowMore(false)}
                  className="p-2 rounded-lg bg-white/5 text-gray-400"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {moreItems.map((item) => {
                  const Icon = item.icon;
                  const active = item.match(location.pathname);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowMore(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors touch-manipulation ${
                        active
                          ? 'bg-neon-cyan-500/10 border-neon-cyan-500/40 text-neon-cyan-400'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="text-sm font-semibold">{t(item.labelKey)}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-white/10 bg-charcoal-950/95 backdrop-blur-xl safe-area-bottom"
        aria-label="Mobile navigation"
      >
        <div className="flex items-stretch justify-around px-1 pt-1 pb-safe">
          {items.map((item) => {
            const active = item.match(location.pathname);
            const Icon = item.icon;
            const label = t(item.labelKey);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] rounded-xl transition-colors touch-manipulation ${
                  active ? 'text-neon-cyan-500' : 'text-gray-500 hover:text-gray-300'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] font-semibold tracking-wide">{label}</span>
                {active && (
                  <span className="absolute bottom-1 w-8 h-0.5 rounded-full bg-neon-cyan-500" aria-hidden />
                )}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setShowMore(true)}
            className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] rounded-xl transition-colors touch-manipulation ${
              moreActive || showMore ? 'text-neon-cyan-500' : 'text-gray-500 hover:text-gray-300'
            }`}
            aria-expanded={showMore}
            aria-haspopup="dialog"
            aria-label={t('nav.more')}
          >
            <MoreHorizontal size={22} strokeWidth={moreActive ? 2.5 : 2} />
            <span className="text-[10px] font-semibold tracking-wide">{t('nav.more')}</span>
            {moreActive && (
              <span className="absolute bottom-1 w-8 h-0.5 rounded-full bg-neon-cyan-500" aria-hidden />
            )}
          </button>
        </div>
      </nav>
    </>
  );
}