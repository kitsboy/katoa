import { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';

interface LinkProps {
  to?: string;
  href?: string;
  children: ReactNode;
  className?: string;
  [key: string]: any;
}

export function Link({ to, href, children, ...props }: LinkProps) {
  const target = to || href || '/';
  return (
    <RouterLink to={target} {...props}>
      {children}
    </RouterLink>
  );
}
