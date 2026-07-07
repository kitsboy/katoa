import { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function RouteTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  useEffect(() => {
    const main = document.getElementById('main');
    if (main) main.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div key={pathname} className="motion-safe:animate-fade-in min-h-0">
      {children}
    </div>
  );
}