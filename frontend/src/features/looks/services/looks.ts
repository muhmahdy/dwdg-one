/* Picture picker (D65): every style in the item's colour, the ten colours, and Surprise me. The look of a project, program or
   operation stays the same until someone with edit rights changes it here. From screens/plan.js LK, look-set. */
import { FAMILIES, PALS } from '@/lib/art/identity';
import { getMe } from '@/lib/workspace/hooks';
import { act } from '@/lib/workspace/transaction';
import { t as tr } from '@/lib/i18n';
import type { Look, Person, Program, Project, Routine, Workspace } from '@/types/workspace';
import { canEditRt } from '@/features/operations/services/access';
import { canEditProject } from '@/features/projects/services/project-rules';
import { canManageProgram } from '@/features/programs/services/programs';

export type LookKind = 'project' | 'program' | 'routine';
type Item = Project | Program | Routine;

export const lookItem = (db: Workspace, k: LookKind, id: string): Item | undefined =>
  k === 'project'
    ? db.projects.find((x) => x.id === id)
    : k === 'program'
      ? db.programs?.find((x) => x.id === id)
      : db.routines?.find((x) => x.id === id);

export const canEditLook = (db: Workspace, me: Person, k: LookKind, x: Item) =>
  k === 'project'
    ? canEditProject(db, me, x as Project)
    : k === 'program'
      ? canManageProgram(me, x as Program)
      : canEditRt(me, x as Routine);

export type LookChange = { f: number } | { p: number } | { surprise: true };

export function setLook(k: LookKind, id: string, change: LookChange) {
  return act(({ db, toast }) => {
    const me = getMe();
    const x = lookItem(db, k, id);
    if (!me || !x || !canEditLook(db, me, k, x)) return;
    const prev: Look | null = x.look ? { ...x.look } : null;
    const lk: Look = { ...(x.look ?? { f: 0, p: 0 }) };
    if ('f' in change) lk.f = change.f;
    if ('p' in change) lk.p = change.p;
    if ('surprise' in change) {
      let f = lk.f;
      let p = lk.p;
      while (f === lk.f) f = Math.floor(Math.random() * FAMILIES.length);
      while (p === lk.p) p = Math.floor(Math.random() * PALS.length);
      lk.f = f;
      lk.p = p;
    }
    x.look = lk;
    toast(tr('Picture changed'), ({ db: d }) => {
      const y = lookItem(d, k, id);
      if (y) y.look = prev ?? undefined;
    });
  });
}
