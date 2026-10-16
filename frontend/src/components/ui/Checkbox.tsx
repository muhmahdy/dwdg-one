/* The task checkbox (.tick > .cb): an outlined square that fills and shows a check when done. In Comfortable it is the quiet
   R009 square: a soft grey rounded box that turns green. A 44px hit area on touch screens. */
import { cn } from '@/lib/cn';

interface Props {
  on: boolean;
  label: string;
  disabled?: boolean;
  title?: string;
  /** Review state: a half-filled look while waiting for sign-off. */
  review?: boolean;
  onToggle: (el: HTMLElement) => void;
  id?: string;
  className?: string;
}

export function TaskCheck({ on, label, disabled, title, review, onToggle, id, className }: Props) {
  return (
    <button
      type="button"
      className={cn(
        'group/tick relative grid size-6 flex-none place-items-center border-0 bg-transparent p-0 disabled:cursor-not-allowed disabled:opacity-45',
        'comfortable:size-[22px] touch:after:absolute touch:after:-inset-2.5',
        className,
      )}
      aria-label={label}
      title={title}
      disabled={disabled}
      data-tick={id}
      onClick={(e) => {
        e.stopPropagation();
        onToggle(e.currentTarget);
      }}
    >
      <span
        className={cn(
          'inline-grid size-[18px] place-items-center rounded-[6px] bg-surface shadow-[inset_0_0_0_1.5px_var(--line-strong)]',
          'comfortable:size-[22px] comfortable:rounded-[7px] comfortable:border-0 comfortable:bg-pill comfortable:shadow-[inset_0_0_0_1px_rgb(22_22_21/6%)]',
          'comfortable:group-hover/tick:shadow-[inset_0_0_0_1.5px_var(--green)]',
          review &&
            !on &&
            'shadow-[inset_0_0_0_1.5px_var(--st-review-mark)] after:size-2 after:rounded-[3px] after:bg-[var(--st-review-mark)] after:content-[""]',
          on &&
            'bg-ink text-on-ink shadow-none after:h-[5px] after:w-[9px] after:translate-x-px after:-translate-y-px after:-rotate-45 after:border-2 after:border-t-0 after:border-r-0 after:border-current after:content-[""] comfortable:bg-green-ink comfortable:text-surface comfortable:shadow-none comfortable:group-hover/tick:shadow-none',
        )}
      />
    </button>
  );
}
