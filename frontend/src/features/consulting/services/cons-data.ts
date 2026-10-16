/* Consulting data: engagement records (keyed by the canonical project id), deliverables with versions and reviews, staffing
   requests, Knowledge articles and TnD cohorts. Stored in db.cons. From divisions/div-ee-cons.js (seedCons). */
import type { Draft } from 'immer';
import { nowStamp } from '@/lib/time';
import type { DateStr, FeatureStore, PersonId, Stamp, Workspace } from '@/types/workspace';

export interface ScopeVersion {
  v: number;
  goal?: string;
  change?: string;
  in?: string[];
  out?: string[];
  criteria?: string;
  reason?: string;
  impact?: string;
  rationale?: string;
  state: 'proposed' | 'approved' | 'rejected';
  by: PersonId;
  at: Stamp;
  decidedBy: PersonId | null;
  decidedAt: Stamp | null;
  affects: string[];
}

export type Level = 'low' | 'medium' | 'high';

export interface EngRisk {
  id: string;
  title: string;
  impact: Level | null;
  likelihood: Level | null;
  mitigation: string;
  owner: PersonId | null;
  trigger: string;
  review: DateStr | null;
  blocker: string | null;
  by: PersonId;
  at: Stamp;
}

export interface ClientUpdate {
  id: string;
  date: DateStr;
  channel: string;
  summary: string;
  version: string | null;
  feedback: string;
  pending: string;
  next: string | null;
  by: PersonId;
  at: Stamp;
}

export interface Obligation {
  id: string;
  label: string;
  ref: string;
  h: string;
  unit: string;
  resolution: { kind: 'resolved' | 'handed'; to?: PersonId; by: PersonId; at: Stamp } | null;
}

export interface Eng {
  client: string | null;
  opp: string | null;
  handoff: string | null;
  reviewer: PersonId | null;
  clientOwner: PersonId | null;
  lane: string | null;
  start: { by: PersonId; at: Stamp; note?: string } | null;
  scope: ScopeVersion[];
  risks: EngRisk[];
  updates: ClientUpdate[];
  obligations: Obligation[];
  pmCheck: Record<string, { v: number; by: PersonId; at: Stamp }>;
  closure: { by: PersonId; at: Stamp; outcome: string; lessons: string; kn: string | null } | null;
  /** The client report was reviewed and may be shared (consulting_export). */
  report?: { by: PersonId; at: Stamp } | null;
  createdBy: PersonId;
  at: Stamp;
}

export interface DlvReview {
  choice: 'approved' | 'changes';
  by: PersonId;
  at: Stamp;
  note: string;
  task?: string | null;
}

export interface DlvVersion {
  v: number;
  by: PersonId;
  at: Stamp;
  url: string;
  note: string;
  scopeV: number;
  review: DlvReview | null;
}

export interface Deliverable {
  id: string;
  project: string;
  title: string;
  owner: PersonId;
  ms: string | null;
  criteria: string[];
  by: PersonId;
  at: Stamp;
  versions: DlvVersion[];
  delivery: { v: number; date: DateStr; channel: string; evidence: string; by: PersonId; at: Stamp } | null;
  client: {
    v: number;
    choice: 'accepted' | 'rejected';
    date: DateStr;
    note: string;
    next: string | null;
    by: PersonId;
    at: Stamp;
  } | null;
  waiver: { v: number; by: PersonId; at: Stamp; reason: string } | null;
}

export interface Staffing {
  id: string;
  project: string;
  role: string;
  skills: string;
  from: DateStr;
  to: DateStr;
  reviewer: boolean;
  by: PersonId;
  at: Stamp;
  state: string;
  offers: string[];
}

export interface KnVersion {
  v: number;
  by: PersonId;
  at: Stamp;
  note: string;
  url: string;
  state: 'draft' | 'review' | 'changes' | 'approved' | 'published' | 'withdrawn' | 'superseded';
  reviewer: PersonId | null;
  reviewedAt: Stamp | null;
  reviewNote: string;
}

export interface Article {
  id: string;
  title: string;
  kind: 'method' | 'template' | 'case' | 'lesson';
  topics: string[];
  audience: 'org' | 'cons' | 'named';
  named: PersonId[];
  author: PersonId;
  owner: PersonId;
  source: string;
  perm: string;
  nextReview: DateStr | null;
  at: Stamp;
  versions: KnVersion[];
  uses: { type: string; id: string; v: number }[];
  reports: { id: string; by: PersonId; at: Stamp; reason: string; state: string; [k: string]: unknown }[];
}

export interface Cohort {
  id: string;
  project: string;
  program: string;
  mentor: PersonId;
  presentation: string | null;
  rule: string;
  participants: {
    p: PersonId;
    enroll: 'invited' | 'accepted' | 'declined' | 'withdrawn';
    at: Stamp;
    reason?: string;
  }[];
  sessions: string[];
  att: Record<string, Record<PersonId, { s: string; by: PersonId; at: Stamp }>>;
  assignments: {
    id: string;
    title: string;
    due: DateStr;
    uses: string | null;
    usesV: number | null;
    subs: Record<
      PersonId,
      { v: number; url: string; at: Stamp; review: { choice: string; by: PersonId; at: Stamp; note: string } | null }[]
    >;
  }[];
  outcomes: Record<PersonId, { s: string; by: PersonId; at: Stamp; note: string }>;
  needs: { id: string; from: string; text: string; by: PersonId; at: Stamp; state: string }[];
}

export interface ConsStore extends FeatureStore {
  eng: Record<string, Eng>;
  dlv: Deliverable[];
  staff: Staffing[];
  kn: Article[];
  cohorts: Cohort[];
}

const EMPTY: ConsStore = { v: 2, eng: {}, dlv: [], staff: [], kn: [], cohorts: [] };
const complete = (s: Partial<ConsStore> | undefined): s is ConsStore => !!s?.eng && !!s.dlv && !!s.cohorts;
export const consOf = (db: Workspace): ConsStore => {
  const s = db.cons as Partial<ConsStore> | undefined;
  return complete(s) ? s : EMPTY;
};
export const consDraft = (db: Draft<Workspace>): ConsStore => {
  const s = db.cons as Partial<ConsStore> | undefined;
  if (!complete(s)) db.cons = { ...EMPTY, eng: {}, dlv: [], staff: [], kn: [], cohorts: [] };
  return db.cons as ConsStore;
};

/** A new, empty engagement record for a project (consulting_start: roles, scope and the start decision come later). */
export const newEng = (by: PersonId): Eng => ({
  client: null,
  opp: null,
  handoff: null,
  reviewer: null,
  clientOwner: null,
  lane: null,
  start: null,
  scope: [],
  risks: [],
  updates: [],
  obligations: [],
  pmCheck: {},
  closure: null,
  createdBy: by,
  at: nowStamp(),
});
