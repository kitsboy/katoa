import { Link } from './Link';
import { ArrowRight, Zap, Shield, Globe, ChevronDown, TrendingUp } from 'lucide-react';

interface LandingHeroProps {
  badge: string;
  keepLabel: string;
  percentLabel: string;
  earningsLabel: string;
  subtitle: string;
  subtitle2: string;
  ctaStart: string;
  ctaCompare: string;
  stats: { volume: string; countries: string; feesLabel: string; processedLabel: string; countriesLabel: string };
}

function LightBeam({ className }: { className: string }) {
  return <div className={`landing-light-beam ${className}`} aria-hidden />;
}

function StatTile({ value, label, accent }: { value: string; label: string; accent: string }) {
  return (
    <div className="landing-stat-tile">
      <span className={`text-lg sm:text-xl font-black font-mono tabular-nums ${accent}`}>{value}</span>
      <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-gray-500">{label}</span>
    </div>
  );
}

function TerminalCard() {
  const bars = [42, 68, 55, 88, 72, 95, 100];
  return (
    <div className="landing-terminal relative">
      <div className="landing-terminal-glow" aria-hidden />
      <div className="landing-terminal-inner">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="landing-terminal-dot" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-gray-500 font-semibold">Live earnings</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            0% fee
          </span>
        </div>

        <div className="flex items-end gap-1 h-24 mb-5">
          {bars.map((h, i) => (
            <div
              key={i}
              className="landing-terminal-bar flex-1 rounded-t-sm"
              style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="landing-terminal-metric">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">You keep</span>
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">100%</span>
          </div>
          <div className="landing-terminal-metric">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">OnlyFans</span>
            <span className="text-2xl sm:text-3xl font-black text-red-400/90 font-mono line-through decoration-2">80%</span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <TrendingUp size={16} className="text-neon-cyan-400 shrink-0" />
          <p className="text-xs text-gray-400 leading-snug">
            <span className="text-emerald-400 font-semibold">+$2,400/mo</span> saved vs traditional platforms
          </p>
        </div>
      </div>
    </div>
  );
}

function TrustChip({ icon: Icon, label }: { icon: typeof Zap; label: string }) {
  return (
    <div className="landing-trust-chip">
      <Icon size={14} className="text-neon-cyan-400" strokeWidth={2.5} />
      <span>{label}</span>
    </div>
  );
}

export function LandingHero({
  badge,
  keepLabel,
  percentLabel,
  earningsLabel,
  subtitle,
  subtitle2,
  ctaStart,
  ctaCompare,
  stats,
}: LandingHeroProps) {
  return (
    <section className="landing-hero relative min-h-[100dvh] flex flex-col overflow-hidden">
      {/* Background architecture */}
      <div className="absolute inset-0" aria-hidden>
        <img
          src="/katoa-hero-bg.jpg"
          alt=""
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover motion-hero-image opacity-35 saturate-[0.9]"
        />

        <div className="landing-aurora landing-aurora-cyan" />
        <div className="landing-aurora landing-aurora-orange" />
        <div className="landing-aurora landing-aurora-violet" />

        <LightBeam className="landing-beam-1" />
        <LightBeam className="landing-beam-2" />
        <LightBeam className="landing-beam-3" />

        <div className="landing-horizon" />
        <div className="landing-grid-floor" />
        <div className="landing-noise" />
        <div className="landing-vignette" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center px-4 sm:px-6 lg:px-10 pt-28 sm:pt-32 pb-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left — editorial headline */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="landing-hero-badge inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-6 sm:mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-neon-cyan-400 opacity-70 motion-safe:animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-cyan-500 shadow-[0_0_12px_#14E6FF]" />
                </span>
                <span className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] text-gray-300 uppercase">
                  {badge}
                </span>
              </div>

              <h1 className="font-display font-bold tracking-tight mb-6 sm:mb-8">
                <span className="block text-sm sm:text-base md:text-lg text-gray-500 uppercase tracking-[0.35em] mb-3 sm:mb-4 font-medium">
                  {keepLabel}
                </span>
                <span className="block landing-hero-percent leading-[0.85] font-black">
                  {percentLabel}
                </span>
                <span className="block mt-4 sm:mt-5 text-xl sm:text-2xl md:text-[2rem] text-white/80 font-medium max-w-xl mx-auto lg:mx-0">
                  {earningsLabel}
                </span>
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-xl mx-auto lg:mx-0 mb-8 sm:mb-10 leading-relaxed">
                {subtitle}
                <span className="hidden sm:inline text-gray-600"> · </span>
                <span className="block sm:inline mt-1 sm:mt-0 text-gray-500">{subtitle2}</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8 sm:mb-10">
                <Link href="/dashboard" className="landing-cta-primary group">
                  <span>{ctaStart}</span>
                  <ArrowRight className="ml-2 transition-transform group-hover:translate-x-0.5" size={18} strokeWidth={2.5} />
                </Link>
                <Link href="/comparison" className="landing-cta-secondary">
                  {ctaCompare}
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3">
                <TrustChip icon={Zap} label="Lightning" />
                <TrustChip icon={Shield} label="Nostr" />
                <TrustChip icon={Globe} label="195+ countries" />
              </div>
            </div>

            {/* Right — floating terminal */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-md landing-terminal-float">
                <TerminalCard />
              </div>
            </div>
          </div>

          {/* Bottom stats rail */}
          <div className="mt-12 sm:mt-16 lg:mt-20">
            <div className="landing-stats-rail">
              <StatTile value={stats.volume} label={stats.processedLabel} accent="text-bitcoin-orange-400" />
              <div className="landing-stats-divider" aria-hidden />
              <StatTile value={stats.countries} label={stats.countriesLabel} accent="text-neon-cyan-400" />
              <div className="landing-stats-divider" aria-hidden />
              <StatTile value="0%" label={stats.feesLabel} accent="text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 motion-safe:animate-bounce z-10" aria-hidden>
        <span className="text-[10px] uppercase tracking-[0.3em] text-gray-600">Scroll</span>
        <ChevronDown size={20} className="text-gray-500" strokeWidth={1.5} />
      </div>
    </section>
  );
}