import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Requires an authenticated session (or demo session). Redirects to /auth with return path.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  if (loading) {
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center"
        role="status"
        aria-busy="true"
        aria-label={t('common.loading')}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-neon-cyan-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-400 text-sm font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/auth?next=${encodeURIComponent(next)}`} replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
