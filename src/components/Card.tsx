import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`bg-night-blue-500 border border-gray-800 rounded-xl overflow-hidden relative group ${
        hover ? 'transition-all duration-500 hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-500/30 hover:-translate-y-2 hover:scale-[1.02] before:absolute before:inset-0 before:bg-gradient-to-br before:from-orange-500/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500' : ''
      } ${className}`}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
