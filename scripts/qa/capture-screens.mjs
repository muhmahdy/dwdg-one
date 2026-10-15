// Captures every page of a running dwdg'ONE build so the React migration can be compared with the prototype.
// Usage: node scripts/qa/capture-screens.mjs <base-url> <out-dir>
//   prototype: node scripts/qa/capture-screens.mjs http://127.0.0.1:5180/frontend/prototype/index.html qa/refactor-baseline
// Uses the installed Chrome through playwright-core, so no browser download is needed.
import {chromium} from 'playwright-core';
import {mkdir} from 'node:fs/promises';
import {join} from 'node:path';

const [base, out] = process.argv.slice(2);
if (!base || !out) { console.error('usage: capture-screens.mjs <base-url> <out-dir>'); process.exit(1); }

// Ship 1 pages, then the pages behind the Release preview switch (session.preview).
const SHIP = ['work', 'operations', 'updates', 'updates/activity', 'projects', 'projects/p-roadmap', 'projects/p-roadmap/wbs',
  'projects/p-roadmap/people', 'projects/p-roadmap/resources', 'programs', 'resources', 'schedule', 'settings', 'organisation',
  'performance', 'attention', 'members', 'invites', 'appointments', 'handover', 'attendance', 'monitoring', 'recognition'];
const LATER = ['changes', 'oversight', 'hr-people', 'initiatives', 'decisions', 'relationships', 'opportunities', 'followups',
  'engagements', 'staffing', 'knowledge', 'cohorts', 'fnl-requests', 'budget', 'register', 'period-reviews', 'content',
  'it-requests', 'accounts-register'];
const VIEWPORTS = {desktop: {width: 1440, height: 900}, mobile: {width: 390, height: 844}};
const SESSION = {me: 'mahdy', ws: 'sng', lang: 'en', theme: 'light', preview: true};

const browser = await chromium.launch({channel: 'chrome'});
for (const [vp, size] of Object.entries(VIEWPORTS)) {
  const dir = join(out, vp); await mkdir(dir, {recursive: true});
  const ctx = await browser.newContext({viewport: size, deviceScaleFactor: 1, reducedMotion: 'reduce'});
  await ctx.addInitScript(s => { if (!sessionStorage.getItem('qa-init')) { localStorage.clear(); localStorage.setItem('dwdg-one-proto-session', s); sessionStorage.setItem('qa-init', '1'); } }, JSON.stringify(SESSION));
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(`${page.url()}: ${e.message}`));
  for (const route of [...SHIP, ...LATER]) {
    await page.goto(`${base}#/${route}`);
    await page.waitForTimeout(400);
    await page.screenshot({path: join(dir, `${route.replaceAll('/', '__')}.png`), fullPage: false});
  }
  // Dark theme and the other two looks on My Work.
  for (const [name, patch] of [['work-dark', {theme: 'dark'}], ['work-compact', {look: 'compact'}], ['work-simple', {look: 'simple'}], ['work-id', {lang: 'id'}]]) {
    await page.evaluate(p => { const s = JSON.parse(localStorage.getItem('dwdg-one-proto-session')); localStorage.setItem('dwdg-one-proto-session', JSON.stringify({...s, ...p})); }, {...SESSION, ...patch});
    await page.goto(`${base}#/work`); await page.reload(); await page.waitForTimeout(400);
    await page.screenshot({path: join(dir, `${name}.png`)});
  }
  if (errors.length) console.log(`[${vp}] page errors:\n${errors.join('\n')}`);
  await ctx.close();
}
await browser.close();
console.log('done');
