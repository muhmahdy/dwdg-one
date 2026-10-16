/* Headings inside pages and panels: a section heading with its count (.sec-h), a small bold sub-heading (.sub-h), and the
   quiet line shown when a list is empty (.empty-inline). */
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** A section heading in a page or panel: a rule above it and the count beside it (.sec-h). `plain` drops the rule. */
export function SectionHeading({
  children,
  count,
  action,
  className,
  plain = false,
  as: Tag = 'h3',
}: {
  children: ReactNode;
  count?: ReactNode;
  /** A control at the right end of the heading line (Add, New). */
  action?: ReactNode;
  className?: string;
  plain?: boolean;
  as?: 'h2' | 'h3';
}) {
  return (
    <Tag
      className={cn(
        'mt-[22px] mb-2 text-d13! type-h3',
        !plain && 'border-t border-line-strong pt-[18px]',
        action != null && 'flex items-center gap-2',
        className,
      )}
    >
      {children}
      {count != null && (
        <>
          {' '}
          <span className="ml-1 text-mute type-num">{count}</span>
        </>
      )}
      {action != null && <span className="ml-auto">{action}</span>}
    </Tag>
  );
}

export function SubHeading({
  children,
  count,
  className,
}: {
  children: ReactNode;
  count?: ReactNode;
  className?: string;
}) {
  return (
    <b className={cn('mt-4 mb-1.5 block font-semibold! type-small', className)}>
      {children}
      {count != null && <span className="ml-1 text-mute type-num">{count}</span>}
    </b>
  );
}

export const EmptyLine = ({ children }: { children: ReactNode }) => (
  <div className="px-2.5 py-3 text-d13h text-mute">{children}</div>
);

/** A thin rule between groups in a panel (.sep). */
export const PanelRule = () => <div className="my-[18px] h-px bg-line-strong" />;
