/* Pins (D59): db.pins[personId] = [{k: 'project' | 'program' | 'routine' | 'res', id}]. Port of screens/pins.js. */
import { visibleDivs } from '@/lib/access';
import { act } from '@/lib/workspace/transaction';
import { t } from '@/lib/i18n';
import type { Person, Pin, Workspace } from '@/types/workspace';
import { joinedOf } from '@/features/work/services/selectors';
import { canSeeProject } from '@/features/projects/services/access';
import { canSeeRt } from '@/features/operations/services/access';

export interface ResolvedPin {
  k: Pin['k'];
  id: string;
  name: string;
  href: string;
}

/* The person's open projects (lead, PM or with work in them), nearest target first, at most four (calm-shell.js calmPins). */
export function calmPins(db: Workspace, me: Person) {
  const mine = (p: Workspace['projects'][number]) =>
    p.lead === me.id ||
    p.pm === me.id ||
    db.tasks.some((t) => t.project === p.id && !t.trashed && (t.owner === me.id || joinedOf(t).includes(me.id)));
  return db.projects
    .filter((p) => !['completed', 'cancelled', 'archived'].includes(p.stage) && mine(p))
    .sort((a, b) => (a.due ?? '9').localeCompare(b.due ?? '9'))
    .slice(0, 4);
}

/** The starting list for someone who never pinned: current projects, then up to three resources their division pinned. */
export function defaultPins(db: Workspace, me: Person): Pin[] {
  return [
    ...calmPins(db, me).map((p): Pin => ({ k: 'project', id: p.id })),
    ...db.resources
      .filter((r) => r.pinned && r.div === me.div && !r.archived)
      .slice(0, 3)
      .map((r): Pin => ({ k: 'res', id: r.id })),
  ];
}

const pinsOf = (db: Workspace, me: Person) => db.pins?.[me.id] ?? defaultPins(db, me);

export function visiblePins(db: Workspace, me: Person): ResolvedPin[] {
  const out: ResolvedPin[] = [];
  for (const p of pinsOf(db, me)) {
    if (p.k === 'project') {
      const x = db.projects.find((v) => v.id === p.id);
      if (x && canSeeProject(db, me, x) && !['cancelled', 'archived'].includes(x.stage))
        out.push({ k: p.k, id: x.id, name: x.name, href: `/projects/${x.id}` });
    } else if (p.k === 'program') {
      const x = db.programs?.find((v) => v.id === p.id);
      if (x && visibleDivs(me).includes(x.div)) out.push({ k: p.k, id: x.id, name: x.name, href: `/programs/${x.id}` });
    } else if (p.k === 'routine') {
      const x = db.routines?.find((v) => v.id === p.id);
      if (x && canSeeRt(db, me, x)) out.push({ k: p.k, id: x.id, name: x.name, href: `/operations/${x.id}` });
    } else if (p.k === 'res') {
      const x = db.resources.find((v) => v.id === p.id);
      if (x && !x.archived && visibleDivs(me).includes(x.div))
        out.push({ k: p.k, id: x.id, name: x.name, href: '/resources' });
    }
  }
  return out;
}

export const isPinned = (db: Workspace, me: Person, k: Pin['k'], id: string) =>
  visiblePins(db, me).some((p) => p.k === k && p.id === id);

export function togglePin(me: Person, k: Pin['k'], id: string) {
  return act(({ db, ui, toast }) => {
    db.pins ??= {};
    const list = db.pins[me.id] ?? defaultPins(db, me);
    const prev = list.map((p) => ({ ...p }));
    const i = list.findIndex((p) => p.k === k && p.id === id);
    const next = i >= 0 ? list.filter((_, n) => n !== i) : [{ k, id }, ...list];
    db.pins[me.id] = next;
    ui.menu = null;
    toast(i >= 0 ? t('Unpinned') : t('Pinned to your sidebar'), ({ db: d }) => {
      d.pins ??= {};
      d.pins[me.id] = prev;
    });
  });
}
