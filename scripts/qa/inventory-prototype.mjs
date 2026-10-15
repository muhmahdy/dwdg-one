// Loads the prototype scripts in index.html order inside happy-dom and records which file registers each
// page, inspector panel, menu, action and input handler. Output: JSON on stdout.
// Usage: node scripts/qa/inventory-prototype.mjs > docs/audit/prototype-registry.json
import {Window} from 'happy-dom';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../frontend/prototype');
const html = await readFile(join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);

const window = new Window({url: 'http://localhost/frontend/prototype/index.html#/work'});
const {document} = window;
document.body.innerHTML = '<div id="app"></div><div id="layer"></div><div id="toast"></div>';
window.localStorage.setItem('dwdg-one-proto-session', JSON.stringify({me: 'mahdy', ws: 'sng', lang: 'en', preview: true}));
window.matchMedia = window.matchMedia || (() => ({matches: false, addEventListener() {}}));

const REG = ['PAGES', 'INSP', 'ACT', 'MENUS', 'ON_INPUT', 'ON_CHANGE', 'CAPS'];
const owner = Object.fromEntries(REG.map(r => [r, {}]));
// Classic scripts share one global lexical scope, so they run as one program with a probe after each file
// that records the registry keys that file added.
let program = '';
for (const s of scripts) {
  program += `\n;/* ${s} */\n` + await readFile(join(root, s), 'utf8');
  program += `\n;window.__probe && window.__probe(${JSON.stringify(s)}, {${REG.map(r => `${r}: (() => { try { return Object.keys(${r}); } catch { return []; } })()`).join(',')}});\n`;
}
const seen = Object.fromEntries(REG.map(r => [r, new Set()]));
window.__probe = (file, regs) => {
  for (const r of REG) for (const k of regs[r]) {
    if (!seen[r].has(k)) { seen[r].add(k); owner[r][k] = [file]; }
  }
};
const errors = [];
window.addEventListener('error', e => errors.push(String(e.message)));
try { window.eval(program); } catch (e) { errors.push(String(e && e.stack || e)); }
document.dispatchEvent(new window.Event('DOMContentLoaded'));

const out = {scripts, counts: Object.fromEntries(REG.map(r => [r, Object.keys(owner[r]).length])), owner, onKeyHandlers: (() => { try { return window.eval('ON_KEY.length'); } catch { return null; } })(), errors};
process.stdout.write(JSON.stringify(out, null, 1));
await window.happyDOM.close();
