/* The date field: a button that shows the date, and a month calendar in a popover. Keyboard: Enter, Space or Down opens it;
   arrows move the day, Enter picks, Escape closes. The value is an ISO date or ''. From screens/work.js cf (date). */
import { useState, type KeyboardEvent } from 'react';
import { DateGlyph } from '@/components/ui/DateGlyph';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Popover } from '@/components/ui/Popover';
import { cn } from '@/lib/cn';
import { MONTH, t, WD } from '@/lib/i18n';
import { addDays, D, dLong, dShort, iso, today, weekStart } from '@/lib/time';

export const fieldButtonClass = cn(
  'flex h-[38px] w-full min-w-0 cursor-pointer items-center gap-2 rounded-ctl border-0 bg-surface pr-2.5 pl-3 text-left text-ink shadow-[0_0_0_1px_var(--line-strong)] type-body',
  'hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50 roomy:h-[42px] phone:roomy:h-11',
);

export function DateField({
  id,
  value,
  onChange,
  min,
  max,
  disabled,
  kind,
  label,
  className,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  /** `due` shows the finish flag, `start` the start mark; none shows a calendar. */
  kind?: 'due' | 'start';
  label?: string;
  className?: string;
}) {
  const [button, setButton] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(`${(value || today()).slice(0, 8)}01`);
  const [focus, setFocus] = useState(value || today());
  const show = () => {
    setMonth(`${(value || today()).slice(0, 8)}01`);
    setFocus(value || today());
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
  };
  const pick = (v: string) => {
    setOpen(false);
    onChange(v);
    button?.focus();
  };
  const off = (d: string) => (!!min && d < min) || (!!max && d > max);

  const onKeyDown = (e: KeyboardEvent) => {
    if (!open) {
      if (['ArrowDown', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        show();
      }
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close();
      return;
    }
    if (e.key === 'Tab') {
      close();
      return;
    }
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (step) {
      e.preventDefault();
      const next = addDays(focus, step);
      setFocus(next);
      setMonth(`${next.slice(0, 8)}01`);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (!off(focus)) pick(focus);
    }
  };

  const base = D(month);
  const y = base.getFullYear();
  const mo = base.getMonth();
  const start = weekStart(iso(new Date(y, mo, 1)));
  const cells = Array.from({ length: 42 }, (_, i) => addDays(start, i));
  const shift = (n: number) => {
    setMonth(iso(new Date(y, mo + n, 1)));
  };
  return (
    <>
      <button
        ref={setButton}
        id={id}
        type="button"
        className={cn(fieldButtonClass, className)}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label}
        onClick={() => {
          if (open) close();
          else show();
        }}
        onKeyDown={onKeyDown}
      >
        {kind ? <DateGlyph kind={kind} className="size-4" /> : <Icon name="calendar" size="sm" className="text-mute" />}
        {value ? (
          <span className="min-w-0 flex-1 truncate" title={dLong(value)}>
            {dShort(value)} {D(value).getFullYear()}
          </span>
        ) : (
          <span className="min-w-0 flex-1 truncate text-mute">{t('Choose a date')}</span>
        )}
      </button>
      {open && (
        <Popover anchor={button} width={264} onClose={close} label={t('Choose a date')} className="p-2.5">
          <div className="flex items-center justify-between pr-0.5 pb-1.5 pl-1.5 text-[13px]">
            <b>
              {MONTH()[mo]} {y}
            </b>
            <span className="flex">
              <button
                type="button"
                className="inline-grid size-[26px] place-items-center rounded-ctl border-0 bg-transparent text-mute hover:bg-hover hover:text-ink"
                aria-label={t('Previous month')}
                onClick={() => {
                  shift(-1);
                }}
              >
                <Icon name="chevron-left" size="sm" />
              </button>
              <button
                type="button"
                className="inline-grid size-[26px] place-items-center rounded-ctl border-0 bg-transparent text-mute hover:bg-hover hover:text-ink"
                aria-label={t('Next month')}
                onClick={() => {
                  shift(1);
                }}
              >
                <Icon name="chevron" size="sm" />
              </button>
            </span>
          </div>
          <div className="grid grid-cols-7 gap-x-0 gap-y-px text-center">
            {[1, 2, 3, 4, 5, 6, 0].map((i) => (
              <span key={i} className="py-0.5 pb-1 font-sans text-[10.5px] font-medium text-mute">
                {WD()[i]?.slice(0, 2)}
              </span>
            ))}
            {cells.map((d) => (
              <button
                key={d}
                type="button"
                tabIndex={-1}
                disabled={off(d)}
                aria-label={dLong(d)}
                className={cn(
                  'relative h-8 cursor-pointer rounded-full border-0 bg-transparent font-sans text-[11.5px] font-medium text-ink-2 hover:bg-hover',
                  D(d).getMonth() !== mo && 'text-faint',
                  d === today() && 'shadow-[inset_0_0_0_1.5px_var(--line-strong)]',
                  d === value && 'bg-ink font-bold text-on-ink hover:bg-ink',
                  d === focus && 'shadow-[inset_0_0_0_2px_var(--green)]',
                  'disabled:cursor-not-allowed disabled:text-faint disabled:opacity-50',
                )}
                onClick={() => {
                  pick(d);
                }}
              >
                {D(d).getDate()}
              </button>
            ))}
          </div>
          <div className="flex justify-between border-t border-line pt-1.5">
            <Button
              variant="ghost"
              small
              onClick={() => {
                pick(today());
              }}
            >
              {t('Today')}
            </Button>
            {value && (
              <Button
                variant="ghost"
                small
                onClick={() => {
                  pick('');
                }}
              >
                {t('Clear')}
              </Button>
            )}
          </div>
        </Popover>
      )}
    </>
  );
}
