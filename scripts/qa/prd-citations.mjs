// Lists every PRD node id (from the saved planning workspace) that the prototype source cites in a comment or string,
// with file:line references. Used to build docs/audit/traceability-matrix.md.
// Usage: node scripts/qa/prd-citations.mjs [source-dir] > out.json   (default source-dir: frontend/prototype)
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join, relative} from 'node:path';

const dir = process.argv[2] || 'frontend/prototype';
const ws = JSON.parse(readFileSync('.planning/dwdg-one-prd/state/planning-workspace.json', 'utf8'));
const byId = Object.fromEntries(ws.prd.nodes.map(n => [n.id, n]));
const files = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (/\.(js|mjs|ts|tsx)$/.test(f) && !/(^|[\\/])(qa|assets|i18n)\.js$/.test(p) && !/\.test\./.test(f)) files.push(p); } })(dir);
const hits = {};
for (const f of files) {
  readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
    for (const m of line.matchAll(/[a-z][a-z0-9]*(?:[-_][a-z0-9]+)+/g)) {
      if (byId[m[0]]) (hits[m[0]] ||= new Set()).add(`${relative(dir, f).split('\\').join('/')}:${i + 1}`);
    }
  });
}
const out = Object.entries(hits).sort(([a], [b]) => a.localeCompare(b)).map(([id, refs]) => ({id, title: byId[id].title, status: byId[id].status, parent: byId[id].parent, refs: [...refs]}));
process.stdout.write(JSON.stringify(out, null, 1));
