import { ReactNode } from 'react';
import { Breadcrumbs, type BreadcrumbItem } from './Breadcrumbs';
import { PageHero } from './PageHero';

/** Quiet inner-page frame. One column, no extra cards. */
export function PageShell({
  title,
  subtitle,
  crumbs,
  children,
  wide = false,
}: {
  title?: string;
  subtitle?: string;
  crumbs?: BreadcrumbItem[];
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="pb-8">
      <div className={`${wide ? 'max-w-5xl' : 'max-w-3xl'} mx-auto px-4 sm:px-6`}>
        {crumbs && crumbs.length > 0 ? <Breadcrumbs items={crumbs} className="mb-5 sm:mb-6" /> : null}
        {title ? <PageHero title={title} subtitle={subtitle} /> : null}
        {children}
      </div>
    </div>
  );
}
