/* Project rules (work_projects_register, work_project_lifecycle, access_project_creation_cd, access_project_collab), from
   screens/plan.js. */
import { rank, visibleDivs } from '@/lib/access';
import type { DivisionId, Person, Project, Workspace } from '@/types/workspace';
import { isSummary } from '@/features/work/services/selectors';
export { canSeeProject, jointIn, team } from './access';

export const ENDED = ['completed', 'cancelled', 'archived'];

/** Admin, the lead, PM or creator, or a Co-Director and above in a workspace they see. */
export const canEditProject = (_db: Workspace, me: Person, p: Project) =>
  me.admin ||
  p.lead === me.id ||
  p.pm === me.id ||
  p.createdBy === me.id ||
  (rank(me) >= 2 && visibleDivs(me).includes(p.div));

/** Work packages only; phases and summaries roll up. */
export const projTasks = (db: Workspace, p: Project) =>
  db.tasks.filter((t) => t.project === p.id && !t.trashed && !isSummary(db, t));
export const projMs = (db: Workspace, p: Project) =>
  db.milestones.filter((x) => x.project === p.id).sort((a, b) => (a.target || '9').localeCompare(b.target || '9'));
export const nextMs = (db: Workspace, p: Project) =>
  projMs(db, p).find((x) => x.state !== 'achieved' && x.state !== 'cancelled');
export const projBlockers = (db: Workspace, p: Project) =>
  db.blockers.filter(
    (b) => b.state === 'open' && (b.project === p.id || db.tasks.find((t) => t.id === b.task)?.project === p.id),
  );
/** Directors and above (or the Admin) create programs in a workspace they see. */
export const canCreateProgram = (me: Person | undefined, d: DivisionId) =>
  !!me && (me.admin || rank(me) >= 3) && visibleDivs(me).includes(d);
