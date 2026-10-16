/* Operation actions (D31, D34, work_routines): pause and resume, delete, move or restore a run, and create or edit a routine from the
   builder. A routine definition makes separate runs; pausing, skipping or editing changes future runs only. From screens/work.js. */
import { go } from '@/app/router/navigation';
import { canCreateProject, currentWs } from '@/lib/access';
import { logChange } from '@/lib/workspace/feed';
import { getMe } from '@/lib/workspace/hooks';
import { act } from '@/lib/workspace/transaction';
import { sessionStore } from '@/lib/session';
import { uid } from '@/lib/ids';
import { plural, t as tr, WDL } from '@/lib/i18n';
import { D, addDays, dShort, nowStamp, today } from '@/lib/time';
import type { DateStr, DivisionId, Person, PersonId, Routine, TaskIcon, Workspace } from '@/types/workspace';
import { isDone, personOf } from '@/features/work/services/selectors';
import { canEditRt } from './access';
import { ensureRoutines, pruneFuture, stepDays } from './routines';

const wsOf = (r: Routine, me: Person): DivisionId => r.unit ?? currentWs(me, sessionStore.get().ws);

export function pauseRoutine(id: string) {
  return act(({ db, toast }) => {
    const me = getMe();
    const r = db.routines?.find((x) => x.id === id);
    if (!r || !me || !canEditRt(me, r)) return;
    const before = db.tasks.slice();
    const was = r.paused;
    r.paused = !r.paused;
    if (r.paused) pruneFuture(db, r);
    else ensureRoutines(db, wsOf(r, me));
    toast(r.paused ? tr('Paused. Upcoming runs nobody started were removed.') : tr('Resumed'), ({ db: d }) => {
      const x = d.routines?.find((v) => v.id === id);
      if (x) x.paused = was;
      d.tasks = before;
    });
  });
}

export function deleteRoutine(id: string) {
  return act(({ db, ui, toast }) => {
    const me = getMe();
    const r = db.routines?.find((x) => x.id === id);
    if (!r || !me || !canEditRt(me, r)) return;
    const beforeT = db.tasks.slice();
    const beforeR = (db.routines ?? []).slice();
    pruneFuture(db, r);
    db.routines = (db.routines ?? []).filter((x) => x.id !== id);
    for (const t of db.tasks) if (t.routine === id) t.routineGone = r.name;
    ui.insp = null;
    ui.menu = null;
    queueMicrotask(() => {
      go('operations');
    });
    toast(tr('Routine deleted. Past runs stay as tasks.'), ({ db: d }) => {
      d.routines = beforeR;
      d.tasks = beforeT;
    });
  });
}

export function unskipRun(routineId: string, occ: string) {
  return act(({ db, toast }) => {
    const me = getMe();
    const r = db.routines?.find((x) => x.id === routineId);
    if (!r || !me || !canEditRt(me, r)) return;
    r.skips = r.skips.filter((x) => x !== occ);
    ensureRoutines(db, wsOf(r, me));
    toast(tr('Restored {d}', { d: dShort(occ) }), ({ db: d }) => {
      const x = d.routines?.find((v) => v.id === routineId);
      if (x) x.skips = [...x.skips, occ];
      d.tasks = d.tasks.filter((t) => !(t.routine === routineId && t.occ === occ && t.status === 'todo'));
    });
  });
}

export function moveRun(taskId: string, to: DateStr) {
  return act(({ db, ui, toast }) => {
    const me = getMe();
    const t = db.tasks.find((x) => x.id === taskId);
    const r = t?.routine ? db.routines?.find((x) => x.id === t.routine) : undefined;
    if (!t || !r || !me || !to || !canEditRt(me, r)) return;
    const prev = { moved: t.moved, due: t.due };
    t.moved = to;
    t.due = addDays(to, r.dueOffset || 0);
    ui.form = null;
    logChange(db, wsOf(r, me), 'moved a run of', { type: 'task', id: t.id, name: r.name });
    toast(tr('Moved to {d}. The other runs are unchanged.', { d: dShort(to) }), ({ db: d }) => {
      const x = d.tasks.find((y) => y.id === taskId);
      if (x) Object.assign(x, prev);
    });
  });
}

/** The routine as one plain sentence, used on its page and live in the builder. */
export function rtSentence(
  db: Workspace,
  r: Pick<
    Routine,
    'cadence' | 'every' | 'start' | 'dueOffset' | 'personal' | 'owners' | 'rotate' | 'signoff' | 'signer' | 'createdBy'
  >,
) {
  const wd = WDL()[D(r.start).getDay()] ?? '';
  const first = (id: PersonId | null | undefined) => personOf(db, id)?.first ?? '';
  const names = (ids: PersonId[]) => {
    const n = ids.map(first);
    return n.length < 2 ? n.join('') : tr('{a} and {b}', { a: n.slice(0, -1).join(', '), b: n[n.length - 1] ?? '' });
  };
  const when =
    r.cadence === 'weekly'
      ? tr('Every week on {d}.', { d: wd })
      : r.cadence === '2w'
        ? tr('Every 2 weeks on {d}.', { d: wd })
        : r.cadence === 'monthly'
          ? tr('Every month on day {n}.', { n: D(r.start).getDate() })
          : tr('Every {n} days.', { n: r.every });
  const off = r.dueOffset;
  const due = off
    ? plural(off, 'Each run is due {n} day later.', 'Each run is due {n} days later.')
    : tr('Each run is due the same day.');
  const who = r.personal
    ? ''
    : !r.owners.length
      ? tr('Nobody chosen yet.')
      : r.owners.length > 1 && r.rotate
        ? tr('{names} take turns.', { names: names(r.owners) })
        : tr('{name} does it every time.', { name: first(r.owners[0]) });
  const signer = r.signer ?? r.createdBy;
  const so =
    r.personal || r.signoff === false || !signer ? '' : tr('{name} signs off each run.', { name: first(signer) });
  return `${when} ${due} ${who} ${so}`.trim();
}

export interface RoutineDraft {
  key: string;
  id: string | null;
  name: string;
  icon: TaskIcon | null;
  personal: boolean;
  unit: DivisionId | null;
  cadence: string;
  every: number;
  start: DateStr;
  dueOffset: number;
  owners: PersonId[];
  rotate: boolean;
  checklist: string[];
  project: string | null;
  signoff: boolean;
  signer: PersonId | null;
}

export interface SaveResult {
  id: string | null;
}

/** Creates a routine (resolves to its id) or saves changes to it; edits change future runs only. */
export async function saveRoutine(x: RoutineDraft): Promise<string | null> {
  const out: SaveResult = { id: null };
  await act(({ db, ui, toast }) => {
    const me = getMe();
    if (!me) return;
    const owners = x.personal ? [me.id] : x.owners;
    const vals = {
      name: x.name.trim(),
      icon: x.icon,
      cadence: x.cadence,
      every: stepDays(x),
      start: x.start,
      dueOffset: x.dueOffset || 0,
      owners: owners.slice(),
      rotate: owners.length > 1 && x.rotate,
      project: x.personal ? null : x.project,
      signoff: !x.personal && x.signoff,
      signer: x.personal ? undefined : (x.signer ?? undefined),
    };
    // A routine keeps its steps as plain lines; runs get their own tickable copies.
    const lines = x.checklist.map((v) => v.trim()).filter(Boolean);
    if (!x.id) {
      if (!x.personal && (!x.unit || !canCreateProject(me, x.unit))) {
        toast(tr('Co-directors and above set up routines for a division.'));
        return;
      }
      const before = db.tasks.slice();
      const r = {
        id: uid('rt'),
        unit: x.personal ? null : x.unit,
        personal: x.personal,
        paused: false,
        skips: [],
        createdBy: me.id,
        at: nowStamp(),
        from: x.start,
        time: null,
        ...vals,
        checklist: lines,
      } as unknown as Routine;
      db.routines = db.routines ?? [];
      db.routines.push(r);
      ensureRoutines(db, wsOf(r, me));
      if (!r.personal) logChange(db, r.unit, 'created routine', { type: 'task', id: r.id, name: r.name });
      ui.rtDraft = null;
      out.id = r.id;
      toast(r.personal ? tr('It repeats now') : tr('Routine created'), ({ db: d }) => {
        d.routines = (d.routines ?? []).filter((v) => v.id !== r.id);
        d.tasks = before;
      });
      return;
    }
    const r0 = db.routines?.find((v) => v.id === x.id);
    if (!r0 || !canEditRt(me, r0)) return;
    const prev = structuredClone(r0);
    const before = db.tasks.slice();
    pruneFuture(db, r0);
    Object.assign(
      r0,
      { ...vals, checklist: lines },
      { from: today() >= vals.start ? addDays(today(), 1) : vals.start },
    );
    for (const t of db.tasks) if (t.routine === r0.id && !isDone(t)) t.icon = r0.icon ? { ...r0.icon } : null;
    ensureRoutines(db, wsOf(r0, me));
    if (!r0.personal) logChange(db, r0.unit, 'edited routine', { type: 'task', id: r0.id, name: r0.name });
    ui.rtDraft = null;
    out.id = r0.id;
    toast(tr('Saved. Only future runs changed.'), ({ db: d }) => {
      const cur = d.routines?.find((v) => v.id === x.id);
      if (cur) Object.assign(cur, prev);
      d.tasks = before;
    });
  });
  return out.id;
}
