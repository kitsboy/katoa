import { useEffect, useState } from 'react';
import { mockCreatorPosts } from '../data/mockCreatorPosts';
import { getSubscriptions } from '../lib/subscriptions';
import { countUnseenNewPosts } from '../lib/creatorEngagement';

/** Small badge for nav — count of unseen new drops from subscribed creators. */
export function CreatorNewDropsBadge({ className = '' }: { className?: string }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    const refresh = () => {
      const subs = getSubscriptions();
      const total = Object.keys(subs).reduce((sum, slug) => {
        const posts = mockCreatorPosts[slug] ?? [];
        return sum + countUnseenNewPosts(posts);
      }, 0);
      setN(total);
    };
    refresh();
    const t = window.setInterval(refresh, 30_000);
    return () => window.clearInterval(t);
  }, []);

  if (n <= 0) return null;
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-pink-500 text-white text-[10px] font-black ${className}`}
      aria-label={`${n} new creator drops`}
    >
      {n > 9 ? '9+' : n}
    </span>
  );
}
