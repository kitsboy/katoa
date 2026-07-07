import { Link } from '../components/Link';
import { Button } from '../components/Button';
import { PageMeta } from '../components/PageMeta';
import { Home, Compass } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950 flex items-center justify-center px-4 pt-24 pb-20">
      <PageMeta title="Page Not Found" description="The page you're looking for doesn't exist on KATOA." path="/404" />
      <div className="text-center max-w-md animate-slide-up">
        <p className="text-8xl font-display font-black text-neon-cyan-500/30 mb-4">404</p>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3">Page not found</h1>
        <p className="text-gray-400 mb-8">This route doesn't exist. Head back to explore creators or start your own wishlist.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="primary" size="lg" className="w-full sm:w-auto min-w-[180px]">
              <Home size={18} className="mr-2" /> Home
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="outline" size="lg" className="w-full sm:w-auto min-w-[180px]">
              <Compass size={18} className="mr-2" /> Explore
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}