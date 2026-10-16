/* Who may do what with accounts (access_action_matrix, DATA_OWNERSHIP_AUTHORITY §4). One check per action returns the reason
   when it is refused. S008: the target's highest effective authority counts, so a Director or VP can never pause the Admin
   through a division title (access_isolation_rank). From screens/accounts.js. */
import { DIVS, ROLES, divisionOf } from '@/app/config/org';
import { rank } from '@/lib/access';
import { t } from '@/lib/i18n';
import { baseRank, hrLead, isAdmin, isBoard, isPres, isVP, wideView } from '@/lib/roles';
import type { DivisionId, Person, Workspace } from '@/types/workspace';
import { openHandover } from './acct-data';

/** Roster reviewer: Admin or an HR Director/Co-Director (hr_roster_change owner HR/Admin). Which HR people hold it is proposed. */
export const reviewer = (p: Person | undefined) => isAdmin(p) || hrLead(p);

const allDivs = (): DivisionId[] => DIVS.map((d) => d.id);

/** Current structure: one VP over all six divisions (blueprint §1-2). */
export const reportDivs = (p: Person | undefined): DivisionId[] =>
  isAdmin(p) || isPres(p) || isVP(p) ? allDivs() : p?.role === 'director' && p.div ? [p.div] : [];

export const canMembers = (p: Person | undefined) => !!p && !isBoard(p) && (wideView(p) || p.role === 'director');
export const inView = (m: Person, p: Person) => wideView(m) || (!!p.div && p.div === m.div);
export const canInvView = (p: Person | undefined) => !!p && !isBoard(p) && (reviewer(p) || isPres(p) || isVP(p));
export const canApptView = canMembers;
export const canHoView = (db: Workspace, p: Person | undefined) =>
  !!p && !isBoard(p) && (isAdmin(p) || isPres(p) || isVP(p) || openHandover(db)?.to === p.id);
export const canAudit = (p: Person | undefined) => isAdmin(p) || isPres(p);

export const authority = (p: Person) => (p.admin ? t('the Admin grant') : t(ROLES[p.role].label));

/** Reasons (the "why" of a pause or an appointment) reach the Admin, the President, HR leads and the actor. */
export const canReason = (m: Person | undefined, actor?: string | null) =>
  isAdmin(m) || isPres(m) || hrLead(m) || (!!actor && actor === m?.id);

export type ActionRule = { ok: true } | { ok: false; why: string };
const no = (why: string): ActionRule => ({ ok: false, why });

export function can(
  kind: 'transfer' | 'pause' | 'restore' | 'leave',
  m: Person | undefined,
  p: Person | undefined,
): ActionRule {
  if (!m || !p) return no(t('Not available.'));
  if (isBoard(m)) return no(t('Board accounts are read-only.'));
  if (p.id === m.id) return no(t('You can’t do this to your own account.'));
  if (kind === 'transfer') {
    if (!reviewer(m)) return no(t('HR leads and the Admin move members between divisions.'));
    if (p.status !== 'active') return no(t('Only active members can be moved.'));
    if (p.admin || baseRank(p) >= 2 || !p.div)
      return no(t('{who} holds a role. Role holders change through an appointment, not a transfer.', { who: p.first }));
    return { ok: true };
  }
  if (kind === 'pause' || kind === 'restore') {
    if (kind === 'pause' && p.status !== 'active') return no(t('Only active accounts can be paused.'));
    if (kind === 'restore' && p.status !== 'suspended') return no(t('This account is not paused.'));
    if (rank(m) < 3) return no(t('Directors and above pause or restore access.'));
    if (rank(p) > rank(m))
      return no(
        t('{who} holds {role}, which is above you. Nobody can pause someone with higher authority.', {
          who: p.first,
          role: authority(p),
        }),
      );
    if (rank(p) === rank(m))
      return no(
        t(
          'Same rank. Whether equals can pause each other is not decided yet, so the President or the Admin does this.',
        ),
      );
    if (!isAdmin(m) && !isPres(m) && !(p.div && reportDivs(m).includes(p.div)))
      return no(t('{who} is outside your reporting scope. The President or the Admin can do this.', { who: p.first }));
    return { ok: true };
  }
  if (!reviewer(m)) return no(t('HR leads and the Admin end memberships.'));
  if (!['active', 'suspended'].includes(p.status)) return no(t('This membership has already ended.'));
  if (isPres(p)) return no(t('The President leaves office through a presidency handover first.'));
  if (p.admin) return no(t('The Admin grant needs an agreed successor first. That rule is not decided yet.'));
  if (!isAdmin(m) && rank(p) >= rank(m))
    return no(
      t('{who} holds {role}. You can only end memberships below your own rank.', { who: p.first, role: authority(p) }),
    );
  return { ok: true };
}

// ---------- appointments (access_appointments, S006, entity_role) ----------
export interface Office {
  k: string;
  role: 'vp' | 'director' | 'codirector';
  unit: DivisionId | null;
  label: string;
}

/** An office key: `vp`, `dir:<division>` or `cd:<division>`. */
export function officeOf(k: string): Office {
  if (k === 'vp') return { k, role: 'vp', unit: null, label: t('Vice President') };
  const [kind, unit = ''] = k.split(':');
  const d = divisionOf(unit);
  return {
    k,
    role: kind === 'dir' ? 'director' : 'codirector',
    unit: d?.id ?? null,
    label: t(kind === 'dir' ? 'Director of {d}' : 'Co-Director of {d}', { d: d?.short ?? '' }),
  };
}

export const OFFICE_KEYS = ['vp', ...DIVS.map((d) => `dir:${d.id}`), ...DIVS.map((d) => `cd:${d.id}`)];

export const holders = (db: Workspace, k: string) => {
  const o = officeOf(k);
  return db.people.filter((p) => p.status === 'active' && p.role === o.role && (o.unit ? p.div === o.unit : true));
};

/** The President appoints VPs; the reporting VP, the President or the Admin appoint Directors; Co-Director scope is open. */
export function canAppoint(m: Person | undefined, k: string): ActionRule {
  if (!m || isBoard(m)) return no(t('Board accounts are read-only.'));
  if (k.startsWith('cd:')) return no(t('Not enabled until the Co-Director appointment rule is adopted.'));
  if (k === 'vp') return isPres(m) || isAdmin(m) ? { ok: true } : no(t('The President appoints the Vice President.'));
  return isAdmin(m) || isPres(m) || (isVP(m) && (reportDivs(m) as string[]).includes(k.slice(4)))
    ? { ok: true }
    : no(t('The reporting VP, the President or the Admin appoints Directors.'));
}

export const candidates = (db: Workspace, k: string, m: Person) => {
  const o = officeOf(k);
  return db.people
    .filter(
      (p) =>
        p.status === 'active' &&
        !isBoard(p) &&
        p.id !== m.id &&
        !isPres(p) &&
        p.role !== o.role &&
        (o.unit ? p.div === o.unit : true),
    )
    .sort((a, b) => rank(b) - rank(a) || a.name.localeCompare(b.name));
};
