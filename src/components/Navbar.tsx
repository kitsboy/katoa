import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { Link } from './Link';
import { Button } from './Button';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage, languageFlags, languageNames, type Language } from '../contexts/LanguageContext';
import { Menu, X, User, LogOut, LayoutDashboard, Settings, Zap, Globe, HelpCircle, Bitcoin, MessageCircle } from 'lucide-react';
import { CurrencySelector } from './CurrencySelector';
import { OfflineIndicator } from './OfflineIndicator';
import { UnreadMessagesBadge } from './UnreadMessagesBadge';
import { CreatorNewDropsBadge } from './CreatorNewDropsBadge';
import { NotificationCenter } from './NotificationCenter';
import { getBitcoinPrice, formatUsd } from '../lib/bitcoinPrice';

type LangMenuPos = { top: number; left: number; maxHeight: number };

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [langMenuPos, setLangMenuPos] = useState<LangMenuPos | null>(null);
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const langTriggerRef = useRef<HTMLDivElement>(null);
  const langListRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;
  const isHomeHero = location.pathname === '/' && !scrolled;

  const updateLangMenuPos = useCallback(() => {
    const trigger = langTriggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const menuWidth = 192; // w-48
    const gap = 8;
    const viewportPad = 8;
    const spaceBelow = window.innerHeight - rect.bottom - gap - viewportPad;
    const spaceAbove = rect.top - gap - viewportPad;
    // Prefer opening below; flip up only when below is too tight and above has more room
    const openAbove = spaceBelow < 220 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(160, Math.min(openAbove ? spaceAbove : spaceBelow, 360));
    const top = openAbove
      ? Math.max(viewportPad, rect.top - gap - maxHeight)
      : rect.bottom + gap;
    const left = Math.min(
      Math.max(viewportPad, rect.right - menuWidth),
      window.innerWidth - menuWidth - viewportPad,
    );
    setLangMenuPos({ top, left, maxHeight });
  }, []);

  useEffect(() => {
    setShowMenu(false);
    setShowLangMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    getBitcoinPrice().then((price) => {
      if (price > 0) setBtcPrice(price);
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showMenu]);

  useLayoutEffect(() => {
    if (!showLangMenu) {
      setLangMenuPos(null);
      return;
    }
    updateLangMenuPos();
  }, [showLangMenu, updateLangMenuPos]);

  useEffect(() => {
    if (!showLangMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (langTriggerRef.current?.contains(target)) return;
      if (langListRef.current?.contains(target)) return;
      setShowLangMenu(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowLangMenu(false);
    };
    const handleReposition = () => updateLangMenuPos();
    const handleScrollClose = () => setShowLangMenu(false);

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', handleReposition);
    // Close on page scroll so fixed coords don't drift (menu's own overflow scroll is fine)
    window.addEventListener('scroll', handleScrollClose, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleScrollClose);
    };
  }, [showLangMenu, updateLangMenuPos]);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 px-3 sm:px-4 pt-3 sm:pt-4 pointer-events-none">
        <nav
          className={`nav-island pointer-events-auto max-w-7xl mx-auto rounded-2xl transition-all duration-500 ${
            scrolled ? 'nav-island-scrolled' : isHomeHero ? 'nav-island-hero' : ''
          }`}
        >
          <div className="px-3 sm:px-5 lg:px-6">
            <div className="flex items-center justify-between h-14 sm:h-[3.75rem]">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity group min-w-0 text-white">
                <div className="relative shrink-0">
                  <img src="/logo2.png" alt="KATOA" width={36} height={36} className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl group-hover:scale-105 transition-transform object-contain bg-charcoal-950/80 p-0.5" />
                  <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-neon-cyan-500/30 to-bitcoin-orange-500/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity -z-10" aria-hidden />
                </div>
                <span className="hidden sm:inline text-base font-display font-semibold tracking-tight truncate">KATOA</span>
                <span className="hidden md:inline text-[10px] font-medium px-2 py-0.5 rounded-md shrink-0 uppercase tracking-wider text-neon-cyan-400/90 bg-neon-cyan-500/10 border border-neon-cyan-500/20" title={t('nav.betaTitle')}>
                  {t('nav.beta')}
                </span>
              </Link>
              <OfflineIndicator />
            </div>

            <div className="hidden md:flex items-center gap-1 lg:gap-2">
              <div className="flex items-center gap-0.5 mr-2 lg:mr-4 px-1 py-1 rounded-full border bg-white/[0.03] border-white/[0.06]">
                <Link
                  href="/explore"
                  className={`nav-link-pill relative ${isActive('/explore') ? 'nav-link-pill-active' : ''}`}
                >
                  {t('nav.explore')}
                  <CreatorNewDropsBadge className="absolute -top-1.5 -right-2.5" />
                </Link>
                <Link
                  href="/comparison"
                  className={`nav-link-pill ${isActive('/comparison') ? 'nav-link-pill-active' : ''}`}
                >
                  {t('nav.comparison')}
                </Link>
                <Link
                  href="/faq"
                  className={`nav-link-pill ${isActive('/faq') ? 'nav-link-pill-active' : ''}`}
                >
                  {t('nav.faq')}
                </Link>
                <Link
                  href="/messages"
                  className={`nav-link-pill relative inline-flex items-center gap-1.5 ${
                    location.pathname.startsWith('/messages') ? 'nav-link-pill-active' : ''
                  }`}
                >
                  <MessageCircle size={14} aria-hidden />
                  {t('nav.messages')}
                  <UnreadMessagesBadge className="ml-0.5" />
                </Link>
              </div>

              <CurrencySelector compact />

              {btcPrice !== null && (
                <div
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bitcoin-orange-500/8 border border-bitcoin-orange-500/15 text-xs font-mono"
                  title="Bitcoin USD price"
                  aria-label={`Bitcoin price ${formatUsd(btcPrice)}`}
                >
                  <Bitcoin size={13} className="text-bitcoin-orange-500" aria-hidden />
                  <span className="text-bitcoin-orange-400/90 font-medium">{formatUsd(btcPrice)}</span>
                </div>
              )}

              <div className="relative" ref={langTriggerRef}>
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center justify-center w-9 h-9 rounded-full border transition-colors text-lg bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08]"
                  aria-label={t('nav.changeLanguage')}
                  aria-expanded={showLangMenu}
                  aria-haspopup="listbox"
                  aria-controls="lang-menu-list"
                >
                  {languageFlags[language]}
                </button>
              </div>

              {user ? (
                <>
                  <Link href="/dashboard" className={`nav-link-pill flex items-center gap-1.5 ${isActive('/dashboard') ? 'nav-link-pill-active' : ''}`}>
                    <LayoutDashboard size={16} />
                    {t('nav.dashboard')}
                  </Link>
                  <Link href="/settings" className={`nav-link-pill flex items-center gap-1.5 ${isActive('/settings') ? 'nav-link-pill-active' : ''}`}>
                    <Settings size={16} />
                    {t('nav.settings')}
                  </Link>
                  <NotificationCenter />

                  <div className="flex items-center gap-3">
                    <Link
                      href={profile?.username ? `/u/${encodeURIComponent(profile.username)}` : '/settings'}
                      className="flex items-center gap-2 hover:opacity-90 transition-opacity"
                    >
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.username}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover border-2 border-katoa-violet-400/50"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center">
                          <User size={16} className="text-gray-100" />
                        </div>
                      )}
                      <span className="text-sm text-white">{profile?.username}</span>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => signOut()}
                      className="text-gray-300 hover:text-white hover:bg-white/5"
                      aria-label={t('nav.signOut')}
                    >
                      <LogOut size={18} />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/auth">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-gray-300 hover:text-white hover:bg-white/[0.06]"
                    >
                      {t('nav.login')}
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button
                      size="sm"
                      className="font-semibold rounded-full px-5 bg-gradient-to-b from-bitcoin-orange-400 to-bitcoin-orange-500 text-charcoal-950 hover:from-bitcoin-orange-300 hover:to-bitcoin-orange-400"
                    >
                      {t('nav.signup')}
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <div className="md:hidden flex items-center gap-2">
              {btcPrice !== null && (
                <span className="text-xs font-mono text-bitcoin-orange-300 px-2 py-1 rounded-full bg-bitcoin-orange-500/10 border border-bitcoin-orange-500/15" aria-label={`BTC ${formatUsd(btcPrice)}`}>
                  ₿ {btcPrice >= 1000 ? `${(btcPrice / 1000).toFixed(1)}k` : btcPrice}
                </span>
              )}
              <button
                className="p-2 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center border text-white hover:bg-white/[0.06] border-white/[0.08]"
                onClick={() => setShowMenu(!showMenu)}
                aria-label="Toggle menu"
                aria-expanded={showMenu}
              >
                {showMenu ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
        </nav>
      </header>

      {showLangMenu &&
        langMenuPos &&
        createPortal(
          <div
            id="lang-menu-list"
            ref={langListRef}
            role="listbox"
            className="fixed w-48 rounded-xl py-2 shadow-2xl border border-white/10 bg-charcoal-950/95 backdrop-blur-xl overflow-y-auto overscroll-contain"
            style={{
              top: langMenuPos.top,
              left: langMenuPos.left,
              maxHeight: langMenuPos.maxHeight,
              zIndex: 100000,
            }}
          >
            {Object.entries(languageFlags).map(([lang, flag]) => (
              <button
                key={lang}
                type="button"
                role="option"
                aria-selected={language === lang}
                onClick={() => {
                  setLanguage(lang as Language);
                  setShowLangMenu(false);
                }}
                className={`w-full px-4 py-2.5 min-h-[44px] text-left hover:bg-white/5 flex items-center gap-3 transition-colors ${
                  language === lang ? 'text-neon-cyan-400 bg-neon-cyan/5' : 'text-gray-100'
                }`}
              >
                <span className="text-xl" aria-hidden>
                  {flag}
                </span>
                <span className="text-sm font-semibold">
                  {languageNames[lang as keyof typeof languageNames]}
                </span>
              </button>
            ))}
          </div>,
          document.body,
        )}

      {showMenu && (
        <>
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md md:hidden"
            style={{ zIndex: 99998 }}
            onClick={() => setShowMenu(false)}
          />
          <div
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-nav-title"
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-charcoal-950/98 backdrop-blur-xl border-l border-white/10 shadow-2xl md:hidden overflow-y-auto overscroll-contain animate-slide-in-right pb-safe"
            style={{ zIndex: 99999 }}
          >
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <img src="/logo2.png" alt="KATOA" className="w-10 h-10 rounded-full" />
                  <span id="mobile-nav-title" className="text-xl font-black text-white">{t('nav.menu')}</span>
                </div>
                <button
                  onClick={() => setShowMenu(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="px-1">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">{t('nav.currency')}</p>
                <CurrencySelector />
              </div>

              <div className="space-y-2">
                <Link
                  href="/explore"
                  className="flex items-center gap-3 px-5 py-4 text-white bg-white/5 hover:bg-neon-cyan/10 rounded-xl transition-all duration-200 group border border-white/10 hover:border-neon-cyan/50"
                  onClick={() => setShowMenu(false)}
                >
                  <div className="relative p-2 bg-neon-cyan/15 rounded-lg group-hover:bg-neon-cyan/25 transition-colors">
                    <Globe size={20} className="text-neon-cyan" />
                    <CreatorNewDropsBadge className="absolute -top-1 -right-1" />
                  </div>
                  <span className="font-bold text-lg">{t('nav.explore')}</span>
                </Link>

                <Link
                  href="/comparison"
                  className="flex items-center gap-3 px-5 py-4 text-white bg-white/5 hover:bg-neon-cyan/10 rounded-xl transition-all duration-200 group border border-white/10 hover:border-neon-cyan/50"
                  onClick={() => setShowMenu(false)}
                >
                  <div className="p-2 bg-neon-cyan/15 rounded-lg group-hover:bg-neon-cyan/25 transition-colors">
                    <Zap size={20} className="text-neon-cyan" />
                  </div>
                  <span className="font-bold text-lg">{t('nav.comparison')}</span>
                </Link>

                <Link
                  href="/faq"
                  className="flex items-center gap-3 px-5 py-4 text-white bg-white/5 hover:bg-neon-cyan/10 rounded-xl transition-all duration-200 group border border-white/10 hover:border-neon-cyan/50"
                  onClick={() => setShowMenu(false)}
                >
                  <div className="p-2 bg-neon-cyan/15 rounded-lg group-hover:bg-neon-cyan/25 transition-colors">
                    <HelpCircle size={20} className="text-neon-cyan" />
                  </div>
                  <span className="font-bold text-lg">{t('nav.faq')}</span>
                </Link>

                <Link
                  href="/messages"
                  className="flex items-center gap-3 px-5 py-4 text-white bg-white/5 hover:bg-neon-cyan/10 rounded-xl transition-all duration-200 group border border-white/10 hover:border-neon-cyan/50"
                  onClick={() => setShowMenu(false)}
                >
                  <div className="relative p-2 bg-neon-cyan/15 rounded-lg group-hover:bg-neon-cyan/25 transition-colors">
                    <MessageCircle size={20} className="text-neon-cyan" />
                    <UnreadMessagesBadge className="absolute -top-1 -right-1" />
                  </div>
                  <span className="font-bold text-lg">{t('nav.messages')}</span>
                </Link>
              </div>

              {btcPrice !== null && (
                <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-bitcoin-orange-500/10 border border-bitcoin-orange-500/30">
                  <Bitcoin size={20} className="text-bitcoin-orange-500" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{t('nav.btcPrice')}</p>
                    <p className="text-white font-bold font-mono">{formatUsd(btcPrice)}</p>
                  </div>
                </div>
              )}

              <div className="border-t border-white/10 pt-6">
                <p className="text-sm text-gray-400 font-bold mb-4 px-2 uppercase tracking-wider">
                  {t('nav.chooseLanguage')}
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {Object.entries(languageFlags).map(([lang, flag]) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang as Language);
                        setShowMenu(false);
                      }}
                      className={`text-3xl p-4 rounded-xl transition-all duration-200 border-2 ${
                        language === lang
                          ? 'bg-gradient-to-br from-neon-cyan to-bitcoin-orange border-neon-cyan shadow-lg shadow-neon-cyan/40 scale-105'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30'
                      }`}
                      title={languageNames[lang as keyof typeof languageNames]}
                      aria-label={languageNames[lang as keyof typeof languageNames]}
                    >
                      {flag}
                    </button>
                  ))}
                </div>
              </div>

              {user ? (
                <>
                  <div className="border-t border-white/10 pt-6 space-y-3">
                    <NotificationCenter variant="inline" onNavigate={() => setShowMenu(false)} />
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-5 py-4 text-white bg-white/5 hover:bg-neon-cyan/10 rounded-xl transition-all duration-200 group border border-white/10 hover:border-neon-cyan/50"
                      onClick={() => setShowMenu(false)}
                    >
                      <div className="p-2 bg-neon-cyan/15 rounded-lg group-hover:bg-neon-cyan/25 transition-colors">
                        <LayoutDashboard size={20} className="text-neon-cyan" />
                      </div>
                      <span className="font-bold text-lg">{t('nav.dashboard')}</span>
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-5 py-4 text-white bg-white/5 hover:bg-neon-cyan/10 rounded-xl transition-all duration-200 group border border-white/10 hover:border-neon-cyan/50"
                      onClick={() => setShowMenu(false)}
                    >
                      <div className="p-2 bg-neon-cyan/15 rounded-lg group-hover:bg-neon-cyan/25 transition-colors">
                        <Settings size={20} className="text-neon-cyan" />
                      </div>
                      <span className="font-bold text-lg">{t('nav.settings')}</span>
                    </Link>
                  </div>

                  <div className="border-t border-white/10 pt-6">
                    <Link href="/settings" onClick={() => setShowMenu(false)}>
                      <div className="bg-gradient-to-br from-charcoal-900 to-black rounded-2xl p-5 mb-4 border-2 border-white/10 hover:border-neon-cyan/50 transition-colors">
                        <div className="flex items-center gap-4">
                          {profile?.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt={profile.username}
                              width={56}
                              height={56}
                              className="w-14 h-14 rounded-full object-cover border-2 border-neon-cyan/60 shadow-lg"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-neon-cyan to-bitcoin-orange border-2 border-neon-cyan/60 flex items-center justify-center shadow-lg">
                              <User size={28} className="text-white" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-white font-black text-lg">{profile?.username}</p>
                            <p className="text-gray-400 text-sm">{t('nav.tapProfile')}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <Button
                      onClick={() => {
                        signOut();
                        setShowMenu(false);
                      }}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 font-bold text-lg py-4 border-2 border-red-400/30 hover:border-red-400/50"
                    >
                      <LogOut size={20} className="mr-2" />
                      {t('nav.signOut')}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="border-t border-white/10 pt-6 space-y-3">
                  <Link href="/auth" onClick={() => setShowMenu(false)}>
                    <Button
                      variant="outline"
                      className="w-full border-2 border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/40 font-bold text-lg py-4"
                    >
                      {t('nav.login')}
                    </Button>
                  </Link>
                  <Link href="/auth" onClick={() => setShowMenu(false)}>
                    <Button className="w-full bg-gradient-to-r from-neon-cyan to-bitcoin-orange hover:from-neon-cyan/90 hover:to-bitcoin-orange/90 text-charcoal-950 font-black text-lg py-5 shadow-lg shadow-neon-cyan/40">
                      {t('nav.getStarted')}
                    </Button>
                  </Link>
                </div>
              )}

              <div className="border-t border-white/10 pt-6">
                <p className="text-xs text-center text-gray-500 leading-relaxed">
                  KATOA – Zero Fees, Maximum Freedom
                  <br />
                  <span className="text-gray-600 text-[10px]">Tap outside or press X to close</span>
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
