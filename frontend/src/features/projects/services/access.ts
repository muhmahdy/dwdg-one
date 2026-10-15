/* Who sees a project (access_member_scope, access_project_collab), from screens/plan.js canSeeProject, team, jointIn.
   The database's app.can_see_project() enforces the same rule. */
import { visibleDivs } from '@/lib/access';
import type { DivisionId, Person, Project, Workspace } from '@/types/workspace';

/** Team members who have not declined and still exist. */
export const team = (db: Workspace, p: Project) =>
  p.team.filter((x) => x.state !== 'declined' && db.people.some((q) => q.id === x.id));

/** A joint project: someone from division `d`, other than the owning division, has joined the team. */
export const jointIn = (db: Workspace, p: Project, d: DivisionId) =>
  p.div !== d && team(db, p).some((x) => x.state === 'joined' && db.people.find((q) => q.id === x.id)?.div === d);

export function canSeeProject(db: Workspace, me: Person, p: Project) {
  const v = visibleDivs(me);
  return (
    p.org ||
    v.includes(p.div) ||
    p.lead === me.id ||
    p.pm === me.id ||
    team(db, p).some((x) => x.id === me.id) ||
    v.some((d) => jointIn(db, p, d)) ||
    db.tasks.some((t) => t.project === p.id && t.owner === me.id && !t.trashed)
  );
}
