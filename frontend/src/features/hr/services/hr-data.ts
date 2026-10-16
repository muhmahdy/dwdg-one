/* HR records as other modules read them (div-hr-sng.js, read by ID and never copied): weekly attendance registers, 14-day
   cycles and assessments, and the proposed rubric. The HR module owns writing them; Performance only reads. */
import type { Tone } from '@/components/ui/StatusBadge';
import type { Draft } from 'immer';
import { t } from '@/lib/i18n';
import { dShort } from '@/lib/time';
import type { DateStr, DivisionId, FeatureStore, Meeting, PersonId, Stamp, Task, Workspace } from '@/types/workspace';

export interface HrRosterEntry {
  p: PersonId;
  unit: DivisionId;
  reviewer: PersonId | null;
  exempt: string | null;
}

export interface HrCycle {
  id: string;
  start: DateStr;
  end: DateStr;
  reportDue: DateStr;
  reviewDue: DateStr;
  correctionUntil: DateStr;
  rubric: string;
  state: 'planned' | 'open' | 'review' | 'final' | 'closed' | (string & {});
  units: DivisionId[];
  roster: HrRosterEntry[];
  openedBy: PersonId | null;
  openedAt: Stamp | null;
  releasedBy: PersonId | null;
  releasedAt: Stamp | null;
  closedBy: PersonId | null;
  closedAt: Stamp | null;
  createdBy: PersonId;
  createdAt: Stamp;
}

export interface AttendanceEntry {
  status: string;
  by: PersonId;
  at: Stamp;
  reason: string;
}

export interface HrRegister {
  id: string;
  meeting: string;
  unit: DivisionId;
  officer: PersonId;
  expected: PersonId[];
  guests: PersonId[];
  notRequired: PersonId[];
  entries: Record<PersonId, AttendanceEntry[]>;
  finalBy?: PersonId | null;
  finalAt?: Stamp | null;
  exceptions?: string;
  createdBy?: PersonId;
  createdAt?: Stamp;
}

export type NoticeOutcome = 'pending' | 'accepted' | 'declined';

/** An absence note sent against one weekly meeting. The explanation is restricted to the member and the HR leads. */
export interface HrNotice {
  id: string;
  reg: string;
  person: PersonId;
  category: string;
  explanation: string;
  at: Stamp;
  outcome: NoticeOutcome;
  by: PersonId | null;
  decidedAt: Stamp | null;
}

export interface HrScore {
  v: number;
  why: string;
}

export interface HrReport {
  achievements: string;
  div: string[];
  cons: string[];
  consNote: string;
  blockers: string;
  support: string;
  next: string;
  links: string[];
  at: Stamp;
}

export interface HrClarification {
  by: PersonId;
  at: Stamp;
  q: string;
  /** The answer; '-' marks a note that needs none (an HR check returned to the reviewer). */
  a: string;
  aAt: Stamp | null;
}

export interface HrCorrection {
  by: PersonId;
  at: Stamp;
  reason: string;
  state: 'open' | 'accepted' | 'declined';
  resolvedBy: PersonId | null;
  resolvedAt: Stamp | null;
  note?: string;
}

export type HrScores = Record<string, HrScore | undefined>;

export interface HrAssessment {
  id: string;
  cycle: string;
  person: PersonId;
  state: string;
  report: HrReport | null;
  clar: HrClarification[];
  scores: HrScores | null;
  scoredBy: PersonId | null;
  scoredAt: Stamp | null;
  hrBy: PersonId | null;
  finalAt: Stamp | null;
  version: number;
  history: { version: number; scores: HrScores; by: PersonId | null; at: Stamp | null; reason: string }[];
  ack: Stamp | null;
  corr: HrCorrection | null;
  exceptionNote: string;
}

export interface HrAction {
  id: string;
  assessment: string;
  person: PersonId;
  goal: string;
  owner: PersonId;
  due: DateStr;
  tnd: boolean;
  tndNote: string;
  state: 'open' | 'done';
  task: string | null;
  outcome: string;
  createdBy: PersonId;
  createdAt: Stamp;
}

export interface HrRoundFlag {
  id: string;
  at: Stamp;
  person: PersonId;
  cycle: string;
  state: 'open' | 'resolved' | (string & {});
  by: PersonId | null;
  resolvedAt: Stamp | null;
  note: string;
}

export interface HrRoundDecision {
  winner: PersonId | null;
  joint: PersonId | null;
  rationale: string;
  by: PersonId;
  at: Stamp;
  version: number;
  noAward: boolean;
}

/** One Member of the Month round: the cycles it draws on, the panel, the shortlist and the decision. */
export interface HrRound {
  id: string;
  month: string;
  cycles: string[];
  eligibility: string;
  policy: string;
  panel: PersonId[];
  recused: { p: PersonId; why: string }[];
  shortlist: { p: PersonId; by: PersonId; at: Stamp; why: string }[];
  state: string;
  decision: HrRoundDecision | null;
  flags: HrRoundFlag[];
  packet: string | null;
  createdBy: PersonId;
  createdAt: Stamp;
}

export interface OnboardingItem {
  title: string;
  owner: 'member' | 'buddy' | 'hr';
  days: number;
}

export interface OnboardingTemplate {
  id: string;
  name: string;
  version: number;
  items: OnboardingItem[];
  createdBy: PersonId;
  createdAt: Stamp;
}

export interface OnboardingInstance {
  id: string;
  person: PersonId;
  template: string;
  version: number;
  buddy: PersonId | null;
  hrOwner: PersonId | null;
  tasks: string[];
  appliedAt: Stamp | null;
  appliedBy: PersonId | null;
  createdBy: PersonId;
  createdAt: Stamp;
}

export interface HrPacket {
  id: string;
  title: string;
  state: string;
  createdBy: PersonId;
  receiver: PersonId;
  requestedAt?: Stamp;
  createdAt: Stamp;
  neededBy: DateStr | null;
  [key: string]: unknown;
}

export interface HrStore extends FeatureStore {
  registers: HrRegister[];
  notices: HrNotice[];
  cycles: HrCycle[];
  assessments: HrAssessment[];
  actions: HrAction[];
  rounds: HrRound[];
  packets: HrPacket[];
  onboarding: { templates: OnboardingTemplate[]; instances: OnboardingInstance[] };
}

/** An empty HR store (the demo seed and the database always carry one; this only guards a workspace without it). */
const emptyHr = (): HrStore => ({
  v: 1,
  registers: [],
  notices: [],
  cycles: [],
  assessments: [],
  actions: [],
  rounds: [],
  packets: [],
  onboarding: { templates: [], instances: [] },
});

/** The HR store inside an action's draft, created on first use. */
export const hrDraft = (db: Draft<Workspace>): HrStore => {
  const h = db.hr as Partial<HrStore> | undefined;
  if (!h?.cycles) db.hr = emptyHr();
  return db.hr as HrStore;
};

/** The HR store, or null while the records do not exist (facts then read as Unknown, never zero). */
export const hrOf = (db: Workspace): HrStore | null => {
  const h = db.hr as Partial<HrStore> | undefined;
  return h?.cycles && h.registers && h.assessments && h.onboarding ? (h as HrStore) : null;
};

/** Attendance states: label, icon, tone. */
type Def = [label: string, icon: string, tone: Tone];
export const ATT: Record<string, Def> = {
  present: ['Present', 'check', 'green'],
  late: ['Late', 'clock', 'warn'],
  excused: ['Excused absence', 'info', 'ink2'],
  unexcused: ['Unexcused absence', 'close', 'danger'],
  notreq: ['Not required', 'minus', 'mute'],
  unknown: ['Not yet recorded', 'circle', 'mute'],
};
const UNKNOWN_ATT: Def = ['Not yet recorded', 'circle', 'mute'];
const NONE_AS: Def = ['Not submitted', 'circle', 'mute'];
/** The definition for an attendance or assessment state; unknown states read as not recorded. */
export const attDef = (s: string): Def => ATT[s] ?? UNKNOWN_ATT;
export const asDef = (s: string): Def => AS[s] ?? NONE_AS;
export const ATT_ORDER = ['present', 'late', 'excused', 'unexcused', 'unknown'];

/** Assessment states shown on a person's cycle. */
export const AS: Record<string, Def> = {
  final: ['Finalized', 'check', 'green'],
  incomplete: ['Incomplete', 'warning', 'warn'],
  exempt: ['Exempt', 'minus', 'mute'],
  none: ['Not submitted', 'circle', 'mute'],
  submitted: ['Submitted', 'clock', 'ink2'],
  clarify: ['Clarification asked', 'info', 'warn'],
  draft: ['Being scored', 'edit', 'ink2'],
  reviewed: ['Scored, not final', 'search', 'warn'],
};

export const CYCLE_STATE: Record<string, string> = {
  planned: 'Planned',
  open: 'Open',
  review: 'In review',
  final: 'Finalized',
  closed: 'Closed',
};

export interface RubricCriterion {
  k: string;
  name: string;
  desc: string;
  w: number;
}

/** The proposed rubric (hr_scoring_policy is still open). */
export const RUBRIC = {
  version: 'v0.1',
  proposed: true,
  max: 5,
  criteria: [
    { k: 'quality', name: 'Quality', desc: 'Deliverables meet the agreed standard', w: 30 },
    { k: 'delivery', name: 'Agreed delivery', desc: 'Committed items done by the agreed date', w: 30 },
    { k: 'collab', name: 'Collaboration', desc: 'Communication and support for others', w: 20 },
    { k: 'dev', name: 'Development', desc: 'Learning and contribution', w: 20 },
  ] as RubricCriterion[],
};

/** The weighted result: sum of value / max x weight, one decimal. Null while any criterion is unscored. */
export function weightedTotal(a: HrAssessment | undefined | null): number | null {
  if (!a?.scores) return null;
  let sum = 0;
  for (const c of RUBRIC.criteria) {
    const s = a.scores[c.k];
    if (s?.v == null) return null;
    sum += (s.v / RUBRIC.max) * c.w;
  }
  return Math.round(sum * 10) / 10;
}

export const meetingOf = (db: Workspace, id: string | null | undefined): Meeting | undefined =>
  id ? db.meetings.find((m) => m.id === id) : undefined;

export const regDate = (db: Workspace, g: HrRegister): DateStr =>
  meetingOf(db, g.meeting)?.date ?? (g.createdAt ?? '').slice(0, 10);

export const regTitle = (db: Workspace, g: HrRegister) => {
  const mt = meetingOf(db, g.meeting);
  return mt ? `${mt.title}, ${dShort(mt.date)}` : t('Weekly meeting');
};

/** A missing entry stays "Not yet recorded" (hr_attendance). */
export const attStatus = (g: HrRegister, pid: PersonId): string => {
  const e = g.entries[pid];
  return e?.length ? (e.at(-1)?.status ?? 'unknown') : 'unknown';
};

/** The onboarding checklist HR made for a new member: tasks with owners and dates, read by id. */
export const onboardingTasks = (db: Workspace, pid: PersonId): Task[] => {
  const inst = hrOf(db)?.onboarding.instances.find((x) => x.person === pid);
  return (inst?.tasks ?? []).map((id) => db.tasks.find((x) => x.id === id)).filter((x): x is Task => !!x && !x.trashed);
};
