/* Finance & Legal data: legal requests with versions, signatures and numbers, finance requests with payments, incoming client
   terms, allocations, the document register and period reviews. Stored in db.fnl. Money is whole IDR only; paid, outstanding
   and remaining are always derived from the rows, never stored. From divisions/div-fnl-mcit.js (seedFnl, lookups, rules). */
import type { Draft } from 'immer';
import { divisionOf } from '@/app/config/org';
import { rank } from '@/lib/access';
import { t } from '@/lib/i18n';
import { daysBetween, today } from '@/lib/time';
import type { StateDef } from '@/features/external/services/ee-data';
import type { DateStr, DivisionId, FeatureStore, Person, PersonId, Stamp, Workspace } from '@/types/workspace';

export const FNL: DivisionId = 'fnl';
export const TERM = '2026/1';

// ---------- types ----------
export type LegalType = 'PKS' | 'BAST' | 'NDA' | 'SK' | 'LTR' | 'DOC';
export type LegalStage =
  | 'draft'
  | 'submitted'
  | 'info'
  | 'drafting'
  | 'review'
  | 'revision'
  | 'approved'
  | 'awaiting'
  | 'signed'
  | 'registered'
  | 'cancelled'
  | 'rejected';
export type SigState = 'pending' | 'requested' | 'signed' | 'attested' | 'declined';
export type FinState =
  | 'draft'
  | 'submitted'
  | 'review'
  | 'returned'
  | 'approved'
  | 'partial'
  | 'paid'
  | 'reconciled'
  | 'rejected'
  | 'cancelled';
export type IncState =
  'gate' | 'requested' | 'returned' | 'accepted' | 'invoiced' | 'partial' | 'received' | 'cancelled';
export type AllocState = 'proposed' | 'approved' | 'returned';
export type PeriodState = 'open' | 'review' | 'closed';
export type Check = 'unchecked' | 'matched' | 'discrepancy';
export type GrantId =
  | 'legal'
  | 'legalReview'
  | 'issue'
  | 'sign'
  | 'finReview'
  | 'pay'
  | 'allocate'
  | 'budget'
  | 'period'
  | 'periodPrep'
  | 'invoice';

export type Vars = Record<string, string | number>;
export interface HistoryRow {
  by: PersonId;
  at: Stamp;
  what: string;
  v?: Vars | null;
}
export interface Source {
  label: string;
  url: string;
}
export interface LegalVersion {
  v: number;
  label: string;
  url: string;
  by: PersonId;
  at: Stamp;
  decision: { kind: 'approved' | 'revision' | 'rejected'; by: PersonId; at: Stamp; reason: string } | null;
}
export interface Signatory {
  id: string;
  party: string;
  name: string;
  role: string;
  state: SigState;
  evidence: string;
  date: DateStr | null;
  by: PersonId | null;
  at: Stamp | null;
  basis: 'copy' | 'attested' | null;
  note: string;
}
export interface Urgency {
  state: 'requested' | 'approved' | 'declined';
  reason: string;
  by: PersonId;
  at: Stamp;
  decidedBy?: PersonId;
  decidedAt?: Stamp;
  note?: string;
}
export interface LegalRequest {
  id: string;
  type: LegalType;
  title: string;
  purpose: string;
  requester: PersonId;
  unit: DivisionId | null;
  project: string | null;
  opp?: string;
  handoff?: string;
  counterpart: string;
  requiredBy: DateStr;
  owner: PersonId | null;
  reviewer: PersonId | null;
  stage: LegalStage;
  prevStage?: LegalStage;
  confidential: boolean;
  sources: Source[];
  template: string;
  versions: LegalVersion[];
  signatories: Signatory[];
  number: string | null;
  urgency: Urgency | null;
  info: { q: string; by: PersonId; at: Stamp; a: string; aAt: Stamp | null }[];
  priv: { by: PersonId; at: Stamp; text: string }[];
  history: HistoryRow[];
  createdBy: PersonId;
  createdAt: Stamp;
  rejectReason?: string;
  cancel?: { reason: string; by: PersonId; at: Stamp };
  /** A BAST links its PKS and the incoming term it gates (legal_bast_gate). */
  pks?: string;
  invoice?: string;
  gate?: {
    delivery: { url: string; by: PersonId; at: Stamp } | null;
    exception: { by: PersonId; recordedBy: PersonId; at: Stamp; reason: string } | null;
    sent: { by: PersonId; at: Stamp; to: PersonId } | null;
  };
}
export interface Payment {
  id: string;
  req: string;
  kind: 'payment' | 'correction';
  of?: string;
  amount: number;
  date: DateStr;
  ref: string;
  evidence: string;
  by: PersonId;
  at: Stamp;
  note: string;
}
export interface FinanceRequest {
  id: string;
  requester: PersonId;
  unit: DivisionId | null;
  project: string | null;
  alloc: string | null;
  category: string;
  purpose: string;
  requested: number;
  approved: number | null;
  state: FinState;
  payee: string;
  method: string;
  neededBy: DateStr | null;
  evidence: Source[];
  ref: string;
  version: number;
  review: { by: PersonId; at: Stamp; amount: number; version: number; note?: string; decision?: string } | null;
  reviewing?: { by: PersonId; at: Stamp };
  returnNote: string;
  reason: string;
  dup: {
    of: string;
    state: 'flagged' | 'cleared' | 'confirmed';
    by: PersonId | null;
    at: Stamp | null;
    note: string;
  } | null;
  reconciledIn: string | null;
  history: HistoryRow[];
  createdBy: PersonId;
  createdAt: Stamp;
  submittedAt?: Stamp;
}
export interface IncomingTerm {
  id: string;
  title: string;
  client: string;
  project: string | null;
  opp: string | null;
  gateFrom: string;
  pks: string;
  expected: number;
  state: IncState;
  handoff: {
    from: PersonId;
    to: PersonId;
    neededBy: DateStr;
    requestedAt: Stamp;
    version: number | undefined;
    pksVersion: number | null | undefined;
    agreedDate: DateStr | null;
    acceptedAt: Stamp | null;
    returnNote: string;
    exception: string;
  } | null;
  invoiceRef: string;
  invoiceUrl: string;
  issuedOn: DateStr | null;
  due: DateStr | null;
  collector: PersonId;
  receipts: { id: string; amount: number; date: DateStr; ref: string; evidence: string; by: PersonId; at: Stamp }[];
  history: HistoryRow[];
  createdBy: PersonId;
  createdAt: Stamp;
}
export interface Allocation {
  id: string;
  term: string;
  unit: DivisionId;
  project: string | null;
  category: string;
  amount: number;
  state: AllocState;
  source: string;
  approvedBy: PersonId | null;
  approvedAt: Stamp | null;
  history: { amount: number; by: PersonId; at: Stamp; reason: string }[];
  createdBy: PersonId;
  createdAt: Stamp;
  returnNote: string;
}
export interface RegisterEntry {
  id: string;
  seq: number;
  no: string;
  type: string;
  req: string;
  version: number;
  issuedBy: PersonId;
  issuedAt: Stamp;
  state: 'issued' | 'void';
  voidReason: string;
  voidBy: PersonId | null;
  voidAt: Stamp | null;
  reissue: string | null;
  replaces: string | null;
  provisional: boolean;
}
export interface Period {
  id: string;
  name: string;
  from: DateStr;
  to: DateStr;
  project: string | null;
  state: PeriodState;
  preparedBy: PersonId;
  reviewer: PersonId;
  bank: 'done' | 'incomplete';
  bankBy?: PersonId;
  bankAt?: Stamp;
  checks: Record<string, Check>;
  discrepancies?: Record<string, { action: string; owner: PersonId; by: PersonId; at: Stamp }>;
  snapshots: {
    v: number;
    at: Stamp;
    by: PersonId;
    totals: { alloc: number; committed: number; paid: number; outstanding: number };
    ids: string[];
    note: string;
  }[];
  unresolved: {
    id: string;
    row?: string;
    text: string;
    owner: PersonId;
    due: DateStr | null;
    state: 'open' | 'done';
    doneBy?: PersonId;
    doneAt?: Stamp;
  }[];
  closedBy?: PersonId;
  closedAt?: Stamp;
  createdBy: PersonId;
  createdAt: Stamp;
}
export interface FnlPolicy {
  format: string;
  adopted: boolean;
  leadAdopted: boolean;
  leadAgreement: number;
  leadOther: number;
  selfApproval: string;
  basis: string;
  capAtApproved: boolean;
}
export interface FnlStore extends FeatureStore {
  grants: Record<GrantId, PersonId[]>;
  policy: FnlPolicy;
  legal: LegalRequest[];
  register: RegisterEntry[];
  allocations: Allocation[];
  requests: FinanceRequest[];
  payments: Payment[];
  incoming: IncomingTerm[];
  periods: Period[];
  drafts: Record<PersonId, Record<string, Record<string, unknown>>>;
}

const complete = (s: Partial<FnlStore> | undefined): s is FnlStore => !!s?.legal && !!s.requests && !!s.grants;
const EMPTY = (): FnlStore => ({
  v: 1,
  grants: {} as FnlStore['grants'],
  policy: {
    format: '',
    adopted: false,
    leadAdopted: false,
    leadAgreement: 3,
    leadOther: 2,
    selfApproval: 'deny',
    basis: 'total-approved',
    capAtApproved: true,
  },
  legal: [],
  register: [],
  allocations: [],
  requests: [],
  payments: [],
  incoming: [],
  periods: [],
  drafts: {},
});
const EMPTY_STORE = EMPTY();
export const fnlOf = (db: Workspace): FnlStore => {
  const s = db.fnl as Partial<FnlStore> | undefined;
  return complete(s) ? s : EMPTY_STORE;
};
export const fnlDraft = (db: Draft<Workspace>): FnlStore => {
  const s = db.fnl as Partial<FnlStore> | undefined;
  if (!complete(s)) db.fnl = EMPTY();
  return db.fnl as FnlStore;
};

// ---------- state lists ----------
export const LTYPE: Record<LegalType, [label: string, code: string]> = {
  PKS: ['Cooperation agreement (PKS)', 'PKS'],
  BAST: ['Handover record (BAST)', 'BAST'],
  NDA: ['Non-disclosure agreement', 'NDA'],
  SK: ['Decree (SK)', 'SK'],
  LTR: ['Letter', 'LTR'],
  DOC: ['Other document', 'DOC'],
};
export const AGREEMENT: LegalType[] = ['PKS', 'BAST', 'NDA'];
/** legal_pipeline (proposed): draft, submitted, triaged, drafting, in review, revision, approved, awaiting signature, signed, registered. */
export const LST: Record<LegalStage, StateDef> = {
  draft: ['Draft', 'edit', 'mute'],
  submitted: ['Submitted', 'upload', 'ink2'],
  info: ['Waiting for information', 'info', 'warn'],
  drafting: ['Drafting', 'edit', 'ink'],
  review: ['In review', 'search', 'warn'],
  revision: ['Revision requested', 'undo', 'warn'],
  approved: ['Approved for signature', 'check', 'green'],
  awaiting: ['Awaiting signatures', 'clock', 'warn'],
  signed: ['Signed', 'check', 'green'],
  registered: ['Registered', 'archive', 'ink2'],
  cancelled: ['Canceled', 'close', 'mute'],
  rejected: ['Rejected', 'close', 'danger'],
};
export const LSTEPS = [
  'Submitted',
  'Triaged',
  'Drafting',
  'In review',
  'Approved for signature',
  'Awaiting signatures',
  'Signed',
  'Registered',
];
export const LSTEP_I: Partial<Record<LegalStage, number>> = {
  draft: -1,
  submitted: 0,
  info: 0,
  drafting: 2,
  revision: 2,
  review: 3,
  approved: 4,
  awaiting: 5,
  signed: 6,
  registered: 7,
};
export const SIG: Record<SigState, StateDef> = {
  pending: ['Not sent yet', 'circle', 'mute'],
  requested: ['Awaiting signature', 'clock', 'warn'],
  signed: ['Signed copy recorded', 'check', 'green'],
  attested: ['Attested, not verified', 'info', 'ink2'],
  declined: ['Declined', 'close', 'danger'],
};
/** finance_request (proposed): draft, submitted, under review, approved or rejected, partly paid or paid, reconciled. */
export const FST: Record<FinState, StateDef> = {
  draft: ['Draft', 'edit', 'mute'],
  submitted: ['Submitted', 'upload', 'ink2'],
  review: ['Under review', 'search', 'warn'],
  returned: ['Returned for information', 'undo', 'warn'],
  approved: ['Approved, not paid', 'check', 'ink'],
  partial: ['Partially paid', 'wallet', 'warn'],
  paid: ['Paid', 'wallet', 'green'],
  reconciled: ['Reconciled', 'check', 'green'],
  rejected: ['Rejected', 'close', 'danger'],
  cancelled: ['Canceled', 'close', 'mute'],
};
export const FSTEPS = ['Submitted', 'Under review', 'Approved', 'Paid', 'Reconciled'];
export const FSTEP_I: Partial<Record<FinState, number>> = {
  draft: -1,
  submitted: 0,
  returned: 0,
  review: 1,
  approved: 2,
  partial: 3,
  paid: 4,
  reconciled: 5,
};
export const AST: Record<AllocState, StateDef> = {
  proposed: ['Waiting for approval', 'clock', 'warn'],
  approved: ['Approved', 'check', 'green'],
  returned: ['Returned', 'undo', 'warn'],
};
/** Incoming client terms (finance_incoming_terms, P1): a separate basis from outgoing spending. */
export const IST: Record<IncState, StateDef> = {
  gate: ['Waiting for the legal gate', 'lock', 'mute'],
  requested: ['Handoff requested', 'upload', 'warn'],
  returned: ['Returned to Legal', 'undo', 'warn'],
  accepted: ['Accepted by Finance', 'check', 'ink'],
  invoiced: ['Invoice issued outside the app', 'file', 'ink'],
  partial: ['Partly received', 'wallet', 'warn'],
  received: ['Received', 'wallet', 'green'],
  cancelled: ['Canceled', 'close', 'mute'],
};
export const PST: Record<PeriodState, StateDef> = {
  open: ['Open', 'circle', 'ink'],
  review: ['In review', 'search', 'warn'],
  closed: ['Closed with snapshot', 'archive', 'green'],
};
export const RCK: Record<Check, StateDef> = {
  unchecked: ['Not checked', 'circle', 'mute'],
  matched: ['Matches evidence', 'check', 'green'],
  discrepancy: ['Discrepancy', 'warning', 'danger'],
};
export const CATS = ['Operations', 'Events', 'Printing', 'Tools and hosting', 'Transport', 'Consumption'];
export const GRANT_LABEL: Record<string, string> = {
  legal: 'Legal triage and drafting',
  legalReview: 'Legal review',
  issue: 'Document numbering',
  sign: 'Signature recording',
  finReview: 'Finance approval',
  pay: 'Payment recording',
  allocate: 'Allocation proposals',
  budget: 'Allocation approval',
  period: 'Period review',
  periodPrep: 'Period preparation',
  invoice: 'Incoming terms',
  review: 'Content review',
  publish: 'Publication recording',
  triage: 'IT triage',
  tech: 'IT technician',
  custody: 'Account custody',
};

// ---------- money (integer IDR only, finance_validation, data_money) ----------
export const fmtN = (n: number) =>
  Math.abs(Math.round(n))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
export const idrT = (n: number) => `Rp ${n < 0 ? '−' : ''}${fmtN(n)}`;
/** Accepts "90000", "90.000" or "Rp 90.000". Negative, decimal (comma) and empty values are rejected, never rounded. */
export const parseIdr = (s: string): number => {
  const x = s
    .trim()
    .replace(/^rp\s*/i, '')
    .replace(/\./g, '')
    .replace(/\s/g, '');
  return /^\d+$/.test(x) ? +x : NaN;
};
export const safeUrl = (u: string | null | undefined) => /^https:\/\/[^\s]+$/i.test(u ?? '');
export const okDate = (d: string | null | undefined) => /^\d{4}-\d{2}-\d{2}$/.test(d ?? '');
/** Paid-on, issued-on and received-on dates record something that already happened, so tomorrow or later is refused. */
export const isFutureDate = (d: string) => d > today();

// ---------- grants and who sees what (proposed until POL adopts access_finance_policy and access_legal_policy) ----------
export const isTopP = (p: Person | undefined) => !!p && (p.role === 'president' || p.role === 'vp' || p.admin);
export const isBoardP = (p: Person | undefined) => !!p && p.role === 'board';
export const unitLead = (p: Person | undefined, unit: DivisionId | null | undefined) =>
  !!p && !!unit && p.div === unit && rank(p) >= 2;
export const unitName = (u: DivisionId | null | undefined) =>
  (u ? (divisionOf(u)?.short ?? '') : '') || t('Organization');
export const grant = (db: Workspace, g: GrantId, id: PersonId | undefined) =>
  !!id && (fnlOf(db).grants[g] as PersonId[] | undefined)?.includes(id) === true;
export const fnlIn = (p: Person | undefined) => !!p && p.div === FNL;
export const fnlFull = (p: Person | undefined) => fnlIn(p) || isTopP(p);

// ---------- lookups and derived values ----------
export const lrOf = (db: Workspace, id: string | null | undefined) => fnlOf(db).legal.find((x) => x.id === id);
export const frOf = (db: Workspace, id: string | null | undefined) => fnlOf(db).requests.find((x) => x.id === id);
export const invOf = (db: Workspace, id: string | null | undefined) => fnlOf(db).incoming.find((x) => x.id === id);
export const rgOf = (db: Workspace, id: string | null | undefined) => fnlOf(db).register.find((x) => x.id === id);
export const alOf = (db: Workspace, id: string | null | undefined) => fnlOf(db).allocations.find((x) => x.id === id);
export const prOf = (db: Workspace, id: string | null | undefined) => fnlOf(db).periods.find((x) => x.id === id);
export const paysOf = (db: Workspace, fr: FinanceRequest) => fnlOf(db).payments.filter((p) => p.req === fr.id);
/** Corrections carry a signed amount and point at the original (finance_adjustments). */
export const netPaid = (db: Workspace, fr: FinanceRequest) => paysOf(db, fr).reduce((s, p) => s + p.amount, 0);
export const COMMIT: FinState[] = ['approved', 'partial', 'paid', 'reconciled'];
/** Total-approved basis (finance_comparisons, proposed). */
export const commit = (fr: FinanceRequest) => (COMMIT.includes(fr.state) ? (fr.approved ?? 0) : 0);
export const owed = (db: Workspace, fr: FinanceRequest) => (commit(fr) ? commit(fr) - netPaid(db, fr) : 0);
export function alStats(db: Workspace, al: Allocation) {
  const rs = fnlOf(db).requests.filter((r) => r.alloc === al.id);
  const c = rs.reduce((s, r) => s + commit(r), 0);
  const p = rs.reduce((s, r) => s + (commit(r) ? netPaid(db, r) : 0), 0);
  return {
    reqs: rs,
    committed: c,
    paid: p,
    outstanding: c - p,
    remaining: al.state === 'approved' ? al.amount - c : null,
  };
}
/** Why a finance request cannot be approved for this amount, or null. It needs an approved budget line with enough left. */
export function approvalBlock(db: Workspace, fr: FinanceRequest, amt: number): string | null {
  const al = alOf(db, fr.alloc);
  if (al?.state !== 'approved') return t('This request has no approved budget line. Link one first.');
  const rem = alStats(db, al).remaining;
  if (rem != null && amt > rem)
    return t(
      'Above the remaining allocation of {r}. Amend the allocation first; going over is an exception POL has not defined.',
      { r: idrT(rem) },
    );
  return null;
}
export const alName = (db: Workspace, al: Allocation | undefined) =>
  al
    ? `${unitName(al.unit)} · ${t(al.category)}${al.project ? ` · ${db.projects.find((p) => p.id === al.project)?.name ?? ''}` : ''}`
    : t('No budget line');
export const latestV = (x: LegalRequest) => x.versions[x.versions.length - 1];
export const liveNo = (db: Workspace, x: LegalRequest) => {
  const r = x.number ? rgOf(db, x.number) : undefined;
  return r?.state === 'issued' ? r : null;
};
export const sigDone = (s: Signatory) => s.state === 'signed' || s.state === 'attested';
export const allSigned = (x: LegalRequest) => x.signatories.length > 0 && x.signatories.every(sigDone);
export const canSeeL = (x: LegalRequest, m: Person | undefined) =>
  !!m && !isBoardP(m) && (fnlFull(m) || x.requester === m.id || x.createdBy === m.id || unitLead(m, x.unit));
export const isReqL = (x: LegalRequest, m: Person | undefined) => !!m && (x.requester === m.id || x.createdBy === m.id);
export const lPriv = (db: Workspace, m: Person | undefined) =>
  grant(db, 'legal', m?.id) || grant(db, 'legalReview', m?.id);
export const canSeeF = (x: FinanceRequest, m: Person | undefined) =>
  !!m && !isBoardP(m) && (fnlFull(m) || x.requester === m.id);
/** The payee and the evidence are restricted (security_finance). */
export const fPriv = (db: Workspace, x: FinanceRequest, m: Person | undefined) =>
  x.requester === m?.id || grant(db, 'finReview', m?.id) || grant(db, 'pay', m?.id);
export const leadNeed = (db: Workspace, x: LegalRequest) =>
  AGREEMENT.includes(x.type) ? fnlOf(db).policy.leadAgreement : fnlOf(db).policy.leadOther;
export const daysLeft = (x: LegalRequest) => daysBetween(today(), x.requiredBy);
export const shortNotice = (db: Workspace, x: LegalRequest) =>
  !['signed', 'registered', 'cancelled', 'rejected'].includes(x.stage) &&
  daysBetween(x.createdAt.slice(0, 10), x.requiredBy) < leadNeed(db, x);

/** PKS → BAST → invoice gate (legal_bast_gate): each check is read from its own record, never from a percentage. */
export function gateOf(db: Workspace, x: LegalRequest) {
  const pks = lrOf(db, x.pks);
  const del = x.gate?.delivery ?? null;
  return {
    pks,
    pksOk: !!pks && ['signed', 'registered'].includes(pks.stage),
    bastOk: ['signed', 'registered'].includes(x.stage) && allSigned(x),
    del,
    ok:
      !!pks &&
      ['signed', 'registered'].includes(pks.stage) &&
      ['signed', 'registered'].includes(x.stage) &&
      allSigned(x) &&
      !!del,
    exception: x.gate?.exception ?? null,
  };
}

// ---------- period totals ----------
export const inPeriod = (p: Period, d: DateStr) => d >= p.from && d <= p.to;
export const periodRows = (db: Workspace, p: Period) => fnlOf(db).payments.filter((x) => inPeriod(p, x.date));
export function periodTotals(db: Workspace, p: Period) {
  const s = fnlOf(db);
  const ids = new Set([
    ...periodRows(db, p).map((x) => x.req),
    ...s.requests
      .filter(
        (r) =>
          r.review &&
          r.review.decision !== 'rejected' &&
          COMMIT.includes(r.state) &&
          inPeriod(p, r.review.at.slice(0, 10)),
      )
      .map((r) => r.id),
  ]);
  const rs = [...ids].map((id) => frOf(db, id)).filter((r): r is FinanceRequest => !!r);
  const committed = rs.reduce((a, r) => a + commit(r), 0);
  const paid = rs.reduce(
    (a, r) =>
      a +
      paysOf(db, r)
        .filter((x) => x.date <= p.to)
        .reduce((q, x) => q + x.amount, 0),
    0,
  );
  const alloc = s.allocations
    .filter((a) => a.state === 'approved' && a.approvedAt && a.approvedAt.slice(0, 10) <= p.to)
    .reduce((a, x) => a + x.amount, 0);
  return { alloc, committed, paid, outstanding: committed - paid, reqs: rs };
}
