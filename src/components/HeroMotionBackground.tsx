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
        className="absolute inset-0 w-full h-full object-cover motion-hero-image opacity-50"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-950/40 via-charcoal-950/65 to-charcoal-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,9,0.4)_70%)]" />
    </div>
  );
}