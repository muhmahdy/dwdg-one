/* TnD cohort rules (consulting_tnd, W065, S060, S061; D47: a cohort is a project inside a program). Invited, attended,
   submitted and completed are separate records; completion needs recorded evidence under the cohort's rule, never a date. */
import { t } from '@/lib/i18n';
import { isBoard } from '@/lib/roles';
import { CONS, branchOf, rk } from '@/features/external/services/ee-data';
import { projOf } from '@/features/work/services/selectors';
import type { Meeting, Person, PersonId, Workspace } from '@/types/workspace';
import { consOf, type Cohort } from './cons-data';
import { ATT, SUB, type AttState, type OutcomeState, type SubState } from './cons-rules';

export const coOf = (db: Workspace, id: string | null | undefined) => consOf(db).cohorts.find((c) => c.id === id);
export const meetingOf = (db: Workspace, id: string): Meeting | undefined => db.meetings.find((x) => x.id === id);
export const tndLead = (db: Workspace, c: Cohort, m: Person | undefined) =>
  !!m &&
  !isBoard(m) &&
  (c.mentor === m.id ||
    projOf(db, c.project)?.lead === m.id ||
    (m.div === CONS && (branchOf(m) === 'tnd' || rk(m) >= 3)));
export const partOf = (c: Cohort, p: PersonId) => c.participants.find((x) => x.p === p);
export const attSt = (c: Cohort, meeting: string, p: PersonId): AttState =>
  (c.att[meeting]?.[p]?.s ?? 'unknown') as AttState;
export const subs = (c: Cohort, p: PersonId) => c.assignments[0]?.subs[p] ?? [];
export const subSt = (c: Cohort, p: PersonId): SubState => {
  const s = subs(c, p);
  const l = s[s.length - 1];
  return !l ? 'none' : !l.review ? 'submitted' : (l.review.choice as SubState);
};
export const outSt = (c: Cohort, p: PersonId): OutcomeState => (c.outcomes[p]?.s ?? 'open') as OutcomeState;

/** What is still missing before "Completed" can be recorded (S061 acceptance 1). */
export function missingFor(db: Workspace, c: Cohort, p: PersonId): string[] {
  const out: string[] = [];
  c.sessions.forEach((id) => {
    const mt = meetingOf(db, id);
    if (!mt) return;
    if (mt.state !== 'held') out.push(t('{s} has not been held', { s: mt.title }));
    else if (attSt(c, id, p) !== 'present') out.push(t('{s}: {a}', { s: mt.title, a: t(ATT[attSt(c, id, p)][0]) }));
  });
  if (c.assignments.length && subSt(c, p) !== 'approved') out.push(t('Assignment: {s}', { s: t(SUB[subSt(c, p)][0]) }));
  const ms = c.presentation ? db.milestones.find((x) => x.id === c.presentation) : undefined;
  if (ms && !ms.achievedAt) out.push(t('{m} not recorded yet', { m: ms.title }));
  return out;
}
/** "Consultant cohort 1, session 3" shows as "Session 3". */
export const sessLabel = (mt: Meeting) => {
  const s = mt.title.replace(/^.*,\s*/, '');
  return s.charAt(0).toUpperCase() + s.slice(1);
};
/** What staffing may see about a candidate (S054 acceptance 3): permitted TnD completion only, never evaluator notes. */
export const tndSummary = (db: Workspace, id: PersonId) =>
  consOf(db)
    .cohorts.filter((c) => c.outcomes[id]?.s === 'completed')
    .map((c) => t('Completed {c}', { c: projOf(db, c.project)?.name ?? '' }));
