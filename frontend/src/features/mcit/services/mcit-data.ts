/* Marketing Communication & IT data: campaigns and content with versions and per-channel publication, IT requests, content briefs
   and the accounts register. Stored in db.mcit. Planned and actual publication are separate records; a planned date passing
   never publishes anything. From divisions/div-fnl-mcit.js (seedMc, lookups, rules). */
import type { Draft } from 'immer';
import { rank } from '@/lib/access';
import { daysBetween } from '@/lib/time';
import { isBoardP, isTopP, unitLead, type HistoryRow } from '@/features/fnl/services/fnl-data';
import type { StateDef } from '@/features/external/services/ee-data';
import type { DateStr, DivisionId, FeatureStore, Person, PersonId, Stamp, Workspace } from '@/types/workspace';

export const MC: DivisionId = 'mcit';
export { isBoardP, isTopP, unitLead };
export type { HistoryRow };

// ---------- types ----------
export type ChannelId = 'instagram' | 'linkedin' | 'website';
export type ContentStage =
  'idea' | 'drafting' | 'review' | 'revision' | 'approved' | 'scheduled' | 'published' | 'cancelled' | 'archived';
export type ItStage = 'new' | 'triaged' | 'working' | 'waiting' | 'resolved' | 'closed' | 'reopened' | 'cancelled';
export type ItType = 'access' | 'bug' | 'change';
export type Priority = 'low' | 'medium' | 'high';
export type BriefState = 'submitted' | 'accepted' | 'returned' | 'cancelled';
export type McGrant = 'review' | 'publish' | 'triage' | 'tech' | 'custody';

export interface Campaign {
  id: string;
  name: string;
  purpose: string;
  owner: PersonId;
  start: DateStr;
  end: DateStr;
  channels: ChannelId[];
  audience: string;
  project: string | null;
  createdBy: PersonId;
  createdAt: Stamp;
}
export interface Publication {
  url: string;
  at: Stamp;
  by: PersonId;
  basis: 'url' | 'attest';
  v: number | null;
  note: string;
  recordedAt: Stamp;
}
export interface ContentChannel {
  ch: ChannelId;
  planned: Stamp;
  pub: Publication | null;
  failed: { reason: string; by: PersonId; at: Stamp; task: string | null } | null;
}
export interface ContentVersion {
  v: number;
  label: string;
  url: string;
  by: PersonId;
  at: Stamp;
  decision: { kind: 'approved' | 'revision'; by: PersonId; at: Stamp; reason: string } | null;
}
export interface Content {
  id: string;
  title: string;
  campaign: string | null;
  kind: string;
  channels: ContentChannel[];
  executor: PersonId;
  reviewer: PersonId;
  due: DateStr | null;
  stage: ContentStage;
  approvedV: number | null;
  versions: ContentVersion[];
  brief: string;
  assets: { label: string; url: string }[];
  task: string | null;
  revTasks?: string[];
  corrections: { reason: string; url: string; by: PersonId; at: Stamp }[];
  fromBrief: string | null;
  cancel?: { reason: string; by: PersonId; at: Stamp };
  history: HistoryRow[];
  createdBy: PersonId;
  createdAt: Stamp;
}
export interface ItRequest {
  id: string;
  title: string;
  type: ItType;
  service: string | null;
  symptom: string;
  expected: string;
  impact: 'one' | 'team' | 'all';
  steps: string;
  evidence: { label: string; url: string } | null;
  requester: PersonId;
  unit: DivisionId | null;
  owner: PersonId | null;
  priority: Priority | null;
  stage: ItStage;
  prevStage?: ItStage;
  tasks: string[];
  info: { q: string; by: PersonId; at: Stamp; a: string; aAt: Stamp | null }[];
  blocker: { text: string; action: string; by: PersonId; at: Stamp } | null;
  resolution: { text: string; url: string; version: string; by: PersonId; at: Stamp } | null;
  confirm: { kind: string; by: PersonId; at: Stamp; note: string } | null;
  priv: string;
  history: HistoryRow[];
  createdBy: PersonId;
  createdAt: Stamp;
}
export interface Brief {
  id: string;
  title: string;
  unit: DivisionId | null;
  requester: PersonId;
  purpose: string;
  audience: string;
  channel: ChannelId;
  deliverable: string;
  desired: DateStr;
  sources: string;
  approver: PersonId | null;
  state: BriefState;
  content: string | null;
  returnNote: string;
  returnedBy?: PersonId;
  acceptedBy?: PersonId;
  acceptedAt?: Stamp;
  createdBy: PersonId;
  createdAt: Stamp;
}
export interface Account {
  id: string;
  service: string;
  purpose: string;
  custodian: PersonId | null;
  backup: PersonId | null;
  access: string;
  vault: string;
  renewal: DateStr | null;
  verifiedBy: PersonId | null;
  verifiedAt: DateStr | null;
  hidden: boolean;
  request?: string | null;
}
export interface McitStore extends FeatureStore {
  grants: Record<McGrant, PersonId[]>;
  campaigns: Campaign[];
  content: Content[];
  briefs: Brief[];
  it: ItRequest[];
  accounts: Account[];
  drafts: Record<PersonId, Record<string, Record<string, unknown>>>;
}

const complete = (s: Partial<McitStore> | undefined): s is McitStore => !!s?.content && !!s.it && !!s.grants;
const EMPTY = (): McitStore => ({
  v: 1,
  grants: {} as McitStore['grants'],
  campaigns: [],
  content: [],
  briefs: [],
  it: [],
  accounts: [],
  drafts: {},
});
const EMPTY_STORE = EMPTY();
export const mcitOf = (db: Workspace): McitStore => {
  const s = db.mcit as Partial<McitStore> | undefined;
  return complete(s) ? s : EMPTY_STORE;
};
export const mcitDraft = (db: Draft<Workspace>): McitStore => {
  const s = db.mcit as Partial<McitStore> | undefined;
  if (!complete(s)) db.mcit = EMPTY();
  return db.mcit as McitStore;
};

// ---------- state lists ----------
export const CH: Record<ChannelId, string> = { instagram: 'Instagram', linkedin: 'LinkedIn', website: 'Website' };
export const chName = (k: string) => (k in CH ? CH[k as ChannelId] : k);
export const CST: Record<ContentStage, StateDef> = {
  idea: ['Idea', 'sparkles', 'mute'],
  drafting: ['Drafting', 'edit', 'ink'],
  review: ['In review', 'search', 'warn'],
  revision: ['Revision requested', 'undo', 'warn'],
  approved: ['Approved', 'check', 'green'],
  scheduled: ['Scheduled', 'calendar', 'ink'],
  published: ['Published', 'globe', 'green'],
  cancelled: ['Canceled', 'close', 'mute'],
  archived: ['Archived', 'archive', 'mute'],
};
export const CORDER: ContentStage[] = ['idea', 'drafting', 'review', 'revision', 'approved', 'scheduled', 'published'];
export const IT: Record<ItStage, StateDef> = {
  new: ['New', 'circle', 'ink2'],
  triaged: ['Triaged', 'flag', 'ink'],
  working: ['Working', 'clock', 'ink'],
  waiting: ['Waiting', 'hand', 'warn'],
  resolved: ['Resolved, waiting for you to confirm', 'check', 'warn'],
  closed: ['Closed, confirmed solved', 'check', 'green'],
  reopened: ['Reopened', 'undo', 'danger'],
  cancelled: ['Canceled', 'close', 'mute'],
};
export const ITYPE: Record<ItType, string> = {
  access: 'Account or access',
  bug: 'Website or tool problem',
  change: 'Change to a tool or the website',
};
export const PRIO: Record<Priority, string> = { low: 'Low', medium: 'Medium', high: 'High' };
export const IMPACT: Record<ItRequest['impact'], string> = {
  one: 'Only me',
  team: 'My team',
  all: 'Everyone or the public',
};
export const BST: Record<BriefState, StateDef> = {
  submitted: ['Submitted', 'upload', 'ink2'],
  accepted: ['Accepted', 'check', 'green'],
  returned: ['Returned', 'undo', 'warn'],
  cancelled: ['Canceled', 'close', 'mute'],
};
export const ACST: Record<'verified' | 'unverified' | 'unknown', StateDef> = {
  verified: ['Custodian verified', 'check', 'green'],
  unverified: ['Not verified recently', 'clock', 'warn'],
  unknown: ['Custodian unknown', 'warning', 'danger'],
};

// ---------- grants and who sees what ----------
export const mg = (db: Workspace, g: McGrant, id: PersonId | undefined) =>
  !!id && (mcitOf(db).grants[g] as PersonId[] | undefined)?.includes(id) === true;
export const mcIn = (p: Person | undefined) => !!p && p.div === MC;
export const mcFull = (p: Person | undefined) => mcIn(p) || isTopP(p) || isBoardP(p);
export const mcLead = (p: Person | undefined) => !!p && ((p.div === MC && rank(p) >= 2) || p.admin);
export const canMakeContent = (db: Workspace, p: Person | undefined) =>
  mcLead(p) || mg(db, 'review', p?.id) || mg(db, 'publish', p?.id);
export const canSeeIt = (x: ItRequest, m: Person | undefined) =>
  !!m && (mcFull(m) || x.requester === m.id || x.createdBy === m.id || unitLead(m, x.unit));
export const canSeeBrief = (x: Brief, m: Person | undefined) =>
  !!m && (mcFull(m) || x.requester === m.id || x.createdBy === m.id || unitLead(m, x.unit));
export const itPriv = (db: Workspace, m: Person | undefined) => mg(db, 'triage', m?.id) || mg(db, 'tech', m?.id);
export const seeAcc = (a: Account, m: Person | undefined) =>
  !a.hidden || (!!m && (m.admin || (mcIn(m) && rank(m) >= 3)));

// ---------- lookups ----------
export const ctOf = (db: Workspace, id: string | null | undefined) => mcitOf(db).content.find((x) => x.id === id);
export const cmpOf = (db: Workspace, id: string | null | undefined) => mcitOf(db).campaigns.find((x) => x.id === id);
export const itOf = (db: Workspace, id: string | null | undefined) => mcitOf(db).it.find((x) => x.id === id);
export const brOf = (db: Workspace, id: string | null | undefined) => mcitOf(db).briefs.find((x) => x.id === id);
export const accOf = (db: Workspace, id: string | null | undefined) => mcitOf(db).accounts.find((x) => x.id === id);
export const cLatest = (c: Content) => c.versions[c.versions.length - 1];
/** The approved version is no longer the latest one (marketing_stale_approval). */
export const stale = (c: Content) => !!c.approvedV && (cLatest(c)?.v ?? 0) > c.approvedV;
export const pubCount = (c: Content) => c.channels.filter((ch) => ch.pub).length;

// ---------- secrets never enter ordinary records (integration-credentials, resource_secret_links) ----------
const SECRET = /(password|passwd|kata ?sandi|pwd|otp|token|api[ _-]?key|secret|recovery code)\s*[:=]\s*\S+/i;
export const hasSecret = (...vals: (string | null | undefined)[]) => vals.some((v) => SECRET.test(v ?? ''));
export const accState = (a: Account, today: DateStr): 'verified' | 'unverified' | 'unknown' =>
  !a.custodian ? 'unknown' : !a.verifiedAt || daysBetween(a.verifiedAt, today) > 90 ? 'unverified' : 'verified';
