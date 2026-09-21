import { AlertCircle, Check, ExternalLink } from 'lucide-react';
import { Link } from './Link';

export function PreviewReadinessPanel({
  username,
  bio,
  hasWallet,
  publicProjects,
  wishlists,
  publicProfileHref,
}: {
  username: string;
  bio: string;
  hasWallet: boolean;
  publicProjects: number;
  wishlists: { title: string; visibility: string }[];
  publicProfileHref: string;
}) {
  const checks = [
    { label: 'Profile name', ready: Boolean(username.trim()), href: null },
    { label: 'Creator story', ready: Boolean(bio.trim()), href: '/settings' },
    { label: 'Wallet destination', ready: hasWallet, href: '/settings' },
    { label: 'Public project', ready: publicProjects > 0, href: null },
    { label: 'Public wishlist', ready: wishlists.some((wishlist) => wishlist.visibility === 'public'), href: null },
  ];
  const readyCount = checks.filter((check) => check.ready).length;
  const missing = checks.filter((check) => !check.ready);

  return (
    <section data-testid="preview-readiness-panel" className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neon-cyan-300">Before you share</p>
          <h3 className="mt-1 text-lg font-black text-white">Preview readiness</h3>
          <p className="mt-1 text-xs leading-relaxed text-gray-400">This is what a supporter can understand before you publish.</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${missing.length === 0 ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/30 bg-amber-500/10 text-amber-200'}`}>
          {readyCount}/{checks.length} ready
        </span>
      </div>

      {missing.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3" role="status">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-200">
            <AlertCircle size={16} aria-hidden />
            A few details still need attention
          </div>
          <p className="mt-1 text-xs leading-relaxed text-amber-100/75">
            Add these before sharing so supporters are not left guessing: {missing.map((item) => item.label.toLowerCase()).join(', ')}.
          </p>
        </div>
      )}

      <ul className="mt-4 grid gap-2 sm:grid-cols-2" aria-label="Preview readiness checks">
        {checks.map((check) => {
          const content = (
            <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs">
              {check.ready ? <Check size={15} className="text-emerald-400" aria-hidden /> : <AlertCircle size={15} className="text-amber-300" aria-hidden />}
              <span className={check.ready ? 'text-gray-200' : 'text-amber-100'}>{check.label}</span>
            </span>
          );
          return <li key={check.label}>{check.href && !check.ready ? <Link href={check.href}>{content}</Link> : content}</li>;
        })}
      </ul>

      <Link href={publicProfileHref} className="mt-4 inline-flex min-h-[42px] items-center gap-2 text-xs font-bold text-bitcoin-orange-300 hover:text-bitcoin-orange-200">
        <ExternalLink size={14} />
        Open public profile
      </Link>
    </section>
  );
}
