// Runs the ORIGINAL prototype (frontend/prototype, untouched) in happy-dom, opens every page so that all lazily seeded
// stores are created, and returns the resulting `db` object. This is what a fully used demo browser would hold.
//   node supabase/tools/export-demo-db.mjs out.json
// happy-dom comes from the repository root (it is a dev dependency of the old project, not of next-app).

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const proto = path.join(here, '../../../frontend/prototype/');
const ORDER = ['core/assets.js', 'core/icons.js', 'core/data.js', 'core/i18n.js', 'core/app.js', 'core/persistence.js', 'screens/work.js', 'screens/plan.js',
  'screens/perf.js', 'screens/accounts.js', 'divisions/div-hr-sng.js', 'divisions/div-ee-cons.js', 'divisions/div-fnl-mcit.js', 'screens/friendly.js',
  'screens/calm-shell.js', 'screens/simple.js', 'screens/handin.js', 'screens/pins.js', 'screens/people.js', 'core/ui-polish.js', 'screens/schedule.js'];

export async function exportDemoDb() {
  const {Window} = await import('happy-dom');
  const w = new Window({url: 'http://localhost/frontend/prototype/index.html'});
  w.document.write('<!doctype html><html><body class="ds"><div id="app"></div><div id="layer"></div><div id="toast"></div></body></html>');
  w.matchMedia = w.matchMedia || (() => ({matches: false, addEventListener() {}, addListener() {}}));
  const src = ORDER.map(f => fs.readFileSync(proto + f, 'utf8')).join('\n;\n') + `
;window.__errs = [];
const T = (n, f) => { try { f(); } catch (e) { window.__errs.push(n + ': ' + String(e.message).slice(0, 150)); } };
session.preview = true;
for (const p of Object.keys(PAGES)) for (const who of ['mahdy', 'reza', 'rani']) T(p + ' ' + who, () => { session.me = who; session.ws = person(who).div || 'sng'; location.hash = '#/' + p; render(); });
window.__r = {db: JSON.parse(JSON.stringify(db)), errs: window.__errs};`;
  w.eval(src);
  // JSON from the happy-dom realm has foreign prototypes; copy it into this realm.
  return {db: JSON.parse(JSON.stringify(w.__r.db)), errs: [...w.__r.errs]};
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const {db, errs} = await exportDemoDb();
  fs.writeFileSync(process.argv[2] || 'demo-db.json', JSON.stringify(db, null, 1));
  console.log(`exported ${Object.keys(db).length} top-level keys, ${errs.length} render errors`);
}
