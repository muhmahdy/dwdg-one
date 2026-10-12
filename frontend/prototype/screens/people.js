/* Collaboration (owner, 11 Oct, D60): one way of working together for projects, programs and operations.
   - Roles are the same three words everywhere: Lead and Manager change the item and its people; Members do the work and can leave.
   - People from the item's own division (or the Presidency) are added at once and told. Someone from another division is invited
     and joins only after accepting; their division's leaders get a note so nobody's time is taken without them knowing.
   - Programs add whole divisions as partners: a partner division's leaders accept for it, then place their own projects and
     operations in the program, and its members can open it.
   - Every add, invite, answer, role change, removal and leave tells the person and is logged in Activity.
   This file reads and writes the fields the rest of the prototype already uses: projects keep lead, pm and team[]; routines keep
   owners[] (the rotation, in order) and gain lead, manager and invites[]; programs keep owner and gain manager and partners[]. */
'use strict';
const homeDiv = id => (person(id) || {}).div || null;
const divName = d => d ? (div(d) || {}).short || d : L('Presidency');
const leadersOf = d => d ? unitLeads(d) : [];
const ROLE = {lead: 'Lead', manager: 'Manager', member: 'Member'};
Object.assign(UPD, {
  'cp-added': '{who} added you', 'cp-invite': '{who} invited you to work together', 'cp-yes': '{who} accepted your invitation', 'cp-no': '{who} declined your invitation',
  'cp-removed': '{who} took you off', 'cp-left': '{who} left', 'cp-role': '{who} changed your role', 'cp-fyi': '{who} invited someone from your division',
  'pg-partner': '{who} invited your division to a program', 'pg-partner-yes': '{who} accepted for their division', 'pg-partner-no': '{who} declined for their division', 'pg-partner-left': '{who} ended the partnership',
  'offer-revised': '{who} changed an offer and sent it again', 'offer-withdrawn': '{who} withdrew an offer', 'offer-fyi': '{who} asked someone in your division to take a task', 'tresp-removed': '{who} took you off a task',
});

// ---------- one adapter per kind of item ----------
const CP = {
  project: {of: id => projOf(id), div: x => x.div, href: x => `#/projects/${x.id}/people`, lead: x => x.lead, mgr: x => x.pm,
    setLead: (x, id) => { x.lead = id; }, setMgr: (x, id) => { x.pm = id; }, canManage: x => canEditProject(x),
    entries: x => (x.team || []).filter(v => ['joined', 'invited'].includes(v.state) && person(v.id)),
    put: (x, id, by) => { x.team = (x.team || []).filter(v => v.id !== id); const v = {id, state: 'joined', by, at: nowStamp(), direct: true}; x.team.push(v); return v; },
    invite: (x, id, by) => { x.team = (x.team || []).filter(v => v.id !== id); const v = {id, state: 'invited', by, at: nowStamp()}; x.team.push(v); return v; },
    drop: (x, id) => { x.team = (x.team || []).filter(v => v.id !== id); }},
  routine: {of: id => rtOf(id), div: x => x.unit, href: x => `#/operations/${x.id}`, lead: x => x.lead || x.createdBy, mgr: x => x.manager || null,
    setLead: (x, id) => { x.lead = id; }, setMgr: (x, id) => { x.manager = id; }, canManage: x => canEditRt(x),
    entries: x => [...(x.owners || []).map(id => ({id, state: 'joined', by: (x.ownerBy || {})[id] || x.createdBy, at: ((x.ownerAt || {})[id]) || x.at})), ...(x.invites || []).filter(v => v.state === 'invited')],
    put: (x, id, by) => { x.invites = (x.invites || []).filter(v => v.id !== id); if (!x.owners.includes(id)) x.owners.push(id); x.ownerBy = {...(x.ownerBy || {}), [id]: by}; x.ownerAt = {...(x.ownerAt || {}), [id]: nowStamp()}; pruneFuture(x); return {id, state: 'joined', by}; },
    invite: (x, id, by) => { x.invites = (x.invites || []).filter(v => v.id !== id); const v = {id, state: 'invited', by, at: nowStamp()}; x.invites.push(v); return v; },
    drop: (x, id) => { x.owners = (x.owners || []).filter(v => v !== id); x.invites = (x.invites || []).filter(v => v.id !== id); pruneFuture(x); }},
  program: {of: id => pgOf(id), div: x => x.div, href: x => `#/programs/${x.id}`, lead: x => x.owner, mgr: x => x.manager || null,
    setLead: (x, id) => { x.owner = id; }, setMgr: (x, id) => { x.manager = id; }, canManage: x => canManageProgram(x),
    entries: () => [], put: () => null, invite: () => null, drop: () => {}},
};
const cpRef = (kind, x) => ({type: kind, id: x.id});
const cpName = (kind, x) => x.name;
const cpRole = (kind, x, id) => { const A = CP[kind]; return A.lead(x) === id ? 'lead' : A.mgr(x) === id ? 'manager' : A.entries(x).some(v => v.id === id && v.state === 'joined') ? 'member' : null; };
// Everyone working on an item, joined only, lead first: used for the face stacks on headers, cards and rows.
const cpFaces = (kind, x) => { const A = CP[kind]; return [...new Set([A.lead(x), A.mgr(x), ...A.entries(x).filter(v => v.state === 'joined').map(v => v.id)].filter(id => id && person(id)))]; };
// Divisions involved, the home division first.
const cpDivs = (kind, x) => { const home = CP[kind].div(x); if (kind === 'program') return pgDivs(x); return [...new Set([home, ...cpFaces(kind, x).map(homeDiv).filter(Boolean)])].filter(Boolean); };
const faceStack = (ids, n = 4) => ids.length ? `<span class="cp-faces" title="${esc(ids.map(pname).join(', '))}">${ids.slice(0, n).map(i => av(i, 'av-xs')).join('')}${ids.length > n ? `<span class="av av-xs more">+${ids.length - n}</span>` : ''}</span>` : '';
const divChips = ds => ds.length > 1 ? `<span class="cp-divs">${ds.map((d, i) => `<span class="cp-div ${i ? '' : 'home'}" title="${esc((div(d) || {}).name || '')}">${bicon(div(d).icon, false)}${esc(divName(d))}</span>`).join('')}</span>` : '';
const cpGlance = (kind, x) => `${faceStack(cpFaces(kind, x))}${divChips(cpDivs(kind, x))}`;

// ---------- programs: partner divisions ----------
const pgPartners = g => (g.partners || []).filter(v => ['joined', 'invited'].includes(v.state));
const pgDivs = g => [g.div, ...(g.partners || []).filter(v => v.state === 'joined').map(v => v.div)];
const canSeeProgram = g => !!g && pgDivs(g).some(d => visibleDivs(me()).includes(d));
const canAnswerPartner = (g, d) => { const m = me(); return !!m && (m.admin || (m.div === d && rank(m) >= 2)); };

// ---------- the actions ----------
function cpNotice(kind, x, id, type) { notify(id, type, cpRef(kind, x)); }
function cpAdd(kind, x, id, role = 'member') { const A = CP[kind], q = person(id), m = me(); if (!x || !q || !A.canManage(x)) return;
  if (A.lead(x) === id || A.mgr(x) === id || A.entries(x).some(v => v.id === id)) return toast(L('{who} is already here', {who: q.first}));
  const direct = !q.div || q.div === A.div(x), prev = JSON.parse(JSON.stringify(x));
  if (direct) { A.put(x, id, m.id); cpNotice(kind, x, id, 'cp-added'); }
  else { A.invite(x, id, m.id); cpNotice(kind, x, id, 'cp-invite'); leadersOf(q.div).filter(i => i !== id).forEach(i => notify(i, 'cp-fyi', cpRef(kind, x))); }
  logChange(A.div(x), direct ? 'added a person to' : 'invited someone from another division to', {type: kind === 'routine' ? 'task' : 'project', id: x.id, name: x.name}); save(); render();
  toast(direct ? L('{who} added', {who: q.first}) : L('{who} invited. They join after accepting.', {who: q.first}), () => { Object.assign(x, prev); rerender(); }); }
function cpRemove(kind, x, id) { const A = CP[kind], self = id === session.me; if (!x || (!self && !A.canManage(x)) || A.lead(x) === id) return;
  const prev = JSON.parse(JSON.stringify(x)), inv = A.entries(x).find(v => v.id === id && v.state === 'invited');
  if (A.mgr(x) === id) A.setMgr(x, null); A.drop(x, id);
  if (self) { const lead = A.lead(x); if (lead) notify(lead, 'cp-left', cpRef(kind, x)); } else if (!inv) cpNotice(kind, x, id, 'cp-removed');
  logChange(A.div(x), self ? 'left' : inv ? 'withdrew an invitation to' : 'took a person off', {type: kind === 'routine' ? 'task' : 'project', id: x.id, name: x.name}); ui.menu = null; renderLayer(); save();
  if (self && !(kind === 'project' ? canSeeProject(x) : kind === 'routine' ? canSeeRt(x) : canSeeProgram(x))) go('work'); else render();
  toast(self ? L('You left {x}', {x: x.name}) : inv ? L('Invitation withdrawn') : L('{who} taken off', {who: first(id)}), () => { Object.assign(x, prev); rerender(); }); }
function cpSetRole(kind, x, id, role) { const A = CP[kind]; if (!x || !A.canManage(x)) return; const prev = JSON.parse(JSON.stringify(x)), m = me();
  if (role === 'lead') { const old = A.lead(x); A.setLead(x, id); if (A.mgr(x) === id) A.setMgr(x, null); if (kind !== 'routine') A.drop(x, id); if (old && old !== id && kind !== 'program') A.put(x, old, m.id); }
  else if (role === 'manager') { const old = A.mgr(x); A.setMgr(x, id); if (kind !== 'routine') A.drop(x, id); if (old && old !== id && kind !== 'program') A.put(x, old, m.id); }
  else { if (A.mgr(x) === id) A.setMgr(x, null); if (kind !== 'program') A.put(x, id, m.id); }
  cpNotice(kind, x, id, 'cp-role'); logChange(A.div(x), 'changed a role in', {type: kind === 'routine' ? 'task' : 'project', id: x.id, name: x.name}); ui.menu = null; renderLayer(); save(); render();
  toast(L('{who} is now {role}', {who: first(id), role: L(ROLE[role]).toLowerCase()}), () => { Object.assign(x, prev); rerender(); }); }
function cpAnswer(kind, x, yes) { const A = CP[kind], v = A.entries(x).find(e => e.id === session.me && e.state === 'invited'); if (!v) return; const prev = JSON.parse(JSON.stringify(x));
  if (yes) A.put(x, session.me, v.by); else if (kind === 'project') { const t = (x.team || []).find(e => e.id === session.me); t.state = 'declined'; t.answeredAt = nowStamp(); } else { const t = (x.invites || []).find(e => e.id === session.me); t.state = 'declined'; t.answeredAt = nowStamp(); }
  if (kind === 'project') { const t = (x.team || []).find(e => e.id === session.me); if (t) t.answeredAt = nowStamp(); }
  notify(v.by, yes ? 'cp-yes' : 'cp-no', cpRef(kind, x)); logChange(A.div(x), yes ? 'joined' : 'declined to join', {type: kind === 'routine' ? 'task' : 'project', id: x.id, name: x.name}); save(); render();
  toast(yes ? L('You joined {x}', {x: x.name}) : L('Invitation declined'), () => { Object.assign(x, prev); rerender(); }); }
function pgPartnerInvite(g, d) { if (!canManageProgram(g) || pgDivs(g).includes(d)) return; const prev = JSON.parse(JSON.stringify(g));
  g.partners = (g.partners || []).filter(v => v.div !== d); g.partners.push({div: d, state: 'invited', by: session.me, at: nowStamp()}); leadersOf(d).forEach(i => notify(i, 'pg-partner', {type: 'program', id: g.id}));
  logChange(g.div, 'invited a partner division to', {type: 'project', id: g.id, name: g.name}); ui.menu = null; renderLayer(); save(); render(); toast(L('{d} invited. Their leaders answer for the division.', {d: divName(d)}), () => { Object.assign(g, prev); rerender(); }); }
function pgPartnerAnswer(g, d, yes) { const v = (g.partners || []).find(e => e.div === d && e.state === 'invited'); if (!v || !canAnswerPartner(g, d)) return; const prev = JSON.parse(JSON.stringify(g));
  v.state = yes ? 'joined' : 'declined'; v.answeredAt = nowStamp(); v.answeredBy = session.me; notify(v.by, yes ? 'pg-partner-yes' : 'pg-partner-no', {type: 'program', id: g.id});
  logChange(g.div, yes ? 'became a partner of' : 'declined to partner on', {type: 'project', id: g.id, name: g.name}); save(); render(); toast(yes ? L('{d} is now a partner of {p}', {d: divName(d), p: g.name}) : L('Invitation declined'), () => { Object.assign(g, prev); rerender(); }); }
function pgPartnerEnd(g, d) { const v = (g.partners || []).find(e => e.div === d && e.state !== 'left'); if (!v || !(canManageProgram(g) || canAnswerPartner(g, d))) return;
  const prev = JSON.parse(JSON.stringify(g)), kids = [...db.projects.filter(p => p.program === g.id && p.div === d), ...(db.routines || []).filter(r => r.program === g.id && r.unit === d)];
  v.state = 'left'; v.endedAt = nowStamp(); kids.forEach(x => { x.program = null; }); const tell = canManageProgram(g) && me().div !== d ? leadersOf(d) : [g.owner]; tell.forEach(i => notify(i, 'pg-partner-left', {type: 'program', id: g.id}));
  logChange(g.div, 'ended a partnership on', {type: 'project', id: g.id, name: g.name}); ui.menu = null; renderLayer(); save(); render();
  toast(kids.length ? L('Partnership ended. {n} items from {d} left the program.', {n: kids.length, d: divName(d)}) : L('Partnership ended'), () => { Object.assign(g, prev); kids.forEach(x => { x.program = g.id; }); rerender(); }); }

// ---------- what is waiting for me to answer ----------
function cpInvites() { const m = me(); if (!m) return []; const out = [];
  db.projects.forEach(p => (p.team || []).filter(v => v.id === m.id && v.state === 'invited').forEach(v => out.push({kind: 'project', x: p, v})));
  (db.routines || []).forEach(r => (r.invites || []).filter(v => v.id === m.id && v.state === 'invited').forEach(v => out.push({kind: 'routine', x: r, v})));
  (db.programs || []).forEach(g => (g.partners || []).filter(v => v.state === 'invited' && v.div === m.div && canAnswerPartner(g, v.div)).forEach(v => out.push({kind: 'partner', x: g, v})));
  return out; }
const cpAskRow = it => { const {kind, x, v} = it, what = kind === 'project' ? L('Project') : kind === 'routine' ? L('Operation') : L('Program');
  const sub = kind === 'partner' ? L('{who} invites {d} to be a partner', {who: first(v.by), d: divName(v.div)}) : L('{who} invites you to work together, from {d}', {who: first(v.by), d: divName(homeDiv(v.by))});
  const art = kind === 'project' ? projObj(x, 'sm') : kind === 'routine' ? rtObj(x, 'sm') : pgObj(x, 'sm'), go2 = kind === 'project' ? `projects/${x.id}/people` : kind === 'routine' ? `operations/${x.id}` : `programs/${x.id}`;
  const yes = kind === 'partner' ? `data-act="pg-partner-answer" data-id="${x.id}" data-d="${v.div}" data-r="yes"` : `data-act="cp-answer" data-k="${kind}" data-id="${x.id}" data-r="yes"`, no = yes.replace('data-r="yes"', 'data-r="no"');
  return `<div class="mw-ask cp-ask" data-act="go" data-h="${go2}" tabindex="0">${art}<span class="mw-ask-t"><b>${esc(x.name)}</b><small>${what}. ${esc(sub)}</small></span><span class="mw-ask-b"><button class="btn btn-sm btn-ghost" ${no}>${L('Decline')}</button><button class="btn btn-sm btn-pri" ${yes}>${L('Accept')}</button></span></div>`; };

// ---------- what I am waiting for from others (delegation, D60) ----------
function waitingOnOthers() { const m = me(); if (!m) return []; const out = [], stWord = t => t.status === 'review' ? L('Handed in') : t.status === 'doing' ? L('In progress') : L('Not started');
  db.tasks.filter(t => !t.trashed && !isDone(t) && !t.routine && t.owner !== m.id && (t.givenBy === m.id || (!t.givenBy && t.createdBy === m.id))).forEach(t => out.push({k: 'task', at: t.due || '9', html: `<div class="mw-ask wo" data-act="open-task" data-id="${t.id}" tabindex="0">${av(t.owner, 'av-sm')}<span class="mw-ask-t"><b>${esc(t.title)}</b><small>${esc(first(t.owner))}, ${esc(stWord(t))}${lastSub(t) && lastSub(t).review && lastSub(t).review.result === 'returned' && t.status !== 'review' ? `, ${L('returned')}` : ''}</small></span>${t.due ? `<span class="tpill ${t.due < today() ? 'late' : ''}">${icon('clock')}${esc(dShort(t.due))}</span>` : ''}</div>`}));
  db.offers.filter(o => o.from === m.id && ['pending', 'changes'].includes(o.state)).forEach(o => out.push({k: 'offer', at: o.due || '9', html: `<div class="mw-ask wo" data-act="open-offer" data-id="${o.id}" tabindex="0">${av(o.to, 'av-sm')}<span class="mw-ask-t"><b>${esc(o.title)}</b><small>${o.state === 'changes' ? `<em class="cp-wait">${L('{who} asked for changes', {who: esc(first(o.to))})}</em>` : L('Offered to {who}, no answer yet', {who: esc(first(o.to))})}</small></span></div>`}));
  db.projects.forEach(p => (p.team || []).filter(v => v.by === m.id && v.state === 'invited' && person(v.id)).forEach(v => out.push({k: 'inv', at: '9', html: `<div class="mw-ask wo" data-act="go" data-h="projects/${p.id}/people" tabindex="0">${av(v.id, 'av-sm')}<span class="mw-ask-t"><b>${esc(p.name)}</b><small>${L('Invited {who}, no answer yet', {who: esc(first(v.id))})}</small></span></div>`})));
  (db.routines || []).forEach(r => (r.invites || []).filter(v => v.by === m.id && v.state === 'invited').forEach(v => out.push({k: 'inv', at: '9', html: `<div class="mw-ask wo" data-act="go" data-h="operations/${r.id}" tabindex="0">${av(v.id, 'av-sm')}<span class="mw-ask-t"><b>${esc(r.name)}</b><small>${L('Invited {who}, no answer yet', {who: esc(first(v.id))})}</small></span></div>`})));
  (db.programs || []).forEach(g => (g.partners || []).filter(v => v.by === m.id && v.state === 'invited').forEach(v => out.push({k: 'inv', at: '9', html: `<div class="mw-ask wo" data-act="go" data-h="programs/${g.id}" tabindex="0">${pgObj(g, 'sm')}<span class="mw-ask-t"><b>${esc(g.name)}</b><small>${L('Invited {d} as a partner, no answer yet', {d: esc(divName(v.div))})}</small></span></div>`})));
  return out.sort((a, b) => a.at.localeCompare(b.at)); }

// ---------- the People block (R016 group), the same on projects, programs and operations ----------
function peopleBlock(kind, x, opt = {}) { const A = CP[kind], can = A.canManage(x), home = A.div(x), m = me();
  const dv = id => { const d = homeDiv(id); return d !== home ? `<span class="cp-dv">${d ? bicon(div(d).icon, false) : ''}${esc(divName(d))}</span>` : ''; };
  const act = (id, role) => { if (id === m.id && role !== 'lead') return `<button class="btn btn-sm btn-ghost" data-act="cp-leave" data-k="${kind}" data-id="${x.id}">${L('Leave')}</button>`;
    return can && role !== 'lead' ? `<button class="ib" data-act="cp-menu" data-k="${kind}" data-id="${x.id}" data-p="${id}" aria-label="${esc(L('Change {who}', {who: first(id)}))}">${icon('more')}</button>` : can && role === 'lead' ? `<button class="ib" data-act="cp-menu" data-k="${kind}" data-id="${x.id}" data-p="${id}" data-lead="1" aria-label="${esc(L('Change the lead'))}">${icon('more')}</button>` : ''; };
  const row = (id, role, v) => `<div class="cp-row ${v && v.state === 'invited' ? 'inv' : ''}" data-act="open-person" data-id="${id}" tabindex="0">${av(id, 'av-sm')}<span class="cp-who"><b>${esc(pname(id))}${id === m.id ? ` <small>${L('(you)')}</small>` : ''}</b><small>${opt.rotation && role === 'member' ? L('Takes turns') : L(ROLE[role])}${dv(id)}${v && v.state === 'invited' ? `<em class="cp-wait">${L('Invited, waiting for an answer')}</em>` : ''}${v && v.by && v.by !== id ? `<span class="cp-by">${L('added by {who}', {who: esc(first(v.by))})}${v.at ? `, ${esc(dShort(v.at.slice(0, 10)))}` : ''}</span>` : ''}</small></span>${act(id, role)}</div>`;
  const lead = A.lead(x), mgr = A.mgr(x), es = A.entries(x).filter(v => v.id !== lead && v.id !== mgr);
  const rows = `${lead ? row(lead, 'lead') : ''}${mgr ? row(mgr, 'manager') : ''}${es.map(v => row(v.id, 'member', v)).join('')}`;
  const adding = ui.cpAdd && ui.cpAdd.kind === kind && ui.cpAdd.id === x.id;
  const add = can && kind !== 'program' ? (adding ? `<div class="cp-add"><input class="input" id="cp-add" data-pm="cp" placeholder="${esc(L('Find someone in any division'))}" autocomplete="off" aria-label="${esc(L('Add people'))}"><p class="t-small t-mute">${L('People from {d} and the Presidency join at once. Someone from another division gets an invitation and joins after accepting; their leaders are told.', {d: esc(divName(home))})}</p><div class="acts"><button class="btn btn-sm" data-act="cp-add-close">${L('Done')}</button></div></div>` : `<button class="btn btn-sm cp-addb" data-act="cp-add-open" data-k="${kind}" data-id="${x.id}">${icon('plus')}${opt.rotation ? L('Add to the rotation') : L('Add people')}</button>`) : '';
  return `<section class="cp-block"><h2 class="cp-h">${opt.title || L('People')} <span class="n">${cpFaces(kind, x).length}</span>${add && !adding ? add : ''}</h2>${adding ? add : ''}<div class="cp-card">${rows || `<p class="cp-empty">${L('Nobody yet.')}</p>`}</div></section>`; }
function partnerBlock(g) { const can = canManageProgram(g), m = me(), rows = [{div: g.div, state: 'host'}, ...pgPartners(g)];
  const row = v => `<div class="cp-row ${v.state === 'invited' ? 'inv' : ''}">${bicon(div(v.div).icon, false)}<span class="cp-who"><b>${esc((div(v.div) || {}).name || v.div)}</b><small>${v.state === 'host' ? L('Runs this program') : v.state === 'invited' ? `<em class="cp-wait">${L('Invited, waiting for their leaders')}</em>` : L('Partner, places its own projects and operations here')}${v.by ? `<span class="cp-by">${L('invited by {who}', {who: esc(first(v.by))})}</span>` : ''}</small></span>
    ${v.state === 'invited' && canAnswerPartner(g, v.div) ? `<span class="mw-ask-b"><button class="btn btn-sm btn-ghost" data-act="pg-partner-answer" data-id="${g.id}" data-d="${v.div}" data-r="no">${L('Decline')}</button><button class="btn btn-sm btn-pri" data-act="pg-partner-answer" data-id="${g.id}" data-d="${v.div}" data-r="yes">${L('Accept')}</button></span>`
      : v.state !== 'host' && (can || canAnswerPartner(g, v.div)) ? `<button class="btn btn-sm btn-ghost" data-act="pg-partner-end" data-id="${g.id}" data-d="${v.div}">${v.state === 'invited' ? L('Withdraw') : m.div === v.div && !can ? L('Leave') : L('End partnership')}</button>` : ''}</div>`;
  const others = DIVS.filter(d => !rows.some(v => v.div === d.id));
  return `<section class="cp-block"><h2 class="cp-h">${L('Divisions')} <span class="n">${pgDivs(g).length}</span>${can && others.length ? `<button class="btn btn-sm cp-addb" data-act="menu" data-menu="pgpartner" data-id="${g.id}" aria-haspopup="menu">${icon('plus')}${L('Invite a division')}</button>` : ''}</h2><div class="cp-card">${rows.map(row).join('')}</div></section>`; }
MENUS.pgpartner = mm => { const g = pgOf(mm.id); if (!g) return ''; return `<div class="mi-h">${L('Invite a division to be a partner')}</div>${DIVS.filter(d => d.id !== g.div && !pgPartners(g).some(v => v.div === d.id)).map(d => `<div class="mi" data-act="pg-partner-invite" data-id="${g.id}" data-d="${d.id}" tabindex="0" role="menuitem"><span class="mi-l">${bicon(d.icon, false)}${esc(d.name)}</span></div>`).join('')}`; };
MENUS.cpmenu = mm => { const [kind, xid, pid] = mm.id.split('|'), A = CP[kind], x = A && A.of(xid); if (!x) return ''; const role = cpRole(kind, x, pid), inv = A.entries(x).some(v => v.id === pid && v.state === 'invited');
  const item = (r, label, ic) => `<div class="mi" data-act="cp-role" data-k="${kind}" data-id="${xid}" data-p="${pid}" data-r="${r}" tabindex="0" role="menuitem"><span class="mi-l">${icon(ic)}${label}</span></div>`;
  if (mm.lead) return `<div class="mi-h">${L('Hand the lead to someone else from People')}</div>`;
  if (inv) return `<div class="mi" data-act="cp-rm" data-k="${kind}" data-id="${xid}" data-p="${pid}" tabindex="0" role="menuitem"><span class="mi-l">${icon('close')}${L('Withdraw the invitation')}</span></div>`;
  return `${item('lead', L('Make lead'), 'flag')}${role !== 'manager' ? item('manager', L('Make manager'), 'shield') : item('member', L('Make member'), 'person')}<hr><div class="mi" data-act="cp-rm" data-k="${kind}" data-id="${xid}" data-p="${pid}" tabindex="0" role="menuitem"><span class="mi-l">${icon('close')}${kind === 'routine' ? L('Take off the rotation') : L('Take off')}</span></div>`; };

PICK.cp = {
  refresh() { const i = $('#cp-add'), c = ui.cpAdd, A = c && CP[c.kind], x = A && A.of(c.id); floatPick('cp', i, i && x && ui.pm && ui.pm.key === 'cp' && !ui.pm.closed ? pmHtml('cp', i.value.trim(), [A.lead(x), A.mgr(x), ...A.entries(x).map(v => v.id)].filter(Boolean)) : ''); },
  pick(id) { ui.pm = null; floatPick('cp', null, ''); const c = ui.cpAdd, A = c && CP[c.kind]; if (A) cpAdd(c.kind, A.of(c.id), id); setTimeout(() => { const i = $('#cp-add'); if (i) i.focus(); }, 0); },
};
ON_INPUT['cp-add'] = () => { if (!ui.pm || ui.pm.key !== 'cp') ui.pm = {key: 'cp', group: null, idx: 0, level: 1, q: null}; ui.pm.closed = false; PICK.cp.refresh(); };
document.addEventListener('focusin', e => { if (e.target.id === 'cp-add') ON_INPUT['cp-add'](e.target); });
Object.assign(ACT, {
  'cp-add-open': el => { ui.cpAdd = {kind: el.dataset.k, id: el.dataset.id}; render(); setTimeout(() => { const i = $('#cp-add'); if (i) i.focus(); }, 0); },
  'cp-add-close': () => { ui.cpAdd = null; ui.pm = null; floatPick('cp', null, ''); render(); },
  'cp-menu': (el, id, e) => { if (e) e.stopPropagation(); ui.menu = {type: 'cpmenu', id: `${el.dataset.k}|${el.dataset.id}|${el.dataset.p}`, lead: !!el.dataset.lead, rect: el.getBoundingClientRect(), alignRight: true, width: 240, est: 180}; renderLayer(); },
  'cp-role': el => { const A = CP[el.dataset.k]; cpSetRole(el.dataset.k, A.of(el.dataset.id), el.dataset.p, el.dataset.r); },
  'cp-rm': el => { const A = CP[el.dataset.k]; cpRemove(el.dataset.k, A.of(el.dataset.id), el.dataset.p); },
  'cp-leave': (el, id, e) => { if (e) e.stopPropagation(); const A = CP[el.dataset.k]; cpRemove(el.dataset.k, A.of(el.dataset.id), session.me); },
  'cp-answer': (el, id, e) => { if (e) e.stopPropagation(); const A = CP[el.dataset.k]; cpAnswer(el.dataset.k, A.of(el.dataset.id), el.dataset.r === 'yes'); },
  'pg-partner-invite': el => pgPartnerInvite(pgOf(el.dataset.id), el.dataset.d),
  'pg-partner-answer': (el, id, e) => { if (e) e.stopPropagation(); pgPartnerAnswer(pgOf(el.dataset.id), el.dataset.d, el.dataset.r === 'yes'); },
  'pg-partner-end': (el, id, e) => { if (e) e.stopPropagation(); pgPartnerEnd(pgOf(el.dataset.id), el.dataset.d); },
  // the old project-team actions go through the same rules
  pinv: el => cpAnswer('project', projOf(el.dataset.id), el.dataset.r === 'yes'),
  'pteam-rm': (el, id, e) => { if (e) e.stopPropagation(); cpRemove('project', projOf(id), el.dataset.p); },
});
