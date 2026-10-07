import test from 'node:test';
import assert from 'node:assert/strict';
import { makeSeed, applyTask, iso, addDays } from './model.mjs';
import { makeDivisionSeed } from './division-workspaces.mjs';
import { createExperienceStore, EXPERIENCE_KEYS, emptyExtras, reminderItems, listAllDocuments, allSearchRecords, RECORD_SCHEMAS, validateExperienceExtension, putAttachment } from './experience-data.mjs';

class MemoryStorage {
  constructor(initial = {}) { this.data = new Map(Object.entries(initial)); this.fail = null; this.writes = []; }
  getItem(key) { return this.data.get(key) ?? null; }
  setItem(key, value) { if (this.fail?.(key, value)) throw new Error('Quota exceeded'); this.data.set(key, value); this.writes.push(key); }
  removeItem(key) { this.data.delete(key); }
}

test('new workspace fixtures persist once and cover six divisions without fake document links', () => {
  const storage = new MemoryStorage();
  const store = createExperienceStore(storage);
  assert.equal(store.core.projects.length, 4);
  assert.ok(store.divisions.initiatives.length);
  assert.ok(store.divisions.candidates.length);
  assert.ok(store.divisions.financeRequests.length);
  assert.ok(store.divisions.deliverables.length);
  assert.ok(store.extension.partners.length);
  assert.ok(store.extension.deliveries.length);
  assert.equal(store.extension.sample, true);
  assert.equal(validateExperienceExtension(store.extension), true);
  assert.equal(listAllDocuments(store).length, 0);
  assert.equal(storage.writes.length, 4);
  const reloaded = createExperienceStore(storage);
  assert.deepEqual(reloaded.exportAll().core, store.core);
  assert.equal(storage.writes.length, 4);
});

test('existing stores survive byte-for-byte, missing extensions stay empty, and unknown historical dates are not invented', () => {
  const core = makeSeed('2026-09-01');
  core.tasks.forEach(task => { task.completedAt = null; });
  const source = JSON.stringify(core, null, 2);
  const divisions = JSON.stringify(makeDivisionSeed('2026-09-01'), null, 3);
  const storage = new MemoryStorage({ [EXPERIENCE_KEYS.core]: source, [EXPERIENCE_KEYS.divisions]: divisions });
  const store = createExperienceStore(storage);
  assert.equal(storage.getItem(EXPERIENCE_KEYS.core), source);
  assert.equal(storage.getItem(EXPERIENCE_KEYS.divisions), divisions);
  assert.equal(store.extension.recordedSince, iso());
  assert.equal(store.extension.partners.length, 0);
  assert.equal(store.extension.sample, false);
  assert.ok(store.core.tasks.every(task => task.completedAt === null));
});

test('an invalid raw store is preserved and locked instead of silently replaced', () => {
  const raw = '{not readable JSON';
  const storage = new MemoryStorage({ [EXPERIENCE_KEYS.core]: raw });
  const store = createExperienceStore(storage);
  assert.equal(store.core.projects.length, 0);
  assert.equal(store.divisions.initiatives.length, 0);
  assert.equal(store.extension.partners.length, 0);
  assert.equal(storage.getItem(EXPERIENCE_KEYS.core), raw);
  assert.match(store.issues[0], /original data is preserved/);
  assert.equal(store.exportAll().unreadableStores[EXPERIENCE_KEYS.core], raw);
  assert.throws(() => store.saveCore(makeSeed()), /protected/);
  assert.equal(storage.getItem(EXPERIENCE_KEYS.core), raw);
});

test('valid sibling stores do not trigger fixture generation when core is missing', () => {
  const storage = new MemoryStorage({ [EXPERIENCE_KEYS.divisions]: JSON.stringify(makeDivisionSeed()) });
  const store = createExperienceStore(storage);
  assert.equal(store.core.projects.length, 0);
  assert.equal(store.extension.sample, false);
});

test('unreadable source bytes introduced by another tab are never overwritten by a stale session', () => {
  const storage = new MemoryStorage(), store = createExperienceStore(storage);
  storage.setItem(EXPERIENCE_KEYS.core, 'corrupted externally');
  assert.throws(() => store.saveCore(store.core), /unreadable format/);
  assert.equal(storage.getItem(EXPERIENCE_KEYS.core), 'corrupted externally');
  assert.equal(store.exportAll().unreadableStores[EXPERIENCE_KEYS.core], 'corrupted externally');
});

test('save and undo persist completion changes, retain identifiers, and publish only confirmed states', () => {
  const storage = new MemoryStorage(), store = createExperienceStore(storage), events = [];
  const unsubscribe = store.subscribe(event => events.push({ ...event, canUndo: store.canUndo, status: store.core.tasks.find(task => task.id === 't2').status }));
  const original = structuredClone(store.core);
  store.saveCore(applyTask(store.core, { ...store.core.tasks.find(task => task.id === 't2'), status: 'done' }), 'Completed task');
  assert.equal(store.core.tasks.find(task => task.id === 't2').completedAt, iso());
  assert.equal(events[0].status, 'done');
  assert.equal(events[0].canUndo, true);
  assert.equal(store.undo(), true);
  assert.deepEqual(store.core, original);
  assert.deepEqual(JSON.parse(storage.getItem(EXPERIENCE_KEYS.core)), original);
  assert.equal(events.at(-1).canUndo, false);
  assert.equal(store.undo(), false);
  unsubscribe();
});

test('save failure does not change in-memory data, source bytes, undo, or subscribers', () => {
  const storage = new MemoryStorage(), store = createExperienceStore(storage), events = [];
  store.subscribe(event => events.push(event));
  const original = structuredClone(store.core), raw = storage.getItem(EXPERIENCE_KEYS.core);
  storage.fail = () => true;
  assert.throws(() => store.saveCore(applyTask(store.core, { ...store.core.tasks[1], status: 'done' })), /not saved/);
  assert.deepEqual(store.core, original);
  assert.equal(storage.getItem(EXPERIENCE_KEYS.core), raw);
  assert.equal(events.length, 0);
  assert.equal(store.canUndo, false);
});

test('multi-store import rolls back earlier writes if a later store fails', () => {
  const storage = new MemoryStorage(), store = createExperienceStore(storage);
  const source = Object.fromEntries(Object.values(EXPERIENCE_KEYS).map(key => [key, storage.getItem(key)]));
  const original = structuredClone(store.core), backup = store.exportAll();
  backup.core.profile.name = 'Updated';
  backup.divisions.initiatives[0].title = 'Updated initiative';
  storage.fail = key => key === EXPERIENCE_KEYS.divisions;
  assert.throws(() => store.importAll(backup), /not saved/);
  assert.deepEqual(store.core, original);
  for (const [key, value] of Object.entries(source)) assert.equal(storage.getItem(key), value);
});

test('full backup import and undo affect every local JSON store atomically', () => {
  const storage = new MemoryStorage(), store = createExperienceStore(storage);
  const before = store.exportAll(), data = store.exportAll();
  data.core.profile.name = 'Changed member';
  data.extension.preferences.language = 'id';
  data.divisions.initiatives[0].title = 'Changed initiative';
  store.importAll(data);
  assert.equal(store.core.profile.name, 'Changed member');
  assert.equal(store.extension.preferences.language, 'id');
  store.undo();
  for (const key of ['core', 'divisions', 'extras', 'extension']) assert.deepEqual(store[key], before[key]);
});

test('extension preferences, dates, statuses, duplicate identifiers, and unsafe URLs are validated', () => {
  const store = createExperienceStore(new MemoryStorage());
  for (const change of [
    next => { next.preferences.language = 'zz'; },
    next => { next.followups[0].dueDate = '2026-02-30'; },
    next => { next.partners[0].stage = 'imaginary'; },
    next => { next.partners.push({ ...next.partners[0] }); },
    next => { next.legalRequests[0].documentUrl = 'javascript:alert(1)'; }
  ]) {
    const next = structuredClone(store.extension);
    change(next);
    assert.throws(() => store.saveExtension(next), /Invalid extension/);
  }
  assert.deepEqual(Object.keys(RECORD_SCHEMAS).sort(), ['deliveries', 'followups', 'legalRequests', 'meetingNotes', 'partners']);
});

test('new legal requests receive unique provisional local numbers', () => {
  const store = createExperienceStore(new MemoryStorage()), next = structuredClone(store.extension);
  next.legalRequests.push({ id: 'new-legal-1', title: 'New request', stage: 'requested' }, { id: 'new-legal-2', title: 'Second request', stage: 'requested' });
  store.saveExtension(next);
  assert.equal(new Set(store.extension.legalRequests.map(row => row.number)).size, 3);
  assert.ok(store.extension.legalRequests.every(row => /^DRAFT-\d{4}-\d{4}$/.test(row.number)));
});

test('documents and broad search retain project identity and metadata', () => {
  const store = createExperienceStore(new MemoryStorage()), next = emptyExtras();
  next.documents.push({ id: 'doc-1', title: 'Research brief', external_url: 'https://example.com/research', version_label: 'v1', notes: 'Methodology', sensitivity: 'normal' });
  store.saveExtras('bootcamp', next);
  assert.equal(listAllDocuments(store)[0].projectId, 'bootcamp');
  assert.equal(listAllDocuments(store)[0].projectName, 'Consulting bootcamp');
  const results = allSearchRecords(store);
  for (const type of ['task', 'project', 'member', 'division', 'document', 'decision', 'event', 'partner']) assert.ok(results.some(row => row.type === type), type);
  assert.match(results.find(row => row.type === 'document').text, /Methodology/);
});

test('reminders catch up overdue records, are stable, respect lead time, and omit completed tasks', () => {
  const store = createExperienceStore(new MemoryStorage()), today = iso();
  const core = structuredClone(store.core);
  core.tasks = core.tasks.map((task, index) => ({ ...task, dependsOn: '', start: addDays(today, -10), end: addDays(today, index === 0 ? -2 : index === 1 ? 0 : index === 2 ? 1 : 9), status: index === 0 ? 'done' : 'todo', completedAt: index === 0 ? addDays(today, -2) : null }));
  store.saveCore(core);
  const a = reminderItems(store, today), b = reminderItems(store, today);
  assert.deepEqual(a, b);
  assert.equal(new Set(a.map(row => row.id)).size, a.length);
  assert.equal(a.some(row => row.recordId === core.tasks[0].id), false);
  assert.ok(a.some(row => row.recordId === core.tasks[1].id));
  assert.ok(a.some(row => row.recordId === core.tasks[2].id));
  const later = reminderItems(store, addDays(today, 2));
  assert.ok(later.find(row => row.recordId === core.tasks[1].id).overdue);
});

test('attachments reject empty, oversized, and unavailable storage conditions without silent success', async () => {
  await assert.rejects(() => putAttachment(new Blob()), /empty/);
  await assert.rejects(() => putAttachment(new Blob([new Uint8Array(10 * 1024 * 1024 + 1)])), /10 MB/);
  await assert.rejects(() => putAttachment(new Blob(['hello'], { type: 'text/plain' })), /unavailable/);
});
