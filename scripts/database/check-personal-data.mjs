// Looks through the records of the sensitive divisions (HR, Finance & Legal) for personal data that must not be stored in
// plain text, and lists who holds authority over those two divisions. Run it on the demo data, and on an export of the real
// workspace BEFORE the real data goes into the HR and FnL projects. Prints where things are, never what they are.
//   node scripts/database/check-personal-data.mjs --demo
//   node scripts/database/check-personal-data.mjs --input export.json [--all] [--fail-on high|medium|low|none] [--max-authority 8]
// --input is a saved workspace (the app's `db` object, as written by export-demo-db.mjs). --all scans every table, not only
// hr_* and fnl_*. The exit code is 1 when a finding at or above --fail-on (default high) exists, or a division has more
// people with authority over it than --max-authority.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {authorityOver, scanRows, severityRank} from './lib/personal-data.mjs';
import {decompose} from './lib/workspace-shape.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const arg = name => { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : undefined; };
const input = process.argv.includes('--demo') ? path.join(here, '../../database/seeds/demo-workspace.json') : arg('--input');
if (!input) { console.error('Give --demo or --input <workspace.json>.'); process.exit(1); }
const failOn = arg('--fail-on') ?? 'high';
if (!['high', 'medium', 'low', 'none'].includes(failOn)) { console.error('--fail-on must be high, medium, low or none.'); process.exit(1); }
const maxAuthority = Number(arg('--max-authority') ?? 8);

const db = JSON.parse(fs.readFileSync(input, 'utf8'));
const rows = decompose(db);
const tables = process.argv.includes('--all') ? Object.keys(rows).filter(t => t !== 'store_values') : Object.keys(rows).filter(t => /^(hr|fnl)_/.test(t));

const findings = scanRows(rows, tables);
const records = tables.reduce((n, t) => n + (rows[t]?.length ?? 0), 0);
console.log(`Scanned ${records} records in ${tables.length} tables of ${path.basename(input)}.`);
if (findings.length === 0) console.log('No personal data found by name or by shape.');
for (const f of findings) console.log(`${f.severity.toUpperCase().padEnd(6)} ${f.table} ${f.id} ${f.path}: ${f.kind} (found by ${f.by})`);

let failed = failOn !== 'none' && findings.some(f => severityRank(f.severity) >= severityRank(failOn));
console.log('\nWho holds authority over the sensitive divisions (President, VP, Board, Admin, and the division\'s own directors and co-directors):');
for (const division of ['hr', 'fnl']) {
  const who = authorityOver(db.people ?? [], division);
  console.log(`  ${division}: ${who.length} people: ${who.map(p => `${p.id} (${p.role})`).join(', ')}`);
  if (who.length > maxAuthority) { console.log(`  ${division}: more than ${maxAuthority}. Review who needs this, and remove the rest.`); failed = true; }
}
console.log(failed ? '\nFAILED: see the lines above.' : '\nOK.');
process.exit(failed ? 1 : 0);
