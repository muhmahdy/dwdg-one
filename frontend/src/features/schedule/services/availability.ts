/* Availability evidence (availability_overlap, availability_stale, design-availability-evidence), from screens/schedule.js.
   A weekly block repeats on its weekday; a one-off block has a date. Intervals are half-open: 09:00–10:00 overlaps 09:30 but
   not a meeting that starts at 10:00. "Unknown" means nothing is recorded at all: no unavailable time and no Google Calendar.
   A person with zero tasks is still Unknown. Meeting titles show only to people invited to the same meeting; unavailable
   notes and Google titles stay with their owner. */
import { t } from '@/lib/i18n';
import { weekday } from '@/lib/time';
import { uOn } from './meetings';
import type { DateStr, PersonId, Unavailable, Workspace } from '@/types/workspace';

export const overlaps = (s1: number, e1: number, s2: number, e2: number) => s1 < e2 && s2 < e1;
export const unavailableOn = (u: Unavailable, d: DateStr) => uOn(u, d, weekday);
/** The minutes an unavailable entry blocks (all day is the whole day). */
export const blockedSpan = (u: Pick<Unavailable, 'allDay' | 'start' | 'end'>): [number, number] =>
  u.allDay ? [0, 1440] : [u.start, u.end];

export type Coverage = 'google' | 'declared' | 'unknown';
export const coverage = (db: Workspace, pid: PersonId): Coverage => {
  const p = db.people.find((x) => x.id === pid);
  if (!p) return 'unknown';
  return p.gcal ? 'google' : db.unavailable.some((u) => u.who === pid) ? 'declared' : 'unknown';
};

export const BUSY_KIND = {
  meeting: 'In a meeting',
  invite: 'Invited to a meeting',
  away: 'Unavailable',
  google: 'Busy in Google Calendar',
} as const;
export type BusyKind = keyof typeof BUSY_KIND;

export interface Busy {
  s: number;
  e: number;
  kind: BusyKind;
  label: string;
}

/** What is known to occupy a person on a date, as the viewer is allowed to see it. */
export function busyFor(db: Workspace, viewer: PersonId, pid: PersonId, date: DateStr, except?: string) {
  const out: Busy[] = [];
  const mine = pid === viewer;
  for (const mt of db.meetings) {
    const r = mt.responses[pid];
    if (mt.date !== date || mt.state === 'cancelled' || mt.id === except || (r !== 'accepted' && r !== 'pending'))
      continue;
    const kind: BusyKind = r === 'pending' ? 'invite' : 'meeting';
    out.push({ s: mt.start, e: mt.end, kind, label: mt.responses[viewer] ? mt.title : t(BUSY_KIND[kind]) });
  }
  for (const u of db.unavailable) {
    if (u.who !== pid || !unavailableOn(u, date)) continue;
    const [s, e] = blockedSpan(u);
    out.push({ s, e, kind: 'away', label: mine ? u.note || t('Unavailable') : t('Unavailable') });
  }
  if (db.people.find((x) => x.id === pid)?.gcal)
    for (const g of db.gbusy)
      if (g.who === pid && g.date === date)
        out.push({ s: g.start, e: g.end, kind: 'google', label: mine ? g.title : t(BUSY_KIND.google) });
  return { list: out.sort((a, b) => a.s - b.s), cov: coverage(db, pid) };
}

export const clashOf = (
  db: Workspace,
  viewer: PersonId,
  pid: PersonId,
  date: DateStr,
  s: number,
  e: number,
  except?: string,
) => busyFor(db, viewer, pid, date, except).list.filter((x) => overlaps(s, e, x.s, x.e));

/** "you, Salsa and Fikri" */
export const nameList = (db: Workspace, viewer: PersonId, ids: PersonId[]) => {
  const n = ids.map((i) => (i === viewer ? t('you') : (db.people.find((p) => p.id === i)?.first ?? t('Someone'))));
  return n.length < 2 ? n.join('') : `${n.slice(0, -1).join(', ')} ${t('and')} ${n[n.length - 1] ?? ''}`;
};

export const coverageLine = (c: Coverage) =>
  c === 'google'
    ? t('Google Calendar connected')
    : c === 'declared'
      ? t('Unavailable time recorded')
      : t('No schedule recorded');
