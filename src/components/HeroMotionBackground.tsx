interface HeroMotionBackgroundProps {
  src?: string;
  alt?: string;
}

export function HeroMotionBackground({
  src = '/katoa-hero-bg.jpg',
  alt = '',
}: HeroMotionBackgroundProps) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <img
        src={src}
        alt={alt}
        width={1920}
        height={1080}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover motion-hero-image opacity-40 saturate-[0.85]"
      />

      {/* Mesh orbs */}
      <div className="absolute top-[15%] left-[10%] w-[min(480px,60vw)] h-[min(480px,60vw)] rounded-full bg-neon-cyan-500/15 blur-[100px] hero-orb-drift" />
      <div className="absolute bottom-[20%] right-[5%] w-[min(400px,50vw)] h-[min(400px,50vw)] rounded-full bg-bitcoin-orange-500/12 blur-[90px] hero-orb-drift-reverse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(600px,80vw)] h-[min(300px,40vw)] rounded-full bg-purple-500/5 blur-[120px]" />

      {/* Layered vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-950/50 via-charcoal-950/30 to-charcoal-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,transparent_0%,rgba(5,5,9,0.65)_100%)]" />

      {/* Fine scan lines */}
      <div className="absolute inset-0 hero-scanlines opacity-[0.03]" />
    </div>
  );
}