/* External Engagement. database/schema/schema-spec.mjs, section "External Engagement". Organisations and opportunities are
   also read by Consulting; hand-offs are also seen by the receiving unit once they are sent. Never the Board. */
import type { Principal } from '../auth/principal.ts';
import { isMe, seesDiv, unitLead } from '../auth/rules.ts';
import { text, type Doc } from './doc.ts';
import { division, notBoard } from './helpers.ts';
import type { TablePolicy } from './types.ts';

/** `NB and (sees('ee') or sees('cons'))` */
const eeOrCons = (p: Principal): boolean => notBoard(p) && (seesDiv(p, 'ee') || seesDiv(p, 'cons'));

const ownDivision: TablePolicy = { read: (p) => division(p, 'ee') };

export const ee_orgs: TablePolicy = { read: eeOrCons, write: (p) => division(p, 'ee') };
export const ee_opps: TablePolicy = { read: eeOrCons, write: (p) => division(p, 'ee') };
export const ee_contacts: TablePolicy = ownDivision;
export const ee_interactions: TablePolicy = ownDivision;
export const ee_fu: TablePolicy = ownDivision;
export const ee_postpones: TablePolicy = ownDivision;

/** The receiving end of a hand-off: the lead of the unit it goes to, or the person it names. */
const receiving = (p: Principal, doc: Doc): boolean => unitLead(p, text(doc, 'toUnit')) || isMe(p, text(doc, 'to'));

export const ee_handoffs: TablePolicy = {
  read: (p, r) => {
    const state = text(r.doc, 'state');
    return notBoard(p) && (seesDiv(p, 'ee') || (state !== null && state !== 'draft' && receiving(p, r.doc)));
  },
  write: (p, r) => notBoard(p) && (seesDiv(p, 'ee') || receiving(p, r.doc)),
};
