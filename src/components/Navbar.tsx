import { useState, useEffect, useRef } from 'react';
import { Link } from './Link';
import { Button } from './Button';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage, languageFlags, languageNames } from '../contexts/LanguageContext';
import { Menu, X, User, LogOut, LayoutDashboard, Settings, Zap, Globe } from 'lucide-react';
import { CurrencySelector } from './CurrencySelector';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-charcoal-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 text-white hover:text-neon-cyan transition-colors group">
              <img src="/sats.png" alt="KATOA" className="w-10 h-10 rounded-full group-hover:scale-105 transition-transform" />
              <span className="text-xl font-display font-bold tracking-tight">KATOA</span>
              <span className="text-xs font-mono text-neon-cyan/80 bg-neon-cyan/15 px-2 py-0.5 rounded-full border border-neon-cyan/40">
                BETA
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link href="/explore" className="text-gray-200 hover:text-neon-cyan transition-colors font-medium">
                {t('nav.explore')}
              </Link>
              <Link href="/comparison" className="text-gray-200 hover:text-neon-cyan transition-colors font-medium">
                Why KATOA?
              </Link>

              <CurrencySelector compact />

              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-1 text-gray-200 hover:text-neon-cyan transition-colors text-2xl"
                >
                  {languageFlags[language]}
                </button>
                {showLangMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-charcoal-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 z-50">
                    {Object.entries(languageFlags).map(([lang, flag]) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang as any);
                          setShowLangMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-white/5 text-gray-100 flex items-center gap-3 transition-colors"
                      >
                        <span className="text-xl">{flag}</span>
                        <span className="text-sm font-semibold">{languageNames[lang as keyof typeof languageNames]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {user ? (
                <>
                  <Link href="/dashboard" className="flex items-center gap-2 text-neon-cyan hover:text-white transition-colors font-semibold">
                    <LayoutDashboard size={18} />
                    {t('nav.dashboard')}
                  </Link>
                  <Link href="/settings" className="flex items-center gap-2 text-gray-200 hover:text-neon-cyan transition-colors font-semibold">
                    <Settings size={18} />
                    {t('nav.settings')}
                  </Link>

                  <div className="flex items-center gap-3">
                    <Link href="/settings" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.username}
                          className="w-8 h-8 rounded-full object-cover border-2 border-neon-cyan/40"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center">
                          <User size={16} className="text-gray-200" />
                        </div>
                      )}
                      <span className="text-sm text-gray-200">{profile?.username}</span>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => signOut()}
                      className="text-gray-300 hover:text-white hover:bg-white/5"
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
                      className="text-gray-200 hover:text-white hover:bg-white/5"
                    >
                      {t('nav.login')}
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button
                      size="sm"
                      className="bg-neon-cyan text-charcoal-950 hover:bg-neon-cyan/90 font-semibold shadow-[0_0_18px_rgba(20,230,255,0.45)]"
                    >
                      {t('nav.signup')}
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <button
              className="md:hidden text-neon-cyan p-2 hover:bg-white/5 rounded-lg transition-colors"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Toggle menu"
            >
              {showMenu ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md md:hidden"
            style={{ zIndex: 99998 }}
            onClick={() => setShowMenu(false)}
          />
          <div
            ref={menuRef}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-gradient-to-b from-charcoal-950 via-black to-black border-l border-white/10 shadow-2xl md:hidden overflow-y-auto"
            style={{ zIndex: 99999 }}
          >
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <img src="/sats.png" alt="KATOA" className="w-10 h-10 rounded-full" />
                  <span className="text-xl font-black text-white">KATOA Menu</span>
                </div>
                <button
                  onClick={() => setShowMenu(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
                  title="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-2">
                <Link
                  href="/explore"
                  className="flex items-center gap-3 px-5 py-4 text-white bg-white/5 hover:bg-neon-cyan/10 rounded-xl transition-all duration-200 group border border-white/10 hover:border-neon-cyan/50"
                  onClick={() => setShowMenu(false)}
                >
                  <div className="p-2 bg-neon-cyan/15 rounded-lg group-hover:bg-neon-cyan/25 transition-colors">
                    <Globe size={20} className="text-neon-cyan" />
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
                  <span className="font-bold text-lg">Why KATOA?</span>
                </Link>
              </div>

              <div className="border-t border-white/10 pt-6">
                <p className="text-sm text-gray-400 font-bold mb-4 px-2 uppercase tracking-wider">
                  Choose Language
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {Object.entries(languageFlags).map(([lang, flag]) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang as any);
                        setShowMenu(false);
                      }}
                      className={`text-3xl p-4 rounded-xl transition-all duration-200 border-2 ${
                        language === lang
                          ? 'bg-gradient-to-br from-neon-cyan to-bitcoin-orange border-neon-cyan shadow-lg shadow-neon-cyan/40 scale-105'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30'
                      }`}
                      title={languageNames[lang as keyof typeof languageNames]}
                    >
                      {flag}
                    </button>
                  ))}
                </div>
              </div>

              {user ? (
                <>
                  <div className="border-t border-white/10 pt-6 space-y-2">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-5 py-4 text-white bg-white/5 hover:bg-neon-cyan/10 rounded-xl transition-all duration-200 group border border-white/10 hover:border-neon-cyan/50"
                      onClick={() => setShowMenu(false)}
                    >
                      <div className="p-2 bg-neon-cyan/15 rounded-lg group-hover:bg-neon-cyan/25 transition-colors">
                        <LayoutDashboard size={20} className="text-neon-cyan" />
                      </div>
                      <span className="font-bold text-lg">Dashboard</span>
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-5 py-4 text-white bg-white/5 hover:bg-neon-cyan/10 rounded-xl transition-all duration-200 group border border-white/10 hover:border-neon-cyan/50"
                      onClick={() => setShowMenu(false)}
                    >
                      <div className="p-2 bg-neon-cyan/15 rounded-lg group-hover:bg-neon-cyan/25 transition-colors">
                        <Settings size={20} className="text-neon-cyan" />
                      </div>
                      <span className="font-bold text-lg">Settings</span>
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
                              className="w-14 h-14 rounded-full object-cover border-2 border-neon-cyan/60 shadow-lg"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-neon-cyan to-bitcoin-orange border-2 border-neon-cyan/60 flex items-center justify-center shadow-lg">
                              <User size={28} className="text-white" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-white font-black text-lg">{profile?.username}</p>
                            <p className="text-gray-400 text-sm">Tap to view profile</p>
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
                      Sign Out
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
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth" onClick={() => setShowMenu(false)}>
                    <Button className="w-full bg-gradient-to-r from-neon-cyan to-bitcoin-orange hover:from-neon-cyan/90 hover:to-bitcoin-orange/90 text-charcoal-950 font-black text-lg py-5 shadow-lg shadow-neon-cyan/40">
                      Get Started Free
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
