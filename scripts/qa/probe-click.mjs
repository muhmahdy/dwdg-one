// Like probe.mjs, but first clicks the given texts in order. Usage: node scripts/qa/probe-click.mjs <base> "<click1>|<click2>" "<expression>" [sessionPatchJson]
import {chromium} from 'playwright-core';
import {readFile} from 'node:fs/promises';
const [base, clicks, js, patch = '{}'] = process.argv.slice(2);
const seed = await readFile(new URL('../../database/seeds/demo-workspace.json', import.meta.url), 'utf8');
const b = await chromium.launch({channel: 'chrome'});
const ctx = await b.newContext({viewport: {width: 1440, height: 900}, reducedMotion: 'reduce'});
await ctx.addInitScript(([s, db]) => { if (sessionStorage.getItem('qa-init')) return; localStorage.clear(); localStorage.setItem('dwdg-one-proto-session', s); localStorage.setItem('dwdg-one-proto-v2', db); sessionStorage.setItem('qa-init', '1'); }, [JSON.stringify({me: 'mahdy', ws: 'sng', lang: 'en', theme: 'light', preview: true, ...JSON.parse(patch)}), seed]);
const p = await ctx.newPage();
await p.goto(base.includes('prototype') ? `${base}#/${process.env.ROUTE ?? 'work'}` : `${base}${process.env.ROUTE ?? 'work'}`); await p.waitForTimeout(600);
for (const text of clicks ? clicks.split('|') : []) { await (text.startsWith('css=') ? p.locator(text.slice(4)) : p.getByText(text, {exact: false})).first().click(); await p.waitForTimeout(500); }
console.log(JSON.stringify(await p.evaluate(js), null, 1));
await b.close();
