// Screenshot one route with a session patch, optionally clicking visible texts first (separated by |; `css=<selector>` clicks a selector).
// Usage: node scripts/qa/shot.mjs <base> <route> <out.png> [sessionPatchJson] [width] [height] [clickText|clickText]
import {chromium} from 'playwright-core';
import {readFile} from 'node:fs/promises';
const [base, route, out, patch = '{}', w = '1440', h = '900', click = ''] = process.argv.slice(2);
const seed = await readFile(new URL('../../database/seeds/demo-workspace.json', import.meta.url), 'utf8');
const b = await chromium.launch({channel: 'chrome'});
const ctx = await b.newContext({viewport: {width: +w, height: +h}, reducedMotion: 'reduce'});
await ctx.addInitScript(([s, db]) => { if (sessionStorage.getItem('qa-init')) return; localStorage.clear(); localStorage.setItem('dwdg-one-proto-session', s); localStorage.setItem('dwdg-one-proto-v2', db); sessionStorage.setItem('qa-init', '1'); }, [JSON.stringify({me: 'mahdy', ws: 'sng', lang: 'en', theme: 'light', preview: true, ...JSON.parse(patch)}), seed]);
const p = await ctx.newPage();
p.on('pageerror', e => console.log('ERR', e.message));
await p.goto(base.includes('prototype') ? `${base}#/${route}` : `${base}${route}`); await p.waitForTimeout(700);
for (const text of click ? click.split('|') : []) { await (text.startsWith('css=') ? p.locator(text.slice(4)) : p.getByText(text, {exact: false})).first().click(); await p.waitForTimeout(500); }
await p.screenshot({path: out}); await b.close();
