import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

export const DEFAULT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
export const MAX_DOCUMENT_BYTES = 64 * 1024 * 1024;
const MAX_ITEMS = 100_000;
const PRIORITIES = ['P0', 'P1', 'P2'];
const RELEASES = ['v1', 'later'];
const CARD_STATUSES = ['backlog', 'ready', 'doing', 'review', 'done', 'blocked'];
const PRD_HISTORY_SCOPE = 'dwdg-one-prd-planner:2026-10-03-v1';
const PRD_HISTORY_FIELDS = ['parent', 'title', 'notes', 'status', 'priority', 'owner', 'source', 'acceptance', 'dependencies'];
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,119}$/;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
export const etagFor = value => crypto.createHash('sha256').update(value).digest('hex');

export class PlanningError extends Error {
  constructor(message, status = 422, code = 'INVALID_DOCUMENT', details = []) {
    super(message);
    this.name = 'PlanningError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function reject(message) { throw new PlanningError(message); }
function object(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) reject(`${label} must be an object.`);
}
function string(value, label, required = false) {
  if (typeof value !== 'string' || (required && !value.trim())) reject(`${label} must be ${required ? 'a nonempty' : 'a'} string.`);
  if (value.length > 1_000_000) reject(`${label} is too large (maximum 1,000,000 characters per field).`);
}
function list(value, label) {
  if (!Array.isArray(value)) reject(`${label} must be an array.`);
  if (value.length > MAX_ITEMS) reject(`${label} exceeds the ${MAX_ITEMS.toLocaleString('en-US')}-item safety limit.`);
}
function id(value, label) {
  if (typeof value !== 'string' || !ID_PATTERN.test(value)) reject(`${label} must contain 1–120 letters, digits, dots, colons, underscores or hyphens and start with a letter or digit.`);
}
function enumValue(value, choices, label) {
  if (!choices.includes(value)) reject(`${label} must be one of: ${choices.join(', ')}.`);
}
function references(value, ids, label) {
  list(value, label);
  const seen = new Set();
  for (const ref of value) {
    id(ref, label);
    if (!ids.has(ref)) reject(`${label} references missing ID ${ref}.`);
    if (seen.has(ref)) reject(`${label} repeats ID ${ref}.`);
    seen.add(ref);
  }
}
function indexItems(items, label) {
  list(items, label);
  const index = new Map();
  for (const item of items) {
    object(item, `${label} item`);
    id(item.id, `${label}.id`);
    if (index.has(item.id)) reject(`${label} contains duplicate ID ${item.id}.`);
    index.set(item.id, item);
  }
  return index;
}
function acyclic(index, edges, label) {
  // Iterative topological validation avoids a call-stack ceiling on deep trees.
  const indegrees = new Map([...index.keys()].map(key => [key, 0]));
  const outgoing = new Map([...index.keys()].map(key => [key, []]));
  for (const item of index.values()) for (const ref of edges(item)) {
    if (!index.has(ref)) reject(`${label} references missing ID ${ref} from ${item.id}.`);
    outgoing.get(ref).push(item.id);
    indegrees.set(item.id, indegrees.get(item.id) + 1);
  }
  const ready = [...indegrees].filter(([, count]) => count === 0).map(([key]) => key);
  let processed = 0;
  for (let cursor = 0; cursor < ready.length; cursor++) {
    const key = ready[cursor];
    processed++;
    for (const child of outgoing.get(key)) {
      indegrees.set(child, indegrees.get(child) - 1);
      if (indegrees.get(child) === 0) ready.push(child);
    }
  }
  if (processed !== index.size) reject(`${label} contains a cycle involving ${[...indegrees].filter(([, count]) => count > 0).slice(0, 10).map(([key]) => key).join(', ')}.`);
}
function parentTree(index, label, singleRoot = false) {
  let roots = 0;
  for (const item of index.values()) {
    if (item.parent === null) roots++;
    else {
      id(item.parent, `${label}.${item.id}.parent`);
      if (!index.has(item.parent)) reject(`${label}.${item.id} references missing parent ${item.parent}.`);
    }
  }
  if (index.size && roots === 0) reject(`${label} must have a root.`);
  if (singleRoot && roots !== 1) reject(`${label} must have exactly one root.`);
  acyclic(index, item => item.parent === null ? [] : [item.parent], `${label} hierarchy`);
}
function nullableReference(value, index, label) {
  if (value !== null) {
    id(value, label);
    if (!index.has(value)) reject(`${label} references missing ID ${value}.`);
  }
}
function jsonSafe(value) {
  const stack = [{ value, ancestors: new Set(), label: 'document' }];
  while (stack.length) {
    const current = stack.pop();
    const candidate = current.value;
    if (candidate === null || typeof candidate === 'string' || typeof candidate === 'boolean') continue;
    if (typeof candidate === 'number' && Number.isFinite(candidate)) continue;
    if (typeof candidate !== 'object') reject(`${current.label} is not a JSON value.`);
    if (current.ancestors.has(candidate)) reject(`${current.label} contains a circular object.`);
    const prototype = Object.getPrototypeOf(candidate);
    if (!Array.isArray(candidate) && prototype !== Object.prototype && prototype !== null) reject(`${current.label} must be plain JSON.`);
    const ancestors = new Set(current.ancestors);
    ancestors.add(candidate);
    if (ancestors.size > 1_000) reject('The document is nested too deeply (maximum 1,000 object levels).');
    for (const [key, child] of Object.entries(candidate)) stack.push({ value: child, ancestors, label: `${current.label}.${key}` });
  }
}
export const dependencyIds = item => Array.isArray(item.dependencies)
  ? item.dependencies : (item.dependencies || '').split(/[\n,]+/).map(value => value.trim()).filter(Boolean);

/** Validates all known relationships while preserving every unknown JSON field. */
export function validateWorkspace(document) {
  object(document, 'document');
  jsonSafe(document);
  if (Buffer.byteLength(JSON.stringify(document)) > MAX_DOCUMENT_BYTES) reject('The planning document exceeds the 64 MiB safety limit.');
  if (document.kind !== 'dwdg-one-planning-workspace' || document.schemaVersion !== 1) reject('Expected dwdg-one-planning-workspace schemaVersion 1.');
  if (!Number.isSafeInteger(document.revision) || document.revision < 0) reject('revision must be a nonnegative safe integer.');
  string(document.updatedAt, 'updatedAt', true);
  if (Number.isNaN(Date.parse(document.updatedAt))) reject('updatedAt must be a valid date.');
  string(document.notes, 'notes');
  object(document.prd, 'prd');
  if (document.prd.kind !== 'dwdg-one-prd' || document.prd.schemaVersion !== 1) reject('Expected prd.kind dwdg-one-prd and schemaVersion 1.');
  string(document.prd.seedVersion, 'prd.seedVersion', true);
  string(document.prd.title, 'prd.title', true);
  const requirements = indexItems(document.prd.nodes, 'prd.nodes');
  parentTree(requirements, 'prd.nodes', true);
  if (!requirements.has('root') || requirements.get('root').parent !== null) reject('prd.nodes must contain ID root with parent null.');
  const requirementChildren = new Map([...requirements.keys()].map(key => [key, []]));
  for (const item of requirements.values()) if (item.parent !== null) requirementChildren.get(item.parent).push(item.id);
  const depthQueue = [{ key: 'root', depth: 0 }];
  for (let cursor = 0; cursor < depthQueue.length; cursor++) {
    const { key, depth } = depthQueue[cursor];
    if (depth > 40) reject('Keep the PRD hierarchy within 40 parent levels, matching the requirement editor.');
    for (const child of requirementChildren.get(key)) depthQueue.push({ key: child, depth: depth + 1 });
  }
  for (const requirement of requirements.values()) {
    for (const field of ['title', 'notes', 'owner', 'source', 'acceptance']) string(requirement[field], `prd.${requirement.id}.${field}`, field === 'title');
    for (const [field, limit] of [['title', 200], ['owner', 1_000], ['notes', 40_000], ['source', 40_000], ['acceptance', 40_000]]) if (requirement[field].length > limit) reject(`prd.${requirement.id}.${field} exceeds the requirement editor's ${limit.toLocaleString('en-US')}-character limit.`);
    enumValue(requirement.status, ['confirmed', 'proposed', 'open', 'deferred'], `prd.${requirement.id}.status`);
    enumValue(requirement.priority, PRIORITIES, `prd.${requirement.id}.priority`);
    if (requirement.dependencies !== undefined && !Array.isArray(requirement.dependencies)) string(requirement.dependencies, `prd.${requirement.id}.dependencies`);
    const dependencyText = Array.isArray(requirement.dependencies) ? requirement.dependencies.join('\n') : requirement.dependencies ?? '';
    if (dependencyText.length > 40_000) reject(`prd.${requirement.id}.dependencies exceeds the requirement editor's 40,000-character limit.`);
    references(dependencyIds(requirement), requirements, `prd.${requirement.id}.dependencies`);
  }
  acyclic(requirements, dependencyIds, 'PRD prerequisites');
  const packages = indexItems(document.wbs, 'wbs');
  parentTree(packages, 'wbs');
  for (const item of packages.values()) {
    for (const field of ['title', 'deliverable', 'owner', 'acceptance']) string(item[field], `wbs.${item.id}.${field}`, field === 'title');
    enumValue(item.priority, PRIORITIES, `wbs.${item.id}.priority`);
    enumValue(item.release, RELEASES, `wbs.${item.id}.release`);
    if (item.estimateHours !== null && (!Number.isFinite(item.estimateHours) || item.estimateHours < 0 || item.estimateHours > 1_000_000)) reject(`wbs.${item.id}.estimateHours must be null or a nonnegative number up to 1,000,000.`);
    references(item.requirementIds, requirements, `wbs.${item.id}.requirementIds`);
    references(item.dependsOn, packages, `wbs.${item.id}.dependsOn`);
  }
  acyclic(packages, item => item.dependsOn, 'WBS prerequisites');
  const activities = indexItems(document.activities, 'activities');
  const stories = indexItems(document.stories, 'stories');
  for (const item of activities.values()) {
    string(item.title, `activities.${item.id}.title`, true);
    if (!Number.isFinite(item.order)) reject(`activities.${item.id}.order must be a finite number.`);
  }
  for (const item of stories.values()) {
    nullableReference(item.activityId, activities, `stories.${item.id}.activityId`);
    if (item.activityId === null) reject(`stories.${item.id} must belong to an activity.`);
    for (const field of ['actor', 'action', 'benefit', 'acceptance']) string(item[field], `stories.${item.id}.${field}`, ['actor', 'action'].includes(field));
    enumValue(item.priority, PRIORITIES, `stories.${item.id}.priority`);
    enumValue(item.release, RELEASES, `stories.${item.id}.release`);
    if (!Number.isFinite(item.order)) reject(`stories.${item.id}.order must be a finite number.`);
    references(item.requirementIds, requirements, `stories.${item.id}.requirementIds`);
    nullableReference(item.wbsId, packages, `stories.${item.id}.wbsId`);
  }
  const cards = indexItems(document.cards, 'cards');
  for (const item of cards.values()) {
    for (const field of ['title', 'description', 'owner', 'acceptance', 'evidence']) string(item[field], `cards.${item.id}.${field}`, field === 'title');
    enumValue(item.status, CARD_STATUSES, `cards.${item.id}.status`);
    if (item.status === 'done' && !item.evidence.trim()) reject(`cards.${item.id} requires recorded evidence before moving to done.`);
    enumValue(item.priority, PRIORITIES, `cards.${item.id}.priority`);
    enumValue(item.release, RELEASES, `cards.${item.id}.release`);
    references(item.requirementIds, requirements, `cards.${item.id}.requirementIds`);
    references(item.storyIds, stories, `cards.${item.id}.storyIds`);
    references(item.dependsOn, cards, `cards.${item.id}.dependsOn`);
    nullableReference(item.wbsId, packages, `cards.${item.id}.wbsId`);
  }
  acyclic(cards, item => item.dependsOn, 'Kanban prerequisites');
  const history = indexItems(document.history, 'history');
  for (const item of history.values()) {
    for (const field of ['at', 'actor', 'action', 'summary']) string(item[field], `history.${item.id}.${field}`, true);
    if (Number.isNaN(Date.parse(item.at))) reject(`history.${item.id}.at must be a valid date.`);
    list(item.changes, `history.${item.id}.changes`);
  }
  if (document.prd.history !== undefined) list(document.prd.history, 'prd.history');
  if (document.prd.changeHistory !== undefined) {
    const history = document.prd.changeHistory;
    object(history, 'prd.changeHistory');
    if (history.kind !== 'dwdg-one-prd-history' || history.schemaVersion !== 1) reject('prd.changeHistory must be a dwdg-one-prd-history schemaVersion 1 envelope.');
    if (history.scope !== PRD_HISTORY_SCOPE) reject(`prd.changeHistory.scope must be ${PRD_HISTORY_SCOPE}, matching the requirement editor.`);
    list(history.events, 'prd.changeHistory.events');
    const events = indexItems(history.events, 'prd.changeHistory.events');
    for (const event of events.values()) {
      for (const field of ['at', 'summary']) string(event[field], `prd.changeHistory.${event.id}.${field}`, field === 'at');
      if (Number.isNaN(Date.parse(event.at))) reject(`prd.changeHistory.${event.id}.at must be a valid date.`);
      enumValue(event.action, ['add', 'edit', 'move', 'delete', 'undo', 'redo', 'import'], `prd.changeHistory.${event.id}.action`);
      list(event.changes, `prd.changeHistory.${event.id}.changes`);
      for (const [index, change] of event.changes.entries()) {
        const label = `prd.changeHistory.${event.id}.changes[${index}]`;
        object(change, label);
        string(change.id, `${label}.id`);
        string(change.title, `${label}.title`);
        enumValue(change.action, ['added', 'deleted', 'edited', 'moved'], `${label}.action`);
        object(change.fields, `${label}.fields`);
        for (const [field, diff] of Object.entries(change.fields)) {
          if (!PRD_HISTORY_FIELDS.includes(field)) reject(`${label}.fields contains an unsupported field ${field}.`);
          object(diff, `${label}.fields.${field}`);
          for (const side of ['before', 'after']) if (!Object.hasOwn(diff, side) || !(diff[side] === null || typeof diff[side] === 'string')) reject(`${label}.fields.${field}.${side} must be present as a string or null.`);
        }
      }
    }
  }
  return document;
}

function markdownText(value) { return String(value ?? '').replace(/\r/g, ''); }
function mdHeading(value) { return markdownText(value).replace(/\n/g, ' '); }
function bullets(values) { return values.length ? values.join(', ') : 'None'; }
export function workspaceMarkdown(document) {
  validateWorkspace(document);
  const lines = [
    `# ${mdHeading(document.prd.title)} — planning workspace`, '',
    `Revision: ${document.revision} · Updated: ${document.updatedAt}`, '',
    'This is a generated readable view of state/planning-workspace.json. Edit the JSON through the planner app or planner-cli.mjs; this Markdown is regenerated. Planning states and Kanban progress are separate from production evidence. No hosted organization authentication is provided by this local tool.', '',
    '## Workspace notes', '', markdownText(document.notes), '',
    '## PRD requirements', '',
  ];
  for (const item of document.prd.nodes) {
    lines.push(`### ${mdHeading(item.title)}`, '', `ID: \`${item.id}\` · Parent: ${item.parent ?? 'Root'} · Decision: ${item.status} · Priority: ${item.priority}`, '', markdownText(item.notes), '', `**Owner:** ${markdownText(item.owner)}`, '', `**Acceptance:**\n${markdownText(item.acceptance)}`, '', `**Source / assumption:** ${markdownText(item.source)}`, '', `**Prerequisites:** ${bullets(dependencyIds(item))}`, '');
  }
  lines.push('## Work Breakdown Structure', '');
  for (const item of document.wbs) lines.push(`### ${mdHeading(item.title)}`, '', `ID: \`${item.id}\` · Parent: ${item.parent ?? 'Root'} · Release: ${item.release} · Priority: ${item.priority}`, '', `**Deliverable:** ${markdownText(item.deliverable)}`, '', `**Owner:** ${markdownText(item.owner)} · **Estimate:** ${item.estimateHours === null ? 'Not estimated' : `${item.estimateHours} hours`}`, '', `**Acceptance:**\n${markdownText(item.acceptance)}`, '', `**Requirements:** ${bullets(item.requirementIds)}`, '', `**Prerequisites:** ${bullets(item.dependsOn)}`, '');
  lines.push('## Kanban', '');
  for (const status of CARD_STATUSES) {
    lines.push(`### ${status}`, '');
    for (const item of document.cards.filter(item => item.status === status)) lines.push(`#### ${mdHeading(item.title)}`, '', `ID: \`${item.id}\` · Priority: ${item.priority} · Release: ${item.release} · Owner: ${markdownText(item.owner)}`, '', markdownText(item.description), '', `**Acceptance:**\n${markdownText(item.acceptance)}`, '', `**Evidence:** ${markdownText(item.evidence) || 'None recorded'}`, '', `**WBS:** ${item.wbsId ?? 'None'} · **Requirements:** ${bullets(item.requirementIds)} · **Stories:** ${bullets(item.storyIds)}`, '', `**Prerequisites:** ${bullets(item.dependsOn)}`, '');
  }
  lines.push('## User story map', '');
  for (const activity of [...document.activities].sort((left, right) => left.order - right.order)) {
    lines.push(`### ${mdHeading(activity.title)} [${activity.id}]`, '');
    for (const item of document.stories.filter(item => item.activityId === activity.id).sort((left, right) => left.order - right.order)) lines.push(`#### ${item.id} · ${mdHeading(item.actor)}`, '', `As ${markdownText(item.actor)}, I want to ${markdownText(item.action)}, so that ${markdownText(item.benefit)}.`, '', `Release: ${item.release} · Priority: ${item.priority} · WBS: ${item.wbsId ?? 'None'}`, '', `**Acceptance:**\n${markdownText(item.acceptance)}`, '', `**Requirements:** ${bullets(item.requirementIds)}`, '');
  }
  lines.push('## Planning change history', '', 'Local actor labels are user-provided, not authenticated organization identities. This history is not the production audit log.', '');
  for (const item of [...document.history].reverse()) lines.push(`### ${item.at} · ${mdHeading(item.summary)}`, '', `ID: ${item.id} · Actor: ${markdownText(item.actor)} · Action: ${item.action}`, '', '```json', JSON.stringify(item.changes, null, 2), '```', '');
  if (!document.history.length) lines.push('No file-backed changes recorded yet.', '');
  return lines.join('\n');
}

async function atomicWrite(file, content) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp-${process.pid}-${crypto.randomUUID()}`;
  let handle;
  try {
    handle = await fs.open(temp, 'wx');
    await handle.writeFile(content, 'utf8');
    await handle.sync();
    await handle.close();
    handle = undefined;
    await fs.rename(temp, file);
  } finally {
    if (handle) await handle.close().catch(() => {});
    await fs.unlink(temp).catch(error => { if (error.code !== 'ENOENT') throw error; });
  }
}
function parseDocument(raw, label) {
  let document;
  try { document = JSON.parse(raw); }
  catch (error) { throw new PlanningError(`${label} contains invalid JSON. It has been preserved; repair it or recover a reviewed backup. ${error.message}`, 422, 'CORRUPT_JSON'); }
  try { validateWorkspace(document); }
  catch (error) { throw new PlanningError(`${label} failed validation. It has been preserved. ${error.message}`, 422, 'INVALID_DOCUMENT', error.details); }
  return document;
}
function changedRecords(previous, next) {
  const changes = [];
  for (const collection of ['wbs', 'cards', 'activities', 'stories', 'prd.nodes']) {
    const oldItems = collection === 'prd.nodes' ? previous.prd.nodes : previous[collection];
    const newItems = collection === 'prd.nodes' ? next.prd.nodes : next[collection];
    const before = new Map(oldItems.map(item => [item.id, item]));
    const after = new Map(newItems.map(item => [item.id, item]));
    for (const [key, item] of after) {
      if (!before.has(key)) changes.push({ collection, id: key, action: 'add', after: item });
      else if (JSON.stringify(before.get(key)) !== JSON.stringify(item)) changes.push({ collection, id: key, action: 'edit', before: before.get(key), after: item });
    }
    for (const [key, item] of before) if (!after.has(key)) changes.push({ collection, id: key, action: 'delete', before: item });
  }
  if (previous.notes !== next.notes) changes.push({ collection: 'workspace', id: 'notes', action: 'edit', before: previous.notes, after: next.notes });
  for (const key of new Set([...Object.keys(previous), ...Object.keys(next)])) if (!['kind', 'schemaVersion', 'revision', 'updatedAt', 'prd', 'wbs', 'cards', 'activities', 'stories', 'history', 'notes'].includes(key) && JSON.stringify(previous[key]) !== JSON.stringify(next[key])) changes.push({ collection: 'workspace', id: key, action: 'edit', before: previous[key] ?? null, after: next[key] ?? null });
  const oldPrd = { ...previous.prd }; delete oldPrd.nodes;
  const newPrd = { ...next.prd }; delete newPrd.nodes;
  if (JSON.stringify(oldPrd) !== JSON.stringify(newPrd)) changes.push({ collection: 'prd', id: 'metadata', action: 'edit', before: oldPrd, after: newPrd });
  return changes;
}

export function createPlanningStore(options = {}) {
  const directory = path.resolve(options.directory ?? DEFAULT_DIRECTORY);
  const stateDirectory = path.join(directory, 'state');
  const stateFile = path.join(stateDirectory, 'planning-workspace.json');
  const markdownFile = path.join(stateDirectory, 'PLANNING_WORKSPACE.md');
  const seedFile = path.join(directory, 'planner-seed.json');
  const backupDirectory = path.join(stateDirectory, 'backups');
  const lockFile = path.join(stateDirectory, '.planning-workspace.lock');
  const recoveryLockFile = path.join(stateDirectory, '.planning-workspace-recovery.lock');
  const lockTimeoutMs = options.lockTimeoutMs ?? 15_000;
  let queue = Promise.resolve();
  let markdownHash = '';

  async function recoverAbandonedLock() {
    let guard;
    try { guard = await fs.open(recoveryLockFile, 'wx'); }
    catch (error) { if (error.code === 'EEXIST') return; throw error; }
    try {
      // Re-read under a recovery guard: two processes must not remove a newly acquired lock.
      const info = await fs.stat(lockFile);
      if (Date.now() - info.mtimeMs < 2_000) return;
      let lock;
      try { lock = JSON.parse(await fs.readFile(lockFile, 'utf8')); } catch {}
      let abandoned = false;
      if (lock?.hostname === os.hostname() && Number.isInteger(lock.pid) && lock.pid > 0) {
        try { process.kill(lock.pid, 0); } catch (probe) { abandoned = probe.code === 'ESRCH'; }
      } else if (!lock && Date.now() - info.mtimeMs > 60_000) abandoned = true;
      if (abandoned) await fs.unlink(lockFile);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
    finally { await guard.close(); await fs.unlink(recoveryLockFile).catch(error => { if (error.code !== 'ENOENT') throw error; }); }
  }

  async function acquireLock() {
    await fs.mkdir(stateDirectory, { recursive: true });
    const started = Date.now();
    while (true) {
      try {
        const handle = await fs.open(lockFile, 'wx');
        const token = crypto.randomUUID();
        try { await handle.writeFile(JSON.stringify({ pid: process.pid, hostname: os.hostname(), createdAt: new Date().toISOString(), token })); await handle.close(); }
        catch (error) { await handle.close().catch(() => {}); await fs.unlink(lockFile).catch(() => {}); throw error; }
        return async () => {
          let lock;
          try { lock = JSON.parse(await fs.readFile(lockFile, 'utf8')); }
          catch (error) { if (error.code === 'ENOENT') return; throw error; }
          if (lock.token === token) await fs.unlink(lockFile);
        };
      } catch (error) {
        if (error.code !== 'EEXIST') throw error;
        await recoverAbandonedLock();
        if (Date.now() - started >= lockTimeoutMs) throw new PlanningError('Another planner operation holds the file lock. Retry shortly; do not delete an active lock.', 423, 'WORKSPACE_LOCKED');
        await sleep(30 + Math.floor(Math.random() * 40));
      }
    }
  }
  function locked(operation) {
    const result = queue.then(async () => {
      const release = await acquireLock();
      try { return await operation(); } finally { await release(); }
    });
    queue = result.catch(() => {});
    return result;
  }
  async function regenerateMarkdown(document, hash) {
    if (markdownHash === hash) {
      try { await fs.access(markdownFile); return; } catch {}
    }
    await atomicWrite(markdownFile, workspaceMarkdown(document));
    markdownHash = hash;
  }
  async function readUnlocked() {
    let raw;
    try { raw = await fs.readFile(stateFile, 'utf8'); }
    catch (error) {
      if (error.code !== 'ENOENT') throw error;
      let seed;
      try { seed = await fs.readFile(seedFile, 'utf8'); }
      catch (seedError) { if (seedError.code === 'ENOENT') throw new PlanningError('No saved workspace or planner-seed.json exists. Preserve existing editor exports; create a reviewed seed before initializing.', 503, 'SEED_MISSING'); throw seedError; }
      const document = parseDocument(seed, 'planner-seed.json');
      raw = `${JSON.stringify(document, null, 2)}\n`;
      await atomicWrite(stateFile, raw);
    }
    const document = parseDocument(raw, 'state/planning-workspace.json');
    const etag = etagFor(raw);
    await regenerateMarkdown(document, etag);
    return { document, etag, raw };
  }
  return {
    paths: { directory, stateDirectory, stateFile, seedFile, markdownFile, backupDirectory, lockFile },
    read: () => locked(async () => { const { document, etag } = await readUnlocked(); return { document, etag }; }),
    save: (input, baseEtag, options = {}) => locked(async () => {
      validateWorkspace(input);
      if (typeof baseEtag !== 'string' || !/^[a-f0-9]{64}$/.test(baseEtag)) throw new PlanningError('baseEtag is required. Read the latest workspace before saving.', 409, 'REVISION_CONFLICT');
      const current = await readUnlocked();
      if (current.etag !== baseEtag) throw new PlanningError('The saved file changed after you loaded it. Reload or merge your draft with the current workspace; no files were overwritten.', 409, 'REVISION_CONFLICT', [{ currentEtag: current.etag, currentRevision: current.document.revision }]);
      const actor = options.actor ?? 'Local editor';
      const summary = options.summary ?? 'Updated planning workspace';
      string(actor, 'actor', true);
      string(summary, 'summary', true);
      const next = JSON.parse(JSON.stringify(input));
      const existingHistory = new Map(current.document.history.map(item => [item.id, item]));
      const importedHistory = next.history.filter(item => !existingHistory.has(item.id)).map(item => ({ ...item, importStatus: 'imported-unverified' }));
      next.history = [...current.document.history, ...importedHistory];
      next.revision = current.document.revision + 1;
      next.updatedAt = new Date().toISOString();
      next.history.push({ id: `change-${crypto.randomUUID()}`, at: next.updatedAt, actor, action: 'save', summary, changes: changedRecords(current.document, next) });
      validateWorkspace(next);
      await fs.mkdir(backupDirectory, { recursive: true });
      const backupFile = path.join(backupDirectory, `${next.updatedAt.replace(/[:.]/g, '-')}-r${current.document.revision}-${current.etag.slice(0, 12)}-${crypto.randomUUID().slice(0, 8)}.json`);
      const backup = await fs.open(backupFile, 'wx');
      try { await backup.writeFile(current.raw, 'utf8'); await backup.sync(); } finally { await backup.close(); }
      // External editors do not honor our lock. Check again immediately before committing.
      const finalRaw = await fs.readFile(stateFile, 'utf8');
      if (etagFor(finalRaw) !== current.etag) throw new PlanningError('An external editor changed the file during this save. Your previous version is backed up; the external file was preserved. Reload and merge.', 409, 'REVISION_CONFLICT');
      const raw = `${JSON.stringify(next, null, 2)}\n`;
      await atomicWrite(stateFile, raw);
      const etag = etagFor(raw);
      try { await regenerateMarkdown(next, etag); }
      catch (error) { return { document: next, etag, backupFile, warning: `JSON was saved, but its readable Markdown needs refresh: ${error.message}` }; }
      return { document: next, etag, backupFile };
    }),
  };
}
