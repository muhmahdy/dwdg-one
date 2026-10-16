/* The meeting composer (R046, work_meeting_composer, S026): one sentence says who, which day, how long ("Coffee with Salsa
   Friday 10:00 for 30 min"); the people, day, time and length are read from it and shown on lanes of recorded availability.
   Suggestions are start times with no recorded conflict for everyone. From screens/schedule.js. */
import { t } from '@/lib/i18n';
import { addDays, nowMin, today, weekday } from '@/lib/time';
import type { DateStr, PersonId, Person, Workspace } from '@/types/workspace';
import { clashOf, coverage } from './availability';

/** The ruler the composer draws: 07:00 to 21:00. */
export const CW0 = 7 * 60;
export const CW1 = 21 * 60;

export interface ComposerState {
  text: string;
  title: string;
  date: DateStr;
  dur: number;
  /** People added by hand, and people the sentence named that were then taken off. */
  manual: PersonId[];
  removed: PersonId[];
  /** Everyone invited (not counting the organizer). */
  people: PersonId[];
  start: number;
  where: string;
  /** The start time was chosen by hand, so suggestions stop moving it. */
  touched: boolean;
  agenda: string;
  project: string | null;
  notetaker: PersonId | null;
  more: boolean;
  /** A clash needs a second, explicit confirm before sending (availability_override). */
  ack: boolean;
  meet: boolean;
  /** People whose Google Calendar is being fetched, shown briefly as "Checking…". */
  checking: PersonId[];
}

export const initialComposer = (prefill: string, extra: Partial<ComposerState>): ComposerState => ({
  text: prefill,
  title: '',
  date: addDays(today(), 1),
  dur: 30,
  manual: [],
  removed: [],
  people: [],
  start: 9 * 60,
  where: '',
  touched: false,
  agenda: '',
  project: null,
  notetaker: null,
  more: false,
  ack: false,
  meet: false,
  checking: [],
  ...extra,
});

const DAYW: Record<string, number> = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 7,
  sen: 1,
  sel: 2,
  rab: 3,
  kam: 4,
  jum: 5,
  sab: 6,
  min: 7,
};
export const DAY_RX =
  /\b(today|tomorrow|hari ini|besok|mon|tue|wed|thu|fri|sat|sun|senin|selasa|rabu|kamis|jumat|sabtu|minggu)[a-z]*\b/i;
export const DUR_RX = /\b\d+(?:[.,]\d+)?\s*(h|hr|hrs|hour|hours|jam|m|min|mins|minutes|menit)\b/i;
export const TIME_RX = /\b\d{1,2}([:.]\d{2}|\s?(am|pm))\b/i;
export const EXAMPLES = [
  'Coffee with Salsa Friday 10:00 for 30 min',
  'Roadmap check-in with Nadia and Fikri tomorrow 45 min',
  'Survey review with Fikri Thursday 1 hour',
];

export const everyone = (me: Person, c: Pick<ComposerState, 'people'>) => [me.id, ...c.people];

export const conflicts = (db: Workspace, me: Person, c: ComposerState, start: number, dur: number) =>
  everyone(me, c).filter((pid) => clashOf(db, me.id, pid, c.date, start, start + dur).length);

/** Up to three start times (from 08:00, or from now today) without a recorded conflict for everyone. */
export function suggestions(db: Workspace, me: Person, c: ComposerState): number[] {
  const out: number[] = [];
  const from = c.date === today() ? Math.max(8 * 60, Math.ceil(nowMin() / 15) * 15) : 8 * 60;
  for (let s = from; s + c.dur <= CW1 && out.length < 3; s += 15)
    if (!conflicts(db, me, c, s, c.dur).length) {
      out.push(s);
      s += 45;
    }
  return out;
}

/** Re-reads the sentence: people named, day, length and time, a title, and a start time when none was picked. */
export function parseComposer(db: Workspace, me: Person, c: ComposerState): ComposerState {
  const txt = c.text;
  const next: ComposerState = { ...c };
  const named = db.people
    .filter((p) => p.id !== me.id && p.status === 'active' && new RegExp(`\\b${p.first}\\b`, 'i').test(txt))
    .map((p) => p.id);
  next.people = [...new Set([...c.manual, ...named])].filter((i) => !c.removed.includes(i));

  const dm = DAY_RX.exec(txt);
  if (dm?.[1]) {
    const w = dm[1].toLowerCase();
    if (/^(today|hari ini)$/.test(w)) next.date = today();
    else if (/^(tomorrow|besok)$/.test(w)) next.date = addDays(today(), 1);
    else {
      const target = DAYW[w.slice(0, 3)] ?? 1;
      let n = target - weekday(today());
      if (n <= 0) n += 7;
      next.date = addDays(today(), n);
    }
  }
  const du = /\b(\d+(?:[.,]\d+)?)\s*(h|hr|hrs|hour|hours|jam|m|min|mins|minutes|menit)\b/i.exec(txt);
  if (du?.[1] && du[2]) {
    const amount = Number(du[1].replace(',', '.'));
    next.dur = Math.max(15, Math.min(240, Math.round((/^(h|jam)/i.test(du[2]) ? amount * 60 : amount) / 15) * 15));
  }
  const clock = /\b(\d{1,2})[:.](\d{2})\b/.exec(txt);
  const meridian = /\b(\d{1,2})\s?(am|pm)\b/i.exec(txt);
  if (clock?.[1] && clock[2]) {
    next.start = Number(clock[1]) * 60 + Number(clock[2]);
    next.touched = true;
  } else if (meridian?.[1] && meridian[2]) {
    const hh = Number(meridian[1]);
    next.start = (/pm/i.test(meridian[2]) && hh < 12 ? hh + 12 : hh) * 60;
    next.touched = true;
  }
  const title = (txt.split(/\s+(with|dengan)\s+/i)[0] ?? '')
    .replace(new RegExp(DAY_RX.source, 'ig'), '')
    .replace(new RegExp(DUR_RX.source, 'ig'), '')
    .replace(TIME_RX, '')
    .replace(/\b(at|jam|pukul)\s*$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  next.title = title ? title.charAt(0).toUpperCase() + title.slice(1) : t('Meeting');
  if (!next.touched) next.start = suggestions(db, me, next)[0] ?? 9 * 60;
  next.start = Math.max(CW0, Math.min(CW1 - next.dur, next.start));
  next.ack = false;
  return next;
}

export interface Mark {
  text: string;
  /** `p` a person (green), `d` a day, time or length (grey), none for plain text. */
  cls?: 'p' | 'd';
}

/** The sentence with what was understood marked in place (R046). */
export function highlight(db: Workspace, me: Person, text: string, people: PersonId[]): Mark[] {
  const marks: [number, number, 'p' | 'd'][] = [];
  for (const rx of [DAY_RX, DUR_RX, TIME_RX]) {
    const m = rx.exec(text);
    if (m) marks.push([m.index, m.index + m[0].length, 'd']);
  }
  for (const p of db.people) {
    if (p.status !== 'active' || p.id === me.id || !people.includes(p.id)) continue;
    const m = new RegExp(`\\b${p.first}\\b`, 'i').exec(text);
    if (m) marks.push([m.index, m.index + m[0].length, 'p']);
  }
  marks.sort((a, b) => a[0] - b[0]);
  const out: Mark[] = [];
  let at = 0;
  for (const [a, b, cls] of marks) {
    if (a < at) continue;
    if (a > at) out.push({ text: text.slice(at, a) });
    out.push({ text: text.slice(a, b), cls });
    at = b;
  }
  if (at < text.length) out.push({ text: text.slice(at) });
  return out;
}

/** The week at a glance: how many start times have no recorded conflict for everyone on each day. */
export function openStartTimes(db: Workspace, me: Person, c: ComposerState, d: DateStr): number {
  let ok = 0;
  for (let t0 = 8 * 60; t0 + c.dur <= CW1; t0 += 30) {
    const bad = everyone(me, c).some((pid) => clashOf(db, me.id, pid, d, t0, t0 + c.dur).length);
    if (!bad && !(d === today() && t0 < nowMin())) ok++;
  }
  return ok;
}

export const hasNoSchedule = (db: Workspace, pid: PersonId) => coverage(db, pid) === 'unknown';
