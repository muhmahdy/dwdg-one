// Captures pages of a running dwdg'ONE build so the React migration can be compared with the prototype.
// Both builds start from the same demo workspace (database/seeds/demo-workspace.json) and the same session.
// Usage: node scripts/qa/capture-screens.mjs <base-url> <out-dir> [route,route,...]
//   prototype: node scripts/qa/capture-screens.mjs http://127.0.0.1:5180/frontend/prototype/index.html qa/refactor-baseline
//   react:     node scripts/qa/capture-screens.mjs http://127.0.0.1:5175/ qa/refactor-react work,projects
// Uses the installed Chrome through playwright-core, so no browser download is needed.
import {chromium} from 'playwright-core';
import {mkdir, readFile} from 'node:fs/promises';
import {join} from 'node:path';

const [base, out, only] = process.argv.slice(2);
if (!base || !out) { console.error('usage: capture-screens.mjs <base-url> <out-dir> [routes]'); process.exit(1); }

// Ship 1 pages, then the pages behind the Release preview switch (session.preview).
const SHIP = ['work', 'operations', 'updates', 'updates/activity', 'projects', 'projects/p-roadmap', 'projects/p-roadmap/wbs',
  'projects/p-roadmap/people', 'projects/p-roadmap/resources', 'programs', 'resources', 'schedule', 'settings', 'organisation',
  'performance', 'attention', 'members', 'invites', 'appointments', 'handover', 'attendance', 'monitoring', 'recognition'];
const LATER = ['changes', 'oversight', 'hr-people', 'initiatives', 'decisions', 'relationships', 'opportunities', 'followups',
  'engagements', 'staffing', 'knowledge', 'cohorts', 'fnl-requests', 'budget', 'register', 'period-reviews', 'content',
  'it-requests', 'accounts-register'];
const VIEWPORTS = {desktop: {width: 1440, height: 900}, mobile: {width: 390, height: 844}};
const SESSION = {me: 'mahdy', ws: 'sng', lang: 'en', theme: 'light', preview: true};
const seed = await readFile(new URL('../../database/seeds/demo-workspace.json', import.meta.url), 'utf8');
const routes = only ? only.split(',') : [...SHIP, ...LATER];
const variants = only ? [] : [['work-dark', {theme: 'dark'}], ['work-compact', {look: 'compact'}], ['work-simple', {look: 'simple'}], ['work-id', {lang: 'id'}]];
const url = r => base.includes('prototype') ? `${base}#/${r}` : `${base.replace(/\/$/, '')}/${r}`;

const browser = await chromium.launch({channel: 'chrome'});
for (const [vp, size] of Object.entries(VIEWPORTS)) {
  const dir = join(out, vp); await mkdir(dir, {recursive: true});
  const ctx = await browser.newContext({viewport: size, deviceScaleFactor: 1, reducedMotion: 'reduce'});
  await ctx.addInitScript(([s, db]) => {
    if (sessionStorage.getItem('qa-init')) return;
    localStorage.clear();
    localStorage.setItem('dwdg-one-proto-session', s);
    localStorage.setItem('dwdg-one-proto-v2', db);
    sessionStorage.setItem('qa-init', '1');
  }, [JSON.stringify(SESSION), seed]);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(`${page.url()}: ${e.message}`));
  for (const route of routes) {
    await page.goto(url(route));
    await page.waitForTimeout(500);
    await page.screenshot({path: join(dir, `${route.replaceAll('/', '__')}.png`)});
  }
  for (const [name, patch] of variants) {
    await page.evaluate(p => { const s = JSON.parse(localStorage.getItem('dwdg-one-proto-session')); localStorage.setItem('dwdg-one-proto-session', JSON.stringify({...s, ...p})); }, patch);
    await page.goto(url('work')); await page.reload(); await page.waitForTimeout(500);
    await page.screenshot({path: join(dir, `${name}.png`)});
    await page.evaluate(p => { const s = JSON.parse(localStorage.getItem('dwdg-one-proto-session')); for (const k of Object.keys(p)) delete s[k]; localStorage.setItem('dwdg-one-proto-session', JSON.stringify({...s, theme: 'light', lang: 'en'})); }, patch);
  }
  if (errors.length) console.log(`[${vp}] page errors:\n${errors.join('\n')}`);
  await ctx.close();
}
await browser.close();
console.log('done');
