import { Navigate, useParams } from 'react-router-dom';
import { WishlistPage } from './WishlistPage';

export function WishlistRoutePage() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return <Navigate to="/explore" replace />;
  }

  return <WishlistPage slug={slug} />;
}