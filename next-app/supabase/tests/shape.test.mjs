// Checks, offline, that the table design can hold the whole prototype db and give it back unchanged.
//   node --test supabase/tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import {exportDemoDb} from '../tools/export-demo-db.mjs';
import {decompose, compose, uncovered, fkViolations, ALL_TABLES} from '../lib/workspace-shape.mjs';

const {db} = await exportDemoDb();
const sortKeys = v => Array.isArray(v) ? v.map(sortKeys) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k, sortKeys(v[k])])) : v;

test('every part of the prototype db is covered by a table or a stored value', () => {
  assert.deepEqual(uncovered(db), []);
});

test('rows have unique ids per table', () => {
  const rows = decompose(db);
  for (const [name, list] of Object.entries(rows)) assert.equal(new Set(list.map(r => r.id)).size, list.length, name);
});

test('decompose then compose gives the same db (also the same key order)', () => {
  const back = compose(decompose(db));
  assert.deepEqual(sortKeys(back), sortKeys(db));
  assert.equal(JSON.stringify(back.tasks), JSON.stringify(db.tasks));
  assert.equal(JSON.stringify(back.cons), JSON.stringify(db.cons));
});

test('foreign keys hold for the full demo data', () => {
  assert.deepEqual(fkViolations(decompose(db)), []);
});

test('a store that was never opened stays absent', () => {
  const small = {v: 2, people: [], tasks: [], offers: [], projects: [], milestones: [], blockers: [], decisions: [], meetings: [], unavailable: [], gbusy: [], resources: [], updates: [], changes: []};
  const back = compose(decompose(small));
  assert.deepEqual(sortKeys(back), sortKeys(small));
  assert.equal('hr' in back, false);
  assert.equal('pins' in back, false);
});

test('lists whose items have no id are stored by position (ee.postpones)', () => {
  const withPost = structuredClone(db);
  withPost.ee.postpones = [{task: 'ee-f1', from: '2026-10-01', to: '2026-10-05', reason: 'x', by: 'rani', at: '2026-10-01T10:00'}, {task: 'ee-f1', from: '2026-10-05', to: '2026-10-06', reason: 'y', by: 'rani', at: '2026-10-05T10:00'}];
  const rows = decompose(withPost);
  assert.deepEqual(rows.ee_postpones.map(r => r.id), ['000000', '000001']);
  assert.deepEqual(compose(rows).ee.postpones, withPost.ee.postpones);
});

test('table count', () => { assert.equal(ALL_TABLES.length, 59); });
