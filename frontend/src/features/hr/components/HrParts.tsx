/* Small pieces the HR pages share: the breadcrumb, a state chip from a definition, the restricted mark and the tables' look.
   From divisions/div-hr-sng.js shared helpers. */
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
