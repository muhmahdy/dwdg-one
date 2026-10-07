import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createPlanningStore, validateWorkspace, workspaceMarkdown, etagFor } from './planner-store.mjs';
import { startPlannerServer } from './planner-server.mjs';
import { applyJsonPatch, runCli } from './planner-cli.mjs';

function fixture() {
  return {
    kind: 'dwdg-one-planning-workspace', schemaVersion: 1, revision: 0, updatedAt: '2026-10-05T00:00:00.000Z',
    prd: { kind: 'dwdg-one-prd', schemaVersion: 1, seedVersion: 'test-v1', title: 'DWDG’ONE', nodes: [
      { id: 'root', parent: null, title: 'DWDG’ONE', notes: 'Working draft', owner: 'Mahdy', source: 'User', acceptance: 'All items readable', status: 'confirmed', priority: 'P0', dependencies: '' },
      { id: 'hr', parent: 'root', title: 'HR monitoring', notes: 'Every two weeks', owner: 'HR', source: 'User', acceptance: '14-day cycle', status: 'confirmed', priority: 'P0', dependencies: '' },
    ] },
    wbs: [{ id: 'work', parent: null, title: 'HR work package', deliverable: 'HR monitoring process', owner: 'HR', acceptance: 'Configured grading cycle', requirementIds: ['hr'], dependsOn: [], priority: 'P0', estimateHours: null, release: 'v1' }],
    activities: [{ id: 'monitor', title: 'Monitor membership', order: 1 }],
    stories: [{ id: 'story', activityId: 'monitor', actor: 'HR', action: 'review fortnightly monitoring', benefit: 'members receive feedback', acceptance: 'One cycle every 14 days', requirementIds: ['hr'], wbsId: 'work', release: 'v1', priority: 'P0', order: 1 }],
    cards: [{ id: 'card', title: 'Specify monitoring', description: 'Capture grading and review policy', status: 'backlog', priority: 'P0', owner: 'HR', acceptance: 'Rubric reviewed', wbsId: 'work', requirementIds: ['hr'], storyIds: ['story'], dependsOn: [], release: 'v1', evidence: '' }],
    history: [], notes: 'Planning only',
  };
}
async function temporary(t, document = fixture()) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'dwdg-planner-test-'));
  t.after(async () => {
    const resolved = path.resolve(directory);
    assert.equal(path.dirname(resolved), path.resolve(os.tmpdir()));
    assert.ok(path.basename(resolved).startsWith('dwdg-planner-test-'));
    await fs.rm(resolved, { recursive: true, force: true });
  });
  await fs.writeFile(path.join(directory, 'planner-seed.json'), JSON.stringify(document));
  return { directory, store: createPlanningStore({ directory }) };
}
function clone(value) { return JSON.parse(JSON.stringify(value)); }
async function httpCall(port, method, url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = body === undefined ? undefined : JSON.stringify(body);
    const request = http.request({ hostname: '127.0.0.1', port, path: url, method, headers: { ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}), ...headers } }, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        let result;
        try { result = JSON.parse(raw); } catch { result = raw; }
        resolve({ status: response.statusCode, result, headers: response.headers });
      });
    });
    request.on('error', reject);
    request.end(data);
  });
}

test('initializes only absent saved state, preserving a previously edited workspace and unknown fields', async t => {
  const first = fixture(); first.customToolMetadata = { owner: 'Claude', nested: { value: 7 } };
  first.cards[0].customLabel = 'External application field';
  const { directory, store } = await temporary(t, first);
  const initial = await store.read();
  assert.deepEqual(initial.document, first);
  assert.match(await fs.readFile(store.paths.markdownFile, 'utf8'), /Work Breakdown Structure/);
  const revised = clone(initial.document); revised.notes = 'User edits preserved';
  const saved = await store.save(revised, initial.etag, { actor: 'Claude CLI', summary: 'Update notes' });
  assert.equal(saved.document.revision, 1);
  assert.deepEqual(saved.document.customToolMetadata, first.customToolMetadata);
  assert.equal(saved.document.cards[0].customLabel, 'External application field');
  await fs.writeFile(path.join(directory, 'planner-seed.json'), JSON.stringify(fixture()));
  assert.equal((await createPlanningStore({ directory }).read()).document.notes, 'User edits preserved');
});

test('every save backs up exact previous bytes and appends persistent change history', async t => {
  const { store } = await temporary(t);
  const initial = await store.read();
  const beforeBytes = await fs.readFile(store.paths.stateFile);
  const next = clone(initial.document); next.cards[0].status = 'ready';
  const saved = await store.save(next, initial.etag, { actor: 'Antigravity', summary: 'Move monitoring to Ready' });
  assert.deepEqual(await fs.readFile(saved.backupFile), beforeBytes);
  assert.equal(saved.etag, etagFor(await fs.readFile(store.paths.stateFile)));
  assert.equal(saved.document.history.length, 1);
  assert.equal(saved.document.history[0].actor, 'Antigravity');
  assert.equal(saved.document.history[0].changes[0].before.status, 'backlog');
  assert.equal(saved.document.history[0].changes[0].after.status, 'ready');
  const undo = clone(saved.document); undo.history = []; undo.cards[0].status = 'backlog';
  const undone = await store.save(undo, saved.etag, { actor: 'Mahdy', summary: 'Undo status move' });
  assert.equal(undone.document.history.length, 2);
  assert.equal(undone.document.cards[0].status, 'backlog');
  assert.equal((await fs.readdir(store.paths.backupDirectory)).length, 2);
});

test('rejects duplicate IDs, invalid states, missing references and hierarchy/prerequisite cycles', () => {
  const attempts = [
    document => document.cards.push(clone(document.cards[0])),
    document => { document.cards[0].status = 'finished'; },
    document => { document.cards[0].requirementIds = ['missing']; },
    document => { document.cards[0].storyIds = ['missing']; },
    document => { document.stories[0].activityId = 'missing'; },
    document => { document.wbs[0].parent = 'work'; },
    document => { document.prd.nodes[1].parent = 'hr'; },
    document => { document.prd.nodes[1].dependencies = 'hr'; },
    document => { document.cards[0].dependsOn = ['card']; },
    document => { document.wbs[0].dependsOn = ['work']; },
    document => { document.notes = 7; },
    document => { document.cards[0].id = '../escape'; },
    document => { document.prd.nodes[0].id = 'other-root'; document.prd.nodes[1].parent = 'other-root'; },
    document => { document.cards[0].status = 'done'; document.cards[0].evidence = ' '; },
  ];
  for (const attempt of attempts) { const document = fixture(); attempt(document); assert.throws(() => validateWorkspace(document)); }
});

test('supports more than 80 nodes with no UI-derived cap and finite numeric validation', () => {
  const document = fixture();
  for (let index = 0; index < 150; index++) document.prd.nodes.push({ ...document.prd.nodes[1], id: `req-${index}`, parent: 'root' });
  assert.equal(validateWorkspace(document).prd.nodes.length, 152);
  document.wbs[0].estimateHours = NaN;
  assert.throws(() => validateWorkspace(document));
});

test('PRD known-field and hierarchy limits match the embedded editor without limiting wide trees', () => {
  for (const [field, limit] of [['title', 200], ['owner', 1_000], ['notes', 40_000], ['source', 40_000], ['acceptance', 40_000], ['dependencies', 40_000]]) {
    const document = fixture(); document.prd.nodes[1][field] = 'x'.repeat(limit + 1);
    assert.throws(() => validateWorkspace(document), new RegExp(field));
  }
  const dependencyArray = fixture(); dependencyArray.prd.nodes[1].dependencies = Array(14_000).fill('root');
  assert.throws(() => validateWorkspace(dependencyArray), /40,000-character/);
  const deep = fixture();
  for (let index = 0; index < 40; index++) deep.prd.nodes.push({ ...deep.prd.nodes[1], id: `level-${index}`, parent: index === 0 ? 'hr' : `level-${index - 1}` });
  assert.throws(() => validateWorkspace(deep), /40 parent levels/);
  deep.prd.nodes.pop();
  assert.equal(validateWorkspace(deep).prd.nodes.length, 41);
});

test('stale CAS rejects overwrites without backing up or resetting newer work', async t => {
  const { store } = await temporary(t);
  const initial = await store.read();
  const next = clone(initial.document); next.notes = 'First valid edit';
  await store.save(next, initial.etag);
  const stale = clone(initial.document); stale.notes = 'Stale edit';
  await assert.rejects(store.save(stale, initial.etag), error => error.status === 409 && error.code === 'REVISION_CONFLICT');
  assert.equal((await store.read()).document.notes, 'First valid edit');
  assert.equal((await fs.readdir(store.paths.backupDirectory)).length, 1);
});

test('detects valid external JSON edits and regenerates readable export; stale browser save is rejected', async t => {
  const { store } = await temporary(t);
  const initial = await store.read();
  const external = clone(initial.document); external.cards[0].status = 'doing'; external.externalAgent = 'Claude';
  await fs.writeFile(store.paths.stateFile, JSON.stringify(external));
  const current = await store.read();
  assert.notEqual(current.etag, initial.etag);
  assert.equal(current.document.cards[0].status, 'doing');
  assert.equal(current.document.externalAgent, 'Claude');
  assert.match(await fs.readFile(store.paths.markdownFile, 'utf8'), /### doing/);
  await assert.rejects(store.save(initial.document, initial.etag), error => error.status === 409);
});

test('corrupt or invalid saved JSON is preserved rather than replaced by seed', async t => {
  const { store } = await temporary(t);
  await store.read();
  const broken = '{"cards": [ incomplete';
  await fs.writeFile(store.paths.stateFile, broken);
  await assert.rejects(store.read(), error => error.code === 'CORRUPT_JSON');
  assert.equal(await fs.readFile(store.paths.stateFile, 'utf8'), broken);
  await assert.rejects(store.save(fixture(), 'a'.repeat(64)), error => error.code === 'CORRUPT_JSON');
  assert.equal(await fs.readFile(store.paths.stateFile, 'utf8'), broken);
  const invalid = fixture(); invalid.cards[0].status = 'invalid';
  const invalidRaw = JSON.stringify(invalid);
  await fs.writeFile(store.paths.stateFile, invalidRaw);
  await assert.rejects(store.read(), error => error.code === 'INVALID_DOCUMENT');
  assert.equal(await fs.readFile(store.paths.stateFile, 'utf8'), invalidRaw);
});

test('concurrent saves using separate store instances serialize and only one CAS succeeds', async t => {
  const { store, directory } = await temporary(t);
  const otherStore = createPlanningStore({ directory });
  const initial = await store.read();
  const left = clone(initial.document); left.notes = 'Left';
  const right = clone(initial.document); right.notes = 'Right';
  const results = await Promise.allSettled([store.save(left, initial.etag), otherStore.save(right, initial.etag)]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(results.find(result => result.status === 'rejected').reason.status, 409);
  assert.equal((await store.read()).document.revision, 1);
  assert.equal((await fs.readdir(store.paths.backupDirectory)).length, 1);
});

test('cross-process CLI/API-compatible locks prevent two simultaneous CAS commits', async t => {
  const { store, directory } = await temporary(t);
  const initial = await store.read();
  const moduleUrl = new URL('./planner-store.mjs', import.meta.url).href;
  const script = `import { createPlanningStore } from ${JSON.stringify(moduleUrl)}; const store=createPlanningStore({directory:process.argv[1]}); const next=(await store.read()).document; next.notes=process.argv[3]; try{const r=await store.save(next,process.argv[2],{actor:process.argv[3],summary:'Cross-process save'}); console.log(JSON.stringify({success:true,revision:r.document.revision}));}catch(e){console.log(JSON.stringify({success:false,code:e.code}));}`;
  const child = actor => new Promise((resolve, reject) => {
    const processHandle = spawn(process.execPath, ['--input-type=module', '-e', script, directory, initial.etag, actor], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = ''; let errors = '';
    processHandle.stdout.on('data', chunk => { output += chunk; });
    processHandle.stderr.on('data', chunk => { errors += chunk; });
    processHandle.on('error', reject);
    processHandle.on('close', code => { if (code !== 0) reject(new Error(errors)); else { try { resolve(JSON.parse(output)); } catch (error) { reject(error); } } });
  });
  const results = await Promise.all([child('Claude'), child('Antigravity')]);
  assert.equal(results.filter(result => result.success).length, 1);
  assert.equal(results.find(result => !result.success).code, 'REVISION_CONFLICT');
  assert.equal((await store.read()).document.revision, 1);
});

test('JSON patch supports safe granular updates and tests without dropping unknown fields', () => {
  const document = fixture(); document.cliMetadata = { note: 'Preserve me' };
  const result = applyJsonPatch(document, [
    { op: 'test', path: '/cards/0/id', value: 'card' },
    { op: 'replace', path: '/cards/0/status', value: 'ready' },
    { op: 'add', path: '/cards/0/toolLabel', value: 'Claude' },
  ]);
  assert.equal(result.cards[0].status, 'ready');
  assert.equal(result.cliMetadata.note, 'Preserve me');
  assert.equal(document.cards[0].status, 'backlog');
  assert.throws(() => applyJsonPatch(document, [{ op: 'test', path: '/cards/0/id', value: 'wrong' }]));
  assert.throws(() => applyJsonPatch(document, [{ op: 'add', path: '/__proto__/polluted', value: true }]));
  assert.throws(() => applyJsonPatch(document, [{ op: 'replace', path: '/cards/-1/status', value: 'ready' }]));
});

test('CLI roundtrip export/apply is backed up, validates and rejects reused stale hash', async t => {
  const { store, directory } = await temporary(t);
  const initial = await store.read();
  const exported = path.join(directory, 'cli-export.json');
  const output = [];
  await runCli(['export', exported, '--directory', directory], value => output.push(JSON.parse(value)));
  const revised = JSON.parse(await fs.readFile(exported, 'utf8')); revised.cards[0].status = 'review';
  await fs.writeFile(exported, JSON.stringify(revised));
  const argumentsFor = ['apply', exported, '--directory', directory, '--base', initial.etag, '--actor', 'Claude CLI', '--summary', 'Review specification'];
  await runCli(argumentsFor, value => output.push(JSON.parse(value)));
  assert.equal(output.at(-1).saved, true);
  assert.equal((await store.read()).document.cards[0].status, 'review');
  await assert.rejects(runCli(argumentsFor, () => {}), error => error.code === 'REVISION_CONFLICT');
  await runCli(['check', '--directory', directory], value => output.push(JSON.parse(value)));
  assert.equal(output.at(-1).valid, true);
  await assert.rejects(runCli(['export', store.paths.stateFile, '--directory', directory], () => {}));
});

test('server saves persistent state and rejects stale/foreign/invalid requests and arbitrary files', async t => {
  const { directory, store } = await temporary(t);
  await fs.writeFile(path.join(directory, 'planner.html'), '<!doctype html><title>Planning</title>');
  const server = await startPlannerServer({ directory, port: 0 });
  t.after(() => new Promise(resolve => server.close(resolve)));
  const port = server.address().port;
  const get = await httpCall(port, 'GET', '/api/workspace');
  assert.equal(get.status, 200);
  const next = clone(get.result.document); next.cards[0].status = 'ready';
  const put = await httpCall(port, 'PUT', '/api/workspace', { document: next, baseEtag: get.result.etag, actor: 'Mahdy', summary: 'Move card' }, { Origin: `http://127.0.0.1:${port}` });
  assert.equal(put.status, 200);
  assert.equal(put.result.document.revision, 1);
  assert.equal((await httpCall(port, 'PUT', '/api/workspace', { document: next, baseEtag: get.result.etag })).status, 409);
  assert.equal((await httpCall(port, 'PUT', '/api/workspace', { document: next, baseEtag: put.result.etag }, { Origin: 'https://evil.invalid' })).status, 403);
  assert.equal((await httpCall(port, 'GET', '/api/workspace', undefined, { Host: `evil.invalid:${port}` })).status, 403);
  assert.equal((await httpCall(port, 'GET', '/api/workspace', undefined, { Origin: 'null' })).status, 403);
  assert.equal((await httpCall(port, 'GET', '/state/planning-workspace.json')).status, 404);
  assert.equal((await httpCall(port, 'GET', '/../planner-store.mjs')).status, 404);
  const invalid = clone(put.result.document); invalid.cards[0].status = 'fake';
  assert.equal((await httpCall(port, 'PUT', '/api/workspace', { document: invalid, baseEtag: put.result.etag })).status, 422);
  const exported = await httpCall(port, 'GET', '/api/export/markdown');
  assert.equal(exported.status, 200);
  assert.match(exported.result, /HR monitoring/);
  assert.equal((await httpCall(port, 'GET', '/')).status, 200);
  assert.equal((await store.read()).document.cards[0].status, 'ready');
});

test('generated Markdown includes stable IDs, all boards, actors, acceptance and history', () => {
  const document = fixture();
  const markdown = workspaceMarkdown(document);
  for (const text of ['Work Breakdown Structure', 'Kanban', 'User story map', 'Planning change history', '14-day cycle', 'story', 'card', 'HR monitoring', 'None recorded']) assert.ok(markdown.includes(text), text);
});

test('legacy PRD history envelope roundtrips without dropping source scope or unknown fields', async t => {
  const document = fixture();
  document.prd.changeHistory = {
    kind: 'dwdg-one-prd-history', schemaVersion: 1, scope: 'dwdg-one-prd-planner:2026-10-03-v1', importedTool: 'Old browser editor',
    events: [{ id: 'legacy-event', at: '2026-10-05T01:00:00.000Z', summary: 'Edit source requirement', action: 'edit', changes: [{ id: 'hr', title: 'HR monitoring', action: 'edited', fields: { title: { before: 'HR', after: 'HR monitoring', sourceMarker: 'Preserved metadata' } }, extraChangeField: 'Keep this' }], actor: 'This device', extraField: 'Keep this' }],
  };
  const { store } = await temporary(t, document);
  const initial = await store.read();
  const next = clone(initial.document); next.notes = 'Imported safely';
  const saved = await store.save(next, initial.etag);
  assert.deepEqual(saved.document.prd.changeHistory, document.prd.changeHistory);
  const invalid = clone(document); invalid.prd.changeHistory.events.push(clone(invalid.prd.changeHistory.events[0]));
  assert.throws(() => validateWorkspace(invalid));
});

test('malformed PRD history that the editor cannot open is rejected before validation or saving', async t => {
  const document = fixture();
  document.prd.changeHistory = { kind: 'dwdg-one-prd-history', schemaVersion: 1, scope: 'dwdg-one-prd-planner:2026-10-03-v1', events: [{ id: 'event-1', at: '2026-10-05T00:00:00.000Z', action: 'edit', summary: 'Edit a requirement', changes: [{ id: 'hr', title: 'HR monitoring', action: 'edited', fields: { title: { before: 'Before', after: 'After' } } }] }] };
  const mutations = [
    value => { value.prd.changeHistory = []; },
    value => { value.prd.changeHistory.scope = 'arbitrary-other-scope'; },
    value => { value.prd.changeHistory.schemaVersion = 2; },
    value => { value.prd.changeHistory.events[0].action = 'save'; },
    value => { value.prd.changeHistory.events[0].changes[0].action = 'edit'; },
    value => { value.prd.changeHistory.events[0].changes[0].id = 1; },
    value => { value.prd.changeHistory.events[0].changes[0].title = null; },
    value => { value.prd.changeHistory.events[0].changes[0].fields = []; },
    value => { value.prd.changeHistory.events[0].changes[0].fields.title.before = 1; },
    value => { delete value.prd.changeHistory.events[0].changes[0].fields.title.after; },
    value => { value.prd.changeHistory.events[0].changes[0].fields.unknownField = { before: null, after: 'Unsupported' }; },
  ];
  const { directory, store } = await temporary(t);
  const initial = await store.read();
  const initialBytes = await fs.readFile(store.paths.stateFile);
  const server = await startPlannerServer({ directory, port: 0 });
  t.after(() => new Promise(resolve => server.close(resolve)));
  for (const mutate of mutations) {
    const malformed = clone(document); mutate(malformed);
    assert.throws(() => validateWorkspace(malformed), /prd.changeHistory/);
    assert.equal((await httpCall(server.address().port, 'POST', '/api/validate', { document: malformed })).status, 422);
    await assert.rejects(store.save(malformed, initial.etag), error => error.status === 422);
  }
  assert.deepEqual(await fs.readFile(store.paths.stateFile), initialBytes);
  await assert.rejects(fs.access(store.paths.backupDirectory), error => error.code === 'ENOENT');
});

test('new incoming file history is labeled unverified while existing local history remains unchanged', async t => {
  const { store } = await temporary(t);
  const initial = await store.read();
  const first = await store.save(initial.document, initial.etag, { actor: 'Mahdy', summary: 'Local change' });
  const incoming = clone(first.document);
  incoming.history[0].actor = 'Pretend overwritten actor';
  incoming.history.push({ id: 'external-history', at: '2026-10-05T02:00:00.000Z', actor: 'Claimed CLI user', action: 'save', summary: 'External claim', changes: [], customTool: 'Preserved' });
  const saved = await store.save(incoming, first.etag, { actor: 'Import reviewer', summary: 'Import portable history' });
  assert.equal(saved.document.history[0].actor, 'Mahdy');
  const external = saved.document.history.find(item => item.id === 'external-history');
  assert.equal(external.importStatus, 'imported-unverified');
  assert.equal(external.customTool, 'Preserved');
});

test('validate endpoint checks import graphs without initializing, replacing or backing up saved files', async t => {
  const { directory, store } = await temporary(t);
  const server = await startPlannerServer({ directory, port: 0 });
  t.after(() => new Promise(resolve => server.close(resolve)));
  const port = server.address().port;
  const valid = await httpCall(port, 'POST', '/api/validate', { document: fixture() });
  assert.equal(valid.status, 200);
  assert.equal(valid.result.valid, true);
  await assert.rejects(fs.access(store.paths.stateFile), error => error.code === 'ENOENT');
  assert.equal((await httpCall(port, 'POST', '/api/validate', { document: fixture() }, { Origin: 'https://foreign.invalid' })).status, 403);
  const initial = await store.read();
  const initialBytes = await fs.readFile(store.paths.stateFile);
  const duplicate = clone(initial.document); duplicate.cards.push(clone(duplicate.cards[0]));
  assert.equal((await httpCall(port, 'POST', '/api/validate', { document: duplicate })).status, 422);
  const cyclic = clone(initial.document); cyclic.wbs[0].dependsOn = ['work'];
  assert.equal((await httpCall(port, 'POST', '/api/validate', { document: cyclic })).status, 422);
  const done = clone(initial.document); done.cards[0].status = 'done';
  assert.equal((await httpCall(port, 'POST', '/api/validate', { document: done })).status, 422);
  assert.equal((await httpCall(port, 'PUT', '/api/workspace', { document: done, baseEtag: initial.etag })).status, 422);
  assert.deepEqual(await fs.readFile(store.paths.stateFile), initialBytes);
  await assert.rejects(fs.access(store.paths.backupDirectory), error => error.code === 'ENOENT');
  done.cards[0].evidence = 'QA reviewed on 5 October';
  assert.equal((await httpCall(port, 'POST', '/api/validate', { document: done })).status, 200);
});
