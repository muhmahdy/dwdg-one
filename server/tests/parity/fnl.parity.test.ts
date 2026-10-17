/* Finance & Legal: the division's private data, plus the requester and creator of a legal or funding request, checked against
   the database's own policies. Funding requests can be written by their creator but only read by the division and the
   requester: the one table here where write is wider than read. */
import { parityTests, row } from './policy-parity.ts';

const meOn = (...keys: string[]) => (me: { id: string }) => [{ note: 'x' }, ...keys.map((k) => ({ [k]: me.id }))];

parityTests([
  {
    name: 'fnl_legal',
    rows: [
      row('l_ee', { type: 'PKS', requester: 'mem_ee', unit: 'ee', createdBy: 'mem_ee' }),
      row('l_fnl', { requester: 'mem_fnl', unit: 'fnl' }),
      row('l_hr', { unit: 'hr', requester: 'hr_mem' }),
      row('l_creator', { createdBy: 'mem_sng' }),
      row('l_none'),
    ],
    variants: (me) => [{}, { requester: me.id }, { createdBy: me.id }, { unit: me.div }, { unit: me.div, requester: 'someone_else' }, { unit: 'cons' }],
    changes: (me) => [{ note: 'x' }, { requester: me.id }, { createdBy: me.id }, { unit: me.div }, { requester: null, createdBy: null, unit: null }],
  },
  {
    name: 'fnl_register',
    rows: [row('rg_a', { req: 'rq_a', type: 'PKS', issuedBy: 'mem_fnl', state: 'issued' }), row('rg_b')],
    variants: meOn('issuedBy'),
    changes: meOn('issuedBy'),
  },
  {
    name: 'fnl_allocations',
    rows: [row('al_ee', { unit: 'ee', project: 'p_a', state: 'open', createdBy: 'cod_cons' }), row('al_hr', { unit: 'hr' }), row('al_none')],
    noDelete: ['al_ee', 'al_hr'], // requests point at them
    variants: (me) => [{}, { unit: me.div }, { createdBy: me.id }, { unit: 'ee' }],
    changes: (me) => [{ note: 'x' }, { unit: me.div }, { createdBy: me.id }, { unit: null }],
  },
  {
    name: 'fnl_requests',
    rows: [
      row('rq_a', { requester: 'mem_ee', unit: 'ee', alloc: 'al_ee', createdBy: 'dir_ee' }),
      row('rq_b', { requester: 'mem_fnl', alloc: 'al_hr' }),
      row('rq_creator', { createdBy: 'mem_sng' }),
      row('rq_none'),
    ],
    noDelete: ['rq_a', 'rq_b'], // payments point at them
    variants: (me) => [{}, { requester: me.id }, { createdBy: me.id }, { requester: me.id, createdBy: 'someone_else' }, { alloc: 'al_ee', unit: me.div }],
    changes: (me) => [{ note: 'x' }, { requester: me.id }, { createdBy: me.id }, { requester: null, createdBy: null }],
  },
  {
    name: 'fnl_payments',
    rows: [row('py_a', { req: 'rq_a', by: 'mem_fnl' }), row('py_b', { req: 'rq_b' })],
    variants: (me) => [{ req: 'rq_a' }, { req: 'rq_a', by: me.id }],
    changes: meOn('by'),
  },
  {
    name: 'fnl_incoming',
    rows: [row('in_a', { project: 'p_a', opp: 'op1', state: 'x', collector: 'mem_fnl', createdBy: 'mem_ee' }), row('in_b')],
    variants: meOn('collector', 'createdBy'),
    changes: meOn('collector', 'createdBy'),
  },
  {
    name: 'fnl_periods',
    rows: [row('pe_a', { project: 'p_c', state: 'open', preparedBy: 'mem_fnl', reviewer: 'dir_ee', createdBy: 'mem_fnl' }), row('pe_b')],
    variants: meOn('preparedBy', 'reviewer', 'createdBy'),
    changes: meOn('preparedBy', 'reviewer', 'createdBy'),
  },
]);
