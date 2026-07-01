interface SatsDisplayProps {
  sats: number;
  showBtc?: boolean;
  showFiat?: boolean;
  fiatAmount?: number;
  fiatCurrency?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function formatSats(sats: number): string {
  return new Intl.NumberFormat().format(sats);
}

function satsToBtc(sats: number): string {
  const btc = sats / 100_000_000;
  if (btc >= 1) return btc.toFixed(4);
  if (btc >= 0.01) return btc.toFixed(6);
  return btc.toFixed(8);
}

export function SatsDisplay({
  sats,
  showBtc = true,
  showFiat = false,
  fiatAmount,
  fiatCurrency = 'USD',
  size = 'md',
  className = '',
}: SatsDisplayProps) {
  const sizeClasses = {
    sm: { primary: 'text-sm font-bold', secondary: 'text-xs' },
    md: { primary: 'text-lg font-black', secondary: 'text-sm' },
    lg: { primary: 'text-2xl font-black', secondary: 'text-base' },
  };

  const styles = sizeClasses[size];

  return (
    <div className={`flex flex-col ${className}`}>
      <span className={`${styles.primary} text-white font-mono`}>
        {formatSats(sats)} <span className="text-bitcoin-orange-500">sats</span>
      </span>
      {showBtc && (
        <span className={`${styles.secondary} text-gray-400 font-mono`}>
          ₿{satsToBtc(sats)}
        </span>
      )}
      {showFiat && fiatAmount !== undefined && (
        <span className={`${styles.secondary} text-gray-500`}>
          ≈ {new Intl.NumberFormat(undefined, { style: 'currency', currency: fiatCurrency }).format(fiatAmount)}
        </span>
      )}
    </div>
  );
}