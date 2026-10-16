/* HR records as other modules read them (div-hr-sng.js, read by ID and never copied): weekly attendance registers, 14-day
   cycles and assessments, and the proposed rubric. The HR module owns writing them; Performance only reads. */
import type { Tone } from '@/components/ui/StatusBadge';
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
  state: 'planned' | 'open' | 'review' | 'final' | 'closed' | (string & {});
  units: DivisionId[];
  roster: HrRosterEntry[];
  [key: string]: unknown;
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
  expected: PersonId[];
  entries: Record<PersonId, AttendanceEntry[]>;
  finalAt?: Stamp | null;
  createdAt?: Stamp;
  [key: string]: unknown;
}

export interface HrScore {
  v: number;
  why: string;
}

export interface HrAssessment {
  id: string;
  cycle: string;
  person: PersonId;
  state: string;
  scores?: Record<string, HrScore | undefined>;
  scoredBy?: PersonId | null;
  version?: number;
  [key: string]: unknown;
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
  cycles: HrCycle[];
  assessments: HrAssessment[];
  packets?: HrPacket[];
}

/** The HR store, or null while the records do not exist (facts then read as Unknown, never zero). */
export const hrOf = (db: Workspace): HrStore | null => {
  const h = db.hr as Partial<HrStore> | undefined;
  return h?.cycles && h.registers && h.assessments ? (h as HrStore) : null;
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
  const ob = (db.hr as { onboarding?: { instances?: { person: PersonId; tasks: string[] }[] } } | undefined)
    ?.onboarding;
  const inst = ob?.instances?.find((x) => x.person === pid);
  return (inst?.tasks ?? []).map((id) => db.tasks.find((x) => x.id === id)).filter((x): x is Task => !!x && !x.trashed);
};
