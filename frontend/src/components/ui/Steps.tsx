/* Progress steps (components.css .steps): one bar per step, the finished ones dark, the current one green and bold. */
import { cn } from '@/lib/cn';

export function Steps({ labels, current, className }: { labels: string[]; current: number; className?: string }) {
  return (
    <div className={cn('flex gap-1', className)} aria-hidden="true">
      {labels.map((label, i) => (
        <span
          key={label}
          className={cn(
            'grid flex-1 content-start gap-1.5 text-d11h text-mute before:h-1 before:rounded-[2px] before:bg-fill before:content-[""]',
            i < current && 'before:bg-ink',
            i === current && 'font-semibold text-ink before:bg-green',
          )}
        >
          {label}
        </span>
      ))}
    </div>
  );
}
