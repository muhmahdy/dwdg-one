/* Small pieces shared by the task panel's sections. */
import type { ReactNode } from 'react';
import { DIVS } from '@/app/config/org';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useWorkspace } from '@/lib/workspace/hooks';
import type { PersonId } from '@/types/workspace';
import { SelectField, type Choice } from '@/components/ui/SelectField';
import { SEV } from '@/components/ui/StatusBadge';

/** A severity tag (components.css .tag): Low, Medium or High. */
export function SevTag({ severity }: { severity: 'low' | 'medium' | 'high' }) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1.5 rounded-chip bg-fill px-2 text-[12px] font-semibold whitespace-nowrap text-ink-2',
        severity === 'high' && 'bg-danger-soft text-danger',
        severity === 'medium' && 'bg-warning-soft text-warning',
      )}
    >
      {t(SEV[severity][0])}
    </span>
  );
}

/** A choice among people, grouped by division with the Presidency last; `blank` is the empty choice. */
export function PeopleSelect({
  id,
  value,
  onChange,
  exclude = [],
  blank,
  className,
  label,
}: {
  id?: string;
  value: PersonId | null | undefined;
  onChange: (id: PersonId) => void;
  exclude?: PersonId[];
  blank?: string;
  className?: string;
  label?: string;
}) {
  const people = useWorkspace((db) => db.people);
  const active = people.filter((p) => p.status === 'active' && !exclude.includes(p.id));
  const options: Choice[] = [
    ...(blank === undefined ? [] : [{ value: '', label: blank }]),
    ...DIVS.flatMap((d) =>
      active.filter((p) => p.div === d.id).map((p) => ({ value: p.id, label: p.name, group: d.short })),
    ),
    ...active.filter((p) => !p.div).map((p) => ({ value: p.id, label: p.name })),
  ];
  return (
    <SelectField
      id={id}
      value={value ?? ''}
      onChange={onChange}
      options={options}
      people
      className={className}
      label={label}
    />
  );
}

/** The "label: value" list used in read-only parts of the panel (components.css .meta). */
export function Meta({ children }: { children: ReactNode }) {
  return (
    <dl className="m-0 grid grid-cols-[96px_1fr] gap-x-2.5 gap-y-3 text-d13 [&_dd]:m-0 [&_dd]:flex [&_dd]:min-w-0 [&_dd]:items-center [&_dd]:gap-[7px] [&_dt]:text-mute [&_small]:text-mute">
      {children}
    </dl>
  );
}
export const MetaRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <>
    <dt>{label}</dt>
    <dd>{children}</dd>
  </>
);
