/* Task and request selectors shared by My Work, the shell counts and other pages (work_my_tasks, work_task_lifecycle,
   access_delegation, access_member_edit). Ported from screens/work.js and screens/people.js. Pure: they read the workspace
   and the signed-in person, never change anything. */
import { rank } from '@/lib/access';
import type { DivisionId, Person, PersonId, Task, Workspace } from '@/types/workspace';

export const isDone = (t: Task) => t.status === 'done';
export const projOf = (db: Workspace, id: string | null | undefined) =>
  id ? db.projects.find((p) => p.id === id) : undefined;
export const taskOf = (db: Workspace, id: string | null | undefined) =>
  id ? db.tasks.find((t) => t.id === id) : undefined;
export const personOf = (db: Workspace, id: PersonId | null | undefined) =>
  id ? db.people.find((p) => p.id === id) : undefined;
export const openBlocker = (db: Workspace, taskId: string) =>
  db.blockers.find((b) => b.task === taskId && b.state === 'open');
/** A task's division: its own, else its project's, else its owner's. */
export const taskDiv = (db: Workspace, t: Task): DivisionId | null | undefined =>
  t.div ?? projOf(db, t.project)?.div ?? personOf(db, t.owner)?.div;

export const joinedOf = (t: Task) => t.assignees.filter((a) => a.state === 'joined').map((a) => a.id);
export const taskPeople = (t: Task) => [t.owner, ...joinedOf(t)];
/** WBS phases and tasks with live children are summaries, not work items. */
export const isSummary = (db: Workspace, t: Task) => t.phase || db.tasks.some((c) => c.parent === t.id && !c.trashed);

export const myTasks = (db: Workspace, me: PersonId) =>
  db.tasks.filter((t) => !t.trashed && !isSummary(db, t) && (t.owner === me || joinedOf(t).includes(me)));
export const invitesFor = (db: Workspace, id: PersonId) =>
  db.meetings.filter((mt) => mt.responses[id] === 'pending' && mt.organizer !== id && mt.state !== 'cancelled');
export const offersFor = (db: Workspace, id: PersonId) => db.offers.filter((o) => o.to === id && o.state === 'pending');
export const reviewsFor = (db: Workspace, id: PersonId) =>
  db.tasks.filter((t) => !t.trashed && t.status === 'review' && t.reviewer === id);
export const assignFor = (db: Workspace, id: PersonId) =>
  db.tasks.filter((t) => !t.trashed && t.assignees.some((a) => a.id === id && a.state === 'invited'));

/** Only the assignee, a joined helper, the creator, the reviewer or the project lead/PM may change a task. */
export function canEditTask(db: Workspace, me: Person, t: Task) {
  const p = projOf(db, t.project);
  return (
    t.owner === me.id ||
    joinedOf(t).includes(me.id) ||
    t.createdBy === me.id ||
    t.reviewer === me.id ||
    (!!p && (p.lead === me.id || p.pm === me.id))
  );
}

/** Active Co-Directors and above in a unit, highest rank first. */
export const unitLeads = (db: Workspace, unit: DivisionId) =>
  db.people
    .filter((p) => p.status === 'active' && p.div === unit && rank(p) >= 2)
    .sort((a, b) => rank(b) - rank(a))
    .map((p) => p.id);

/** Someone may answer a program partnership for a division: its Co-Director or above, or the Admin. */
export const canAnswerPartner = (me: Person, d: DivisionId) => me.admin || (me.div === d && rank(me) >= 2);

/** Collaboration invitations waiting for me (D60): projects, operations and program partnerships. */
export function cpInvites(db: Workspace, me: Person) {
  const out: { kind: 'project' | 'routine' | 'partner'; id: string }[] = [];
  for (const p of db.projects)
    for (const v of p.team) if (v.id === me.id && v.state === 'invited') out.push({ kind: 'project', id: p.id });
  for (const r of db.routines ?? [])
    for (const v of (r.invites as { id: string; state: string }[] | undefined) ?? [])
      if (v.id === me.id && v.state === 'invited') out.push({ kind: 'routine', id: r.id });
  for (const g of db.programs ?? [])
    for (const v of g.partners ?? [])
      if (v.state === 'invited' && v.div === me.div && canAnswerPartner(me, v.div))
        out.push({ kind: 'partner', id: g.id });
  return out;
}

/** The two navigation counts: things needing my attention, and unread updates (core/app.js counts). */
export function counts(db: Workspace, me: Person, today: string) {
  const mine = db.tasks.filter((t) => t.owner === me.id && !t.trashed && !isDone(t));
  const attention =
    mine.filter((t) => t.due && t.due <= today).length +
    invitesFor(db, me.id).length +
    offersFor(db, me.id).length +
    reviewsFor(db, me.id).length +
    cpInvites(db, me).length;
  return { attention, unread: db.updates.filter((u) => u.to === me.id && !u.read).length };
}
