/* The time pill (R009 "9:30am", "in 5 days"): a soft rounded chip with a clock. Comfortable makes it taller and pale. */
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from './Icon';

export function TimePill({
  children,
  tone = '',
  icon = 'clock',
  className,
}: {
  children: ReactNode;
  tone?: '' | 'late' | 'none';
  icon?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex h-[26px] flex-none items-center gap-[5px] rounded-[13px] bg-surface-2 pr-2.5 pl-2 text-d12h font-medium whitespace-nowrap text-ink-2',
        'comfortable:h-[30px] comfortable:gap-1.5 comfortable:rounded-[15px] comfortable:bg-pill comfortable:pr-[11px] comfortable:pl-[9px] comfortable:text-[14px] comfortable:leading-none',
        '[&_.ic]:size-3.5 [&_.ic]:text-mute comfortable:[&_.ic]:size-4',
        tone === 'late' && 'text-danger [&_.ic]:text-danger',
        tone === 'none' && 'comfortable:text-mute',
        className,
      )}
    >
      <Icon name={icon} />
      {children}
    </span>
  );
}
