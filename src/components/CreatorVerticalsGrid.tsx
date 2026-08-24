import { Link } from './Link';
import { CREATOR_VERTICALS } from '../data/creatorVerticals';

/** Homepage / marketing grid — who KATOA is for (bold creator positioning). */
export function CreatorVerticalsGrid({ className = '' }: { className?: string }) {
  return (
    <section className={className} aria-labelledby="creator-verticals-heading">
      <div className="text-center mb-8 sm:mb-10 px-2">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-bitcoin-orange-400 mb-2">
          For every kind of creator
        </p>
        <h2
          id="creator-verticals-heading"
          className="text-2xl sm:text-4xl font-display font-black text-white mb-3"
        >
          Tips & wishlists without the platform tax
        </h2>
        <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Models, athletes, meal planners, golfers, coaches, moms, musicians — if fans want to support you,
          they send <span className="text-white font-semibold">sats or buy your wishlist items</span>. KATOA
          takes <span className="text-bitcoin-orange-400 font-bold">0%</span>. No bank gatekeepers. No KYC theater.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {CREATOR_VERTICALS.map((v) => (
          <Link
            key={v.id}
            href={`/templates?vertical=${v.id}`}
            className="group rounded-2xl border border-white/15 bg-white/[0.05] p-3 sm:p-4 shadow-[0_0_0_1px_rgba(247,147,26,0.22),inset_0_1px_0_rgba(255,255,255,0.12)] hover:shadow-[0_0_0_1px_rgba(247,147,26,0.5),inset_0_1px_0_rgba(255,255,255,0.16)] hover:bg-bitcoin-orange-500/8 transition-all touch-manipulation min-h-[120px] flex flex-col"
          >
            <span className="text-2xl sm:text-3xl mb-2" aria-hidden>
              {v.emoji}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-bitcoin-orange-300 transition-colors leading-snug">
              {v.label}
            </h3>
            <p className="text-xs sm:text-sm text-gray-200 mt-1 leading-relaxed line-clamp-3 flex-1">
              {v.blurb}
            </p>
          </Link>
        ))}
      </div>

      <p className="text-center text-[11px] text-gray-600 mt-6 px-4">
        Adult or SFW — same rails. You control what you publish. Supporters pay you, not us.
      </p>
    </section>
  );
}
