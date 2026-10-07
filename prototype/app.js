/* dwdg'ONE prototype core: store, language, helpers, shell, navigation, overlays, render loop.
   Plain classic scripts sharing one global scope (works from file://). Load order: assets, data, i18n, app, work, plan, schedule.
   UI language comes from .planning/design/system; requirement IDs in comments point to the planning workspace. */
'use strict';
const A = window.ASSETS, DIVS = window.DIVISIONS, ROLES = window.ROLES;
const KEY = 'dwdg-one-proto-v2', SKEY = 'dwdg-one-proto-session';
// Routine loop icon (Operations, D34), drawn by UX2 in the same 1.8px stroke style as the rest of the UI set.
A.ui.routine = A.ui.routine || 'M4 12a8 8 0 0 1 13.7-5.6L20 9 M20 4v5h-5 M20 12a8 8 0 0 1-13.7 5.6L4 15 M4 20v-5h5';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

// ---------- store ----------
let db = load(), session = loadSession();
function load() { try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && d.v === 2) return d; } catch {} return window.seedData(); }
function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {} }
function loadSession() { try { return JSON.parse(localStorage.getItem(SKEY)) || {}; } catch { return {}; } }
function saveSession() { try { localStorage.setItem(SKEY, JSON.stringify(session)); } catch {} }
const ui = {insp: null, menu: null, palette: false, composer: null, draft: null, weekOffset: 0, stage: 'all', q: '', folder: null, showDone: false, view: {}, range: '2w', updFilter: 'all', form: null};
const nowStamp = () => `${today()}T${new Date().toTimeString().slice(0, 5)}`;
const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

// ---------- language (design-languages: English default, Bahasa Indonesia one tap away, D7) ----------
const lang = () => session.lang === 'id' ? 'id' : 'en';
const L = (s, vars) => { let out = lang() === 'id' && window.ID_DICT[s] != null ? window.ID_DICT[s] : s; if (vars) for (const k in vars) out = out.split(`{${k}}`).join(vars[k]); return out; };
const plural = (n, one, many) => L(n === 1 ? one : many, {n});

// ---------- helpers ----------
const icon = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${A.ui[n] || A.ui.circle}"/></svg>`;
const bicon = (id, label = true) => `<svg class="bi" viewBox="0 0 24 24" ${label ? `role="img" aria-label="${esc(A.brand[id].label)}"><title>${esc(A.brand[id].label)}</title>` : 'aria-hidden="true">'}${A.brand[id].svg}</svg>`;
const maskUrl = d => `url('data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`)}')`;
// Project stages: the owner's set (D20) mapped to work_project_lifecycle.
const STAGES = {all: ['All stages', 'filter'], draft: ['Draft', 'edit'], planned: ['Planned', 'calendar'], active: ['Active', 'circle'], review: ['In review', 'search'], completed: ['Completed', 'check'], hold: ['On hold', 'hand'], cancelled: ['Cancelled', 'close'], archived: ['Archived', 'archive']};
const STAGE_ORDER = ['active', 'review', 'planned', 'draft', 'hold', 'completed', 'cancelled', 'archived'];
const stage = (k, sm = true) => `<span class="st st-${k} ${sm ? 'st-sm' : ''}"><i class="st-ic" style="--m:${maskUrl(A.ui[STAGES[k][1]])}"></i><span class="st-tx">${L(STAGES[k][0])}</span></span>`;
const state = (label, iconName, tone, pill = '') => `<span class="st s-${tone} st-sm ${pill}"><i class="st-ic" style="--m:${maskUrl(A.ui[iconName])}"></i><span>${esc(label)}</span></span>`;
// Task states (work_task_lifecycle). Blocked is shown from an open blocker record, never stored as a status.
const TASK_ST = {todo: ['Not started', 'circle', 'mute'], doing: ['In progress', 'clock', 'ink'], review: ['In review', 'search', 'warn'], done: ['Completed', 'check', 'green']};
const TASK_ORDER = ['todo', 'doing', 'review', 'done'];
const isDone = t => t.status === 'done';
const openBlocker = taskId => db.blockers.find(b => b.task === taskId && b.state === 'open');
const taskState = (t, always = false) => openBlocker(t.id) && !isDone(t) ? state(L('Blocked'), 'warning', 'danger') : (always || t.status === 'doing' || t.status === 'review') ? state(L(TASK_ST[t.status][0]), TASK_ST[t.status][1], TASK_ST[t.status][2]) : '';
const SEV = {low: ['Low', 'mute'], medium: ['Medium', 'warn'], high: ['High', 'danger']};
const sevTag = s => `<span class="tag ${s === 'high' ? 'tag-danger' : s === 'medium' ? 'tag-warn' : ''}">${L(SEV[s][0])}</span>`;

const person = id => db.people.find(p => p.id === id);
const me = () => person(session.me);
const div = id => DIVS.find(d => d.id === id);
const first = id => (person(id) || {}).first || L('Someone');
const pname = id => (person(id) || {}).name || L('Someone');
const photo = p => p && p.photo ? `../.planning/design/people/${p.photo}.jpg` : null;
const initials = p => esc(p.name.split(' ').map(w => w[0]).slice(0, 2).join(''));
// Missing photo shows initials (onboarding-profile, measure-icons-avatars).
const av = (id, cls = '') => { const p = person(id); if (!p) return `<span class="av ${cls}">?</span>`; return p.photo ? `<img class="av ${cls}" src="${photo(p)}" alt="${esc(p.name)}">` : `<span class="av ${cls}" role="img" aria-label="${esc(p.name)}" title="${esc(p.name)}">${initials(p)}</span>`; };
// Responsibility bubbles: three avatars, then +N with the full list in its label (resource_bubbles, measure-icons-avatars).
const bubbles = (ids, cls = 'av-sm') => { ids = [...new Set(ids.filter(Boolean))]; const more = ids.length - 3; return `<span class="av-group bubbles" title="${esc(ids.map(pname).join(', '))}">${ids.slice(0, 3).map(i => av(i, cls)).join('')}${more > 0 ? `<span class="av ${cls} more" aria-label="${esc(L('{n} more', {n: more}))}">+${more}</span>` : ''}</span>`; };
const idl = p => `<span class="idl">${p.div ? bicon(div(p.div).icon) : ''}${bicon(ROLES[p.role].icon)}${p.admin ? bicon('role-admin') : ''}</span>`;
const roleLabel = p => p.title ? L(p.title) : L(ROLES[p.role].label);
const roleText = p => [roleLabel(p), p.div ? div(p.div).short : L('Organization'), p.admin ? 'Admin' : ''].filter(Boolean).join(', ');
const mins = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const toMin = v => v ? +v.slice(0, 2) * 60 + +v.slice(3, 5) : null;
const D = s => new Date(s + 'T00:00:00');
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (s, n) => { const d = D(s); d.setDate(d.getDate() + n); return iso(d); };
const today = () => window.DEMO.today;
const daysBetween = (a, b) => Math.round((D(b) - D(a)) / 864e5);
const MON = () => lang() === 'id' ? ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'] : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH = () => lang() === 'id' ? ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'] : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WD = () => lang() === 'id' ? ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WDL = () => lang() === 'id' ? ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const dShort = s => { const d = D(s); return `${d.getDate()} ${MON()[d.getMonth()]}`; };
const dLong = s => { const d = D(s); return `${WD()[d.getDay()]} ${d.getDate()} ${MON()[d.getMonth()]}`; };
const weekday = s => { const w = D(s).getDay(); return w === 0 ? 7 : w; };
const weekStart = s => addDays(s, 1 - weekday(s));
const nowMin = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };
// Due semantics (work_task_fields, design-time): date-only stays a date; a time is shown only when one was set.
const dueLabel = t => { if (!t.due) return {txt: L('No date'), cls: 'none'}; if (isDone(t)) return {txt: dShort(t.doneAt || t.due), cls: 'none'};
  const diff = daysBetween(today(), t.due);
  if (diff < 0) return {txt: dShort(t.due), cls: 'late'}; if (diff === 0) return {txt: t.time != null ? mins(t.time) : L('Today'), cls: ''};
  if (diff === 1) return {txt: L('Tomorrow'), cls: ''}; if (diff < 7) return {txt: WD()[D(t.due).getDay()], cls: ''}; return {txt: dShort(t.due), cls: ''}; };
const stamp = (id, at) => L('{who}, {date} at {time}', {who: first(id), date: `${dShort(at.slice(0, 10))} ${D(at.slice(0, 10)).getFullYear()}`, time: at.slice(11, 16)});
const ago = at => { const d = daysBetween(at.slice(0, 10), today()); return d <= 0 ? at.slice(11, 16) : d === 1 ? L('Yesterday') : dShort(at.slice(0, 10)); };
const rank = p => p.admin ? 9 : ROLES[p.role].rank;
// Workspace scope (access_member_scope, access_vp_scope, access_president_scope, access_admin_scope).
// Board of Supervisors accounts have no division and read every workspace (D29, access_board_scope); perf.js blocks their writes.
const visibleDivs = p => (p.admin || p.role === 'president' || p.role === 'vp' || p.role === 'board') ? DIVS.map(d => d.id) : [p.div];
const canCreateProject = (p, d) => rank(p) >= 2 && visibleDivs(p).includes(d); // access_project_creation_cd
const ws = () => { const m = me(); if (!m) return 'sng'; const v = visibleDivs(m); return v.includes(session.ws) ? session.ws : v[0]; };
const projOf = id => db.projects.find(p => p.id === id);
const taskOf = id => db.tasks.find(t => t.id === id);
const meetingOf = id => db.meetings.find(m => m.id === id);
const resOf = id => db.resources.find(r => r.id === id);
const taskDiv = t => t.div || (projOf(t.project) || {}).div || (person(t.owner) || {}).div;

// ---------- updates and changes ----------
// Updates inbox (work_updates): one item per recipient and trigger; never for every cosmetic edit.
function notify(to, type, ref, actor = session.me) { if (!to || to === actor) return; db.updates.unshift({id: uid('n'), to, type, actor, ref, at: nowStamp(), read: false}); }
// Workspace Changes (changes-scope): recorded per workspace, after the save succeeds.
function logChange(wsId, verb, target, from, to) { if (!wsId) return; db.changes.unshift({id: uid('c'), ws: wsId, actor: session.me, verb, target, at: nowStamp(), from: from || null, to: to || null}); }

// ---------- toast with Undo (work_undo_archive) ----------
let toastTimer;
function showToast(msg, undo) {
  const el = $('#toast');
  el.innerHTML = `<span class="toast">${esc(msg)}${undo ? `<button data-act="undo">${L('Undo')}</button>` : ''}</span>`;
  el._undo = undo; clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.innerHTML = ''; el._undo = null; }, 6000);
}
// Every change that offers Undo joins one shared stack (D45, max 50), so the toast, the top-bar button and Ctrl+Z undo the same thing.
function toast(msg, undo) { if (!undo) return showToast(msg); const e = {msg, undo}; UNDO.u.push(e); if (UNDO.u.length > 50) UNDO.u.shift(); UNDO.r = []; paintHistBtns(); showToast(msg, () => shUndo(e)); }

// ---------- undo and redo (D45, work_undo_archive) ----------
// Undo runs the change's own reversal, which appends to Changes rather than erasing it. Redo puts back the state from just before that
// undo; this is a prototype shortcut (a whole-store snapshot) and the real build sends a new command instead (ARC).
const UNDO = {u: [], r: []};
const snapDb = () => JSON.parse(JSON.stringify(db));
const restoreDb = s => { Object.keys(s).forEach(k => { db[k] = s[k]; }); save(); render(); };
function shUndo(e) { e = e || UNDO.u[UNDO.u.length - 1]; if (!e) return showToast(L('Nothing to undo')); UNDO.u = UNDO.u.filter(x => x !== e); const after = snapDb(); e.undo(); save(); UNDO.r.push({msg: e.msg, after, back: snapDb()}); paintHistBtns(); showToast(L('Undone: {m}', {m: e.msg})); }
function shRedo() { const e = UNDO.r.pop(); if (!e) return showToast(L('Nothing to redo')); restoreDb(e.after); UNDO.u.push({msg: e.msg, undo: () => restoreDb(e.back)}); paintHistBtns(); showToast(L('Redone: {m}', {m: e.msg})); }

// ---------- back and forward between page states (D45, engineering-routing) ----------
// A page state is the route plus what the side panel shows, so opening or switching the panel is a step too (owner, round 10).
// Each state remembers its scroll, which comes back when the member returns to it.
const PH = {s: [], i: -1, jump: false, want: undefined};
const phKey = () => `${location.hash || '#/work'}|${ui.insp ? `${ui.insp.type}:${ui.insp.id || ui.insp.kind || ''}` : ''}`;
function phGo(i) { const e = PH.s[i]; if (!e) return; PH.i = i; PH.jump = true; ui.menu = null; ui.form = null; renderLayer();
  if ((location.hash || '#/work') !== e.hash) { PH.want = e.insp ? {...e.insp} : null; location.hash = e.hash; } else { ui.insp = e.insp ? {...e.insp} : null; render(); } }
const histBtns = () => { const u = UNDO.u[UNDO.u.length - 1], r = UNDO.r[UNDO.r.length - 1];
  const b = (act, ic, label, on, cls = '') => `<button class="ib ${cls}" data-act="${act}" ${on ? '' : 'disabled'} aria-label="${esc(label)}" title="${esc(label)}">${icon(ic, 'ic-sm')}</button>`;
  return `<span class="hist-g">${b('sh-back', 'left', L('Previous page'), PH.i > 0)}${b('sh-fwd', 'right', L('Next page'), PH.i < PH.s.length - 1)}</span><span class="hist-g">${b('sh-undo', 'undo', u ? L('Undo: {m} (Ctrl+Z)', {m: u.msg}) : L('Nothing to undo'), !!u)}${b('sh-redo', 'undo', r ? L('Redo: {m} (Ctrl+Y)', {m: r.msg}) : L('Nothing to redo'), !!r, 'redo')}</span>`; };
function paintHistBtns() { const h = $('.top .hist'); if (h) h.innerHTML = histBtns(); }

// ---------- router ----------
const route = () => { const h = location.hash.replace(/^#\/?/, '') || 'work'; const [page, id, sub] = h.split('/'); return {page, id, sub}; };
const go = h => { if (location.hash === '#/' + h) render(); else location.hash = '#/' + h; };
window.addEventListener('hashchange', () => { ui.insp = null; ui.menu = null; ui.form = null; render(); });

// ---------- registries filled by the page files ----------
const PAGES = {}, INSP = {}, ACT = {}, MENUS = {}, ON_INPUT = {}, ON_CHANGE = {}, ON_KEY = [];
// UI sprint plug-in points (PM, 6 Oct). Screen files register workspace destinations here instead of editing the shell:
// CAPS['*'] shows in every workspace (e.g. Performance); CAPS[divId] shows only in that division's workspace (capabilities below
// core destinations, design-navigation). Each entry is [page, icon, English label, optional visible(person) test].
// PERSONAS_EXTRA adds demo sign-in accounts (e.g. a Board of Supervisors account).
const CAPS = {}, PERSONAS_EXTRA = [];
const capsFor = (w, m) => [...(CAPS['*'] || []), ...(CAPS[w] || [])].filter(c => !c[3] || c[3](m));

// ---------- shell (design-shell, design-navigation, measure-shell) ----------
function counts() {
  const m = me();
  const mine = db.tasks.filter(t => t.owner === m.id && !t.trashed && !isDone(t));
  const attention = mine.filter(t => t.due && t.due <= today()).length + invitesFor(m.id).length + offersFor(m.id).length + reviewsFor(m.id).length;
  return {attention, unread: db.updates.filter(u => u.to === m.id && !u.read).length};
}
function shell(content, crumb) {
  const m = me(), w = div(ws()), r = route(), c = counts();
  const nav = (h, ic, label, count) => `<a href="#/${h}" class="${r.page === h ? 'on' : ''}" ${r.page === h ? 'aria-current="page"' : ''}>${icon(ic)}<span>${L(label)}</span>${count ? `<em>${count}</em>` : ''}</a>`;
  const projCount = db.projects.filter(p => p.div === w.id && !['completed', 'cancelled', 'archived'].includes(p.stage)).length;
  const opsCount = (db.routines || []).filter(x => !x.personal && x.unit === w.id && !x.paused).length;
  const many = visibleDivs(m).length > 1;
  // The workspace is a quiet heading for its own group of destinations, never a second selected item (R6a). One-workspace members
  // see their workspace identity, not a one-item switcher (design-shell, work_switch_context).
  const wsCtl = many ? `<button class="ws" data-act="menu" data-menu="ws" aria-haspopup="menu" aria-label="${esc(L('Workspace: {name}. Switch workspace', {name: w.name}))}">${bicon(w.icon, false)}<b>${esc(w.name)}</b>${icon('chevron-down', 'chev')}</button>`
    : `<div class="ws ws-fixed" aria-label="${esc(L('Your workspace'))}">${bicon(w.icon, false)}<b>${esc(w.name)}</b></div>`;
  return `<div class="app">
  <aside class="side" aria-label="${esc(L('Navigation'))}">
    <a class="brand" href="#/work" aria-label="dwdg’ONE, ${esc(L('My Work'))}">${A.wordmark}</a>
    <nav class="nav">
      ${nav('work', 'tasks', 'My Work', c.attention)}${nav('updates', 'bell', 'Updates', c.unread)}${nav('schedule', 'calendar', 'Schedule')}
      <div class="nav-grp nav-ws">${wsCtl}</div>
      ${nav('projects', 'projects', 'Projects', projCount)}${nav('operations', 'routine', 'Operations', opsCount)}${nav('resources', 'folder', 'Resources')}${nav('changes', 'activity', 'Changes')}
      ${capsFor(w.id, m).map(([h, i, l]) => nav(h, i, l)).join('')}
      <h6 class="nav-grp">DWDG UII</h6>${nav('organisation', 'people', 'Organization')}${nav('settings', 'settings', 'Settings')}
    </nav>
    <div class="side-foot"><button class="me" data-act="go" data-h="settings">${av(m.id)}<span><b>${esc(m.name)}</b>${idl(m)}</span></button>
    <div class="seg lang" role="radiogroup" aria-label="${esc(L('Language'))}"><button class="${lang() === 'en' ? 'on' : ''}" data-act="lang" data-l="en" role="radio" aria-checked="${lang() === 'en'}">EN</button><button class="${lang() === 'id' ? 'on' : ''}" data-act="lang" data-l="id" role="radio" aria-checked="${lang() === 'id'}">ID</button></div></div>
  </aside>
  <section class="main" id="main">
    <header class="top"><span class="crumb">${crumb}</span>
      <div class="hist" role="group" aria-label="${esc(L('History'))}">${histBtns()}</div>
      <button class="search" data-act="palette">${icon('search', 'ic-sm')}<span>${L('Search or jump to')}</span><span class="kbd">Ctrl K</span></button>
      <button class="btn newg" data-act="menu" data-menu="new" aria-haspopup="menu">${icon('plus')}${L('New')}</button></header>
    <div class="sheets ${ui.insp ? 'with-insp' : ''}"><div class="sheet" id="scroller">${content}</div>${ui.insp ? `<aside class="sheet insp-sheet" aria-label="${esc(L('Details'))}"><div class="insp">${inspector()}</div></aside>` : ''}</div>
  </section></div>
  <nav class="tabbar" aria-label="${esc(L('Main'))}">${tab('work', 'tasks', 'My Work', c.attention)}${tab('updates', 'bell', 'Updates', c.unread)}<button class="newbtn" data-act="menu" data-menu="new" aria-label="${esc(L('New'))}">${icon('plus')}</button>${tab('schedule', 'calendar', 'Schedule')}<button class="tb-more ${MORE_PAGES.includes(r.page) ? 'on' : ''}" data-act="menu" data-menu="more" aria-haspopup="menu">${icon('menu')}${L('More')}</button></nav>`;
  function tab(h, i, l, n) { return `<a href="#/${h}" class="${r.page === h ? 'on' : ''}">${icon(i)}${n ? `<em>${n}</em>` : ''}${L(l)}</a>`; }
}

// ---------- sign in (vision-distribution: the public page reveals nothing internal) ----------
function signIn() {
  const personas = ['mahdy', 'salsa', 'raka', 'fadhil', 'kirana', 'rani', 'galih', 'daniel', 'reza', 'citra', 'dimas', 'sekar', ...PERSONAS_EXTRA];
  if (session.waiting) {
    const p = person(session.waiting);
    return `<div class="signin"><div class="sheet card"><div class="lock">${A.wordmark}</div><h1 class="t-h2" style="margin:22px 0 6px">${L('You’re almost in')}</h1><p>${L('An admin needs to approve {name} before you can open dwdg’ONE.', {name: `<b>${esc(p.name)}</b>`})}</p><p class="t-small">${L('Prototype: approve from Settings when signed in as Mahdy.')}</p><button class="btn gbtn" data-act="signout">${L('Use another account')}</button></div></div>`;
  }
  return `<div class="signin"><div class="sheet card"><div class="lock">${A.lockup}</div><p style="margin-top:22px">${L('The workspace for DWDG UII. Invite only.')}</p>
  ${session.picking ? `<p class="t-small" style="margin:18px 0 0">${L('Prototype: choose a demo account. In the real app this is your Google account.')}</p><div class="picker">${personas.map(id => { const p = person(id); return `<div class="row" data-act="pick" data-id="${id}" tabindex="0">${av(id)}<div class="t"><b>${esc(p.name)}</b><small>${esc(p.status === 'pending' ? L('New member, waiting for approval') : roleText(p))}</small></div>${p.status === 'active' ? idl(p) : ''}</div>`; }).join('')}</div>`
  : `<button class="btn gbtn" data-act="google"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7Z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1 .7-2.4 1.1-4 1.1-3.1 0-5.7-2.1-6.6-4.9h-4v3.1A12 12 0 0 0 12 24Z"/><path fill="#FBBC05" d="M5.4 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z"/><path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z"/></svg>${L('Continue with Google')}</button>
     <p class="t-small" style="margin-top:16px">${L('Ask your director for an invite if you don’t have one yet.')}</p>`}
  <div class="seg lang" style="margin-top:18px"><button class="${lang() === 'en' ? 'on' : ''}" data-act="lang" data-l="en">English</button><button class="${lang() === 'id' ? 'on' : ''}" data-act="lang" data-l="id">Bahasa Indonesia</button></div></div></div>`;
}

// ---------- overlays: menus and search (design-overlays, measure-popovers) ----------
const mi = (act, label, ic, data = '', extra = '') => `<div class="mi" data-act="${act}" ${data} tabindex="0" role="menuitem"><span class="mi-l">${ic ? icon(ic) : ''}${label}</span>${extra}</div>`;
MENUS.ws = () => visibleDivs(me()).map(id => { const d = div(id); return `<div class="mi ${id === ws() ? 'on' : ''}" data-act="set-ws" data-id="${id}" tabindex="0" role="menuitemradio" aria-checked="${id === ws()}"><span class="mi-l">${bicon(d.icon, false)}${esc(d.name)}</span>${id === ws() ? icon('check', 'tick') : ''}</div>`; }).join('');
// Co-Director and up create projects and division routines; everyone else can repeat a personal task (D31, D34). The new-rt action is UX2's.
MENUS.new = () => { const m = me(), can = canCreateProject(m, ws()); return mi('new-task', L('Task'), 'tasks', '', '<span class="kbd">N</span>') + mi('new-offer', L('Task for someone else'), 'people') + mi('composer', L('Meeting'), 'calendar', '', '<span class="kbd">M</span>') + mi('new-unavail', L('Unavailable time'), 'clock') + mi('new-res', L('Note'), 'note', 'data-kind="note"') + mi('new-res', L('Link'), 'link', 'data-kind="link"') + '<hr>' + (can ? mi('new-project', L('Project'), 'projects') : '') + mi('new-rt', can ? L('Routine') : L('Repeating task'), 'routine', can ? '' : 'data-personal="1"'); };
// Phone dock: My Work, Updates, New, Schedule, More. More holds the workspace and organization destinations (design-navigation).
const MORE_BASE = ['projects', 'operations', 'resources', 'changes', 'organisation', 'settings'];
const MORE_PAGES = { includes: p => MORE_BASE.includes(p) || capsFor(ws(), me()).some(c => c[0] === p) };
MENUS.more = () => [['projects', 'projects', 'Projects'], ['operations', 'routine', 'Operations'], ['resources', 'folder', 'Resources'], ['changes', 'activity', 'Changes'], ...capsFor(ws(), me()), ['organisation', 'people', 'Organization'], ['settings', 'settings', 'Settings']].map(([h, i, l]) => mi('go', L(l), i, `data-h="${h}"`)).join('');
const SHELL_MENUS = {new: MENUS.new, more: MENUS.more};
function menuHtml() {
  const mm = ui.menu; if (!mm) return '';
  const items = MENUS[mm.type](mm); const w = mm.width || 248;
  const r = mm.rect; let left = mm.alignRight ? r.right - w : r.left; left = Math.max(8, Math.min(left, innerWidth - w - 8));
  let top = r.bottom + 8; const est = mm.est || 330; if (top + est > innerHeight - 8) top = Math.max(8, r.top - est - 8);
  return `<div class="scrim clear" data-act="close-layer"></div><div class="pop menu popmenu" role="menu" style="left:${left}px;top:${top}px;width:${w}px">${items}</div>`;
}
function palette() { return `<div class="scrim" data-act="close-layer"></div><div class="pop palette" role="dialog" aria-label="${esc(L('Search'))}"><input id="pal" placeholder="${esc(L('Search tasks, projects, people and resources'))}" autocomplete="off"><div class="res" id="palres">${paletteResults('')}</div></div>`; }
// Search is scoped to what the viewer may see (work_search, design-search).
function paletteResults(q) {
  q = q.toLowerCase().trim(); const m = me(); const out = [];
  const add = (label, sub, act, id, h) => out.push(`<div class="mi" data-act="${act}" data-id="${id || ''}" data-h="${h || ''}" tabindex="0"><span class="mi-l">${esc(label)}</span><small>${esc(sub)}</small></div>`);
  db.projects.filter(p => visibleDivs(m).includes(p.div) && (!q || p.name.toLowerCase().includes(q))).slice(0, 5).forEach(p => add(p.name, `${L('Project')}, ${div(p.div).short}`, 'go', '', `projects/${p.id}`));
  db.tasks.filter(t => !t.trashed && (t.owner === m.id || visibleDivs(m).includes(taskDiv(t))) && (!q || t.title.toLowerCase().includes(q))).slice(0, 5).forEach(t => add(t.title, `${L('Task')}, ${first(t.owner)}`, 'open-task', t.id));
  if (q) db.meetings.filter(mt => mt.responses[m.id] && mt.title.toLowerCase().includes(q)).slice(0, 3).forEach(mt => add(mt.title, `${L('Meeting')}, ${dShort(mt.date)}`, 'open-meeting', mt.id));
  if (q) db.people.filter(p => p.status === 'active' && p.name.toLowerCase().includes(q)).slice(0, 5).forEach(p => add(p.name, roleText(p), 'open-person', p.id));
  if (q) db.resources.filter(r => !r.archived && visibleDivs(m).includes(r.div) && r.name.toLowerCase().includes(q)).slice(0, 4).forEach(r => add(r.name, L(r.kind === 'note' ? 'Note' : r.kind === 'link' ? 'Link' : 'Folder'), 'open-res', r.id));
  return out.join('') || `<div class="empty-inline">${L('No matches.')}</div>`;
}

// ---------- inspector dispatcher (design-inspector) ----------
const inspHead = label => `<div class="insp-h"><span>${label}</span><button class="ib" data-act="close-insp" aria-label="${esc(L('Close'))}">${icon('close')}</button></div>`;
function inspector() { const f = INSP[ui.insp.type]; return f ? f(ui.insp) : ''; }

// ---------- render ----------
function applyTheme() { const t = session.theme || 'system'; const dark = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches); document.documentElement.dataset.theme = dark ? 'dark' : 'light'; document.documentElement.lang = lang(); }
function renderLayer() {
  const l = $('#layer');
  l.innerHTML = ui.draft && !(ui.insp && ui.insp.type === 'event-edit') ? quickCard() : ui.composer ? composer() : ui.palette ? palette() : ui.menu ? menuHtml() : '';
  if (ui.palette) setTimeout(() => $('#pal') && $('#pal').focus(), 0);
  if (ui.menu) setTimeout(() => { const f = $('.popmenu .mi'); if (f) f.focus(); }, 0);
}
function render() {
  applyTheme();
  const app = $('#app'); const m = me();
  if (!m || m.status !== 'active') { app.innerHTML = signIn(); renderLayer(); return; }
  const r = route(); const page = PAGES[r.page] ? r.page : 'work';
  // Keep the reader's place (R16, design-inspector): the same page keeps its scroll, and the side panel keeps its scroll while it shows
  // the same item. Routes without an id compare as '' so My Work and the registers keep their place too.
  if (PH.want !== undefined) { ui.insp = PH.want; PH.want = undefined; }
  const rk = `${page}/${r.id || ''}/${r.sub || ''}`, ik = ui.insp ? `${ui.insp.type}:${ui.insp.id || ''}` : '';
  const sc0 = $('#scroller'), in0 = $('.insp-sheet'), st = sc0 ? sc0.scrollTop : 0, it = in0 ? in0.scrollTop : 0;
  const keep = rk === app.dataset.rk, keepInsp = keep && ik === app.dataset.ik, cur = PH.s[PH.i];
  if (cur && !PH.jump && phKey() === cur.k) cur.scroll = st;
  const {content, crumb} = PAGES[page](r);
  app.dataset.page = page; app.dataset.rid = r.id || ''; app.dataset.rk = rk; app.dataset.ik = ik;
  app.innerHTML = shell(content, crumb);
  const sc = $('#scroller'), ins = $('.insp-sheet');
  if (PH.jump) { const e = PH.s[PH.i]; if (sc && e) sc.scrollTop = e.scroll || 0; PH.jump = false; }
  else { if (sc && keep) sc.scrollTop = st; if (ins && keepInsp) ins.scrollTop = it;
    const k = phKey(); if (!cur || k !== cur.k) { PH.s = PH.s.slice(0, PH.i + 1); PH.s.push({k, hash: location.hash || '#/work', insp: ui.insp ? {...ui.insp} : null, scroll: keep ? st : 0}); if (PH.s.length > 100) PH.s.shift(); PH.i = PH.s.length - 1; paintHistBtns(); } }
  const cs = $('#calscroll'); if (cs) cs.scrollTop = keep && ui.calScroll != null ? ui.calScroll : CAL.hr * 1.5;
  renderLayer();
}
const rerender = () => { save(); render(); };

// ---------- shared actions ----------
Object.assign(ACT, {
  google: () => { session.picking = true; saveSession(); render(); },
  pick: (el, id) => { const p = person(id); if (p.status === 'pending') session.waiting = id; else { session.me = id; session.ws = p.div || 'sng'; session.picking = false; } saveSession(); location.hash = '#/work'; render(); },
  signout: () => { session = {theme: session.theme, lang: session.lang}; saveSession(); ui.insp = null; location.hash = '#/work'; render(); },
  lang: el => { session.lang = el.dataset.l; saveSession(); render(); },
  go: (el, id, e) => { e.preventDefault(); ui.menu = null; ui.palette = false; renderLayer(); go(el.dataset.h); },
  menu: el => { ui.menu = {type: el.dataset.menu, rect: el.getBoundingClientRect(), alignRight: el.dataset.menu === 'new' || el.dataset.menu === 'more', id: el.dataset.id}; renderLayer(); },
  'set-ws': (el, id) => { session.ws = id; saveSession(); ui.menu = null; ui.folder = null; ui.stage = 'all'; render(); },
  'close-layer': () => { ui.menu = null; ui.palette = false; ui.composer = null; renderLayer(); },
  palette: () => { ui.palette = true; renderLayer(); },
  'close-insp': () => { ui.insp = null; ui.form = null; render(); },
  undo: () => { const t = $('#toast'); if (t._undo) t._undo(); t.innerHTML = ''; t._undo = null; },
  'sh-back': () => phGo(PH.i - 1), 'sh-fwd': () => phGo(PH.i + 1),
  'sh-undo': () => shUndo(), 'sh-redo': () => shRedo(),
  view: el => { ui.view[el.dataset.scope] = el.dataset.v; render(); },
  form: el => { ui.form = el.dataset.f || null; render(); setTimeout(() => { const f = $('.insp [data-autofocus]'); if (f) f.focus(); }, 0); },
});

// ---------- global events ----------
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  if (el.tagName === 'A' && !el.getAttribute('href')) e.preventDefault();
  const f = ACT[el.dataset.act]; if (f) f(el, el.dataset.id, e);
});
document.addEventListener('input', e => { const f = ON_INPUT[e.target.id] || ON_INPUT[e.target.dataset.input]; if (f) f(e.target, e); });
document.addEventListener('change', e => { const f = ON_CHANGE[e.target.id] || ON_CHANGE[e.target.dataset.change]; if (f) f(e.target, e); });
document.addEventListener('keydown', e => {
  const typing = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
  for (const h of ON_KEY) if (h(e, typing)) return;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (me()) { ui.palette = true; renderLayer(); } return; }
  // Ctrl+Z undoes, Ctrl+Y or Ctrl+Shift+Z redoes (D45). While typing, the field keeps its own undo.
  if (!typing && me() && (e.ctrlKey || e.metaKey) && !e.altKey) { const k = e.key.toLowerCase();
    if (k === 'z' && !e.shiftKey) { e.preventDefault(); shUndo(); return; } if (k === 'y' || (k === 'z' && e.shiftKey)) { e.preventDefault(); shRedo(); return; } }
  if (e.key === 'Escape') {
    if (ui.draft) { ui.draft = null; if (ui.insp && ui.insp.type === 'event-edit') ui.insp = null; render(); return; }
    if (ui.composer || ui.palette || ui.menu) { ui.composer = null; ui.palette = false; ui.menu = null; renderLayer(); return; }
    if (ui.insp) { ui.insp = null; ui.form = null; render(); } return; }
  if ((e.key === 'Enter' || e.key === ' ') && !typing && e.target.matches('[data-act][tabindex]')) { e.preventDefault(); e.target.click(); return; }
  if (ui.menu && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { e.preventDefault(); const items = $$('.popmenu .mi'); const i = items.indexOf(document.activeElement); const n = items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]; if (n) n.focus(); return; }
  if (!typing && me() && !ui.composer && !e.ctrlKey && !e.metaKey && !e.altKey) {
    if (e.key === 'n') { e.preventDefault(); ACT['new-task'](); }
    if (e.key === 'm') { e.preventDefault(); openComposer(); }
  }
});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme());

// ---------- handover from UX2's interim shell code (R14, R17) ----------
// work.js still carries the interim versions UX2 built before the shell owned them. Once every script has loaded, the shell versions
// take over so nothing appears twice. Delete this block when UX2 removes its copies (see REQUESTS.md).
document.addEventListener('DOMContentLoaded', () => {
  if (toast !== toastShell) toast = toastShell;
  MENUS.new = SHELL_MENUS.new; MENUS.more = SHELL_MENUS.more;
  if (typeof paintHist === 'function') paintHist = () => {};
  if (typeof runUndo === 'function') { runUndo = () => shUndo(); runRedo = () => shRedo(); }
  if (typeof opsNav === 'function') opsNav = () => {};
  render();
});
const toastShell = toast;
