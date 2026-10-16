/* Programs (D58): an umbrella over related projects and operations, with a goal, an owner and a period. A program holds no
   percentage of its own; everything it shows is counted from what is inside it. From screens/plan.js. */
import { visibleDivs } from '@/lib/access';
import { logChange } from '@/lib/workspace/feed';
import { getMe } from '@/lib/workspace/hooks';
import { act } from '@/lib/workspace/transaction';
import { uid } from '@/lib/ids';
import { t as tr } from '@/lib/i18n';
import { D, dShort, nowStamp, today } from '@/lib/time';
import type { DivisionId, Person, Program, Project, Routine, Workspace } from '@/types/workspace';
import { isDone } from '@/features/work/services/selectors';
import { canEditRt } from '@/features/operations/services/access';
import { rtBeats } from '@/features/operations/services/routines';
import { pgDivs } from '@/features/collaboration/services/collaboration';
import { ENDED, canCreateProgram, canEditProject, projTasks } from '@/features/projects/services/project-rules';

export const PG_D = 'M12 3 21 8 12 13 3 8Z M3 12.5l9 5 9-5 M3 17l9 5 9-5';

export const pgOf = (db: Workspace, id: string | null | undefined) =>
  id ? db.programs?.find((g) => g.id === id) : undefined;
export const canSeeProgram = (me: Person, g: Program) => pgDivs(g).some((d) => visibleDivs(me).includes(d));
export const canManageProgram = (me: Person | undefined, g: Program) =>
  !!me && (me.id === g.owner || me.id === g.createdBy || canCreateProgram(me, g.div));

export type PgKind = 'project' | 'routine';
export const itemDiv = (k: PgKind, x: Project | Routine) =>
  k === 'project' ? (x as Project).div : (x as Routine).unit;
export const pgItem = (db: Workspace, key: string): { k: PgKind; x: Project | Routine | undefined } => {
  const [k, id] = key.split(':');
  return k === 'project'
    ? { k, x: db.projects.find((p) => p.id === id) }
    : { k: 'routine', x: db.routines?.find((r) => r.id === id) };
};
export const canPlace = (
  db: Workspace,
  me: Person,
  k: PgKind,
  x: Project | Routine | undefined,
  g: Program | undefined,
) =>
  !!x &&
  !(k === 'routine' && (x as Routine).personal) &&
  (!g || ((d) => !!d && pgDivs(g).includes(d))(itemDiv(k, x))) &&
  ((k === 'project' ? canEditProject(db, me, x as Project) : canEditRt(me, x as Routine)) ||
    (g ? canManageProgram(me, g) : false));
export const pgKids = (db: Workspace, g: Program) => ({
  ps: db.projects.filter((p) => p.program === g.id),
  rs: (db.routines ?? []).filter((r) => r.program === g.id),
});
export const pgPeriod = (g: Program) =>
  `${g.start ? `${dShort(g.start)} ${D(g.start).getFullYear()}` : '?'} – ${g.end ? `${dShort(g.end)} ${D(g.end).getFullYear()}` : tr('open')}`;

export function pgStats(db: Workspace, g: Program) {
  const { ps, rs } = pgKids(db, g);
  const ts = ps.flatMap((p) => projTasks(db, p)).filter((t) => !t.routine);
  const ms = db.milestones.filter((m) => ps.some((p) => p.id === m.project));
  const runs = rs.flatMap((r) => rtBeats(db, r, '2000-01-01', today()).filter((b) => b.t && b.st !== 'up'));
  return {
    ps,
    rs,
    tDone: ts.filter(isDone).length,
    tAll: ts.length,
    mDone: ms.filter((m) => m.state === 'achieved').length,
    mAll: ms.length,
    rDone: runs.filter((b) => b.st === 'done' || b.st === 'late').length,
    rAll: runs.length,
    active: ps.filter((p) => p.stage === 'active').length,
    ended: ps.filter((p) => ENDED.includes(p.stage)).length,
  };
}

/** Puts a project or operation into a program, or takes it out (`programId` null). */
export function setProgram(key: string, programId: string | null) {
  return act(({ db, ui, toast }) => {
    const me = getMe();
    const { k, x } = pgItem(db, key);
    const g = pgOf(db, programId);
    const old = pgOf(db, x?.program);
    if (!me || !x) return;
    if (!canPlace(db, me, k, x, g ?? old)) {
      toast(tr('Only the program owner, division leaders or the item’s own leads can do this.'));
      return;
    }
    const prev = x.program ?? null;
    x.program = g ? g.id : null;
    ui.menu = null;
    logChange(db, itemDiv(k, x), g ? 'added to a program' : 'took out of a program', {
      type: k === 'project' ? 'project' : 'task',
      id: x.id,
      name: x.name,
    });
    toast(
      g ? tr('Added to {p}', { p: g.name }) : tr('Taken out of {p}', { p: old?.name ?? tr('the program') }),
      ({ db: d }) => {
        const y = pgItem(d, key).x;
        if (y) y.program = prev;
      },
    );
  });
}

export interface ProgramValues {
  name: string;
  goal: string;
  owner: string;
  start: string | null;
  end: string | null;
}

/** Creates a program (resolves to its id) or saves changes to one (resolves to null). */
export async function saveProgram(id: string, v: ProgramValues, div: DivisionId): Promise<string | null> {
  const out: { id: string | null } = { id: null };
  await act(({ db, ui, toast }) => {
    const me = getMe();
    if (!me) return;
    if (!id) {
      if (!canCreateProgram(me, div)) return;
      const g = { id: uid('pg'), div, createdBy: me.id, at: nowStamp(), ...v } as Program;
      db.programs = db.programs ?? [];
      db.programs.push(g);
      out.id = g.id;
      logChange(db, g.div, 'created program', { type: 'project', id: g.id, name: g.name });
      toast(tr('Program created'), ({ db: d }) => {
        d.programs = (d.programs ?? []).filter((x) => x.id !== g.id);
      });
      return;
    }
    const g = db.programs?.find((x) => x.id === id);
    if (!g || !canManageProgram(me, g)) return;
    const prev = { ...g };
    Object.assign(g, v);
    ui.form = null;
    toast(tr('Saved'), ({ db: d }) => {
      const y = d.programs?.find((x) => x.id === id);
      if (y) Object.assign(y, prev);
    });
  });
  return out.id;
}

export function deleteProgram(id: string) {
  return act(({ db, ui, toast }) => {
    const me = getMe();
    const g = db.programs?.find((x) => x.id === id);
    if (!me || !g || !canManageProgram(me, g)) return;
    const { ps, rs } = pgKids(db, g);
    const snap = structuredClone(db.programs ?? []);
    const kids = [...ps, ...rs].map((x) => x.id);
    for (const x of [...ps, ...rs]) x.program = null;
    db.programs = (db.programs ?? []).filter((x) => x.id !== id);
    ui.form = null;
    toast(tr('Program deleted. Its projects and operations stay.'), ({ db: d }) => {
      d.programs = snap;
      for (const p of d.projects) if (kids.includes(p.id)) p.program = id;
      for (const r of d.routines ?? []) if (kids.includes(r.id)) r.program = id;
    });
  });
}
