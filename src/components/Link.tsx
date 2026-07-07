import { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';

type RouterLinkProps = ComponentPropsWithoutRef<typeof RouterLink>;

interface LinkProps extends Omit<RouterLinkProps, 'to'> {
  to?: string;
  href?: string;
  children: ReactNode;
}

function isExternalUrl(target: string): boolean {
  return /^(https?:\/\/|mailto:|tel:)/i.test(target);
}

export function Link({ to, href, children, target, rel, ...props }: LinkProps) {
  const targetPath = to || href || '/';

  if (isExternalUrl(targetPath)) {
    return (
      <a
        href={targetPath}
        target={target ?? '_blank'}
        rel={rel ?? 'noopener noreferrer'}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <RouterLink to={targetPath} target={target} rel={rel} {...props}>
      {children}
    </RouterLink>
  );
}