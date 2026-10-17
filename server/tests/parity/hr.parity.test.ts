/* Human Resources: the rules for the most private records, checked against the database's own policies. The fixture is built to
   hit every way a rule can let someone in, including the one that is easy to get wrong: in the spec `hrPrivate(x) or y` means
   `(not-board and (...)) or y`, so the Board is shut out of the first part but still reads what it is itself named on. */
import { parityTests, row } from './policy-parity.ts';

const meOn = (...keys: string[]) => (me: { id: string }) => [{ note: 'x' }, ...keys.map((k) => ({ [k]: me.id }))];
const named = (me: { id: string }) => ({ p: me.id, reviewer: 'someone_else' });

parityTests([
  {
    name: 'hr_registers',
    rows: [row('r_ee', { unit: 'ee', meeting: 'm1', officer: 'hr_mem', createdBy: 'hr_dir' }), row('r_hr', { unit: 'hr' }), row('r_sng', { unit: 'sng' }), row('r_none')],
    noDelete: ['r_ee', 'r_hr'], // notices point at them
    variants: (me) => [{}, { unit: me.div }, { officer: me.id }, { unit: 'ee' }],
    changes: (me) => [{ note: 'x' }, { unit: me.div }, { officer: me.id }, { unit: null }],
  },
  {
    name: 'hr_notices',
    rows: [row('n_mem', { reg: 'r_ee', person: 'mem_ee', outcome: 'x' }), row('n_hr', { reg: 'r_hr', person: 'hr_mem' }), row('n_brd', { reg: 'r_ee', person: 'brd' }), row('n_none', { reg: 'r_ee' })],
    variants: (me) => [{}, { person: me.id }, { person: 'someone_else' }, { reg: 'r_ee', person: me.id }],
    changes: meOn('person'),
  },
  {
    name: 'hr_cycles',
    rows: [
      row('cy1', { state: 'open', roster: [{ p: 'mem_ee', reviewer: 'dir_ee' }, { p: 'hr_mem', reviewer: 'brd' }] }),
      row('cy2', { state: 'open', roster: [{ p: 'mem_fnl', reviewer: 'cod_cons' }, 'not an object', null] }),
      row('cy3', { state: 'done' }),
      row('cy4', { state: 'open', roster: [{ p: 'mem_mcit' }, { reviewer: 'mem_sng2' }] }),
    ],
    noDelete: ['cy1', 'cy2', 'cy3', 'cy4'], // assessments point at them
    variants: (me) => [{}, { roster: [named(me)] }, { roster: [{ p: 'someone_else', reviewer: me.id }] }, { roster: [] }],
    changes: (me) => [{ note: 'x' }, { roster: [named(me)] }, { roster: [{ p: 'x', reviewer: me.id }] }, { roster: null }],
  },
  {
    name: 'hr_assessments',
    // read: the person, HR leads and top, whoever scored it, or the reviewer named for the person in the cycle (found in hr_cycles)
    rows: [
      row('as_ee', { cycle: 'cy1', person: 'mem_ee', state: 'open' }),
      row('as_hr_brd', { cycle: 'cy1', person: 'hr_mem', scoredBy: 'brd' }),
      row('as_fnl', { cycle: 'cy2', person: 'mem_fnl', scoredBy: 'mem_ee' }),
      row('as_none', { cycle: 'cy3', person: 'mem_sng' }),
      row('as_no_cycle_row', { cycle: 'cy4', person: 'mem_mcit' }),
    ],
    noDelete: ['as_ee', 'as_hr_brd', 'as_none'], // actions point at them
    variants: (me) => [
      { cycle: 'cy1' },
      { cycle: 'cy1', person: me.id },
      { cycle: 'cy1', person: 'mem_ee' },
      { cycle: 'cy1', person: 'hr_mem' },
      { cycle: 'cy2', person: 'mem_fnl' },
      { cycle: 'cy1', scoredBy: me.id },
      { cycle: 'cy3', person: me.id },
    ],
    changes: (me) => [{ note: 'x' }, { person: me.id }, { scoredBy: me.id }, { scoredBy: null }, { person: 'mem_ee' }],
  },
  {
    name: 'hr_actions',
    rows: [
      row('ac_a', { assessment: 'as_ee', person: 'mem_ee', owner: 'dir_ee' }),
      row('ac_brd', { assessment: 'as_hr_brd', person: 'hr_mem', owner: 'brd' }),
      row('ac_none', { assessment: 'as_none', person: 'mem_sng' }),
    ],
    variants: (me) => [{ assessment: 'as_ee' }, { assessment: 'as_ee', person: me.id }, { assessment: 'as_ee', owner: me.id }],
    changes: meOn('person', 'owner'),
  },
  {
    name: 'hr_rounds',
    rows: [
      row('ro_a', { state: 'open', panel: ['dir_ee', 'brd'], createdBy: 'hr_dir' }),
      row('ro_b', { panel: { mem_fnl: true } }),
      row('ro_c', { panel: 'cod_cons' }),
      row('ro_d'),
    ],
    noDelete: ['ro_a', 'ro_b'], // packets point at them
    variants: (me) => [{}, { panel: [me.id] }, { panel: { [me.id]: true } }, { panel: me.id }, { panel: ['someone_else'] }],
    changes: (me) => [{ note: 'x' }, { panel: [me.id] }, { panel: { [me.id]: true } }, { panel: me.id }, { panel: null }],
  },
  {
    name: 'hr_packets',
    rows: [
      row('pk_a', { round: 'ro_a', person: 'mem_ee', receiver: 'dir_ee', createdBy: 'hr_dir' }),
      row('pk_brd', { round: 'ro_a', receiver: 'brd' }),
      row('pk_c', { round: 'ro_b', createdBy: 'mem_mcit' }),
      row('pk_d', { round: 'ro_b' }),
    ],
    variants: (me) => [{ round: 'ro_a' }, { round: 'ro_a', receiver: me.id }, { round: 'ro_a', createdBy: me.id }, { round: 'ro_a', person: me.id }],
    changes: meOn('receiver', 'createdBy', 'person'),
  },
  {
    name: 'hr_onboarding_templates',
    rows: [row('tp_a'), row('tp_b')],
    noDelete: ['tp_a', 'tp_b'], // instances point at them
    variants: (me) => [{}, { owner: me.id }],
    changes: meOn('owner'),
  },
  {
    name: 'hr_onboarding_instances',
    rows: [
      row('oi_a', { template: 'tp_a', person: 'mem_ee', buddy: 'mem_sng', hrOwner: 'hr_mem' }),
      row('oi_b', { template: 'tp_a', person: 'mem_fnl' }),
      row('oi_brd', { template: 'tp_b', hrOwner: 'brd' }),
      row('oi_none', { template: 'tp_b' }),
    ],
    variants: (me) => [{ template: 'tp_a' }, { template: 'tp_a', person: me.id }, { template: 'tp_a', buddy: me.id }, { template: 'tp_a', hrOwner: me.id }],
    changes: meOn('person', 'buddy', 'hrOwner'),
  },
]);
