/* Sign-off (proposed D35) and hand-in (D58), from screens/work.js round 14 and screens/handin.js.
   When someone else is accountable for a piece of work, they check it before it counts as done; nobody signs off their own
   work. A task someone gave you is finished by handing in links to your work; the giver rates it and accepts or returns it. */
import { rank, visibleDivs } from '@/lib/access';
import type { Person, PersonId, Task, Workspace } from '@/types/workspace';
import { canEditRt } from '@/features/operations/services/access';
import { rtOf } from '@/features/operations/services/routines';
import { isDone, isSummary, joinedOf, personOf, projOf, taskDiv, unitLeads } from './selectors';

export function signerFor(db: Workspace, t: Task | undefined): PersonId | null {
  if (!t || t.signoffMode === 'off') return null;
  const r = rtOf(db, t.routine);
  const p = projOf(db, t.project);
  const givenBy = t.givenBy;
  let c: (PersonId | null | undefined)[];
  if (r) {
    if (r.personal || r.signoff === false) return null;
    c = [t.signer, r.signer, r.createdBy, ...(r.unit ? unitLeads(db, r.unit) : [])];
  } else if (t.signoffMode === 'on' || (t.createdBy && t.createdBy !== t.owner) || (givenBy && givenBy !== t.owner)) {
    const d = taskDiv(db, t);
    c = [
      t.signer,
      givenBy && givenBy !== t.owner ? givenBy : null,
      t.createdBy !== t.owner ? t.createdBy : null,
      p?.pm,
      p?.lead,
      ...(d ? unitLeads(db, d) : []),
    ];
  } else return null;
  const busy = joinedOf(t);
  return c.find((id) => !!id && id !== t.owner && !busy.includes(id) && personOf(db, id)?.status === 'active') ?? null;
}

export function canManageSignoff(db: Workspace, me: Person, t: Task) {
  if (me.id === t.owner) return false;
  const r = rtOf(db, t.routine);
  if (r) return !r.personal && canEditRt(me, r);
  const p = projOf(db, t.project);
  const o = personOf(db, t.owner);
  const d = taskDiv(db, t);
  return (
    t.createdBy === me.id ||
    (!!p && (p.lead === me.id || p.pm === me.id)) ||
    (rank(me) >= 2 && !!d && visibleDivs(me).includes(d) && (!o || rank(me) > rank(o)))
  );
}

export const canSignOff = (db: Workspace, me: Person, t: Task) =>
  me.id !== t.owner && (me.id === signerFor(db, t) || me.id === t.reviewer || canManageSignoff(db, me, t));

// ---------- hand-in ----------

export interface Submission {
  id: string;
  at: string;
  by: PersonId;
  links: { url: string; label: string }[];
  note: string;
  withdrawn?: string;
  review?: { by: PersonId; at: string; result: 'accepted' | 'returned'; rating: Rating | null; comment: string };
}
export type Rating = 'needs-work' | 'good' | 'excellent';
export const RATING: Record<Rating, [label: string, icon: string, tone: 'warn' | 'green']> = {
  'needs-work': ['Needs work', 'warning', 'warn'],
  good: ['Good', 'check', 'green'],
  excellent: ['Excellent', 'sparkles', 'green'],
};
export const RATING_ORDER: Rating[] = ['needs-work', 'good', 'excellent'];

export const subsOf = (t: Task) => ((t.submissions as Submission[] | undefined) ?? []).filter((s) => !s.withdrawn);
export const lastSub = (t: Task) => subsOf(t).at(-1) ?? null;
export const isHandIn = (db: Workspace, t: Task | undefined) =>
  !!t && !isSummary(db, t) && (!!signerFor(db, t) || subsOf(t).length > 0);
/** The doer hands in instead of ticking: the giver checks the work before it counts as done. */
export const needsHandIn = (db: Workspace, me: Person, t: Task | undefined) =>
  !!t &&
  t.owner === me.id &&
  !!signerFor(db, t) &&
  !canSignOff(db, me, t) &&
  !isDone(t) &&
  t.status !== 'review' &&
  !isSummary(db, t);

/** A label people recognise, from the link itself (the work stays in Google Drive or wherever it lives). */
export function linkLabel(url: string) {
  try {
    const u = new URL(url);
    const h = u.hostname.replace(/^www\./, '');
    if (h === 'docs.google.com')
      return u.pathname.includes('/spreadsheets/')
        ? 'Google Sheets'
        : u.pathname.includes('/presentation/')
          ? 'Google Slides'
          : u.pathname.includes('/forms/')
            ? 'Google Forms'
            : 'Google Docs';
    const known: Record<string, string> = {
      'drive.google.com': 'Google Drive',
      'figma.com': 'Figma',
      'canva.com': 'Canva',
      'github.com': 'GitHub',
      'notion.so': 'Notion',
      'youtube.com': 'YouTube',
      'classroom.google.com': 'Google Classroom',
    };
    return known[h] ?? h;
  } catch {
    return url;
  }
}
