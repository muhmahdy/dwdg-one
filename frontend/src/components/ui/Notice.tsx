/* A notice card (components.css .notice): a coloured badge mark, a bold line, quiet detail and optional actions. */
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { badgeMask } from '@/components/ui/icon-data';

export type NoticeTone = 'info' | 'warn' | 'error' | 'done';
const TONE: Record<NoticeTone, string> = {
  info: 'var(--mute)',
  warn: 'var(--warning-mark)',
  error: 'var(--danger)',
  done: 'var(--green)',
};

export function Notice({
  tone = 'info',
  icon,
  title,
  children,
  actions,
  className,
}: {
  tone?: NoticeTone;
  icon: string;
  title: ReactNode;
  children?: ReactNode;
  /** Buttons at the right (or below on a narrow screen). */
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mb-3.5 grid grid-cols-[20px_1fr] items-start gap-3 rounded-[10px] bg-surface px-4 py-3.5 text-d13h shadow-sheet min-[601px]:has-[>:nth-child(3)]:grid-cols-[20px_1fr_auto]',
        className,
      )}
      style={{ ['--c' as string]: TONE[tone] }}
    >
      <i className="mt-px size-[18px] bg-[var(--c)] mask-icon" style={{ ['--m' as string]: badgeMask(icon) }} />
      <div className="min-w-0 [&_p]:mt-0.5 [&_p]:mb-0 [&_p]:text-mute [&>b]:block [&>b]:font-semibold">
        {title}
        {children}
      </div>
      {actions && (
        <div className="col-span-2 flex flex-wrap gap-2 min-[601px]:col-span-1 min-[601px]:col-start-3 min-[601px]:row-start-1">
          {actions}
        </div>
      )}
    </div>
  );
}
