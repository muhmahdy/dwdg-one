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
  className,
}: {
  tone?: NoticeTone;
  icon: string;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mb-3.5 grid grid-cols-[20px_1fr] items-start gap-3 rounded-[10px] bg-surface px-4 py-3.5 text-d13h shadow-sheet',
        className,
      )}
      style={{ ['--c' as string]: TONE[tone] }}
    >
      <i className="mt-px size-[18px] bg-[var(--c)] mask-icon" style={{ ['--m' as string]: badgeMask(icon) }} />
      <div className="min-w-0 [&_p]:mt-0.5 [&_p]:mb-0 [&_p]:text-mute [&>b]:block [&>b]:font-semibold">
        {title}
        {children}
      </div>
    </div>
  );
}
