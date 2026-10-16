/* Open duties before a move, a pause or a departure (flow-transfer-preview, flow-revoke-preview, hr_roster_change). Nothing is
   completed, deleted or reassigned on its own; the leader decides each task or leaves it unresolved and visible. From
   screens/accounts.js dutiesOf and unresolvedOf. */
import { ENDED } from '@/features/projects/services/project-rules';
import { isDone, isSummary, taskOf } from '@/features/work/services/selectors';
import type { Decision, Offer, PersonId, Project, Resource, Routine, Task, Workspace } from '@/types/workspace';
import { acctOf } from './acct-data';

export interface Duties {
  tasks: Task[];
  shared: Task[];
  reviews: Task[];
  offersIn: Offer[];
  projects: Project[];
  resources: Resource[];
  routines: Routine[];
  decisions: Decision[];
}

export function dutiesOf(db: Workspace, pid: PersonId): Duties {
  const open = (t: Task) => !t.trashed && !isDone(t) && !isSummary(db, t);
  return {
    tasks: db.tasks.filter((t) => open(t) && t.owner === pid),
    shared: db.tasks.filter(
      (t) => open(t) && t.owner !== pid && t.assignees.some((a) => a.id === pid && a.state === 'joined'),
    ),
    reviews: db.tasks.filter((t) => !t.trashed && t.status === 'review' && t.reviewer === pid && t.owner !== pid),
    offersIn: db.offers.filter((o) => o.to === pid && o.state === 'pending'),
    projects: db.projects.filter((p) => (p.lead === pid || p.pm === pid) && !ENDED.includes(p.stage)),
    resources: db.resources.filter((r) => r.owner === pid && !r.archived),
    routines: (db.routines ?? []).filter((r) => !r.personal && r.owners.includes(pid) && !r.paused),
    decisions: db.decisions.filter((d) => d.approver === pid && d.state === 'awaiting'),
  };
}

export const dutyCount = (d: Duties) =>
  d.tasks.length +
  d.shared.length +
  d.reviews.length +
  d.offersIn.length +
  d.projects.length +
  d.resources.length +
  d.routines.length +
  d.decisions.length;

/** Tasks a leader chose to leave unresolved stay visible until someone takes them (explicit unresolved queue). */
export function unresolvedOf(db: Workspace, pid: PersonId): Task[] {
  const out = new Set<string>();
  for (const a of acctOf(db).actions.filter((x) => x.person === pid && x.state === 'applied'))
    for (const [tid, ch] of Object.entries(a.map)) {
      const t = taskOf(db, tid);
      if (
        ch === 'open' &&
        t &&
        !t.trashed &&
        !isDone(t) &&
        t.owner === pid &&
        !db.offers.some((o) => o.task === tid && o.state === 'pending')
      )
        out.add(tid);
    }
  return [...out].map((id) => taskOf(db, id)).filter((t): t is Task => !!t);
}
