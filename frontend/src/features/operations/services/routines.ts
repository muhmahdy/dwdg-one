/* Routines (D31, D34, work_routines, work_type_model), from screens/work.js. A routine definition makes separate runs; each
   run is its own task with its own owner, due date, checklist and completion. Pausing, skipping or editing changes future runs
   only. Runs are made three weeks ahead. */
import type { Draft } from 'immer';
import { uid } from '@/lib/ids';
import { t as tr, plural, WD, WDL } from '@/lib/i18n';
import { addDays, D, daysBetween, iso, nowStamp, today } from '@/lib/time';
import type { DivisionId, Routine, Task, Workspace } from '@/types/workspace';
import { isDone, personOf } from '@/features/work/services/selectors';

export const rtOf = (db: Workspace, id: string | null | undefined) =>
  id ? db.routines?.find((r) => r.id === id) : undefined;
export const runDate = (t: Task) => (t.moved as string | undefined) ?? t.occ ?? t.due ?? '';
export const stepDays = (r: Pick<Routine, 'cadence' | 'every'>) =>
  r.cadence === 'weekly' ? 7 : r.cadence === '2w' ? 14 : r.cadence === 'monthly' ? 30 : Math.max(1, r.every || 7);

export function addMonths(d: string, i: number) {
  const x = D(d);
  const day = x.getDate();
  x.setMonth(x.getMonth() + i, 1);
  const last = new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate();
  x.setDate(Math.min(day, last));
  return iso(x);
}

/** Every run date from the start up to and including the first one after `until`. */
export function occDates(r: Pick<Routine, 'cadence' | 'every' | 'start'>, until: string): string[] {
  const step = r.cadence === 'weekly' ? 7 : r.cadence === '2w' ? 14 : Math.max(1, r.every || 7);
  const out: string[] = [];
  for (let i = 0; i < 400; i++) {
    const d = r.cadence === 'monthly' ? addMonths(r.start, i) : addDays(r.start, i * step);
    out.push(d);
    if (d > until) break;
  }
  return out;
}

const turnOf = (r: Routine, d: string) => occDates(r, d).filter((x) => x < d && !r.skips.includes(x)).length;
export const ownerFor = (
  r: Pick<Routine, 'owners' | 'rotate' | 'skips' | 'cadence' | 'every' | 'start'>,
  i: number,
  d?: string,
) => r.owners[(r.rotate ? (d ? turnOf(r as Routine, d) : i) : 0) % r.owners.length] ?? '';

/** Whose turn comes after a run (D60), so the rotation is never a surprise. */
export function nextTurn(db: Workspace, r: Routine | undefined, d: string | null | undefined) {
  if (!r || !d || r.personal || r.owners.length < 2 || !r.rotate) return null;
  const nx = occDates(r, addDays(d, 400)).find((x) => x > d && !r.skips.includes(x));
  if (!nx) return null;
  const t = db.tasks.find((v) => v.routine === r.id && v.occ === nx);
  return t ? t.owner : ownerFor(r, 0, nx);
}

export function cadText(r: Routine) {
  const wd = WDL()[D(r.start).getDay()] ?? '';
  const base =
    r.cadence === 'weekly'
      ? tr('Every week on {d}', { d: wd })
      : r.cadence === '2w'
        ? tr('Every 2 weeks on {d}', { d: wd })
        : r.cadence === 'monthly'
          ? tr('Every month on day {n}', { n: D(r.start).getDate() })
          : tr('Every {n} days', { n: r.every });
  return `${base}${r.dueOffset ? `, ${plural(r.dueOffset, 'due {n} day later', 'due {n} days later')}` : ''}`;
}

export function cadShort(r: Routine) {
  const wd = WD()[D(r.start).getDay()] ?? '';
  return r.cadence === 'weekly'
    ? tr('Weekly, {d}', { d: wd })
    : r.cadence === '2w'
      ? tr('Every 2 weeks, {d}', { d: wd })
      : r.cadence === 'monthly'
        ? tr('Monthly, day {n}', { n: D(r.start).getDate() })
        : tr('Every {n} days', { n: r.every });
}

/** Makes the runs due within three weeks (and the first one after) that do not exist yet. Returns how many were made. */
export function ensureRoutines(db: Draft<Workspace>, wsFallback: DivisionId): number {
  let made = 0;
  for (const r of db.routines ?? []) {
    if (r.paused || !r.owners.length) continue;
    const horizon = addDays(today(), 21);
    const all = occDates(r, horizon);
    const firstFuture = all.find((d) => d > today());
    all.forEach((d, i) => {
      if (d > horizon && d !== firstFuture) return;
      if (r.skips.includes(d) || d < ((r.from as string | undefined) ?? r.start)) return;
      if (db.tasks.some((t) => t.routine === r.id && t.occ === d)) return;
      const ow = ownerFor(r, i, d);
      const done = typeof r.seedDoneBefore === 'string' && d < r.seedDoneBefore;
      const due = addDays(d, r.dueOffset || 0);
      db.tasks.push({
        id: uid('t'),
        title: r.name,
        owner: ow,
        due,
        time: r.time ?? null,
        status: done ? 'done' : 'todo',
        reviewer: null,
        project: r.project ?? null,
        milestone: null,
        div: r.unit ?? personOf(db, ow)?.div ?? wsFallback,
        notes: '',
        evidence: '',
        doneAt: done ? due : null,
        createdBy: r.createdBy,
        createdAt: r.at || nowStamp(),
        offer: null,
        meeting: null,
        links: [],
        mentions: [],
        trashed: false,
        start: null,
        deps: [],
        assignees: [],
        parent: null,
        inWbs: false,
        phase: false,
        remarks: '',
        order: null,
        icon: r.icon ?? null,
        reactions: {},
        routine: r.id,
        occ: d,
        checklist: r.checklist.map((c) => ({ text: c.text ?? c.t ?? '', done })),
      });
      made++;
    });
  }
  return made;
}

/** Future runs nobody has started are replaced when the definition changes; started or past ones stay as they are. */
export function pruneFuture(db: Draft<Workspace>, r: Routine) {
  db.tasks = db.tasks.filter(
    (t) =>
      !(
        t.routine === r.id &&
        (t.occ ?? '') > today() &&
        t.status === 'todo' &&
        !t.moved &&
        !(t.checklist ?? []).some((c) => c.done)
      ),
  );
}

export type RunState = 'done' | 'late' | 'miss' | 'now' | 'up' | 'rev' | 'skip' | 'plan';
export function runState(t: Task): RunState {
  if (isDone(t)) return t.due && t.doneAt && t.doneAt > t.due ? 'late' : 'done';
  if (t.status === 'review') return 'rev';
  if (t.due && t.due < today()) return 'miss';
  return runDate(t) <= today() ? 'now' : 'up';
}

export const openAsks = (r: Routine) => ((r.asks as RunAsk[] | undefined) ?? []).filter((a) => a.state === 'open');

export interface RunAsk {
  id: string;
  occ: string;
  task: string;
  kind: 'skip' | 'move';
  to: string | null;
  by: string;
  reason: string;
  at: string;
  state: 'open' | 'approved' | 'declined' | 'withdrawn';
  decidedBy?: string | null;
  decidedAt?: string | null;
}

export const daysLate = (from: string, to: string) => daysBetween(from, to);
