/** Celebrates funding milestones on wishlist/project pages. */
export function MilestoneBanner({
  percent,
  className = '',
}: {
  percent: number;
  className?: string;
}) {
  if (percent < 25) return null;

  const tier =
    percent >= 100
      ? { label: 'Goal reached', message: 'This wishlist hit 100%. Celebrate with the creator.' }
      : percent >= 75
        ? { label: '75% funded', message: 'Almost there — share the link to finish strong.' }
        : percent >= 50
          ? { label: 'Halfway', message: '50% of the goal is funded. Momentum is real.' }
          : { label: '25% funded', message: 'First quarter unlocked. Keep the gifts coming.' };

  return (
    <div
      className={`rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center ${className}`}
      role="status"
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/90 mb-0.5">
        {tier.label}
      </p>
      <p className="text-sm text-emerald-100/90">{tier.message}</p>
    </div>
  );
}
