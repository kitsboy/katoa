import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { WishlistPage } from './pages/WishlistPage';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PricingPage } from './pages/PricingPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { AuthPage } from './pages/AuthPage';
import { useRouter } from './hooks/useRouter';

function App() {
  const path = useRouter();

  let page;
  if (path === '/' || path === '') {
    page = <HomePage />;
  } else if (path === '/explore') {
    page = <ExplorePage />;
  } else if (path === '/auth') {
    page = <AuthPage />;
  } else if (path === '/dashboard') {
    page = <DashboardPage />;
  } else if (path === '/settings') {
    page = <SettingsPage />;
  } else if (path === '/about') {
    page = <AboutPage />;
  } else if (path === '/contact') {
    page = <ContactPage />;
  } else if (path === '/pricing') {
    page = <PricingPage />;
  } else if (path === '/terms') {
    page = <TermsPage />;
  } else if (path === '/privacy') {
    page = <PrivacyPage />;
  } else if (path.startsWith('/wishlist/')) {
    const slug = path.split('/')[2];
    page = <WishlistPage slug={slug} />;
  } else {
    page = <HomePage />;
  }

  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="min-h-screen bg-black flex flex-col">
          <Navbar />
          <main className="flex-1">
            {page}
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
