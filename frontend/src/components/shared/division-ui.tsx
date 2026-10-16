/* Pieces every division module shares: the breadcrumb (division, then the path), state chips, the restricted mark, tables
   that scroll inside their own box on narrow screens, and the quiet notes under a page. From divisions/div-hr-sng.js helpers. */
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { divisionOf } from '@/app/config/org';
import { Restricted } from '@/components/ui/page';
import { Chip } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import type { DivisionId } from '@/types/workspace';

/** "HR / Attendance / Meeting": the division's short name, then the path. The last part is the current page. */
export function DivCrumb({ d, parts }: { d: DivisionId; parts: [href: string, text: string][] }) {
  return (
    <>
      {divisionOf(d)?.short}
      {parts.map(([h, text], i) => (
        <span key={`${h}${text}`}>
          <i className="mx-1.5 text-faint not-italic">/</i>
          {i === parts.length - 1 ? (
            <b>{text}</b>
          ) : (
            <Link to={`/${h}`} className="no-underline">
              {text}
            </Link>
          )}
        </span>
      ))}
    </>
  );
}

export { Chip };

export const Locked = ({ children }: { children?: ReactNode }) => (
  <Restricted>{children ?? t('Restricted')}</Restricted>
);

/** A table that scrolls sideways inside its own box on narrow screens, never the page (.hr-scroll .tbl). */
export const tblScroll = '-mx-1 overflow-x-auto px-1';
export const tblClass = 'w-full border-separate border-spacing-y-[3px] text-d13h';
export const th = 'h-8 px-2.5 text-left font-medium whitespace-nowrap text-mute type-caption';
export const td =
  'h-11 px-2.5 [&_small]:block whitespace-nowrap first:rounded-l-ctl last:rounded-r-ctl group-hover/tr:bg-hover';
export const trLink =
  'group/tr cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring';

export const Hint = ({ children, className }: { children: ReactNode; className?: string }) => (
  <p className={cn('mt-[18px] mb-0 text-mute type-small', className)}>{children}</p>
);

export const SmallNote = ({ children }: { children: ReactNode }) => (
  <p className="my-2 text-mute type-small">{children}</p>
);

/** A small outlined tag (.tag-outline, .tag-unknown): a kind, a count, or "no date" and "not named". */
export const Tag = ({
  children,
  className,
  title,
  unknown = false,
  tone,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  /** A filled warning or danger tag (.tag-warn, .tag-danger); without it the quiet outlined tag. */
  tone?: 'warn' | 'danger';
  /** The hatched mark for something not known yet (.tag-unknown): no date, not named, not recorded. */
  unknown?: boolean;
}) => (
  <span
    {...(title ? { title } : {})}
    className={cn(
      'inline-flex h-6 items-center gap-1 rounded-chip px-2 text-d12 font-semibold whitespace-nowrap text-mute shadow-[inset_0_0_0_1px_var(--line-strong)]',
      unknown && 'bg-[repeating-linear-gradient(135deg,var(--fill)_0_6px,var(--surface-2)_6px_12px)]',
      tone === 'warn' && 'bg-warning-soft text-warning shadow-none',
      tone === 'danger' && 'bg-danger-soft text-danger shadow-none',
      className,
    )}
  >
    {children}
  </span>
);
