import { LineGlyph } from '@/components/shared/art/task-icons';
import { cn } from '@/lib/cn';

export const FLAG_D = 'M5 21V4 M5 4h14v9H5 M9.7 4v4.5 M14.3 4v4.5 M9.7 8.5v4.5 M14.3 8.5v4.5 M5 8.5h14';
export const START_D = 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M10 8.5l5.5 3.5-5.5 3.5Z';

/** The due (dark red finish flag) or planned start (green start mark) glyph used on date fields (owner round 8). */
export const DateGlyph = ({ kind, className }: { kind: 'due' | 'start'; className?: string }) => (
  <span
    className={cn(
      'inline-grid size-[17px] flex-none place-items-center [&_.ic]:size-full',
      kind === 'due' ? 'text-[#A1201A] dark:text-[#F2685E]' : 'text-[#15803D] dark:text-[#3DD68C]',
      className,
    )}
  >
    <LineGlyph d={kind === 'due' ? FLAG_D : START_D} />
  </span>
);
