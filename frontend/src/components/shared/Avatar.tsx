/* People marks (measure-icons-avatars, resource_bubbles): a photo, or initials when there is none; groups show three
   faces and +N with every name in the label. */
import { divisionOf, ROLES } from '@/app/config/org';
import { BrandIcon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useWorkspace } from '@/lib/workspace/hooks';
import type { Person, PersonId } from '@/types/workspace';

export type AvatarSize = 'md' | 'xs' | 'sm' | 'lg';
// Fixed sizes: initials sit inside a fixed circle, so they never follow the density type scale.
const SIZE: Record<AvatarSize, string> = {
  md: 'size-7 text-[12px]',
  xs: 'size-5 text-[9.5px]',
  sm: 'size-6 text-[12px]',
  lg: 'size-10 text-[14px]',
};

export const photoUrl = (p: Person) => (p.photo ? `/people/${p.photo}.jpg` : null);
export const initials = (p: Person) =>
  p.name
    .split(' ')
    .map((w) => w[0] ?? '')
    .slice(0, 2)
    .join('');

const base = 'inline-grid flex-none place-items-center rounded-full bg-fill object-cover font-semibold text-ink-2';

export function Avatar({
  id,
  size = 'md',
  className,
}: {
  id: PersonId | null | undefined;
  size?: AvatarSize;
  className?: string;
}) {
  const p = useWorkspace((db) => (id ? db.people.find((x) => x.id === id) : undefined));
  if (!p) return <span className={cn(base, SIZE[size], className)}>?</span>;
  const url = photoUrl(p);
  if (url) return <img className={cn(base, SIZE[size], className)} src={url} alt={p.name} />;
  return (
    <span className={cn(base, SIZE[size], className)} role="img" aria-label={p.name} title={p.name}>
      {initials(p)}
    </span>
  );
}

/** Three avatars, then +N, with the full list of names as the tooltip. */
export function AvatarBubbles({ ids, size = 'sm' }: { ids: (PersonId | null | undefined)[]; size?: AvatarSize }) {
  const unique = [...new Set(ids.filter((x): x is PersonId => !!x))];
  const names = useWorkspace((db) =>
    unique.map((i) => db.people.find((p) => p.id === i)?.name ?? t('Someone')).join(', '),
  );
  const more = unique.length - 3;
  return (
    <span className="inline-flex" title={names}>
      {unique.slice(0, 3).map((i, n) => (
        <Avatar key={i} id={i} size={size} className={cn('shadow-[0_0_0_2px_var(--surface)]', n > 0 && '-ml-1.5')} />
      ))}
      {more > 0 && (
        <span
          className={cn(base, SIZE[size], '-ml-1.5 shadow-[0_0_0_2px_var(--surface)]')}
          aria-label={t('{n} more', { n: more })}
        >
          +{more}
        </span>
      )}
    </span>
  );
}

/** Identity line: division mark, role mark, Admin mark. */
export function IdentityLine({ person }: { person: Person }) {
  const d = divisionOf(person.div);
  return (
    <span className="inline-flex items-center gap-1.5">
      {d && <BrandIcon id={d.icon} className="size-3.5" />}
      <BrandIcon id={ROLES[person.role].icon} className="size-3.5" />
      {person.admin && <BrandIcon id="role-admin" className="size-3.5" />}
    </span>
  );
}

export const roleLabel = (p: Person) => (p.title ? t(p.title) : t(ROLES[p.role].label));
export const roleText = (p: Person) =>
  [roleLabel(p), p.div ? (divisionOf(p.div)?.short ?? '') : t('Organization'), p.admin ? 'Admin' : '']
    .filter(Boolean)
    .join(', ');
