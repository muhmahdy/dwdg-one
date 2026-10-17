/* Marketing, Communication & IT: the self-service pattern (anyone may file a brief or an IT request and keep seeing and
   changing their own) and the Board's read-only access, checked against the database's own policies. */
import { parityTests, row } from './policy-parity.ts';

/** Every way a request can name the person who saves it, their division as the unit it is for, or somebody else. */
const requestVariants = (me: { id: string; div: string | null }) => [
  {},
  { requester: me.id },
  { createdBy: me.id },
  { unit: me.div },
  { unit: me.div, requester: 'someone_else' },
  { unit: 'cons' },
  { owner: me.id },
];
const requestChanges = (me: { id: string; div: string | null }) => [
  { note: 'x' },
  { requester: me.id },
  { createdBy: me.id },
  { unit: me.div },
  { requester: null, createdBy: null, unit: null },
];

parityTests([
  {
    name: 'mcit_campaigns',
    rows: [row('c_plain', { owner: 'mem_mcit', createdBy: 'mem_mcit' }), row('c_other', { owner: 'dir_ee' })],
    noDelete: ['c_plain'], // content points at it
    variants: (me) => [{}, { owner: me.id }, { createdBy: me.id }],
    changes: (me) => [{ note: 'x' }, { owner: me.id }],
  },
  {
    name: 'mcit_content',
    rows: [
      row('ct_a', { campaign: 'c_plain', executor: 'mem_mcit', reviewer: 'dir_ee', createdBy: 'mem_mcit' }),
      row('ct_b', { campaign: 'c_plain' }),
    ],
    variants: (me) => [{}, { campaign: 'c_plain' }, { executor: me.id }, { createdBy: me.id }],
    changes: (me) => [{ note: 'x' }, { executor: me.id }, { createdBy: me.id }],
  },
  {
    name: 'mcit_briefs',
    rows: [
      row('b_req', { unit: 'ee', requester: 'mem_ee', approver: 'dir_ee', createdBy: 'mem_ee' }),
      row('b_creator', { unit: 'fnl', requester: 'mem_mcit', createdBy: 'mem_fnl' }),
      row('b_unit', { unit: 'hr', requester: 'mem_mcit' }),
      row('b_cons', { unit: 'cons', requester: 'mem_mcit', createdBy: 'mem_mcit' }),
      row('b_none'),
    ],
    variants: requestVariants,
    changes: requestChanges,
  },
  {
    name: 'mcit_it',
    rows: [
      row('it_req', { unit: 'ee', requester: 'mem_ee', owner: 'mem_mcit', createdBy: 'mem_ee' }),
      row('it_creator', { unit: 'fnl', requester: 'mem_mcit', createdBy: 'mem_fnl' }),
      row('it_unit', { unit: 'hr', requester: 'mem_mcit' }),
      row('it_sng', { unit: 'sng', requester: 'mem_mcit' }),
      row('it_none'),
    ],
    variants: requestVariants,
    changes: requestChanges,
  },
  {
    name: 'mcit_accounts',
    rows: [row('a_one', { custodian: 'mem_mcit', backup: 'dir_ee', hidden: false }), row('a_hid', { hidden: true })],
    variants: (me) => [{}, { custodian: me.id }, { hidden: true }],
    changes: (me) => [{ note: 'x' }, { custodian: me.id }, { hidden: true }],
  },
]);
