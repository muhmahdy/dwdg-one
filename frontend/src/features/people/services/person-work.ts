/* What the person panel lists: the open work two people share, offers between them, and the person's other open work the
   viewer is allowed to see. Task count alone never means busy or free. From screens/work.js INSP.person. */
import { visibleDivs } from '@/lib/access';
import { isDone, isSummary, taskDiv, taskPeople } from '@/features/work/services/selectors';
import type { Offer, Person, Task, Workspace } from '@/types/workspace';

const byDue = (a: Task, b: Task) => (a.due ?? '9').localeCompare(b.due ?? '9');

export function personWork(db: Workspace, p: Person, me: Person) {
  const self = p.id === me.id;
  const open = (t: Task) => !t.trashed && !isDone(t) && !isSummary(db, t);
  const between: Task[] = self
    ? []
    : db.tasks
        .filter((t) => {
          if (!open(t)) return false;
          const people = taskPeople(t);
          const theirs =
            people.includes(p.id) &&
            (t.createdBy === me.id || t.reviewer === me.id || people.includes(me.id) || t.mentions.includes(me.id));
          const mine =
            people.includes(me.id) && (t.createdBy === p.id || t.reviewer === p.id || t.mentions.includes(p.id));
          return theirs || mine;
        })
        .sort(byDue);
  const offers: Offer[] = self
    ? []
    : db.offers.filter(
        (o) => o.state === 'pending' && ((o.from === me.id && o.to === p.id) || (o.from === p.id && o.to === me.id)),
      );
  const other = db.tasks
    .filter((t) => {
      if (!open(t) || !taskPeople(t).includes(p.id) || between.includes(t)) return false;
      const d = taskDiv(db, t);
      return self || (!!d && visibleDivs(me).includes(d));
    })
    .sort(byDue);
  return { between, offers, other };
}
