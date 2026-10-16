/* Page building blocks from the design system (components.css .page, .ph, .rows, .row, .tabs, .empty, .restricted): the
   page frame, its header, list rows, tab links, the empty state, and the "outside your workspace" mark. */
import type { HTMLAttributes, InputHTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import { Link } from 'react-router';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';

/** The page frame: 32px side padding (24 and 16 on narrower screens), 980px wide unless `wide`. */
export function Page({
  wide = false,
  canvas = false,
  className,
  children,
  ...rest
}: { wide?: boolean; canvas?: boolean } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'px-[var(--page-x)] pt-6 pb-12 max-[760px]:pt-[18px] max-[760px]:pb-10',
        !wide && 'max-w-[980px]',
        canvas && 'comfortable:pt-2',
        className,
      )}
      {...(canvas ? { 'data-canvas': '' } : {})}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Title, a quiet line under it, and controls on the right. */
export function PageHeader({
  title,
  sub,
  children,
  className,
}: {
  title: ReactNode;
  sub?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-x-3 gap-y-3', className)}>
      <div className="min-w-0">
        <h1 className="m-0 type-title comfortable:tracking-[-0.01em]">{title}</h1>
        {sub != null && <p className="mt-1 mb-0 text-d13h text-mute">{sub}</p>}
      </div>
      {children && (
        <div className="flex max-w-full flex-[0_1_auto] flex-wrap items-center justify-end gap-2 max-[760px]:flex-[1_1_100%]">
          {children}
        </div>
      )}
    </div>
  );
}

export const Rows = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('flex flex-col gap-[3px]', className)}>{children}</div>
);

export const rowClass = (selected = false) =>
  cn(
    'group/row flex min-h-[var(--row-h)] cursor-pointer items-center gap-3 rounded-ctl px-2.5 py-1.5 hover:bg-hover roomy:py-[7px] phone:roomy:min-h-[60px]',
    'focus-visible:outline-offset-[-2px]',
    selected && 'bg-sel hover:bg-sel',
  );

/** A list row: avatar or art, a title with a quiet line, and whatever trails. Clickable when `onOpen` is given. */
export function Row({
  onOpen,
  selected,
  className,
  children,
  ...rest
}: { onOpen?: () => void; selected?: boolean } & Omit<HTMLAttributes<HTMLDivElement>, 'onClick'>) {
  const key = (e: KeyboardEvent<HTMLDivElement>) => {
    if (onOpen && e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onOpen();
    }
  };
  return (
    <div
      className={cn(rowClass(selected), !onOpen && 'cursor-default', className)}
      {...(onOpen ? { role: 'button', tabIndex: 0, onClick: onOpen, onKeyDown: key } : {})}
      {...rest}
    >
      {children}
    </div>
  );
}

/** The text column of a row: a title and a quiet second line that fades out at the edge. */
export const RowText = ({ title, sub, className }: { title: ReactNode; sub?: ReactNode; className?: string }) => (
  <div
    className={cn(
      'min-w-0 flex-1 fade-end overflow-hidden whitespace-nowrap [&_small]:block [&_small]:text-d12h [&_small]:text-mute',
      className,
    )}
  >
    {title}
    {sub != null && <small>{sub}</small>}
  </div>
);

/** One tab (.tabs button): the current one is underlined. */
export const tabClass = (on: boolean) =>
  cn(
    'relative inline-flex h-10 flex-none cursor-pointer items-center border-0 bg-transparent p-0 font-[550] whitespace-nowrap text-mute no-underline',
    on &&
      "text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-[2px] after:bg-ink after:content-['']",
  );

/** A row of tab links (.tabs); the current one is underlined. */
export function TabLinks({
  tabs,
  label,
  className,
}: {
  tabs: { to: string; label: string; on: boolean; count?: number | null; title?: string }[];
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mt-3.5 mb-1 flex gap-6 shadow-[inset_0_-1px_0_var(--line)] max-[760px]:flex-nowrap max-[760px]:overflow-x-auto',
        className,
      )}
      role="tablist"
      aria-label={label}
    >
      {tabs.map((x) => (
        <Link key={x.to} to={x.to} title={x.title} role="tab" aria-selected={x.on} className={tabClass(x.on)}>
          {x.label}
          {x.count != null && <span className="ml-1.5 text-faint type-num">{x.count}</span>}
        </Link>
      ))}
    </div>
  );
}

/** Nothing here yet: a bold line and one sentence of help. */
export function Empty({ title, children, className }: { title: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <div className={cn('grid justify-items-start gap-2 p-7', className)}>
      <b className="type-h3">{title}</b>
      {children != null && <p className="m-0 mb-1.5 max-w-[44ch] text-mute">{children}</p>}
    </div>
  );
}

/** "Outside your workspace": the neutral stand-in for something the viewer may not see. */
export const Restricted = ({ children }: { children?: ReactNode }) => (
  <span className="inline-flex h-6 items-center gap-1.5 rounded-chip bg-[repeating-linear-gradient(135deg,var(--fill)_0_6px,var(--surface-2)_6px_12px)] px-2 text-d12h whitespace-nowrap text-mute">
    <Icon name="lock" size="xs" />
    {children ?? t('Outside your workspace')}
  </span>
);

/** A row of controls under a page header (.toolbar). */
export const Toolbar = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('mt-4 mb-2.5 flex flex-wrap items-center gap-2', className)}>{children}</div>
);

/** A search field (.search): a magnifier and a quiet input. */
export function SearchField({
  label,
  className,
  children,
  ...input
}: { label: string; className?: string; children?: ReactNode } & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className'
>) {
  return (
    <label
      className={cn(
        'flex h-[var(--ctl-h)] w-[260px] items-center gap-2 rounded-ctl bg-fill px-2.5 text-d13 text-mute max-[760px]:w-auto max-[760px]:flex-1',
        'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus-ring',
        className,
      )}
    >
      <Icon name="search" size="sm" />
      <input
        className="w-full min-w-0 border-0 bg-transparent compact:px-0.5 font-[inherit] text-ink outline-none"
        placeholder={label}
        aria-label={label}
        {...input}
      />
      {children}
    </label>
  );
}

/** The neutral page for something outside the viewer's workspace: no title leaks (flow-vp-scope 4). */
export function NotAvailable() {
  return (
    <Page>
      <Empty title={t('This page is not available to you')}>
        {t('It may be outside your workspace or it was removed.')}
        <Link
          to="/work"
          className="mt-3 inline-flex h-[var(--ctl-h)] items-center rounded-ctl bg-surface px-3 font-[550] text-ink no-underline shadow-[0_0_0_1px_var(--line-strong)] hover:bg-hover"
        >
          {t('Back to My Work')}
        </Link>
      </Empty>
    </Page>
  );
}
