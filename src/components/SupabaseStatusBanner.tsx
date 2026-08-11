import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { Link } from './Link';

/** Shows once when Supabase is placeholder / misconfigured — avoids silent broken auth. */
export function SupabaseStatusBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div
      className="bg-amber-500/10 border-b border-amber-500/30 px-3 py-2 text-center text-xs sm:text-sm text-amber-100"
      role="status"
    >
      <span className="inline-flex items-center justify-center gap-2 flex-wrap">
        <AlertTriangle size={14} className="text-amber-400 shrink-0" aria-hidden />
        <span>
          Live database not configured — demo mode available.{' '}
          <Link href="/auth" className="underline font-semibold text-amber-200">
            Try demo
          </Link>{' '}
          or explore sample wishlists.
        </span>
        <button
          type="button"
          className="underline text-amber-200/80 min-h-[32px] px-1"
          onClick={() => setShow(false)}
        >
          Dismiss
        </button>
      </span>
    </div>
  );
}
