import { Navigate, useParams } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { WishlistPage } from './WishlistPage';

export function WishlistRoutePage() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return <Navigate to="/explore" replace />;
  }

  return (
    <>
      <PageMeta
        title="Wishlist"
        description="Support this creator's wishlist with Bitcoin Lightning on KATOA. Zero platform fees, instant donations."
        path={`/w/${slug}`}
      />
      <WishlistPage
        slug={slug}
        breadcrumbItems={[
          { label: 'Explore', href: '/explore' },
          { label: 'Wishlist' },
        ]}
      />
    </>
  );
}