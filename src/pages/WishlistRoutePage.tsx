import { Navigate, useParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { WishlistPage } from './WishlistPage';

export function WishlistRoutePage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLanguage();

  if (!slug) {
    return <Navigate to="/explore" replace />;
  }

  return (
    <WishlistPage
      slug={slug}
      breadcrumbItems={[
        { label: t('nav.explore'), href: '/explore' },
        { label: t('wishlist.title') },
      ]}
    />
  );
}