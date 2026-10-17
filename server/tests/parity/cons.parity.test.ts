/* Consulting: the division's data plus the lead or manager of the project an engagement belongs to (taken from the hub's
   projects) and the people named on a knowledge article. Checked against the database's own policies. The fixture's hub
   projects are p_a (led by dir_ee) and p_b (managed by mem_ee). */
import { parityTests, row } from './policy-parity.ts';

const toProject = (me: { id: string }) => [{ note: 'x' }, { project: 'p_a' }, { project: 'p_b' }, { owner: me.id }, { project: null }];

parityTests([
  {
    name: 'cons_engagements',
    // an engagement's id is its project's id
    rows: [
      row('p_a', { client: 'Acme', createdBy: 'cod_cons' }),
      row('p_b', { client: 'Beta', reviewer: 'mem_fnl' }),
      row('p_c', { client: 'Gamma' }),
      row('e_rev', { client: 'Delta', reviewer: 'mem_fnl', createdBy: 'cod_cons' }),
    ],
    variants: (me) => [{}, { reviewer: me.id }, { createdBy: me.id }, { clientOwner: me.id }],
    changes: (me) => [{ note: 'x' }, { reviewer: me.id }, { reviewer: null }],
  },
  {
    name: 'cons_dlv',
    rows: [row('d_a', { project: 'p_a', owner: 'cod_cons' }), row('d_b', { project: 'p_b' }), row('d_c', { project: 'p_c' }), row('d_none')],
    variants: (me) => [{}, { project: 'p_a' }, { project: 'p_b' }, { project: 'p_c' }, { owner: me.id }],
    changes: toProject,
  },
  {
    name: 'cons_staff',
    rows: [row('s_a', { project: 'p_a', state: 'active' }), row('s_b', { project: 'p_b' }), row('s_c', { project: 'p_c' })],
    variants: () => [{}, { project: 'p_a' }, { project: 'p_b' }, { project: 'p_c' }],
    changes: toProject,
  },
  {
    name: 'cons_kn',
    rows: [
      row('k_own', { owner: 'mem_ee', author: 'cod_cons', audience: 'cons' }),
      row('k_auth', { author: 'mem_fnl' }),
      row('k_org', { audience: 'org' }),
      row('k_named_array', { named: ['mem_mcit', 'hr_mem'] }),
      row('k_named_object', { named: { mem_ee: true } }),
      row('k_named_text', { named: 'hr_dir' }),
      row('k_named_number', { named: 7 }),
      row('k_none'),
    ],
    variants: (me) => [{}, { owner: me.id }, { author: me.id }, { audience: 'org' }, { named: [me.id] }, { named: me.id }, { named: { [me.id]: true } }],
    changes: (me) => [{ note: 'x' }, { owner: me.id }, { author: me.id }, { audience: 'org' }, { audience: 'cons' }, { named: [me.id] }],
  },
  {
    name: 'cons_cohorts',
    rows: [row('ch_a', { project: 'p_a', program: 'pg1', mentor: 'mem_ee' }), row('ch_b', { mentor: 'cod_cons' }), row('ch_c')],
    variants: (me) => [{}, { mentor: me.id }, { project: 'p_a' }],
    changes: (me) => [{ note: 'x' }, { mentor: me.id }, { mentor: null }],
  },
]);
