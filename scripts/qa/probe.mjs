// Run a JS expression in the page and print the result, for comparing layout metrics. Usage: node scripts/qa/probe.mjs <base> "<expression>"
import {chromium} from 'playwright-core';
import {readFile} from 'node:fs/promises';
const [base, js] = process.argv.slice(2);
const seed = await readFile(new URL('../../database/seeds/demo-workspace.json', import.meta.url), 'utf8');
const b = await chromium.launch({channel: 'chrome'});
const ctx = await b.newContext({viewport: {width: 1440, height: 900}, reducedMotion: 'reduce'});
await ctx.addInitScript(([s, db]) => { if (sessionStorage.getItem('qa-init')) return; localStorage.clear(); localStorage.setItem('dwdg-one-proto-session', s); localStorage.setItem('dwdg-one-proto-v2', db); sessionStorage.setItem('qa-init', '1'); }, [JSON.stringify({me: 'mahdy', ws: 'sng', lang: 'en', theme: 'light', preview: true}), seed]);
const p = await ctx.newPage();
await p.goto(base.includes('prototype') ? `${base}#/work` : `${base}work`); await p.waitForTimeout(600);
console.log(JSON.stringify(await p.evaluate(js), null, 1));
await b.close();
