import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`bg-night-blue-500 border border-gray-800 rounded-xl overflow-hidden ${
        hover ? 'transition-all duration-300 hover:border-orange-500 hover:shadow-xl hover:shadow-orange-500/20 hover:-translate-y-1' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
