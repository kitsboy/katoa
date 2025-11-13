import { ExternalLink, Check } from 'lucide-react';
import { Card } from './Card';

export interface WishlistItem {
  id: string;
  title: string;
  description: string;
  price_sats: number;
  sats_raised: number;
  product_url: string;
  merchant: string;
  image_url: string;
  currency: string;
  original_price: number;
  is_funded: boolean;
}

interface WishlistItemsListProps {
  items: WishlistItem[];
  onItemClick?: (item: WishlistItem) => void;
}

export function WishlistItemsList({ items, onItemClick }: WishlistItemsListProps) {
  if (!items || items.length === 0) {
    return null;
  }

  const formatSats = (sats: number): string => {
    if (sats >= 1000000) {
      return `${(sats / 1000000).toFixed(2)}M`;
    } else if (sats >= 1000) {
      return `${(sats / 1000).toFixed(0)}k`;
    }
    return sats.toString();
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
        Wishlist Items
        <span className="text-xs text-sand-tan-500 font-normal">(Click to fund)</span>
      </h3>

      {items.map((item) => {
        const progress = item.price_sats > 0 ? (item.sats_raised / item.price_sats) * 100 : 0;

        return (
          <Card
            key={item.id}
            className={`p-3 hover:border-sand-tan-500 hover:shadow-lg hover:shadow-sand-tan-500/20 transition-all cursor-pointer transform hover:scale-[1.02] ${
              item.is_funded ? 'border-green-500 bg-green-500/5' : 'hover:bg-night-blue-500/30'
            }`}
            onClick={() => onItemClick?.(item)}
          >
            <div className="flex gap-3">
              {/* Thumbnail */}
              <div className="relative flex-shrink-0">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=400';
                  }}
                />
                {item.is_funded && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check size={14} className="text-white" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-white line-clamp-2 leading-tight">
                    {item.title}
                  </h4>
                  <a
                    href={item.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-orange-500 hover:text-orange-400 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>

                <p className="text-xs text-gray-400 line-clamp-1 mb-2">
                  {item.description}
                </p>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{item.merchant}</span>
                  <span className="font-semibold text-orange-500">
                    ${item.original_price} {item.currency}
                  </span>
                </div>

                {/* Progress bar */}
                {!item.is_funded && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">
                        {formatSats(item.sats_raised)} / {formatSats(item.price_sats)} sats
                      </span>
                      <span className="text-orange-500 font-semibold">
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {item.is_funded && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-green-500 font-semibold">
                    <Check size={14} />
                    <span>Fully Funded!</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
