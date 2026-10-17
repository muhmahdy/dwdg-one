/* External Engagement: the division's data, organisations and opportunities that Consulting reads too, and hand-offs that the
   receiving unit sees once they are sent. Checked against the database's own policies. */
import { parityTests, row } from './policy-parity.ts';

const own = (me: { id: string }) => [{ note: 'x' }, { owner: me.id }, { pic: me.id }, { by: me.id }];

parityTests([
  {
    name: 'ee_orgs',
    rows: [row('o_a', { pic: 'mem_ee', stage: 'lead' }), row('o_b')],
    noDelete: ['o_a', 'o_b'], // contacts, interactions and opportunities point at them
    variants: (me) => [{}, { pic: me.id }, { stage: 'won' }],
    changes: (me) => [{ note: 'x' }, { pic: me.id }],
  },
  {
    name: 'ee_contacts',
    rows: [row('ec_a', { org: 'o_a', owner: 'mem_ee' }), row('ec_b', { org: 'o_b' })],
    variants: (me) => [{}, { owner: me.id }, { org: 'o_a' }],
    changes: own,
  },
  {
    name: 'ee_interactions',
    rows: [row('ei_a', { org: 'o_a', by: 'mem_ee' }), row('ei_b', { org: 'o_b' })],
    variants: (me) => [{}, { by: me.id }, { org: 'o_a' }],
    changes: own,
  },
  {
    name: 'ee_fu',
    rows: [row('ef1', { task: 'ef1', org: 'o_a' }), row('ef2', { task: 'ef2' })],
    variants: (me) => [{}, { org: 'o_a' }, { owner: me.id }],
    changes: own,
  },
  {
    name: 'ee_postpones',
    rows: [row('000000', { task: 'ef1' }), row('000001', { task: 'ef2' })],
    variants: (me) => [{}, { by: me.id }],
    changes: own,
  },
  {
    name: 'ee_opps',
    rows: [row('op_a', { org: 'o_a', pic: 'mem_ee', stage: 'x' }), row('op_b', { org: 'o_b' })],
    variants: (me) => [{}, { pic: me.id }, { org: 'o_a' }],
    changes: (me) => [{ note: 'x' }, { pic: me.id }],
  },
  {
    name: 'ee_handoffs',
    rows: [
      row('h_draft_cons', { opp: 'op_a', from: 'mem_ee', toUnit: 'cons', to: 'cod_cons', state: 'draft' }),
      row('h_sent_cons', { opp: 'op_a', from: 'mem_ee', toUnit: 'cons', to: 'cod_cons', state: 'sent' }),
      row('h_sent_hr', { opp: 'op_a', from: 'mem_ee', toUnit: 'hr', to: 'hr_mem', state: 'sent' }),
      row('h_sent_nobody', { opp: 'op_b', from: 'mem_ee', state: 'sent' }),
      row('h_nostate', { opp: 'op_b', from: 'mem_ee', toUnit: 'cons' }),
    ],
    variants: (me) => [
      {},
      { toUnit: me.div, state: 'sent' },
      { toUnit: me.div, state: 'draft' },
      { to: me.id, state: 'sent' },
      { to: me.id, state: 'draft' },
      { to: me.id },
      { toUnit: 'cons', state: 'sent' },
    ],
    changes: (me) => [
      { note: 'x' },
      { toUnit: me.div, state: 'sent' },
      { to: me.id },
      { state: 'draft' },
      { state: 'sent' },
      { toUnit: null, to: null },
    ],
  },
]);
