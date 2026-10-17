/* Consulting. database/schema/schema-spec.mjs, section "Consulting". The division's private data, plus the lead or manager of
   the project an engagement belongs to (whose projects come from the hub), and the people named on a knowledge article. */
import { isMe, isProjectLead, seesDiv } from '../auth/rules.ts';
import { text } from './doc.ts';
import { division, jsonbHas, notBoard } from './helpers.ts';
import type { TablePolicy } from './types.ts';

export const cons_engagements: TablePolicy = {
  read: (p, r) => division(p, 'cons', isProjectLead(p, r.id) || isMe(p, text(r.doc, 'reviewer'))),
};

export const cons_dlv: TablePolicy = {
  read: (p, r) => division(p, 'cons', isProjectLead(p, text(r.doc, 'project'))),
};

export const cons_staff: TablePolicy = {
  read: (p, r) => division(p, 'cons', isProjectLead(p, text(r.doc, 'project'))),
};

export const cons_cohorts: TablePolicy = {
  read: (p, r) => division(p, 'cons', isMe(p, text(r.doc, 'mentor'))),
};

/* Knowledge: read by the division, the owner, the author, anyone named, and everyone when the audience is the organisation.
   Written only by the division, or the owner or author. */
export const cons_kn: TablePolicy = {
  read: (p, r) => {
    const d = r.doc;
    return (
      notBoard(p) &&
      (seesDiv(p, 'cons') ||
        isMe(p, text(d, 'owner')) ||
        isMe(p, text(d, 'author')) ||
        jsonbHas(d.named, p.personId) ||
        text(d, 'audience') === 'org')
    );
  },
  write: (p, r) => division(p, 'cons', isMe(p, text(r.doc, 'owner')) || isMe(p, text(r.doc, 'author'))),
};
