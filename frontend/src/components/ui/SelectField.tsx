/* The choice field: a button that shows the choice, and a list in a popover, filterable when long. People show their photo
   and role marks, so a choice among people reads at a glance. Keyboard: Enter, Space or Down opens, arrows move, typing
   filters, Enter picks, Escape closes. From screens/work.js cf (select). */
import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ROLES } from '@/app/config/org';
import { Avatar } from '@/components/shared/Avatar';
import { fieldButtonClass } from '@/components/ui/DateField';
import { BrandIcon, Icon } from '@/components/ui/Icon';
import { Popover } from '@/components/ui/Popover';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useWorkspace } from '@/lib/workspace/hooks';

export interface Choice {
  value: string;
  label: string;
  group?: string;
}

export function SelectField({
  id,
  value,
  onChange,
  options,
  disabled,
  people = false,
  label,
  className,
  small = false,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  options: Choice[];
  disabled?: boolean;
  /** Values are person ids: show photos and role marks. */
  people?: boolean;
  label?: string;
  className?: string;
  small?: boolean;
}) {
  const [button, setButton] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const roster = useWorkspace((db) => db.people);
  const many = options.length > 8;
  const shown = useMemo(
    () => options.filter((o) => !q || o.label.toLowerCase().includes(q.toLowerCase())),
    [options, q],
  );
  const current = options.find((o) => o.value === value);
  const personOf = (v: string) => (people ? roster.find((p) => p.id === v) : undefined);

  const show = () => {
    setQ('');
    setIdx(
      Math.max(
        0,
        options.findIndex((o) => o.value === value),
      ),
    );
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
      button?.focus();
    } else if (e.key === 'Tab') close();
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setIdx((i) => Math.max(0, Math.min(shown.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1))));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const o = shown[idx];
      if (o) pick(o.value);
    }
  };

  const visual = (v: string, size: 'xs' | 'sm'): ReactNode => (personOf(v) ? <Avatar id={v} size={size} /> : null);
  let lastGroup: string | undefined;
  return (
    <>
      <button
        ref={setButton}
        id={id}
        type="button"
        className={cn(fieldButtonClass, small && 'h-[var(--ctl-h)] w-auto min-w-[200px]', className)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => {
          if (open) close();
          else show();
        }}
        onKeyDown={onKeyDown}
      >
        {current && visual(current.value, 'xs')}
        <span className={cn('min-w-0 flex-1 truncate', !current?.value && 'text-mute')}>
          {current?.label ?? t('Choose')}
        </span>
        <Icon name="chevron-down" size="sm" className="ml-auto text-mute" />
      </button>
      {open && (
        <Popover
          anchor={button}
          width={Math.max(button?.offsetWidth ?? 0, 240)}
          onClose={close}
          role="listbox"
          label={label}
        >
          {many && (
            <input
              className="h-[34px] rounded-[7px] border-0 bg-fill px-2.5 text-ink outline-none type-small"
              placeholder={t('Type to filter')}
              aria-label={t('Type to filter')}
              autoComplete="off"
              autoFocus
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setIdx(0);
              }}
              onKeyDown={onKeyDown}
            />
          )}
          <div className="grid max-h-[290px] gap-0.5 overflow-auto overscroll-contain">
            {shown.length ? (
              shown.map((o, i) => {
                const heading = o.group && o.group !== lastGroup ? o.group : null;
                lastGroup = o.group;
                const p = personOf(o.value);
                return (
                  <div key={o.value} className="contents">
                    {heading && <div className="px-2.5 pt-2 pb-0.5 text-mute type-caption">{heading}</div>}
                    <div
                      role="option"
                      aria-selected={o.value === value}
                      className={cn(
                        'flex min-h-9 cursor-pointer items-center gap-2.5 rounded-[7px] px-2.5 text-d13h hover:bg-hover',
                        i === idx && 'bg-hover',
                        o.value === value && 'font-semibold',
                      )}
                      onClick={() => {
                        pick(o.value);
                      }}
                    >
                      {visual(o.value, 'sm')}
                      <span className="min-w-0 flex-1 truncate">{o.label}</span>
                      {p && (
                        <span className="inline-flex flex-none gap-[5px] [&_svg]:size-4">
                          <BrandIcon id={ROLES[p.role].icon} />
                          {p.admin && <BrandIcon id="role-admin" />}
                        </span>
                      )}
                      {o.value === value && <Icon name="check" size="sm" className="text-ink" />}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-2.5 py-3 text-mute type-small">{t('No matches.')}</div>
            )}
          </div>
        </Popover>
      )}
    </>
  );
}
