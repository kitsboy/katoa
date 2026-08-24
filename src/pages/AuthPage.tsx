import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Link } from '../components/Link';
import { Gift, Mail, Lock, User, Zap, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { PageMeta } from '../components/PageMeta';
import { STORAGE_KEYS } from '../lib/storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { hasNip07, nip07UserMessage } from '../lib/nostr';

type Nip07ChipStatus = 'detected' | 'missing' | 'denied';

function initialNip07Status(): Nip07ChipStatus {
  return hasNip07() ? 'detected' : 'missing';
}

function nip07StatusFromError(err: unknown): Nip07ChipStatus {
  if (!hasNip07()) return 'missing';
  if (/denied|cancelled/i.test(nip07UserMessage(err))) return 'denied';
  return 'detected';
}

function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' | null {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  return 'strong';
}

export function AuthPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { signUp, signIn, signInWithGoogle, signInWithNostr, signInAsDemo, canUseDemoAuth, session } = useAuth();
  const [isSignUp, setIsSignUp] = useState(() => {
    const saved = sessionStorage.getItem(STORAGE_KEYS.authTab);
    return saved === 'signup';
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [nostrNote, setNostrNote] = useState('');
  const [nip07Status, setNip07Status] = useState<Nip07ChipStatus>(initialNip07Status);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEYS.authTab, isSignUp ? 'signup' : 'signin');
  }, [isSignUp]);

  const passwordStrength = isSignUp ? getPasswordStrength(formData.password) : null;

  function postAuthPath(): string {
    const params = new URLSearchParams(window.location.search);
    const next = params.get('next');
    if (next && next.startsWith('/') && !next.startsWith('//')) return next;
    return '/dashboard';
  }

  useEffect(() => {
    const handleAuthCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const errorParam = params.get('error');
      const errorDescription = params.get('error_description');

      if (errorParam) {
        setError(errorDescription || 'Authentication failed. Please try again.');
        window.history.replaceState({}, document.title, '/auth');
      } else if (session && !loading) {
        setTimeout(() => navigate(postAuthPath(), { replace: true }), 100);
      }
    };

    handleAuthCallback();
  }, [session, loading, navigate]);

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSignUpSuccess(false);
    setLoading(true);

    try {
      if (isSignUp && !formData.username.trim()) {
        setError('Username is required');
        return;
      }

      if (isSignUp && formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }

      const result = isSignUp
        ? await signUp(formData.email, formData.password, formData.username)
        : await signIn(formData.email, formData.password);

      if (result.error) {
        setError(result.error.message);
      } else if (isSignUp) {
        setSignUpSuccess(true);
        setIsSignUp(false);
      } else {
        setTimeout(() => navigate(postAuthPath(), { replace: true }), 300);
      }
    } catch (err: unknown) {
      console.error('Auth error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError('');
    setLoading(true);

    try {
      const result = await signInWithGoogle();
      if (result.error) {
        setError(result.error.message || 'Google sign-in failed');
        setLoading(false);
      }
      // OAuth redirect — leave loading true until navigation
    } catch (err: unknown) {
      console.error('Google sign-in error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred with Google sign-in');
      setLoading(false);
    }
  }

  async function handleNostrCheck() {
    setError('');
    setNostrNote('');
    setLoading(true);

    try {
      if (!hasNip07()) {
        setNip07Status('missing');
        setNostrNote(nip07UserMessage(new Error('Nostr extension not found')));
        return;
      }
      const result = await signInWithNostr();
      if (result.error) {
        setNip07Status(nip07StatusFromError(result.error));
        setNostrNote(result.error.message);
      } else {
        setNip07Status('detected');
        setNostrNote(
          'Extension connected. Sign in with email or Google, then link your npub in Settings. Nostr cannot create a session until the server challenge is live.'
        );
      }
    } catch (err: unknown) {
      setNip07Status(nip07StatusFromError(err));
      setNostrNote(nip07UserMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setError('');
    setResetSent(false);
    const email = formData.email.trim();
    if (!email) {
      setError('Enter your email first, then tap Forgot password.');
      return;
    }
    if (!isSupabaseConfigured()) {
      setError('Password reset needs a live Katoa account. Email hello@giveabit.io if you need help.');
      return;
    }
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setResetSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not send reset email');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950 flex items-center justify-center px-4 py-12 pt-8 pb-20 md:pb-12">
      <PageMeta
        title={t('auth.metaTitle')}
        description={t('auth.metaDesc')}
        path="/auth"
        noindex
      />
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/8 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to Home */}
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={20} />
          <span>{t('common.backHome')}</span>
        </Link>

        <Card variant="glass" className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-2xl mb-4">
              <Gift size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isSignUp ? 'Create your creator account' : 'Welcome back'}
            </h1>
            <p className="text-gray-200">
              {isSignUp
                ? 'Email or Google. Optional Nostr. We do not KYC you.'
                : 'Sign in with email or Google. Link Nostr in Settings after.'}
            </p>
            <p className="mt-3 text-xs text-gray-200 leading-relaxed">
              0% platform fees · non-custodial · no KYC by Katoa
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg" role="alert" aria-live="assertive">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {signUpSuccess && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg" role="status" aria-live="polite">
              <p className="text-emerald-300 text-sm">
                Account created. Check your email to confirm if required, then sign in.
              </p>
            </div>
          )}

          {resetSent && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg" role="status" aria-live="polite">
              <p className="text-emerald-300 text-sm">
                Password reset email sent if that address has an account. Check your inbox.
              </p>
            </div>
          )}

          {nostrNote && (
            <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg" role="status" aria-live="polite">
              <p className="text-purple-200 text-sm">{nostrNote}</p>
            </div>
          )}

          {canUseDemoAuth && (
            <div className="mb-6 p-4 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30">
              <p className="text-sm text-neon-cyan-300 mb-3">
                Supabase not connected yet? Preview the logged-in experience without a real account.
              </p>
              <Button
                type="button"
                variant="primary"
                className="w-full"
                loading={loading}
                onClick={async () => {
                  setLoading(true);
                  const { error: demoError } = await signInAsDemo();
                  if (demoError) setError(demoError.message);
                  else navigate(postAuthPath(), { replace: true });
                  setLoading(false);
                }}
              >
                Preview as Demo User →
              </Button>
            </div>
          )}

          {/* Google Sign In */}
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            loading={loading}
            variant="outline"
            className="w-full mb-4 bg-white hover:bg-gray-100 text-gray-900 border-0 h-12"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          {/* Nostr is not a login — challenge Edge Function is not deployed. */}
          <div className="mb-6 p-4 rounded-xl border border-purple-500/30 bg-purple-500/5">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider ${
                  nip07Status === 'detected'
                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200'
                    : nip07Status === 'denied'
                      ? 'border-red-500/40 bg-red-500/15 text-red-200'
                      : 'border-amber-500/40 bg-amber-500/15 text-amber-200'
                }`}
                title={
                  nip07Status === 'detected'
                    ? 'Nostr browser extension found'
                    : nip07UserMessage(
                        new Error(
                          nip07Status === 'denied'
                            ? 'Nostr extension denied permission'
                            : 'Nostr extension not found'
                        )
                      )
                }
              >
                NIP-07 {nip07Status === 'detected' ? 'Detected' : nip07Status === 'denied' ? 'Denied' : 'Missing'}
              </span>
            </div>
            <p className="text-sm text-purple-200/90 mb-3 leading-relaxed">
              Nostr cannot create a session here (server challenge missing). Check your extension, then
              sign in with email or Google and link your npub in Settings.
            </p>
            <Button
              type="button"
              onClick={handleNostrCheck}
              loading={loading}
              variant="outline"
              className="w-full min-h-[44px] border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/10 text-purple-300"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              </svg>
              Check Nostr extension
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-charcoal-900 text-gray-400">Or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 min-h-[44px] bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-cyan-500/50 text-base"
                    placeholder={t('auth.placeholder.username')}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-cyan-500/50 min-h-[44px] text-base"
                  placeholder={t('auth.placeholder.email')}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-cyan-500/50 min-h-[44px] text-base"
                  placeholder={t('auth.placeholder.password')}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  minLength={isSignUp ? 8 : 6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {isSignUp && passwordStrength && (
                <div className="mt-2" aria-live="polite">
                  <div className="flex gap-1 mb-1">
                    {(['weak', 'medium', 'strong'] as const).map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          passwordStrength === 'weak' && level === 'weak'
                            ? 'bg-red-500'
                            : passwordStrength === 'medium' && (level === 'weak' || level === 'medium')
                            ? 'bg-amber-500'
                            : passwordStrength === 'strong'
                            ? 'bg-emerald-500'
                            : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${
                    passwordStrength === 'weak' ? 'text-red-400' : passwordStrength === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {passwordStrength === 'weak' ? t('auth.passwordWeak') : passwordStrength === 'medium' ? t('auth.passwordMedium') : t('auth.passwordStrong')}
                  </p>
                </div>
              )}
            </div>

            {!isSignUp && (
              <div className="flex justify-end -mt-1">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-gray-400 hover:text-white min-h-[44px] px-1"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {isSignUp && (
              <p className="text-xs text-gray-200 leading-relaxed">
                By creating an account you agree to the{' '}
                <Link href="/terms" className="text-emerald-400 hover:underline">
                  Terms
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-emerald-400 hover:underline">
                  Privacy
                </Link>
                . Katoa does not KYC you. Liquid Bitcoin and zero-knowledge proofs are on the roadmap — not required
                to start.
              </p>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700"
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          {/* Toggle Sign Up/Sign In */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setResetSent(false);
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isSignUp ? (
                <>
                  Already have an account? <span className="text-emerald-400 font-medium">Sign in</span>
                </>
              ) : (
                <>
                  Don't have an account? <span className="text-emerald-400 font-medium">Sign up</span>
                </>
              )}
            </button>
          </div>

          {/* Lightning Benefits */}
          {isSignUp && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-start gap-3 text-sm text-gray-400">
                <Zap size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-200">
                  Add your own Lightning or on-chain address in Settings. Supporters pay your wallet — Katoa never
                  holds sats.
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/explore?videos=1"
              className="text-sm text-neon-cyan-400 hover:text-neon-cyan-300 font-medium transition-colors"
            >
              Browse video creators →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
