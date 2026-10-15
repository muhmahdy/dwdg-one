// Extracts the prototype's static data into JSON for the React app, so translations, icons and demo records stay identical:
//   frontend/src/lib/i18n/dictionary.id.json   the complete English → Bahasa Indonesia dictionary (every file adds to it)
//   frontend/src/assets/generated/assets.json  interface icon paths, brand marks, wordmark and lockup
//   frontend/src/assets/generated/org.json     divisions and roles
//   database/seeds/demo-workspace.json         the demo workspace after every page has run its lazy seeding, as a fully used
//                                              demo browser holds it (scripts/database/export-demo-db.mjs); development and tests only
// Usage: node scripts/maintenance/extract-prototype-data.mjs   (re-run only while frontend/prototype is still the reference)
import {Window} from 'happy-dom';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {exportDemoDb} from '../database/export-demo-db.mjs';

const repo = join(dirname(fileURLToPath(import.meta.url)), '../..');
const proto = join(repo, 'frontend/prototype');
const html = await readFile(join(proto, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);

const window = new Window({url: 'http://localhost/frontend/prototype/index.html#/work'});
window.document.body.innerHTML = '<div id="app"></div><div id="layer"></div><div id="toast"></div>';
window.matchMedia = window.matchMedia || (() => ({matches: false, addEventListener() {}}));
let program = '';
for (const s of scripts) program += `\n;/* ${s} */\n` + await readFile(join(proto, s), 'utf8');
program += '\n;window.__out = {dict: window.ID_DICT, assets: {ui: A.ui, brand: A.brand, wordmark: A.wordmark, lockup: A.lockup}, divisions: DIVS, roles: ROLES, today: window.DEMO.today};';
window.eval(program);
// Copy out of the happy-dom realm.
const out = JSON.parse(JSON.stringify(window.__out));
await window.happyDOM.close();
const {db: seed, errs} = await exportDemoDb();
if (errs.length) throw new Error(`demo export had render errors:\n${errs.join('\n')}`);

const write = async (rel, value) => { const f = join(repo, rel); await mkdir(dirname(f), {recursive: true}); await writeFile(f, JSON.stringify(value, null, 1) + '\n'); console.log(rel); };
await write('frontend/src/lib/i18n/dictionary.id.json', out.dict);
await write('frontend/src/assets/generated/assets.json', out.assets);
await write('frontend/src/assets/generated/org.json', {divisions: out.divisions, roles: out.roles, demoToday: out.today});
await write('database/seeds/demo-workspace.json', seed);
console.log(`${Object.keys(out.dict).length} dictionary entries, ${Object.keys(out.assets.ui).length} ui icons, ${Object.keys(out.assets.brand).length} brand marks, ${seed.people.length} demo people`);
