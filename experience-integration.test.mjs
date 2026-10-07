import test from 'node:test';
import assert from 'node:assert/strict';
import { applyTask, deleteTask, makeSeed, progress, iso, addDays } from './model.mjs';
import { makeDivisionSeed, budgetBalance } from './division-workspaces.mjs';
import { createExperienceStore, EXPERIENCE_KEYS, emptyExtras, reminderItems, allSearchRecords, listAllDocuments } from './experience-data.mjs';
import { completionSeries } from './experience-ui.mjs';
import { renderDivision } from './experience-divisions.mjs';

class Storage {
  constructor(initial = {}) { this.values = new Map(Object.entries(initial)); this.fail = null; }
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { if (this.fail?.(key, value)) throw new Error('Storage unavailable'); this.values.set(key, value); }
  removeItem(key) { this.values.delete(key); }
}
const copy = value => structuredClone(value);
const DAY = iso();
const seriesFor = store => completionSeries(store.core.tasks, { start: addDays(DAY, -6), days: 7, today: DAY, recordedSince: store.extension.recordedSince });

test('task completion updates project totals, selected-day chart, reminders, search and reload from one saved source', () => {
  const storage = new Storage(), store = createExperienceStore(storage);
  const before = progress(store.core, 'onboard');
  assert.ok(reminderItems(store, DAY).some(row => row.recordId === 't2'));
  store.saveCore(applyTask(store.core, { ...store.core.tasks.find(task => task.id === 't2'), status: 'done', evidence: 'Reviewed final welcome kit' }, DAY));
  assert.equal(progress(store.core, 'onboard').done, before.done + 1);
  assert.equal(seriesFor(store).entries.find(entry => entry.date === DAY).count, 1);
  assert.equal(reminderItems(store, DAY).some(row => row.recordId === 't2'), false);
  assert.match(allSearchRecords(store).find(row => row.type === 'task' && row.id === 't2').text, /Reviewed final welcome kit/);
  const reloaded = createExperienceStore(storage);
  assert.deepEqual(progress(reloaded.core, 'onboard'), progress(store.core, 'onboard'));
  assert.deepEqual(seriesFor(reloaded), seriesFor(store));
  assert.deepEqual(reminderItems(reloaded, DAY), reminderItems(store, DAY));
  store.undo();
  assert.deepEqual(progress(store.core, 'onboard'), before);
  assert.equal(seriesFor(store).entries.find(entry => entry.date === DAY).count, 0);
  assert.ok(reminderItems(store, DAY).some(row => row.recordId === 't2'));
});

test('sequential completions undo in reverse order without losing stable IDs or unrelated extension edits', () => {
  const store = createExperienceStore(new Storage()), originalTasks = copy(store.core.tasks);
  for (const id of ['t2', 't6', 't11']) store.saveCore(applyTask(store.core, { ...store.core.tasks.find(task => task.id === id), status: 'done' }, DAY));
  const next = copy(store.extension); next.preferences.language = 'id'; store.saveExtension(next);
  assert.equal(seriesFor(store).entries.at(-1).count, 3);
  store.undo(); assert.equal(store.extension.preferences.language, 'en');
  store.undo(); assert.equal(seriesFor(store).entries.at(-1).count, 2);
  store.undo(); assert.equal(seriesFor(store).entries.at(-1).count, 1);
  store.undo(); assert.deepEqual(store.core.tasks, originalTasks);
  assert.equal(store.canUndo, false);
});

test('undo history is bounded to twenty successful changes and a failed undo remains retryable', () => {
  const storage = new Storage(), store = createExperienceStore(storage);
  for (let index = 1; index <= 25; index += 1) { const next = copy(store.core); next.profile.name = `Revision ${index}`; store.saveCore(next); }
  storage.fail = key => key === EXPERIENCE_KEYS.core;
  assert.throws(() => store.undo(), /not saved/);
  assert.equal(store.core.profile.name, 'Revision 25');
  assert.equal(store.canUndo, true);
  storage.fail = null;
  let count = 0; while (store.undo()) count += 1;
  assert.equal(count, 20);
  assert.equal(store.core.profile.name, 'Revision 5');
  assert.equal(JSON.parse(storage.getItem(EXPERIENCE_KEYS.core)).profile.name, 'Revision 5');
});

test('legacy completed tasks without dates remain unknown after ordinary edits and disappear/reappear faithfully through undo', () => {
  const core = makeSeed(DAY); core.tasks.forEach(task => { if (task.status === 'done') delete task.completedAt; });
  const storage = new Storage({ [EXPERIENCE_KEYS.core]: JSON.stringify(core) }), store = createExperienceStore(storage);
  assert.equal(store.extension.recordedSince, DAY);
  const task = store.core.tasks.find(row => row.id === 't1');
  store.saveCore(applyTask(store.core, { ...task, description: 'More context without a recorded completion date' }, DAY));
  assert.equal(store.core.tasks.find(row => row.id === 't1').completedAt, null);
  assert.equal(seriesFor(store).entries.reduce((sum, entry) => sum + entry.count, 0), 0);
  assert.equal(seriesFor(store).average, null);
  store.saveCore(deleteTask(store.core, 't1'));
  assert.equal(store.core.tasks.some(row => row.id === 't1'), false);
  store.undo();
  assert.equal(store.core.tasks.find(row => row.id === 't1').completedAt, null);
  assert.equal(progress(store.core, 'onboard').done, 1);
});

test('existing source stores, custom fields and observation dates stay intact during startup and later reload', () => {
  const core = makeSeed(addDays(DAY, -10)); core.customWorkspaceField = { retained: true };
  const divisions = makeDivisionSeed(DAY); divisions.customDivisionField = ['keep'];
  const extras = { version: 1, byProject: { onboard: { ...emptyExtras(), documents: [{ id: 'legacy-doc', title: 'Retained document', external_url: 'https://example.com/retained', extraMetadata: { keep: true } }] } } };
  const raw = { [EXPERIENCE_KEYS.core]: JSON.stringify(core, null, 2), [EXPERIENCE_KEYS.divisions]: JSON.stringify(divisions, null, 2), [EXPERIENCE_KEYS.extras]: JSON.stringify(extras, null, 2) };
  const storage = new Storage(raw), store = createExperienceStore(storage);
  for (const [key, value] of Object.entries(raw)) assert.equal(storage.getItem(key), value);
  const observed = store.extension.recordedSince;
  store.saveCore(applyTask(store.core, { ...store.core.tasks.find(task => task.id === 't1'), status: 'todo' }, DAY));
  const reloaded = createExperienceStore(storage);
  assert.equal(reloaded.extension.recordedSince, observed);
  assert.deepEqual(reloaded.core.customWorkspaceField, { retained: true });
  assert.deepEqual(listAllDocuments(reloaded)[0].extraMetadata, { keep: true });
  assert.equal(reloaded.extension.partners.length, 0);
});

test('recorded zeros participate in averages while earlier unknown days and current partial day do not', () => {
  const store = createExperienceStore(new Storage()), core = copy(store.core);
  core.tasks.forEach(task => { task.status = 'todo'; task.completedAt = null; task.dependsOn = ''; });
  store.saveCore(core);
  const extension = copy(store.extension); extension.recordedSince = addDays(DAY, -2); store.saveExtension(extension);
  store.saveCore(applyTask(store.core, { ...store.core.tasks[0], status: 'done' }, addDays(DAY, -2)));
  store.saveCore(applyTask(store.core, { ...store.core.tasks[1], status: 'done' }, DAY));
  const series = seriesFor(store);
  assert.equal(series.averageDays, 2);
  assert.equal(series.average, 0.5);
  assert.equal(series.entries.at(-1).partial, true);
  assert.equal(series.entries.at(-1).count, 1);
  assert.ok(series.entries.slice(0, 4).every(entry => !entry.known));
  assert.equal(series.entries.at(-2).known, true);
  assert.equal(series.entries.at(-2).count, 0);
});

test('finance chart measures expose expense-only filters and exact derived amounts', () => {
  const store = createExperienceStore(new Storage()), next = copy(store.divisions);
  next.budgets = [{ id: 'budget', title: 'Operations', allocated: 1_000_000 }];
  next.financeRequests = [
    { id: 'extra', title: 'Additional allocation', type: 'budget', budgetId: 'budget', amount: 200_000, stageId: 'approved' },
    { id: 'commit', title: 'Approved supplies', type: 'expense', budgetId: 'budget', amount: 300_000, stageId: 'approved' },
    { id: 'paid', title: 'Paid transport', type: 'expense', budgetId: 'budget', amount: 100_000, stageId: 'paid' },
    { id: 'pending', title: 'Pending supplies', type: 'expense', budgetId: 'budget', amount: 800_000, stageId: 'submitted' }
  ];
  store.saveDivision(next);
  assert.deepEqual(budgetBalance(store.divisions, 'budget'), { allocated: 1_200_000, committed: 300_000, paid: 100_000, remaining: 800_000 });
  const html = renderDivision({ store, t: en => en, icon: () => '', escapeHtml: value => String(value ?? ''), state: { divisionTabs: {} }, renderRecordList: () => '' }, 'legal-finance');
  assert.match(html, /data-field="financeMeasure" data-value="committed"/);
  assert.match(html, /data-field="financeMeasure" data-value="paid"/);
  assert.match(html, /(?:IDR|Rp)\s*1[.,]200[.,]000/);
  assert.match(html, /(?:IDR|Rp)\s*300[.,]000/);
  assert.match(html, /(?:IDR|Rp)\s*800[.,]000/);
});

test('division records and document revisions survive saves, broad search and a full backup round trip', () => {
  const store = createExperienceStore(new Storage()), extra = copy(store.extras.byProject.bootcamp);
  extra.documents = [{ id: 'doc', project_id: 'bootcamp', title: 'Brief v2', version_label: 'v2', external_url: 'https://example.com/v2', attachment: {name:'Approved-delivery.pdf',type:'application/pdf'}, revisions: [{ id: 'rev-1', title: 'Brief v1', version_label: 'v1', external_url: 'https://example.com/v1',attachment:{name:'Initial-scope.pdf'} }] }];
  store.saveExtras('bootcamp', extra);
  const backup = store.exportAll(), restored = createExperienceStore(new Storage());
  restored.importAll(backup);
  assert.equal(listAllDocuments(restored)[0].revisions[0].version_label, 'v1');
  const records = allSearchRecords(restored);
  const indexedDocument = records.find(record => record.type === 'document');
  assert.match(indexedDocument.text, /Approved-delivery\.pdf/);
  assert.match(indexedDocument.text, /Initial-scope\.pdf/);
  assert.match(indexedDocument.text, /Brief v1/);
  for (const type of ['division:financeRequests', 'division:candidates', 'division:deliverables', 'division:initiatives', 'document', 'partner', 'delivery']) assert.ok(records.some(record => record.type === type), type);
});
