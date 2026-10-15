/**
 * Structured project records for the v0.3 workspace.
 * Shared mode uses backend RLS and project-extra methods. Local preview uses only
 * `dwdg-project-extras-v1`; it never reads or writes `dwdg-workspace-v1`.
 * SQL-shaped records make the two modes render identically. No demo records are
 * created in either mode.
 */

const LOCAL_KEY = 'dwdg-project-extras-v1';
const TYPES = ['milestones', 'blockers', 'dependencies', 'decisions', 'documents'];
const LABELS = {milestones: 'Milestones', blockers: 'Blockers', dependencies: 'Dependencies', decisions: 'Decisions', documents: 'Documents'};
const SINGULAR = {milestones: 'milestone', blockers: 'blocker', dependencies: 'dependency', decisions: 'decision', documents: 'document'};
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const FIELDS = {
  milestones: [['title', 'Milestone', 'text', true], ['due_date', 'Target date', 'date'], ['status', 'Status', 'milestoneStatus', true], ['owner_id', 'Owner', 'member'], ['position', 'Order', 'number']],
  blockers: [['title', 'Blocker', 'text', true], ['description', 'What is blocked', 'textarea'], ['severity', 'Severity', 'severity', true], ['owner_id', 'Resolution owner', 'member'], ['task_id', 'Affected task', 'task'], ['milestone_id', 'Affected milestone', 'milestone'], ['requested_action', 'Action needed', 'textarea'], ['target_resolution_date', 'Target resolution', 'date'], ['resolution_note', 'Resolution note', 'textarea'], ['resolved', 'Resolved', 'checkbox']],
  dependencies: [['depends_on_id', 'This project depends on', 'project', true], ['note', 'What is needed from that project', 'textarea']],
  decisions: [['decision', 'Decision', 'textarea', true], ['rationale', 'Reason / context', 'textarea'], ['decided_at', 'Decision date', 'date', true], ['supersedes_id', 'Supersedes decision', 'decision']],
  documents: [['title', 'Document title', 'text', true], ['external_url', 'Document URL', 'url'], ['version_label', 'Version / label', 'text'], ['notes', 'What this document is for', 'textarea'], ['sensitivity', 'Visibility', 'sensitivity', true]],
};
const ALLOWED = {
  milestones: ['id', 'project_id', 'title', 'due_date', 'status', 'owner_id', 'position', 'reached_at'],
  blockers: ['id', 'project_id', 'task_id', 'milestone_id', 'title', 'description', 'severity', 'owner_id', 'opened_by', 'requested_action', 'target_resolution_date', 'resolution_note', 'opened_at', 'resolved_at'],
  dependencies: ['project_id', 'depends_on_id', 'note'],
  decisions: ['id', 'project_id', 'decision', 'rationale', 'decided_at', 'supersedes_id'],
  documents: ['id', 'project_id', 'title', 'notes', 'external_url', 'storage_path', 'version_label', 'sensitivity', 'owner_id'],
};
const emptyExtras = () => Object.fromEntries(TYPES.map(type => [type, []]));
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[ch]));
const uuid = () => globalThis.crypto?.randomUUID?.() || `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
const today = () => {const d = new Date(); return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');};
const utcDate = value => {
  if (!value) return 'No date';
  const day = String(value).slice(0, 10);
  return isDay(day) ? new Intl.DateTimeFormat('en-GB', {day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'}).format(new Date(`${day}T12:00:00Z`)) : 'Invalid date';
};
const isDay = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00Z`)) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
const safeUrl = value => {try {const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : '';} catch {return '';}};
const can = (permission, type, record, project) => typeof permission === 'function' ? Boolean(permission(type, record, project)) : Boolean(permission);
const nameOf = (list, id, fallback) => {const item = list.find(entry => entry.id === id); return item?.name || item?.title || item?.full_name || item?.display_name || fallback;};
const dataClone = value => structuredClone(value);

function validateExtras(data) {
  if (!data || typeof data !== 'object') throw new Error('Project records have an invalid format.');
  const result = emptyExtras();
  for (const type of TYPES) {
    if (!Array.isArray(data[type])) throw new Error(`Project ${type} have an invalid format.`);
    result[type] = data[type];
  }
  return result;
}
function readLocal(projectId) {
  if (!globalThis.localStorage) throw new Error('Browser storage is unavailable for this local preview.');
  const raw = localStorage.getItem(LOCAL_KEY);
  if (!raw) return emptyExtras();
  let store;
  try {store = JSON.parse(raw);} catch {throw new Error('Saved project records could not be read. The original data remains untouched.');}
  if (store?.version !== 1 || !store.byProject || typeof store.byProject !== 'object') throw new Error('Saved project records use an unsupported format. The original data remains untouched.');
  return store.byProject[projectId] ? validateExtras(store.byProject[projectId]) : emptyExtras();
}
function writeLocal(projectId, data) {
  if (!globalThis.localStorage) throw new Error('Browser storage is unavailable; the change was not saved.');
  const raw = localStorage.getItem(LOCAL_KEY);
  let store = {version: 1, byProject: {}};
  if (raw) {
    try {store = JSON.parse(raw);} catch {throw new Error('Saved project records could not be read. Nothing was overwritten.');}
    if (store?.version !== 1 || !store.byProject || typeof store.byProject !== 'object') throw new Error('Saved project records use an unsupported format. Nothing was overwritten.');
  }
  store.byProject[projectId] = validateExtras(data);
  localStorage.setItem(LOCAL_KEY, JSON.stringify(store));
}
const excerpt = (value, max = 110) => String(value || '').length > max ? `${String(value).slice(0, max - 1)}…` : String(value || '');

/**
 * Mount project records. `backend` must expose listProjectExtras(projectId),
 * upsertProjectExtra(type, record), and deleteProjectExtra(type, id). In shared
 * mode, private documents also use uploadDocument(record, file) and
 * getDocumentDownloadUrl(document). An optional
 * `tasks` array enables linking blockers to affected tasks. `onUpdated` receives
 * `{projectId, extras, message}` after a confirmed mutation.
 */
export function mountProjectExtras(container, {project, projects = [], members = [], tasks = [], backend, sharedConfigured = false, canEdit = false, currentUserId = '', onUpdated = () => {}} = {}) {
  if (!(container instanceof Element)) throw new TypeError('A DOM container is required.');
  if (!project?.id) throw new Error('Project extras need a project ID.');
  const projectId = String(project.id);
  let extras = emptyExtras(), active = 'milestones', loading = true, loadError = '', pageError = '', modal = null, saving = false, disposed = false, previousFocus = null;
  const allowedToEdit = (type, record) => can(canEdit, type, record, project);
  const rowName = (type, row) => type === 'dependencies' ? nameOf(projects, row.depends_on_id, 'Linked project') : type === 'decisions' ? row.decision : row.title;
  const opts = (pairs, chosen, blank = '') => `${blank ? `<option value="">${escapeHtml(blank)}</option>` : ''}${pairs.map(([value, label]) => `<option value="${escapeHtml(value)}" ${String(value) === String(chosen ?? '') ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}`;
  const memberOptions = members.map(x => [x.id, x.name || x.full_name || x.display_name || 'Member']);
  const projectOptions = projects.filter(x => x.id !== projectId).map(x => [x.id, `${x.name || x.title || 'Project'} · ${x.division || x.division_code || 'Other division'}`]);
  const choices = (type, fieldName, record) => {
    if (fieldName === 'status') return [['planned', 'Planned'], ['at_risk', 'At risk'], ['reached', 'Reached']];
    if (fieldName === 'severity') return [['low', 'Low'], ['medium', 'Medium'], ['high', 'High']];
    if (fieldName === 'sensitivity') return sharedConfigured ? [['normal', 'Shared with project'], ['hr', 'HR restricted'], ['finance', 'Finance restricted']] : [['normal', 'Shared in this browser preview']];
    if (fieldName === 'owner_id') return memberOptions;
    if (fieldName === 'task_id') return tasks.filter(x => x.projectId === projectId || x.project_id === projectId).map(x => [x.id, x.title]);
    if (fieldName === 'milestone_id') return extras.milestones.map(x => [x.id, x.title]);
    if (fieldName === 'depends_on_id') return projectOptions;
    if (fieldName === 'supersedes_id') return extras.decisions.filter(x => x.id !== record.id).map(x => [x.id, excerpt(x.decision, 55)]);
    return [];
  };
  const isSelect = fieldType => ['milestoneStatus', 'severity', 'sensitivity', 'member', 'task', 'milestone', 'project', 'decision'].includes(fieldType);
  const fieldHtml = (type, [name, label, fieldType, required], record) => {
    const value = name === 'decided_at' ? String(record[name] || today()).slice(0, 10) : record[name] ?? '';
    const id = `px-${name}`;
    const req = required ? 'required' : '';
    let control;
    if (fieldType === 'textarea') control = `<textarea name="${name}" id="${id}" rows="3" maxlength="2000" ${req}>${escapeHtml(value)}</textarea>`;
    else if (fieldType === 'checkbox') control = `<input name="${name}" id="${id}" type="checkbox" value="1" ${record.resolved_at ? 'checked' : ''}>`;
    else if (isSelect(fieldType)) {
      const options = choices(type, name, record);
      const selected = fieldType === 'milestoneStatus' ? record.status : value;
      control = `<select name="${name}" id="${id}" ${req} ${type === 'dependencies' && modal?.existing ? 'disabled' : ''}>${opts(options, selected, required ? 'Choose one' : 'None')}</select>`;
      if (type === 'dependencies' && modal?.existing) control += `<input type="hidden" name="${name}" value="${escapeHtml(value)}">`;
    } else control = `<input name="${name}" id="${id}" type="${fieldType}" value="${escapeHtml(value)}" ${req} ${fieldType === 'number' ? 'min="0" step="1"' : ''} ${fieldType === 'text' ? 'maxlength="160"' : ''}>`;
    return `<div class="px-field ${fieldType === 'textarea' ? 'px-field-wide' : ''} ${fieldType === 'checkbox' ? 'px-field-check' : ''}"><label for="${id}">${escapeHtml(label)}${required ? ' <span aria-hidden="true">*</span>' : ''}</label>${control}</div>`;
  };
  const badge = (text, variant = '') => `<span class="px-badge px-${escapeHtml(variant)}">${escapeHtml(text)}</span>`;
  const empty = (type, message) => `<div class="px-empty"><p>${escapeHtml(message)}</p>${allowedToEdit(type) ? `<button type="button" class="px-button px-primary" data-px="add" data-type="${type}">Add ${SINGULAR[type]}</button>` : ''}</div>`;
  const age = opened => {const n = Math.max(0, Math.floor((Date.now() - new Date(opened || Date.now()).getTime()) / 86400000)); return Number.isFinite(n) ? `${n}d open` : 'Open';};
  const count = type => extras[type].length;
  const summary = () => {
    const reached = extras.milestones.filter(x => x.status === 'reached').length;
    const upcoming = extras.milestones.filter(x => x.status !== 'reached').sort((a, b) => (a.due_date || '9999').localeCompare(b.due_date || '9999'))[0];
    const blockers = extras.blockers.filter(x => !x.resolved_at).length;
    return `<div class="px-summary"><div><span>Next milestone</span><strong>${upcoming ? escapeHtml(upcoming.title) : 'Not set'}</strong>${upcoming?.due_date ? `<small>${utcDate(upcoming.due_date)}</small>` : ''}</div><div><span>Milestones reached</span><strong>${reached} / ${count('milestones')}</strong></div><div><span>Open blockers</span><strong class="${blockers ? 'px-danger-text' : ''}">${blockers}</strong></div></div>`;
  };
  const link = (value, label = 'Open document') => safeUrl(value) ? `<a href="${escapeHtml(safeUrl(value))}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} ↗</a>` : '';
  const actions = (type, record) => allowedToEdit(type, record) ? `<div class="px-actions"><button type="button" class="px-button px-quiet" data-px="edit" data-type="${type}" data-id="${escapeHtml(record.id || record.depends_on_id)}">Edit</button><button type="button" class="px-button px-quiet px-danger" data-px="delete" data-type="${type}" data-id="${escapeHtml(record.id || record.depends_on_id)}">Delete</button></div>` : `<div class="px-actions"><button type="button" class="px-button px-quiet" data-px="view" data-type="${type}" data-id="${escapeHtml(record.id || record.depends_on_id)}">Open</button></div>`;
  const milestoneList = () => extras.milestones.length ? `<ol class="px-milestone-list">${[...extras.milestones].sort((a, b) => (a.position ?? 0) - (b.position ?? 0) || (a.due_date || '9999').localeCompare(b.due_date || '9999')).map((item, index) => `<li><span class="px-milestone-index">${String(index + 1).padStart(2, '0')}</span><div class="px-item-main"><strong>${escapeHtml(item.title)}</strong><small>${item.due_date ? utcDate(item.due_date) : 'No target date'} · ${escapeHtml(nameOf(members, item.owner_id, 'No owner'))}</small></div>${badge(item.status === 'at_risk' ? 'At risk' : item.status === 'reached' ? 'Reached' : 'Planned', item.status)}${actions('milestones', item)}</li>`).join('')}</ol>` : empty('milestones', 'Add a milestone to show the next concrete step and its owner.');
  const blockerList = () => extras.blockers.length ? `<div class="px-list">${[...extras.blockers].sort((a, b) => Number(Boolean(a.resolved_at)) - Number(Boolean(b.resolved_at)) || String(a.target_resolution_date || '').localeCompare(String(b.target_resolution_date || ''))).map(item => `<div class="px-list-row"><div class="px-item-main"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.requested_action || excerpt(item.description) || 'Action not recorded')}${item.target_resolution_date ? ` · Resolve by ${utcDate(item.target_resolution_date)}` : ''} · ${item.resolved_at ? 'Resolved' : age(item.opened_at)}</small></div>${badge(item.resolved_at ? 'Resolved' : `${item.severity || 'medium'} severity`, item.resolved_at ? 'reached' : item.severity)}${actions('blockers', item)}</div>`).join('')}</div>` : empty('blockers', 'No blockers are recorded. Add one when work needs a named resolution owner.');
  const dependencyList = () => extras.dependencies.length ? `<div class="px-list">${extras.dependencies.map(item => {const other = projects.find(x => x.id === item.depends_on_id); return `<div class="px-list-row"><div class="px-item-main"><strong>${escapeHtml(other?.name || other?.title || 'Linked project')}</strong><small>${escapeHtml(other?.division || other?.division_code || 'Other division')} · ${escapeHtml(item.note || 'No handoff detail yet')}</small></div>${actions('dependencies', item)}</div>`;}).join('')}</div>` : empty('dependencies', 'No project dependencies recorded. Link the project whose work must land first.');
  const decisionList = () => extras.decisions.length ? `<div class="px-list">${[...extras.decisions].sort((a, b) => String(b.decided_at).localeCompare(String(a.decided_at))).map(item => `<div class="px-list-row"><div class="px-item-main"><strong>${escapeHtml(item.decision)}</strong><small>${utcDate(item.decided_at)}${item.rationale ? ` · ${escapeHtml(excerpt(item.rationale))}` : ''}</small></div>${actions('decisions', item)}</div>`).join('')}</div>` : empty('decisions', 'Record a decision when its outcome and reasoning need to remain findable.');
  const documentList = () => extras.documents.length ? `<div class="px-list">${extras.documents.map(item => `<div class="px-list-row"><div class="px-item-main"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.version_label || (item.storage_path ? 'Private file' : 'Linked document'))}${item.notes ? ` · ${escapeHtml(excerpt(item.notes))}` : ''}</small>${item.external_url ? link(item.external_url) : item.storage_path ? `<button type="button" class="px-file-link" data-px="file" data-id="${escapeHtml(item.id)}">Open private file ↗</button>` : ''}</div>${item.sensitivity && item.sensitivity !== 'normal' ? badge(`${item.sensitivity} restricted`, 'restricted') : ''}${actions('documents', item)}</div>`).join('')}</div>` : empty('documents', sharedConfigured ? 'Add a link or a private file so the team can find the current version.' : 'Link the working document so the team can find the current version.');
  const listFor = {milestones: milestoneList, blockers: blockerList, dependencies: dependencyList, decisions: decisionList, documents: documentList};
  function renderModal() {
    if (!modal) return '';
    if (modal.delete) return `<div class="px-modal-backdrop"><section class="px-modal" role="dialog" aria-modal="true" aria-labelledby="px-modal-title"><div class="px-modal-head"><h2 id="px-modal-title">Delete ${SINGULAR[modal.type]}?</h2></div><div class="px-modal-body"><p>${escapeHtml(rowName(modal.type, modal.record))}</p><p class="px-muted">This removes the record from this project. You cannot undo it here.</p><div class="px-form-error" role="alert" hidden></div></div><div class="px-modal-actions"><button type="button" class="px-button" data-px="close">Cancel</button><button type="button" class="px-button px-danger-button" data-px="confirm-delete">Delete ${SINGULAR[modal.type]}</button></div></section></div>`;
    if (modal.readonly) {
      const rows = FIELDS[modal.type].filter(([name]) => name !== 'resolved').map(([name, label, fieldType]) => {
        const value = modal.record[name];
        if (value === null || value === undefined || value === '') return '';
        let display = fieldType === 'date' ? utcDate(value) : fieldType === 'member' ? nameOf(members, value, 'Member') : fieldType === 'project' ? nameOf(projects, value, 'Linked project') : fieldType === 'task' ? nameOf(tasks.map(t => ({id: t.id, name: t.title})), value, 'Task') : fieldType === 'milestone' ? nameOf(extras.milestones.map(x => ({id: x.id, name: x.title})), value, 'Milestone') : fieldType === 'decision' ? extras.decisions.find(x => x.id === value)?.decision || 'Earlier decision' : value;
        display = fieldType === 'url' ? link(value, value) : escapeHtml(display);
        return `<div><dt>${escapeHtml(label)}</dt><dd>${display}</dd></div>`;
      }).join('');
      const fileAction = modal.type === 'documents' && modal.record.storage_path ? `<button type="button" class="px-file-link" data-px="file" data-id="${escapeHtml(modal.record.id)}">Open private file ↗</button>` : '';
      return `<div class="px-modal-backdrop"><section class="px-modal" role="dialog" aria-modal="true" aria-labelledby="px-modal-title"><div class="px-modal-head"><h2 id="px-modal-title">${escapeHtml(rowName(modal.type, modal.record))}</h2><button type="button" class="px-button px-quiet" data-px="close" aria-label="Close">×</button></div><div class="px-modal-body"><dl class="px-record-details">${rows}</dl>${fileAction}</div><div class="px-modal-actions"><button type="button" class="px-button px-primary" data-px="close">Close</button></div></section></div>`;
    }
    const uploadChoice = modal.type === 'documents' && sharedConfigured && !modal.existing ? `<div class="px-file-field"><span class="px-or">or upload a private file</span><label for="px-upload-file">Choose file <span class="px-file-limit">up to 10 MB</span></label><input id="px-upload-file" name="upload_file" type="file" aria-describedby="px-upload-help"><small id="px-upload-help">Access is checked before a temporary download link is issued. Choose a URL or a file, not both.</small></div><p class="px-upload-status" role="status" aria-live="polite" hidden></p>` : '';
    const sourceNote = modal.type === 'documents' && modal.record.storage_path ? '<p class="px-form-hint">This is a private uploaded file. Edit its details here; add a new document for a new file version.</p>' : '';
    const fields = FIELDS[modal.type].filter(([name]) => !(modal.type === 'documents' && modal.record.storage_path && name === 'external_url')).map(f => fieldHtml(modal.type, f, modal.record)).join('');
    return `<div class="px-modal-backdrop"><section class="px-modal" role="dialog" aria-modal="true" aria-labelledby="px-modal-title"><form data-px-form><div class="px-modal-head"><h2 id="px-modal-title">${modal.existing ? 'Edit' : 'Add'} ${SINGULAR[modal.type]}</h2><button type="button" class="px-button px-quiet" data-px="close" aria-label="Close">×</button></div><div class="px-modal-body"><div class="px-form-error" role="alert" hidden></div><div class="px-form-grid">${fields}</div>${uploadChoice}${sourceNote}${modal.type === 'documents' && !sharedConfigured ? '<p class="px-form-hint">Local preview links are saved only in this browser; this is not private document storage.</p>' : ''}</div><div class="px-modal-actions"><button type="button" class="px-button" data-px="close">Cancel</button><button type="submit" class="px-button px-primary">Save ${SINGULAR[modal.type]}</button></div></form></section></div>`;
  }
  function render() {
    if (disposed) return;
    if (loading) {container.innerHTML = '<div class="px-root"><div class="px-loading" role="status">Loading project records…</div></div>'; return;}
    if (loadError) {container.innerHTML = `<div class="px-root"><div class="px-alert" role="alert">${escapeHtml(loadError)} <button type="button" class="px-button" data-px="retry">Try again</button></div></div>`; return;}
    const tabs = TYPES.map(type => `<button type="button" role="tab" id="px-tab-${type}" aria-selected="${type === active}" aria-controls="px-panel" tabindex="${type === active ? 0 : -1}" data-px="tab" data-type="${type}">${LABELS[type]} <span>${count(type)}</span></button>`).join('');
    container.innerHTML = `<div class="px-root"><div class="px-head"><div><p class="px-eyebrow">Project record</p><h2>Milestones and context</h2><p>Keep commitments, blockers, decisions, and working files with the project.</p></div></div>${summary()}${pageError ? `<div class="px-alert" role="alert">${escapeHtml(pageError)} <button type="button" class="px-button px-quiet" data-px="dismiss">Dismiss</button></div>` : ''}<div class="px-tabs-scroll"><div class="px-tabs" role="tablist" aria-label="Project records">${tabs}</div></div><section class="px-panel" role="tabpanel" id="px-panel" aria-labelledby="px-tab-${active}"><div class="px-panel-head"><h3>${LABELS[active]}</h3>${allowedToEdit(active) ? `<button type="button" class="px-button px-primary" data-px="add" data-type="${active}">+ Add ${SINGULAR[active]}</button>` : ''}</div>${listFor[active]()}</section>${modal ? renderModal() : ''}</div>`;
    if (modal) container.querySelector('.px-modal input:not([type=hidden]), .px-modal textarea, .px-modal select, .px-modal button')?.focus();
  }
  async function load() {
    loading = true; loadError = ''; render();
    try {
      if (sharedConfigured) {
        if (!backend?.listProjectExtras || !backend?.upsertProjectExtra || !backend?.deleteProjectExtra) throw new Error('Shared project records are unavailable.');
        extras = validateExtras(await backend.listProjectExtras(projectId));
      } else extras = validateExtras(readLocal(projectId));
      if (!disposed) {loading = false; pageError = ''; render();}
    } catch (error) {if (!disposed) {loading = false; loadError = error?.message || 'Project records could not load.'; render();}}
  }
  function findRecord(type, id) {return extras[type].find(row => String(row.id || row.depends_on_id) === String(id));}
  function openForm(type, id, deleting = false, readonly = false) {
    if (!TYPES.includes(type)) return;
    const record = id ? findRecord(type, id) : type === 'dependencies' ? {project_id: projectId, depends_on_id: '', note: ''} : {id: uuid(), project_id: projectId};
    if (!record || (!readonly && !allowedToEdit(type, record))) return;
    previousFocus = document.activeElement;
    modal = {type, existing: Boolean(id), delete: deleting, readonly, record: dataClone(record)};
    render();
  }
  function closeForm() {if (saving) return; modal = null; render(); if (previousFocus?.isConnected) previousFocus.focus();}
  function showFormError(message) {const target = container.querySelector('.px-form-error'); if (target) {target.hidden = false; target.textContent = message; target.setAttribute('tabindex', '-1'); target.focus();}}
  function normalizedRecord(type, form) {
    const values = Object.fromEntries(new FormData(form));
    const item = {...modal.record};
    for (const [name,, fieldType] of FIELDS[type]) {
      if (fieldType === 'checkbox') continue;
      item[name] = fieldType === 'number' ? Number(values[name] || 0) : String(values[name] || '').trim();
    }
    item.project_id = projectId;
    if (type === 'milestones') {
      item.owner_id = item.owner_id || null;
      item.due_date = item.due_date || null;
      item.reached_at = item.status === 'reached' ? item.reached_at || new Date().toISOString() : null;
    }
    if (type === 'blockers') {
      for (const key of ['owner_id', 'task_id', 'milestone_id', 'target_resolution_date']) item[key] = item[key] || null;
      item.opened_by = item.opened_by || currentUserId || undefined;
      item.opened_at = item.opened_at || new Date().toISOString();
      item.resolved_at = values.resolved ? item.resolved_at || new Date().toISOString() : null;
    }
    if (type === 'decisions') {
      item.supersedes_id = item.supersedes_id || null;
      item.decided_at = `${item.decided_at}T12:00:00Z`;
    }
    if (type === 'documents') {
      item.external_url = item.external_url || null;
      item.owner_id = item.owner_id || currentUserId || undefined;
      item.sensitivity = sharedConfigured ? item.sensitivity : 'normal';
    }
    return Object.fromEntries(ALLOWED[type].filter(key => item[key] !== undefined).map(key => [key, item[key]]));
  }
  function recordError(type, item, file) {
    const title = type === 'decisions' ? item.decision : type === 'dependencies' ? item.depends_on_id : item.title;
    if (!String(title || '').trim()) return type === 'dependencies' ? 'Choose a related project.' : 'Enter a title or decision.';
    if (type === 'dependencies') {
      if (item.depends_on_id === projectId) return 'A project cannot depend on itself.';
      if (!projects.some(x => x.id === item.depends_on_id)) return 'Choose a listed project.';
      if (!modal.existing && extras.dependencies.some(x => x.depends_on_id === item.depends_on_id)) return 'That project is already linked.';
    }
    if (type === 'milestones' && item.due_date && !isDay(item.due_date)) return 'Enter a valid target date.';
    if (type === 'blockers') {
      if (item.target_resolution_date && !isDay(item.target_resolution_date)) return 'Enter a valid resolution date.';
      if (item.resolved_at && !item.resolution_note?.trim()) return 'Add a resolution note before marking this blocker resolved.';
    }
    if (type === 'decisions' && !isDay(String(item.decided_at || '').slice(0, 10))) return 'Enter a valid decision date.';
    if (type === 'documents') {
      if (file && (!sharedConfigured || modal.existing)) return 'Files can only be added as new shared documents.';
      if (file && item.external_url) return 'Choose either a document URL or a file.';
      if (file && file.size > MAX_UPLOAD_BYTES) return 'This file is larger than 10 MB. Choose a smaller file.';
      if (!item.external_url && !item.storage_path && !file) return sharedConfigured ? 'Add a document URL or choose a file.' : 'Add a document URL.';
      if (item.external_url && !safeUrl(item.external_url)) return 'Document links must begin with http:// or https://.';
    }
    return '';
  }
  async function saveRecord(form) {
    if (!modal || modal.delete || saving) return;
    const {type} = modal;
    const item = normalizedRecord(type, form);
    const file = type === 'documents' && sharedConfigured && !modal.existing ? form.querySelector('[name="upload_file"]')?.files?.[0] : undefined;
    const error = recordError(type, item, file);
    if (error) {showFormError(error); return;}
    const message = file ? 'Uploaded private document.' : `${modal.existing ? 'Updated' : 'Added'} ${SINGULAR[type]}.`;
    saving = true;
    container.querySelectorAll('.px-modal button').forEach(button => button.disabled = true);
    const uploadStatus = file ? form.querySelector('.px-upload-status') : null;
    if (uploadStatus) {uploadStatus.hidden = false; uploadStatus.textContent = 'Uploading private file…';}
    let refreshWarning = '';
    try {
      if (sharedConfigured) {
        if (file) {
          if (!backend?.uploadDocument) throw new Error('Private file upload is unavailable.');
          const uploaded = await backend.uploadDocument(item, file);
          try {extras = validateExtras(await backend.listProjectExtras(projectId));}
          catch (refreshFailure) {
            if (!uploaded?.id) throw refreshFailure;
            extras = {...extras, documents: [...extras.documents.filter(row => row.id !== uploaded.id), uploaded]};
            refreshWarning = 'File uploaded, but the project list could not refresh. Reopen this project to load the latest records.';
          }
        } else {
          await backend.upsertProjectExtra(type, item);
          extras = validateExtras(await backend.listProjectExtras(projectId));
        }
      } else {
        const next = dataClone(extras);
        const list = next[type];
        const old = list.findIndex(row => String(row.id || row.depends_on_id) === String(item.id || item.depends_on_id));
        if (old < 0) list.push(item); else list[old] = item;
        writeLocal(projectId, next);
        extras = next;
      }
      saving = false; modal = null; pageError = refreshWarning; render();
      try {Promise.resolve(onUpdated({projectId, extras: dataClone(extras), message})).catch(() => {});} catch { /* caller callback does not invalidate a confirmed save */ }
    } catch (failure) {
      saving = false;
      if (uploadStatus) uploadStatus.hidden = true;
      container.querySelectorAll('.px-modal button').forEach(button => button.disabled = false);
      showFormError(failure?.message || 'Could not save this record. Try again.');
    }
  }
  async function removeRecord() {
    if (!modal?.delete || saving) return;
    const {type, record} = modal;
    if (!allowedToEdit(type, record)) return;
    const identifier = type === 'dependencies' ? {project_id: projectId, depends_on_id: record.depends_on_id} : record.id;
    const message = `Deleted ${SINGULAR[type]}.`;
    saving = true;
    container.querySelectorAll('.px-modal button').forEach(button => button.disabled = true);
    try {
      if (sharedConfigured) {
        await backend.deleteProjectExtra(type, identifier);
        extras = validateExtras(await backend.listProjectExtras(projectId));
      } else {
        const next = dataClone(extras);
        next[type] = next[type].filter(row => type === 'dependencies' ? row.depends_on_id !== record.depends_on_id : row.id !== record.id);
        if (type === 'milestones') next.blockers.forEach(blocker => {if (blocker.milestone_id === record.id) blocker.milestone_id = null;});
        if (type === 'decisions') next.decisions.forEach(decision => {if (decision.supersedes_id === record.id) decision.supersedes_id = null;});
        writeLocal(projectId, next);
        extras = next;
      }
      saving = false; modal = null; pageError = ''; render();
      try {Promise.resolve(onUpdated({projectId, extras: dataClone(extras), message})).catch(() => {});} catch { /* confirmed deletion remains valid */ }
    } catch (failure) {
      saving = false;
      container.querySelectorAll('.px-modal button').forEach(button => button.disabled = false);
      showFormError(failure?.message || 'Could not delete this record. Try again.');
    }
  }
  async function openStoredFile(id) {
    const doc = extras.documents.find(x => x.id === id);
    if (!doc?.storage_path || !backend?.getDocumentDownloadUrl) return;
    // Reserve the tab in the original click gesture; browsers often block a
    // window opened only after the signed-URL request completes.
    const popup = window.open('', '_blank');
    if (popup) popup.opener = null;
    try {
      const result = await backend.getDocumentDownloadUrl(doc);
      const url = typeof result === 'string' ? result : result?.signedUrl;
      if (!safeUrl(url)) throw new Error('The file URL is unavailable.');
      if (popup && !popup.closed) popup.location.replace(url);
      else window.location.assign(url);
    } catch (error) {
      if (popup && !popup.closed) popup.close();
      pageError = error?.message || 'Could not open this file.'; render();
    }
  }
  function onClick(event) {
    const button = event.target.closest('[data-px]');
    if (!button || !container.contains(button)) return;
    const action = button.dataset.px;
    if (action === 'tab') {active = button.dataset.type; render(); container.querySelector(`#px-tab-${active}`)?.focus();}
    if (action === 'add') openForm(button.dataset.type);
    if (action === 'edit') openForm(button.dataset.type, button.dataset.id);
    if (action === 'view') openForm(button.dataset.type, button.dataset.id, false, true);
    if (action === 'delete') openForm(button.dataset.type, button.dataset.id, true);
    if (action === 'close') closeForm();
    if (action === 'confirm-delete') removeRecord();
    if (action === 'retry') load();
    if (action === 'dismiss') {pageError = ''; render();}
    if (action === 'file') openStoredFile(button.dataset.id);
  }
  function onSubmit(event) {if (event.target.matches('[data-px-form]') && container.contains(event.target)) {event.preventDefault(); saveRecord(event.target);}}
  function onKey(event) {
    if (!modal && event.target?.matches?.('[role="tab"]') && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const i = TYPES.indexOf(active);
      active = event.key === 'Home' ? TYPES[0] : event.key === 'End' ? TYPES.at(-1) : TYPES[(i + (event.key === 'ArrowRight' ? 1 : -1) + TYPES.length) % TYPES.length];
      render(); container.querySelector(`#px-tab-${active}`)?.focus(); return;
    }
    if (modal && event.key === 'Escape') {event.preventDefault(); closeForm(); return;}
    if (modal && event.key === 'Tab') {
      const controls = [...container.querySelectorAll('.px-modal button:not([disabled]), .px-modal input:not([disabled]), .px-modal select:not([disabled]), .px-modal textarea:not([disabled])')];
      if (!controls.length) return;
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last.focus();}
      if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first.focus();}
    }
  }
  container.addEventListener('click', onClick);
  container.addEventListener('submit', onSubmit);
  container.addEventListener('keydown', onKey);
  load();
  return () => {
    disposed = true;
    container.removeEventListener('click', onClick);
    container.removeEventListener('submit', onSubmit);
    container.removeEventListener('keydown', onKey);
    container.replaceChildren();
  };
}
