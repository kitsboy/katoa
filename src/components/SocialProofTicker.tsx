const wins = [
  'Creator in Nigeria saved $2,400/yr',
  'Skate park in Medellín — 65% funded',
  '0% fees — 100% to creators',
  'Lightning payout in 3 seconds',
  '195+ countries supported',
];

export function SocialProofTicker() {
  return (
    <div className="overflow-hidden border-y border-white/5 bg-charcoal-900/50 py-2.5" aria-hidden>
      <div className="flex motion-safe:animate-[ticker_40s_linear_infinite] gap-8 whitespace-nowrap">
        {[...wins, ...wins].map((text, i) => (
          <span key={`${text}-${i}`} className="text-xs sm:text-sm text-gray-400 font-medium px-2">
            <span className="text-bitcoin-orange-400 mr-2">✦</span>
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}