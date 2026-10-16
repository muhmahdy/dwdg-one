/* Who sees whose performance (D30, D29, access_vp_scope, access_president_scope). One scope per role: a Co-Director's
   branch, a Director's division, the VP's reporting divisions, HR and the President everyone, a member themselves.
   From screens/perf.js. */
import { DIVS } from '@/app/config/org';
import { rank } from '@/lib/access';
import { hrLead, isAdmin, isBoard, isPres, isTopOrAdmin, isVP } from '@/lib/roles';
import type { DivisionId, Person, PersonId, Workspace } from '@/types/workspace';

/** HR sees everyone (D30): the HR Director and Co-Directors, the same people who hold the private-HR grant. */
export const hrAll = hrLead;

/** Reporting lines are configuration, never hard-coded (D28). Today: one VP over all six divisions. */
export const vpDivs = (p: Person | undefined): DivisionId[] => (isVP(p) ? DIVS.map((d) => d.id) : []);

/** Branch membership is not in the organization records yet (IAM). Proposed: Consulting's three Co-Directors lead these. */
export const BRANCHES: Record<string, { name: string; members: PersonId[] }> = {
  ilham: { name: 'Project Associates', members: ['bima', 'naufal'] },
  dimas: { name: 'Knowledge', members: ['olivia', 'qonita'] },
  putri: { name: 'TnD', members: ['maya', 'prasetyo'] },
};

export const activePeople = (db: Workspace) => db.people.filter((p) => p.status === 'active' && !isBoard(p));

export type Team =
  | { kind: 'none' | 'board'; ids: PersonId[] }
  | { kind: 'all' | 'vp' | 'div' | 'cd' | 'self'; ids: PersonId[] }
  | { kind: 'branch'; branch: string; ids: PersonId[] };

export function teamOf(db: Workspace, m: Person | undefined): Team {
  if (!m) return { kind: 'none', ids: [] };
  if (isBoard(m)) return { kind: 'board', ids: [] };
  const act = activePeople(db);
  if (isPres(m) || hrAll(m)) return { kind: 'all', ids: act.map((p) => p.id) };
  if (isVP(m)) {
    const ds = vpDivs(m);
    return {
      kind: 'vp',
      ids: act.filter((p) => (p.div != null && ds.includes(p.div)) || p.id === m.id).map((p) => p.id),
    };
  }
  if (m.role === 'director') return { kind: 'div', ids: act.filter((p) => p.div === m.div).map((p) => p.id) };
  if (m.role === 'codirector') {
    const b = BRANCHES[m.id];
    if (b) return { kind: 'branch', branch: b.name, ids: [m.id, ...b.members] };
    return {
      kind: 'cd',
      ids: act.filter((p) => p.div === m.div && (rank(p) < 2 || p.id === m.id)).map((p) => p.id),
    };
  }
  return { kind: 'self', ids: [m.id] };
}

export const canSeePerson = (db: Workspace, m: Person | undefined, pid: PersonId) =>
  !!m && !isBoard(m) && (pid === m.id || teamOf(db, m).ids.includes(pid));

/** The divisions whose attention items a leader sees. */
export const attnDivs = (m: Person | undefined): DivisionId[] =>
  isPres(m) || isAdmin(m) ? DIVS.map((d) => d.id) : isVP(m) ? vpDivs(m) : m && rank(m) >= 2 && m.div ? [m.div] : [];

export const canAttn = (m: Person | undefined) => isTopOrAdmin(m) || (!!m && rank(m) >= 2 && !!m.div && !isBoard(m));
