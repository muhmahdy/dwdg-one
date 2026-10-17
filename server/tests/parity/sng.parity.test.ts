/* Strategy & Growth and the stored values: the database's policies and the server's rules over the same people and rows. */
import { describe, expect, it } from 'vitest';
import { mayWrite, policyFor } from '../../src/lib/policy/index.ts';
import { happens, principalOf } from './pg.ts';
import { parityTests, row } from './policy-parity.ts';

const { db } = parityTests([
  {
    name: 'sng_initiatives',
    rows: [
      row('i_mem', { owner: 'mem_sng', createdBy: 'dir_sng' }),
      row('i_ee_creator', { owner: 'dir_sng', createdBy: 'mem_ee' }),
      row('i_ee_owner', { owner: 'mem_ee', createdBy: 'dir_sng' }),
      row('i_plain', { owner: 'dir_sng', createdBy: 'dir_sng' }),
      row('i_none'),
    ],
    noDelete: ['i_plain'], // the packets below point at it
    variants: (me) => [{}, { owner: me.id }, { createdBy: me.id }, { reviewer: me.id }, { owner: 'someone_else' }],
    changes: (me) => [{ note: 'x' }, { owner: me.id }, { createdBy: me.id }, { owner: null, createdBy: null }],
  },
  {
    name: 'sng_packets',
    rows: [
      row('k_rev', { initiative: 'i_plain', reviewer: 'mem_ee', createdBy: 'dir_sng' }),
      row('k_sub', { initiative: 'i_plain', reviewer: 'dir_sng', submittedBy: 'mem_fnl' }),
      row('k_cre', { initiative: 'i_plain', createdBy: 'hr_mem' }),
      row('k_none', { initiative: 'i_plain' }),
    ],
    variants: (me) => [{}, { reviewer: me.id }, { submittedBy: me.id }, { createdBy: me.id }, { owner: 'someone_else' }],
    changes: (me) => [
      { note: 'x' },
      { reviewer: me.id },
      { submittedBy: me.id },
      { createdBy: me.id },
      { reviewer: null, submittedBy: null, createdBy: null },
    ],
  },
  {
    name: 'store_values',
    rows: [row('sng.v'), row('lookV'), row('fnl.grants'), row('acct.office')],
    variants: () => [{}],
    changes: () => [{ value: 9 }],
    openToAll: true,
  },
]);

describe('store_values: the locked values', () => {
  it('only the President, the VP or an Admin may change fnl.grants and acct.office; anyone who can write may change sng.v', async () => {
    const policy = policyFor('store_values');
    if (!policy) throw new Error('no rule');
    const outcomes = new Set<string>();
    for (const person of ['mem_sng', 'pres', 'vpx', 'adm', 'brd', 'dir_sng']) {
      const p = await principalOf(person);
      for (const id of ['sng.v', 'fnl.grants', 'acct.office']) {
        const sql = await happens(db(), person, `update public.store_values set doc = '{"value": 9}' where id = $1`, [id]);
        expect(mayWrite(policy, p, row(id)), `${person} ${id}`).toBe(sql);
        outcomes.add(`${id}:${sql}`);
      }
    }
    // both answers happen for the locked values, so the comparison above can fail
    expect(outcomes).toContain('fnl.grants:true');
    expect(outcomes).toContain('fnl.grants:false');
    expect(outcomes).toContain('sng.v:true');
  });
});
