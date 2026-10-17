import { describe, expect, it } from 'vitest';
import { TABLE_HOME, homeOfValue } from '../src/generated/partition.ts';
import { homeOfTable, keepHubRows, splitChanges } from '../src/lib/workspace/partition.ts';

const row = (id: string) => ({ id, pos: 0, doc: { id } });

describe('where a table lives', () => {
  it('matches the database spec: 24 hub tables (people included), 35 division tables', () => {
    const homes = Object.values(TABLE_HOME);
    expect(homes.filter((h) => h === 'hub')).toHaveLength(24);
    expect(homes.filter((h) => h !== 'hub')).toHaveLength(35);
    expect(homeOfTable('tasks')).toBe('hub');
    expect(homeOfTable('acct_invites')).toBe('hub');
    expect(homeOfTable('hr_assessments')).toBe('hr');
    expect(homeOfTable('cons_kn')).toBe('cons');
    expect(homeOfTable('store_values')).toBe('hub');
    expect(homeOfTable('pg_user')).toBeUndefined();
  });

  it('puts a stored value with its division: fnl.grants goes to fnl, lookV and acct.office stay in the hub', () => {
    expect(homeOfValue('fnl.grants')).toBe('fnl');
    expect(homeOfValue('mcit.v')).toBe('mcit');
    expect(homeOfValue('lookV')).toBe('hub');
    expect(homeOfValue('acct.office')).toBe('hub');
    expect(homeOfValue('perf.v')).toBe('hub');
    expect(homeOfValue('unknown.thing')).toBe('hub');
  });
});

describe('keepHubRows', () => {
  it('drops division tables and the stored values that belong to a division', () => {
    const out = keepHubRows({
      tasks: [row('t1')],
      people: [row('p1')],
      hr_assessments: [row('a1')],
      fnl_legal: [row('l1')],
      pg_user: [row('x')],
      store_values: [row('lookV'), row('fnl.grants'), row('acct.office'), row('hr.v')],
    });
    expect(Object.keys(out).sort()).toEqual(['people', 'store_values', 'tasks']);
    expect((out.store_values as { id: string }[]).map((r) => r.id)).toEqual(['lookV', 'acct.office']);
  });
});

describe('splitChanges', () => {
  it('sends hub tables to the hub and division tables to their division', () => {
    const s = splitChanges({
      tasks: { upsert: [row('t1')], delete: ['t0'] },
      hr_notices: { upsert: [row('n1')] },
      ee_orgs: { delete: ['o1'] },
    });
    expect(Object.keys(s.hub)).toEqual(['tasks']);
    expect(s.hub.tasks).toEqual({ upsert: [row('t1')], delete: ['t0'] });
    expect(Object.keys(s.divisions).sort()).toEqual(['ee', 'hr']);
    expect(s.divisions.hr?.hr_notices?.upsert).toEqual([row('n1')]);
    expect(s.divisions.ee?.ee_orgs?.delete).toEqual(['o1']);
    expect(s.unknown).toEqual([]);
  });

  it('splits stored values row by row', () => {
    const s = splitChanges({
      store_values: { upsert: [row('lookV'), row('fnl.policy'), row('mcit.drafts')], delete: ['hr.v', 'v'] },
    });
    expect(s.hub.store_values).toEqual({ upsert: [row('lookV')], delete: ['v'] });
    expect(s.divisions.fnl?.store_values?.upsert).toEqual([row('fnl.policy')]);
    expect(s.divisions.mcit?.store_values?.upsert).toEqual([row('mcit.drafts')]);
    expect(s.divisions.hr?.store_values?.delete).toEqual(['hr.v']);
  });

  it('reports tables that do not exist and leaves empty tables out', () => {
    const s = splitChanges({ pg_user: { delete: ['x'] }, tasks: {}, projects: { upsert: [] } });
    expect(s.unknown).toEqual(['pg_user']);
    expect(s.hub).toEqual({});
  });
});
