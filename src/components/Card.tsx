import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-2xl overflow-hidden relative shadow-sm ${
        hover ? 'transition-all duration-300 hover:border-blue-200 hover:shadow-lg hover:-translate-y-1' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
