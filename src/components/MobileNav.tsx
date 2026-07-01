import { Link } from './Link';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Home, Compass, LayoutDashboard, User, Settings } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const navItems = [
  { href: '/', icon: Home, label: 'Home', match: (p: string) => p === '/' },
  { href: '/explore', icon: Compass, labelKey: 'nav.explore', match: (p: string) => p.startsWith('/explore') || p.startsWith('/wishlist') },
  { href: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard', match: (p: string) => p.startsWith('/dashboard') || p.startsWith('/project') },
  { href: '/settings', icon: Settings, labelKey: 'nav.settings', match: (p: string) => p.startsWith('/settings') },
];

export function MobileNav() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const items = user
    ? navItems
    : [
        ...navItems.slice(0, 3),
        { href: '/auth', icon: User, labelKey: 'nav.login', match: (p: string) => p.startsWith('/auth') },
      ];

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-white/10 bg-charcoal-950/95 backdrop-blur-xl safe-area-bottom"
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch justify-around px-1 pt-1 pb-safe">
        {items.map((item) => {
          const active = item.match(location.pathname);
          const Icon = item.icon;
          const label = 'labelKey' in item && item.labelKey ? t(item.labelKey) : item.label;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] rounded-xl transition-colors touch-manipulation ${
                active
                  ? 'text-neon-cyan-500'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-semibold tracking-wide">{label}</span>
              {active && (
                <span className="absolute bottom-1 w-8 h-0.5 rounded-full bg-neon-cyan-500" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}