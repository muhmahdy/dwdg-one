/* Consulting state lists and rules: delivery lanes, the derived deliverable state (never typed in), the readiness checklist,
   who may run or see an engagement, and the staffing, Knowledge and cohort visibility rules. From divisions/div-ee-cons.js. */
import { t } from '@/lib/i18n';
import { isBoard } from '@/lib/roles';
import { CONS, branchOf, lead, rk, seeDiv, type StateDef } from '@/features/external/services/ee-data';
import { isDone, projOf, taskOf } from '@/features/work/services/selectors';
import type { Person, Project, Workspace } from '@/types/workspace';
import {
  consOf,
  newEng,
  type Article,
  type Cohort,
  type Deliverable,
  type DlvVersion,
  type Eng,
  type KnVersion,
  type Level,
  type ScopeVersion,
  type Staffing,
} from './cons-data';

// ---------- state lists (icon plus word, never colour alone) ----------
export type LaneId = 'planning' | 'discovery' | 'analysis' | 'solution' | 'review' | 'delivery' | 'closed';
/** Consulting delivery lanes (consulting_delivery_lanes, proposed). Unset stays unset; a lane never implies completion. */
export const LANE: Record<LaneId, string> = {
  planning: 'Planning',
  discovery: 'Discovery',
  analysis: 'Analysis',
  solution: 'Solution',
  review: 'Internal review',
  delivery: 'Client delivery',
  closed: 'Closed',
};
export type DlvState = 'draft' | 'submitted' | 'changes' | 'approved' | 'stale' | 'delivered' | 'accepted' | 'rejected';
/** Deliverable states are derived from recorded versions, reviews, delivery and client response (consulting_deliverable). */
export const DLV: Record<DlvState, StateDef> = {
  draft: ['No version yet', 'edit', 'mute'],
  submitted: ['Waiting for review', 'clock', 'warn'],
  changes: ['Changes requested', 'undo', 'warn'],
  approved: ['Approved internally', 'check', 'ink'],
  stale: ['Approval stale', 'warning', 'danger'],
  delivered: ['Delivered to client', 'upload', 'ink'],
  accepted: ['Client accepted', 'check', 'green'],
  rejected: ['Client rejected', 'close', 'danger'],
};
export const SCOPE: Record<ScopeVersion['state'], StateDef> = {
  proposed: ['Waiting for decision', 'clock', 'warn'],
  approved: ['Approved', 'check', 'green'],
  rejected: ['Rejected', 'close', 'mute'],
};
export const LEVEL: Record<Level, string> = { low: 'Low', medium: 'Medium', high: 'High' };
export type Enroll = Cohort['participants'][number]['enroll'];
export const ENROLL: Record<Enroll, StateDef> = {
  invited: ['Invited', 'clock', 'warn'],
  accepted: ['Enrolled', 'check', 'ink'],
  declined: ['Declined', 'close', 'mute'],
  withdrawn: ['Withdrawn', 'minus', 'mute'],
};
export type AttState = 'present' | 'excused' | 'absent' | 'unknown';
export const ATT: Record<AttState, StateDef> = {
  present: ['Attended', 'check', 'green'],
  excused: ['Excused', 'info', 'ink2'],
  absent: ['Absent', 'close', 'danger'],
  unknown: ['Not yet recorded', 'circle', 'mute'],
};
export type SubState = 'none' | 'submitted' | 'returned' | 'approved';
export const SUB: Record<SubState, StateDef> = {
  none: ['Not submitted', 'circle', 'mute'],
  submitted: ['Waiting for review', 'clock', 'warn'],
  returned: ['Returned', 'undo', 'warn'],
  approved: ['Approved', 'check', 'green'],
};
export type OutcomeState = 'open' | 'completed' | 'incomplete' | 'withdrawn' | 'exempt';
export const OUTC: Record<OutcomeState, StateDef> = {
  open: ['Not determined', 'circle', 'mute'],
  completed: ['Completed', 'check', 'green'],
  incomplete: ['Incomplete', 'warning', 'warn'],
  withdrawn: ['Withdrawn', 'minus', 'mute'],
  exempt: ['Exempt', 'minus', 'ink2'],
};
export const KN: Record<KnVersion['state'], StateDef> = {
  draft: ['Draft', 'edit', 'mute'],
  review: ['In review', 'search', 'warn'],
  changes: ['Changes requested', 'undo', 'warn'],
  approved: ['Approved, not published', 'check', 'ink'],
  published: ['Published', 'check', 'green'],
  withdrawn: ['Withdrawn', 'minus', 'mute'],
  superseded: ['Superseded', 'archive', 'mute'],
};
export const AUD: Record<Article['audience'], string> = {
  org: 'Whole organization',
  cons: 'Consulting members',
  named: 'Named people only',
};
export const KKIND: Record<Article['kind'], string> = {
  method: 'Method',
  template: 'Template',
  case: 'Case',
  lesson: 'Lesson',
};
export const OFFER_ST: Record<string, StateDef> = {
  pending: ['Waiting for reply', 'clock', 'warn'],
  accepted: ['Accepted', 'check', 'green'],
  declined: ['Declined', 'close', 'mute'],
  changes: ['Asked for changes', 'undo', 'warn'],
  withdrawn: ['Withdrawn', 'minus', 'mute'],
};
export const staffSt = (s: Staffing): StateDef =>
  s.state === 'filled'
    ? ['Filled', 'check', 'green']
    : s.state === 'cancelled'
      ? ['Canceled', 'close', 'mute']
      : ['Open', 'circle', 'warn'];

// ---------- engagement lookups and rules ----------
export const engOf = (db: Workspace, pid: string | null | undefined) => (pid ? consOf(db).eng[pid] : undefined);
export const dlvOf = (db: Workspace, id: string | null | undefined) => consOf(db).dlv.find((d) => d.id === id);
export const projDlv = (db: Workspace, pid: string) => consOf(db).dlv.filter((d) => d.project === pid);
export const cohortOfProject = (db: Workspace, pid: string) => consOf(db).cohorts.find((c) => c.project === pid);
export const engProjects = (db: Workspace) =>
  db.projects.filter((p) => p.div === CONS && !cohortOfProject(db, p.id) && p.stage !== 'archived');
export const scopeNow = (e: Eng) => e.scope.filter((s) => s.state === 'approved').sort((a, b) => b.v - a.v)[0] ?? null;
export const scopeV = (e: Eng) => scopeNow(e)?.v ?? 0;
export const latest = (d: Deliverable): DlvVersion | null => d.versions.at(-1) ?? null;
/** An approval is stale when a later approved scope change affected this deliverable (consulting_stale_ready). */
export const isStale = (d: Deliverable, e: Eng) => {
  const l = latest(d);
  return (
    !!l &&
    l.review?.choice === 'approved' &&
    e.scope.some((s) => s.state === 'approved' && s.v > l.scopeV && s.affects.includes(d.id))
  );
};
export function dlvState(db: Workspace, d: Deliverable): DlvState {
  const e = engOf(db, d.project) ?? newEng('');
  const l = latest(d);
  if (!l) return 'draft';
  if (d.client?.v === l.v) return d.client.choice;
  if (d.delivery?.v === l.v) return 'delivered';
  if (!l.review) return 'submitted';
  if (l.review.choice === 'changes') return 'changes';
  return isStale(d, e) ? 'stale' : 'approved';
}
export const consMember = (m: Person | undefined) => !!m && m.div === CONS && !isBoard(m);
export const consCD = (m: Person | undefined) => lead(m, CONS);
export const isPL = (p: Project, m: Person | undefined) => !!m && p.lead === m.id;
export const isPM = (p: Project, m: Person | undefined) => !!m && p.pm === m.id;
export const canRunEng = (p: Project, m: Person | undefined) =>
  !!m && !isBoard(m) && (isPL(p, m) || isPM(p, m) || consCD(m));
export const canSeeEng = (db: Workspace, p: Project, m: Person | undefined) =>
  !!m && !isBoard(m) && (seeDiv(m, CONS) || [p.lead, p.pm, engOf(db, p.id)?.reviewer].includes(m.id));
export const projBlk = (db: Workspace, pid: string) =>
  db.blockers.filter((b) => b.state === 'open' && (b.project === pid || taskOf(db, b.task)?.project === pid));
export const projOpenTasks = (db: Workspace, pid: string) =>
  db.tasks.filter((x) => x.project === pid && !x.trashed && !isDone(x) && !x.phase);
/** Setup gaps (consulting_start, consulting_roles): a missing role or start decision keeps the engagement in Setup needed. */
export const gaps = (p: Project, e: Eng) =>
  [
    !p.lead && 'Project Leader',
    !p.pm && 'Project Manager',
    !e.reviewer && 'Reviewer',
    !scopeNow(e) && 'Approved scope',
    !e.start && 'Start decision',
  ].filter((x): x is string => !!x);
/** Readiness checklist for delivery (consulting_review): counts and states, never a quality score. */
export function checks(db: Workspace, d: Deliverable): [label: string, ok: boolean][] {
  const e = engOf(db, d.project) ?? newEng('');
  const l = latest(d);
  const p = projOf(db, d.project);
  const pm = e.pmCheck[d.id];
  return [
    [t('Latest version approved by the reviewer'), !!l && l.review?.choice === 'approved'],
    [t('Approval matches the current scope'), !!l && !isStale(d, e)],
    [t('Evidence link on the version'), !!l && !!l.url],
    [t('No open blocker in the engagement'), !projBlk(db, d.project).length],
    [t('PM completeness check'), !!l && !!pm && pm.v === l.v && !!p?.pm],
  ];
}
export const ready = (db: Workspace, d: Deliverable) =>
  (!!d.waiver && d.waiver.v === latest(d)?.v) || checks(db, d).every((c) => c[1]);
export const nextMsOf = (db: Workspace, pid: string) =>
  db.milestones
    .filter((x) => x.project === pid && x.state !== 'achieved' && !x.achievedAt)
    .sort((a, b) => a.target.localeCompare(b.target))
    .at(0);

// ---------- staffing, knowledge and cohort rules ----------
export const staffOf = (db: Workspace, id: string | null | undefined) => consOf(db).staff.find((s) => s.id === id);
export const offersOf = (db: Workspace, s: Staffing) =>
  s.offers.map((id) => db.offers.find((o) => o.id === id)).filter((o): o is Workspace['offers'][number] => !!o);
export const canStaff = (db: Workspace, s: Staffing, m: Person | undefined) => {
  const p = projOf(db, s.project);
  return !!p && canRunEng(p, m);
};
export const artOf = (db: Workspace, id: string | null | undefined) => consOf(db).kn.find((a) => a.id === id);
export const pubV = (a: Article) => a.versions.filter((v) => v.state === 'published').slice(-1)[0] ?? null;
export const isCurator = (m: Person | undefined) =>
  !!m && m.div === CONS && !isBoard(m) && (branchOf(m) === 'kn' || rk(m) >= 3);
export const artStaff = (a: Article, m: Person | undefined) =>
  !!m && (a.author === m.id || a.owner === m.id || (a.audience !== 'named' && isCurator(m)));
const isTopRole = (m: Person) => m.role === 'president' || m.role === 'vp';
/** Restricted articles stay invisible, title included, to anyone outside their audience (resource_search, no disclosure). */
export const canSeeArt = (a: Article, m: Person | undefined) => {
  if (!m || isBoard(m)) return false;
  if (a.audience === 'named') return a.named.includes(m.id) || a.owner === m.id || a.author === m.id;
  if (artStaff(a, m)) return true;
  if (!pubV(a)) return false;
  return a.audience === 'org' || m.div === CONS || isTopRole(m) || m.admin;
};
