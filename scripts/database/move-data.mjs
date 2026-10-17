// Moves a workspace (the prototype's `db` object, or the app's demo data) into the hub and the six division projects, then
// proves nothing was lost: row counts per table, and the data read back equals the data sent, key order included.
//
//   node scripts/database/move-data.mjs --demo                                  1. CHECK (default): no network. Rows per project and table,
//   node scripts/database/move-data.mjs --input export.json                        and the proof that the data rebuilds identically.
//
//   node --env-file=scripts/.env.local scripts/database/move-data.mjs --demo --target all
//        2. LOOK FIRST: reads the projects (writes nothing) and says what is in each, and what a move would add or change.
//
//   node --env-file=scripts/.env.local scripts/database/move-data.mjs --demo --target hub --apply
//   node --env-file=scripts/.env.local scripts/database/move-data.mjs --demo --target spoke:hr,spoke:fnl --apply
//        3. MOVE: writes each named project (one transaction per project), reads it back, compares row by row.
//
// --target is hub, spoke:<ee|mcit|hr|fnl|sng|cons>, a comma list of those, all, or legacy (today's single database, every table
// in one project). --apply needs an explicit --target: it never moves "everything" by default.
// --emails emails.json   { "personId": "name@example.com" } links people to Google accounts (sets people.email); hub only.
// --allow-extra          move even when a project already holds rows the source does not have (nothing is ever deleted).
// --allow-dangling       move even when a reference between projects points at a record that is not there.
//
// Connections (scripts/.env.local; operator machine only, service keys are secrets): SUPABASE_URL_<P> and SUPABASE_SERVICE_KEY_<P>
// for P in HUB, EE, MCIT, HR, FNL, SNG, CONS (the hub and `legacy` also answer to the old SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY). Two projects with the same address are refused.
//
// How to get export.json from the old prototype: open it in the browser, press F12, Console, run
//   copy(localStorage['dwdg-one-proto-v2'])
// and paste the clipboard into a file. (A clean `--demo` run needs no browser.)
// Run it on your own machine only, never in the browser and never in a deployed page.

import fs from 'node:fs';
import {compose, decompose, fkViolations, uncovered} from './lib/workspace-shape.mjs';
import {
  PROJECTS, assertDistinctProjects, credentialsFor, danglingCrossReferences, moveProject, parseTargets, partitionRows, planOf, supabaseTarget,
} from './lib/move.mjs';

const args = process.argv.slice(2);
const flag = n => args.includes(n);
const opt = n => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined);
const fail = message => { console.error(message); process.exit(1); };
const sortKeys = v => (Array.isArray(v) ? v.map(sortKeys) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k, sortKeys(v[k])])) : v);

async function readSource() {
  if (flag('--demo')) return (await (await import('./export-demo-db.mjs')).exportDemoDb()).db;
  const file = opt('--input');
  if (!file) fail('Give --input <export.json> or --demo. See the top of this file.');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const db = await readSource();
if (!db || db.v !== 2) fail('This is not a prototype workspace (expected "v": 2).');

// ---- 1. check: local, no network ----
const missing = uncovered(db);
if (missing.length) fail(`These parts of the data have no table and would be lost: ${missing.join(', ')}`);
const rows = decompose(db);
const broken = fkViolations(rows);
if (broken.length) fail(`These references point at records that do not exist:\n  ${broken.join('\n  ')}`);
if (JSON.stringify(sortKeys(compose(rows))) !== JSON.stringify(sortKeys(db))) fail('The data does not rebuild identically from its rows. Nothing was moved.');
let parts;
try { parts = partitionRows(rows); } catch (e) { fail(e.message); }
const dangling = danglingCrossReferences(rows);

const plan = planOf(parts);
console.log('project'.padEnd(10), 'table'.padEnd(28), 'rows');
for (const p of PROJECTS) {
  for (const [t, n] of Object.entries(plan[p])) console.log(p.padEnd(10), t.padEnd(28), n);
  console.log(p.padEnd(10), 'total'.padEnd(28), Object.values(plan[p]).reduce((a, n) => a + n, 0));
}
console.log(`Checked: every part of the data has a table, ids are unique, references inside a project are valid, the data rebuilds identically, and every table and stored value has exactly one project.`);
if (dangling.length) {
  console.log(`\nReferences between projects that point at nothing (the database can no longer catch these):\n  ${dangling.join('\n  ')}`);
  if (!flag('--allow-dangling')) console.log('A move is refused while these exist; fix them or add --allow-dangling.');
} else console.log('References between projects: all point at records that exist.');

const targets = (() => { try { return parseTargets(opt('--target')); } catch (e) { return fail(e.message); } })();
if (!targets && flag('--apply')) fail('--apply needs an explicit --target: hub, spoke:<division>, a comma list, all, or legacy. Nothing was moved.');
if (!targets) { console.log('\nCheck only. Add --target to look at the projects, and --apply to write to them.'); process.exit(dangling.length && !flag('--allow-dangling') ? 1 : 0); }
if (flag('--apply') && dangling.length && !flag('--allow-dangling')) fail('Nothing was moved: fix the references above or add --allow-dangling.');

// ---- 2 and 3. look first, or move ----
const apply = flag('--apply');
const creds = {};
for (const p of targets) { try { creds[p] = credentialsFor(p, process.env); } catch (e) { fail(e.message); } }
try { assertDistinctProjects(creds); } catch (e) { fail(e.message); }
const emails = opt('--emails') ? JSON.parse(fs.readFileSync(opt('--emails'), 'utf8')) : null;
if (emails && !targets.some(t => t === 'hub' || t === 'legacy')) fail('--emails belongs to the hub: add hub to --target.');

console.log(`\n${apply ? 'Moving' : 'Looking at'} ${targets.join(', ')}${apply ? '' : ' (nothing is written)'}.`);
let bad = 0;
for (const project of targets) {
  const mine = project === 'legacy' ? rows : parts[project];
  let result;
  try {
    const target = await supabaseTarget(project, creds[project]);
    result = await moveProject({project, rows: mine, target, apply, allowExtra: flag('--allow-extra'), emails: emails && (project === 'hub' || project === 'legacy') ? emails : null});
  } catch (e) { result = {project, ok: false, written: 0, problems: [e.message], extra: [], counts: {}}; }
  const lines = result.problems.filter(p => !p.startsWith('EXTRA'));
  const count = prefix => result.problems.filter(p => p.startsWith(prefix)).length;
  if (apply) console.log(`${project.padEnd(7)} ${result.ok ? 'moved and verified' : 'FAILED'}: ${result.written} rows written; read back: ${result.ok ? 'every table matches row for row' : `${lines.length} problem(s)`}.`);
  else console.log(`${project.padEnd(7)} holds ${Object.values(result.counts ?? {}).reduce((n, c) => n + c.found, 0)} of ${Object.values(result.counts ?? {}).reduce((n, c) => n + c.sent, 0)} rows: a move would add ${count('MISSING')} and change ${count('DIFFERENT')}; ${result.extra.length} extra row(s) in the project.`);
  if (result.extra.length) console.log(`        extra rows (never deleted by a move): ${result.extra.slice(0, 5).join(', ')}${result.extra.length > 5 ? ` and ${result.extra.length - 5} more` : ''}`);
  if (!result.ok || (apply && lines.length)) { bad++; for (const l of lines.slice(0, 10)) console.log('        ' + l); }
}
if (apply && emails) console.log(`Linked ${Object.keys(emails).length} e-mail address(es) in the hub.`);
if (bad) process.exit(1);
console.log(apply ? '\nDone: every moved project reads back exactly as it was sent.' : '\nNothing was written. Add --apply to move.');
