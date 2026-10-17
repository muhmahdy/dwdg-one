/* Human Resources. database/schema/schema-spec.mjs, section "Human Resources". The most private data there is: reviews of
   people, notices, rounds. Seen by HR staff, the President, the VP and the Admin, by the person concerned, and by the people
   the record names. Read the precedence carefully: in the spec `hrPrivate(x) or y` is `(NB and (...)) or y`, so the Board is
   shut out of the first part only and still reads what it is itself named on. */
import type { Principal } from '../auth/principal.ts';
import { hrLead, isHrStaff, isMe, isTopOrAdmin, unitLead } from '../auth/rules.ts';
import { text, type Doc } from './doc.ts';
import { jsonbHas, notBoard } from './helpers.ts';
import type { TablePolicy } from './types.ts';

/** `hrPrivate(person)`: `NB and (hr_lead or top_or_admin or person = me)` */
const hrPrivate = (p: Principal, person: string | null): boolean => notBoard(p) && (hrLead(p) || isTopOrAdmin(p) || isMe(p, person));

/** `NB and (is_hr_staff or top_or_admin)`, and the same with more people named. */
const hrStaffOrTop = (p: Principal): boolean => notBoard(p) && (isHrStaff(p) || isTopOrAdmin(p));

/** The people of a cycle: `doc->'roster'`, a list of `{ p: person, reviewer }`. Anything else is an empty roster. */
const roster = (doc: Doc): Doc[] =>
  Array.isArray(doc.roster) ? doc.roster.filter((x): x is Doc => typeof x === 'object' && x !== null && !Array.isArray(x)) : [];

export const hr_registers: TablePolicy = {
  read: (p, r) => notBoard(p) && (isHrStaff(p) || isTopOrAdmin(p) || unitLead(p, text(r.doc, 'unit'))),
};

export const hr_notices: TablePolicy = {
  read: (p, r) => hrPrivate(p, text(r.doc, 'person')),
};

export const hr_cycles: TablePolicy = {
  read: (p, r) =>
    notBoard(p) &&
    (isHrStaff(p) || isTopOrAdmin(p) || roster(r.doc).some((x) => isMe(p, text(x, 'p')) || isMe(p, text(x, 'reviewer')))),
};

/** `app.hr_reviews(cycle, person)`: the reviewer named for this person in the cycle's roster. */
const reviews = (p: Principal, cycleId: string | null, person: string | null, cycle: Doc | undefined): boolean =>
  p.active && cycleId !== null && person !== null && cycle !== undefined && roster(cycle).some((x) => text(x, 'p') === person && isMe(p, text(x, 'reviewer')));

export const hr_assessments: TablePolicy = {
  needs: ['hr_cycles'],
  read: (p, r, lookup) => {
    const cycle = text(r.doc, 'cycle');
    const person = text(r.doc, 'person');
    return (
      hrPrivate(p, person) ||
      isMe(p, text(r.doc, 'scoredBy')) ||
      reviews(p, cycle, person, cycle === null ? undefined : lookup('hr_cycles', cycle)?.doc)
    );
  },
};

export const hr_actions: TablePolicy = {
  read: (p, r) => hrPrivate(p, text(r.doc, 'person')) || isMe(p, text(r.doc, 'owner')),
};

export const hr_rounds: TablePolicy = {
  read: (p, r) => notBoard(p) && (jsonbHas(r.doc.panel, p.personId) || hrLead(p) || isTopOrAdmin(p)),
};

export const hr_packets: TablePolicy = {
  read: (p, r) => notBoard(p) && (hrLead(p) || isTopOrAdmin(p) || isMe(p, text(r.doc, 'receiver')) || isMe(p, text(r.doc, 'createdBy'))),
};

export const hr_onboarding_templates: TablePolicy = {
  read: (p) => hrStaffOrTop(p),
};

export const hr_onboarding_instances: TablePolicy = {
  read: (p, r) =>
    notBoard(p) &&
    (isHrStaff(p) ||
      isTopOrAdmin(p) ||
      isMe(p, text(r.doc, 'person')) ||
      isMe(p, text(r.doc, 'buddy')) ||
      isMe(p, text(r.doc, 'hrOwner'))),
};
