/* Housekeeping that runs once after the workspace loads, as the prototype did on every render: make the upcoming runs of
   each operation (three weeks ahead) and give every project, program, operation and resource its picture once, in creation
   order, so a picture never changes after it is made (owner, round 9). Nothing is saved when there is nothing to do. */
import { currentWs } from '@/lib/access';
import { hash, pickLook, RES_MODE } from '@/lib/art/identity';
import { sessionStore } from '@/lib/session';
import { getMe } from '@/lib/workspace/hooks';
import { act } from '@/lib/workspace/transaction';
import type { Look } from '@/types/workspace';
import { ensureRoutines } from './routines';

interface Item {
  id: string;
  look?: Look;
  createdAt?: string;
  at?: string;
}
const age = (a: Item, b: Item) =>
  (a.createdAt ?? a.at ?? '').localeCompare(b.createdAt ?? b.at ?? '') || a.id.localeCompare(b.id);

/** Gives the records without a picture one, spread across the siblings that share a group. */
function assignLooks<T extends Item>(list: T[], group: (x: T) => string | null | undefined, kind: string) {
  for (const x of list.slice().sort(age)) {
    if (x.look) continue;
    const sibs = list
      .filter((y) => y !== x && y.look && group(y) === group(x))
      .flatMap((y) => (y.look ? [y.look] : []));
    x.look = pickLook(sibs, hash(`${kind}:${x.id}`));
  }
}

export function maintainWorkspace() {
  return act(({ db }) => {
    const me = getMe();
    if (!me) return;
    ensureRoutines(db, currentWs(me, sessionStore.get().ws));
    assignLooks(db.projects, (x) => x.div, 'project');
    assignLooks(db.programs ?? [], (x) => x.div, 'program');
    assignLooks(db.routines ?? [], (x) => x.unit, 'routine');
    for (const r of db.resources.slice().sort(age)) {
      if (r.look) continue;
      const sibs = db.resources
        .filter((y) => y !== r && y.look && y.div === r.div && y.kind === r.kind)
        .map((y) => y.look as Look);
      r.look = { f: RES_MODE[r.kind], p: pickLook(sibs, hash(`res:${r.id}`)).p };
    }
  });
}
