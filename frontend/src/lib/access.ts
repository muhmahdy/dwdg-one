/* Who sees and creates what (access_member_scope, access_vp_scope, access_president_scope, access_admin_scope,
   access_board_scope, access_project_creation_cd). The database enforces the same rules with RLS
   (database/policies/RLS_RULES.md); these copies decide what the screens offer. */
import { DIVS, ROLES } from '@/app/config/org';
import type { DivisionId, Person, Workspace } from '@/types/workspace';

/** Admin outranks every role (9); otherwise the role's rank: President 5 … Member 1, Board 0. */
export const rank = (p: Person) => (p.admin ? 9 : ROLES[p.role].rank);

/** Admin, President, VP and the Board of Supervisors read every workspace; everyone else reads their own division. */
export const visibleDivs = (p: Person): DivisionId[] =>
  p.admin || p.role === 'president' || p.role === 'vp' || p.role === 'board' ? DIVS.map((d) => d.id) : p.div ? [p.div] : [];

/** Co-Director and above create projects in a workspace they can see. */
export const canCreateProject = (p: Person, d: DivisionId) => rank(p) >= 2 && visibleDivs(p).includes(d);

/** The workspace being viewed: the remembered one if the person may see it, else their first. */
export function currentWs(me: Person | undefined, remembered: DivisionId | undefined): DivisionId {
  if (!me) return 'sng';
  const v = visibleDivs(me);
  return remembered && v.includes(remembered) ? remembered : (v[0] ?? 'sng');
}

export const personOf = (db: Workspace, id: string | null | undefined) => (id ? db.people.find((p) => p.id === id) : undefined);
