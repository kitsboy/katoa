import { Suspense, lazy } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MobileNav } from './components/MobileNav';

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

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-neon-cyan-500 border-t-transparent mx-auto mb-4" />
        <p className="text-gray-400 text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <BrowserRouter>
            <Navbar />
            <main className="pb-20 md:pb-0">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/wishlist/:slug" element={<WishlistRoutePage />} />
                  <Route path="/wishlist" element={<Navigate to="/explore" replace />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/comparison" element={<ComparisonPage />} />
                  <Route path="/compare" element={<Navigate to="/comparison" replace />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/project" element={<ProjectPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<HomePage />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
            <MobileNav />
          </BrowserRouter>
        </CurrencyProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;