/* Names for people in sentences. Records carry person ids; the screen shows first names, full names and "who, when" stamps. */
import { useMemo } from 'react';
import { t } from '@/lib/i18n';
import { D, dShort } from '@/lib/time';
import { useWorkspace } from '@/lib/workspace/hooks';
import type { PersonId, Stamp, Workspace } from '@/types/workspace';

export const firstOf = (db: Workspace, id: PersonId | null | undefined) =>
  db.people.find((p) => p.id === id)?.first ?? t('Someone');
export const nameOf = (db: Workspace, id: PersonId | null | undefined) =>
  db.people.find((p) => p.id === id)?.name ?? t('Someone');

/** "Mahdy, 6 Oct 2026 at 09:30" (the prototype's stamp). */
export const stampText = (db: Workspace, id: PersonId, at: Stamp) =>
  t('{who}, {date} at {time}', {
    who: firstOf(db, id),
    date: `${dShort(at.slice(0, 10))} ${D(at.slice(0, 10)).getFullYear()}`,
    time: at.slice(11, 16),
  });

/** Name lookups for components: `who.first(id)`, `who.name(id)`, `who.stamp(id, at)`. */
export function useWho() {
  const people = useWorkspace((db) => db.people);
  return useMemo(() => {
    const byId = new Map(people.map((p) => [p.id, p]));
    return {
      first: (id: PersonId | null | undefined) => byId.get(id ?? '')?.first ?? t('Someone'),
      name: (id: PersonId | null | undefined) => byId.get(id ?? '')?.name ?? t('Someone'),
      stamp: (id: PersonId, at: Stamp) =>
        t('{who}, {date} at {time}', {
          who: byId.get(id)?.first ?? t('Someone'),
          date: `${dShort(at.slice(0, 10))} ${D(at.slice(0, 10)).getFullYear()}`,
          time: at.slice(11, 16),
        }),
    };
  }, [people]);
}
