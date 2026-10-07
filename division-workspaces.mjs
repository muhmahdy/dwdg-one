/**
 * Contextual division workspaces for the DWDG v0.3 shell.
 *
 * Data contract (version 1): one root with `stages`, one array for each record
 * type listed in COLLECTIONS, and `activity`. `makeDivisionSeed` is deliberately
 * empty; `makeDivisionDemoData` is only for an explicitly selected local preview.
 * All IDs and external member/project references are strings. Dates are ISO days.
 * Financial amounts are integer IDR. The caller owns persistence and authorization:
 * onChange(nextData, message) may reject, return false, or return authoritative data.
 * The editor remains open with its draft if that happens.
 */

export const DIVISION_SLUGS = Object.freeze([
  'strategy-growth', 'legal-finance', 'human-resource', 'marketing-comms-it',
]);

const DIVISIONS = [
  ['strategy-growth', 'Strategy & Growth'],
  ['human-resource', 'Human Resource'],
  ['external-engagement', 'External Engagement'],
  ['marketing-comms-it', 'Marketing, Communication & IT'],
  ['legal-finance', 'Legal & Finance'],
  ['consulting', 'Consulting'],
];
const GROUPS = {
  initiatives: [['proposed', 'Proposed'], ['researching', 'Researching'], ['active', 'Active'], ['paused', 'Paused'], ['completed', 'Completed']],
  financeRequests: [['draft', 'Draft'], ['submitted', 'Submitted'], ['review', 'In review'], ['approved', 'Approved'], ['rejected', 'Rejected'], ['paid', 'Paid']],
  recruitment: [['applied', 'Applied'], ['screening', 'Screening'], ['interview', 'Interview'], ['offer', 'Offer'], ['joined', 'Joined'], ['closed', 'Closed']],
  onboarding: [['not-started', 'Not started'], ['in-progress', 'In progress'], ['waiting', 'Waiting'], ['complete', 'Complete']],
  content: [['idea', 'Idea'], ['producing', 'Producing'], ['review', 'In review'], ['scheduled', 'Scheduled'], ['published', 'Published']],
  itDelivery: [['planned', 'Planned'], ['building', 'Building'], ['review', 'Review'], ['released', 'Released']],
};
const COLLECTIONS = [
  'initiatives', 'decisions', 'dependencies', 'budgets', 'financeRequests',
  'candidates', 'onboarding', 'assignments', 'development', 'campaigns',
  'deliverables', 'itDeliveries', 'assets',
];
const DIVISION = {
  'strategy-growth': {name: 'Strategy & Growth', eyebrow: 'Direction and evidence', summary: 'Sequence initiatives, connect research to decisions, and surface cross-division dependencies.', tabs: [['overview', 'Overview'], ['initiatives', 'Initiatives'], ['decisions', 'Decisions'], ['dependencies', 'Dependencies'], ['workflow', 'Workflow']]},
  'legal-finance': {name: 'Legal & Finance', eyebrow: 'Resources and approvals', summary: 'Review requests, follow the money, and keep legal work traceable.', tabs: [['overview', 'Overview'], ['financeRequests', 'Requests'], ['budgets', 'Budgets'], ['workflow', 'Workflow']]},
  'human-resource': {name: 'Human Resource', eyebrow: 'People and progress', summary: 'Move recruitment and onboarding forward, with assignments and development in context.', tabs: [['overview', 'Overview'], ['candidates', 'Recruitment'], ['onboarding', 'Onboarding'], ['assignments', 'Assignments'], ['development', 'Development'], ['workflow', 'Workflow']]},
  'marketing-comms-it': {name: 'Marketing, Communication & IT', eyebrow: 'Production and delivery', summary: 'See what is being made, reviewed, published, and shipped.', tabs: [['overview', 'Overview'], ['deliverables', 'Content'], ['campaigns', 'Campaigns'], ['itDeliveries', 'IT delivery'], ['assets', 'Assets'], ['workflow', 'Workflow']]},
};
const LABELS = {
  initiatives: ['initiative', 'Initiative', 'Initiatives'], decisions: ['decision', 'Decision', 'Decisions'],
  dependencies: ['dependency', 'Dependency', 'Dependencies'], budgets: ['budget', 'Budget', 'Budgets'],
  financeRequests: ['request', 'Request', 'Requests'], candidates: ['candidate', 'Candidate', 'Recruitment'],
  onboarding: ['onboarding step', 'Onboarding step', 'Onboarding'], assignments: ['assignment', 'Assignment', 'Assignments'],
  development: ['development item', 'Development item', 'Development'], campaigns: ['campaign', 'Campaign', 'Campaigns'],
  deliverables: ['content item', 'Content item', 'Content delivery'], itDeliveries: ['IT delivery', 'IT delivery', 'IT delivery'],
  assets: ['asset', 'Asset', 'Assets'],
};
const GROUP_FOR = {initiatives: 'initiatives', financeRequests: 'financeRequests', candidates: 'recruitment', onboarding: 'onboarding', deliverables: 'content', itDeliveries: 'itDelivery'};
const REQUIRED_STAGES = {
  initiatives: ['completed'], financeRequests: ['draft', 'submitted', 'review', 'approved', 'rejected', 'paid'],
  recruitment: ['joined', 'closed'], onboarding: ['complete'], content: ['published'], itDelivery: ['released'],
};
const HORIZONS = [['now', 'Now'], ['next', 'Next'], ['later', 'Later']];
const PRIORITIES = [['high', 'High'], ['medium', 'Medium'], ['low', 'Low']];
const REQUEST_TYPES = [['budget', 'Budget allocation'], ['expense', 'Expense'], ['legal', 'Legal request']];

const e = value => String(value ?? '').replace(/[&<>"']/g, match => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[match]));
const uid = () => globalThis.crypto?.randomUUID?.() || `dw-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const today = () => new Date().toISOString().slice(0, 10);
const dayOffset = (iso, n) => {const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10);};
const isIsoDay = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T12:00:00Z`).getTime()) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
const formatDate = iso => iso ? new Intl.DateTimeFormat('en-GB', {day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'}).format(new Date(`${iso}T12:00:00Z`)) : 'No date';
const money = amount => new Intl.NumberFormat('id-ID', {style: 'currency', currency: 'IDR', maximumFractionDigits: 0}).format(Number(amount) || 0);
const safeUrl = value => {try {const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : '';} catch {return '';}};
const stageLabel = (data, group, id) => data.stages[group]?.find(x => x.id === id)?.label || id || '—';
const nameOf = (items, id, fallback = 'Unassigned') => items.find(x => x.id === id)?.name || fallback;
const can = (value, ...args) => typeof value === 'function' ? Boolean(value(...args)) : Boolean(value);
const stamp = () => new Date().toISOString();

export function makeDivisionSeed(todayISO = today()) {
  if (!isIsoDay(todayISO)) throw new Error('todayISO must be an ISO date.');
  const stages = Object.fromEntries(Object.entries(GROUPS).map(([key, entries]) => [key, entries.map(([id, label]) => ({id, label}))]));
  return {version: 1, stages, ...Object.fromEntries(COLLECTIONS.map(key => [key, []])), activity: []};
}

export function makeDivisionDemoData(todayISO = today()) {
  const data = makeDivisionSeed(todayISO);
  // Illustrative preview content only. No member or project identity is fabricated.
  data.initiatives = [
    {id: 'demo-initiative-1', title: 'Map the next member experience', horizon: 'now', stageId: 'researching', priority: 'high', ownerId: '', projectId: '', summary: 'Compare the current onboarding journey with member feedback.', researchUrl: '', dueDate: dayOffset(todayISO, 5)},
    {id: 'demo-initiative-2', title: 'Define a partner research brief', horizon: 'next', stageId: 'proposed', priority: 'medium', ownerId: '', projectId: '', summary: 'Agree on the questions before outreach begins.', researchUrl: '', dueDate: dayOffset(todayISO, 15)},
  ];
  data.decisions = [{id: 'demo-decision-1', title: 'Approve the research questions', initiativeId: 'demo-initiative-1', ownerId: '', status: 'pending', outcome: '', dueDate: dayOffset(todayISO, 2)}];
  data.dependencies = [{id: 'demo-dependency-1', title: 'Member feedback summary', fromInitiativeId: 'demo-initiative-1', toDivision: 'human-resource', projectId: '', detail: 'Waiting for anonymized onboarding feedback.', status: 'waiting', dueDate: dayOffset(todayISO, 4)}];
  data.budgets = [{id: 'demo-budget-1', title: 'Program operations', projectId: '', category: 'Operations', allocated: 3500000}];
  data.financeRequests = [
    {id: 'demo-finance-1', title: 'Print workshop materials', type: 'expense', budgetId: 'demo-budget-1', projectId: '', category: 'Materials', amount: 420000, requesterId: '', approverId: '', stageId: 'submitted', documentUrl: '', details: 'Estimated printing costs; receipt to follow.', dueDate: dayOffset(todayISO, 3)},
    {id: 'demo-finance-2', title: 'Review event agreement', type: 'legal', budgetId: '', projectId: '', category: 'Agreement', amount: 0, requesterId: '', approverId: '', stageId: 'review', documentUrl: '', details: 'Check signatory and scope.', dueDate: dayOffset(todayISO, 7)},
  ];
  data.candidates = [{id: 'demo-candidate-1', title: 'Community program applicant', role: 'Program associate', stageId: 'screening', ownerId: '', notes: 'Illustrative record. Replace with actual candidate data.', dueDate: dayOffset(todayISO, 4)}];
  data.onboarding = [{id: 'demo-onboarding-1', title: 'Workspace orientation', memberId: '', stageId: 'in-progress', ownerId: '', dueDate: dayOffset(todayISO, 2), notes: 'Walk through projects, decisions, and document access.'}];
  data.assignments = [{id: 'demo-assignment-1', title: 'Assign onboarding buddy', memberId: '', ownerId: '', projectId: '', dueDate: dayOffset(todayISO, 2), status: 'open', notes: ''}];
  data.development = [{id: 'demo-development-1', title: 'Research facilitation session', memberId: '', ownerId: '', dueDate: dayOffset(todayISO, 14), status: 'planned', notes: ''}];
  data.campaigns = [{id: 'demo-campaign-1', title: 'Member intake announcement', channel: 'Instagram', ownerId: '', startDate: todayISO, endDate: dayOffset(todayISO, 10), summary: 'Coordinate copy and visual assets for the intake window.'}];
  data.deliverables = [
    {id: 'demo-content-1', title: 'Intake carousel', campaignId: 'demo-campaign-1', stageId: 'review', ownerId: '', publishDate: dayOffset(todayISO, 5), channel: 'Instagram', assetUrl: '', publishedUrl: '', notes: 'Copy and visual review.'},
    {id: 'demo-content-2', title: 'FAQ update', campaignId: 'demo-campaign-1', stageId: 'producing', ownerId: '', publishDate: dayOffset(todayISO, 7), channel: 'Website', assetUrl: '', publishedUrl: '', notes: ''},
  ];
  data.itDeliveries = [{id: 'demo-it-1', title: 'Membership form review', projectId: '', stageId: 'building', ownerId: '', dueDate: dayOffset(todayISO, 8), notes: 'Check validation and mobile layout.'}];
  data.assets = [{id: 'demo-asset-1', title: 'Intake visual brief', url: '', kind: 'Design brief', campaignId: 'demo-campaign-1'}];
  return data;
}

export function validateDivisionState(data) {
  const errors = [];
  if (!data || typeof data !== 'object' || Array.isArray(data)) return {ok: false, errors: ['Division state must be an object.']};
  if (data.version !== 1) errors.push('Unsupported division state version.');
  if (!data.stages || typeof data.stages !== 'object') errors.push('Missing workflow stages.');
  for (const group of Object.keys(GROUPS)) {
    const list = data.stages?.[group];
    if (!Array.isArray(list) || !list.length) {errors.push(`${group} needs at least one stage.`); continue;}
    const ids = new Set();
    for (const item of list) {
      if (!item || typeof item.id !== 'string' || !item.id || typeof item.label !== 'string' || !item.label.trim()) errors.push(`${group} has an invalid stage.`);
      if (ids.has(item?.id)) errors.push(`${group} has a duplicate stage ID.`);
      ids.add(item?.id);
    }
  }
  for (const key of COLLECTIONS) {
    const list = data[key];
    if (!Array.isArray(list)) {errors.push(`${key} must be an array.`); continue;}
    const ids = new Set();
    for (const item of list) {
      if (!item || typeof item !== 'object') {errors.push(`${key} contains an invalid record.`); continue;}
      if (typeof item.id !== 'string' || !item.id || typeof item.title !== 'string' || !item.title.trim()) errors.push(`${key} contains an invalid record.`);
      if (ids.has(item?.id)) errors.push(`${key} contains a duplicate ID.`);
      ids.add(item?.id);
      const group = GROUP_FOR[key];
      if (group && !data.stages?.[group]?.some(stage => stage.id === item.stageId)) errors.push(`${key} references an unknown stage.`);
      if (['budgets', 'financeRequests'].includes(key)) {
        const value = key === 'budgets' ? item.allocated : item.amount;
        if (!Number.isSafeInteger(value) || value < 0) errors.push(`${key} amounts must be non-negative integer IDR.`);
      }
      for (const dateKey of ['dueDate', 'publishDate', 'startDate', 'endDate']) if (item?.[dateKey] && !isIsoDay(item[dateKey])) errors.push(`${key} contains an invalid ${dateKey}.`);
      if (key === 'financeRequests' && item?.type !== 'legal' && (!item?.budgetId || !data.budgets?.some(budget => budget.id === item.budgetId))) errors.push('A financial request needs an existing budget line.');
    }
  }
  if (!Array.isArray(data.activity)) errors.push('activity must be an array.');
  return {ok: errors.length === 0, errors};
}

const FIELDS = {
  initiatives: [
    ['title', 'Initiative', 'text', true], ['horizon', 'Time horizon', 'horizon', true], ['stageId', 'Stage', 'stage', true], ['priority', 'Priority', 'priority'],
    ['ownerId', 'Owner', 'member'], ['projectId', 'Linked project', 'project'], ['dueDate', 'Next milestone date', 'date'], ['researchUrl', 'Research link', 'url'], ['summary', 'Purpose / evidence', 'textarea'],
  ],
  decisions: [['title', 'Decision needed', 'text', true], ['initiativeId', 'Initiative', 'initiative'], ['ownerId', 'Decision owner', 'member'], ['dueDate', 'Needed by', 'date'], ['status', 'Status', 'decisionStatus'], ['outcome', 'Outcome / rationale', 'textarea']],
  dependencies: [['title', 'Dependency', 'text', true], ['fromInitiativeId', 'Initiative', 'initiative'], ['toDivision', 'Waiting on division', 'division', true], ['projectId', 'Related project', 'project'], ['dueDate', 'Needed by', 'date'], ['status', 'Status', 'dependencyStatus'], ['detail', 'What is needed', 'textarea']],
  budgets: [['title', 'Budget line', 'text', true], ['projectId', 'Project', 'project'], ['category', 'Category', 'text'], ['allocated', 'Allocated IDR', 'amount', true]],
  financeRequests: [['title', 'Request', 'text', true], ['type', 'Request type', 'requestType', true], ['stageId', 'Stage', 'stage', true], ['budgetId', 'Budget line', 'budget'], ['projectId', 'Project', 'project'], ['amount', 'Amount IDR', 'amount'], ['category', 'Category', 'text'], ['requesterId', 'Requester', 'member'], ['approverId', 'Approver', 'member'], ['dueDate', 'Needed by', 'date'], ['documentUrl', 'Document / receipt link', 'url'], ['details', 'Details', 'textarea']],
  candidates: [['title', 'Candidate name / label', 'text', true], ['role', 'Role', 'text'], ['stageId', 'Recruitment stage', 'stage', true], ['ownerId', 'HR owner', 'member'], ['dueDate', 'Next step due', 'date'], ['notes', 'Private notes', 'textarea']],
  onboarding: [['title', 'Onboarding step', 'text', true], ['memberId', 'Member', 'member'], ['stageId', 'Stage', 'stage', true], ['ownerId', 'Owner', 'member'], ['dueDate', 'Due date', 'date'], ['notes', 'Instructions', 'textarea']],
  assignments: [['title', 'Assignment', 'text', true], ['memberId', 'Member', 'member'], ['ownerId', 'Coordinator', 'member'], ['projectId', 'Project', 'project'], ['status', 'Status', 'assignmentStatus'], ['dueDate', 'Due date', 'date'], ['notes', 'Notes', 'textarea']],
  development: [['title', 'Development item', 'text', true], ['memberId', 'Member', 'member'], ['ownerId', 'Owner', 'member'], ['status', 'Status', 'developmentStatus'], ['dueDate', 'Target date', 'date'], ['notes', 'Notes', 'textarea']],
  campaigns: [['title', 'Campaign', 'text', true], ['channel', 'Primary channel', 'text'], ['ownerId', 'Owner', 'member'], ['startDate', 'Start date', 'date'], ['endDate', 'Target date', 'date'], ['summary', 'Brief', 'textarea']],
  deliverables: [['title', 'Content item', 'text', true], ['campaignId', 'Campaign', 'campaign'], ['stageId', 'Delivery stage', 'stage', true], ['channel', 'Channel', 'text'], ['ownerId', 'Owner', 'member'], ['publishDate', 'Publish date', 'date'], ['assetUrl', 'Asset link', 'url'], ['publishedUrl', 'Published URL', 'url'], ['notes', 'Handoff notes', 'textarea']],
  itDeliveries: [['title', 'IT delivery', 'text', true], ['projectId', 'Project', 'project'], ['stageId', 'Delivery stage', 'stage', true], ['ownerId', 'Owner', 'member'], ['dueDate', 'Target date', 'date'], ['notes', 'Scope / handoff', 'textarea']],
  assets: [['title', 'Asset', 'text', true], ['kind', 'Type', 'text'], ['campaignId', 'Campaign', 'campaign'], ['url', 'Asset URL', 'url'], ['notes', 'Notes', 'textarea']],
};

const ENTITY_DIVISION = {initiatives: 'strategy-growth', decisions: 'strategy-growth', dependencies: 'strategy-growth', budgets: 'legal-finance', financeRequests: 'legal-finance', candidates: 'human-resource', onboarding: 'human-resource', assignments: 'human-resource', development: 'human-resource', campaigns: 'marketing-comms-it', deliverables: 'marketing-comms-it', itDeliveries: 'marketing-comms-it', assets: 'marketing-comms-it'};
const DEFAULTS = {initiatives: {horizon: 'now', priority: 'medium'}, decisions: {status: 'pending'}, dependencies: {status: 'waiting'}, financeRequests: {type: 'expense', amount: 0}, budgets: {allocated: 0}, assignments: {status: 'open'}, development: {status: 'planned'}};

function budgetBalance(data, budgetId) {
  const base = data.budgets.find(x => x.id === budgetId);
  if (!base) return {allocated: 0, committed: 0, paid: 0, remaining: 0};
  const linked = data.financeRequests.filter(x => x.budgetId === budgetId);
  const allocated = base.allocated + linked.filter(x => x.type === 'budget' && ['approved', 'paid'].includes(x.stageId)).reduce((sum, x) => sum + x.amount, 0);
  const committed = linked.filter(x => x.type === 'expense' && x.stageId === 'approved').reduce((sum, x) => sum + x.amount, 0);
  const paid = linked.filter(x => x.type === 'expense' && x.stageId === 'paid').reduce((sum, x) => sum + x.amount, 0);
  return {allocated, committed, paid, remaining: allocated - committed - paid};
}

/** Mount one division. Caller can remount with server data after a remote update. */
export function mountDivisionWorkspace(container, {slug, data, members = [], projects = [], onChange = async () => undefined, canEdit = false, canManageStages = canEdit, canSubmitFinanceRequest = false, canApprove = false, canViewSensitive, currentUserId = '', onModalClose = () => {}} = {}) {
  if (!(container instanceof Element)) throw new TypeError('A DOM container is required.');
  if (!DIVISION[slug]) throw new Error(`Unsupported division workspace: ${slug}`);
  let state = data ? structuredClone(data) : makeDivisionSeed();
  let validation = validateDivisionState(state);
  let tab = 'overview', query = '', stageFilter = 'all', modal = null, saving = false, disposed = false, pageError = '';
  let lastFocus = null;
  const division = DIVISION[slug];
  const editable = (entity, record) => {
    if (entity === 'workflow') return can(canManageStages, slug);
    const requesterAccess = entity === 'financeRequests' && canSubmitFinanceRequest && (!record || record.requesterId === currentUserId);
    return (can(canEdit, slug, entity, record) || requesterAccess) && !(entity === 'financeRequests' && record && ['approved', 'rejected', 'paid'].includes(record.stageId));
  };
  const sensitive = () => canViewSensitive === undefined ? (editable('financeRequests') || can(canApprove, slug)) : can(canViewSensitive, slug);
  const visible = entity => entity === 'financeRequests' ? (sensitive() || canSubmitFinanceRequest) : !(['budgets', 'candidates'].includes(entity) && !sensitive());
  const approveAllowed = record => Boolean(currentUserId) && record.requesterId !== currentUserId && can(canApprove, slug, record);
  const collection = entity => state[entity] || [];
  const rec = (entity, id) => collection(entity).find(x => x.id === id);
  const opts = (items, selected, placeholder = '') => `${placeholder ? `<option value="">${e(placeholder)}</option>` : ''}${items.map(([id, label]) => `<option value="${e(id)}" ${String(id) === String(selected) ? 'selected' : ''}>${e(label)}</option>`).join('')}`;
  const choices = (type, entity) => {
    if (type === 'horizon') return HORIZONS;
    if (type === 'priority') return PRIORITIES;
    if (type === 'stage') return state.stages[GROUP_FOR[entity]].map(x => [x.id, x.label]);
    if (type === 'member') return members.map(x => [x.id, x.name]);
    if (type === 'project') return projects.map(x => [x.id, x.name]);
    if (type === 'initiative') return state.initiatives.map(x => [x.id, x.title]);
    if (type === 'budget') return state.budgets.map(x => [x.id, x.title]);
    if (type === 'campaign') return state.campaigns.map(x => [x.id, x.title]);
    if (type === 'division') return DIVISIONS;
    if (type === 'requestType') return REQUEST_TYPES;
    if (type === 'decisionStatus') return [['pending', 'Needs decision'], ['recorded', 'Recorded']];
    if (type === 'dependencyStatus') return [['waiting', 'Waiting'], ['resolved', 'Resolved'], ['blocked', 'Blocked']];
    if (type === 'assignmentStatus') return [['open', 'Open'], ['active', 'Active'], ['complete', 'Complete']];
    if (type === 'developmentStatus') return [['planned', 'Planned'], ['active', 'Active'], ['complete', 'Complete']];
    return [];
  };
  const field = (entity, [key, label, type, required], record) => {
    const value = record[key] ?? '';
    const id = `dw-field-${key}`;
    const req = required ? 'required' : '';
    const full = type === 'textarea' ? ' dw-field-wide' : '';
    let control;
    if (type === 'textarea') control = `<textarea id="${id}" name="${key}" rows="3" maxlength="2000">${e(value)}</textarea>`;
    else if (entity === 'financeRequests' && !sensitive() && (key === 'requesterId' || key === 'approverId')) {
      control = `<input type="hidden" name="${e(key)}" value="${e(key === 'requesterId' ? currentUserId : value)}"><span class="dw-field-static">${e(key === 'requesterId' ? memberName(currentUserId) : 'Assigned by Legal & Finance')}</span>`;
    }
    else if (['stage', 'member', 'project', 'initiative', 'budget', 'campaign', 'division', 'horizon', 'priority', 'requestType', 'decisionStatus', 'assignmentStatus', 'developmentStatus'].includes(type)) {
      let available = choices(type, entity);
      if (type === 'stage' && entity === 'financeRequests') available = available.filter(([stageId]) => !['approved', 'rejected', 'paid'].includes(stageId) || stageId === value);
      control = `<select id="${id}" name="${key}" ${req}>${opts(available, value, required ? 'Choose one' : 'None')}</select>`;
    }
    else control = `<input id="${id}" name="${key}" type="${type === 'amount' ? 'number' : type}" value="${e(value)}" ${req} ${type === 'amount' ? 'min="0" step="1" inputmode="numeric"' : ''} ${type === 'text' ? 'maxlength="140"' : ''}>`;
    return `<div class="dw-field${full}"><label for="${id}">${e(label)}${required ? ' <span aria-hidden="true">*</span>' : ''}</label>${control}</div>`;
  };
  const status = (label, id = '') => `<span class="dw-status dw-status-${e(id)}"><span aria-hidden="true" class="dw-status-mark"></span>${e(label)}</span>`;
  const stage = (entity, record) => GROUP_FOR[entity] ? status(stageLabel(state, GROUP_FOR[entity], record.stageId), record.stageId) : status(record.status === 'pending' ? 'Needs decision' : record.status || '', record.status);
  const empty = (text, entity) => `<div class="dw-empty"><p>${e(text)}</p>${entity && editable(entity) ? `<button class="dw-button dw-button-primary" type="button" data-dw="add" data-entity="${entity}">Add ${e(LABELS[entity][0])}</button>` : ''}</div>`;
  const action = (entity, label) => editable(entity) ? `<button class="dw-button dw-button-primary" type="button" data-dw="add" data-entity="${entity}">+ ${e(label || `New ${LABELS[entity][0]}`)}</button>` : '';
  const section = (title, body, actionHtml = '', cls = '') => `<section class="dw-section ${cls}"><div class="dw-section-head"><h2>${e(title)}</h2>${actionHtml}</div>${body}</section>`;
  const link = (url, label = 'Open link') => safeUrl(url) ? `<a href="${e(safeUrl(url))}" target="_blank" rel="noopener noreferrer">${e(label)} <span aria-hidden="true">↗</span></a>` : '';
  const projectName = id => nameOf(projects, id, 'No linked project');
  const memberName = id => nameOf(members, id);
  const filtered = entity => collection(entity).filter(x => {
    if (entity === 'financeRequests' && !sensitive() && x.requesterId !== currentUserId) return false;
    const match = !query || Object.values(x).some(v => typeof v === 'string' && v.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
    return match && (stageFilter === 'all' || x.stageId === stageFilter);
  });
  const row = (entity, item, detail, end = '') => `<div class="dw-row"><div class="dw-row-main"><strong>${e(item.title)}</strong><p>${detail}</p></div><div class="dw-row-end">${end}<button class="dw-button dw-button-quiet" type="button" data-dw="${editable(entity, item) ? 'edit' : 'view'}" data-entity="${entity}" data-id="${e(item.id)}" aria-label="${editable(entity, item) ? 'Edit' : 'View'} ${e(item.title)}">${editable(entity, item) ? 'Edit' : 'Open'}</button></div></div>`;
  const recent = () => state.activity.filter(x => x.division === slug).slice(0, 5).map(x => `<li><span>${e(x.action)}</span><small>${e(formatDate(x.at?.slice(0, 10)))}</small></li>`).join('');
  const activitySection = () => section('Recent movement', recent() ? `<ol class="dw-activity">${recent()}</ol>` : empty('No changes recorded yet. Activity appears after work is saved.'), '', 'dw-secondary');

  function strategyOverview() {
    const needs = state.decisions.filter(x => x.status === 'pending').concat(state.dependencies.filter(x => x.status !== 'resolved')).slice(0, 4);
    const priorityBody = needs.length ? needs.map(x => row(x.initiativeId !== undefined ? 'decisions' : 'dependencies', x, e(x.initiativeId ? nameOf(state.initiatives.map(i => ({id: i.id, name: i.title})), x.initiativeId, 'General decision') : nameOf(DIVISIONS.map(([id, name]) => ({id, name})), x.toDivision, 'Cross-division work')), status(x.status === 'pending' ? 'Needs decision' : x.status, x.status))).join('') : empty('No decisions or dependencies currently need follow-up.', 'decisions');
    const horizon = HORIZONS.map(([id, label]) => {
      const items = state.initiatives.filter(x => x.horizon === id && x.stageId !== 'completed');
      return `<div class="dw-horizon-col"><div class="dw-horizon-title"><span>${label}</span><small>${items.length}</small></div>${items.length ? items.map(x => `<article class="dw-horizon-item"><div class="dw-horizon-item-top">${status(stageLabel(state, 'initiatives', x.stageId), x.stageId)}${x.dueDate ? `<small>${formatDate(x.dueDate)}</small>` : ''}</div><h3>${e(x.title)}</h3><p>${e(x.summary || 'No research summary yet.')}</p><div class="dw-horizon-foot"><span>${e(memberName(x.ownerId))}</span>${editable('initiatives', x) ? `<button type="button" data-dw="edit" data-entity="initiatives" data-id="${e(x.id)}">Edit</button>` : ''}</div></article>`).join('') : '<p class="dw-column-empty">No initiatives here.</p>'}</div>`;
    }).join('');
    const deps = state.dependencies.slice(0, 4).map(x => row('dependencies', x, `${e(nameOf(DIVISIONS.map(([id, name]) => ({id, name})), x.toDivision, 'Other division'))} · ${e(x.detail || 'No handoff detail')}`, status(x.status, x.status))).join('');
    const decisions = state.decisions.slice(0, 4).map(x => row('decisions', x, `${e(x.outcome || 'Outcome not recorded yet')}${x.dueDate ? ` · ${formatDate(x.dueDate)}` : ''}`, stage('decisions', x))).join('');
    return section('Current priorities', priorityBody, action('decisions', 'New decision')) + section('Initiative horizon', `<p class="dw-section-intro">A sequencing view: what moves now, what needs preparation, and what can wait.</p><div class="dw-horizon">${horizon}</div>`, action('initiatives', 'New initiative'), 'dw-primary-view') + `<div class="dw-secondary-grid">${section('Cross-division dependencies', deps || empty('No dependencies recorded.', 'dependencies'), '', 'dw-secondary')}${section('Decisions', decisions || empty('No decisions recorded.', 'decisions'), '', 'dw-secondary')}</div>` + activitySection();
  }

  function legalOverview() {
    if (!sensitive()) {
      if (!canSubmitFinanceRequest) return section('Current priorities', empty('Financial and legal detail is restricted. Request access from the division lead.'), '', 'dw-denied');
      const ownRequests = state.financeRequests.filter(x => x.requesterId === currentUserId);
      return section('My requests', ownRequests.map(financeRow).join('') || empty('No requests submitted yet.', 'financeRequests'), action('financeRequests', 'New request')) + section('Division information', empty('Budget balances and other people’s requests are restricted to Legal & Finance. Your own requests remain visible here.'), '', 'dw-denied');
    }
    const pending = state.financeRequests.filter(x => !['draft', 'approved', 'rejected', 'paid'].includes(x.stageId)).sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || '')).slice(0, 5);
    const queue = pending.map(x => financeRow(x)).join('') || empty('No requests await review.', 'financeRequests');
    const bars = state.budgets.map(b => {const v = budgetBalance(state, b.id), total = Math.max(v.allocated, 1); return `<div class="dw-ledger-line"><div class="dw-ledger-head"><strong>${e(b.title)}</strong><span>${money(v.remaining)} remaining</span></div><div class="dw-ledger-bar" role="img" aria-label="${e(b.title)}: ${money(v.allocated)} allocated, ${money(v.committed)} committed, ${money(v.paid)} paid, ${money(v.remaining)} remaining"><span class="dw-ledger-paid" style="width:${Math.min(100, v.paid / total * 100)}%"></span><span class="dw-ledger-committed" style="width:${Math.min(100, v.committed / total * 100)}%"></span></div><p>${money(v.allocated)} allocated · ${money(v.committed)} committed · ${money(v.paid)} paid</p></div>`;}).join('');
    const legal = state.financeRequests.filter(x => x.type === 'legal').slice(0, 4).map(financeRow).join('');
    return section('Awaiting action', queue, action('financeRequests', 'New request')) + section('Budget flow', bars ? `<div class="dw-ledger-legend"><span>● Paid</span><span>● Committed</span><span>○ Available</span></div>${bars}` : empty('Add a budget line to start tracking allocation and spending.', 'budgets'), action('budgets', 'Add budget line'), 'dw-primary-view') + section('Legal requests and documents', legal || empty('No legal requests yet.', 'financeRequests'), '', 'dw-secondary') + activitySection();
  }
  function financeRow(x) {
    const detail = `${e(REQUEST_TYPES.find(([id]) => id === x.type)?.[1] || x.type)}${x.amount ? ` · ${money(x.amount)}` : ''}${x.dueDate ? ` · ${formatDate(x.dueDate)}` : ''}`;
    const controls = approveAllowed(x) && !['draft', 'approved', 'rejected', 'paid'].includes(x.stageId) ? `<button class="dw-button dw-button-quiet" type="button" data-dw="approve" data-id="${e(x.id)}">Approve</button><button class="dw-button dw-button-quiet" type="button" data-dw="reject" data-id="${e(x.id)}">Reject</button>` : approveAllowed(x) && x.type === 'expense' && x.stageId === 'approved' ? `<button class="dw-button dw-button-quiet" type="button" data-dw="paid" data-id="${e(x.id)}">Mark paid</button>` : '';
    return row('financeRequests', x, `${detail}${x.documentUrl ? ` · ${link(x.documentUrl, 'Document')}` : ''}`, `${status(stageLabel(state, 'financeRequests', x.stageId), x.stageId)}${controls}`);
  }
  function hrOverview() {
    if (!sensitive()) return section('Current priorities', empty('Member and candidate records are restricted. Shared projects remain available from the global workspace.'), '', 'dw-denied');
    const urgent = [...state.onboarding.filter(x => x.stageId !== 'complete'), ...state.candidates.filter(x => !['joined', 'closed'].includes(x.stageId))].sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999')).slice(0, 5);
    const queue = urgent.map(x => row(x.memberId !== undefined ? 'onboarding' : 'candidates', x, `${x.memberId !== undefined ? e(memberName(x.memberId)) : e(x.role || 'Candidate')}${x.dueDate ? ` · ${formatDate(x.dueDate)}` : ''}`, stage(x.memberId !== undefined ? 'onboarding' : 'candidates', x))).join('');
    const journey = state.stages.recruitment.map(s => {const items = state.candidates.filter(x => x.stageId === s.id); return `<div class="dw-journey-step"><span class="dw-journey-count">${items.length}</span><strong>${e(s.label)}</strong><small>${items.length ? `${items.length} candidate${items.length === 1 ? '' : 's'}` : 'No candidates'}</small></div>`;}).join('');
    const onboarding = state.onboarding.slice(0, 4).map(x => row('onboarding', x, `${e(memberName(x.memberId))}${x.dueDate ? ` · ${formatDate(x.dueDate)}` : ''}`, stage('onboarding', x))).join('');
    const assignment = state.assignments.slice(0, 4).map(x => row('assignments', x, `${e(memberName(x.memberId))} · ${e(projectName(x.projectId))}`, status(x.status, x.status))).join('');
    return section('Current people actions', queue || empty('No recruitment or onboarding step needs action.', 'onboarding'), action('onboarding', 'New onboarding step')) + section('Recruitment journey', `<p class="dw-section-intro">Counts reflect recorded candidates, without a fabricated funnel or conversion rate.</p><div class="dw-journey">${journey}</div>`, action('candidates', 'Add candidate'), 'dw-primary-view') + `<div class="dw-secondary-grid">${section('Onboarding', onboarding || empty('No onboarding steps yet.', 'onboarding'), '', 'dw-secondary')}${section('Assignments', assignment || empty('No member assignments yet.', 'assignments'), '', 'dw-secondary')}</div>` + activitySection();
  }
  function mcitOverview() {
    const urgent = [...state.deliverables.filter(x => x.stageId !== 'published'), ...state.itDeliveries.filter(x => x.stageId !== 'released')].sort((a, b) => (a.publishDate || a.dueDate || '9999').localeCompare(b.publishDate || b.dueDate || '9999')).slice(0, 5);
    const queue = urgent.map(x => row(x.publishDate !== undefined ? 'deliverables' : 'itDeliveries', x, `${e(x.channel || (x.projectId ? projectName(x.projectId) : 'IT delivery'))} · ${formatDate(x.publishDate || x.dueDate)}`, stage(x.publishDate !== undefined ? 'deliverables' : 'itDeliveries', x))).join('');
    const pipeline = state.stages.content.map(s => {const items = state.deliverables.filter(x => x.stageId === s.id); return `<div class="dw-pipeline-col"><div class="dw-pipeline-head"><span>${e(s.label)}</span><small>${items.length}</small></div>${items.length ? items.map(x => `<article class="dw-pipeline-item"><strong>${e(x.title)}</strong><p>${e(x.channel || 'Channel not set')}${x.publishDate ? ` · ${formatDate(x.publishDate)}` : ''}</p>${editable('deliverables', x) ? `<button type="button" data-dw="edit" data-entity="deliverables" data-id="${e(x.id)}">Open item</button>` : ''}</article>`).join('') : '<p class="dw-column-empty">Empty</p>'}</div>`;}).join('');
    const it = state.itDeliveries.slice(0, 4).map(x => row('itDeliveries', x, `${e(projectName(x.projectId))}${x.dueDate ? ` · ${formatDate(x.dueDate)}` : ''}`, stage('itDeliveries', x))).join('');
    const assets = state.assets.slice(0, 4).map(x => row('assets', x, `${e(x.kind || 'Asset')}${x.url ? ` · ${link(x.url, 'Open')}` : ''}`)).join('');
    return section('Upcoming delivery', queue || empty('No content or IT delivery is in progress.', 'deliverables'), action('deliverables', 'New content item')) + section('Content pipeline', `<p class="dw-section-intro">Each item moves through the review and publishing stages defined by this division.</p><div class="dw-pipeline">${pipeline}</div>`, '', 'dw-primary-view') + `<div class="dw-secondary-grid">${section('IT delivery', it || empty('No IT delivery recorded.', 'itDeliveries'), action('itDeliveries', 'New IT delivery'), 'dw-secondary')}${section('Assets', assets || empty('No linked assets yet.', 'assets'), action('assets', 'Add asset'), 'dw-secondary')}</div>` + activitySection();
  }
  function listView(entity) {
    if (!visible(entity)) return section(LABELS[entity][2], empty('These records are restricted. Ask the division lead for access.'), '', 'dw-denied');
    const group = GROUP_FOR[entity];
    const header = `<div class="dw-list-tools"><label class="dw-search-label" for="dw-search">Search ${e(LABELS[entity][2].toLowerCase())}</label><input id="dw-search" type="search" value="${e(query)}" placeholder="Search records" autocomplete="off">${group ? `<label class="dw-filter-label" for="dw-stage-filter">Stage</label><select id="dw-stage-filter"><option value="all">All stages</option>${opts(state.stages[group].map(x => [x.id, x.label]), stageFilter)}</select>` : ''}</div>`;
    const rows = filtered(entity).map(x => {
      let detail = '';
      if (entity === 'budgets') {const b = budgetBalance(state, x.id); detail = `${money(b.allocated)} allocated · ${money(b.remaining)} remaining`;
      } else if (entity === 'financeRequests') return financeRow(x);
      else if (entity === 'initiatives') detail = `${e(HORIZONS.find(([id]) => id === x.horizon)?.[1] || '')} · ${e(memberName(x.ownerId))} · ${formatDate(x.dueDate)}`;
      else if (entity === 'candidates') detail = `${e(x.role || 'Role not set')} · ${e(memberName(x.ownerId))}`;
      else if (entity === 'deliverables') detail = `${e(x.channel || 'Channel not set')} · ${formatDate(x.publishDate)}${x.publishedUrl ? ` · ${link(x.publishedUrl, 'Published')}` : ''}`;
      else if (entity === 'assets') detail = `${e(x.kind || 'Asset')}${x.url ? ` · ${link(x.url)}` : ''}`;
      else if (entity === 'decisions') detail = `${e(x.outcome || 'No outcome yet')} · ${formatDate(x.dueDate)}`;
      else if (entity === 'dependencies') detail = `${e(nameOf(DIVISIONS.map(([id, name]) => ({id, name})), x.toDivision, 'Other division'))} · ${e(x.detail || 'No handoff detail')}`;
      else if (entity === 'campaigns') detail = `${e(x.channel || 'Channel not set')} · ${formatDate(x.startDate)}–${formatDate(x.endDate)}`;
      else detail = `${e(memberName(x.memberId || x.ownerId))} · ${formatDate(x.dueDate)}`;
      return row(entity, x, detail, group ? stage(entity, x) : x.status ? status(x.status, x.status) : '');
    }).join('');
    return section(LABELS[entity][2], header + (rows || empty(query || stageFilter !== 'all' ? 'No records match these filters.' : `No ${LABELS[entity][2].toLowerCase()} yet.`, entity)), action(entity));
  }
  function workflowView() {
    const groups = slug === 'strategy-growth' ? ['initiatives'] : slug === 'legal-finance' ? ['financeRequests'] : slug === 'human-resource' ? ['recruitment', 'onboarding'] : ['content', 'itDelivery'];
    return section('Workflow stages', `<p class="dw-section-intro">These are starter stages. Division heads can rename, reorder, or add stages to match how the work actually moves.</p>${groups.map(group => `<div class="dw-workflow-group"><div class="dw-workflow-head"><h3>${e(group === 'itDelivery' ? 'IT delivery' : group === 'financeRequests' ? 'Requests' : group[0].toUpperCase() + group.slice(1))}</h3>${editable('workflow') ? `<button class="dw-button dw-button-quiet" type="button" data-dw="stage-add" data-group="${group}">Add stage</button>` : ''}</div><ol>${state.stages[group].map((s, i) => `<li><span>${i + 1}</span><strong>${e(s.label)}</strong>${editable('workflow') ? `<div class="dw-stage-actions"><button type="button" data-dw="stage-move" data-group="${group}" data-id="${e(s.id)}" data-dir="-1" aria-label="Move ${e(s.label)} up" ${i === 0 ? 'disabled' : ''}>↑</button><button type="button" data-dw="stage-move" data-group="${group}" data-id="${e(s.id)}" data-dir="1" aria-label="Move ${e(s.label)} down" ${i === state.stages[group].length - 1 ? 'disabled' : ''}>↓</button><button type="button" data-dw="stage-edit" data-group="${group}" data-id="${e(s.id)}">Rename</button><button type="button" data-dw="stage-remove" data-group="${group}" data-id="${e(s.id)}" aria-label="Remove ${e(s.label)}" ${state.stages[group].length < 2 ? 'disabled' : ''}>Remove</button></div>` : ''}</li>`).join('')}</ol></div>`).join('')}`);
  }
  function render() {
    if (disposed) return;
    validation = validateDivisionState(state);
    if (!validation.ok) {container.innerHTML = `<div class="dw-root"><div class="dw-notice dw-notice-error" role="alert">Division data cannot be shown: ${e(validation.errors[0])}</div></div>`; return;}
    const tabs = division.tabs.map(([id, label]) => `<button type="button" role="tab" id="dw-tab-${id}" aria-selected="${tab === id}" aria-controls="dw-panel" tabindex="${tab === id ? 0 : -1}" data-dw="tab" data-tab="${id}">${e(label)}</button>`).join('');
    const body = tab === 'overview' ? ({'strategy-growth': strategyOverview, 'legal-finance': legalOverview, 'human-resource': hrOverview, 'marketing-comms-it': mcitOverview}[slug])() : tab === 'workflow' ? workflowView() : listView(tab);
    container.innerHTML = `<div class="dw-root dw-${slug}">${pageError ? `<div class="dw-page-error dw-notice dw-notice-error" role="alert">${e(pageError)}</div>` : ''}<header class="dw-page-head"><div><p class="dw-eyebrow">${e(division.eyebrow)}</p><h1>${e(division.name)}</h1><p class="dw-lede">${e(division.summary)}</p></div></header><div class="dw-tabs-scroll"><div class="dw-tabs" role="tablist" aria-label="${e(division.name)} views">${tabs}</div></div><div class="dw-panel" role="tabpanel" id="dw-panel" aria-labelledby="dw-tab-${e(tab)}">${body}</div>${modal ? renderModal() : ''}</div>`;
    if (modal) {const focus = container.querySelector(modal.stage ? '#dw-stage-label' : modal.readonly ? '.dw-modal [data-dw="close"]' : '[data-dw-form] input:not([type=hidden]), [data-dw-form] select'); focus?.focus();}
  }
  function renderModal() {
    if (modal.stage) return `<div class="dw-modal-backdrop" data-dw-backdrop><section class="dw-modal" role="dialog" aria-modal="true" aria-labelledby="dw-modal-title"><form data-dw-stage-form><div class="dw-modal-head"><h2 id="dw-modal-title">${modal.id ? 'Rename stage' : 'Add stage'}</h2><button class="dw-button dw-button-quiet" type="button" data-dw="close" aria-label="Close">×</button></div><div class="dw-modal-body"><div class="dw-form-error" role="alert" hidden></div><div class="dw-field"><label for="dw-stage-label">Stage name</label><input id="dw-stage-label" name="label" type="text" maxlength="50" value="${e(modal.label || '')}" required></div></div><div class="dw-modal-actions"><button class="dw-button dw-button-quiet" type="button" data-dw="close">Cancel</button><button class="dw-button dw-button-primary" type="submit">Save stage</button></div></form></section></div>`;
    const record = modal.record;
    if (modal.readonly) {
      const values = FIELDS[modal.entity].map(([key, label, type]) => {
        const value = record[key];
        if (value === '' || value === null || value === undefined) return '';
        let shown = type === 'stage' ? stageLabel(state, GROUP_FOR[modal.entity], value) : type === 'member' ? memberName(value) : type === 'project' ? projectName(value) : type === 'amount' ? money(value) : type === 'date' ? formatDate(value) : type === 'url' ? link(value, value) : type === 'horizon' ? HORIZONS.find(([id]) => id === value)?.[1] : type === 'division' ? DIVISIONS.find(([id]) => id === value)?.[1] : type === 'campaign' ? state.campaigns.find(x => x.id === value)?.title : type === 'initiative' ? state.initiatives.find(x => x.id === value)?.title : type === 'budget' ? state.budgets.find(x => x.id === value)?.title : value;
        if (type !== 'url') shown = e(shown || value);
        return `<div><dt>${e(label)}</dt><dd>${shown}</dd></div>`;
      }).join('');
      return `<div class="dw-modal-backdrop" data-dw-backdrop><section class="dw-modal" role="dialog" aria-modal="true" aria-labelledby="dw-modal-title"><div class="dw-modal-head"><h2 id="dw-modal-title">${e(record.title)}</h2><button class="dw-button dw-button-quiet" type="button" data-dw="close" aria-label="Close">×</button></div><div class="dw-modal-body"><dl class="dw-record-details">${values}</dl></div><div class="dw-modal-actions"><button class="dw-button dw-button-primary" type="button" data-dw="close">Close</button></div></section></div>`;
    }
    return `<div class="dw-modal-backdrop" data-dw-backdrop><section class="dw-modal" role="dialog" aria-modal="true" aria-labelledby="dw-modal-title"><form data-dw-form data-entity="${e(modal.entity)}"><div class="dw-modal-head"><h2 id="dw-modal-title">${modal.existing ? 'Edit' : 'New'} ${e(LABELS[modal.entity][0])}</h2><button class="dw-button dw-button-quiet" type="button" data-dw="close" aria-label="Close">×</button></div><div class="dw-modal-body"><div class="dw-form-error" role="alert" hidden></div><div class="dw-form-grid">${FIELDS[modal.entity].map(f => field(modal.entity, f, record)).join('')}</div>${modal.confirmDelete ? `<div class="dw-delete-confirm" role="alert"><p>Delete this ${e(LABELS[modal.entity][0])}? This action cannot be undone here.</p><button type="button" class="dw-button dw-button-danger" data-dw="delete-confirm">Delete permanently</button><button type="button" class="dw-button dw-button-quiet" data-dw="delete-cancel">Keep it</button></div>` : ''}</div><div class="dw-modal-actions">${modal.existing ? `<button class="dw-button dw-button-danger" type="button" data-dw="delete-ask">Delete</button>` : ''}<button class="dw-button dw-button-quiet" type="button" data-dw="close">Cancel</button><button class="dw-button dw-button-primary" type="submit">Save ${e(LABELS[modal.entity][0])}</button></div></form></section></div>`;
  }
  function showError(message) {const el = container.querySelector('.dw-form-error'); if (el) {el.hidden = false; el.textContent = message; el.focus();}}
  function defaults(entity) {const group = GROUP_FOR[entity]; return {id: uid(), title: '', ...DEFAULTS[entity], ...(group ? {stageId: state.stages[group][0].id} : {}), ...(entity === 'financeRequests' ? {requesterId: currentUserId} : {})};}
  function openForm(entity, id, readonly = false) {
    if (!COLLECTIONS.includes(entity) || !visible(entity)) return;
    const record = id ? rec(entity, id) : defaults(entity);
    if (!record || (!readonly && !editable(entity, record))) return;
    lastFocus = document.activeElement;
    modal = {entity, existing: Boolean(id), readonly, record: {...record}};
    render();
  }
  function closeForm() {if (saving) return; modal = null; render(); if (lastFocus?.isConnected) lastFocus.focus(); onModalClose();}
  function domainError(entity, record) {
    if (!record.title?.trim()) return 'Enter a title.';
    if (entity === 'initiatives' && !HORIZONS.some(([id]) => id === record.horizon)) return 'Choose a time horizon.';
    if (entity === 'campaigns' && record.startDate && record.endDate && record.endDate < record.startDate) return 'Target date must be on or after the start date.';
    if (entity === 'financeRequests') {
      if (record.type !== 'legal' && !record.budgetId) return 'Choose a budget line for this request.';
      if (record.type !== 'legal' && record.amount <= 0) return 'Enter an amount greater than zero.';
      if (record.type === 'expense' && ['approved', 'paid'].includes(record.stageId)) {
        const rest = state.financeRequests.filter(x => x.id !== record.id);
        const balance = budgetBalance({...state, financeRequests: rest}, record.budgetId);
        if (record.amount > balance.remaining) return 'This expense exceeds the remaining budget.';
      }
      if (modal?.existing && record.requesterId !== rec(entity, record.id)?.requesterId) return 'The requester cannot be changed after creation.';
    }
    if (entity === 'budgets') {
      const rest = state.budgets.filter(x => x.id !== record.id);
      const old = state.budgets.find(x => x.id === record.id);
      if (old && record.allocated < old.allocated) {
        const used = budgetBalance(state, record.id);
        if (record.allocated < used.committed + used.paid) return 'Allocation cannot be below committed and paid spending.';
      }
      if (rest.some(x => x.title.toLowerCase() === record.title.toLowerCase())) return 'A budget line with this name already exists.';
    }
    for (const [key,, type] of FIELDS[entity]) if (type === 'url' && record[key] && !safeUrl(record[key])) return 'Links must begin with http:// or https://.';
    return '';
  }
  async function commit(next, message, after) {
    if (saving) return;
    saving = true;
    container.querySelectorAll('.dw-modal button').forEach(button => button.disabled = true);
    try {
      const check = validateDivisionState(next);
      if (!check.ok) throw new Error(check.errors[0]);
      const result = await onChange(next, message);
      if (result === false) throw new Error('Change was not saved. Check your connection and try again.');
      const authoritative = result && typeof result === 'object' && result.version === 1 ? result : next;
      const confirmed = validateDivisionState(authoritative);
      if (!confirmed.ok) throw new Error(`Saved data is invalid: ${confirmed.errors[0]}`);
      state = structuredClone(authoritative);
      pageError = '';
      modal = null;
      saving = false;
      render();
      onModalClose();
      after?.();
    } catch (error) {
      saving = false;
      container.querySelectorAll('.dw-modal button').forEach(button => button.disabled = false);
      if (modal) showError(error?.message || 'Change was not saved. Try again.');
      else {pageError = error?.message || 'Change was not saved. Try again.'; render();}
    }
  }
  function withActivity(next, entity, id, message) {
    next.activity = [{id: uid(), division: slug, entityType: entity, entityId: id, action: message, at: stamp()}, ...next.activity].slice(0, 100);
    return next;
  }
  async function submitForm(form) {
    if (!modal || modal.stage) return;
    const entity = modal.entity;
    const values = Object.fromEntries(new FormData(form));
    const item = {...modal.record};
    for (const [key,, type] of FIELDS[entity]) item[key] = type === 'amount' ? Number(values[key] || 0) : String(values[key] || '').trim();
    if (entity === 'financeRequests') {
      if (!modal.existing && currentUserId) item.requesterId = currentUserId;
      const previous = modal.existing ? rec(entity, item.id) : null;
      if (['approved', 'rejected', 'paid'].includes(item.stageId) && item.stageId !== previous?.stageId) {
        showError('Use the approval actions to approve, reject, or mark a request paid.');
        return;
      }
    }
    item.updatedAt = stamp();
    const error = domainError(entity, item);
    if (error) {showError(error); return;}
    const next = structuredClone(state);
    const index = next[entity].findIndex(x => x.id === item.id);
    if (index < 0) next[entity].unshift(item); else next[entity][index] = item;
    const message = `${modal.existing ? 'Updated' : 'Created'} ${LABELS[entity][0]}: ${item.title}`;
    await commit(withActivity(next, entity, item.id, message), message, () => lastFocus?.isConnected && lastFocus.focus());
  }
  async function submitStage(form) {
    if (!modal?.stage) return;
    const label = String(new FormData(form).get('label') || '').trim();
    if (!label) {showError('Enter a stage name.'); return;}
    const next = structuredClone(state), list = next.stages[modal.group];
    if (list.some(x => x.label.toLowerCase() === label.toLowerCase() && x.id !== modal.id)) {showError('This stage name already exists.'); return;}
    if (modal.id) list.find(x => x.id === modal.id).label = label;
    else list.push({id: uid(), label});
    const message = `${modal.id ? 'Renamed' : 'Added'} ${modal.group} stage: ${label}`;
    await commit(withActivity(next, 'workflow', modal.id || '', message), message);
  }
  async function deleteRecord() {
    if (!modal || !modal.existing || !editable(modal.entity, modal.record)) return;
    const {entity, record} = modal;
    const referenced = entity === 'budgets' ? state.financeRequests.some(x => x.budgetId === record.id) : entity === 'initiatives' ? state.decisions.some(x => x.initiativeId === record.id) || state.dependencies.some(x => x.fromInitiativeId === record.id) : entity === 'campaigns' ? state.deliverables.some(x => x.campaignId === record.id) || state.assets.some(x => x.campaignId === record.id) : false;
    if (referenced) {showError('This record is linked to other work. Remove those links first.'); return;}
    const next = structuredClone(state);
    next[entity] = next[entity].filter(x => x.id !== record.id);
    const message = `Deleted ${LABELS[entity][0]}: ${record.title}`;
    await commit(withActivity(next, entity, record.id, message), message);
  }
  async function transitionRequest(id, to) {
    const current = rec('financeRequests', id);
    if (!current || !approveAllowed(current)) return;
    const allowed = (['approved', 'rejected'].includes(to) && !['draft', 'approved', 'rejected', 'paid'].includes(current.stageId)) || (to === 'paid' && current.type === 'expense' && current.stageId === 'approved');
    if (!allowed) return;
    const changed = {...current, stageId: to, approverId: currentUserId, updatedAt: stamp()};
    const error = domainError('financeRequests', changed);
    if (error) {pageError = error; render(); return;}
    const next = structuredClone(state);
    next.financeRequests[next.financeRequests.findIndex(x => x.id === id)] = changed;
    const message = `${to === 'paid' ? 'Marked paid' : to === 'approved' ? 'Approved' : 'Rejected'} request: ${current.title}`;
    await commit(withActivity(next, 'financeRequests', id, message), message);
  }
  async function moveStage(group, id, direction) {
    if (!editable('workflow')) return;
    const next = structuredClone(state), list = next.stages[group], i = list.findIndex(x => x.id === id), j = i + direction;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    await commit(withActivity(next, 'workflow', id, `Reordered ${group} stages`), `Reordered ${group} stages`);
  }
  async function removeStage(group, id) {
    if (!editable('workflow')) return;
    if (REQUIRED_STAGES[group]?.includes(id)) {pageError = 'This stage is used by a built-in workflow. Rename or reorder it instead.'; render(); return;}
    const usedBy = Object.entries(GROUP_FOR).find(([entity, g]) => g === group && state[entity].some(x => x.stageId === id));
    if (usedBy || state.stages[group].length < 2) {pageError = usedBy ? 'Move records to another stage before removing this one.' : 'Keep at least one stage.'; render(); return;}
    const next = structuredClone(state);
    next.stages[group] = next.stages[group].filter(x => x.id !== id);
    await commit(withActivity(next, 'workflow', id, `Removed ${group} stage`), `Removed ${group} stage`);
  }
  function onClick(event) {
    const button = event.target.closest('[data-dw]');
    if (!button || !container.contains(button)) return;
    const action = button.dataset.dw;
    if (action === 'tab') {tab = button.dataset.tab; query = ''; stageFilter = 'all'; render(); container.querySelector(`#dw-tab-${CSS.escape(tab)}`)?.focus();}
    if (action === 'add') openForm(button.dataset.entity);
    if (action === 'edit') openForm(button.dataset.entity, button.dataset.id);
    if (action === 'view') openForm(button.dataset.entity, button.dataset.id, true);
    if (action === 'close') closeForm();
    if (action === 'delete-ask' && modal) {modal.confirmDelete = true; const box = container.querySelector('.dw-delete-confirm'); if (box) {box.hidden = false; box.scrollIntoView({block: 'nearest'});} else render();}
    if (action === 'delete-cancel' && modal) {modal.confirmDelete = false; render();}
    if (action === 'delete-confirm') deleteRecord();
    if (['approve', 'reject', 'paid'].includes(action)) transitionRequest(button.dataset.id, action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'paid');
    if (action === 'stage-add' || action === 'stage-edit') {if (!editable('workflow')) return; const group = button.dataset.group, id = button.dataset.id; modal = {stage: true, group, id, label: id ? state.stages[group].find(x => x.id === id)?.label : ''}; lastFocus = document.activeElement; render();}
    if (action === 'stage-move') moveStage(button.dataset.group, button.dataset.id, Number(button.dataset.dir));
    if (action === 'stage-remove') removeStage(button.dataset.group, button.dataset.id);
  }
  function onSubmit(event) {if (!container.contains(event.target)) return; if (event.target.matches('[data-dw-form]')) {event.preventDefault(); submitForm(event.target);} if (event.target.matches('[data-dw-stage-form]')) {event.preventDefault(); submitStage(event.target);}}
  function onInput(event) {
    if (event.target.id === 'dw-search') {query = event.target.value; const position = event.target.selectionStart; render(); const input = container.querySelector('#dw-search'); input?.focus(); try {input?.setSelectionRange(position, position);} catch {}}
    if (event.target.id === 'dw-stage-filter') {stageFilter = event.target.value; render(); container.querySelector('#dw-stage-filter')?.focus();}
  }
  function onKey(event) {
    if (!modal && event.target?.matches?.('[role="tab"]') && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const tabs = division.tabs.map(([id]) => id), index = tabs.indexOf(tab);
      tab = event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs.at(-1) : tabs[(index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      query = ''; stageFilter = 'all'; render(); container.querySelector(`#dw-tab-${CSS.escape(tab)}`)?.focus(); return;
    }
    if (event.key === 'Escape' && modal) {event.preventDefault(); closeForm(); return;}
    if (event.key === 'Tab' && modal) {
      const focusables = [...container.querySelectorAll('.dw-modal button:not([disabled]), .dw-modal input:not([disabled]), .dw-modal select:not([disabled]), .dw-modal textarea:not([disabled])')];
      if (!focusables.length) return;
      const first = focusables[0], last = focusables.at(-1);
      if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last.focus();}
      else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first.focus();}
    }
  }
  container.addEventListener('click', onClick);
  container.addEventListener('submit', onSubmit);
  container.addEventListener('input', onInput);
  container.addEventListener('change', onInput);
  container.addEventListener('keydown', onKey);
  // Page errors persist until the next successful interaction, not an alert() interruption.
  render();
  return () => {
    disposed = true;
    container.removeEventListener('click', onClick);
    container.removeEventListener('submit', onSubmit);
    container.removeEventListener('input', onInput);
    container.removeEventListener('change', onInput);
    container.removeEventListener('keydown', onKey);
    container.replaceChildren();
  };
}

export {budgetBalance};
