/* External Engagement data: relationships (one record per organization), contacts, interactions, follow-ups (canonical tasks
   linked here), opportunities with proposal versions, and the shared handoff to Consulting. Stored in db.ee. From
   divisions/div-ee-cons.js (seedEe, state lists, lookups). Stage names and gates are proposals (external_validation is open). */
import type { Draft } from 'immer';
import { isBoard } from '@/lib/roles';
import { rank, visibleDivs } from '@/lib/access';
import type { Tone } from '@/components/ui/StatusBadge';
import type { DateStr, DivisionId, FeatureStore, Person, PersonId, Stamp, Workspace } from '@/types/workspace';

export type StateDef = readonly [label: string, icon: string, tone: Tone];

export type Kind = 'partner' | 'client';
export type RelStage = 'prospect' | 'contacted' | 'discussion' | 'review' | 'active' | 'paused' | 'closed';
export type OppStage =
  | 'identified'
  | 'qualified'
  | 'contacted'
  | 'discussion'
  | 'proposal'
  | 'negotiation'
  | 'pending'
  | 'active'
  | 'hold'
  | 'lost'
  | 'withdrawn';
export type Channel = 'meeting' | 'video' | 'call' | 'whatsapp' | 'email' | 'visit' | 'other';
export type IxOutcome = 'responded' | 'noresponse' | 'attempted' | 'rescheduled';
export type HoState = 'draft' | 'requested' | 'accepted' | 'returned' | 'fulfilled' | 'cancelled';
export type ShareKey = 'brief' | 'need' | 'decision' | 'contactRole' | 'contactDetails' | 'estimate';

export interface Org {
  id: string;
  name: string;
  kinds: Kind[];
  sector: string;
  pic: PersonId | null;
  backup: PersonId | null;
  stage: RelStage;
  source: string;
  aliases: string[];
  createdBy: PersonId;
  at: Stamp;
  reason?: string;
  reviewDate?: DateStr | null;
}

export interface Contact {
  id: string;
  org: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  owner: PersonId;
  use: string;
  archived: boolean;
}

export interface Interaction {
  id: string;
  org: string;
  opp: string | null;
  contact: string | null;
  by: PersonId;
  date: DateStr;
  time: string | null;
  channel: Channel;
  outcome: IxOutcome;
  summary: string;
  evidence: string;
  followup: string | null;
  fromTask: string | null;
  at: Stamp;
}

export interface FollowupLink {
  task: string;
  org: string;
  opp: string | null;
  outcome: string;
  channel: Channel;
}

export interface Postpone {
  task: string;
  from: DateStr | null;
  to: DateStr | null;
  reason: string;
  by: PersonId;
  at: Stamp;
}

export interface Proposal {
  v: number;
  note: string;
  url: string;
  by: PersonId;
  at: Stamp;
  reviewer: PersonId | null;
}

export interface OppWin {
  by: PersonId;
  at: Stamp;
  auth: PersonId;
  note: string;
  evidence: string;
}

export interface OppHistory {
  stage: OppStage;
  by: PersonId;
  at: Stamp;
  reason: string;
}

export interface Opp {
  id: string;
  org: string;
  kind: Kind;
  title: string;
  need: string;
  service: string;
  pic: PersonId | null;
  backup: PersonId | null;
  contact: string | null;
  stage: OppStage;
  nextAction: string;
  nextDate: DateStr | null;
  decision: string;
  estimate: string;
  basis: string;
  confidential: boolean;
  proposals: Proposal[];
  legal: string[];
  handoff: string | null;
  project: string | null;
  win: OppWin | null;
  reason: string;
  reviewDate: DateStr | null;
  createdBy: PersonId;
  at: Stamp;
  history: OppHistory[];
}

export interface HoHistory {
  state: HoState;
  by: PersonId;
  at: Stamp;
  note: string;
}

export interface Handoff {
  id: string;
  opp: string;
  title: string;
  outcome: string;
  from: PersonId;
  toUnit: DivisionId;
  to: PersonId | null;
  briefV: number;
  neededBy: DateStr | null;
  agreedDate: DateStr | null;
  shares: ShareKey[];
  unresolved: string;
  state: HoState;
  project: string | null;
  reply: string;
  action: string;
  createdBy: PersonId;
  at: Stamp;
  sentAt: Stamp | null;
  answeredBy: PersonId | null;
  answeredAt: Stamp | null;
  history: HoHistory[];
}

export interface EeStore extends FeatureStore {
  orgs: Org[];
  contacts: Contact[];
  interactions: Interaction[];
  fu: FollowupLink[];
  postpones: Postpone[];
  opps: Opp[];
  handoffs: Handoff[];
}

const EMPTY: EeStore = {
  v: 1,
  orgs: [],
  contacts: [],
  interactions: [],
  fu: [],
  postpones: [],
  opps: [],
  handoffs: [],
};
const complete = (s: Partial<EeStore> | undefined): s is EeStore => !!s?.orgs && !!s.opps && !!s.handoffs;
export const eeOf = (db: Workspace): EeStore => {
  const s = db.ee as Partial<EeStore> | undefined;
  return complete(s) ? s : EMPTY;
};
export const eeDraft = (db: Draft<Workspace>): EeStore => {
  const s = db.ee as Partial<EeStore> | undefined;
  if (!complete(s))
    db.ee = { ...EMPTY, orgs: [], contacts: [], interactions: [], fu: [], postpones: [], opps: [], handoffs: [] };
  return db.ee as EeStore;
};

// ---------- state lists (icon plus word, never colour alone) ----------
/** Opportunity pipeline (blueprint §5, external_stages): proposed names, pending the EE lead's confirmation. */
export const OPP: Record<OppStage, StateDef> = {
  identified: ['Identified', 'search', 'mute'],
  qualified: ['Qualified', 'check', 'ink2'],
  contacted: ['Contacted', 'bell', 'ink2'],
  discussion: ['Discussion', 'people', 'ink'],
  proposal: ['Proposal', 'file', 'ink'],
  negotiation: ['Negotiation', 'hand', 'warn'],
  pending: ['Agreement pending', 'clock', 'warn'],
  active: ['Won', 'check', 'green'],
  hold: ['On hold', 'hand', 'hold'],
  lost: ['Lost', 'close', 'danger'],
  withdrawn: ['Withdrawn', 'minus', 'mute'],
};
export const OPP_FLOW: OppStage[] = [
  'identified',
  'qualified',
  'contacted',
  'discussion',
  'proposal',
  'negotiation',
  'pending',
  'active',
];
export const OPP_SIDE: OppStage[] = ['hold', 'lost', 'withdrawn'];
/** A won partner opportunity reads "Active partnership". */
export const oppDef = (o: { stage: OppStage; kind: Kind }): StateDef =>
  o.stage === 'active' && o.kind === 'partner' ? ['Active partnership', 'check', 'green'] : OPP[o.stage];

/** Relationship stage on the organization (external_stages). */
export const REL: Record<RelStage, StateDef> = {
  prospect: ['Prospect', 'search', 'mute'],
  contacted: ['Contacted', 'bell', 'ink2'],
  discussion: ['Discussion', 'people', 'ink'],
  review: ['Agreement in review', 'file', 'warn'],
  active: ['Active', 'check', 'green'],
  paused: ['Paused', 'hand', 'hold'],
  closed: ['Closed', 'archive', 'mute'],
};
export const REL_ORDER: RelStage[] = ['prospect', 'contacted', 'discussion', 'review', 'active', 'paused', 'closed'];
export const KIND: Record<Kind, string> = { partner: 'Partner', client: 'Client' };
export const CHANNEL: Record<Channel, string> = {
  meeting: 'Meeting in person',
  video: 'Video call',
  call: 'Phone call',
  whatsapp: 'WhatsApp',
  email: 'Email',
  visit: 'Visit',
  other: 'Other',
};
/** Interaction outcomes are explicit: a completed contact task never means the partnership succeeded (external_no_response). */
export const OUT: Record<IxOutcome, StateDef> = {
  responded: ['Responded', 'check', 'green'],
  noresponse: ['No response', 'minus', 'warn'],
  attempted: ['Attempted', 'clock', 'ink2'],
  rescheduled: ['Rescheduled', 'calendar', 'ink2'],
};
/** Shared handoff contract (blueprint §12): draft, requested, accepted or returned, fulfilled or canceled. */
export const HO: Record<HoState, StateDef> = {
  draft: ['Draft', 'edit', 'mute'],
  requested: ['Requested', 'clock', 'warn'],
  accepted: ['Accepted', 'check', 'ink'],
  returned: ['Returned', 'undo', 'warn'],
  fulfilled: ['Fulfilled', 'check', 'green'],
  cancelled: ['Canceled', 'close', 'mute'],
};
/** Fields a handoff may share with the receiver (external_client_branch acceptance 2). */
export const SHARE: Record<ShareKey, string> = {
  brief: 'Proposal (the version sent)',
  need: 'Client need and requested service',
  decision: 'Decision needed and next action',
  contactRole: 'Contact name and role',
  contactDetails: 'Contact email and phone',
  estimate: 'Budget indication',
};

// ---------- lookups ----------
export const orgOf = (db: Workspace, id: string | null | undefined) => eeOf(db).orgs.find((o) => o.id === id);
export const oppOf = (db: Workspace, id: string | null | undefined) => eeOf(db).opps.find((o) => o.id === id);
export const hoOf = (db: Workspace, id: string | null | undefined) => eeOf(db).handoffs.find((h) => h.id === id);
export const contactOf = (db: Workspace, id: string | null | undefined) => eeOf(db).contacts.find((c) => c.id === id);
const ixSort = (a: Interaction, b: Interaction) => `${b.date}${b.time ?? ''}`.localeCompare(`${a.date}${a.time ?? ''}`);
export const orgIx = (db: Workspace, id: string) =>
  eeOf(db)
    .interactions.filter((i) => i.org === id)
    .sort(ixSort);
export const oppIx = (db: Workspace, id: string) =>
  eeOf(db)
    .interactions.filter((i) => i.opp === id)
    .sort(ixSort);
export const fuOf = (db: Workspace, taskId: string | null | undefined) => eeOf(db).fu.find((x) => x.task === taskId);
export const ixFor = (db: Workspace, taskId: string) => eeOf(db).interactions.find((i) => i.fromTask === taskId);
export const attempts = (db: Workspace, x: FollowupLink) =>
  eeOf(db).interactions.filter((i) => i.followup === x.task || i.fromTask === x.task).length;
export const lastProposal = (o: Opp) => o.proposals[o.proposals.length - 1];

// ---------- who may see and act (proposed until IAM and the EE lead adopt them: access_member_scope, external_directory_privacy) ----------
export const EE: DivisionId = 'ee';
export const CONS: DivisionId = 'cons';
export const rk = (p: Person | undefined) => (p ? rank(p) : 0);
export const lead = (p: Person | undefined, d: DivisionId) => !!p && p.div === d && rk(p) >= 2;
export const director = (p: Person | undefined, d: DivisionId) => !!p && p.div === d && rk(p) >= 3;
/** The branch comes from the member's appointment title; IAM supplies real grants. */
export type Branch = 'client' | 'partner' | 'pa' | 'kn' | 'tnd' | null;
export const branchOf = (p: Person | undefined): Branch => {
  const title = p?.title ?? '';
  return title.includes('Client')
    ? 'client'
    : title.includes('Partner')
      ? 'partner'
      : title.includes('Project Associates')
        ? 'pa'
        : title.includes('Knowledge')
          ? 'kn'
          : title.includes('TnD')
            ? 'tnd'
            : null;
};
export const seeDiv = (p: Person | undefined, d: DivisionId) => !!p && !isBoard(p) && visibleDivs(p).includes(d);
export const eeMember = (m: Person | undefined) => !!m && m.div === EE && !isBoard(m);
interface KindsHolder {
  kinds: Kind[];
  pic: PersonId | null;
  backup: PersonId | null;
}
export const canContact = (o: KindsHolder, m: Person | undefined) =>
  eeMember(m) && (rk(m) >= 2 || o.pic === m?.id || o.backup === m?.id || o.kinds.includes(branchOf(m) as Kind));
export const canConf = (o: { kind: Kind; pic: PersonId | null; backup: PersonId | null }, m: Person | undefined) =>
  eeMember(m) && (rk(m) >= 2 || o.pic === m?.id || o.backup === m?.id || branchOf(m) === o.kind);
export const canStage = (o: { pic: PersonId | null; backup: PersonId | null }, m: Person | undefined) =>
  eeMember(m) && (rk(m) >= 2 || o.pic === m?.id || o.backup === m?.id);

export const activeIds = (db: Workspace, f?: (p: Person) => boolean) =>
  db.people.filter((p) => p.status === 'active' && !isBoard(p) && (!f || f(p))).map((p) => p.id);
export const eeAuthorities = (db: Workspace) => activeIds(db, (p) => p.div === EE && rk(p) >= 2);
export const consReceivers = (db: Workspace) => activeIds(db, (p) => p.div === CONS && rk(p) >= 2);

// ---------- handoff rules (blueprint §12) ----------
export const canSendHo = (db: Workspace, h: Handoff, m: Person | undefined) => {
  const o = oppOf(db, h.opp);
  return !!o && eeMember(m) && (h.from === m?.id || o.pic === m?.id || rk(m) >= 2);
};
export const canAnswerHo = (h: Handoff, m: Person | undefined) =>
  !!m && !isBoard(m) && (h.to === m.id || director(m, h.toUnit));
/** A draft stays with EE until it is sent; the receiving unit sees it from Requested on. */
export const canSeeHo = (h: Handoff, m: Person | undefined) =>
  !!m && !isBoard(m) && (seeDiv(m, EE) || (h.state !== 'draft' && (canAnswerHo(h, m) || lead(m, h.toUnit))));
/** The proposal version that was saved after the receiver answered, or null. */
export const staleHo = (db: Workspace, h: Handoff): number | null => {
  const o = oppOf(db, h.opp);
  const last = o ? lastProposal(o) : undefined;
  return o && last && ['requested', 'accepted'].includes(h.state) && last.v > h.briefV ? last.v : null;
};
