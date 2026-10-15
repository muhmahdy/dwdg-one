// Moves a prototype workspace (the `db` object that lived in the browser's localStorage) into Supabase,
// then proves nothing was lost: row counts per table, and the data read back equals the data that was sent.
//
//   node scripts/database/move-data.mjs --input export.json            check only (default): what would be moved, no network
//   node scripts/database/move-data.mjs --demo                         same, using the prototype's built-in demo data
//   node --env-file=scripts/.env.local scripts/database/move-data.mjs --input export.json --apply
//   ... --emails emails.json     { "personId": "name@example.com" } links people to Google accounts (sets people.email)
//
// How to get export.json from the old prototype: open it in the browser, press F12, Console, run
//   copy(localStorage['dwdg-one-proto-v2'])
// and paste the clipboard into a file. (A clean `--demo` run needs no browser.)
//
// --apply needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local. The service-role key is a server secret:
// run this on your own machine only, never in the browser and never in a deployed page.

import fs from 'node:fs';
import {decompose, compose, uncovered, fkViolations, ALL_TABLES, VALUES_TABLE} from './lib/workspace-shape.mjs';

const args = process.argv.slice(2);
const flag = n => args.includes(n);
const opt = n => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined);

async function readSource() {
  if (flag('--demo')) {
    const {exportDemoDb} = await import('./export-demo-db.mjs');
    return (await exportDemoDb()).db;
  }
  const file = opt('--input');
  if (!file) throw new Error('Give --input <export.json> or --demo. See the top of this file.');
  const db = JSON.parse(fs.readFileSync(file, 'utf8'));
  return db;
}

const sortKeys = v => (Array.isArray(v) ? v.map(sortKeys) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k, sortKeys(v[k])])) : v);

const db = await readSource();
if (!db || db.v !== 2) throw new Error('This is not a prototype workspace (expected "v": 2).');

const missing = uncovered(db);
if (missing.length) throw new Error(`These parts of the data have no table and would be lost: ${missing.join(', ')}`);
const rows = decompose(db);
const broken = fkViolations(rows);
if (broken.length) throw new Error(`These references point at records that do not exist:\n  ${broken.join('\n  ')}`);

const names = [...ALL_TABLES.map(t => t.name), VALUES_TABLE];
console.log('table'.padEnd(28), 'rows');
for (const n of names) if (rows[n].length) console.log(n.padEnd(28), rows[n].length);
console.log('total'.padEnd(28), names.reduce((a, n) => a + rows[n].length, 0), `in ${names.filter(n => rows[n].length).length} tables`);
console.log('Checked: every part of the data has a table, ids are unique, references are valid, and the data rebuilds identically:',
  JSON.stringify(sortKeys(compose(rows))) === JSON.stringify(sortKeys(db)) ? 'yes' : 'NO');
if (JSON.stringify(sortKeys(compose(rows))) !== JSON.stringify(sortKeys(db))) process.exit(1);

if (!flag('--apply')) { console.log('\nCheck only. Add --apply to write to Supabase.'); process.exit(0); }

const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local and run with node --env-file=.env.local');
let createClient;
try { ({createClient} = await import('@supabase/supabase-js')); } catch { throw new Error('Run npm install first (needs @supabase/supabase-js).'); }
const supabase = createClient(url, key, {auth: {persistSession: false, autoRefreshToken: false}});

// One call, one transaction: either every row is written or none.
const payload = Object.fromEntries(names.filter(n => rows[n].length).map(n => [n, {upsert: rows[n]}]));
const imp = await supabase.rpc('import_workspace', {p: JSON.stringify(payload)});
if (imp.error) throw new Error(`Import failed, nothing was written: ${imp.error.message}`);

if (opt('--emails')) {
  const map = JSON.parse(fs.readFileSync(opt('--emails'), 'utf8'));
  for (const [id, email] of Object.entries(map)) {
    const r = await supabase.from('people').update({email: String(email).trim().toLowerCase()}).eq('id', id);
    if (r.error) throw new Error(`Could not set the e-mail of ${id}: ${r.error.message}`);
  }
  console.log(`Linked ${Object.keys(map).length} e-mail address(es).`);
}

// Verify: count rows per table, then read everything back and compare with what was sent.
let mismatches = 0;
for (const n of names) {
  const c = await supabase.from(n).select('id', {count: 'exact', head: true});
  if (c.error) throw new Error(`${n}: ${c.error.message}`);
  if (c.count !== rows[n].length) { mismatches++; console.log(`COUNT MISMATCH ${n}: sent ${rows[n].length}, found ${c.count}`); }
}
const back = await supabase.rpc('load_workspace');
if (back.error) throw new Error(back.error.message);
const same = JSON.stringify(sortKeys(compose(back.data))) === JSON.stringify(sortKeys(db));
console.log(`Row counts: ${mismatches ? mismatches + ' table(s) differ' : 'all tables match'}. Data read back equals data sent: ${same ? 'yes' : 'NO'}.`);
if (mismatches || !same) process.exit(1);
