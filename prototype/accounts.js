// UXA · Account lifecycle and authority (UI sprint, owned by this session only). Registers PAGES / CAPS / INSP / ACT entries; see .planning/workstreams/SPRINT.md.
// Invite and approval (access_invitation, flow-admin-invite, flow-invite-accept, security_auth D2), first sign-in and profile (flow-accept-landing,
// onboarding-first-view), appointments (access_appointments, S006), HR transfer (flow-membership-transfer, hr_roster_change, S007), isolation
// (access_isolation_rank, flow-membership-revoke, S008), presidency handover and Admin recovery (access_presidency_transfer, S004, S005), leaving and
// alumni (security_offboarding). Source: IAM/EXTRACT, DATA_OWNERSHIP_AUTHORITY.md §3-6, blueprint §2. Policy POL has not settled is built as the plan
// proposes it and listed as open in UX3/HANDOFF.md. Demo data only, kept in this browser (D8). Indonesian strings are at the end of this file.
(() => {
'use strict';

// ---------- who may do what (access_action_matrix, DATA_OWNERSHIP_AUTHORITY §4) ----------
const isAdmin = p => !!p && !!p.admin;
const isPres = p => !!p && p.role === 'president';
const isVP = p => !!p && p.role === 'vp';
const isBoard = p => !!p && p.role === 'board';
const baseRank = p => ((ROLES[p.role] || {}).rank) || 0;
// Roster reviewer: Admin or an HR Director/Co-Director (flow-invite-review, hr_roster_change owner HR/Admin). Which HR people hold it is proposed.
const hrLead = p => !!p && p.div === 'hr' && baseRank(p) >= 2;
const reviewer = p => isAdmin(p) || hrLead(p);
const allDivs = () => DIVS.map(d => d.id);
// Current structure: one VP over all six divisions (blueprint §1-2). The D28 three-VP chart stays a draft until a term handover activates it.
const reportDivs = p => isAdmin(p) || isPres(p) || isVP(p) ? allDivs() : p && p.role === 'director' ? [p.div] : [];
const wideView = p => isAdmin(p) || isPres(p) || isVP(p) || hrLead(p);
const canMembers = p => !!p && !isBoard(p) && (wideView(p) || p.role === 'director');
const inView = (m, p) => wideView(m) || (!!p.div && p.div === m.div);
const canInvView = p => !!p && !isBoard(p) && (reviewer(p) || isPres(p) || isVP(p));
const canApptView = p => canMembers(p);
const openHo = () => acct().handovers.find(h => h.state === 'nominated' || h.state === 'accepted');
const canHoView = p => !!p && !isBoard(p) && (isAdmin(p) || isPres(p) || isVP(p) || (openHo() || {}).to === p.id);
const canAudit = p => isAdmin(p) || isPres(p);
const authority = p => p.admin ? L('the Admin grant') : L(ROLES[p.role].label);

// One check per action, returning the reason when it is refused (S008: the target's highest effective authority counts, so a Director or VP can
// never pause Mahdy through his SnG title; access_isolation_rank). Equal rank is open; the proposed baseline is strictly lower rank in scope.
function can(kind, m, p) {
  const no = why => ({ok: false, why});
  if (!m || !p) return no(L('Not available.'));
  if (isBoard(m)) return no(L('Board accounts are read-only.'));
  if (p.id === m.id) return no(L('You can’t do this to your own account.'));
  if (kind === 'transfer') {
    if (!reviewer(m)) return no(L('HR leads and the Admin move members between divisions.'));
    if (p.status !== 'active') return no(L('Only active members can be moved.'));
    if (p.admin || baseRank(p) >= 2 || !p.div) return no(L('{who} holds a role. Role holders change through an appointment, not a transfer.', {who: p.first}));
    return {ok: true};
  }
  if (kind === 'pause' || kind === 'restore') {
    if (kind === 'pause' && p.status !== 'active') return no(L('Only active accounts can be paused.'));
    if (kind === 'restore' && p.status !== 'suspended') return no(L('This account is not paused.'));
    if (rank(m) < 3) return no(L('Directors and above pause or restore access.'));
    if (rank(p) > rank(m)) return no(L('{who} holds {role}, which is above you. Nobody can pause someone with higher authority.', {who: p.first, role: authority(p)}));
    if (rank(p) === rank(m)) return no(L('Same rank. Whether equals can pause each other is not decided yet, so the President or the Admin does this.'));
    if (!isAdmin(m) && !isPres(m) && !(p.div && reportDivs(m).includes(p.div))) return no(L('{who} is outside your reporting scope. The President or the Admin can do this.', {who: p.first}));
    return {ok: true};
  }
  if (kind === 'leave') {
    if (!reviewer(m)) return no(L('HR leads and the Admin end memberships.'));
    if (!['active', 'suspended'].includes(p.status)) return no(L('This membership has already ended.'));
    if (isPres(p)) return no(L('The President leaves office through a presidency handover first.'));
    if (p.admin) return no(L('The Admin grant needs an agreed successor first. That rule is not decided yet.'));
    if (!isAdmin(m) && rank(p) >= rank(m)) return no(L('{who} holds {role}. You can only end memberships below your own rank.', {who: p.first, role: authority(p)}));
    return {ok: true};
  }
  return no(L('Not available.'));
}

// ---------- data (db.acct, created lazily; people, tasks and offers are reused by ID) ----------
const mailOf = p => p.email || `${p.name.toLowerCase().replace(/[^a-z ]/g, '').trim().replace(/\s+/g, '.')}@students.uii.ac.id`;
function seedAcct() {
  const H = (at, by, verb, note = '') => ({at, by, verb, note});
  const I = (id, name, email, dv, by, at, expires, x = {}) => ({id, name, email, div: dv, role: 'member', batch: '2026', expires, state: x.state || 'pending', person: x.person || null, delivery: x.delivery || null,
    createdBy: by, createdAt: at, acceptedAt: x.acceptedAt || null, acceptedAs: x.acceptedAt ? email : null, approvedBy: null, approvedAt: null, revokedBy: x.revokedBy || null, revokedAt: x.revokedAt || null, reason: x.reason || '', version: 1, history: x.history || [H(at, by, 'created the invitation')]});
  const invites = [
    I('inv-sekar', 'Sekar Ayu', 'sekar.ayu@students.uii.ac.id', 'sng', 'kirana', '2026-10-01T10:00', '2026-10-15', {state: 'accepted', person: 'sekar', acceptedAt: '2026-10-05T19:20', delivery: {by: 'kirana', at: '2026-10-01T10:02'},
      history: [H('2026-10-05T19:20', 'sekar', 'accepted the invitation'), H('2026-10-01T10:02', 'kirana', 'copied the invitation link'), H('2026-10-01T10:00', 'kirana', 'created the invitation')]}),
    I('inv-rina', 'Rina Oktaviani', 'rina.oktaviani@students.uii.ac.id', 'ee', 'kirana', '2026-10-04T09:00', '2026-10-18', {delivery: {by: 'kirana', at: '2026-10-04T09:03'},
      history: [H('2026-10-04T09:03', 'kirana', 'copied the invitation link'), H('2026-10-04T09:00', 'kirana', 'created the invitation')]}),
    I('inv-tomi', 'Tomi Wijaya', 'tomi.wijaya@students.uii.ac.id', 'mcit', 'mahdy', '2026-09-20T14:00', '2026-10-04', {delivery: {by: 'mahdy', at: '2026-09-20T14:05'},
      history: [H('2026-09-20T14:05', 'mahdy', 'copied the invitation link'), H('2026-09-20T14:00', 'mahdy', 'created the invitation')]}),
    I('inv-wulan', 'Wulan Sari', 'wulan.sari@student.uii.ac.id', 'hr', 'kirana', '2026-10-02T11:00', '2026-10-16', {state: 'revoked', revokedBy: 'kirana', revokedAt: '2026-10-02T11:20', reason: 'Wrong email address typed',
      history: [H('2026-10-02T11:20', 'kirana', 'revoked the invitation', 'Wrong email address typed'), H('2026-10-02T11:00', 'kirana', 'created the invitation')]}),
  ];
  const ppl = db.people.filter(p => p.status === 'active' && !isBoard(p));
  // Role grants recorded at setup have no known actor, so they show "Recorded at setup" instead of an invented appointer (D14).
  const grants = [...ppl.filter(p => ['president', 'vp', 'director', 'codirector'].includes(p.role)).map(p => ({id: 'g-' + p.id, person: p.id, role: p.role, unit: p.div || null, title: p.title || '', from: p.joined || null, to: null, by: null, at: null, reason: '', predecessor: null, state: 'active'})),
    ...ppl.filter(p => p.admin).map(p => ({id: 'g-admin-' + p.id, person: p.id, role: 'admin', unit: null, title: '', from: p.joined || null, to: null, by: null, at: null, reason: '', predecessor: null, state: 'active'}))];
  const memberships = ppl.filter(p => p.div).map(p => ({id: 'ms-' + p.id, person: p.id, div: p.div, from: p.joined || null, to: null, by: null}));
  const log = invites.flatMap(i => i.history.map((h, n) => ({id: `al-${i.id}-${n}`, at: h.at, actor: h.by, person: i.person, name: i.name, verb: h.verb, reason: h.note || '', ref: `invites/${i.id}`})));
  return {v: 1, invites, grants, memberships, actions: [], handovers: [], log, office: {version: 1}, hidden: [{id: 'it-ops', label: 'IT operations account'}]};
}
function acct() { if (!db.acct || db.acct.v !== 1) { db.acct = seedAcct(); save(); } return db.acct; }
const invOf = id => acct().invites.find(i => i.id === id);
const invState = i => i.state === 'pending' && i.expires < today() ? 'expired' : i.state;
const admins = () => db.people.filter(p => p.admin && p.status === 'active');
const president = () => db.people.find(p => p.role === 'president' && p.status !== 'left' && p.status !== 'alumni');
// Restricted administration audit (DATA_OWNERSHIP_AUTHORITY §8, security_audit): actor, target, action, reason. Reasons only reach Admin, President,
// the actor and HR leads; everyone else sees that a reason exists.
function alog(verb, p, extra = {}) { acct().log.unshift({id: uid('al'), at: nowStamp(), actor: session.me, person: p ? p.id : null, name: p ? p.name : (extra.name || ''), verb, reason: '', ...extra}); }
const canReason = (m, e) => isAdmin(m) || isPres(m) || hrLead(m) || (e && e.actor === m.id);
const upd = (to, type, h, title) => { if (!to || to === session.me) return; db.updates.unshift({id: uid('n'), to, type, actor: session.me, ref: {type: 'link', id: h, h, title}, at: nowStamp(), read: false}); };
const memberLink = p => ({type: 'link', id: p.id, name: p.name, h: `members/${p.id}`});

// ---------- small view helpers ----------
const F = () => ui.acctF || (ui.acctF = {});
const fk = k => { if (ui.acctFk !== k) { ui.acctFk = k; ui.acctF = {}; } return F(); };
const chip = (def, pill = 'pill-o') => state(L(def[0]), def[1], def[2], pill);
const note = (kind, ic, title, body = '', acts = '') => `<div class="notice n-${kind}"><i class="n-ic" style="--m:${maskUrl(A.ui[ic] || A.ui.info)}"></i><div><b>${title}</b>${body ? `<p>${body}</p>` : ''}</div>${acts ? `<div class="acts">${acts}</div>` : ''}</div>`;
const sec = (title, n) => `<h2 class="sec-h">${title}${n != null ? ` <span class="n">${n}</span>` : ''}</h2>`;
const head = (title, sub, right = '') => `<div class="ph"><div><h1 class="t-title">${title}</h1>${sub ? `<p class="sub">${sub}</p>` : ''}</div>${right ? `<div class="ph-r">${right}</div>` : ''}</div>`;
const fmtD = s => s ? `${dShort(s)} ${D(s).getFullYear()}` : '';
const byAt = (id, at) => id && at ? `<span class="acct-by">${av(id, 'av-xs')}<span>${esc(stamp(id, at))}</span></span>` : `<span class="t-mute">${L('Recorded at setup')}</span>`;
const meta = rows => `<dl class="meta acct-meta">${rows.filter(Boolean).map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
const avName = (name, cls = '') => `<span class="av ${cls}" role="img" aria-label="${esc(name)}">${esc(name.split(' ').map(w => w[0]).slice(0, 2).join(''))}</span>`;
const fld = (id, label, ctl, help = '', opt = false) => `<div class="field"><label for="${id}">${label}${opt ? ` <span class="opt">${L('Optional')}</span>` : ''}</label>${ctl}<span class="help">${help}</span></div>`;
const inp = (id, key, ph = '', type = 'text') => `<input class="input" type="${type}" id="${id}" data-acct="${key}" value="${esc(F()[key] || '')}" placeholder="${esc(ph)}" autocomplete="off">`;
const area = (id, key, ph = '') => `<textarea class="textarea" id="${id}" data-acct="${key}" placeholder="${esc(ph)}">${esc(F()[key] || '')}</textarea>`;
const sel = (id, key, opts, rerender = false, cls = '') => `<select class="input ${cls}" id="${id}" data-acct="${key}" ${rerender ? 'data-rerender="1"' : ''}>${opts.map(([v, l, dis]) => `<option value="${esc(v)}" ${String(F()[key] ?? '') === String(v) ? 'selected' : ''} ${dis ? 'disabled' : ''}>${esc(l)}</option>`).join('')}</select>`;
const divName = id => id ? div(id).name : L('Presidency');
const crumbOf = (...parts) => parts.map((x, i) => i === parts.length - 1 ? `<b>${x}</b>` : x).join('<i>/</i>');
const wordsTo = s => s ? s : `<span class="t-mute">${L('Not recorded')}</span>`;

// Account states (hr_roster_change, access_revocation). Every state is an icon plus a word.
const ACC_ST = {active: ['Active', 'check', 'green'], pending: ['Waiting for approval', 'clock', 'warn'], suspended: ['Access paused', 'lock', 'danger'], left: ['Left DWDG', 'logout', 'mute'], alumni: ['Alumni', 'archive', 'ink2'], declined: ['Not approved', 'close', 'mute']};
const accChip = p => chip(ACC_ST[p.status] || ['Unknown', 'circle', 'mute']);
// Invitation states: pending, accepted, active, expired, revoked (access_invitation); "declined" is the Admin not approving (D2).
const INV_ST = {pending: ['Not accepted yet', 'clock', 'ink2'], accepted: ['Accepted, waiting for approval', 'clock', 'warn'], active: ['Member is active', 'check', 'green'], expired: ['Expired', 'circle', 'mute'], revoked: ['Revoked', 'close', 'mute'], declined: ['Not approved', 'close', 'danger']};
const GRANT_ST = {active: ['Current', 'check', 'green'], ended: ['Ended', 'minus', 'mute'], scheduled: ['Scheduled', 'calendar', 'ink2'], reversed: ['Reversed', 'undo', 'mute']};
const HO_ST = {nominated: ['Waiting for the successor', 'clock', 'ink2'], accepted: ['Accepted, waiting for confirmation', 'clock', 'warn'], declined: ['Declined', 'close', 'mute'], confirmed: ['Completed', 'check', 'green'], cancelled: ['Canceled', 'close', 'mute'], superseded: ['Out of date', 'warning', 'mute']};
const roleName = g => g.role === 'admin' ? L('Admin') : g.title ? L(g.title) : g.unit ? L('{r} of {d}', {r: L(ROLES[g.role].label), d: div(g.unit).short}) : L(ROLES[g.role].label);

const TABS = [['members', 'Members', canMembers], ['invites', 'Invitations', canInvView], ['appointments', 'Appointments', canApptView], ['handover', 'Presidency', canHoView], ['members/audit', 'Account audit', canAudit]];
const tabs = cur => { const m = me(), t = TABS.filter(x => x[2](m)); return t.length > 1 ? `<nav class="tabs acct-tabs" aria-label="${esc(L('Accounts'))}">${t.map(([h, l]) => `<button class="${cur === h ? 'on' : ''}" data-act="go" data-h="${h}" ${cur === h ? 'aria-current="page"' : ''}>${L(l)}</button>`).join('')}</nav>` : ''; };
const deniedOut = crumb => ({crumb, content: denied()}); // pattern 13: neutral, no title or count leak (access_denied)

// ---------- open duties before a move, pause or departure (flow-transfer-preview 2, flow-revoke-preview 2, hr_roster_change) ----------
const summ = t => typeof isSummary === 'function' && isSummary(t);
function dutiesOf(pid) {
  const open = t => !t.trashed && !isDone(t) && !summ(t);
  return {
    tasks: db.tasks.filter(t => open(t) && t.owner === pid),
    shared: db.tasks.filter(t => open(t) && t.owner !== pid && (t.assignees || []).some(a => a.id === pid && a.state === 'joined')),
    reviews: db.tasks.filter(t => !t.trashed && t.status === 'review' && t.reviewer === pid && t.owner !== pid),
    offersIn: db.offers.filter(o => o.to === pid && o.state === 'pending'),
    projects: db.projects.filter(p => (p.lead === pid || p.pm === pid) && !['completed', 'cancelled', 'archived'].includes(p.stage)),
    resources: db.resources.filter(r => r.owner === pid && !r.archived),
    routines: (db.routines || []).filter(r => !r.personal && (r.owners || []).includes(pid) && !r.paused),
    decisions: db.decisions.filter(d => d.approver === pid && d.state === 'awaiting'),
  };
}
const dutyCount = d => Object.values(d).reduce((n, x) => n + x.length, 0);
// Duties a leader chose to leave unresolved stay visible until someone takes them (hr_roster_change: explicit unresolved queue).
const unresolvedOf = pid => { const out = new Set(); acct().actions.filter(a => a.person === pid && a.state === 'applied').forEach(a => Object.entries(a.map || {}).forEach(([tid, ch]) => {
  const t = taskOf(tid); if (ch === 'open' && t && !t.trashed && !isDone(t) && t.owner === pid && !db.offers.some(o => o.task === tid && o.state === 'pending')) out.add(tid); })); return [...out].map(taskOf); };
const ctxOf = t => { const p = projOf(t.project); return p ? p.name : t.div ? div(t.div).short : ''; };

function dutyBlock(kind, p) {
  const d = dutiesOf(p.id), f = F();
  const pool = (dv, ex = []) => db.people.filter(x => x.status === 'active' && !isBoard(x) && x.id !== p.id && !ex.includes(x.id) && (!dv || x.div === dv)).sort((a, b) => a.name.localeCompare(b.name));
  const taskRow = t => { const k = `map:${t.id}`; if (f[k] == null) f[k] = kind === 'transfer' ? 'keep' : 'open';
    const opts = [...(kind === 'transfer' ? [['keep', L('Keep with {who}', {who: p.first})]] : []), ['open', L('Leave unresolved, visible to leads')], ...pool(taskDiv(t) || p.div).map(x => ['offer:' + x.id, L('Offer to {who}', {who: x.name})])];
    return `<div class="acct-duty"><div class="t"><b>${esc(t.title)}</b><small>${esc(ctxOf(t))}${t.due ? `, ${L('due {d}', {d: dShort(t.due)})}` : ''}</small></div>${sel('acct-' + k.replace(':', '-'), k, opts, false, 'sel-sm')}</div>`; };
  const revRow = t => { const k = `rev:${t.id}`; if (f[k] == null) f[k] = 'open';
    const opts = [['open', L('Leave unresolved, visible to leads')], ...pool(taskDiv(t), [t.owner]).map(x => ['ask:' + x.id, L('Ask {who} to review', {who: x.name})])];
    return `<div class="acct-duty"><div class="t"><b>${esc(t.title)}</b><small>${L('Review for {who}', {who: esc(pname(t.owner))})}</small></div>${sel('acct-' + k.replace(':', '-'), k, opts, false, 'sel-sm')}</div>`; };
  const listRow = (title, sub, h) => `<div class="acct-duty"><div class="t"><b>${h ? `<a href="#/${h}">${esc(title)}</a>` : esc(title)}</b><small>${sub}</small></div></div>`;
  const stays = kind === 'transfer' ? L('Kept. Roles across divisions stay as explicit collaboration; review them with the lead.') : L('Unresolved until the lead or Director names a successor.');
  const n = dutyCount(d);
  if (!n) return `<div class="empty-inline">${L('{who} has no open duties recorded in dwdg’ONE.', {who: esc(p.first)})}</div>`;
  return `${d.tasks.length ? `<h3 class="t-small sub-h">${L('Tasks {who} is responsible for', {who: esc(p.first)})} <span class="n">${d.tasks.length}</span></h3><div class="acct-duties">${d.tasks.map(taskRow).join('')}</div>` : ''}
    ${d.reviews.length ? `<h3 class="t-small sub-h">${L('Reviews waiting for {who}', {who: esc(p.first)})} <span class="n">${d.reviews.length}</span></h3><div class="acct-duties">${d.reviews.map(revRow).join('')}</div>` : ''}
    ${d.shared.length ? `<h3 class="t-small sub-h">${L('Tasks {who} shares', {who: esc(p.first)})} <span class="n">${d.shared.length}</span></h3><div class="acct-duties">${d.shared.map(t => listRow(t.title, L('Responsible: {who}. The responsible person stays the same.', {who: esc(pname(t.owner))}))).join('')}</div>` : ''}
    ${d.projects.length ? `<h3 class="t-small sub-h">${L('Projects {who} leads or manages', {who: esc(p.first)})} <span class="n">${d.projects.length}</span></h3><div class="acct-duties">${d.projects.map(x => listRow(x.name, stays, `projects/${x.id}`)).join('')}</div>` : ''}
    ${d.decisions.length ? `<h3 class="t-small sub-h">${L('Decisions waiting for {who}', {who: esc(p.first)})} <span class="n">${d.decisions.length}</span></h3><div class="acct-duties">${d.decisions.map(x => listRow(x.question, stays)).join('')}</div>` : ''}
    ${d.routines.length ? `<h3 class="t-small sub-h">${L('Routines {who} runs', {who: esc(p.first)})} <span class="n">${d.routines.length}</span></h3><div class="acct-duties">${d.routines.map(x => listRow(x.name, stays, `operations/${x.id}`)).join('')}</div>` : ''}
    ${d.resources.length ? `<h3 class="t-small sub-h">${L('Resources {who} looks after', {who: esc(p.first)})} <span class="n">${d.resources.length}</span></h3><div class="acct-duties">${d.resources.map(x => listRow(x.name, stays)).join('')}</div>` : ''}
    ${d.offersIn.length ? `<h3 class="t-small sub-h">${L('Offers waiting for {who}’s answer', {who: esc(p.first)})} <span class="n">${d.offersIn.length}</span></h3><div class="acct-duties">${d.offersIn.map(o => listRow(o.title, L('From {who}. Still unanswered; it never counts as accepted.', {who: esc(pname(o.from))}))).join('')}</div>` : ''}
    <p class="t-small t-mute">${L('Nothing is completed, deleted or reassigned on its own. An offer waits until the new person accepts it.')}</p>`;
}

// ---------- Members (flow-admin-proof 9, hr_roster_change) ----------
function membersList() {
  const m = me(), a = acct(); if (!canMembers(m)) return deniedOut(crumbOf(L('Members')));
  const f = ui.acctMf || 'current', dv = ui.acctMd || '';
  const G = {current: p => p.status === 'active', waiting: p => p.status === 'pending', paused: p => p.status === 'suspended', former: p => ['left', 'alumni', 'declined'].includes(p.status)};
  const pool = db.people.filter(p => !isBoard(p) && inView(m, p) && (!dv || p.div === dv)), list = pool.filter(G[f]);
  const seg = `<div class="seg" role="radiogroup" aria-label="${esc(L('Account state'))}">${[['current', 'Active'], ['waiting', 'Waiting'], ['paused', 'Paused'], ['former', 'Former']].map(([k, l]) => `<button class="${f === k ? 'on' : ''}" data-act="acct-mf" data-k="${k}" role="radio" aria-checked="${f === k}">${L(l)} <span class="n">${pool.filter(G[k]).length}</span></button>`).join('')}</div>`;
  const dsel = wideView(m) ? `<select class="input sel-sm" id="acct-md" aria-label="${esc(L('Division'))}"><option value="">${L('All divisions')}</option>${DIVS.map(d => `<option value="${d.id}" ${dv === d.id ? 'selected' : ''}>${esc(d.name)}</option>`).join('')}</select>` : '';
  const row = p => { const u = unresolvedOf(p.id).length; return `<div class="row acct-row" data-act="go" data-h="members/${p.id}" tabindex="0" role="link">${av(p.id)}<div class="t"><b>${esc(p.name)}</b><small>${esc(roleLabel(p))}${p.admin ? ', Admin' : ''}</small></div>${p.status === 'active' ? idl(p) : ''}${u ? chip([L('{n} unresolved', {n: u}), 'warning', 'warn']) : ''}${p.status === 'active' ? '' : accChip(p)}</div>`; };
  const groups = [[null, L('Presidency')], ...DIVS.map(d => [d.id, d.name])].map(([id, name]) => { const ps = list.filter(p => (p.div || null) === id).sort((x, y) => rank(y) - rank(x) || x.name.localeCompare(y.name));
    return ps.length ? `<h3 class="t-small sub-h acct-gh">${id ? bicon(div(id).icon, false) : ''}${esc(name)} <span class="n">${ps.length}</span></h3><div class="rows">${ps.map(row).join('')}</div>` : ''; }).join('');
  const unres = pool.filter(p => unresolvedOf(p.id).length);
  const hidden = isAdmin(m) ? `${sec(L('Hidden accounts'), a.hidden.length)}<div class="rows">${a.hidden.map(h => `<div class="row acct-row" style="cursor:default"><span class="av">${icon('shield', 'ic-sm')}</span><div class="t"><b>${L(h.label)}</b><small>${L('Hidden from search, pickers, the directory and exports. Only the Admin sees it here.')}</small></div>${chip(['Powers not decided', 'info', 'mute'])}</div>`).join('')}</div>` : '';
  return {crumb: crumbOf(L('Members')), content: `<div class="page wide acct">${head(L('Members'), wideView(m) ? L('Everyone in DWDG UII, batch 2026. Accounts, roles and membership changes.') : L('{d} only. Pausing access works below your own rank.', {d: esc(div(m.div).name)}), reviewer(m) ? `<button class="btn btn-pri" data-act="acct-inv-new">${icon('plus')}${L('Invite someone')}</button>` : '')}
    ${tabs('members')}
    ${unres.length && wideView(m) ? note('warn', 'warning', plural(unres.length, '{n} person has duties left unresolved', '{n} people have duties left unresolved'), unres.map(p => esc(p.name)).join(', ')) : ''}
    <div class="toolbar acct-tb">${seg}${dsel}</div>
    ${groups || `<div class="empty"><b>${L('Nobody here')}</b><p>${f === 'waiting' ? L('New members appear here after they accept an invitation.') : f === 'paused' ? L('No account is paused.') : f === 'former' ? L('No one has left or become alumni yet.') : L('Nobody matches this filter.')}</p></div>`}
    ${hidden}
    <p class="t-small t-mute hint">${L('One person record for each member. A move, a pause or leaving never deletes their work or history.')}</p></div>`};
}

function memberPage(id) {
  const m = me(), p = person(id), a = acct(), cr = crumbOf(`<a href="#/members">${L('Members')}</a>`, p ? esc(p.name) : L('Person'));
  if (!p || isBoard(p) || !canMembers(m) || !inView(m, p)) return deniedOut(cr);
  fk('member:' + id);
  const inv = a.invites.find(i => i.person === p.id), last = a.actions.find(x => x.person === p.id && x.state === 'applied' && x.kind === (p.status === 'suspended' ? 'pause' : p.status));
  const rows = [['transfer', 'Move to another division', 'arrow', 'Preview open duties first. Their history stays with the old division.'], ['pause', 'Pause access', 'lock', 'Stops sign-in and every function. Work and history stay.'], ['restore', 'Restore access', 'undo', 'Lets them sign in again. Roles that ended meanwhile stay ended.'], ['leave', 'End membership', 'logout', 'Leaving DWDG or becoming alumni at the end of a term.']]
    .filter(([k]) => k === 'restore' ? p.status === 'suspended' : k === 'pause' ? p.status !== 'suspended' : true);
  const actRow = ([k, l, ic, help]) => { const c = can(k, m, p);
    const ctl = !c.ok ? `<span class="restricted">${icon('lock')}${L('Not available to you')}</span>` : k === 'restore' ? (ui.form === 'acct-restore' ? '' : `<button class="btn btn-sm" data-act="form" data-f="acct-restore">${icon(ic)}${L(l)}</button>`) : `<a class="btn btn-sm" href="#/members/${p.id}/${k}">${icon(ic)}${L(l)}</a>`;
    return `<div class="setrow"><div><b>${L(l)}</b><small>${c.ok ? L(help) : esc(c.why)}</small></div><div class="setctl">${ctl}</div></div>${k === 'restore' && c.ok && ui.form === 'acct-restore' ? `<div class="quiet subform">${fld('acct-rs-note', L('Note'), area('acct-rs-note', 'rsnote'), L('Recorded in the account audit.'), true)}<div class="acts"><button class="btn btn-pri btn-sm" data-act="acct-restore" data-id="${p.id}">${L('Restore {who}’s access', {who: esc(p.first)})}</button><button class="btn btn-ghost btn-sm" data-act="form">${L('Cancel')}</button></div></div>` : ''}`; };
  const statusNote = p.status === 'suspended' && last ? note('warn', 'lock', L('Access paused since {d}', {d: fmtD(last.effective)}), `${L('By {who}.', {who: esc(pname(last.by))})} ${canReason(m, {actor: last.by}) ? esc(last.reason) : ''}`, canReason(m, {actor: last.by}) ? '' : `<span class="restricted">${icon('lock')}${L('Reason restricted')}</span>`)
    : ['left', 'alumni'].includes(p.status) && last ? note('info', 'logout', p.status === 'alumni' ? L('Alumni since {d}', {d: fmtD(last.effective)}) : L('Left DWDG on {d}', {d: fmtD(last.effective)}), L('Their work and authorship stay under their name. Current access has ended.'))
    : p.status === 'pending' ? note('warn', 'clock', L('Waiting for the Admin to approve'), L('Signing in alone never gives access.'), inv ? `<a class="btn btn-sm" href="#/invites" data-act="acct-inv-open" data-id="${inv.id}">${L('Open the invitation')}</a>` : '') : '';
  const grants = a.grants.filter(g => g.person === p.id).sort((x, y) => (y.from || '').localeCompare(x.from || ''));
  const mships = a.memberships.filter(x => x.person === p.id).sort((x, y) => (y.from || '').localeCompare(x.from || ''));
  const hist = a.log.filter(e => e.person === p.id), d = dutiesOf(p.id), un = unresolvedOf(p.id);
  const evRow = e => `<div class="chg">${e.actor ? av(e.actor, 'av-sm') : ''}<div class="chg-t"><b>${esc(pname(e.actor))}</b> ${esc(L(e.verb))}${e.detail ? ` <span class="t-mute">${esc(L(e.detail))}</span>` : ''}${e.reason ? `<div class="diff">${canReason(m, e) ? `<span class="tag tag-outline">${esc(e.reason)}</span>` : `<span class="restricted">${icon('lock')}${L('Reason restricted')}</span>`}</div>` : ''}</div><time>${dShort(e.at.slice(0, 10))}</time></div>`;
  return {crumb: cr, content: `<div class="page acct">
    <div class="acct-ph">${av(p.id, 'av-xl')}<div><h1 class="t-title">${esc(p.name)}</h1><p class="sub acct-sub">${p.status === 'active' ? idl(p) : ''}<span>${esc(roleLabel(p))}</span><span>${esc(divName(p.div))}</span>${accChip(p)}</p></div></div>
    ${statusNote}
    ${sec(L('Membership'))}${meta([[L('Organization'), 'DWDG UII'], [L('Batch'), '2026'], [L('Workspace'), p.div ? `${bicon(div(p.div).icon, false)}${esc(div(p.div).name)}` : L('Presidency, all workspaces')], [L('Role'), `${esc(roleLabel(p))}${p.admin ? ' <span class="pbadge">Admin</span>' : ''}`],
      [L('Consultant function'), L('Yes, like every member. It stays through any move.')], [L('Joined'), p.joined ? fmtD(p.joined) : `<span class="t-mute">${L('Not recorded')}</span>`],
      reviewer(m) ? [L('Google account'), `<span class="t-num">${esc(inv ? inv.acceptedAs || inv.email : mailOf(p))}</span>`] : null, inv ? [L('Invited by'), byAt(inv.createdBy, inv.createdAt)] : null, inv && inv.approvedBy ? [L('Approved by'), byAt(inv.approvedBy, inv.approvedAt)] : null])}
    ${sec(L('Account actions'))}<div class="setbox">${rows.map(actRow).join('')}
      ${canApptView(m) ? `<div class="setrow"><div><b>${L('Appoint to a role')}</b><small>${L('Roles change only through a dated appointment. A task never promotes anyone.')}</small></div><div class="setctl"><a class="btn btn-sm" href="#/appointments">${icon('flag')}${L('Open appointments')}</a></div></div>` : ''}</div>
    ${un.length ? `${sec(L('Duties left unresolved'), un.length)}<div class="rows">${un.map(t => typeof taskRow === 'function' ? taskRow(t, {owner: true}) : `<div class="row" data-act="open-task" data-id="${t.id}">${esc(t.title)}</div>`).join('')}</div>` : ''}
    ${sec(L('Open duties'), dutyCount(d))}${dutyCount(d) ? `<div class="acct-counts">${[['tasks', 'Tasks'], ['reviews', 'Reviews'], ['projects', 'Projects led'], ['decisions', 'Decisions'], ['routines', 'Routines'], ['resources', 'Resources'], ['offersIn', 'Offers unanswered']].filter(([k]) => d[k].length).map(([k, l]) => `<span class="acct-count"><b class="t-num">${d[k].length}</b>${L(l)}</span>`).join('')}</div>` : `<div class="empty-inline">${L('None recorded')}</div>`}
    ${sec(L('Roles'), grants.length)}<div class="rows">${grants.map(g => `<div class="row acct-row" style="cursor:default"><div class="t"><b>${esc(roleName(g))}</b><small>${g.from ? L('From {d}', {d: fmtD(g.from)}) : L('Start not recorded')}${g.to ? `, ${L('until {d}', {d: fmtD(g.to)})}` : ''}${g.predecessor ? `, ${L('after {who}', {who: esc(pname(g.predecessor))})}` : ''}</small></div><span class="acct-by-c">${g.by ? byAt(g.by, g.at) : `<span class="t-small t-mute">${L('Recorded at setup')}</span>`}</span>${chip(GRANT_ST[g.state])}</div>`).join('') || `<div class="empty-inline">${L('Member, no leadership role.')}</div>`}</div>
    ${sec(L('Division membership'), mships.length)}<div class="rows">${mships.map(x => `<div class="row acct-row" style="cursor:default">${bicon(div(x.div).icon, false)}<div class="t"><b>${esc(div(x.div).name)}</b><small>${x.from ? L('From {d}', {d: fmtD(x.from)}) : L('Start not recorded')}${x.to ? `, ${L('until {d}', {d: fmtD(x.to)})}` : ''}</small></div>${chip(x.to ? GRANT_ST.ended : GRANT_ST.active)}</div>`).join('') || `<div class="empty-inline">${L('No division membership. Presidency accounts see all workspaces.')}</div>`}</div>
    ${sec(L('Account history'), hist.length)}${hist.length ? `<div class="feed">${hist.map(evRow).join('')}</div>` : `<div class="empty-inline">${L('No account changes recorded yet.')}</div>`}
    <p class="t-small t-mute hint">${L('Attendance, assessments and authorship keep the division they were recorded in.')}</p></div>`};
}

// ---------- transfer, pause and leave share one preview page (flow-transfer-preview, flow-revoke-preview) ----------
const FLOW = {transfer: ['Move {who} to another division', 'Move', 'Choose the destination, then decide each open duty. Nothing changes until you apply.'],
  pause: ['Pause {who}’s access', 'Pause access', 'Pausing stops sign-in and every function at once. Work, records and history stay as they are.'],
  leave: ['End {who}’s membership', 'End membership', 'Current access ends on the date you set. Work and authorship stay under their name.']};
function flowPage(kind, id) {
  const m = me(), p = person(id), cr = crumbOf(`<a href="#/members">${L('Members')}</a>`, p ? `<a href="#/members/${p.id}">${esc(p.name)}</a>` : L('Person'), L(FLOW[kind][1]));
  if (!p || isBoard(p) || !canMembers(m) || !inView(m, p)) return deniedOut(cr);
  const f = fk(`${kind}:${id}`), c = can(kind, m, p);
  const title = L(FLOW[kind][0], {who: esc(p.first)});
  if (!c.ok) return {crumb: cr, content: `<div class="page acct">${head(title)}${note('error', 'lock', L('You can’t do this'), esc(c.why), `<a class="btn btn-sm" href="#/members/${p.id}">${L('Back')}</a>`)}<p class="t-small t-mute hint">${L('Nothing was changed.')}</p></div>`};
  if (f.date == null) f.date = today();
  const others = DIVS.filter(d => d.id !== p.div);
  if (kind === 'transfer' && f.to == null) f.to = others[0].id;
  if (kind === 'leave' && f.lk == null) f.lk = 'left';
  const details = kind === 'transfer' ? `<div class="grid2">${fld('acct-from', L('From'), `<input class="input" id="acct-from" value="${esc(div(p.div).name)}" disabled>`)}${fld('acct-to', L('To'), sel('acct-to', 'to', others.map(d => [d.id, d.name]), true))}</div>
      <div class="grid2">${fld('acct-eff', L('Effective date'), inp('acct-eff', 'date', '', 'date'))}${fld('acct-why', L('Reason'), inp('acct-why', 'why', L('For the record')), '', true)}</div>`
    : kind === 'pause' ? `${fld('acct-why', L('Reason'), area('acct-why', 'why', L('What happened and why access must stop now')), L('Only the Admin, the President, HR leads and you can read this. It never appears in Changes.'))}
      <div class="grid2">${fld('acct-from', L('Effective'), `<input class="input" id="acct-from" value="${esc(L('Now'))}" disabled>`)}${fld('acct-rev', L('Review by'), inp('acct-rev', 'rev', '', 'date'), L('When someone looks at this again.'), true)}</div>`
    : `<div class="seg acct-kind" role="radiogroup" aria-label="${esc(L('Kind'))}">${[['left', 'Leaving DWDG'], ['alumni', 'Alumni, end of term']].map(([k, l]) => `<button class="${f.lk === k ? 'on' : ''}" data-act="acct-lk" data-k="${k}" role="radio" aria-checked="${f.lk === k}">${L(l)}</button>`).join('')}</div>
      <div class="grid2">${fld('acct-eff', L('Last day'), inp('acct-eff', 'date', '', 'date'))}${fld('acct-why', L('Reason'), inp('acct-why', 'why', L('Private')), L('Only HR leads, the Admin and the President read this.'))}</div>`;
  const to = kind === 'transfer' ? div(f.to) : null;
  const delta = kind === 'transfer' ? `<ul class="acct-delta">
      <li class="minus">${icon('minus', 'ic-sm')}<span>${L('Loses the {d} workspace: its projects, operations, resources and Changes.', {d: esc(div(p.div).name)})}</span></li>
      <li class="plus">${icon('plus', 'ic-sm')}<span>${L('Gets the {d} workspace as a Member.', {d: esc(to.name)})}</span></li>
      <li>${icon('check', 'ic-sm')}<span>${L('Keeps the same person record, the consultant function, accepted tasks you keep below and shared project roles.')}</span></li>
      <li>${icon('lock', 'ic-sm')}<span>${L('Attendance, assessments and authorship stay recorded under {d}.', {d: esc(div(p.div).short)})}</span></li></ul>`
    : kind === 'pause' ? `<ul class="acct-delta"><li class="minus">${icon('lock', 'ic-sm')}<span>${L('Can’t sign in or use any function from now. An open session stops at its next action.')}</span></li>
      <li>${icon('check', 'ic-sm')}<span>${L('Tasks, records and history stay. Nothing is completed, deleted or reassigned automatically.')}</span></li>
      <li>${icon('external', 'ic-sm')}<span>${L('Google Drive files shared with them need removing there; dwdg’ONE can’t revoke a shared link.')}</span></li></ul>`
    : `<ul class="acct-delta"><li class="minus">${icon('logout', 'ic-sm')}<span>${L('Current access ends on the last day.')}</span></li>
      <li>${icon('check', 'ic-sm')}<span>${L('Their name stays on everything they did. History is never erased.')}</span></li>
      ${f.lk === 'alumni' ? `<li>${icon('info', 'ic-sm')}<span>${L('Alumni read-only access is a separate grant that is not decided yet, so none is given now.')}</span></li>` : ''}
      <li>${icon('external', 'ic-sm')}<span>${L('Accounts and files they own outside dwdg’ONE need a handover at the provider.')}</span></li></ul>`;
  const danger = kind !== 'transfer';
  const verb = kind === 'transfer' ? L('Move {who} to {d}', {who: esc(p.first), d: esc(to.short)}) : kind === 'pause' ? L('Pause {who}’s access', {who: esc(p.first)}) : f.lk === 'alumni' ? L('Make {who} alumni', {who: esc(p.first)}) : L('End {who}’s membership', {who: esc(p.first)});
  return {crumb: cr, content: `<div class="page acct">
    <a class="linkbtn acct-back" href="#/members/${p.id}">${icon('left', 'ic-xs')}${esc(p.name)}</a>
    ${head(title, L(FLOW[kind][2]))}
    <div class="acct-who">${av(p.id, 'av-lg')}<div><b>${esc(p.name)}</b><small>${esc(roleText(p))}</small></div>${accChip(p)}</div>
    ${sec(L('Details'))}<div class="acct-form">${details}</div>
    ${sec(L('What changes for {who}', {who: esc(p.first)}))}${delta}
    ${sec(L('Open duties'), dutyCount(dutiesOf(p.id)))}${dutyBlock(kind, p)}
    <div class="acct-apply">${note(danger ? 'warn' : 'info', danger ? 'warning' : 'info', L('Review, then apply'), kind === 'transfer' ? L('{who} and both workspaces see a move entry. Private details are not shown.', {who: esc(p.first)}) : L('The account audit records you as the actor, with the reason. Changes shows only that access changed.'))}
      <div class="acts"><button class="btn ${danger ? 'btn-danger' : 'btn-pri'}" data-act="acct-apply" data-k="${kind}" data-id="${p.id}">${verb}</button><a class="btn btn-ghost" href="#/members/${p.id}">${L('Cancel')}</a></div></div></div>`};
}

function applyFlow(kind, p) {
  const m = me(), a = acct(), f = F(), c = can(kind, m, p); if (!c.ok) return toast(c.why);
  const date = f.date || today(), why = (f.why || '').trim();
  if (kind === 'pause' && !why) return invalid('#acct-why', L('Say why access must stop.'));
  if (kind === 'leave' && !why) return invalid('#acct-why', L('Give a reason for the record.'));
  if (kind === 'transfer' && date > today()) return invalid('#acct-eff', L('The prototype’s day is fixed at {d}. Choose today or earlier.', {d: fmtD(today())}));
  if (kind === 'leave' && date > today()) return invalid('#acct-eff', L('The prototype’s day is fixed at {d}. Choose today or earlier.', {d: fmtD(today())}));
  const prevP = {div: p.div, status: p.status}, made = [], revPrev = [], map = {};
  const d = dutiesOf(p.id);
  d.tasks.forEach(t => { const ch = f[`map:${t.id}`] || (kind === 'transfer' ? 'keep' : 'open'); map[t.id] = ch.startsWith('offer:') ? 'offer' : ch;
    if (ch.startsWith('offer:')) { const to = ch.slice(6), o = {id: uid('o'), from: m.id, to, title: t.title, result: '', due: t.due, project: t.project, state: 'pending', note: L('Handover from {who}. Nothing changes until you accept.', {who: p.name}), task: t.id, at: nowStamp(), answeredAt: null};
      db.offers.push(o); made.push(o); notify(to, 'offer', {type: 'offer', id: o.id}); } });
  d.reviews.forEach(t => { const ch = f[`rev:${t.id}`] || 'open'; if (ch.startsWith('ask:')) { revPrev.push([t, t.reviewer]); t.reviewer = ch.slice(4); notify(t.reviewer, 'review', {type: 'task', id: t.id}); } else map[t.id] = 'open'; });
  const rec = {id: uid('ac'), kind: kind === 'leave' ? f.lk : kind, person: p.id, from: p.div, to: kind === 'transfer' ? f.to : null, effective: date, reason: why, review: f.rev || null, map, offers: made.map(o => o.id), by: m.id, at: nowStamp(), state: 'applied'};
  a.actions.unshift(rec);
  const msOld = a.memberships.find(x => x.person === p.id && !x.to), link = memberLink(p);
  let msg;
  if (kind === 'transfer') {
    if (msOld) msOld.to = date; const msNew = {id: uid('ms'), person: p.id, div: f.to, from: date, to: null, by: m.id}; a.memberships.push(msNew); rec.ms = msNew.id;
    p.div = f.to; alog('moved the member', p, {detail: `${div(rec.from).short} → ${div(rec.to).short}`, reason: why, ref: `members/${p.id}`});
    logChange(rec.from, 'moved a member out of the workspace:', link); logChange(rec.to, 'moved a member into the workspace:', link); upd(p.id, 'acct-moved', 'welcome', div(rec.to).name);
    msg = L('{who} moved to {d}', {who: p.first, d: div(rec.to).short});
  } else if (kind === 'pause') {
    p.status = 'suspended'; alog('paused access for', p, {reason: why, ref: `members/${p.id}`}); logChange(p.div, 'paused access for', link); msg = L('{who}’s access is paused', {who: p.first});
  } else {
    p.status = f.lk; p.departedOn = date; if (msOld) msOld.to = date; alog(f.lk === 'alumni' ? 'recorded the end of term for' : 'ended the membership of', p, {reason: why, ref: `members/${p.id}`});
    logChange(p.div, f.lk === 'alumni' ? 'recorded the end of term for' : 'ended the membership of', link); msg = f.lk === 'alumni' ? L('{who} is alumni now', {who: p.first}) : L('{who}’s membership ended', {who: p.first});
  }
  ui.acctF = {}; ui.form = null; save(); go(`members/${p.id}`);
  // Undo appends a reversal: the action is marked reversed, offers are withdrawn, and Changes gets a new entry (work_undo_archive).
  toast(msg, () => { Object.assign(p, prevP); rec.state = 'reversed'; made.forEach(o => { if (o.state === 'pending') { o.state = 'withdrawn'; o.answeredAt = nowStamp(); } }); revPrev.forEach(([t, r]) => { t.reviewer = r; });
    if (kind === 'transfer') { a.memberships = a.memberships.filter(x => x.id !== rec.ms); if (msOld) msOld.to = null; }
    if (kind === 'leave') { delete p.departedOn; if (msOld) msOld.to = null; }
    alog('reversed', p, {detail: L(FLOW[kind][1]), ref: `members/${p.id}`}); logChange(rec.from || p.div, 'reversed an account change for', link); rerender(); });
}

// ---------- Invitations (flow-admin-invite, flow-invite-delivery, onboarding-invitations) ----------
function invitesPage() {
  const m = me(), a = acct(); if (!canInvView(m)) return deniedOut(crumbOf(L('Invitations')));
  const f = ui.acctIf || 'open', G = {open: i => ['pending', 'accepted'].includes(invState(i)), active: i => invState(i) === 'active', closed: i => ['expired', 'revoked', 'declined'].includes(invState(i)), all: () => true};
  const list = a.invites.filter(G[f]).sort((x, y) => y.createdAt.localeCompare(x.createdAt));
  const row = i => { const st = invState(i), sl = ui.insp && ui.insp.type === 'acct-inv' && ui.insp.id === i.id;
    return `<div class="row acct-row ${sl ? 'sel' : ''}" data-act="acct-inv-open" data-id="${i.id}" tabindex="0">${i.person && person(i.person) ? av(i.person) : avName(i.name)}<div class="t"><b>${esc(i.name)}</b><small class="t-num">${esc(i.email)}</small></div><span class="acct-cell">${i.div ? `${bicon(div(i.div).icon, false)}${esc(div(i.div).short)}` : ''}</span>${chip(INV_ST[st])}<time class="t-num t-mute acct-time">${st === 'pending' ? L('until {d}', {d: dShort(i.expires)}) : ago(i.history[0].at)}</time></div>`; };
  return {crumb: crumbOf(`<a href="#/members">${L('Members')}</a>`, L('Invitations')), content: `<div class="page wide acct">${head(L('Invitations'), L('Invite only. The invited Google account accepts, then the Admin approves each member.'), reviewer(m) ? `<button class="btn btn-pri" data-act="acct-inv-new">${icon('plus')}${L('Invite someone')}</button>` : '')}
    ${tabs('invites')}
    <div class="toolbar acct-tb"><div class="seg" role="radiogroup" aria-label="${esc(L('Filter'))}">${[['open', 'Open'], ['active', 'Joined'], ['closed', 'Expired or revoked'], ['all', 'All']].map(([k, l]) => `<button class="${f === k ? 'on' : ''}" data-act="acct-if" data-k="${k}" role="radio" aria-checked="${f === k}">${L(l)} <span class="n">${a.invites.filter(G[k]).length}</span></button>`).join('')}</div></div>
    <div class="rows">${list.map(row).join('') || `<div class="empty"><b>${L('No invitations here')}</b><p>${reviewer(m) ? L('Invite someone with their Google account address, workspace and role.') : L('HR leads and the Admin send invitations.')}</p></div>`}</div>
    <p class="t-small t-mute hint">${L('dwdg’ONE doesn’t send email yet. Copy the link and send it yourself. A link never shows anything about DWDG until the right account signs in.')}</p></div>`};
}
INSP['acct-inv-new'] = () => { const m = me(), f = fk('inv-new'); if (!reviewer(m)) return `${inspHead(L('Invite someone'))}<p class="t-mute">${L('HR leads and the Admin send invitations.')}</p>`;
  if (f.div == null) f.div = m.div && m.div !== 'hr' ? m.div : 'sng'; if (f.exp == null) f.exp = '14';
  return `${inspHead(L('Invite someone'))}<h2>${L('New invitation')}</h2><p class="t-small t-mute">${L('Nothing is shared until the invited account accepts and the Admin approves.')}</p>
  ${fld('acct-in-name', L('Name'), inp('acct-in-name', 'name', L('As the person writes it')))}
  ${fld('acct-in-mail', L('Google account'), inp('acct-in-mail', 'email', 'name@students.uii.ac.id', 'email'), L('Acceptance must come from this exact account. A university domain alone is not membership.'))}
  ${fld('acct-in-div', L('Workspace'), sel('acct-in-div', 'div', DIVS.map(d => [d.id, d.name])))}
  ${fld('acct-in-role', L('Role'), sel('acct-in-role', 'role', [['member', L('Member')], ['board', L('Board of Supervisors (set up by the Admin, not in this prototype)'), true]]), L('Leadership roles come later through an appointment.'))}
  ${fld('acct-in-exp', L('Link works for'), sel('acct-in-exp', 'exp', [['7', L('7 days')], ['14', L('14 days')], ['30', L('30 days')]]), L('Proposed default: 14 days.'))}
  ${f.dupName ? note('warn', 'warning', L('{who} already has this name', {who: esc(f.dupName)}), L('A matching name is not proof it’s the same person. Check the Google account, then create the invitation anyway or change it.')) : ''}
  <div class="acts"><button class="btn btn-pri" data-act="acct-inv-create">${f.dupName ? L('Create anyway') : L('Create invitation')}</button><button class="btn btn-ghost" data-act="close-insp">${L('Cancel')}</button></div>`; };

INSP['acct-inv'] = x => { const m = me(), i = invOf(x.id); if (!i || !canInvView(m)) return `${inspHead(L('Invitation'))}<p class="t-mute">${L('This is not available to you.')}</p>`;
  const st = invState(i), r = reviewer(m), f = F(), url = `${location.href.split('#')[0]}#/invite/${i.id}`, step = {pending: 1, expired: 1, accepted: 2, active: 3}[st] || 0;
  const steps = `<div class="steps acct-steps">${[['Invited', 1], ['Accepted', 2], ['Approved', 3]].map(([l, n]) => `<span class="${step > n || st === 'active' ? 'done' : step === n ? 'now' : ''}">${L(l)}</span>`).join('')}</div>`;
  const form = ui.form;
  let acts = '';
  if (r && st === 'pending') acts = form === 'inv-edit' ? `<div class="quiet subform">${fld('acct-ie-name', L('Name'), inp('acct-ie-name', 'ename'))}${fld('acct-ie-mail', L('Google account'), inp('acct-ie-mail', 'eemail', '', 'email'))}${fld('acct-ie-div', L('Workspace'), sel('acct-ie-div', 'ediv', DIVS.map(d => [d.id, d.name])))}<p class="t-small t-mute">${L('Saving makes a new link. The old link stops working.')}</p><div class="acts"><button class="btn btn-pri btn-sm" data-act="acct-inv-fix" data-id="${i.id}">${L('Save correction')}</button><button class="btn btn-ghost btn-sm" data-act="form">${L('Cancel')}</button></div></div>`
    : form === 'inv-revoke' ? `<div class="quiet subform">${fld('acct-ir-why', L('Why revoke it?'), area('acct-ir-why', 'rwhy'))}<div class="acts"><button class="btn btn-danger btn-sm" data-act="acct-inv-revoke" data-id="${i.id}">${L('Revoke invitation for {who}', {who: esc(i.name)})}</button><button class="btn btn-ghost btn-sm" data-act="form">${L('Cancel')}</button></div></div>`
    : `<div class="acts acct-acts"><button class="btn btn-pri btn-sm" data-act="acct-inv-copy" data-id="${i.id}">${icon('link')}${L('Copy invitation link')}</button><button class="btn btn-sm" data-act="acct-inv-edit" data-id="${i.id}">${icon('edit')}${L('Correct details')}</button><button class="btn btn-ghost btn-sm" data-act="form" data-f="inv-revoke">${L('Revoke')}</button></div>
      <button class="linkbtn acct-try" data-act="acct-inv-try" data-id="${i.id}">${icon('external', 'ic-xs')} ${L('Prototype: open the link as the invited person')}</button>`;
  else if (r && st === 'expired') acts = form === 'inv-revoke' ? `<div class="quiet subform">${fld('acct-ir-why', L('Why revoke it?'), area('acct-ir-why', 'rwhy'))}<div class="acts"><button class="btn btn-danger btn-sm" data-act="acct-inv-revoke" data-id="${i.id}">${L('Revoke invitation for {who}', {who: esc(i.name)})}</button><button class="btn btn-ghost btn-sm" data-act="form">${L('Cancel')}</button></div></div>`
    : `<div class="acts acct-acts"><button class="btn btn-pri btn-sm" data-act="acct-inv-renew" data-id="${i.id}">${icon('undo')}${L('Renew for 14 days')}</button><button class="btn btn-ghost btn-sm" data-act="form" data-f="inv-revoke">${L('Revoke')}</button></div><p class="t-small t-mute">${L('Renewing makes a new link. The expired link never works again.')}</p>`;
  else if (st === 'accepted') acts = isAdmin(m) ? (form === 'inv-decline' ? `<div class="quiet subform">${fld('acct-id-why', L('Why not approve?'), area('acct-id-why', 'dwhy'), L('Recorded in the account audit.'))}<div class="acts"><button class="btn btn-danger btn-sm" data-act="acct-decline" data-id="${i.id}">${L('Don’t approve {who}', {who: esc(i.name)})}</button><button class="btn btn-ghost btn-sm" data-act="form">${L('Cancel')}</button></div></div>`
    : `<div class="acts acct-acts"><button class="btn btn-pri btn-sm" data-act="acct-approve" data-id="${i.id}">${icon('check')}${L('Approve {who}', {who: esc(i.name.split(' ')[0])})}</button><button class="btn btn-ghost btn-sm" data-act="form" data-f="inv-decline">${L('Don’t approve')}</button></div><p class="t-small t-mute">${L('Approving opens only the {d} workspace as a Member.', {d: esc(divName(i.div))})}</p>`)
    : `<p class="t-small t-mute">${L('Waiting for the Admin to approve. Only the Admin approves members.')}</p>`;
  else if (st === 'active' && i.person) acts = `<div class="acts"><a class="btn btn-sm" href="#/members/${i.person}">${L('Open member')}</a></div>`;
  else if (st === 'revoked' || st === 'declined') acts = `<p class="t-small t-mute">${L('This link never works again. Create a new invitation if needed.')}</p>`;
  return `${inspHead(L('Invitation'))}<h2>${esc(i.name)}</h2>${chip(INV_ST[st], 'pill')}${steps}
  ${meta([[L('Google account'), `<span class="t-num">${esc(i.email)}</span>`], [L('Workspace'), i.div ? `${bicon(div(i.div).icon, false)}${esc(div(i.div).name)}` : '—'], [L('Role'), L(ROLES[i.role].label)], [L('Batch'), esc(i.batch)],
    [L('Expires'), `${fmtD(i.expires)}${st === 'expired' ? ` <span class="t-mute">${L('(expired)')}</span>` : ''}`], [L('Link'), i.delivery ? L('Copied by {who}, {d}', {who: esc(first(i.delivery.by)), d: dShort(i.delivery.at.slice(0, 10))}) : `<span class="t-mute">${L('Not shared yet')}</span>`],
    [L('Created by'), byAt(i.createdBy, i.createdAt)], i.acceptedAt ? [L('Accepted'), L('{d} by {mail}', {d: fmtD(i.acceptedAt.slice(0, 10)), mail: `<span class="t-num">${esc(i.acceptedAs)}</span>`})] : null,
    i.approvedBy ? [L('Approved by'), byAt(i.approvedBy, i.approvedAt)] : null, i.revokedBy ? [L('Revoked by'), byAt(i.revokedBy, i.revokedAt)] : null])}
  ${acts}
  ${sec(L('History'), i.history.length)}<div class="feed">${i.history.map(h => `<div class="chg">${av(h.by, 'av-sm')}<div class="chg-t"><b>${esc(pname(h.by))}</b> ${esc(L(h.verb))}${h.note ? `<div class="diff">${r || isAdmin(m) ? `<span class="tag tag-outline">${esc(L(h.note))}</span>` : `<span class="restricted">${icon('lock')}${L('Reason restricted')}</span>`}</div>` : ''}</div><time>${dShort(h.at.slice(0, 10))}</time></div>`).join('')}</div>`; };

// ---------- public invitation link (flow-accept-signin; minimal public content, wrong account sees nothing) ----------
const pubShell = inner => `<div class="signin"><div class="sheet card acct-pub"><div class="lock">${A.lockup}</div>${inner}<div class="seg lang" style="margin-top:18px"><button class="${lang() === 'en' ? 'on' : ''}" data-act="lang" data-l="en">English</button><button class="${lang() === 'id' ? 'on' : ''}" data-act="lang" data-l="id">Bahasa Indonesia</button></div></div></div>`;
const gBtn = (act, label, id = '') => `<button class="btn gbtn" data-act="${act}" data-id="${id}"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7Z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1 .7-2.4 1.1-4 1.1-3.1 0-5.7-2.1-6.6-4.9h-4v3.1A12 12 0 0 0 12 24Z"/><path fill="#FBBC05" d="M5.4 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z"/><path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z"/></svg>${label}</button>`;
function invitePublic(id) {
  const i = invOf(id), st = i ? invState(i) : 'missing', s = session.inv && session.inv.id === id ? session.inv : null;
  if (st === 'missing' || st === 'revoked' || st === 'declined') return pubShell(`<h1 class="t-h2 acct-pub-h">${L('This invitation link doesn’t work')}</h1><p>${L('It may have been replaced or withdrawn. Ask the person who invited you for a new link.')}</p>`);
  if (st === 'expired') return pubShell(`<h1 class="t-h2 acct-pub-h">${L('This invitation has expired')}</h1><p>${L('Ask the person who invited you to renew it. A renewed invitation comes with a new link.')}</p>`);
  if (st === 'accepted' || st === 'active') return pubShell(`<h1 class="t-h2 acct-pub-h">${L('This invitation was already accepted')}</h1><p>${L('Sign in with the Google account that accepted it. Accepting again never creates a second account.')}</p><button class="btn gbtn" data-act="acct-inv-switch" data-id="">${L('Go to sign in')}</button>`);
  if (!s) return pubShell(`<h1 class="t-h2 acct-pub-h">${L('You’re invited to dwdg’ONE')}</h1><p>${L('Sign in with Google to see your invitation. Nothing about the organization shows before you sign in.')}</p>${gBtn('acct-inv-google', L('Continue with Google'), id)}`);
  if (!s.as) return pubShell(`<p class="t-small" style="margin:18px 0 0">${L('Prototype: choose which Google account signs in.')}</p><div class="picker"><div class="row" data-act="acct-inv-as" data-id="${id}" data-as="invitee" tabindex="0">${avName(i.name)}<div class="t"><b>${esc(i.name)}</b><small class="t-num">${esc(i.email)}</small></div></div><div class="row" data-act="acct-inv-as" data-id="${id}" data-as="other" tabindex="0">${avName('Andi Pratama')}<div class="t"><b>Andi Pratama</b><small class="t-num">andi.pratama@gmail.com</small></div></div></div>`);
  if (s.as === 'other') return pubShell(`<h1 class="t-h2 acct-pub-h">${L('This invitation is for a different Google account')}</h1><p>${L('You’re signed in as {mail}. Sign out and use the account the invitation was sent to. Nothing from the organization is shown to this account.', {mail: '<b class="t-num">andi.pratama@gmail.com</b>'})}</p><button class="btn gbtn" data-act="acct-inv-reset" data-id="${id}">${L('Use another account')}</button>`);
  const inviter = person(i.createdBy);
  return pubShell(`<h1 class="t-h2 acct-pub-h">${L('Your invitation')}</h1><p>${L('Check the details, then accept. You’re signed in as {mail}.', {mail: `<b class="t-num">${esc(i.email)}</b>`})}</p>
    <dl class="meta acct-meta acct-pub-m"><dt>${L('Organization')}</dt><dd>DWDG UII</dd><dt>${L('Workspace')}</dt><dd>${bicon(div(i.div).icon, false)}${esc(div(i.div).name)}</dd><dt>${L('Role')}</dt><dd>${L(ROLES[i.role].label)}</dd><dt>${L('Batch')}</dt><dd>${esc(i.batch)}</dd><dt>${L('Invited by')}</dt><dd>${esc(inviter ? inviter.name : '')}</dd><dt>${L('Expires')}</dt><dd>${fmtD(i.expires)}</dd></dl>
    ${note('info', 'info', L('An admin approves you next'), L('Accepting doesn’t open the workspace yet. The Admin approves each new member first.'))}
    <div class="acts acct-pub-a"><button class="btn btn-pri" data-act="acct-inv-accept" data-id="${id}">${L('Accept invitation')}</button><button class="btn btn-ghost" data-act="acct-inv-reset" data-id="${id}">${L('Not me')}</button></div>`);
}
// The signed-in view of an invitation link: never accepts for the wrong person (flow-accept-landing 6, flow-accept-signin 3).
PAGES.invite = r => { const m = me(), i = invOf(r.id), mine = i && i.person === m.id;
  return {crumb: crumbOf(L('Invitation')), content: `<div class="page acct">${mine ? `<div class="empty"><b>${L('You already accepted this invitation')}</b><p>${L('Accepting again never creates a second account.')}</p><a class="btn btn-pri" href="#/work">${L('Open My Work')}</a></div>`
    : `<div class="empty"><b>${L('This invitation is for another account')}</b><p>${L('Sign out to open it with the invited Google account.')}</p><button class="btn" data-act="acct-inv-switch" data-id="${esc(r.id || '')}">${icon('logout')}${L('Sign out and open it')}</button></div>`}</div>`}; };

// ---------- Appointments (access_appointments, S006, entity_role) ----------
const OFFICE = k => k === 'vp' ? {k, role: 'vp', unit: null, label: L('Vice President')} : {k, role: k.split(':')[0] === 'dir' ? 'director' : 'codirector', unit: k.split(':')[1], label: L(k.startsWith('dir:') ? 'Director of {d}' : 'Co-Director of {d}', {d: div(k.split(':')[1]).short})};
const holders = k => { const o = OFFICE(k); return db.people.filter(p => p.status === 'active' && p.role === o.role && (o.unit ? p.div === o.unit : true)); };
// President appoints VPs; relevant VP, President or Admin appoint Directors; Co-Director scope is open, so that action stays off (S006 acceptance 3).
function canAppoint(m, k) {
  if (!m || isBoard(m)) return {ok: false, why: L('Board accounts are read-only.')};
  if (k.startsWith('cd:')) return {ok: false, why: L('Not enabled until the Co-Director appointment rule is adopted.')};
  if (k === 'vp') return isPres(m) || isAdmin(m) ? {ok: true} : {ok: false, why: L('The President appoints the Vice President.')};
  return isAdmin(m) || isPres(m) || (isVP(m) && reportDivs(m).includes(k.slice(4))) ? {ok: true} : {ok: false, why: L('The reporting VP, the President or the Admin appoints Directors.')};
}
const candidates = (k, m) => { const o = OFFICE(k); return db.people.filter(p => p.status === 'active' && !isBoard(p) && p.id !== m.id && !isPres(p) && p.role !== o.role && (o.unit ? p.div === o.unit : true)).sort((a, b) => rank(b) - rank(a) || a.name.localeCompare(b.name)); };
function appointmentsPage() {
  const m = me(), a = acct(); if (!canApptView(m)) return deniedOut(crumbOf(L('Appointments')));
  const keys = ['vp', ...DIVS.map(d => 'dir:' + d.id), ...DIVS.map(d => 'cd:' + d.id)];
  const since = p => { const g = a.grants.filter(x => x.person === p.id && x.role === p.role && x.state === 'active')[0]; return g; };
  const officeRow = k => { const o = OFFICE(k), hs = holders(k), c = canAppoint(m, k);
    return `<div class="row acct-row" style="cursor:default"><div class="acct-off">${o.unit ? bicon(div(o.unit).icon, false) : bicon('role-vp', false)}<b>${esc(o.label)}</b></div>
      <div class="t acct-hold">${hs.length ? hs.map(p => { const g = since(p); return `<span class="acct-by">${av(p.id, 'av-xs')}<span>${esc(p.name)}${g && g.from ? ` <small class="t-mute">${L('since {d}', {d: dShort(g.from)})}</small>` : ''}</span></span>`; }).join('') : chip(['Vacant', 'circle', 'mute'])}</div>
      ${c.ok ? `<button class="btn btn-sm" data-act="acct-appt-new" data-id="${k}">${icon('flag')}${L('Appoint')}</button>` : `<span class="restricted" title="${esc(c.why)}">${icon('lock')}<span class="acct-why">${esc(c.why)}</span></span>`}</div>`; };
  const pres = president(), hist = a.grants.filter(g => g.by).sort((x, y) => (y.at || '').localeCompare(x.at || ''));
  return {crumb: crumbOf(`<a href="#/members">${L('Members')}</a>`, L('Appointments')), content: `<div class="page wide acct">${head(L('Appointments'), L('Leadership roles are dated grants with an actor, a reason and the predecessor. A task assignment never promotes anyone.'))}
    ${tabs('appointments')}
    ${sec(L('President'))}<div class="rows"><div class="row acct-row" data-act="go" data-h="handover" tabindex="0" role="link"><div class="acct-off">${bicon('role-president', false)}<b>${L('President')}</b></div><div class="t acct-hold">${pres ? `<span class="acct-by">${av(pres.id, 'av-xs')}<span>${esc(pres.name)}</span></span>` : chip(['Vacant', 'circle', 'mute'])}</div><span class="t-small t-mute">${L('Changes only through a presidency handover')}</span>${icon('chevron-right')}</div></div>
    ${sec(L('Vice President and Directors'))}<div class="rows">${keys.filter(k => !k.startsWith('cd:')).map(officeRow).join('')}</div>
    ${sec(L('Co-Directors'))}<div class="rows">${keys.filter(k => k.startsWith('cd:')).map(officeRow).join('')}</div>
    ${note('info', 'info', L('The three-VP structure is a draft'), L('VP Internal, VP External and VP Consulting stay inactive until a term handover activates them. Today one VP covers all six divisions.'))}
    ${sec(L('Appointment history'), hist.length)}<div class="rows">${hist.map(g => `<div class="row acct-row" style="cursor:default">${av(g.person, 'av-sm')}<div class="t"><b>${esc(pname(g.person))}, ${esc(roleName(g))}</b><small>${L('From {d}', {d: fmtD(g.from)})}${g.predecessor ? `, ${L('after {who}', {who: esc(pname(g.predecessor))})}` : ''}${g.reason ? `, ${esc(g.reason)}` : ''}</small></div><span class="acct-by-c">${byAt(g.by, g.at)}</span>${chip(GRANT_ST[g.state])}</div>`).join('') || `<div class="empty-inline">${L('No appointments recorded in dwdg’ONE yet. Roles from before launch show as recorded at setup.')}</div>`}</div></div>`};
}
INSP['acct-appt'] = x => { const m = me(), k = x.id, c = canAppoint(m, k), f = fk('appt:' + k); if (!c.ok) return `${inspHead(L('Appointment'))}<p class="t-mute">${esc(c.why)}</p>`;
  const o = OFFICE(k), cs = candidates(k, m); if (f.who == null) f.who = ''; if (f.date == null) f.date = today();
  const pred = holders(k)[0], tgt = person(f.who);
  const scope = o.role === 'vp' ? L('Reporting divisions: all six in the current structure. Appoints Directors in them and can pause access below VP.') : L('Leads {d}: projects, programs, routines and the division queue. Can pause access for people below Director in {d}.', {d: esc(div(o.unit).short)});
  return `${inspHead(L('Appointment'))}<h2>${esc(o.label)}</h2><p class="t-small t-mute">${scope}</p>
  ${fld('acct-ap-who', L('Person'), sel('acct-ap-who', 'who', [['', L('Choose a person')], ...cs.map(p => [p.id, `${p.name}, ${roleText(p)}`])], true), o.unit ? L('People in {d}. Moving someone across divisions is a separate HR move.', {d: esc(div(o.unit).short)}) : '')}
  ${fld('acct-ap-eff', L('Effective date'), inp('acct-ap-eff', 'date', '', 'date'), L('A later date is recorded as scheduled.'))}
  ${fld('acct-ap-why', L('Reason'), area('acct-ap-why', 'why', L('For example: elected at the general meeting on 4 Oct')))}
  ${sec(L('What changes'))}<ul class="acct-delta">
    ${tgt ? `<li class="plus">${icon('plus', 'ic-sm')}<span>${L('{who} becomes {o}.', {who: esc(tgt.name), o: esc(o.label)})}${baseRank(tgt) >= 2 ? ` ${L('Their {r} role ends.', {r: esc(roleLabel(tgt))})}` : ''}</span></li>` : `<li>${icon('circle', 'ic-sm')}<span class="t-mute">${L('Choose a person to see the change.')}</span></li>`}
    ${pred ? `<li class="minus">${icon('minus', 'ic-sm')}<span>${L('{who}’s grant ends. The history keeps it.', {who: esc(pred.name)})} ${pred.div ? L('{who} stays in {d} as a Member.', {who: esc(pred.first), d: esc(div(pred.div).short)}) : ''}</span></li>` : `<li>${icon('info', 'ic-sm')}<span>${L('The office is vacant now.')}</span></li>`}
    <li>${icon('lock', 'ic-sm')}<span>${L('Recorded with you as the actor, the date and the reason.')}</span></li></ul>
  ${pred && !pred.div ? fld('acct-ap-after', L('{who}’s division afterwards', {who: esc(pred.first)}), sel('acct-ap-after', 'after', [['', L('Choose a division')], ...DIVS.map(d => [d.id, d.name])]), L('Not decided by the plan yet. Recorded so the account keeps a workspace.')) : ''}
  <div class="acts"><button class="btn btn-pri" data-act="acct-appt-save" data-id="${k}">${tgt ? L('Appoint {who}', {who: esc(tgt.first)}) : L('Appoint')}</button><button class="btn btn-ghost" data-act="close-insp">${L('Cancel')}</button></div>`; };

// ---------- Presidency (access_presidency_transfer, S004 normal handover, S005 Admin recovery) ----------
function handoverPage() {
  const m = me(), a = acct(); if (!canHoView(m)) return deniedOut(crumbOf(L('Presidency')));
  const pres = president(), h = openHo(), f = fk('handover'), form = ui.form;
  const g = pres ? a.grants.filter(x => x.person === pres.id && x.role === 'president' && x.state === 'active')[0] : null;
  const pool = db.people.filter(p => p.status === 'active' && !isBoard(p) && p.id !== (pres || {}).id).sort((x, y) => rank(y) - rank(x) || x.name.localeCompare(y.name));
  const after = pres ? fld('acct-ho-after', L('{who}’s division after the office ends', {who: esc(pres.first)}), sel('acct-ho-after', 'after', [['', L('Choose a division')], ...DIVS.map(d => [d.id, d.name])]), L('Not decided by the plan yet. Recorded so the account keeps a workspace.')) : '';
  if (f.date == null) f.date = today();
  const nomForm = `<div class="quiet subform acct-hof">${fld('acct-ho-to', L('Successor'), sel('acct-ho-to', 'to', [['', L('Choose a person')], ...pool.map(p => [p.id, `${p.name}, ${roleText(p)}`])]))}${fld('acct-ho-eff', L('Effective date'), inp('acct-ho-eff', 'date', '', 'date'))}${after}${fld('acct-ho-note', L('Message to the successor'), area('acct-ho-note', 'note'), '', true)}
    <div class="acts"><button class="btn btn-pri" data-act="acct-ho-start" data-k="normal">${L('Send the nomination')}</button><button class="btn btn-ghost" data-act="form">${L('Cancel')}</button></div></div>`;
  const recForm = `<div class="quiet subform acct-hof">${fld('acct-hr-st', L('President’s account'), sel('acct-hr-st', 'ist', [['', L('Choose what happened')], ['paused', L('Access paused')], ['deleted', L('Account deleted')], ['unavailable', L('Unavailable')]]))}
    ${fld('acct-hr-why', L('Reason'), area('acct-hr-why', 'why', L('Why the incumbent can’t hand over normally')))}${fld('acct-hr-ev', L('Evidence reference'), inp('acct-hr-ev', 'ev', L('Link or document number')), L('Required when the account is deleted or the President is unavailable.'))}
    ${fld('acct-ho-to', L('Successor'), sel('acct-ho-to', 'to', [['', L('Choose a person')], ...pool.map(p => [p.id, `${p.name}, ${roleText(p)}`])]))}${fld('acct-ho-eff', L('Effective date'), inp('acct-ho-eff', 'date', '', 'date'))}${after}
    <div class="acts"><button class="btn btn-danger" data-act="acct-ho-start" data-k="recovery">${L('Start emergency recovery')}</button><button class="btn btn-ghost" data-act="form">${L('Cancel')}</button></div></div>`;
  const card = (kind, title, body, can, btn, f2, fhtml) => `<div class="sheet acct-card"><b>${title}</b><p class="t-small t-mute">${body}</p>${can ? (form === f2 ? fhtml : `<div class="acts"><button class="btn ${kind === 'recovery' ? '' : 'btn-pri'} btn-sm" data-act="form" data-f="${f2}">${btn}</button></div>`) : ''}</div>`;
  const past = a.handovers.filter(x => x !== h).sort((x, y) => y.createdAt.localeCompare(x.createdAt));
  return {crumb: crumbOf(`<a href="#/members">${L('Members')}</a>`, L('Presidency')), content: `<div class="page acct">${head(L('Presidency'), L('One President at a time. A normal handover belongs to the incumbent; emergency recovery belongs to the Admin.'))}
    ${tabs('handover')}
    ${sec(L('Current office'))}<div class="acct-who">${pres ? av(pres.id, 'av-lg') : ''}<div><b>${pres ? esc(pres.name) : L('Vacant')}</b><small>${L('President')}${g && g.from ? `, ${L('since {d}', {d: fmtD(g.from)})}` : ''}, ${L('office record {n}', {n: a.office.version})}</small></div>${pres ? accChip(pres) : ''}</div>
    ${h ? hoCard(h) : `<div class="acct-cards">${card('normal', L('Normal handover'), pres && pres.id === m.id ? L('Nominate a successor. They accept, then you confirm after signing in again. Your other roles are decided separately.') : L('Only {who}, the incumbent, can start a normal handover.', {who: esc(pres ? pres.first : L('the President'))}), pres && pres.id === m.id && pres.status === 'active', L('Nominate a successor'), 'ho-new', nomForm)}
      ${card('recovery', L('Emergency recovery'), isAdmin(m) ? L('Use when the President’s account is paused, deleted or unavailable. You are recorded as the recovery actor; it is never shown as the President’s own handover.') : L('Only the Admin can start an emergency recovery, when the President’s account is paused, deleted or unavailable.'), isAdmin(m) && !!pres, L('Start emergency recovery'), 'ho-rec', recForm)}</div>`}
    ${sec(L('Past handovers'), past.length)}<div class="rows">${past.map(x => `<div class="row acct-row" style="cursor:default">${av(x.to, 'av-sm')}<div class="t"><b>${esc(pname(x.from))} → ${esc(pname(x.to))}</b><small>${L(x.kind === 'recovery' ? 'Emergency recovery' : 'Normal handover')}, ${esc(stamp(x.createdBy, x.createdAt))}</small></div>${chip(HO_ST[x.state])}</div>`).join('') || `<div class="empty-inline">${L('No handovers recorded in dwdg’ONE yet.')}</div>`}</div></div>`};
}
function hoCard(h) {
  const m = me(), a = acct(), rec = h.kind === 'recovery', confirmer = rec ? isAdmin(m) : (president() || {}).id === m.id, f = F(), fresh = (ui.acctFresh || {})[h.id];
  const n = h.state === 'nominated' ? 1 : h.state === 'accepted' ? (fresh ? 3 : 2) : 4;
  const steps = `<div class="steps acct-steps">${[rec ? 'Recorded by the Admin' : 'Nominated', rec ? 'Successor acknowledged' : 'Successor accepted', 'Verified and confirmed', 'Office transferred'].map((l, i) => `<span class="${i + 1 < n ? 'done' : i + 1 === n ? 'now' : ''}">${L(l)}</span>`).join('')}</div>`;
  let acts = '';
  if (h.state === 'nominated' && h.to === m.id) acts = ui.form === 'ho-decline' ? `<div class="quiet subform">${fld('acct-hd-why', L('Reason'), area('acct-hd-why', 'dwhy'), '', true)}<div class="acts"><button class="btn btn-sm" data-act="acct-ho-answer" data-r="no" data-id="${h.id}">${L('Decline the nomination')}</button><button class="btn btn-ghost btn-sm" data-act="form">${L('Cancel')}</button></div></div>`
    : `<div class="acts"><button class="btn btn-pri btn-sm" data-act="acct-ho-answer" data-r="yes" data-id="${h.id}">${icon('check')}${rec ? L('Acknowledge and accept') : L('Accept the nomination')}</button><button class="btn btn-ghost btn-sm" data-act="form" data-f="ho-decline">${L('Decline')}</button></div><p class="t-small t-mute">${L('Declining has no penalty. Nothing changes until the handover is confirmed.')}</p>`;
  else if (h.state === 'accepted' && confirmer) acts = `<div class="acts">${fresh ? `<span class="acct-fresh">${chip(['Signed in again just now', 'check', 'green'])}</span>` : `<button class="btn btn-sm" data-act="acct-ho-fresh" data-id="${h.id}">${icon('shield')}${L('Sign in again with Google')}</button>`}
      <button class="btn ${rec ? 'btn-danger' : 'btn-pri'} btn-sm" data-act="acct-ho-confirm" data-id="${h.id}" ${fresh ? '' : 'disabled'}>${L('Transfer the presidency to {who}', {who: esc(first(h.to))})}</button><button class="btn btn-ghost btn-sm" data-act="acct-ho-cancel" data-id="${h.id}">${L('Cancel handover')}</button></div><p class="t-small t-mute">${L('Confirming needs a fresh sign-in. Exactly one President stays active; a reversal is a new handover.')}</p>`;
  else if (h.state === 'nominated' && confirmer) acts = `<p class="t-small t-mute">${L('Waiting for {who} to answer.', {who: esc(first(h.to))})}</p><div class="acts"><button class="btn btn-ghost btn-sm" data-act="acct-ho-cancel" data-id="${h.id}">${L('Cancel handover')}</button></div>`;
  else acts = `<p class="t-small t-mute">${h.state === 'nominated' ? L('Waiting for {who} to answer.', {who: esc(first(h.to))}) : rec ? L('Waiting for the Admin to confirm.') : L('Waiting for {who} to confirm.', {who: esc(first(h.from))})}</p>`;
  return `<div class="sheet handoff acct-ho"><div class="row-wrap acct-ho-h"><b>${L(rec ? 'Emergency recovery' : 'Normal handover')}</b>${chip(HO_ST[h.state], 'pill')}</div>
    <div class="ends"><div class="end"><small>${L('Outgoing President')}</small><span class="acct-by">${av(h.from, 'av-xs')}${esc(pname(h.from))}</span></div><span class="acct-arr">${icon('arrow')}</span><div class="end"><small>${L('Successor')}</small><span class="acct-by">${av(h.to, 'av-xs')}${esc(pname(h.to))}</span></div></div>
    ${steps}
    ${meta([[L('Started by'), `${byAt(h.createdBy, h.createdAt)}${rec ? ` <span class="pbadge">${L('Admin, recovery actor')}</span>` : ''}`], [L('Effective date'), fmtD(h.effective)], rec ? [L('President’s account'), L({paused: 'Access paused', deleted: 'Account deleted', unavailable: 'Unavailable'}[h.ist])] : null,
      rec ? [L('Reason'), canReason(m, {actor: h.createdBy}) ? esc(h.reason) : `<span class="restricted">${icon('lock')}${L('Reason restricted')}</span>`] : null, rec && h.ev ? [L('Evidence'), canReason(m, {actor: h.createdBy}) ? esc(h.ev) : `<span class="restricted">${icon('lock')}${L('Restricted')}</span>`] : null,
      [L('Outgoing division'), h.after ? esc(div(h.after).name) : `<span class="t-mute">${L('Not chosen')}</span>`], h.note ? [L('Message'), esc(h.note)] : null, h.answeredAt ? [L('Answered'), byAt(h.to, h.answeredAt)] : null, [L('Office record'), String(h.version)]])}
    ${acts}</div>`;
}
function applyPresidency(h) {
  const a = acct(), old = person(h.from), nw = person(h.to), date = h.effective <= today() ? h.effective : today();
  a.grants.filter(g => g.person === old.id && g.role === 'president' && g.state === 'active').forEach(g => { g.state = 'ended'; g.to = date; });
  old.role = 'member'; old.title = ''; if (h.after) { old.div = h.after; a.memberships.push({id: uid('ms'), person: old.id, div: h.after, from: date, to: null, by: session.me}); }
  a.grants.filter(g => g.person === nw.id && g.role !== 'admin' && g.state === 'active').forEach(g => { g.state = 'ended'; g.to = date; });
  a.memberships.filter(x => x.person === nw.id && !x.to).forEach(x => { x.to = date; });
  nw.role = 'president'; nw.div = null; nw.title = '';
  a.grants.push({id: uid('g'), person: nw.id, role: 'president', unit: null, title: '', from: date, to: null, by: session.me, at: nowStamp(), reason: h.kind === 'recovery' ? L('Emergency recovery') : L('Normal handover'), predecessor: old.id, state: 'active'});
  a.office.version++; h.state = 'confirmed'; h.confirmedBy = session.me; h.confirmedAt = nowStamp();
  a.handovers.filter(x => x !== h && ['nominated', 'accepted'].includes(x.state)).forEach(x => { x.state = 'superseded'; });
  alog(h.kind === 'recovery' ? 'completed an emergency presidency recovery for' : 'completed the presidency handover to', nw, {ref: 'handover'});
  [old.id, nw.id, ...admins().map(p => p.id)].forEach(id => upd(id, 'acct-ho-done', 'handover', L('Presidency')));
}

// ---------- Welcome: first sign-in after approval (flow-accept-landing 4-6, onboarding-first-view, onboarding-profile) ----------
const needsWelcome = p => !!p && p.status === 'active' && !p.welcomedAt && acct().invites.some(i => i.person === p.id && i.state === 'active');
PAGES.welcome = () => {
  const m = me(), a = acct(), inv = a.invites.find(i => i.person === m.id), d = m.div ? div(m.div) : null, lead = rank(m) >= 2, th = session.theme || 'system';
  const ob = db.hr && db.hr.onboarding ? db.hr.onboarding.instances.find(x => x.person === m.id) : null, obT = ob ? ob.tasks.map(taskOf).filter(t => t && !t.trashed) : [];
  const words = [['Workspace', 'folder', 'Your division’s space: its projects, operations, resources and history.'], ['Project', 'projects', 'Work with a goal and an end. Each has Overview, WBS, Work and Resources.'], ['Work', 'tasks', 'Tasks: what you do, in a list, a board or a timeline.'], ['Resources', 'note', 'Notes, folders and links. Files stay in your own Google Drive.']];
  const cando = [L('See and run your own tasks in My Work.'), L('Offer a task to anyone. It waits until they accept, and declining has no penalty.'), L('Join consulting work whenever you accept an offer. Every member is also a consultant.'),
    lead ? L('Create projects, programs and routines in {d}.', {d: esc(d ? d.short : 'DWDG')}) : L('Co-Directors and above create projects. Ask yours when you need one.')];
  return {crumb: crumbOf(L('Welcome')), content: `<div class="page acct acct-wel">
    <div class="acct-ph">${av(m.id, 'av-xl')}<div><h1 class="t-title">${L('Welcome to dwdg’ONE, {name}', {name: esc(m.first)})}</h1><p class="sub">${L('You’re in. Here is your place in DWDG UII and what to do first.')}</p></div></div>
    ${sec(L('Your membership'))}${meta([[L('Organization'), 'DWDG UII'], [L('Batch'), '2026'], [L('Workspace'), d ? `${bicon(d.icon, false)}${esc(d.name)}` : L('Presidency, all workspaces')], [L('Role'), `${idl(m)} ${esc(roleLabel(m))}`],
      [L('Consultant function'), L('Yes, like every member')], inv ? [L('Invited by'), byAt(inv.createdBy, inv.createdAt)] : null, inv && inv.approvedBy ? [L('Approved by'), byAt(inv.approvedBy, inv.approvedAt)] : null])}
    <p class="t-small t-mute">${L('Your role comes from your membership. Only an appointment changes it, never a task.')}</p>
    ${sec(L('Four words you will see'))}<div class="acct-words">${words.map(([w, ic, t]) => `<div class="quiet acct-word">${icon(ic)}<b>${L(w)}</b><p>${L(t)}</p></div>`).join('')}</div>
    ${sec(L('What you can do'))}<ul class="acct-delta">${cando.map(x => `<li>${icon('check', 'ic-sm')}<span>${x}</span></li>`).join('')}</ul>
    ${sec(L('Your onboarding'), obT.length || null)}${obT.length ? `<div class="rows">${obT.map(t => typeof taskRow === 'function' ? taskRow(t, {owner: true}) : esc(t.title)).join('')}</div>` : `<p class="t-small t-mute">${L('HR adds your onboarding checklist. It appears in My Work as tasks with owners and dates.')}</p>`}
    ${sec(L('Profile and preferences'))}<div class="setbox">
      <div class="setrow"><div class="pp">${av(m.id, 'av-lg')}<div><b>${esc(m.name)}</b><small>${L('Your photo and name come from your Google account.')}</small></div></div></div>
      <div class="setrow acct-pf"><div><b>LinkedIn</b><small>${L('Optional. Shown on your person panel.')}</small></div><div class="setctl"><input class="input" data-pf="linkedin" aria-label="LinkedIn" value="${esc(m.linkedin || '')}" placeholder="linkedin.com/in/…"></div></div>
      <div class="setrow acct-pf"><div><b>${L('Phone')}</b><small>${L('Optional. You can hide it from others.')}</small></div><div class="setctl"><input class="input" data-pf="phone" aria-label="${esc(L('Phone'))}" value="${esc(m.phone || '')}" placeholder="+62…"></div></div>
      <div class="setrow"><div><b>${L('Language')}</b><small>${L('Only changes the interface.')}</small></div><div class="setctl"><div class="seg" role="radiogroup" aria-label="${esc(L('Language'))}"><button class="${lang() === 'en' ? 'on' : ''}" data-act="lang" data-l="en" role="radio" aria-checked="${lang() === 'en'}">English</button><button class="${lang() === 'id' ? 'on' : ''}" data-act="lang" data-l="id" role="radio" aria-checked="${lang() === 'id'}">Bahasa Indonesia</button></div></div></div>
      <div class="setrow"><div><b>${L('Theme')}</b></div><div class="setctl"><div class="seg" role="radiogroup" aria-label="${esc(L('Theme'))}">${['system', 'light', 'dark'].map(t => `<button class="${th === t ? 'on' : ''}" data-act="theme" data-t="${t}" role="radio" aria-checked="${th === t}">${L(t === 'system' ? 'System' : t === 'light' ? 'Light' : 'Dark')}</button>`).join('')}</div></div></div></div>
    <div class="acts acct-wel-a"><button class="btn btn-pri" data-act="acct-welcome-done">${L('Open My Work')}</button>${d ? `<a class="btn" href="#/projects" data-act="acct-welcome-done" data-h="projects">${L('See {d} projects', {d: esc(d.short)})}</a>` : ''}</div></div>`};
};

// ---------- sign-in screens: invitation link, paused or ended accounts, waiting text (security_auth, access_revocation) ----------
const BLOCKED = ['suspended', 'left', 'alumni', 'declined'];
{ const s0 = signIn;
  signIn = function () {
    const r = route(); if (r.page === 'invite') return invitePublic(r.id);
    const b = person(session.blocked || session.me); if (b && BLOCKED.includes(b.status)) {
      const t = {suspended: ['Your access is paused', 'An authorized leader paused this account. Ask your Director or HR if you think this is a mistake.'], left: ['Your membership has ended', 'Your work stays in DWDG UII under your name. This account can no longer open the workspace.'], alumni: ['Your term has ended', 'Thank you for your work. Alumni access is not set up yet, so this account can’t open the workspace.'], declined: ['Your membership was not approved', 'Ask the person who invited you. Nothing from the organization is shown to this account.']}[b.status];
      return `<div class="signin"><div class="sheet card"><div class="lock">${A.wordmark}</div><h1 class="t-h2" style="margin:22px 0 6px">${L(t[0])}</h1><p>${L(t[1])}</p><button class="btn gbtn" data-act="signout">${L('Use another account')}</button></div></div>`; }
    const extra = acct().invites.map(i => i.person).filter(id => id && person(id) && !PERSONAS_EXTRA.includes(id) && !['sekar'].includes(id));
    PERSONAS_EXTRA.push(...extra); let out; try { out = s0(); } finally { extra.forEach(id => PERSONAS_EXTRA.splice(PERSONAS_EXTRA.indexOf(id), 1)); }
    return out.replace(L('Prototype: approve from Settings when signed in as Mahdy.'), L('Prototype: sign in as Mahdy (Admin) and open Members, then Invitations, to approve.')); }; }
{ const p0 = ACT.pick; ACT.pick = (el, id, e) => { const p = person(id); if (p && BLOCKED.includes(p.status)) { session.blocked = id; session.picking = false; saveSession(); render(); return; }
  p0(el, id, e); if (needsWelcome(p)) go('welcome'); }; }
// Settings keeps its own approve buttons (plan.js); the invitation record follows whichever screen the Admin uses.
{ const a0 = ACT.approve; if (a0) ACT.approve = (el, id, e) => { const i = acct().invites.find(x => x.person === id && x.state === 'accepted'); a0(el, id, e); if (i) { const ok = el.dataset.r === 'approve'; finishApproval(i, ok, ''); save(); render(); } }; }
function finishApproval(i, ok, why) {
  const p = person(i.person), a = acct(); i.state = ok ? 'active' : 'declined'; i.approvedBy = ok ? session.me : null; i.approvedAt = ok ? nowStamp() : null;
  i.history.unshift({at: nowStamp(), by: session.me, verb: ok ? 'approved the member' : 'did not approve the member', note: why});
  if (ok) { p.joined = p.joined || today(); if (p.div && !a.memberships.some(x => x.person === p.id && !x.to)) a.memberships.push({id: uid('ms'), person: p.id, div: p.div, from: today(), to: null, by: session.me});
    logChange(p.div, 'approved the membership of', memberLink(p)); upd(p.id, 'acct-approved', 'welcome', L('Welcome')); }
  alog(ok ? 'approved the member' : 'did not approve the member', p, {reason: why, ref: `invites/${i.id}`});
  if (session.waiting === p.id) session.waiting = null;
}

// ---------- pages and navigation ----------
PAGES.members = r => r.id === 'audit' ? auditPage() : r.id && ['transfer', 'pause', 'leave'].includes(r.sub) ? flowPage(r.sub, r.id) : r.id ? memberPage(r.id) : membersList();
PAGES.invites = r => { if (ui.acctPend) { ui.insp = ui.acctPend; ui.acctPend = null; } else if (r.id && invOf(r.id) && ui.acctSeen !== r.id) { ui.acctSeen = r.id; ui.insp = {type: 'acct-inv', id: r.id}; } return invitesPage(); };
PAGES.appointments = () => appointmentsPage();
PAGES.handover = () => handoverPage();
function auditPage() {
  const m = me(), a = acct(); if (!canAudit(m)) return deniedOut(crumbOf(L('Account audit')));
  return {crumb: crumbOf(`<a href="#/members">${L('Members')}</a>`, L('Account audit')), content: `<div class="page acct">${head(L('Account audit'), L('Invitations, approvals, moves, pauses, appointments and handovers, with reasons. Only the Admin and the President see this.'))}${tabs('members/audit')}
    <div class="feed">${a.log.map(e => `<div class="chg">${e.actor ? av(e.actor, 'av-sm') : ''}<div class="chg-t"><b>${esc(pname(e.actor))}</b> ${esc(L(e.verb))} ${e.actor === e.person ? '' : e.ref ? `<a class="rec" href="#/${esc(e.ref)}">${esc(e.name)}</a>` : esc(e.name)}${e.detail ? ` <span class="t-mute">${esc(L(e.detail))}</span>` : ''}${e.reason ? `<div class="diff"><span class="tag tag-outline">${esc(L(e.reason))}</span></div>` : ''}</div><time>${dShort(e.at.slice(0, 10))} ${e.at.slice(11, 16)}</time></div>`).join('') || `<div class="empty-inline">${L('Nothing recorded yet.')}</div>`}</div>
    <p class="t-small t-mute hint">${L('Workspace Changes show only that something changed. Reasons and private details stay here.')}</p></div>`};
}
(CAPS['*'] = CAPS['*'] || []).push(['members', 'person', 'Members', p => canMembers(p)]);
if (typeof UPD === 'object') Object.assign(UPD, {'acct-accepted': '{who} accepted an invitation. It needs approval', 'acct-approved': '{who} approved your membership. Welcome', 'acct-moved': '{who} moved you to another division',
  'acct-appointed': '{who} appointed you to a new role', 'acct-appt-ended': '{who} recorded the end of your role', 'acct-ho': '{who} nominated you as the next President', 'acct-ho-rec': '{who} started an emergency presidency recovery naming you',
  'acct-ho-yes': '{who} accepted the presidency nomination', 'acct-ho-no': '{who} declined the presidency nomination', 'acct-ho-done': '{who} completed the presidency handover'});

// ---------- form state ----------
document.addEventListener('input', e => { const k = e.target.dataset && e.target.dataset.acct; if (k) F()[k] = e.target.type === 'checkbox' ? e.target.checked : e.target.value; });
document.addEventListener('change', e => { const t = e.target, k = t.dataset && t.dataset.acct; if (!k) return; F()[k] = t.type === 'checkbox' ? t.checked : t.value; if (t.dataset.rerender) render(); });
ON_CHANGE['acct-md'] = el => { ui.acctMd = el.value; render(); };

// ---------- actions ----------
const openInv = id => { ui.insp = {type: 'acct-inv', id}; ui.form = null; render(); };
const invHist = (i, verb, note = '') => i.history.unshift({at: nowStamp(), by: session.me, verb, note});
Object.assign(ACT, {
  'acct-mf': el => { ui.acctMf = el.dataset.k; render(); },
  'acct-if': el => { ui.acctIf = el.dataset.k; render(); },
  'acct-lk': el => { F().lk = el.dataset.k; render(); },
  'acct-apply': (el, id) => applyFlow(el.dataset.k, person(id)),
  'acct-restore': (el, id) => { const p = person(id), c = can('restore', me(), p); if (!c.ok) return toast(c.why); const prev = p.status, why = (F().rsnote || '').trim();
    p.status = 'active'; const last = acct().actions.find(x => x.person === p.id && x.kind === 'pause' && x.state === 'applied'); if (last) { last.restoredBy = session.me; last.restoredAt = nowStamp(); }
    alog('restored access for', p, {reason: why, ref: `members/${p.id}`}); logChange(p.div, 'restored access for', memberLink(p)); ui.form = null; ui.acctF = {}; save(); render();
    toast(L('{who} can sign in again', {who: p.first}), () => { p.status = prev; alog('reversed', p, {detail: L('Restore access')}); logChange(p.div, 'reversed an account change for', memberLink(p)); rerender(); }); },
  'acct-inv-new': () => { ui.acctFk = null; fk('inv-new'); ui.form = null; if (route().page !== 'invites') { ui.acctPend = {type: 'acct-inv-new'}; go('invites'); } else { ui.insp = {type: 'acct-inv-new'}; render(); } setTimeout(() => { const x = $('#acct-in-name'); if (x) x.focus(); }, 0); },
  'acct-inv-open': (el, id, e) => { if (e) e.preventDefault(); if (route().page !== 'invites') { location.hash = '#/invites/' + id; return; } openInv(id); },
  // Repeated submission never makes a second invitation or person; an existing member goes through a move or an appointment instead (flow-invite-review 2).
  'acct-inv-create': () => { const m = me(), a = acct(), f = F(); if (!reviewer(m)) return;
    const name = (f.name || '').trim(), email = (f.email || '').trim().toLowerCase();
    if (!name) return invalid('#acct-in-name', L('Write the person’s name.'));
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(email)) return invalid('#acct-in-mail', L('Enter a full Google account address.'));
    const dupInv = a.invites.find(i => i.email.toLowerCase() === email && ['pending', 'accepted'].includes(invState(i)));
    if (dupInv) return invalid('#acct-in-mail', L('{who} already has an open invitation for this address. Open it from the list instead.', {who: dupInv.name}));
    const dupP = db.people.find(p => p.status !== 'declined' && mailOf(p).toLowerCase() === email);
    if (dupP) return invalid('#acct-in-mail', L('{who} is already a member with this account. Use a move or an appointment instead.', {who: dupP.name}));
    const same = db.people.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (same && f.dupName !== same.name) { f.dupName = same.name; render(); return; }
    const i = {id: uid('inv-'), name, email, div: f.div || 'sng', role: 'member', batch: '2026', expires: addDays(today(), +(f.exp || 14)), state: 'pending', person: null, delivery: null, createdBy: m.id, createdAt: nowStamp(), acceptedAt: null, acceptedAs: null, approvedBy: null, approvedAt: null, revokedBy: null, revokedAt: null, reason: '', version: 1, history: []};
    invHist(i, 'created the invitation'); a.invites.push(i); alog('created the invitation', null, {name, ref: `invites/${i.id}`}); ui.acctIf = 'open'; ui.acctF = {}; save(); openInv(i.id);
    toast(L('Invitation ready. Copy the link and send it yourself.'), () => { i.state = 'revoked'; i.revokedBy = session.me; i.revokedAt = nowStamp(); i.reason = 'Undone'; invHist(i, 'revoked the invitation', 'Undone'); rerender(); }); },
  'acct-inv-copy': (el, id) => { const i = invOf(id), url = `${location.href.split('#')[0]}#/invite/${i.id}`; try { navigator.clipboard.writeText(url).catch(() => {}); } catch (e) { /* clipboard unavailable: the toast still shows the link */ }
    i.delivery = {by: session.me, at: nowStamp()}; invHist(i, 'copied the invitation link'); save(); render(); toast(L('Link copied. dwdg’ONE doesn’t send email yet, so send it yourself.')); },
  'acct-inv-edit': (el, id) => { const i = invOf(id); ui.acctFk = 'inv:' + id; ui.acctF = {ename: i.name, eemail: i.email, ediv: i.div}; ui.form = 'inv-edit'; render(); },
  'acct-inv-fix': (el, id) => { const i = invOf(id), f = F(), prev = {name: i.name, email: i.email, div: i.div, version: i.version}; if (invState(i) !== 'pending') return toast(L('Only an invitation nobody accepted can be corrected.'));
    const email = (f.eemail || '').trim().toLowerCase(); if (!(f.ename || '').trim()) return invalid('#acct-ie-name', L('Write the person’s name.')); if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(email)) return invalid('#acct-ie-mail', L('Enter a full Google account address.'));
    Object.assign(i, {name: f.ename.trim(), email, div: f.ediv || i.div, version: i.version + 1, delivery: null}); invHist(i, 'corrected the invitation', prev.email !== email ? `${prev.email} → ${email}` : ''); ui.form = null; save(); render();
    toast(L('Corrected. The old link no longer works.'), () => { Object.assign(i, prev); invHist(i, 'reversed a correction'); rerender(); }); },
  'acct-inv-revoke': (el, id) => { const i = invOf(id), why = (F().rwhy || '').trim(); if (!why) return invalid('#acct-ir-why', L('Say why, so the next person knows.'));
    const prev = {state: i.state}; Object.assign(i, {state: 'revoked', revokedBy: session.me, revokedAt: nowStamp(), reason: why}); invHist(i, 'revoked the invitation', why); alog('revoked the invitation', null, {name: i.name, reason: why, ref: `invites/${i.id}`}); ui.form = null; ui.acctF = {}; save(); render();
    toast(L('Revoked. The link never works again.'), () => { i.state = prev.state; i.revokedBy = null; invHist(i, 'reversed revoking'); rerender(); }); },
  'acct-inv-renew': (el, id) => { const i = invOf(id); i.expires = addDays(today(), 14); i.state = 'pending'; i.version++; i.delivery = null; invHist(i, 'renewed the invitation'); save(); render(); toast(L('Renewed until {d}. Copy the new link.', {d: dShort(i.expires)})); },
  'acct-approve': (el, id) => { const i = invOf(id); if (!isAdmin(me()) || invState(i) !== 'accepted') return toast(L('Only the Admin approves members.')); const p = person(i.person), prevP = {status: p.status, joined: p.joined};
    p.status = 'active'; finishApproval(i, true, ''); save(); render(); toast(L('{who} can now sign in', {who: p.name}), () => { Object.assign(p, prevP); i.state = 'accepted'; i.approvedBy = null; invHist(i, 'reversed the approval'); logChange(p.div, 'reversed an account change for', memberLink(p)); rerender(); }); },
  'acct-decline': (el, id) => { const i = invOf(id), why = (F().dwhy || '').trim(); if (!isAdmin(me())) return; if (!why) return invalid('#acct-id-why', L('Say why, for the record.')); const p = person(i.person);
    p.status = 'declined'; finishApproval(i, false, why); ui.form = null; save(); render(); toast(L('{who} was not approved', {who: p.name})); },
  'acct-inv-try': (el, id) => { session = {theme: session.theme, lang: session.lang}; saveSession(); ui.insp = null; ui.form = null; location.hash = '#/invite/' + id; render(); },
  'acct-inv-google': (el, id) => { session.inv = {id}; saveSession(); render(); },
  'acct-inv-as': el => { session.inv = {id: el.dataset.id, as: el.dataset.as}; saveSession(); render(); },
  'acct-inv-reset': (el, id) => { session.inv = id ? {id} : null; saveSession(); render(); },
  'acct-inv-switch': (el, id) => { session = {theme: session.theme, lang: session.lang}; saveSession(); ui.insp = null; if (id) location.hash = '#/invite/' + id; else location.hash = '#/work'; render(); },
  // The server rechecks the invitation at commit, so a revoke that wins the race leaves no membership (flow-accept-race 7).
  'acct-inv-accept': (el, id) => { const i = invOf(id); if (!i || invState(i) !== 'pending' || !session.inv || session.inv.as !== 'invitee') { session.inv = null; saveSession(); render(); return; }
    const p = {id: uid('m-'), name: i.name, first: i.name.split(' ')[0], div: i.div, role: i.role, photo: null, title: '', admin: false, hasSchedule: false, gcal: false, status: 'pending', email: i.email, joined: null, linkedin: null, phone: null, hidePhone: false};
    db.people.push(p); Object.assign(i, {state: 'accepted', person: p.id, acceptedAt: nowStamp(), acceptedAs: i.email}); i.history.unshift({at: nowStamp(), by: p.id, verb: 'accepted the invitation', note: ''});
    acct().log.unshift({id: uid('al'), at: nowStamp(), actor: p.id, person: p.id, name: p.name, verb: 'accepted the invitation', reason: '', ref: `invites/${i.id}`});
    const s = session.me; session.me = p.id; [...admins().map(x => x.id), i.createdBy].forEach(to => upd(to, 'acct-accepted', `invites/${i.id}`, p.name)); session.me = s;
    session = {theme: session.theme, lang: session.lang, waiting: p.id}; saveSession(); save(); location.hash = '#/work'; render(); },
  'acct-welcome-done': (el, id, e) => { if (e) e.preventDefault(); const m = me(); m.welcomedAt = nowStamp(); save(); go(el.dataset.h || 'work'); },
  'acct-appt-new': (el, id) => { ui.acctFk = null; ui.insp = {type: 'acct-appt', id}; ui.form = null; render(); },
  'acct-appt-save': (el, k) => { const m = me(), a = acct(), f = F(), c = canAppoint(m, k); if (!c.ok) return toast(c.why); const o = OFFICE(k), tgt = person(f.who), why = (f.why || '').trim(), date = f.date || today();
    if (!tgt) return invalid('#acct-ap-who', L('Choose who is appointed.')); if (!why) return invalid('#acct-ap-why', L('Give the reason, for the record.'));
    const pred = holders(k)[0]; if (pred && !pred.div && !f.after) return invalid('#acct-ap-after', L('Choose a division for {who}.', {who: pred.first}));
    const g = {id: uid('g'), person: tgt.id, role: o.role, unit: o.unit, title: '', from: date, to: null, by: m.id, at: nowStamp(), reason: why, predecessor: pred ? pred.id : null, state: date > today() ? 'scheduled' : 'active'};
    a.grants.push(g); const snap = [tgt, pred].filter(Boolean).map(p => [p, {role: p.role, div: p.div, title: p.title}]), ended = [];
    if (g.state === 'active') {
      a.grants.filter(x => x !== g && x.state === 'active' && x.role !== 'admin' && (x.person === tgt.id || (pred && x.person === pred.id && x.role === o.role))).forEach(x => { x.state = 'ended'; x.to = date; ended.push(x); });
      if (pred) { pred.role = 'member'; pred.title = ''; if (!pred.div) pred.div = f.after; }
      tgt.role = o.role; tgt.title = ''; if (o.role === 'vp') { tgt.div = null; a.memberships.filter(x => x.person === tgt.id && !x.to).forEach(x => { x.to = date; ended.push(x); }); }
      if (o.unit) logChange(o.unit, 'appointed a new Director:', memberLink(tgt)); upd(tgt.id, 'acct-appointed', `members/${tgt.id}`, o.label); if (pred) upd(pred.id, 'acct-appt-ended', `members/${pred.id}`, o.label);
    }
    alog(g.state === 'active' ? 'appointed' : 'scheduled an appointment for', tgt, {detail: o.label, reason: why, ref: `members/${tgt.id}`}); ui.insp = null; ui.acctF = {}; save(); render();
    toast(g.state === 'active' ? L('{who} is now {o}', {who: tgt.first, o: o.label}) : L('Scheduled for {d}', {d: fmtD(date)}), () => { snap.forEach(([p, v]) => Object.assign(p, v)); g.state = 'reversed'; ended.forEach(x => { x.state = 'active'; x.to = null; }); alog('reversed an appointment of', tgt, {detail: o.label}); if (o.unit) logChange(o.unit, 'reversed an appointment of', memberLink(tgt)); rerender(); }); },
  'acct-ho-start': el => { const m = me(), a = acct(), f = F(), kind = el.dataset.k, pres = president(), to = person(f.to);
    if (kind === 'normal' && (!pres || pres.id !== m.id)) return toast(L('Only the incumbent President starts a normal handover.'));
    if (kind === 'recovery' && !isAdmin(m)) return toast(L('Only the Admin starts an emergency recovery.'));
    if (openHo()) return toast(L('A handover is already open. Finish or cancel it first.'));
    if (kind === 'recovery') { if (!f.ist) return invalid('#acct-hr-st', L('Choose what happened to the President’s account.'));
      if (f.ist === 'paused' && pres.status !== 'suspended') return invalid('#acct-hr-st', L('{who}’s account is active. Pause it first, or choose Unavailable and give evidence.', {who: pres.first}));
      if (!(f.why || '').trim()) return invalid('#acct-hr-why', L('Give the reason.')); if (f.ist !== 'paused' && !(f.ev || '').trim()) return invalid('#acct-hr-ev', L('Add an evidence reference.')); }
    if (!to) return invalid('#acct-ho-to', L('Choose the successor.')); if (!f.after) return invalid('#acct-ho-after', L('Choose a division for {who}.', {who: pres.first}));
    const h = {id: uid('ho'), kind, from: pres.id, to: to.id, state: 'nominated', effective: f.date || today(), after: f.after, note: (f.note || '').trim(), ist: f.ist || null, reason: (f.why || '').trim(), ev: (f.ev || '').trim(), version: a.office.version, createdBy: m.id, createdAt: nowStamp(), answeredAt: null};
    a.handovers.push(h); alog(kind === 'recovery' ? 'started an emergency presidency recovery naming' : 'nominated a successor:', to, {reason: h.reason, ref: 'handover'}); upd(to.id, kind === 'recovery' ? 'acct-ho-rec' : 'acct-ho', 'handover', L('Presidency'));
    ui.form = null; ui.acctF = {}; save(); render(); toast(L('Sent to {who}. Nothing changes until they answer.', {who: to.first}), () => { h.state = 'cancelled'; alog('canceled a presidency handover for', to); rerender(); }); },
  'acct-ho-answer': (el, id) => { const h = acct().handovers.find(x => x.id === id), yes = el.dataset.r === 'yes'; if (!h || h.to !== session.me || h.state !== 'nominated') return;
    h.state = yes ? 'accepted' : 'declined'; h.answeredAt = nowStamp(); h.reply = (F().dwhy || '').trim(); alog(yes ? 'accepted the presidency nomination' : 'declined the presidency nomination', person(h.to), {ref: 'handover'});
    upd(h.createdBy, yes ? 'acct-ho-yes' : 'acct-ho-no', 'handover', L('Presidency')); ui.form = null; save(); render(); toast(yes ? L('Accepted. {who} confirms next.', {who: first(h.kind === 'recovery' ? h.createdBy : h.from)}) : L('Declined. {who} was told.', {who: first(h.createdBy)})); },
  'acct-ho-fresh': (el, id) => { (ui.acctFresh = ui.acctFresh || {})[id] = true; render(); },
  'acct-ho-cancel': (el, id) => { const h = acct().handovers.find(x => x.id === id); if (!h) return; h.state = 'cancelled'; alog('canceled a presidency handover for', person(h.to), {ref: 'handover'}); upd(h.to, 'acct-ho-no', 'handover', L('Presidency')); save(); render(); toast(L('Handover canceled')); },
  // Stale or concurrent confirmations leave at most one President (S004 acceptance 2): the office record number must still match.
  'acct-ho-confirm': (el, id) => { const a = acct(), h = a.handovers.find(x => x.id === id), m = me(); if (!h || h.state !== 'accepted') return;
    if (!(ui.acctFresh || {})[id]) return toast(L('Sign in again first.'));
    if ((h.kind === 'normal' && (president() || {}).id !== m.id) || (h.kind === 'recovery' && !isAdmin(m))) return toast(L('Only the incumbent or, in recovery, the Admin confirms.'));
    if (h.version !== a.office.version || (president() || {}).id !== h.from) { h.state = 'superseded'; save(); render(); return toast(L('Out of date: the presidency changed since this started. Nothing was transferred.')); }
    applyPresidency(h); delete ui.acctFresh[id]; save(); if (canHoView(me())) render(); else go('work'); toast(L('{who} is President now', {who: first(h.to)})); },
});
// Board accounts never reach these screens (canMembers is false); perf.js also blocks their writes. Changes entries carry their route in target.h.

// ---------- Indonesian (formal "Anda", D7) ----------
Object.assign(window.ID_DICT, {
  'Members': 'Anggota', 'Invitations': 'Undangan', 'Appointments': 'Pengangkatan', 'Presidency': 'Presidium', 'Account audit': 'Audit akun', 'Accounts': 'Akun',
  'the Admin grant': 'hak Admin', 'Not available.': 'Tidak tersedia.', 'Board accounts are read-only.': 'Akun Dewan Pengawas hanya dapat membaca.', 'You can’t do this to your own account.': 'Anda tidak dapat melakukan ini pada akun Anda sendiri.',
  'HR leads and the Admin move members between divisions.': 'Pimpinan HR dan Admin yang memindahkan anggota antardivisi.', 'Only active members can be moved.': 'Hanya anggota aktif yang dapat dipindahkan.',
  '{who} holds a role. Role holders change through an appointment, not a transfer.': '{who} memegang jabatan. Pemegang jabatan berubah melalui pengangkatan, bukan pemindahan.',
  'Only active accounts can be paused.': 'Hanya akun aktif yang dapat dijeda.', 'This account is not paused.': 'Akun ini tidak sedang dijeda.', 'Directors and above pause or restore access.': 'Direktur ke atas yang menjeda atau memulihkan akses.',
  '{who} holds {role}, which is above you. Nobody can pause someone with higher authority.': '{who} memegang {role}, yang berada di atas Anda. Tidak ada yang dapat menjeda orang dengan wewenang lebih tinggi.',
  'Same rank. Whether equals can pause each other is not decided yet, so the President or the Admin does this.': 'Jabatan setara. Apakah jabatan setara boleh saling menjeda belum diputuskan, jadi Presiden atau Admin yang melakukannya.',
  '{who} is outside your reporting scope. The President or the Admin can do this.': '{who} berada di luar cakupan pelaporan Anda. Presiden atau Admin dapat melakukannya.',
  'HR leads and the Admin end memberships.': 'Pimpinan HR dan Admin yang mengakhiri keanggotaan.', 'This membership has already ended.': 'Keanggotaan ini sudah berakhir.',
  'The President leaves office through a presidency handover first.': 'Presiden meninggalkan jabatan melalui serah terima presidium terlebih dahulu.', 'The Admin grant needs an agreed successor first. That rule is not decided yet.': 'Hak Admin memerlukan pengganti yang disepakati terlebih dahulu. Aturan itu belum diputuskan.',
  '{who} holds {role}. You can only end memberships below your own rank.': '{who} memegang {role}. Anda hanya dapat mengakhiri keanggotaan di bawah jabatan Anda.',
  'Recorded at setup': 'Dicatat saat penyiapan', 'Not recorded': 'Belum dicatat', 'Optional': 'Opsional',
  'Active': 'Aktif', 'Waiting for approval': 'Menunggu persetujuan', 'Access paused': 'Akses dijeda', 'Left DWDG': 'Keluar dari DWDG', 'Alumni': 'Alumni', 'Not approved': 'Tidak disetujui', 'Unknown': 'Tidak diketahui',
  'Not accepted yet': 'Belum diterima', 'Accepted, waiting for approval': 'Diterima, menunggu persetujuan', 'Member is active': 'Anggota aktif', 'Expired': 'Kedaluwarsa', 'Revoked': 'Dicabut',
  'Current': 'Berlaku', 'Ended': 'Berakhir', 'Scheduled': 'Terjadwal', 'Reversed': 'Dibatalkan', 'Waiting for the successor': 'Menunggu penerus', 'Accepted, waiting for confirmation': 'Diterima, menunggu konfirmasi', 'Declined': 'Ditolak', 'Completed': 'Selesai', 'Canceled': 'Dibatalkan', 'Out of date': 'Kedaluwarsa',
  'Admin': 'Admin', '{r} of {d}': '{r} {d}', 'Keep with {who}': 'Tetap pada {who}', 'Leave unresolved, visible to leads': 'Biarkan belum terselesaikan, terlihat oleh pimpinan', 'Offer to {who}': 'Tawarkan ke {who}', 'due {d}': 'tenggat {d}',
  'Ask {who} to review': 'Minta {who} meninjau', 'Review for {who}': 'Tinjauan untuk {who}', 'Kept. Roles across divisions stay as explicit collaboration; review them with the lead.': 'Tetap. Peran lintas divisi tetap sebagai kolaborasi eksplisit; tinjau bersama pimpinannya.',
  'Unresolved until the lead or Director names a successor.': 'Belum terselesaikan sampai pimpinan atau Direktur menunjuk pengganti.', '{who} has no open duties recorded in dwdg’ONE.': '{who} tidak memiliki tugas terbuka yang tercatat di dwdg’ONE.',
  'Tasks {who} is responsible for': 'Tugas yang menjadi tanggung jawab {who}', 'Reviews waiting for {who}': 'Tinjauan yang menunggu {who}', 'Tasks {who} shares': 'Tugas yang dibagi {who}', 'Responsible: {who}. The responsible person stays the same.': 'Penanggung jawab: {who}. Penanggung jawab tetap sama.',
  'Projects {who} leads or manages': 'Proyek yang dipimpin atau dikelola {who}', 'Decisions waiting for {who}': 'Keputusan yang menunggu {who}', 'Routines {who} runs': 'Rutinitas yang dijalankan {who}', 'Resources {who} looks after': 'Sumber daya yang dijaga {who}',
  'Offers waiting for {who}’s answer': 'Tawaran yang menunggu jawaban {who}', 'From {who}. Still unanswered; it never counts as accepted.': 'Dari {who}. Belum dijawab; tidak pernah dianggap diterima.',
  'Nothing is completed, deleted or reassigned on its own. An offer waits until the new person accepts it.': 'Tidak ada yang selesai, terhapus, atau dialihkan dengan sendirinya. Tawaran menunggu sampai orang baru menerimanya.',
  'Account state': 'Status akun', 'Waiting': 'Menunggu', 'Paused': 'Dijeda', 'Former': 'Mantan', 'Division': 'Divisi', 'All divisions': 'Semua divisi', '{n} unresolved': '{n} belum terselesaikan',
  'Hidden accounts': 'Akun tersembunyi', 'IT operations account': 'Akun operasional TI', 'Hidden from search, pickers, the directory and exports. Only the Admin sees it here.': 'Tersembunyi dari pencarian, pemilih orang, direktori, dan ekspor. Hanya Admin yang melihatnya di sini.', 'Powers not decided': 'Wewenang belum diputuskan',
  'Everyone in DWDG UII, batch 2026. Accounts, roles and membership changes.': 'Semua anggota DWDG UII, angkatan 2026. Akun, jabatan, dan perubahan keanggotaan.', '{d} only. Pausing access works below your own rank.': 'Hanya {d}. Penjedaan akses berlaku di bawah jabatan Anda.',
  'Invite someone': 'Undang seseorang', '{n} person has duties left unresolved': '{n} orang memiliki tugas yang belum terselesaikan', '{n} people have duties left unresolved': '{n} orang memiliki tugas yang belum terselesaikan',
  'Nobody here': 'Tidak ada orang di sini', 'New members appear here after they accept an invitation.': 'Anggota baru muncul di sini setelah menerima undangan.', 'No account is paused.': 'Tidak ada akun yang dijeda.', 'No one has left or become alumni yet.': 'Belum ada yang keluar atau menjadi alumni.', 'Nobody matches this filter.': 'Tidak ada yang cocok dengan saringan ini.',
  'One person record for each member. A move, a pause or leaving never deletes their work or history.': 'Satu catatan orang untuk setiap anggota. Pemindahan, penjedaan, atau keluar tidak pernah menghapus pekerjaan atau riwayatnya.',
  'Person': 'Orang', 'Move to another division': 'Pindahkan ke divisi lain', 'Preview open duties first. Their history stays with the old division.': 'Pratinjau tugas terbuka terlebih dahulu. Riwayatnya tetap di divisi lama.',
  'Pause access': 'Jeda akses', 'Stops sign-in and every function. Work and history stay.': 'Menghentikan masuk dan semua fungsi. Pekerjaan dan riwayat tetap ada.', 'Restore access': 'Pulihkan akses', 'Lets them sign in again. Roles that ended meanwhile stay ended.': 'Mengizinkan masuk kembali. Jabatan yang berakhir selama itu tetap berakhir.',
  'End membership': 'Akhiri keanggotaan', 'Leaving DWDG or becoming alumni at the end of a term.': 'Keluar dari DWDG atau menjadi alumni di akhir periode.', 'Not available to you': 'Tidak tersedia untuk Anda',
  'Note': 'Catatan', 'Recorded in the account audit.': 'Dicatat di audit akun.', 'Restore {who}’s access': 'Pulihkan akses {who}', 'Cancel': 'Batal',
  'Access paused since {d}': 'Akses dijeda sejak {d}', 'By {who}.': 'Oleh {who}.', 'Reason restricted': 'Alasan dibatasi', 'Alumni since {d}': 'Alumni sejak {d}', 'Left DWDG on {d}': 'Keluar dari DWDG pada {d}',
  'Their work and authorship stay under their name. Current access has ended.': 'Pekerjaan dan kepengarangannya tetap atas namanya. Akses saat ini telah berakhir.', 'Waiting for the Admin to approve': 'Menunggu persetujuan Admin', 'Signing in alone never gives access.': 'Masuk saja tidak pernah memberi akses.', 'Open the invitation': 'Buka undangan',
  'Membership': 'Keanggotaan', 'Organization': 'Organisasi', 'Batch': 'Angkatan', 'Workspace': 'Ruang kerja', 'Presidency, all workspaces': 'Presidium, semua ruang kerja', 'Role': 'Jabatan', 'Consultant function': 'Fungsi konsultan',
  'Yes, like every member. It stays through any move.': 'Ya, seperti setiap anggota. Tetap ada pada setiap pemindahan.', 'Joined': 'Bergabung', 'Google account': 'Akun Google', 'Invited by': 'Diundang oleh', 'Approved by': 'Disetujui oleh',
  'Account actions': 'Tindakan akun', 'Appoint to a role': 'Angkat ke jabatan', 'Roles change only through a dated appointment. A task never promotes anyone.': 'Jabatan hanya berubah melalui pengangkatan bertanggal. Tugas tidak pernah menaikkan jabatan siapa pun.', 'Open appointments': 'Buka pengangkatan',
  'Duties left unresolved': 'Tugas yang belum terselesaikan', 'Open duties': 'Tugas terbuka', 'Tasks': 'Tugas', 'Reviews': 'Tinjauan', 'Projects led': 'Proyek yang dipimpin', 'Decisions': 'Keputusan', 'Routines': 'Rutinitas', 'Resources': 'Sumber daya', 'Offers unanswered': 'Tawaran belum dijawab', 'None recorded': 'Tidak ada catatan',
  'Roles': 'Jabatan', 'From {d}': 'Sejak {d}', 'Start not recorded': 'Awal belum dicatat', 'until {d}': 'sampai {d}', 'after {who}': 'menggantikan {who}', 'Member, no leadership role.': 'Anggota, tanpa jabatan pimpinan.',
  'Division membership': 'Keanggotaan divisi', 'No division membership. Presidency accounts see all workspaces.': 'Tanpa keanggotaan divisi. Akun presidium melihat semua ruang kerja.', 'Account history': 'Riwayat akun', 'No account changes recorded yet.': 'Belum ada perubahan akun yang tercatat.',
  'Attendance, assessments and authorship keep the division they were recorded in.': 'Kehadiran, penilaian, dan kepengarangan tetap pada divisi tempat dicatat.',
  'Move {who} to another division': 'Pindahkan {who} ke divisi lain', 'Move': 'Pindahkan', 'Choose the destination, then decide each open duty. Nothing changes until you apply.': 'Pilih tujuan, lalu putuskan setiap tugas terbuka. Tidak ada yang berubah sampai Anda menerapkannya.',
  'Pause {who}’s access': 'Jeda akses {who}', 'Pausing stops sign-in and every function at once. Work, records and history stay as they are.': 'Penjedaan langsung menghentikan masuk dan semua fungsi. Pekerjaan, catatan, dan riwayat tetap seperti semula.',
  'End {who}’s membership': 'Akhiri keanggotaan {who}', 'Current access ends on the date you set. Work and authorship stay under their name.': 'Akses saat ini berakhir pada tanggal yang Anda tetapkan. Pekerjaan dan kepengarangan tetap atas namanya.',
  'You can’t do this': 'Anda tidak dapat melakukan ini', 'Back': 'Kembali', 'Nothing was changed.': 'Tidak ada yang diubah.', 'From': 'Dari', 'To': 'Ke', 'Effective date': 'Tanggal berlaku', 'Reason': 'Alasan', 'For the record': 'Untuk catatan',
  'What happened and why access must stop now': 'Apa yang terjadi dan mengapa akses harus dihentikan sekarang', 'Only the Admin, the President, HR leads and you can read this. It never appears in Changes.': 'Hanya Admin, Presiden, pimpinan HR, dan Anda yang dapat membacanya. Tidak pernah muncul di Perubahan.',
  'Effective': 'Berlaku', 'Now': 'Sekarang', 'Review by': 'Ditinjau paling lambat', 'When someone looks at this again.': 'Kapan seseorang meninjaunya lagi.', 'Kind': 'Jenis', 'Leaving DWDG': 'Keluar dari DWDG', 'Alumni, end of term': 'Alumni, akhir periode', 'Last day': 'Hari terakhir', 'Private': 'Pribadi',
  'Only HR leads, the Admin and the President read this.': 'Hanya pimpinan HR, Admin, dan Presiden yang membaca ini.', 'Loses the {d} workspace: its projects, operations, resources and Changes.': 'Kehilangan ruang kerja {d}: proyek, operasional, sumber daya, dan Perubahannya.',
  'Gets the {d} workspace as a Member.': 'Mendapat ruang kerja {d} sebagai Anggota.', 'Keeps the same person record, the consultant function, accepted tasks you keep below and shared project roles.': 'Tetap memiliki catatan orang yang sama, fungsi konsultan, tugas yang Anda pertahankan di bawah, dan peran proyek bersama.',
  'Attendance, assessments and authorship stay recorded under {d}.': 'Kehadiran, penilaian, dan kepengarangan tetap tercatat di {d}.', 'Can’t sign in or use any function from now. An open session stops at its next action.': 'Tidak dapat masuk atau memakai fungsi apa pun mulai sekarang. Sesi yang terbuka berhenti pada tindakan berikutnya.',
  'Tasks, records and history stay. Nothing is completed, deleted or reassigned automatically.': 'Tugas, catatan, dan riwayat tetap ada. Tidak ada yang otomatis diselesaikan, dihapus, atau dialihkan.', 'Google Drive files shared with them need removing there; dwdg’ONE can’t revoke a shared link.': 'Berkas Google Drive yang dibagikan kepadanya perlu dicabut di sana; dwdg’ONE tidak dapat mencabut tautan bersama.',
  'Current access ends on the last day.': 'Akses saat ini berakhir pada hari terakhir.', 'Their name stays on everything they did. History is never erased.': 'Namanya tetap pada semua yang ia kerjakan. Riwayat tidak pernah dihapus.',
  'Alumni read-only access is a separate grant that is not decided yet, so none is given now.': 'Akses baca alumni adalah hak terpisah yang belum diputuskan, jadi tidak diberikan sekarang.', 'Accounts and files they own outside dwdg’ONE need a handover at the provider.': 'Akun dan berkas miliknya di luar dwdg’ONE perlu diserahterimakan di penyedianya.',
  'Move {who} to {d}': 'Pindahkan {who} ke {d}', 'Make {who} alumni': 'Jadikan {who} alumni', 'Details': 'Rincian', 'What changes for {who}': 'Apa yang berubah bagi {who}', 'Review, then apply': 'Tinjau, lalu terapkan',
  '{who} and both workspaces see a move entry. Private details are not shown.': '{who} dan kedua ruang kerja melihat catatan pemindahan. Detail pribadi tidak ditampilkan.', 'The account audit records you as the actor, with the reason. Changes shows only that access changed.': 'Audit akun mencatat Anda sebagai pelaku, beserta alasannya. Perubahan hanya menunjukkan bahwa akses berubah.',
  'Say why access must stop.': 'Jelaskan mengapa akses harus dihentikan.', 'Give a reason for the record.': 'Berikan alasan untuk catatan.', 'The prototype’s day is fixed at {d}. Choose today or earlier.': 'Hari prototipe ditetapkan pada {d}. Pilih hari ini atau sebelumnya.',
  'Handover from {who}. Nothing changes until you accept.': 'Serah terima dari {who}. Tidak ada yang berubah sampai Anda menerima.', 'moved the member': 'memindahkan anggota', 'moved a member out of the workspace:': 'memindahkan anggota keluar dari ruang kerja:', 'moved a member into the workspace:': 'memindahkan anggota ke ruang kerja:',
  '{who} moved to {d}': '{who} pindah ke {d}', 'paused access for': 'menjeda akses', '{who}’s access is paused': 'Akses {who} dijeda', 'recorded the end of term for': 'mencatat akhir periode', 'ended the membership of': 'mengakhiri keanggotaan',
  '{who} is alumni now': '{who} kini alumni', '{who}’s membership ended': 'Keanggotaan {who} berakhir', 'reversed': 'membatalkan', 'reversed an account change for': 'membatalkan perubahan akun', 'restored access for': 'memulihkan akses',
  'Invitation': 'Undangan', 'Open': 'Terbuka', 'Expired or revoked': 'Kedaluwarsa atau dicabut', 'All': 'Semua', 'Filter': 'Saring',
  'Invite only. The invited Google account accepts, then the Admin approves each member.': 'Hanya dengan undangan. Akun Google yang diundang menerima, lalu Admin menyetujui setiap anggota.', 'No invitations here': 'Tidak ada undangan di sini',
  'Invite someone with their Google account address, workspace and role.': 'Undang seseorang dengan alamat akun Google, ruang kerja, dan jabatannya.', 'HR leads and the Admin send invitations.': 'Pimpinan HR dan Admin yang mengirim undangan.',
  'dwdg’ONE doesn’t send email yet. Copy the link and send it yourself. A link never shows anything about DWDG until the right account signs in.': 'dwdg’ONE belum mengirim email. Salin tautannya dan kirim sendiri. Tautan tidak pernah menampilkan apa pun tentang DWDG sampai akun yang tepat masuk.',
  'New invitation': 'Undangan baru', 'Nothing is shared until the invited account accepts and the Admin approves.': 'Tidak ada yang dibagikan sampai akun yang diundang menerima dan Admin menyetujui.', 'Name': 'Nama', 'As the person writes it': 'Sebagaimana orang itu menuliskannya',
  'Acceptance must come from this exact account. A university domain alone is not membership.': 'Penerimaan harus dari akun ini. Domain universitas saja bukan keanggotaan.', 'Member': 'Anggota', 'Board of Supervisors (set up by the Admin, not in this prototype)': 'Dewan Pengawas (disiapkan Admin, tidak ada di prototipe ini)',
  'Leadership roles come later through an appointment.': 'Jabatan pimpinan diberikan kemudian melalui pengangkatan.', 'Link works for': 'Tautan berlaku selama', '7 days': '7 hari', '14 days': '14 hari', '30 days': '30 hari', 'Proposed default: 14 days.': 'Bawaan usulan: 14 hari.',
  '{who} already has this name': '{who} sudah memakai nama ini', 'A matching name is not proof it’s the same person. Check the Google account, then create the invitation anyway or change it.': 'Nama yang sama bukan bukti orang yang sama. Periksa akun Google, lalu tetap buat undangan atau ubah.', 'Create anyway': 'Tetap buat', 'Create invitation': 'Buat undangan',
  'This is not available to you.': 'Ini tidak tersedia untuk Anda.', 'Invited': 'Diundang', 'Accepted': 'Diterima', 'Approved': 'Disetujui', 'Saving makes a new link. The old link stops working.': 'Menyimpan membuat tautan baru. Tautan lama berhenti berfungsi.', 'Save correction': 'Simpan koreksi',
  'Why revoke it?': 'Mengapa dicabut?', 'Revoke invitation for {who}': 'Cabut undangan untuk {who}', 'Copy invitation link': 'Salin tautan undangan', 'Correct details': 'Koreksi rincian', 'Revoke': 'Cabut', 'Prototype: open the link as the invited person': 'Prototipe: buka tautan sebagai orang yang diundang',
  'Renew for 14 days': 'Perpanjang 14 hari', 'Renewing makes a new link. The expired link never works again.': 'Perpanjangan membuat tautan baru. Tautan kedaluwarsa tidak pernah berfungsi lagi.', 'Why not approve?': 'Mengapa tidak disetujui?', 'Don’t approve {who}': 'Jangan setujui {who}',
  'Approve {who}': 'Setujui {who}', 'Don’t approve': 'Jangan setujui', 'Approving opens only the {d} workspace as a Member.': 'Persetujuan hanya membuka ruang kerja {d} sebagai Anggota.', 'Waiting for the Admin to approve. Only the Admin approves members.': 'Menunggu persetujuan Admin. Hanya Admin yang menyetujui anggota.',
  'Open member': 'Buka anggota', 'This link never works again. Create a new invitation if needed.': 'Tautan ini tidak akan berfungsi lagi. Buat undangan baru bila perlu.', 'Expires': 'Kedaluwarsa', '(expired)': '(kedaluwarsa)', 'Link': 'Tautan', 'Copied by {who}, {d}': 'Disalin oleh {who}, {d}', 'Not shared yet': 'Belum dibagikan',
  'Created by': 'Dibuat oleh', '{d} by {mail}': '{d} oleh {mail}', 'Revoked by': 'Dicabut oleh', 'History': 'Riwayat',
  'created the invitation': 'membuat undangan', 'copied the invitation link': 'menyalin tautan undangan', 'accepted the invitation': 'menerima undangan', 'revoked the invitation': 'mencabut undangan', 'corrected the invitation': 'mengoreksi undangan', 'renewed the invitation': 'memperpanjang undangan',
  'approved the member': 'menyetujui anggota', 'did not approve the member': 'tidak menyetujui anggota', 'reversed a correction': 'membatalkan koreksi', 'reversed revoking': 'membatalkan pencabutan', 'reversed the approval': 'membatalkan persetujuan', 'Wrong email address typed': 'Salah mengetik alamat email', 'Undone': 'Dibatalkan',
  'This invitation link doesn’t work': 'Tautan undangan ini tidak berfungsi', 'It may have been replaced or withdrawn. Ask the person who invited you for a new link.': 'Mungkin sudah diganti atau ditarik. Minta tautan baru kepada orang yang mengundang Anda.',
  'This invitation has expired': 'Undangan ini sudah kedaluwarsa', 'Ask the person who invited you to renew it. A renewed invitation comes with a new link.': 'Minta orang yang mengundang Anda untuk memperpanjangnya. Undangan yang diperpanjang memiliki tautan baru.',
  'This invitation was already accepted': 'Undangan ini sudah diterima', 'Sign in with the Google account that accepted it. Accepting again never creates a second account.': 'Masuk dengan akun Google yang menerimanya. Menerima lagi tidak pernah membuat akun kedua.', 'Go to sign in': 'Ke halaman masuk',
  'You’re invited to dwdg’ONE': 'Anda diundang ke dwdg’ONE', 'Sign in with Google to see your invitation. Nothing about the organization shows before you sign in.': 'Masuk dengan Google untuk melihat undangan Anda. Tidak ada informasi organisasi yang tampil sebelum Anda masuk.', 'Continue with Google': 'Lanjutkan dengan Google',
  'Prototype: choose which Google account signs in.': 'Prototipe: pilih akun Google yang masuk.', 'This invitation is for a different Google account': 'Undangan ini untuk akun Google lain',
  'You’re signed in as {mail}. Sign out and use the account the invitation was sent to. Nothing from the organization is shown to this account.': 'Anda masuk sebagai {mail}. Keluar dan gunakan akun yang menerima undangan. Tidak ada informasi organisasi yang ditampilkan untuk akun ini.', 'Use another account': 'Gunakan akun lain',
  'Your invitation': 'Undangan Anda', 'Check the details, then accept. You’re signed in as {mail}.': 'Periksa rinciannya, lalu terima. Anda masuk sebagai {mail}.', 'An admin approves you next': 'Admin menyetujui Anda berikutnya',
  'Accepting doesn’t open the workspace yet. The Admin approves each new member first.': 'Menerima belum membuka ruang kerja. Admin menyetujui setiap anggota baru terlebih dahulu.', 'Accept invitation': 'Terima undangan', 'Not me': 'Bukan saya',
  'You already accepted this invitation': 'Anda sudah menerima undangan ini', 'Accepting again never creates a second account.': 'Menerima lagi tidak pernah membuat akun kedua.', 'Open My Work': 'Buka Pekerjaan Saya', 'This invitation is for another account': 'Undangan ini untuk akun lain',
  'Sign out to open it with the invited Google account.': 'Keluar untuk membukanya dengan akun Google yang diundang.', 'Sign out and open it': 'Keluar dan buka',
  'Vice President': 'Wakil Presiden', 'Director of {d}': 'Direktur {d}', 'Co-Director of {d}': 'Co-Director {d}', 'Not enabled until the Co-Director appointment rule is adopted.': 'Belum diaktifkan sampai aturan pengangkatan Co-Director diadopsi.',
  'The President appoints the Vice President.': 'Presiden yang mengangkat Wakil Presiden.', 'The reporting VP, the President or the Admin appoints Directors.': 'Wakil Presiden terkait, Presiden, atau Admin yang mengangkat Direktur.', 'since {d}': 'sejak {d}', 'Vacant': 'Kosong', 'Appoint': 'Angkat',
  'Leadership roles are dated grants with an actor, a reason and the predecessor. A task assignment never promotes anyone.': 'Jabatan pimpinan adalah hak bertanggal dengan pelaku, alasan, dan pendahulu. Penugasan tidak pernah menaikkan jabatan siapa pun.', 'President': 'Presiden',
  'Changes only through a presidency handover': 'Hanya berubah melalui serah terima presidium', 'Vice President and Directors': 'Wakil Presiden dan Direktur', 'Co-Directors': 'Co-Director', 'The three-VP structure is a draft': 'Struktur tiga Wakil Presiden masih draf',
  'VP Internal, VP External and VP Consulting stay inactive until a term handover activates them. Today one VP covers all six divisions.': 'Wapres Internal, Eksternal, dan Konsultasi tetap nonaktif sampai serah terima periode mengaktifkannya. Saat ini satu Wapres membawahi keenam divisi.',
  'Appointment history': 'Riwayat pengangkatan', 'No appointments recorded in dwdg’ONE yet. Roles from before launch show as recorded at setup.': 'Belum ada pengangkatan yang tercatat di dwdg’ONE. Jabatan sebelum peluncuran tampil sebagai dicatat saat penyiapan.', 'Appointment': 'Pengangkatan',
  'Reporting divisions: all six in the current structure. Appoints Directors in them and can pause access below VP.': 'Divisi yang melapor: keenamnya dalam struktur saat ini. Mengangkat Direktur di dalamnya dan dapat menjeda akses di bawah Wapres.',
  'Leads {d}: projects, programs, routines and the division queue. Can pause access for people below Director in {d}.': 'Memimpin {d}: proyek, program, rutinitas, dan antrean divisi. Dapat menjeda akses orang di bawah Direktur di {d}.', 'Choose a person': 'Pilih orang',
  'People in {d}. Moving someone across divisions is a separate HR move.': 'Orang di {d}. Memindahkan seseorang antardivisi adalah pemindahan HR tersendiri.', 'A later date is recorded as scheduled.': 'Tanggal yang lebih lambat dicatat sebagai terjadwal.', 'For example: elected at the general meeting on 4 Oct': 'Contoh: terpilih pada rapat umum 4 Okt',
  'What changes': 'Apa yang berubah', '{who} becomes {o}.': '{who} menjadi {o}.', 'Their {r} role ends.': 'Jabatan {r}-nya berakhir.', 'Choose a person to see the change.': 'Pilih orang untuk melihat perubahannya.', '{who}’s grant ends. The history keeps it.': 'Hak {who} berakhir. Riwayat tetap menyimpannya.',
  '{who} stays in {d} as a Member.': '{who} tetap di {d} sebagai Anggota.', 'The office is vacant now.': 'Jabatan ini sedang kosong.', 'Recorded with you as the actor, the date and the reason.': 'Dicatat dengan Anda sebagai pelaku, tanggal, dan alasannya.', '{who}’s division afterwards': 'Divisi {who} sesudahnya',
  'Choose a division': 'Pilih divisi', 'Not decided by the plan yet. Recorded so the account keeps a workspace.': 'Belum diputuskan dalam rencana. Dicatat agar akun tetap memiliki ruang kerja.', 'Appoint {who}': 'Angkat {who}',
  '{who}’s division after the office ends': 'Divisi {who} setelah masa jabatan berakhir', 'Successor': 'Penerus', 'Message to the successor': 'Pesan untuk penerus', 'Send the nomination': 'Kirim pencalonan', 'President’s account': 'Akun Presiden', 'Choose what happened': 'Pilih yang terjadi',
  'Account deleted': 'Akun dihapus', 'Unavailable': 'Tidak dapat dihubungi', 'Why the incumbent can’t hand over normally': 'Mengapa petahana tidak dapat menyerahterimakan secara normal', 'Evidence reference': 'Rujukan bukti', 'Link or document number': 'Tautan atau nomor dokumen',
  'Required when the account is deleted or the President is unavailable.': 'Wajib bila akun dihapus atau Presiden tidak dapat dihubungi.', 'Start emergency recovery': 'Mulai pemulihan darurat',
  'One President at a time. A normal handover belongs to the incumbent; emergency recovery belongs to the Admin.': 'Satu Presiden pada satu waktu. Serah terima normal milik petahana; pemulihan darurat milik Admin.', 'Current office': 'Jabatan saat ini', 'office record {n}': 'catatan jabatan {n}',
  'Normal handover': 'Serah terima normal', 'Nominate a successor. They accept, then you confirm after signing in again. Your other roles are decided separately.': 'Calonkan penerus. Ia menerima, lalu Anda mengonfirmasi setelah masuk ulang. Peran Anda yang lain diputuskan terpisah.',
  'Only {who}, the incumbent, can start a normal handover.': 'Hanya {who}, petahana, yang dapat memulai serah terima normal.', 'the President': 'Presiden', 'Nominate a successor': 'Calonkan penerus', 'Emergency recovery': 'Pemulihan darurat',
  'Use when the President’s account is paused, deleted or unavailable. You are recorded as the recovery actor; it is never shown as the President’s own handover.': 'Gunakan bila akun Presiden dijeda, dihapus, atau tidak dapat dihubungi. Anda dicatat sebagai pelaku pemulihan; tidak pernah ditampilkan sebagai serah terima oleh Presiden sendiri.',
  'Only the Admin can start an emergency recovery, when the President’s account is paused, deleted or unavailable.': 'Hanya Admin yang dapat memulai pemulihan darurat, bila akun Presiden dijeda, dihapus, atau tidak dapat dihubungi.', 'Past handovers': 'Serah terima sebelumnya', 'No handovers recorded in dwdg’ONE yet.': 'Belum ada serah terima yang tercatat di dwdg’ONE.',
  'Recorded by the Admin': 'Dicatat oleh Admin', 'Nominated': 'Dicalonkan', 'Successor acknowledged': 'Penerus menyatakan setuju', 'Successor accepted': 'Penerus menerima', 'Verified and confirmed': 'Diverifikasi dan dikonfirmasi', 'Office transferred': 'Jabatan berpindah',
  'Decline the nomination': 'Tolak pencalonan', 'Acknowledge and accept': 'Nyatakan setuju dan terima', 'Accept the nomination': 'Terima pencalonan', 'Decline': 'Tolak', 'Declining has no penalty. Nothing changes until the handover is confirmed.': 'Menolak tidak ada sanksinya. Tidak ada yang berubah sampai serah terima dikonfirmasi.',
  'Signed in again just now': 'Baru saja masuk ulang', 'Sign in again with Google': 'Masuk ulang dengan Google', 'Transfer the presidency to {who}': 'Serahkan jabatan Presiden kepada {who}', 'Cancel handover': 'Batalkan serah terima',
  'Confirming needs a fresh sign-in. Exactly one President stays active; a reversal is a new handover.': 'Konfirmasi memerlukan masuk ulang. Tepat satu Presiden tetap aktif; pembatalan adalah serah terima baru.', 'Waiting for {who} to answer.': 'Menunggu jawaban {who}.', 'Waiting for the Admin to confirm.': 'Menunggu konfirmasi Admin.', 'Waiting for {who} to confirm.': 'Menunggu konfirmasi {who}.',
  'Outgoing President': 'Presiden yang keluar', 'Started by': 'Dimulai oleh', 'Admin, recovery actor': 'Admin, pelaku pemulihan', 'Evidence': 'Bukti', 'Restricted': 'Dibatasi', 'Outgoing division': 'Divisi setelah keluar', 'Not chosen': 'Belum dipilih', 'Message': 'Pesan', 'Answered': 'Dijawab', 'Office record': 'Catatan jabatan',
  'completed an emergency presidency recovery for': 'menyelesaikan pemulihan darurat presidium untuk', 'completed the presidency handover to': 'menyelesaikan serah terima presidium kepada',
  'Welcome': 'Selamat datang', 'Project': 'Proyek', 'Work': 'Pekerjaan', 'Your division’s space: its projects, operations, resources and history.': 'Ruang divisi Anda: proyek, operasional, sumber daya, dan riwayatnya.',
  'Work with a goal and an end. Each has Overview, WBS, Work and Resources.': 'Pekerjaan dengan tujuan dan akhir. Masing-masing memiliki Ringkasan, WBS, Pekerjaan, dan Sumber daya.', 'Tasks: what you do, in a list, a board or a timeline.': 'Tugas: yang Anda kerjakan, dalam daftar, papan, atau linimasa.',
  'Notes, folders and links. Files stay in your own Google Drive.': 'Catatan, folder, dan tautan. Berkas tetap di Google Drive Anda.', 'See and run your own tasks in My Work.': 'Lihat dan jalankan tugas Anda di Pekerjaan Saya.', 'Offer a task to anyone. It waits until they accept, and declining has no penalty.': 'Tawarkan tugas kepada siapa pun. Tugas menunggu sampai diterima, dan menolak tidak ada sanksinya.',
  'Join consulting work whenever you accept an offer. Every member is also a consultant.': 'Ikut pekerjaan konsultasi setiap kali Anda menerima tawaran. Setiap anggota juga konsultan.', 'Create projects, programs and routines in {d}.': 'Buat proyek, program, dan rutinitas di {d}.', 'Co-Directors and above create projects. Ask yours when you need one.': 'Co-Director ke atas yang membuat proyek. Minta kepada Co-Director Anda bila perlu.',
  'Welcome to dwdg’ONE, {name}': 'Selamat datang di dwdg’ONE, {name}', 'You’re in. Here is your place in DWDG UII and what to do first.': 'Anda sudah masuk. Inilah posisi Anda di DWDG UII dan apa yang perlu dilakukan pertama kali.', 'Your membership': 'Keanggotaan Anda', 'Yes, like every member': 'Ya, seperti setiap anggota',
  'Your role comes from your membership. Only an appointment changes it, never a task.': 'Jabatan Anda berasal dari keanggotaan. Hanya pengangkatan yang mengubahnya, bukan tugas.', 'Four words you will see': 'Empat istilah yang akan Anda lihat', 'What you can do': 'Yang dapat Anda lakukan', 'Your onboarding': 'Orientasi Anda',
  'HR adds your onboarding checklist. It appears in My Work as tasks with owners and dates.': 'HR menambahkan daftar periksa orientasi Anda. Daftar itu muncul di Pekerjaan Saya sebagai tugas dengan penanggung jawab dan tanggal.', 'Profile and preferences': 'Profil dan preferensi',
  'Your photo and name come from your Google account.': 'Foto dan nama Anda berasal dari akun Google Anda.', 'Optional. Shown on your person panel.': 'Opsional. Ditampilkan di panel orang Anda.', 'Phone': 'Telepon', 'Optional. You can hide it from others.': 'Opsional. Anda dapat menyembunyikannya dari orang lain.',
  'Language': 'Bahasa', 'Only changes the interface.': 'Hanya mengubah antarmuka.', 'Theme': 'Tema', 'System': 'Sistem', 'Light': 'Terang', 'Dark': 'Gelap', 'See {d} projects': 'Lihat proyek {d}',
  'Your access is paused': 'Akses Anda dijeda', 'An authorized leader paused this account. Ask your Director or HR if you think this is a mistake.': 'Pimpinan yang berwenang menjeda akun ini. Tanyakan kepada Direktur atau HR bila menurut Anda ini keliru.', 'Your membership has ended': 'Keanggotaan Anda telah berakhir',
  'Your work stays in DWDG UII under your name. This account can no longer open the workspace.': 'Pekerjaan Anda tetap di DWDG UII atas nama Anda. Akun ini tidak dapat lagi membuka ruang kerja.', 'Your term has ended': 'Periode Anda telah berakhir',
  'Thank you for your work. Alumni access is not set up yet, so this account can’t open the workspace.': 'Terima kasih atas kerja Anda. Akses alumni belum disiapkan, jadi akun ini tidak dapat membuka ruang kerja.', 'Your membership was not approved': 'Keanggotaan Anda tidak disetujui',
  'Ask the person who invited you. Nothing from the organization is shown to this account.': 'Tanyakan kepada orang yang mengundang Anda. Tidak ada informasi organisasi yang ditampilkan untuk akun ini.',
  'Prototype: sign in as Mahdy (Admin) and open Members, then Invitations, to approve.': 'Prototipe: masuk sebagai Mahdy (Admin), buka Anggota, lalu Undangan, untuk menyetujui.', 'approved the membership of': 'menyetujui keanggotaan',
  'Invitations, approvals, moves, pauses, appointments and handovers, with reasons. Only the Admin and the President see this.': 'Undangan, persetujuan, pemindahan, penjedaan, pengangkatan, dan serah terima, beserta alasannya. Hanya Admin dan Presiden yang melihat ini.', 'Nothing recorded yet.': 'Belum ada catatan.',
  'Workspace Changes show only that something changed. Reasons and private details stay here.': 'Perubahan ruang kerja hanya menunjukkan bahwa sesuatu berubah. Alasan dan detail pribadi tetap di sini.',
  '{who} accepted an invitation. It needs approval': '{who} menerima undangan. Perlu persetujuan', '{who} approved your membership. Welcome': '{who} menyetujui keanggotaan Anda. Selamat datang', '{who} moved you to another division': '{who} memindahkan Anda ke divisi lain', '{who} appointed you to a new role': '{who} mengangkat Anda ke jabatan baru',
  '{who} recorded the end of your role': '{who} mencatat berakhirnya jabatan Anda', '{who} nominated you as the next President': '{who} mencalonkan Anda sebagai Presiden berikutnya', '{who} started an emergency presidency recovery naming you': '{who} memulai pemulihan darurat presidium dengan menunjuk Anda',
  '{who} accepted the presidency nomination': '{who} menerima pencalonan Presiden', '{who} declined the presidency nomination': '{who} menolak pencalonan Presiden', '{who} completed the presidency handover': '{who} menyelesaikan serah terima presidium',
  '{who} can sign in again': '{who} dapat masuk lagi', 'Write the person’s name.': 'Tuliskan nama orang tersebut.', 'Enter a full Google account address.': 'Masukkan alamat akun Google lengkap.',
  '{who} already has an open invitation for this address. Open it from the list instead.': '{who} sudah memiliki undangan terbuka untuk alamat ini. Buka dari daftar saja.', '{who} is already a member with this account. Use a move or an appointment instead.': '{who} sudah menjadi anggota dengan akun ini. Gunakan pemindahan atau pengangkatan.',
  'Invitation ready. Copy the link and send it yourself.': 'Undangan siap. Salin tautannya dan kirim sendiri.', 'Link copied. dwdg’ONE doesn’t send email yet, so send it yourself.': 'Tautan disalin. dwdg’ONE belum mengirim email, jadi kirim sendiri.',
  'Only an invitation nobody accepted can be corrected.': 'Hanya undangan yang belum diterima yang dapat dikoreksi.', 'Corrected. The old link no longer works.': 'Dikoreksi. Tautan lama tidak berfungsi lagi.', 'Say why, so the next person knows.': 'Jelaskan alasannya agar orang berikutnya tahu.',
  'Revoked. The link never works again.': 'Dicabut. Tautan tidak akan berfungsi lagi.', 'Renewed until {d}. Copy the new link.': 'Diperpanjang sampai {d}. Salin tautan baru.', 'Only the Admin approves members.': 'Hanya Admin yang menyetujui anggota.', '{who} can now sign in': '{who} sekarang dapat masuk',
  'Say why, for the record.': 'Jelaskan alasannya untuk catatan.', '{who} was not approved': '{who} tidak disetujui', 'Choose who is appointed.': 'Pilih siapa yang diangkat.', 'Give the reason, for the record.': 'Berikan alasannya untuk catatan.', 'Choose a division for {who}.': 'Pilih divisi untuk {who}.',
  'appointed a new Director:': 'mengangkat Direktur baru:', 'appointed': 'mengangkat', 'scheduled an appointment for': 'menjadwalkan pengangkatan untuk', '{who} is now {o}': '{who} kini {o}', 'Scheduled for {d}': 'Dijadwalkan pada {d}', 'reversed an appointment of': 'membatalkan pengangkatan',
  'Only the incumbent President starts a normal handover.': 'Hanya Presiden petahana yang memulai serah terima normal.', 'Only the Admin starts an emergency recovery.': 'Hanya Admin yang memulai pemulihan darurat.', 'A handover is already open. Finish or cancel it first.': 'Masih ada serah terima terbuka. Selesaikan atau batalkan terlebih dahulu.',
  'Choose what happened to the President’s account.': 'Pilih apa yang terjadi pada akun Presiden.', '{who}’s account is active. Pause it first, or choose Unavailable and give evidence.': 'Akun {who} aktif. Jeda terlebih dahulu, atau pilih Tidak dapat dihubungi dan sertakan bukti.', 'Give the reason.': 'Berikan alasannya.', 'Add an evidence reference.': 'Tambahkan rujukan bukti.',
  'Choose the successor.': 'Pilih penerus.', 'started an emergency presidency recovery naming': 'memulai pemulihan darurat presidium dengan menunjuk', 'nominated a successor:': 'mencalonkan penerus:', 'Sent to {who}. Nothing changes until they answer.': 'Terkirim ke {who}. Tidak ada yang berubah sampai ia menjawab.',
  'canceled a presidency handover for': 'membatalkan serah terima presidium untuk', 'accepted the presidency nomination': 'menerima pencalonan Presiden', 'declined the presidency nomination': 'menolak pencalonan Presiden', 'Accepted. {who} confirms next.': 'Diterima. {who} mengonfirmasi berikutnya.', 'Declined. {who} was told.': 'Ditolak. {who} sudah diberi tahu.',
  'Handover canceled': 'Serah terima dibatalkan', 'Sign in again first.': 'Masuk ulang terlebih dahulu.', 'Only the incumbent or, in recovery, the Admin confirms.': 'Hanya petahana atau, dalam pemulihan, Admin yang mengonfirmasi.', 'Out of date: the presidency changed since this started. Nothing was transferred.': 'Kedaluwarsa: presidium berubah sejak ini dimulai. Tidak ada yang dipindahkan.',
  '{who} is President now': '{who} kini Presiden',
});
})();
