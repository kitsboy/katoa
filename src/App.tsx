import { Suspense, lazy, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { ToastProvider } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DemoBanner } from './components/DemoBanner';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MobileNav } from './components/MobileNav';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { ChangelogModal } from './components/ChangelogModal';
import { RouteTransition } from './components/RouteTransition';
import { useAuth } from './contexts/AuthContext';

const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const ExplorePage = lazy(() => import('./pages/ExplorePage').then((m) => ({ default: m.ExplorePage })));
const WishlistRoutePage = lazy(() => import('./pages/WishlistRoutePage').then((m) => ({ default: m.WishlistRoutePage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const ProjectPage = lazy(() => import('./pages/ProjectPage').then((m) => ({ default: m.ProjectPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const PricingPage = lazy(() => import('./pages/PricingPage').then((m) => ({ default: m.PricingPage })));
const ComparisonPage = lazy(() => import('./pages/ComparisonPage').then((m) => ({ default: m.ComparisonPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then((m) => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const AuthPage = lazy(() => import('./pages/AuthPage').then((m) => ({ default: m.AuthPage })));
const FAQPage = lazy(() => import('./pages/FAQPage').then((m) => ({ default: m.FAQPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
const PitchPage = lazy(() => import('./pages/PitchPage').then((m) => ({ default: m.PitchPage })));

function PageLoader() {
  const { t } = useLanguage();
  return (
    <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-busy="true" aria-label={t('common.loading')}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-neon-cyan-500 border-t-transparent mx-auto mb-4" />
        <p className="text-gray-400 text-sm font-medium">{t('common.loading')}</p>
      </div>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' as ScrollBehavior : 'auto' });
  }, [pathname]);
  return null;
}

function AppShell() {
  const { isDemoUser } = useAuth();
  const { t } = useLanguage();
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[300] focus:px-4 focus:py-2 focus:bg-neon-cyan-500 focus:text-charcoal-950 focus:rounded-lg">
        {t('a11y.skipToContent')}
      </a>
      <Navbar />
      {isDemoUser && <DemoBanner />}
      <main id="main" className="pb-20 md:pb-0">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<RouteTransition><HomePage /></RouteTransition>} />
              <Route path="/explore" element={<RouteTransition><ExplorePage /></RouteTransition>} />
              <Route path="/wishlist/:slug" element={<RouteTransition><WishlistRoutePage /></RouteTransition>} />
              <Route path="/wishlist" element={<Navigate to="/explore" replace />} />
              <Route path="/auth" element={<RouteTransition><AuthPage /></RouteTransition>} />
              <Route path="/about" element={<RouteTransition><AboutPage /></RouteTransition>} />
              <Route path="/contact" element={<RouteTransition><ContactPage /></RouteTransition>} />
              <Route path="/faq" element={<RouteTransition><FAQPage /></RouteTransition>} />
              <Route path="/pricing" element={<RouteTransition><PricingPage /></RouteTransition>} />
              <Route path="/comparison" element={<RouteTransition><ComparisonPage /></RouteTransition>} />
              <Route path="/compare" element={<Navigate to="/comparison" replace />} />
              <Route path="/pitch" element={<RouteTransition><PitchPage /></RouteTransition>} />
              <Route path="/terms" element={<RouteTransition><TermsPage /></RouteTransition>} />
              <Route path="/privacy" element={<RouteTransition><PrivacyPage /></RouteTransition>} />
              <Route path="/dashboard" element={<RouteTransition><DashboardPage /></RouteTransition>} />
              <Route path="/project" element={<RouteTransition><ProjectPage /></RouteTransition>} />
              <Route path="/settings" element={<RouteTransition><SettingsPage /></RouteTransition>} />
              <Route path="/404" element={<RouteTransition><NotFoundPage /></RouteTransition>} />
              <Route path="*" element={<RouteTransition><NotFoundPage /></RouteTransition>} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <MobileNav />
      <PwaInstallPrompt />
      <ChangelogModal />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <ToastProvider>
            <BrowserRouter>
              <ScrollToTop />
              <AppShell />
            </BrowserRouter>
          </ToastProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;