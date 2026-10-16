/* The account lifecycle records (db.acct): invitations, dated role grants, division memberships, applied account actions,
   presidency handovers and the restricted audit log. People, tasks and offers are reused by id, never copied. The store is
   created from the people on first use. From screens/accounts.js seedAcct and its state tables. */
import { t } from '@/lib/i18n';
import { D, dShort, today } from '@/lib/time';
import { ROLES, divisionOf } from '@/app/config/org';
import { isBoard } from '@/lib/roles';
import type { Tone } from '@/components/ui/StatusBadge';
import type { DateStr, DivisionId, Person, PersonId, RoleId, Stamp, Workspace } from '@/types/workspace';

export interface AcctHistory {
  at: Stamp;
  by: PersonId;
  verb: string;
  note: string;
}

export type InviteState = 'pending' | 'accepted' | 'active' | 'revoked' | 'declined';

export interface Invite {
  id: string;
  name: string;
  email: string;
  div: DivisionId | null;
  role: RoleId;
  batch: string;
  expires: DateStr;
  state: InviteState;
  person: PersonId | null;
  delivery: { by: PersonId; at: Stamp } | null;
  createdBy: PersonId;
  createdAt: Stamp;
  acceptedAt: Stamp | null;
  acceptedAs: string | null;
  approvedBy: PersonId | null;
  approvedAt: Stamp | null;
  revokedBy: PersonId | null;
  revokedAt: Stamp | null;
  reason: string;
  version: number;
  history: AcctHistory[];
}

export type GrantState = 'active' | 'ended' | 'scheduled' | 'reversed';

export interface Grant {
  id: string;
  person: PersonId;
  role: RoleId | 'admin';
  unit: DivisionId | null;
  title: string;
  from: DateStr | null;
  to: DateStr | null;
  by: PersonId | null;
  at: Stamp | null;
  reason: string;
  predecessor: PersonId | null;
  state: GrantState;
}

export interface Membership {
  id: string;
  person: PersonId;
  div: DivisionId;
  from: DateStr | null;
  to: DateStr | null;
  by: PersonId | null;
}

export type ActionKind = 'transfer' | 'pause' | 'left' | 'alumni';

export interface AcctAction {
  id: string;
  kind: ActionKind;
  person: PersonId;
  from: DivisionId | null;
  to: DivisionId | null;
  effective: DateStr;
  reason: string;
  review: DateStr | null;
  map: Record<string, string>;
  offers: string[];
  by: PersonId;
  at: Stamp;
  state: 'applied' | 'reversed';
  ms?: string;
  restoredBy?: PersonId;
  restoredAt?: Stamp;
}

export type HandoverState = 'nominated' | 'accepted' | 'declined' | 'confirmed' | 'cancelled' | 'superseded';

export interface Handover {
  id: string;
  kind: 'normal' | 'recovery';
  from: PersonId;
  to: PersonId;
  state: HandoverState;
  effective: DateStr;
  after: DivisionId | '';
  note: string;
  ist: string | null;
  reason: string;
  ev: string;
  version: number;
  createdBy: PersonId;
  createdAt: Stamp;
  answeredAt: Stamp | null;
  reply?: string;
  confirmedBy?: PersonId;
  confirmedAt?: Stamp;
}

export interface AuditEntry {
  id: string;
  at: Stamp;
  actor: PersonId | null;
  person: PersonId | null;
  name: string;
  verb: string;
  reason: string;
  ref?: string;
  detail?: string;
}

export interface AcctStore {
  v: 1;
  invites: Invite[];
  grants: Grant[];
  memberships: Membership[];
  actions: AcctAction[];
  handovers: Handover[];
  log: AuditEntry[];
  office: { version: number };
  hidden: { id: string; label: string }[];
}

/** The store built from the people when none exists yet: role grants "recorded at setup" and current memberships. */
export function seedAcct(db: Workspace): AcctStore {
  const ppl = db.people.filter((p) => p.status === 'active' && !isBoard(p));
  const grants: Grant[] = [
    ...ppl
      .filter((p) => ['president', 'vp', 'director', 'codirector'].includes(p.role))
      .map((p) => ({
        id: `g-${p.id}`,
        person: p.id,
        role: p.role,
        unit: p.div,
        title: p.title,
        from: p.joined ?? null,
        to: null,
        by: null,
        at: null,
        reason: '',
        predecessor: null,
        state: 'active' as const,
      })),
    ...ppl
      .filter((p) => p.admin)
      .map((p) => ({
        id: `g-admin-${p.id}`,
        person: p.id,
        role: 'admin' as const,
        unit: null,
        title: '',
        from: p.joined ?? null,
        to: null,
        by: null,
        at: null,
        reason: '',
        predecessor: null,
        state: 'active' as const,
      })),
  ];
  const memberships: Membership[] = ppl
    .filter((p): p is Person & { div: DivisionId } => !!p.div)
    .map((p) => ({ id: `ms-${p.id}`, person: p.id, div: p.div, from: p.joined ?? null, to: null, by: null }));
  return {
    v: 1,
    invites: [],
    grants,
    memberships,
    actions: [],
    handovers: [],
    log: [],
    office: { version: 1 },
    hidden: [{ id: 'it-ops', label: 'IT operations account' }],
  };
}

/** Reads the store (or the one the people imply). */
export const acctOf = (db: Workspace): AcctStore => {
  const a = db.acct as Partial<AcctStore> | undefined;
  return a?.v === 1 ? (a as AcctStore) : seedAcct(db);
};

/** The store inside an action's draft, created on first use. */
export const acctDraft = (db: { acct?: unknown; people: Person[] } & Record<string, unknown>): AcctStore => {
  const a = db.acct as Partial<AcctStore> | undefined;
  if (a?.v !== 1) db.acct = seedAcct(db as unknown as Workspace);
  return db.acct as AcctStore;
};

export const mailOf = (p: Person) =>
  p.email ??
  `${p.name
    .toLowerCase()
    .replace(/[^a-z ]/g, '')
    .trim()
    .replace(/\s+/g, '.')}@students.uii.ac.id`;

/** A pending invitation past its date reads as expired. */
export const invState = (i: Invite): InviteState | 'expired' =>
  i.state === 'pending' && i.expires < today() ? 'expired' : i.state;

export const admins = (db: Workspace) => db.people.filter((p) => p.admin && p.status === 'active');
export const presidentOf = (db: Workspace) =>
  db.people.find((p) => p.role === 'president' && p.status !== 'left' && p.status !== 'alumni');
export const openHandover = (db: Workspace) =>
  acctOf(db).handovers.find((h) => h.state === 'nominated' || h.state === 'accepted');

type Def = [label: string, icon: string, tone: Tone];

export const ACC_ST: Record<string, Def> = {
  active: ['Active', 'check', 'green'],
  pending: ['Waiting for approval', 'clock', 'warn'],
  suspended: ['Access paused', 'lock', 'danger'],
  left: ['Left DWDG', 'logout', 'mute'],
  alumni: ['Alumni', 'archive', 'ink2'],
  declined: ['Not approved', 'close', 'mute'],
};
export const accDef = (status: string): Def => ACC_ST[status] ?? ['Unknown', 'circle', 'mute'];

export const INV_ST: Record<string, Def> = {
  pending: ['Not accepted yet', 'clock', 'ink2'],
  accepted: ['Accepted, waiting for approval', 'clock', 'warn'],
  active: ['Member is active', 'check', 'green'],
  expired: ['Expired', 'circle', 'mute'],
  revoked: ['Revoked', 'close', 'mute'],
  declined: ['Not approved', 'close', 'danger'],
};
export const GRANT_ST: Record<GrantState, Def> = {
  active: ['Current', 'check', 'green'],
  ended: ['Ended', 'minus', 'mute'],
  scheduled: ['Scheduled', 'calendar', 'ink2'],
  reversed: ['Reversed', 'undo', 'mute'],
};
export const HO_ST: Record<HandoverState, Def> = {
  nominated: ['Waiting for the successor', 'clock', 'ink2'],
  accepted: ['Accepted, waiting for confirmation', 'clock', 'warn'],
  declined: ['Declined', 'close', 'mute'],
  confirmed: ['Completed', 'check', 'green'],
  cancelled: ['Canceled', 'close', 'mute'],
  superseded: ['Out of date', 'warning', 'mute'],
};

/** "Director of SnG", the grant's own title, or the plain role name. */
export const grantName = (g: Grant) =>
  g.role === 'admin'
    ? t('Admin')
    : g.title
      ? t(g.title)
      : g.unit
        ? t('{r} of {d}', { r: t(ROLES[g.role].label), d: divisionOf(g.unit)?.short ?? '' })
        : t(ROLES[g.role].label);

/** "6 Oct 2026". */
export const fmtD = (s: DateStr | null | undefined) => (s ? `${dShort(s)} ${D(s).getFullYear()}` : '');

/** A member who was approved through an invitation but has not seen the welcome page yet. */
export const needsWelcome = (db: Workspace, p: Person | undefined) =>
  !!p &&
  p.status === 'active' &&
  !p.welcomedAt &&
  acctOf(db).invites.some((i) => i.person === p.id && i.state === 'active');
