/* Who sees and edits an operation (routine, D34, work_routines), from screens/work.js canSeeRt / canEditRt. */
import { canCreateProject, visibleDivs } from '@/lib/access';
import type { Person, Routine, Workspace } from '@/types/workspace';

export const canSeeRt = (_db: Workspace, me: Person, r: Routine) =>
  r.personal
    ? r.owners.includes(me.id) || r.createdBy === me.id
    : (!!r.unit && visibleDivs(me).includes(r.unit)) || r.owners.includes(me.id);

export const canEditRt = (me: Person, r: Routine) =>
  r.personal
    ? r.owners.includes(me.id) || r.createdBy === me.id
    : (!!r.unit && canCreateProject(me, r.unit)) || r.lead === me.id || r.manager === me.id;
