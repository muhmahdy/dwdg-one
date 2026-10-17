// Checks, offline, that the split into one hub and six division projects is complete and clean:
// every table and stored value has exactly one home, no foreign key reaches into another project, the generated SQL of a
// division has no policy and names only its own tables, and the pieces put back together are the original workspace.
//   node --test database/tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {TABLES, VALUES, VALUE_LOCKED, HUB, SPOKES, HOMES, homeOfTable, homeOfValue, tablesOf, valuesOf} from '../schema/schema-spec.mjs';
import {exportDemoDb} from '../../scripts/database/export-demo-db.mjs';
import {decompose, compose, ALL_TABLES, VALUES_TABLE} from '../../scripts/database/lib/workspace-shape.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8').replace(/\r\n/g, '\n');
const readDir = d => fs.readdirSync(path.join(root, d)).sort().map(f => ({file: `${d}/${f}`, sql: read(`${d}/${f}`)}));
const {db} = await exportDemoDb();
// Comments are prose (the base says "projects"); only the code counts.
const wordIn = (name, text) => new RegExp(`\\b${name}\\b`).test(text.replace(/--.*$/gm, ''));

test('every table has exactly one home, and the homes are the hub and the six divisions', () => {
  assert.deepEqual(HOMES, ['hub', 'ee', 'mcit', 'hr', 'fnl', 'sng', 'cons']);
  for (const t of TABLES) assert.ok(HOMES.includes(t.home), `${t.name} has home ${t.home}`);
  const all = HOMES.flatMap(h => tablesOf(h).map(t => t.name));
  assert.equal(new Set(all).size, TABLES.length);
  assert.equal(all.length, TABLES.length);
});

test('table counts per home match the migration plan', () => {
  const counts = Object.fromEntries(HOMES.map(h => [h, tablesOf(h).length]));
  assert.deepEqual(counts, {hub: 23, ee: 7, mcit: 5, hr: 9, fnl: 7, sng: 2, cons: 5});
  assert.equal(homeOfTable('people'), HUB);
  assert.equal(ALL_TABLES.length, 59);
});

test('a division owns exactly the tables that carry its prefix', () => {
  for (const s of SPOKES) for (const t of tablesOf(s)) assert.ok(t.name.startsWith(`${s}_`), `${t.name} in ${s}`);
  for (const t of tablesOf(HUB)) for (const s of SPOKES) assert.ok(!t.name.startsWith(`${s}_`), `${t.name} is in the hub`);
});

test('every stored value has one home; division values go with the division, locked ones stay locked', () => {
  const all = HOMES.flatMap(h => valuesOf(h));
  assert.equal(new Set(all).size, VALUES.length);
  assert.deepEqual(valuesOf('fnl').sort(), ['fnl.drafts', 'fnl.grants', 'fnl.policy', 'fnl.v']);
  assert.deepEqual(valuesOf('mcit').sort(), ['mcit.drafts', 'mcit.grants', 'mcit.v']);
  assert.deepEqual(valuesOf(HUB).sort(), ['acct.office', 'acct.v', 'lookV', 'perf.v', 'pgSeeded', 'rmSeeded', 'v']);
  assert.deepEqual(VALUE_LOCKED.map(homeOfValue).sort(), ['fnl', 'fnl', 'hub', 'mcit']);
});

test('the only foreign key that reaches into another project is sng_initiatives.project -> projects', () => {
  const crossing = TABLES.flatMap(t => Object.entries(t.fk || {})
    .filter(([, target]) => homeOfTable(target) !== t.home)
    .map(([col, target]) => `${t.name}.${col} -> ${target}`));
  assert.deepEqual(crossing, ['sng_initiatives.project -> projects']);
  assert.deepEqual(JSON.parse(read('schema/generated/partition.json')).droppedForeignKeys.map(d => `${d.table}.${d.col} -> ${d.target}`), crossing);
});

test('the pieces put back together are the original workspace, and no piece holds a foreign table', () => {
  const rows = decompose(db);
  const pieces = Object.fromEntries(HOMES.map(h => {
    const names = new Set([...(h === HUB ? ['people'] : []), ...tablesOf(h).map(t => t.name)]);
    const piece = Object.fromEntries(Object.entries(rows).filter(([n]) => names.has(n)));
    piece[VALUES_TABLE] = rows[VALUES_TABLE].filter(r => homeOfValue(r.id) === h);
    return [h, piece];
  }));
  for (const h of HOMES) for (const n of Object.keys(pieces[h])) assert.ok(n === VALUES_TABLE || (h === HUB && n === 'people') || homeOfTable(n) === h, `${n} in ${h}`);
  const merged = {};
  for (const h of HOMES) for (const [n, list] of Object.entries(pieces[h])) merged[n] = [...(merged[n] || []), ...list];
  assert.equal(JSON.stringify(compose(merged)), JSON.stringify(compose(rows)));
  assert.equal(Object.values(pieces).reduce((n, p) => n + Object.values(p).reduce((m, l) => m + l.length, 0), 0), Object.values(rows).reduce((n, l) => n + l.length, 0));
});

test('hub SQL: every table has the four policies, nothing mentions a division table, the HR-only helper is gone', () => {
  const files = readDir('hub/migrations');
  const sql = files.map(f => f.sql).join('\n');
  const created = [...files.find(f => f.file.endsWith('_hub_tables.sql')).sql.matchAll(/^create table public\.(\w+) \(/gm)].map(m => m[1]);
  assert.deepEqual(created.sort(), [...tablesOf(HUB).map(t => t.name), 'store_values'].sort());
  for (const n of created) for (const cmd of ['select', 'insert', 'update', 'delete']) assert.match(sql, new RegExp(`create policy ${n}_${cmd} on public\\.${n} `), `${n} ${cmd}`);
  for (const t of TABLES.filter(t => t.home !== HUB)) assert.ok(!wordIn(t.name, sql), `${t.name} appears in the hub SQL`);
  assert.ok(!sql.includes('create function app.hr_reviews'));
  assert.ok(/create table public\.audit_log/.test(sql) && /create table public\.division_progress/.test(sql));
});

test('hub load and save accept exactly the hub tables', () => {
  const sql = read(`hub/migrations/${fs.readdirSync(path.join(root, 'hub/migrations')).find(f => f.endsWith('_hub_load_and_save.sql'))}`);
  const list = sql.match(/array\[([^\]]*)\]/)[1].split(',').map(s => s.trim().replace(/'/g, ''));
  assert.deepEqual(list.sort(), ['people', ...tablesOf(HUB).map(t => t.name), 'store_values'].sort());
});

for (const slug of SPOKES) {
  test(`${slug} SQL: row level security on, no policy, no browser grant, only its own tables`, () => {
    const files = readDir(`spoke/${slug}/migrations`);
    assert.equal(files.length, 1);
    const sql = files[0].sql;
    const own = tablesOf(slug).map(t => t.name);
    const created = [...sql.matchAll(/^create table public\.(\w+) \(/gm)].map(m => m[1]);
    assert.deepEqual(created.sort(), [...own].sort());
    for (const n of own) {
      assert.match(sql, new RegExp(`alter table public\\.${n} enable row level security;`), `${n} rls`);
      assert.match(sql, new RegExp(`revoke all on public\\.${n} from anon, authenticated;`), `${n} revoke`);
      assert.ok(!new RegExp(`to authenticated`).test(sql.split('\n').filter(l => l.includes(`public.${n} `)).join('\n')), `${n} granted to authenticated`);
    }
    assert.ok(!/create policy/.test(sql), 'a policy in a division project');
    assert.ok(!/\bapp\.(me_|sees_div|can_|is_|unit_lead|hr_)/.test(sql), 'a policy helper in a division project');
    for (const t of TABLES.filter(t => t.home !== slug)) assert.ok(!wordIn(t.name, sql), `${t.name} appears in ${slug}`);
    assert.match(sql, /insert into public\.row_tables/);
    for (const n of own) assert.match(sql, new RegExp(`\\(\\s*'${n}'\\s*\\)`), `${n} registered`);
    // Foreign keys stay inside the division.
    for (const m of sql.matchAll(/references public\.(\w+) \(id\)/g)) assert.ok(own.includes(m[1]), `${m[1]} is outside ${slug}`);
  });
}

test('the spoke base is one file, locks every table down and gives the browser roles nothing', () => {
  const files = readDir('spoke/base/migrations');
  assert.equal(files.length, 1);
  const sql = files[0].sql;
  assert.ok(!/create policy/.test(sql));
  for (const n of ['schema_meta', 'row_tables', 'store_values']) {
    assert.match(sql, new RegExp(`alter table public\\.${n} enable row level security;`));
  }
  assert.match(sql, /revoke all on public\.schema_meta, public\.row_tables, public\.store_values from anon, authenticated;/);
  assert.match(sql, /revoke all on function public\.load_rows\(text\[\]\) from public, anon, authenticated;/);
  assert.match(sql, /revoke all on function public\.apply_rows\(text\) from public, anon, authenticated;/);
  assert.ok(!/grant execute on function public\.\w+\([^)]*\) to [^;]*(authenticated|anon)/.test(sql));
  for (const t of TABLES) assert.ok(!wordIn(t.name, sql), `${t.name} appears in the base`);
});

test('division migrations sort after the base, and the hub registry sorts after the hub load/save', () => {
  const base = fs.readdirSync(path.join(root, 'spoke/base/migrations'))[0];
  for (const s of SPOKES) assert.ok(base < fs.readdirSync(path.join(root, `spoke/${s}/migrations`))[0]);
  const hub = fs.readdirSync(path.join(root, 'hub/migrations')).sort();
  assert.deepEqual(hub.map(f => f.replace(/^\d+_/, '')), ['hub_foundation.sql', 'hub_tables.sql', 'hub_load_and_save.sql', 'hub_registry.sql']);
});
