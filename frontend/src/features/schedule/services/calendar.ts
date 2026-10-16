/* What the calendar draws on a day: timed items laid out side by side like Google Calendar, and the all-day row where
   date-only work never occupies hours (work_task_fields, timeline_unscheduled). From screens/schedule.js. */
import { addDays, D, iso, weekStart, today as todayStr } from '@/lib/time';
import type { DateStr, GoogleBusy, Meeting, Milestone, Person, Task, Unavailable, Workspace } from '@/types/workspace';
import { isDone, projOf } from '@/features/work/services/selectors';
import { overlaps, unavailableOn } from './availability';

/** Hours shown (06:00 to 24:00) and the height of an hour in pixels. */
export const CAL = { H0: 6, H1: 24, hr: 48 } as const;
export const yTop = (min: number) => ((min - CAL.H0 * 60) / 60) * CAL.hr;
/** A pixel offset in a day column as minutes, rounded to 15 and kept inside the day. */
export const yToMin = (y: number) =>
  Math.max(CAL.H0 * 60, Math.min(CAL.H1 * 60, CAL.H0 * 60 + Math.round(((y / CAL.hr) * 60) / 15) * 15));

export type CalView = 'day' | 'week' | 'month';
export interface Layers {
  meetings: boolean;
  away: boolean;
  google: boolean;
  due: boolean;
}
export const ALL_LAYERS: Layers = { meetings: true, away: true, google: true, due: true };

interface Placed {
  s: number;
  e: number;
  /** Column among side-by-side items, and how many columns the group has. */
  col: number;
  n: number;
  /** Items whose overlaps all start 30+ minutes apart cascade full width with an indent; same-time starts split. */
  casc: boolean;
  level: number;
  mine: boolean;
}
export type DayItem = Placed &
  (
    | { kind: 'meeting'; id: string; meeting: Meeting }
    | { kind: 'unavail'; id: string; unavailable: Unavailable }
    | { kind: 'gbusy'; id: string; google: GoogleBusy }
  );

type Raw = { kind: DayItem['kind']; id: string; s: number; e: number; mine: boolean } & Partial<
  Record<'meeting' | 'unavailable' | 'google', unknown>
>;

function layout(items: Raw[]): DayItem[] {
  const out = items.map((x) => ({ ...x, col: 0, n: 1, casc: false, level: 0 })).sort((a, b) => a.s - b.s || b.e - a.e);
  let group: typeof out = [];
  let end = -1;
  const flush = () => {
    const cols: number[] = [];
    for (const it of group) {
      let c = cols.findIndex((x) => x <= it.s);
      if (c < 0) {
        c = cols.length;
        cols.push(0);
      }
      cols[c] = it.e;
      it.col = c;
    }
    for (const it of group) it.n = cols.length;
    for (const it of group) {
      const ov = group.filter((o) => o !== it && overlaps(it.s, it.e, o.s, o.e));
      it.casc = ov.every((o) => Math.abs(o.s - it.s) >= 30);
      it.level = ov.filter((o) => o.s < it.s).length;
    }
    group = [];
  };
  for (const it of out) {
    if (group.length && it.s >= end) {
      flush();
      end = -1;
    }
    group.push(it);
    end = Math.max(end, it.e);
  }
  flush();
  return out as unknown as DayItem[];
}

/** The timed items of one person's day that the layers allow. */
export function dayItems(db: Workspace, me: Person, layers: Layers, d: DateStr): DayItem[] {
  const raw: Raw[] = [];
  if (layers.meetings)
    for (const mt of db.meetings) {
      const r = mt.responses[me.id];
      if (mt.date === d && mt.state !== 'cancelled' && (r === 'accepted' || r === 'pending'))
        raw.push({ kind: 'meeting', id: mt.id, s: mt.start, e: mt.end, meeting: mt, mine: mt.organizer === me.id });
    }
  if (layers.away)
    for (const u of db.unavailable)
      if (u.who === me.id && !u.allDay && unavailableOn(u, d))
        raw.push({ kind: 'unavail', id: u.id, s: u.start, e: u.end, unavailable: u, mine: true });
  if (layers.google && me.gcal)
    for (const g of db.gbusy)
      if (g.who === me.id && g.date === d)
        raw.push({ kind: 'gbusy', id: g.id, s: g.start, e: g.end, google: g, mine: false });
  return layout(raw);
}

export type AllDayItem =
  | { kind: 'away'; id: string; unavailable: Unavailable }
  | { kind: 'due'; id: string; task: Task; late: boolean }
  | { kind: 'ms'; id: string; milestone: Milestone };

/** All-day row: unavailable all day, tasks due (not time blocks), milestones the person owns or leads. */
export function allDayItems(db: Workspace, me: Person, layers: Layers, d: DateStr): AllDayItem[] {
  const out: AllDayItem[] = [];
  if (layers.away)
    for (const u of db.unavailable)
      if (u.who === me.id && u.allDay && unavailableOn(u, d)) out.push({ kind: 'away', id: u.id, unavailable: u });
  if (layers.due) {
    const due = db.tasks
      .filter((t) => t.owner === me.id && !t.trashed && !isDone(t) && t.due === d)
      .sort((a, b) => (a.time ?? -1) - (b.time ?? -1));
    for (const t of due) out.push({ kind: 'due', id: t.id, task: t, late: d < todayStr() });
    for (const x of db.milestones)
      if (x.target === d && x.state !== 'achieved' && (x.owner === me.id || projOf(db, x.project)?.lead === me.id))
        out.push({ kind: 'ms', id: x.id, milestone: x });
  }
  return out;
}

export const weekDays = (view: CalView, date: DateStr): DateStr[] =>
  view === 'day' ? [date] : Array.from({ length: 7 }, (_, i) => addDays(weekStart(date), i));

/** The first day of the month in view, as the month grid's anchor. */
export const monthStart = (date: DateStr) => {
  const a = D(date);
  return iso(new Date(a.getFullYear(), a.getMonth(), 1));
};
