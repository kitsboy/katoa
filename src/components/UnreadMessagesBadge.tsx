import { useEffect, useState } from 'react';
import { hasNip07 } from '../lib/nostr';
import { getDmOptInLocal, loadPrivateMessages } from '../lib/nostrChat';
import { countUnread } from '../lib/dmPrefs';

/** Small badge for nav — local unread DM count. */
export function UnreadMessagesBadge({ className = '' }: { className?: string }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!getDmOptInLocal() || !hasNip07()) {
      setN(0);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const msgs = await loadPrivateMessages(40);
        if (cancelled) return;
        setN(countUnread(msgs.map((m) => m.id)));
      } catch {
        if (!cancelled) setN(0);
      }
    })();
    const t = window.setInterval(() => {
      if (!getDmOptInLocal() || !hasNip07()) return;
      loadPrivateMessages(40)
        .then((msgs) => setN(countUnread(msgs.map((m) => m.id))))
        .catch(() => setN(0));
    }, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, []);

  if (n <= 0) return null;
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-bitcoin-orange-500 text-charcoal-950 text-[10px] font-black ${className}`}
      aria-label={`${n} unread messages`}
    >
      {n > 9 ? '9+' : n}
    </span>
  );
}
