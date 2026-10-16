/* Strategy & Growth records (db.sng): initiatives, the sources behind them, decision packets with versions, dependency
   requests to other units and outcome reviews. Evidence leads to a decision, the decision to delivery in a project, and the
   outcome is reviewed against a metric with a source (division_strategy, strategy_*, flow-strategy, W059, W060, S052, S053,
   blueprint §9). From divisions/div-hr-sng.js. The demo seed carries the records; Supabase stores them as the same JSON. */
import type { Draft } from 'immer';
import { t } from '@/lib/i18n';
import type { Tone } from '@/components/ui/StatusBadge';
import type { DateStr, DivisionId, FeatureStore, PersonId, Stamp, Workspace } from '@/types/workspace';

export type Horizon = 'now' | 'next' | 'later';
export type Stage = 'idea' | 'research' | 'pending' | 'approved' | 'hold' | 'rejected';

export interface SngSource {
  id: string;
  kind: 'resource' | 'link';
  res: string | null;
  url: string;
  title: string;
  observed: DateStr | null;
  method: string;
  finding: string;
  interpretation: string;
  uncertainty: string;
  /** Raw data stays inside SnG; others get a request-access route. */
  restricted: boolean;
  addedBy: PersonId;
  at: Stamp;
}

export type DepState = 'requested' | 'accepted' | 'returned' | 'fulfilled' | 'cancelled';
export interface SngDep {
  id: string;
  to: PersonId;
  unit: DivisionId;
  action: string;
  neededBy: DateStr;
  state: DepState;
  link: { type: 'task' | 'project'; id: string } | null;
  by: PersonId;
  at: Stamp;
  answeredAt: Stamp | null;
  note: string;
}

export interface SngMetric {
  name: string;
  unit: string;
  source: string;
  owner: PersonId;
}
export interface SngObservation {
  id: string;
  value: string;
  unit: string;
  source: string;
  date: DateStr;
  by: PersonId;
  at: Stamp;
}
export type OutcomeState = 'observed' | 'inconclusive';
export interface SngOutcome {
  state: OutcomeState;
  note: string;
  next: 'continue' | 'adjust' | 'stop' | 'handover';
  by: PersonId;
  at: Stamp;
}

export interface Initiative {
  id: string;
  title: string;
  objective: string;
  problem: string;
  hypothesis: string;
  owner: PersonId;
  unit: DivisionId;
  affected: DivisionId[];
  horizon: Horizon;
  stage: Stage;
  sources: SngSource[];
  tasks: string[];
  project: string | null;
  reviewDate: DateStr | null;
  deps: SngDep[];
  metric: SngMetric | null;
  observations: SngObservation[];
  outcome: SngOutcome | null;
  createdBy: PersonId;
  createdAt: Stamp;
}

export interface PacketOption {
  title: string;
  benefit: string;
  cost: string;
  risk: string;
  uncertainty: string;
  owner: PersonId;
}
export type PacketChoice = 'approved' | 'hold' | 'rejected';
export interface PacketDecision {
  choice: PacketChoice;
  option: number | null;
  rationale: string;
  conditions: string;
  reviewDate: DateStr | null;
  noDate: boolean;
  by: PersonId;
  at: Stamp;
}
export type PacketStateS = 'pending' | 'approved' | 'hold' | 'rejected' | 'superseded';
export interface DecisionPacket {
  id: string;
  initiative: string;
  version: number;
  question: string;
  options: PacketOption[];
  recommend: number;
  assumptions: string;
  open: string;
  success: string;
  reviewer: PersonId;
  state: PacketStateS;
  submittedBy: PersonId;
  submittedAt: Stamp;
  decision: PacketDecision | null;
  createdBy: PersonId;
  createdAt: Stamp;
}

export interface SngStore extends FeatureStore {
  initiatives: Initiative[];
  packets: DecisionPacket[];
}

export const sngOf = (db: Workspace): SngStore => {
  const s = db.sng as Partial<SngStore> | undefined;
  return s?.initiatives && s.packets ? (s as SngStore) : { v: 1, initiatives: [], packets: [] };
};
export const sngDraft = (db: Draft<Workspace>): SngStore => {
  const s = db.sng as Partial<SngStore> | undefined;
  if (!s?.initiatives || !s.packets) db.sng = { v: 1, initiatives: [], packets: [] };
  return db.sng as SngStore;
};

type Def = [label: string, icon: string, tone: Tone];
export const STG: Record<Stage, Def> = {
  idea: ['Idea', 'sparkles', 'mute'],
  research: ['Research', 'search', 'ink2'],
  pending: ['Decision pending', 'clock', 'warn'],
  approved: ['Approved for delivery', 'check', 'green'],
  hold: ['On hold', 'hand', 'hold'],
  rejected: ['Rejected', 'close', 'danger'],
};
export const HZ: Record<Horizon, string> = { now: 'Now', next: 'Next', later: 'Later' };
export const PKT: Record<PacketStateS, Def> = {
  pending: ['Waiting for decision', 'clock', 'warn'],
  approved: ['Approved', 'check', 'green'],
  hold: ['On hold', 'hand', 'hold'],
  rejected: ['Rejected', 'close', 'danger'],
  superseded: ['Superseded', 'archive', 'mute'],
};
export const DEPS: Record<DepState, Def> = {
  requested: ['Requested', 'upload', 'ink2'],
  accepted: ['Accepted', 'check', 'green'],
  returned: ['Returned', 'undo', 'warn'],
  fulfilled: ['Fulfilled', 'check', 'green'],
  cancelled: ['Canceled', 'close', 'mute'],
};
export const OUTC: Record<OutcomeState, Def> = {
  observed: ['Outcome observed', 'chart', 'green'],
  inconclusive: ['Inconclusive', 'info', 'mute'],
};
export const NEXT: Record<SngOutcome['next'], string> = {
  continue: 'Continue',
  adjust: 'Adjust',
  stop: 'Stop',
  handover: 'Hand over',
};

export const initiativeOf = (db: Workspace, id: string | undefined) => sngOf(db).initiatives.find((x) => x.id === id);
export const packetOf = (db: Workspace, id: string | undefined) => sngOf(db).packets.find((x) => x.id === id);
export const packetsOf = (db: Workspace, i: Initiative) =>
  sngOf(db)
    .packets.filter((x) => x.initiative === i.id)
    .sort((a, b) => b.version - a.version);
export const latestPacket = (db: Workspace, i: Initiative) => packetsOf(db, i)[0];

export const horizonLabel = (h: Horizon) => t(HZ[h]);
