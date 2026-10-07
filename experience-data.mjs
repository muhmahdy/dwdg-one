import { STORE_KEY, DIVISIONS, makeSeed, validateState, iso, addDays, validDate } from './model.mjs';
import { makeDivisionSeed, makeDivisionDemoData, validateDivisionState } from './division-workspaces.mjs';

export const EXPERIENCE_KEYS = Object.freeze({ core: STORE_KEY, divisions: 'dwdg-division-preview-v03', extras: 'dwdg-project-extras-v1', extension: 'dwdg-experience-v1' });
export const DEFAULT_PREFERENCES = Object.freeze({ theme: 'system', language: 'en', motion: 'system', transparency: 'system', reminderDays: 1 });
export const EXTRA_TYPES = ['milestones', 'blockers', 'dependencies', 'decisions', 'documents'];
const EXTENSION_TYPES = ['partners', 'followups', 'deliveries', 'legalRequests', 'meetingNotes', 'notifications'];
const copy = value => structuredClone(value);
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const identifier = () => globalThis.crypto?.randomUUID?.() || `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const emptyExtras = () => Object.fromEntries(EXTRA_TYPES.map(type => [type, []]));
const options = (...values) => values;
export const RECORD_SCHEMAS = Object.freeze({
  partners: { collection: 'partners', titleField: 'title', labels: { en: 'Partner', id: 'Mitra' }, fields: [
    ['title', 'Organization', 'Organisasi', 'text'], ['contactName', 'Contact name', 'Nama kontak', 'text'], ['email', 'Email', 'Email', 'email'], ['phone', 'Phone', 'Telepon', 'tel'],
    ['stage', 'Relationship stage', 'Tahap hubungan', 'select', options(['prospect', 'Prospect', 'Prospek'], ['contacted', 'Contacted', 'Dihubungi'], ['discussion', 'In discussion', 'Diskusi'], ['active', 'Active partner', 'Mitra aktif'], ['closed', 'Closed', 'Ditutup'])],
    ['ownerId', 'Relationship owner', 'Penanggung jawab', 'member'], ['projectId', 'Project', 'Proyek', 'project'], ['notes', 'Context / interactions', 'Konteks / interaksi', 'textarea']
  ] },
  followups: { collection: 'followups', titleField: 'title', labels: { en: 'Follow-up', id: 'Tindak lanjut' }, fields: [
    ['title', 'Next action', 'Tindakan berikutnya', 'text'], ['partnerId', 'Partner', 'Mitra', 'partner'], ['ownerId', 'Owner', 'Penanggung jawab', 'member'], ['projectId', 'Project', 'Proyek', 'project'], ['dueDate', 'Follow-up date', 'Tanggal tindak lanjut', 'date'],
    ['status', 'Status', 'Status', 'select', options(['open', 'Open', 'Terbuka'], ['done', 'Completed', 'Selesai'])], ['notes', 'Interaction notes', 'Catatan interaksi', 'textarea']
  ] },
  deliveries: { collection: 'deliveries', titleField: 'title', labels: { en: 'Delivery', id: 'Penyerahan' }, fields: [
    ['title', 'Deliverable', 'Hasil kerja', 'text'], ['projectId', 'Project', 'Proyek', 'project'], ['leadId', 'Project lead', 'Ketua proyek', 'member'], ['managerId', 'Project manager', 'Manajer proyek', 'member'], ['dueDate', 'Due date', 'Tenggat', 'date'],
    ['stage', 'Delivery stage', 'Tahap penyerahan', 'select', options(['discovery', 'Discovery', 'Penemuan'], ['preparation', 'Preparation', 'Persiapan'], ['review', 'In review', 'Ditinjau'], ['ready', 'Ready', 'Siap'], ['delivered', 'Delivered', 'Diserahkan'])],
    ['scope', 'Scope / agreed outcome', 'Lingkup / hasil yang disepakati', 'textarea'], ['scopeChanges', 'Scope changes', 'Perubahan lingkup', 'textarea'], ['reviewNotes', 'Review / revision notes', 'Catatan tinjauan / revisi', 'textarea'], ['briefReady', 'Brief agreed', 'Ringkasan disepakati', 'checkbox'], ['evidenceReady', 'Evidence checked', 'Bukti diperiksa', 'checkbox'], ['reviewReady', 'Review completed', 'Tinjauan selesai', 'checkbox']
  ] },
  legalRequests: { collection: 'legalRequests', titleField: 'title', labels: { en: 'Legal request', id: 'Permintaan legal' }, fields: [
    ['title', 'Document / request', 'Dokumen / permintaan', 'text'], ['projectId', 'Project', 'Proyek', 'project'], ['ownerId', 'Reviewer', 'Peninjau', 'member'], ['dueDate', 'Needed by', 'Dibutuhkan pada', 'date'],
    ['stage', 'Document stage', 'Tahap dokumen', 'select', options(['requested', 'Requested', 'Diminta'], ['review', 'In review', 'Ditinjau'], ['revision', 'Revision needed', 'Perlu revisi'], ['signature', 'Awaiting signature', 'Menunggu tanda tangan'], ['signed', 'Signed — recorded locally', 'Ditandatangani — dicatat lokal'], ['handoff', 'Finance handoff', 'Serah terima keuangan'])],
    ['documentUrl', 'Document link', 'Tautan dokumen', 'url'], ['template', 'Template / document type', 'Templat / jenis dokumen', 'text'], ['revisionNotes', 'Revision history / notes', 'Riwayat / catatan revisi', 'textarea'], ['signatory', 'Signatory', 'Penandatangan', 'text'], ['handoffNotes', 'BAST / invoice handoff notes', 'Catatan serah terima BAST / invoice', 'textarea']
  ] },
  meetingNotes: { collection: 'meetingNotes', titleField: 'title', labels: { en: 'Meeting notes', id: 'Notulen rapat' }, fields: [
    ['title', 'Meeting / discussion', 'Rapat / diskusi', 'text'], ['eventId', 'Meeting', 'Rapat', 'event'], ['projectId', 'Project', 'Proyek', 'project'], ['date', 'Date', 'Tanggal', 'date'], ['ownerId', 'Note owner', 'Pencatat', 'member'],
    ['status', 'Status', 'Status', 'select', options(['draft', 'Draft', 'Draf'], ['recorded', 'Recorded', 'Tercatat'])], ['notes', 'Discussion notes', 'Catatan diskusi', 'textarea'], ['decisions', 'Decisions', 'Keputusan', 'textarea'], ['followupTaskId', 'Linked follow-up task', 'Tugas tindak lanjut', 'task']
  ] }
});

function emptyCore(today) {
  const seed = makeSeed(today);
  return { ...seed, profile: { name: 'Workspace member', memberId: 'me' }, members: [{ id: 'me', name: 'Workspace member', initials: 'WM' }], projects: [], tasks: [], events: [], activity: [] };
}

function makeExtension(core, today, sample = false) {
  const knownDates = core.tasks.filter(task => task.status === 'done').map(task => String(task.completedAt || '').slice(0, 10)).filter(date => validDate(date) && date <= today).sort();
  const result = { version: 1, ...Object.fromEntries(EXTENSION_TYPES.map(type => [type, []])), preferences: { ...DEFAULT_PREFERENCES }, recordedSince: knownDates[0] || today, sample };
  if (!sample) return result;
  result.partners = [
    { id: 'sample-partner-1', title: 'Campus innovation network', contactName: 'Sample coordinator', email: '', phone: '', stage: 'discussion', ownerId: 'r', projectId: 'partners', notes: 'Illustrative partner. Confirm the workshop scope before an agreement.', sample: true },
    { id: 'sample-partner-2', title: 'Student enterprise community', contactName: 'Sample liaison', email: '', phone: '', stage: 'contacted', ownerId: 'f', projectId: 'partners', notes: 'Illustrative partner record.', sample: true }
  ];
  result.followups = [
    { id: 'sample-followup-1', title: 'Confirm collaboration objectives', partnerId: 'sample-partner-1', ownerId: 'r', projectId: 'partners', dueDate: today, status: 'open', notes: 'Record a meeting time after both sides agree.', sample: true },
    { id: 'sample-followup-2', title: 'Share the outreach brief', partnerId: 'sample-partner-2', ownerId: 'f', projectId: 'partners', dueDate: addDays(today, 3), status: 'open', notes: '', sample: true }
  ];
  result.deliveries = [
    { id: 'sample-delivery-1', title: 'Consulting workshop brief', projectId: 'bootcamp', leadId: 'a', managerId: 'me', dueDate: addDays(today, 1), stage: 'review', scope: 'A practical case workshop and facilitated team review.', scopeChanges: '', reviewNotes: 'Confirm facilitator availability and check the practice case.', briefReady: true, evidenceReady: false, reviewReady: false, sample: true },
    { id: 'sample-delivery-2', title: 'Practice case and review guide', projectId: 'bootcamp', leadId: 'a', managerId: 'f', dueDate: addDays(today, 12), stage: 'preparation', scope: 'Prepare one case with a facilitator review guide.', scopeChanges: '', reviewNotes: '', briefReady: true, evidenceReady: false, reviewReady: false, sample: true }
  ];
  result.legalRequests = [{ id: 'sample-legal-1', title: 'Partnership agreement review', projectId: 'partners', ownerId: 'f', dueDate: addDays(today, 7), stage: 'review', number: `DRAFT-${today.slice(0, 4)}-0001`, documentUrl: '', template: 'Collaboration agreement', revisionNotes: 'Illustrative request: confirm scope and signatory.', signatory: '', handoffNotes: '', sample: true }];
  result.meetingNotes = [{ id: 'sample-notes-1', title: 'Weekly division sync', eventId: 'e1', projectId: 'digital', date: today, ownerId: 'me', status: 'draft', notes: 'Illustrative agenda: review blockers and agree next steps.', decisions: '', followupTaskId: 't11', sample: true }];
  return result;
}

function makeSampleExtras(core, today) {
  const byProject = Object.fromEntries(core.projects.map(project => [project.id, emptyExtras()]));
  for (const project of core.projects) {
    byProject[project.id].milestones.push({ id: `sample-milestone-${project.id}`, project_id: project.id, title: 'Delivery checkpoint', due_date: project.end, status: 'planned', owner_id: project.owner, position: 0, reached_at: null, sample: true });
  }
  byProject.bootcamp.blockers.push({ id: 'sample-blocker-facilitator', project_id: 'bootcamp', task_id: 't7', milestone_id: null, title: 'Facilitator availability', description: 'Waiting for confirmation before preparing the final agenda.', severity: 'high', owner_id: 'a', opened_at: `${today}T09:00:00`, requested_action: 'Confirm availability or identify an alternative.', target_resolution_date: addDays(today, 2), resolution_note: '', resolved_at: null, sample: true });
  byProject.digital.decisions.push({ id: 'sample-decision-local', project_id: 'digital', decision: 'Review the local experience before backend integration.', rationale: 'Make the core journeys useful and consistent first.', decided_at: `${today}T12:00:00`, supersedes_id: null, sample: true });
  return { version: 1, byProject };
}

function validExtras(data) {
  if (!object(data) || data.version !== 1 || !object(data.byProject)) return false;
  return Object.values(data.byProject).every(project => object(project) && EXTRA_TYPES.every(type => Array.isArray(project[type]) && project[type].every(row => object(row) && typeof (row.id || row.depends_on_id) === 'string') && new Set(project[type].map(row => row.id || row.depends_on_id)).size === project[type].length));
}

export function validateExperienceExtension(data) {
  if (!object(data) || data.version !== 1 || !validDate(data.recordedSince) || !object(data.preferences)) return false;
  if (!EXTENSION_TYPES.every(type => Array.isArray(data[type]) && data[type].every(row => object(row) && typeof row.id === 'string' && row.id && (type === 'notifications' || typeof row.title === 'string' && row.title.trim())) && new Set(data[type].map(row => row.id)).size === data[type].length)) return false;
  const { theme, language, motion, transparency, reminderDays } = data.preferences;
  if (!['system', 'light', 'dark'].includes(theme) || !['en', 'id'].includes(language) || !['system', 'full', 'reduced'].includes(motion) || !['system', 'full', 'reduced', 'solid'].includes(transparency) || !Number.isInteger(reminderDays) || reminderDays < 0 || reminderDays > 30) return false;
  return Object.entries(RECORD_SCHEMAS).every(([type, schema]) => data[type].every(row => schema.fields.every(([key,,, fieldType, values]) => {
    const value = row[key];
    if (value === '' || value === undefined || value === null) return true;
    if (fieldType === 'date') return validDate(value);
    if (fieldType === 'checkbox') return typeof value === 'boolean';
    if (fieldType === 'select') return values.some(([choice]) => choice === value);
    if (fieldType === 'url') { try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; } }
    return typeof value === 'string';
  })));
}

/** Local adapter. Invalid source bytes stay untouched and the affected store is read-only. */
export function createExperienceStore(storage = globalThis.localStorage) {
  const today = iso(), issues = [], listeners = new Set(), protectedKeys = new Set(), initialRaw = {}, unreadableStores = {};
  for (const [name, key] of Object.entries(EXPERIENCE_KEYS)) {
    try { initialRaw[name] = storage?.getItem(key) ?? null; }
    catch { initialRaw[name] = null; protectedKeys.add(name); issues.push(`Cannot read ${key}. Changes to this store are disabled.`); }
  }
  const brandNew = Object.values(initialRaw).every(raw => raw === null) && !protectedKeys.size;
  function read(name, fallback, validate) {
    const raw = initialRaw[name];
    if (raw === null) return fallback;
    try { const data = JSON.parse(raw); if (!validate(data)) throw new Error('Invalid data'); return data; }
    catch { protectedKeys.add(name); unreadableStores[EXPERIENCE_KEYS[name]] = raw; issues.push(`Saved ${name} could not be read. The original data is preserved; this store is read-only.`); return fallback; }
  }
  let core = read('core', brandNew ? makeSeed(today) : emptyCore(today), validateState);
  let divisions = read('divisions', brandNew ? makeDivisionDemoData(today) : makeDivisionSeed(today), value => validateDivisionState(value).ok);
  let extras = read('extras', brandNew ? makeSampleExtras(core, today) : { version: 1, byProject: {} }, validExtras);
  let extension = read('extension', makeExtension(core, today, brandNew), validateExperienceExtension);
  const undoHistory = [];
  const readState = () => ({ core, divisions, extras, extension });
  const assign = state => { ({ core, divisions, extras, extension } = state); };
  const validators = { core: validateState, divisions: value => validateDivisionState(value).ok, extras: validExtras, extension: validateExperienceExtension };
  const publish = event => { for (const fn of listeners) { try { fn(event); } catch (error) { console.error('Workspace subscriber failed:', error); } } };
  function transaction(changes, message, remember = true) {
    const names = Object.keys(changes), before = copy(readState()), rawBefore = {}, encoded = {};
    for (const name of names) {
      if (protectedKeys.has(name)) throw new Error(`Saved ${name} is protected because it could not be read. Export a backup before recovery.`);
      let valid = false;
      try { valid = validators[name]?.(changes[name]); } catch { /* Malformed imports are validation failures. */ }
      if (!valid) throw new Error(`Invalid ${name} data. Your change was not saved.`);
      encoded[name] = JSON.stringify(changes[name]);
      try { rawBefore[name] = storage?.getItem(EXPERIENCE_KEYS[name]) ?? null; }
      catch { throw new Error('Browser storage is unavailable. Your change was not saved.'); }
      if (rawBefore[name] !== null) {
        let savedValid = false;
        try { savedValid = validators[name](JSON.parse(rawBefore[name])); } catch { /* Another tab may have changed the saved format. */ }
        if (!savedValid) {
          protectedKeys.add(name);
          unreadableStores[EXPERIENCE_KEYS[name]] = rawBefore[name];
          const issue = `Saved ${name} changed to an unreadable format. The original data is preserved; this store is read-only.`;
          issues.push(issue);
          throw new Error(issue);
        }
      }
    }
    const written = [];
    try {
      if (!storage?.setItem) throw new Error('Storage unavailable');
      for (const name of names) { storage.setItem(EXPERIENCE_KEYS[name], encoded[name]); written.push(name); }
    } catch (error) {
      const rollbackFailures = [];
      for (const name of written.reverse()) {
        try { if (rawBefore[name] === null) storage.removeItem(EXPERIENCE_KEYS[name]); else storage.setItem(EXPERIENCE_KEYS[name], rawBefore[name]); }
        catch { rollbackFailures.push(name); protectedKeys.add(name); }
      }
      if (rollbackFailures.length) { const detail = `Storage failed during rollback (${rollbackFailures.join(', ')}). Export this session before reloading.`; issues.push(detail); throw new Error(detail); }
      throw new Error('Browser storage is full or unavailable. Your change was not saved.', { cause: error });
    }
    assign({ ...readState(), ...copy(changes) });
    if (remember) {
      undoHistory.push({ before, names, rawBefore });
      if (undoHistory.length > 20) undoHistory.shift();
    }
    publish({ message: message || 'Saved', stores: names, undo: !remember && message === 'Change undone' });
    return true;
  }
  // Persist new defaults once so sample dates remain anchored on later reloads.
  const initialChanges = Object.fromEntries(Object.entries(readState()).filter(([name]) => initialRaw[name] === null && !protectedKeys.has(name)));
  if (Object.keys(initialChanges).length) {
    try { transaction(initialChanges, '', false); }
    catch (error) { issues.push(error.message); }
  }
  function normalizeExtension(next) {
    const result = copy(next), year = today.slice(0, 4);
    let sequence = Math.max(0, ...result.legalRequests.map(row => new RegExp(`^DRAFT-${year}-(\\d+)$`).exec(row.number || '')).filter(Boolean).map(match => Number(match[1])));
    result.legalRequests.forEach(row => { if (!row.number) row.number = `DRAFT-${year}-${String(++sequence).padStart(4, '0')}`; });
    return result;
  }
  const api = {
    get core() { return core; }, get divisions() { return divisions; }, get extras() { return extras; }, get extension() { return extension; }, get issues() { return issues; }, get canUndo() { return undoHistory.length > 0; },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    saveCore(next, message) { return transaction({ core: next }, message); },
    saveDivision(next, message) { return transaction({ divisions: next }, message); },
    saveExtras(projectId, next, message) { if (!core.projects.some(project => project.id === projectId)) throw new Error('Choose an existing project.'); return transaction({ extras: { ...extras, byProject: { ...extras.byProject, [projectId]: next } } }, message); },
    saveExtension(next, message) { return transaction({ extension: normalizeExtension(next) }, message); },
    undo() {
      if (!undoHistory.length) return false;
      const pending = undoHistory.pop();
      try { transaction(Object.fromEntries(pending.names.map(name => [name, pending.before[name]])), 'Change undone', false); }
      catch (error) { undoHistory.push(pending); throw error; }
      return true;
    },
    exportAll() { return { format: 'dwdg-experience-backup', version: 1, exportedAt: new Date().toISOString(), ...copy(readState()), unreadableStores: copy(unreadableStores), attachmentsIncluded: false }; },
    importAll(data) {
      // Legacy core-only backups remain supported without resetting other stores.
      if (data?.version === 1 && data.profile) return transaction({ core: data }, 'Workspace imported');
      if (data?.format !== 'dwdg-experience-backup' || data.version !== 1) throw new Error('Choose a DWDG workspace backup.');
      return transaction(Object.fromEntries(Object.keys(EXPERIENCE_KEYS).map(name => [name, data[name]])), 'Workspace imported');
    }
  };
  return api;
}

export function listAllDocuments(store) {
  return Object.entries(store.extras.byProject).flatMap(([projectId, data]) => data.documents.map(document => ({ ...document, project_id: projectId, projectId, projectName: store.core.projects.find(project => project.id === projectId)?.name || '' })));
}

export function allSearchRecords(store) {
  const core = store.core, extension = store.extension;
  const records = [];
  const append = (type, rows, title, href, projectKey = 'projectId') => rows.forEach(record => {
    const metadata = type === 'document' ? [record.attachment?.name, record.attachment?.type, ...(Array.isArray(record.revisions) ? record.revisions : []).flatMap(revision => [revision.title, revision.version_label, revision.notes, revision.attachment?.name])] : [];
    records.push({ type, id: record.id, title: String(title(record) || ''), projectId: record[projectKey] || '', href: typeof href === 'function' ? href(record) : href, record, text: [...Object.values(record), ...metadata].filter(value => typeof value === 'string').join(' ') });
  });
  append('project', core.projects, row => row.name, row => `#project/${row.id}`);
  append('task', core.tasks, row => row.title, '#tasks');
  append('member', core.members, row => row.name, '#settings');
  const slugs = ['strategy-growth', 'human-resource', 'external-engagement', 'marketing-comms-it', 'legal-finance', 'consulting'];
  append('division', DIVISIONS.map((name, index) => ({ id: slugs[index], name })), row => row.name, row => `#division/${row.id}`);
  append('document', listAllDocuments(store), row => row.title, '#documents');
  for (const [projectId, extra] of Object.entries(store.extras.byProject)) {
    append('decision', extra.decisions.map(row => ({ ...row, projectId })), row => row.decision, `#project/${projectId}`);
    append('blocker', extra.blockers.map(row => ({ ...row, projectId })), row => row.title, `#project/${projectId}`);
    append('milestone', extra.milestones.map(row => ({ ...row, projectId })), row => row.title, `#project/${projectId}`);
  }
  append('event', core.events, row => row.title, '#schedule');
  append('partner', extension.partners, row => row.title, '#division/external-engagement');
  append('followup', extension.followups, row => row.title, '#division/external-engagement');
  append('delivery', extension.deliveries, row => row.title, '#division/consulting');
  append('legalRequest', extension.legalRequests, row => row.title, '#division/legal-finance');
  append('meetingNotes', extension.meetingNotes, row => row.title, '#schedule');
  const divisionCollections = {
    'strategy-growth': ['initiatives', 'decisions', 'dependencies'],
    'human-resource': ['candidates', 'onboarding', 'assignments', 'development'],
    'legal-finance': ['budgets', 'financeRequests'],
    'marketing-comms-it': ['campaigns', 'deliverables', 'itDeliveries', 'assets']
  };
  for (const [slug, collections] of Object.entries(divisionCollections)) {
    for (const collection of collections) append(`division:${collection}`, store.divisions[collection] || [], row => row.title, `#division/${slug}`);
  }
  return records;
}

export function reminderItems(store, today = iso()) {
  if (!validDate(today)) return [];
  const end = addDays(today, store.extension.preferences.reminderDays ?? 1);
  const tasks = store.core.tasks.filter(task => task.status !== 'done' && validDate(task.end) && task.end <= end).map(task => ({ id: `task:${task.id}:${task.end}`, type: 'task', recordId: task.id, title: task.title, date: task.end, overdue: task.end < today, projectId: task.projectId, href: '#tasks' }));
  const followups = store.extension.followups.filter(row => row.status !== 'done' && validDate(row.dueDate) && row.dueDate <= end).map(row => ({ id: `followup:${row.id}:${row.dueDate}`, type: 'followup', recordId: row.id, title: row.title, date: row.dueDate, overdue: row.dueDate < today, projectId: row.projectId, href: '#division/external-engagement' }));
  return [...new Map([...tasks, ...followups].map(row => [row.id, row])).values()].sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const PREVIEW_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif', 'application/pdf', 'text/plain']);
let databasePromise;
function attachmentDB() {
  if (!globalThis.indexedDB) return Promise.reject(new Error('Local file storage is unavailable in this browser.'));
  if (!databasePromise) databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open('dwdg-experience-files', 1);
    request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains('attachments')) request.result.createObjectStore('attachments', { keyPath: 'id' }); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => { databasePromise = null; reject(new Error('Could not open local file storage.')); };
    request.onblocked = () => { databasePromise = null; reject(new Error('Local file storage is busy in another tab. Close that tab and retry.')); };
  });
  return databasePromise;
}
async function fileTransaction(mode, action) {
  const db = await attachmentDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('attachments', mode), store = transaction.objectStore('attachments');
    let result;
    const request = action(store);
    request.onsuccess = () => { result = request.result; };
    transaction.oncomplete = () => resolve(result);
    transaction.onerror = transaction.onabort = () => reject(new Error('The local file could not be saved or loaded. Storage may be full.'));
  });
}
export async function putAttachment(file) {
  if (!(file instanceof Blob)) throw new Error('Choose a file.');
  if (file.size > MAX_ATTACHMENT_BYTES) throw new Error('Choose a file no larger than 10 MB.');
  if (!file.size) throw new Error('This file is empty.');
  const type = String(file.type || 'application/octet-stream').toLowerCase();
  const metadata = { id: identifier(), name: String(file.name || 'Attachment').replace(/[\\/\u0000-\u001f]/g, '_').slice(0, 240), type, size: file.size, previewable: PREVIEW_TYPES.has(type), createdAt: new Date().toISOString() };
  await fileTransaction('readwrite', store => store.put({ ...metadata, blob: file.slice(0, file.size, type) }));
  return metadata;
}
export async function getAttachment(id) {
  const record = await fileTransaction('readonly', store => store.get(id));
  if (!record?.blob) throw new Error('This attachment is unavailable on this device. The document metadata is still saved.');
  return { ...record, previewable: PREVIEW_TYPES.has(record.type) };
}
export async function removeAttachment(id) { await fileTransaction('readwrite', store => store.delete(id)); }
