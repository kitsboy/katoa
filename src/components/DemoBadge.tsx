/** Clear “demo / sample” marker so mock data is never mistaken for live. */
export function DemoBadge({
  className = '',
  label = 'Demo',
  title = 'Sample content for preview — not a live creator account',
}: {
  className?: string;
  label?: string;
  title?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-bitcoin-orange-500/15 text-bitcoin-orange-400 border border-bitcoin-orange-500/30 ${className}`}
      title={title}
    >
      {label}
    </span>
  );
}
