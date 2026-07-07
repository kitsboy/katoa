import { Link } from './Link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={`text-xs sm:text-sm text-gray-500 overflow-x-auto scrollbar-hide ${className}`}>
      <ol className="flex items-center gap-1 list-none m-0 p-0">
        <li className="flex items-center gap-1 shrink-0">
          <Link href="/" className="hover:text-neon-cyan-400 transition-colors flex items-center gap-1 touch-manipulation">
            <Home size={14} aria-hidden />
            <span className="sr-only sm:not-sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1 shrink-0">
            <ChevronRight size={14} className="text-gray-600" aria-hidden />
            {item.href && i < items.length - 1 ? (
              <Link href={item.href} className="hover:text-neon-cyan-400 transition-colors whitespace-nowrap">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-300 font-medium whitespace-nowrap" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}