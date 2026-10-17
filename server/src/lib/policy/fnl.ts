/* Finance & Legal. database/schema/schema-spec.mjs, section "Finance & Legal". The division's private data, plus the people who
   made or asked for a legal request or a funding request (anyone in the organisation may file one and keep seeing it), and the
   lead of the unit a request is for. Never the Board. */
import { isMe, seesDiv, unitLead } from '../auth/rules.ts';
import { text } from './doc.ts';
import { division, notBoard } from './helpers.ts';
import type { TablePolicy } from './types.ts';

export const fnl_legal: TablePolicy = {
  read: (p, r) =>
    notBoard(p) &&
    (seesDiv(p, 'fnl') || isMe(p, text(r.doc, 'requester')) || isMe(p, text(r.doc, 'createdBy')) || unitLead(p, text(r.doc, 'unit'))),
};

export const fnl_register: TablePolicy = { read: (p) => division(p, 'fnl') };
export const fnl_payments: TablePolicy = { read: (p) => division(p, 'fnl') };
export const fnl_incoming: TablePolicy = { read: (p) => division(p, 'fnl') };
export const fnl_periods: TablePolicy = { read: (p) => division(p, 'fnl') };

export const fnl_allocations: TablePolicy = {
  read: (p, r) => division(p, 'fnl', unitLead(p, text(r.doc, 'unit'))),
};

/* Funding requests: read by the division and the requester; written also by the person who created it. */
export const fnl_requests: TablePolicy = {
  read: (p, r) => notBoard(p) && (seesDiv(p, 'fnl') || isMe(p, text(r.doc, 'requester'))),
  write: (p, r) => notBoard(p) && (seesDiv(p, 'fnl') || isMe(p, text(r.doc, 'requester')) || isMe(p, text(r.doc, 'createdBy'))),
};
