/* Strategy & Growth. database/schema/schema-spec.mjs, section "Strategy & Growth". Both tables are the division's private
   data: its members, the President, the VP and the Admin, plus the people named on the row. Never the Board. */
import { isMe } from '../auth/rules.ts';
import { text } from './doc.ts';
import { division } from './helpers.ts';
import type { TablePolicy } from './types.ts';

export const sng_initiatives: TablePolicy = {
  read: (p, r) => division(p, 'sng', isMe(p, text(r.doc, 'owner')) || isMe(p, text(r.doc, 'createdBy'))),
};

export const sng_packets: TablePolicy = {
  read: (p, r) =>
    division(
      p,
      'sng',
      isMe(p, text(r.doc, 'reviewer')) || isMe(p, text(r.doc, 'submittedBy')) || isMe(p, text(r.doc, 'createdBy')),
    ),
};
