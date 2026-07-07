import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

export function RouteTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="motion-safe:animate-fade-in min-h-0">
      {children}
    </div>
  );
}