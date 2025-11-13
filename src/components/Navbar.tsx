import { useState, useEffect } from 'react';
import { Link } from './Link';
import { Button } from './Button';
import { Modal } from './Modal';
import { Input } from './Input';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage, languageFlags, languageNames } from '../contexts/LanguageContext';
import { Bitcoin, Menu, X, User, LogOut, LayoutDashboard, Settings, Zap, Globe, ChevronDown } from 'lucide-react';

export function Navbar() {
  const { user, profile, signOut, signUp, signIn, signInWithGoogle, signInWithNostr } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showMenu, setShowMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', username: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasNostr, setHasNostr] = useState(false);

  useEffect(() => {
    setHasNostr(!!window.nostr);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (authMode === 'signup') {
        const result = await signUp(formData.email, formData.password, formData.username);
        if (result.error) throw result.error;
      } else {
        const result = await signIn(formData.email, formData.password);
        if (result.error) throw result.error;
      }
      setShowAuthModal(false);
      setFormData({ email: '', password: '', username: '' });
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await signInWithGoogle();
      if (result.error) throw result.error;
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleNostrLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await signInWithNostr();
      if (result.error) throw result.error;
      setShowAuthModal(false);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-luxury-800/95 backdrop-blur-md border-b border-electric-500/30 shadow-lg shadow-electric-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 text-white hover:text-shocking-400 transition-colors group">
              <img src="/sats.png" alt="KATOA" className="w-10 h-10 rounded-full group-hover:scale-105 transition-transform" />
              <span className="text-xl font-black">KATOA</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link href="/explore" className="text-cream-400 hover:text-white transition-colors font-bold">
                {t('nav.explore')}
              </Link>
              <Link href="/compare" className="text-cream-400 hover:text-hotpink-400 transition-colors font-black">
                Why KATOA?
              </Link>

              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-1 text-cream-400 hover:text-white transition-colors text-2xl"
                >
                  {languageFlags[language]}
                </button>
                {showLangMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-luxury-700 border border-electric-500/30 rounded-xl shadow-xl py-2 z-50">
                    {Object.entries(languageFlags).map(([lang, flag]) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang as any);
                          setShowLangMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-electric-500/20 text-cream-400 hover:text-white flex items-center gap-3 transition-colors"
                      >
                        <span className="text-xl">{flag}</span>
                        <span className="text-sm font-bold">{languageNames[lang as keyof typeof languageNames]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {user ? (
                <>
                  <Link href="/dashboard" className="flex items-center gap-2 text-cream-400 hover:text-white transition-colors font-bold">
                    <LayoutDashboard size={18} />
                    {t('nav.dashboard')}
                  </Link>
                  <Link href="/settings" className="flex items-center gap-2 text-cream-400 hover:text-white transition-colors font-bold">
                    <Settings size={18} />
                    {t('nav.settings')}
                  </Link>
                  <div className="flex items-center gap-3">
                    <Link href="/settings" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.username}
                          className="w-8 h-8 rounded-full object-cover border-2 border-orange-500/50"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-orange-500/20 border-2 border-orange-500/50 flex items-center justify-center">
                          <User size={16} className="text-orange-500" />
                        </div>
                      )}
                      <span className="text-sm text-gray-400">{profile?.username}</span>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => signOut()}
                      className="text-gray-300"
                    >
                      <LogOut size={18} />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/auth">
                    <Button variant="ghost" size="sm">
                      {t('nav.login')}
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-cyan-600">
                      {t('nav.signup')}
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <button
              className="md:hidden text-white"
              onClick={() => setShowMenu(!showMenu)}
            >
              {showMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {showMenu && (
          <div className="md:hidden border-t border-gray-800 bg-black">
            <div className="px-4 py-4 space-y-3">
              <Link href="/explore" className="block text-gray-300 hover:text-white py-2">
                {t('nav.explore')}
              </Link>

              <div className="border-t border-gray-800 pt-3">
                <p className="text-xs text-gray-500 mb-2">Language</p>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(languageFlags).map(([lang, flag]) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang as any)}
                      className={`text-2xl p-2 rounded ${language === lang ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
                    >
                      {flag}
                    </button>
                  ))}
                </div>
              </div>
              {user ? (
                <>
                  <Link href="/dashboard" className="flex items-center gap-2 text-gray-300 hover:text-white py-2">
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>
                  <Link href="/settings" className="flex items-center gap-2 text-gray-300 hover:text-white py-2">
                    <Settings size={18} />
                    Settings & Profile
                  </Link>
                  <div className="pt-2 border-t border-gray-800">
                    <div className="flex items-center gap-3 mb-3">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.username}
                          className="w-10 h-10 rounded-full object-cover border-2 border-orange-500/50"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-orange-500/20 border-2 border-orange-500/50 flex items-center justify-center">
                          <User size={20} className="text-orange-500" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-white font-medium">{profile?.username}</p>
                        <p className="text-xs text-gray-500">View Profile</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => signOut()} className="w-full">
                      <LogOut size={18} className="mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setAuthMode('signin');
                      setShowAuthModal(true);
                      setShowMenu(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setAuthMode('signup');
                      setShowAuthModal(true);
                      setShowMenu(false);
                    }}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <Modal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title={authMode === 'signin' ? 'Sign In' : 'Create Account'}
      >
        <form onSubmit={handleAuth} className="space-y-4">
          {authMode === 'signup' && (
            <Input
              label="Username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          )}
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>
            {authMode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-700 text-gray-400">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              loading={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </Button>

            {hasNostr && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleNostrLogin}
                loading={loading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
                Sign in with Nostr
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full opacity-50 cursor-not-allowed"
              disabled
              title="Coming soon!"
            >
              <Zap size={20} className="mr-2 text-yellow-500" />
              Sign in with Lightning (Coming Soon)
            </Button>
          </div>

          <p className="text-center text-sm text-gray-400">
            {authMode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
              className="text-orange-500 hover:text-orange-400"
            >
              {authMode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </form>
      </Modal>
    </>
  );
}
