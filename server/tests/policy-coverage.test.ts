import { describe, expect, it } from 'vitest';
import { DIVISION_IDS, TABLE_HOME } from '../src/generated/partition.ts';
import { TABLE_POLICIES, hasPolicies, policyFor } from '../src/lib/policy/index.ts';

describe('every division table has an access rule', () => {
  const divisionTables = Object.entries(TABLE_HOME).filter(([, home]) => home !== 'hub').map(([name]) => name);

  it('covers all 35 tables of the six divisions and nothing else', () => {
    expect(divisionTables).toHaveLength(35);
    expect(Object.keys(TABLE_POLICIES).sort()).toEqual([...divisionTables].sort());
    for (const t of divisionTables) expect(policyFor(t), t).toBeDefined();
    expect(policyFor('tasks')).toBeUndefined(); // the hub's tables are the hub's business
    expect(policyFor('pg_user')).toBeUndefined();
  });

  it('serves a division only when ALL its tables have a rule', () => {
    for (const d of DIVISION_IDS) expect(hasPolicies(d), d).toBe(true);
    const withoutOne = Object.fromEntries(Object.entries(TABLE_POLICIES).filter(([name]) => name !== 'hr_rounds'));
    expect(hasPolicies('hr', withoutOne)).toBe(false);
    expect(hasPolicies('fnl', withoutOne)).toBe(true);
    expect(hasPolicies('hr', {})).toBe(false);
  });

  it('names, for a rule that reads another table, a table that exists in the same division', () => {
    for (const [name, policy] of Object.entries(TABLE_POLICIES)) {
      for (const needed of policy.needs ?? []) expect(TABLE_HOME[needed], `${name} needs ${needed}`).toBe(TABLE_HOME[name]);
    }
    expect(TABLE_POLICIES.hr_assessments?.needs).toEqual(['hr_cycles']);
  });
});
